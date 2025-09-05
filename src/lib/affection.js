// affection.js

// ---------------- Configurable progression ----------------
export const XP_PER_MESSAGE = 3; // base XP for a valid message
export const COOLDOWN_SECONDS = 12; // anti-spam: award XP at most once per 12s
export const STREAK_WINDOW_HOURS = 24; // message within this window continues the streak
export const STREAK_BONUS = 2; // extra XP when user keeps daily streak
export const MAX_DAILY_XP = 120; // cap daily farming

// ---------------- Level thresholds (cumulative XP) ----------------
// Lv1 starts at 0 XP, Lv2 at 15, Lv3 at 40, etc.
const LEVELS = [0, 15, 40, 80, 140, 220, 320, 450, 600, 800, 1050]; // Lv1..Lv11

// ---------------- Level calculation ----------------
export function levelFromXp(xp) {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) level = i + 1;
  }
  return Math.min(level, LEVELS.length); // cap at max
}

export function progressToNext(xp) {
  const level = levelFromXp(xp);
  const idx = level - 1;
  const curr = LEVELS[idx] ?? 0;
  const next = LEVELS[idx + 1] ?? LEVELS[idx]; // max level has no next
  const needed = Math.max(next - curr, 1);
  const into = xp - curr;
  const pct = next === curr ? 1 : Math.min(into / needed, 1);
  return { level, currentXp: xp, levelStartXp: curr, nextLevelXp: next, pct };
}

// ---------------- XP gain logic ----------------
export function computeXpGain({
  now,
  lastMessageAt,
  lastActiveDay,
  todayXp,
  streakActive,
}) {
  // Cooldown check
  if (lastMessageAt && (now - lastMessageAt) / 1000 < COOLDOWN_SECONDS)
    return 0;

  // Daily cap check
  if (todayXp >= MAX_DAILY_XP) return 0;

  let gain = XP_PER_MESSAGE;

  // Streak bonus
  if (streakActive) gain += STREAK_BONUS;

  // Don’t exceed daily cap
  return Math.min(gain, MAX_DAILY_XP - todayXp);
}

// ---------------- Streak utilities ----------------
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function streakContinues(prevTime, now) {
  if (!prevTime) return false;
  const hours = (now - prevTime) / (1000 * 60 * 60);
  return hours <= STREAK_WINDOW_HOURS;
}

// ---------------- Main update function ----------------
/**
 * Updates affection profile based on a new message.
 * @param {Object} profile - User affection profile document
 * @param {Date} now - Current timestamp
 * @returns {Object} { updatedProfile, xpGained, progress }
 */
export function applyAffectionUpdate(profile, now = new Date()) {
  const lastMessageAt = profile.lastMessageAt
    ? new Date(profile.lastMessageAt)
    : null;

  const lastActiveDay = profile.lastActiveDay
    ? new Date(profile.lastActiveDay)
    : null;

  const todayXp = isSameDay(lastActiveDay, now) ? profile.todayXp : 0;

  const streakActive = streakContinues(lastMessageAt, now);

  // Compute XP gain
  const xpGain = computeXpGain({
    now,
    lastMessageAt,
    lastActiveDay,
    todayXp,
    streakActive,
  });

  // Update profile fields
  const newXp = profile.totalXp + xpGain;
  const newTodayXp = todayXp + xpGain;

  const updatedProfile = {
    ...profile,
    totalXp: newXp,
    todayXp: newTodayXp,
    lastMessageAt: now,
    lastActiveDay: now,
  };

  const progress = progressToNext(newXp);

  return { updatedProfile, xpGained: xpGain, progress };
}
