/**
 * 行动值时间轴内核 —— 星穹铁道式「排轴」
 *
 * 核心公式：AV = AV_BASE / SPD
 *   AV（行动值）越小越先行动。单位行动完毕后 AV 重置回 AV_BASE / SPD。
 *   时间轴按 AV 从小到大推进，一次推进量 = 下一个行动者的 AV。
 *
 * 三类干预（卡牌的作用点）：
 *   拉条 applyAdvance —— 减少 av，提前行动
 *   推条 applyDelay   —— 增加 av，延后行动
 *   插队 applyInsert  —— av 归零，立刻行动
 *
 * 本模块为纯逻辑，不依赖 React。
 */

/** 行动值基准。AV = AV_BASE / SPD，故 spd=100 时每次行动间隔 100 行动值 */
export const AV_BASE = 10000;

/** 游戏时间流速：每 1 秒真实时间推进多少「行动值」 */
export const AV_PER_SECOND = 20;

/** 时间轴单位需要满足的最小形状 */
export interface TimelineUnit {
  instanceId: string;
  spd: number;
  av: number;
}

/** 判定单位是否还活着（外部传入，因为 hp 不在 TimelineUnit 上） */
export type AliveFilter<T> = (unit: T) => boolean;

/** 由速度算单次行动的行动值 */
export function avFromSpeed(spd: number): number {
  return AV_BASE / Math.max(1, spd);
}

/** 把 av 归一化到 [0, 1] —— 0 = 马上要动，1 = 刚行动完 */
export function avProgress(unit: TimelineUnit): number {
  const base = avFromSpeed(unit.spd);
  return Math.min(1, Math.max(0, unit.av / base));
}

function pickNext<T extends TimelineUnit>(units: T[]): T | null {
  let best: T | null = null;
  for (const u of units) {
    if (best === null || u.av < best.av) best = u;
  }
  return best;
}

/**
 * 推进 dt 个行动值，返回这段时间内依次行动的单位（可能 0 个或多个）。
 * 会就地修改 units 的 av；行动者的 av 已重置为 avFromSpeed(spd)。
 */
export function step<T extends TimelineUnit>(units: T[], dt: number, alive: AliveFilter<T>): T[] {
  const actors: T[] = [];
  let remaining = dt;
  let guard = 0;

  while (remaining > 0 && guard++ < 64) {
    const live = units.filter(alive);
    const actor = pickNext(live);
    if (!actor) break;

    if (actor.av <= remaining) {
      remaining -= actor.av;
      for (const u of units) u.av -= actor.av;
      actor.av = 0;
      actors.push(actor);
      actor.av = avFromSpeed(actor.spd);
    } else {
      for (const u of units) u.av -= remaining;
      remaining = 0;
    }
  }

  return actors;
}

/** 拉条：行动值减少 pct × 一次行动量。pct=0.5 即提前半次行动 */
export function applyAdvance(unit: TimelineUnit, pct: number): void {
  unit.av = Math.max(0, unit.av - avFromSpeed(unit.spd) * Math.max(0, pct));
}

/** 推条：行动值增加 pct × 一次行动量。pct=1 即延后整整一次行动 */
export function applyDelay(unit: TimelineUnit, pct: number): void {
  unit.av += avFromSpeed(unit.spd) * Math.max(0, pct);
}

/** 插队：行动值归零，下一个就是它 */
export function applyInsert(unit: TimelineUnit): void {
  unit.av = 0;
}

/**
 * 预测未来 steps 步的行动顺序（不修改原对象）。
 * 用于行动条 UI 展示「接下来谁动」。
 */
export function predictOrder<T extends TimelineUnit>(
  units: T[],
  steps: number,
  alive: AliveFilter<T>,
): T[] {
  const sim = units
    .filter(alive)
    .map((u) => ({ ref: u, instanceId: u.instanceId, av: Math.max(0, u.av), spd: u.spd }));

  const order: T[] = [];
  for (let i = 0; i < steps; i++) {
    const actor = pickNext(sim);
    if (!actor) break;
    order.push(actor.ref);
    const dt = actor.av;
    for (const s of sim) s.av -= dt;
    actor.av = avFromSpeed(actor.spd);
  }
  return order;
}

/** 战斗开始时按速度铺好初始行动值 */
export function initTimeline<T extends TimelineUnit>(units: T[]): void {
  for (const u of units) u.av = avFromSpeed(u.spd);
}

/**
 * 结算生效羁绊对开局行动条的改写。
 * 返回被改写的单位数量，便于调试。
 */
export function applySynergyOpening<T extends TimelineUnit>(
  allies: T[],
  enemies: T[],
  rules: { allyAdvancePct?: number; enemyDelayPct?: number },
): number {
  let touched = 0;
  if (rules.allyAdvancePct) {
    for (const u of allies) {
      applyAdvance(u, rules.allyAdvancePct);
      touched++;
    }
  }
  if (rules.enemyDelayPct) {
    for (const u of enemies) {
      applyDelay(u, rules.enemyDelayPct);
      touched++;
    }
  }
  return touched;
}
