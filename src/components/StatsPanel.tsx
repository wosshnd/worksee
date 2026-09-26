import { useMemo } from 'react';
import { ProblemInfo } from '../utils/difficultyMapper';
import { DailyStats, getDominantDifficulty } from '../utils/mockData';
import { BASE_COLOR_MAP, getColor, DIFFICULTY_NAMES } from '../utils/colorEngine';

interface StatsPanelProps {
  problems: ProblemInfo[];
  stats: Record<string, DailyStats>;
}

export default function StatsPanel({ problems, stats }: StatsPanelProps) {
  const summary = useMemo(() => {
    const total = problems.length;
    const luoguCount = problems.filter(p => p.platform === 'luogu').length;
    const cfCount = problems.filter(p => p.platform === 'codeforces').length;
    const daysActive = Object.keys(stats).length;
    
    // 计算连续天数
    const sortedDates = Object.keys(stats).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (stats[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // 最高单日 AC
    let maxDaily = 0;
    let maxDailyDate = '';
    for (const [date, s] of Object.entries(stats)) {
      if (s.total > maxDaily) {
        maxDaily = s.total;
        maxDailyDate = date;
      }
    }
    
    // 难度分布
    const difficultyCount: Record<number, number> = {};
    for (const p of problems) {
      difficultyCount[p.difficulty] = (difficultyCount[p.difficulty] || 0) + 1;
    }
    
    // 最近7天统计
    const last7Days: DailyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (stats[dateStr]) {
        last7Days.push(stats[dateStr]);
      }
    }
    
    return {
      total,
      luoguCount,
      cfCount,
      daysActive,
      streak,
      maxDaily,
      maxDailyDate,
      difficultyCount,
      last7Days,
    };
  }, [problems, stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 总览卡片 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">总刷题数</div>
        <div className="text-3xl font-bold text-white">{summary.total}</div>
        <div className="flex gap-3 mt-2 text-xs">
          <span className="text-blue-400">洛谷: {summary.luoguCount}</span>
          <span className="text-green-400">CF: {summary.cfCount}</span>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">活跃天数</div>
        <div className="text-3xl font-bold text-white">{summary.daysActive}</div>
        <div className="text-xs text-gray-500 mt-2">
          当前连续: <span className="text-yellow-400">{summary.streak} 天</span>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">最高单日 AC</div>
        <div className="text-3xl font-bold text-white">{summary.maxDaily}</div>
        <div className="text-xs text-gray-500 mt-2">{summary.maxDailyDate}</div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-xs text-gray-400 mb-1">最近 7 天</div>
        <div className="text-3xl font-bold text-white">
          {summary.last7Days.reduce((sum, d) => sum + d.total, 0)}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          日均: {(summary.last7Days.reduce((sum, d) => sum + d.total, 0) / 7).toFixed(1)} 题
        </div>
      </div>

      {/* 难度分布 */}
      <div className="md:col-span-2 lg:col-span-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-xs text-gray-400 mb-3">难度分布</div>
        <div className="flex items-end gap-2 h-24">
          {Object.entries(BASE_COLOR_MAP).map(([level, color]) => {
            const count = summary.difficultyCount[parseInt(level)] || 0;
            const maxCount = Math.max(...Object.values(summary.difficultyCount), 1);
            const height = (count / maxCount) * 100;
            
            return (
              <div key={level} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{count}</span>
                <div
                  className="w-full rounded-t-sm transition-all duration-500 min-h-[2px]"
                  style={{
                    backgroundColor: color,
                    height: `${height}%`,
                    opacity: 0.8,
                  }}
                  title={`Lv.${level} ${DIFFICULTY_NAMES[parseInt(level)]}: ${count} 题`}
                />
                <span className="text-[9px] text-gray-500">Lv.{level}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
