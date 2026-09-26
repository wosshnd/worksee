/**
 * Mock Data Generator
 * 生成模拟的洛谷和 Codeforces 刷题数据
 */

import { ProblemInfo, mapCFRatingToLevel, mapLuoguDifficulty } from './difficultyMapper';

// 洛谷题目名称池
const LUOGU_PROBLEMS = [
  { id: 'P1001', name: 'A+B Problem', difficulty: 1 },
  { id: 'P1002', name: '过河卒', difficulty: 3 },
  { id: 'P1003', name: '铺地毯', difficulty: 2 },
  { id: 'P1012', name: '数的划分', difficulty: 5 },
  { id: 'P1060', name: '开心的金明', difficulty: 4 },
  { id: 'P1102', name: 'A-B 数对', difficulty: 4 },
  { id: 'P1115', name: '最大子段和', difficulty: 3 },
  { id: 'P1226', name: '快速幂', difficulty: 3 },
  { id: 'P1305', name: '新二叉树', difficulty: 4 },
  { id: 'P1422', name: '小玉家的电费', difficulty: 1 },
  { id: 'P1536', name: '村村通', difficulty: 5 },
  { id: 'P1605', name: '迷宫', difficulty: 5 },
  { id: 'P1706', name: '全排列问题', difficulty: 3 },
  { id: 'P1835', name: '素数密度', difficulty: 6 },
  { id: 'P1902', name: '刺杀大使', difficulty: 5 },
  { id: 'P2010', name: '回文日期', difficulty: 3 },
  { id: 'P2249', name: '查找', difficulty: 2 },
  { id: 'P2678', name: '跳石头', difficulty: 4 },
  { id: 'P3366', name: '最小生成树', difficulty: 5 },
  { id: 'P3374', name: '树状数组', difficulty: 6 },
  { id: 'P4071', name: '排列计数', difficulty: 7 },
  { id: 'P5091', name: '扩展欧拉定理', difficulty: 7 },
  { id: 'P5367', name: '康托展开', difficulty: 8 },
  { id: 'P6175', name: '无源汇上下界网络流', difficulty: 8 },
];

// CF 题目池
const CF_PROBLEMS = [
  { id: '1A', name: 'Theatre Square', rating: 800, tags: ['math'] },
  { id: '4A', name: 'Watermelon', rating: 800, tags: ['brute force', 'math'] },
  { id: '71A', name: 'Way Too Long Words', rating: 800, tags: ['strings'] },
  { id: '231A', name: 'Team', rating: 800, tags: ['brute force', 'implementation'] },
  { id: '339D', name: 'Xenia and Bit Operations', rating: 1400, tags: ['data structures', 'trees'] },
  { id: '474D', name: 'Flowers', rating: 1500, tags: ['dp'] },
  { id: '580D', name: 'Kefa and Dishes', rating: 1800, tags: ['dp', 'bitmasks'] },
  { id: '626D', name: 'Jerry\'s Protest', rating: 1700, tags: ['probabilities', 'sortings'] },
  { id: '803D', name: 'Magazine Ad', rating: 1800, tags: ['binary search', 'greedy'] },
  { id: '837D', name: 'Round Subset', rating: 2000, tags: ['dp'] },
  { id: '888D', name: 'Almost Identity Permutations', rating: 2000, tags: ['combinatorics', 'math'] },
  { id: '1009D', name: 'Relatively Prime Graph', rating: 1600, tags: ['math', 'constructive algorithms'] },
  { id: '1132D', name: 'Stressful Training', rating: 2300, tags: ['binary search', 'greedy'] },
  { id: '1251D', name: 'Binary String Sorting', rating: 2100, tags: ['dp', 'strings'] },
  { id: '1400D', name: 'Zigzags', rating: 2100, tags: ['brute force', 'data structures'] },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateLuoguData(count: number): ProblemInfo[] {
  const problems: ProblemInfo[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const problem = LUOGU_PROBLEMS[Math.floor(Math.random() * LUOGU_PROBLEMS.length)];
    problems.push({
      platform: 'luogu',
      id: problem.id,
      name: problem.name,
      difficulty: mapLuoguDifficulty(problem.difficulty),
      solvedAt: randomDate(threeMonthsAgo, now).toISOString(),
    });
  }
  
  return problems;
}

function generateCFData(count: number): ProblemInfo[] {
  const problems: ProblemInfo[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const problem = CF_PROBLEMS[Math.floor(Math.random() * CF_PROBLEMS.length)];
    problems.push({
      platform: 'codeforces',
      id: problem.id,
      name: problem.name,
      difficulty: mapCFRatingToLevel(problem.rating),
      rating: problem.rating,
      tags: problem.tags,
      solvedAt: randomDate(threeMonthsAgo, now).toISOString(),
    });
  }
  
  return problems;
}

export function generateMockData(): ProblemInfo[] {
  return [
    ...generateLuoguData(120),
    ...generateCFData(80),
  ];
}

/**
 * 按日期分组统计数据
 */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  total: number;
  luogu: number;
  codeforces: number;
  maxDifficulty: number; // 当日最高难度
  difficultyDistribution: Record<number, number>; // 每个难度的数量
}

export function groupByDate(problems: ProblemInfo[]): Record<string, DailyStats> {
  const stats: Record<string, DailyStats> = {};
  
  for (const problem of problems) {
    const date = problem.solvedAt.split('T')[0];
    
    if (!stats[date]) {
      stats[date] = {
        date,
        total: 0,
        luogu: 0,
        codeforces: 0,
        maxDifficulty: 0,
        difficultyDistribution: {},
      };
    }
    
    stats[date].total++;
    if (problem.platform === 'luogu') stats[date].luogu++;
    else stats[date].codeforces++;
    
    stats[date].maxDifficulty = Math.max(stats[date].maxDifficulty, problem.difficulty);
    stats[date].difficultyDistribution[problem.difficulty] = 
      (stats[date].difficultyDistribution[problem.difficulty] || 0) + 1;
  }
  
  return stats;
}

/**
 * 获取主要难度（当日最多的难度等级）
 */
export function getDominantDifficulty(stats: DailyStats): number {
  let maxCount = 0;
  let dominant = 1;
  
  for (const [level, count] of Object.entries(stats.difficultyDistribution)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = parseInt(level);
    }
  }
  
  return dominant;
}
