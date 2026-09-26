/**
 * DifficultyMapper - 难度归一化
 * 将洛谷和 Codeforces 的难度统一到 1-8 级
 */

// 洛谷难度直接映射 1-8
export function mapLuoguDifficulty(level: number): number {
  return Math.max(1, Math.min(8, Math.round(level)));
}

/**
 * Codeforces Rating -> 洛谷难度等级映射
 * 基于分段函数
 */
export function mapCFRatingToLevel(rating: number): number {
  if (rating < 800) return 1;      // 入门
  if (rating < 1000) return 2;     // 普及-
  if (rating < 1200) return 3;     // 普及
  if (rating < 1400) return 4;     // 普及+/提高-
  if (rating < 1600) return 5;     // 提高
  if (rating < 1900) return 6;     // 提高+/省选-
  if (rating < 2400) return 7;     // 省选/NOI-
  return 8;                         // NOI/NOI+/CTS
}

/**
 * Codeforces Tag -> 难度估算
 * 当题目无 Rating 时，根据 Tag 中最高难度估算
 */
const CF_TAG_DIFFICULTY: Record<string, number> = {
  'implementation': 1,
  'math': 3,
  'brute force': 1,
  'greedy': 3,
  'sortings': 2,
  'dp': 4,
  'graphs': 5,
  'trees': 5,
  'dfs and similar': 4,
  'binary search': 3,
  'data structures': 5,
  'number theory': 5,
  'combinatorics': 5,
  'geometry': 4,
  'strings': 4,
  'flows': 7,
  'fft': 7,
  'constructive algorithms': 4,
  'game theory': 5,
  'probabilities': 6,
  'two pointers': 3,
  'bitmasks': 4,
  'shortest paths': 5,
  'dsu': 4,
  'segment trees': 6,
  'string suffix structures': 7,
  'matrices': 6,
};

export function mapCFTagsToLevel(tags: string[]): number {
  if (!tags || tags.length === 0) return 3; // 默认中等难度
  
  let maxLevel = 1;
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    const level = CF_TAG_DIFFICULTY[tagLower] || 3;
    maxLevel = Math.max(maxLevel, level);
  }
  
  return maxLevel;
}

/**
 * 统一难度映射接口
 */
export interface ProblemInfo {
  platform: 'luogu' | 'codeforces';
  id: string;
  name: string;
  difficulty: number; // 1-8
  rating?: number; // CF rating
  tags?: string[];
  solvedAt: string; // ISO date string
}

export function normalizeDifficulty(problem: Partial<ProblemInfo>): number {
  if (problem.platform === 'luogu') {
    return mapLuoguDifficulty(problem.difficulty || 3);
  }
  
  if (problem.platform === 'codeforces') {
    if (problem.rating) {
      return mapCFRatingToLevel(problem.rating);
    }
    if (problem.tags && problem.tags.length > 0) {
      return mapCFTagsToLevel(problem.tags);
    }
    return 3; // 默认
  }
  
  return 3;
}

/**
 * 获取 CF 段位名称
 */
export function getCFRankName(rating: number): string {
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2400) return 'Master';
  if (rating < 2600) return 'International Master';
  if (rating < 3000) return 'Grandmaster';
  return 'International Grandmaster';
}
