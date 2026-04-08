export type SlideDir = 'right' | 'left';

export interface DifficultyParams {
  speed: number;
  accel: number;
  perfectRange: number;
  goodRange: number;
  speedJitter: number;
  directions: SlideDir[];
  spawnDelay: number;
  growBack: number;
  label: string;
  tierStart: number;
  tierEnd: number;
}

export function getDifficulty(score: number): DifficultyParams {
  // Both directions from the start!
  const dirs: SlideDir[] = ['right', 'left'];

  // Tier 1: Learn (0-3) — fast but forgiving
  if (score < 4) {
    return {
      speed: 4.5 + score * 0.35,
      accel: 0.01,
      perfectRange: 6, goodRange: 16,
      speedJitter: 0.3,
      directions: dirs,
      spawnDelay: 80,
      growBack: 6,
      label: '', tierStart: 0, tierEnd: 4,
    };
  }
  // Tier 2: Nice (4-10)
  if (score < 11) {
    return {
      speed: 5.8 + (score - 4) * 0.4,
      accel: 0.025,
      perfectRange: 5, goodRange: 14,
      speedJitter: 0.6,
      directions: dirs,
      spawnDelay: 40,
      growBack: 5,
      label: 'NICE', tierStart: 4, tierEnd: 11,
    };
  }
  // Tier 3: Fast (11-19)
  if (score < 20) {
    return {
      speed: 8.0 + (score - 11) * 0.35,
      accel: 0.035,
      perfectRange: 5, goodRange: 12,
      speedJitter: 1.0,
      directions: dirs,
      spawnDelay: 0,
      growBack: 4,
      label: 'FAST', tierStart: 11, tierEnd: 20,
    };
  }
  // Tier 4: Hard (20-31)
  if (score < 32) {
    return {
      speed: 11.0 + (score - 20) * 0.25,
      accel: 0.05,
      perfectRange: 4, goodRange: 10,
      speedJitter: 1.4,
      directions: dirs,
      spawnDelay: 0,
      growBack: 3,
      label: 'HARD', tierStart: 20, tierEnd: 32,
    };
  }
  // Tier 5: Insane (32+)
  return {
    speed: Math.min(14 + (score - 32) * 0.15, 20),
    accel: 0.06,
    perfectRange: 3, goodRange: 8,
    speedJitter: 1.8,
    directions: dirs,
    spawnDelay: 0,
    growBack: 2,
    label: 'INSANE', tierStart: 32, tierEnd: 999,
  };
}

export function getNextTier(score: number): { name: string; remaining: number } | null {
  const tiers = [
    { start: 4, name: 'NICE' },
    { start: 11, name: 'FAST' },
    { start: 20, name: 'HARD' },
    { start: 32, name: 'INSANE' },
  ];
  for (const t of tiers) {
    if (score < t.start) return { name: t.name, remaining: t.start - score };
  }
  return null;
}
