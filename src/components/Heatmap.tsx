import { useMemo } from 'react';
import { getColor, EMPTY_COLOR, BASE_COLOR_MAP, DIFFICULTY_NAMES } from '../utils/colorEngine';
import { DailyStats, getDominantDifficulty } from '../utils/mockData';

interface HeatmapProps {
  stats: Record<string, DailyStats>;
  weeks?: number;
}

export default function Heatmap({ stats, weeks = 20 }: HeatmapProps) {
  const { grid, dates, months } = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    
    // 调整到周日开始
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const adjustedTotalDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const grid: { date: string; color: string; count: number; level: number }[][] = [];
    const dates: string[] = [];
    const monthLabels: { label: string; col: number }[] = [];
    
    let lastMonth = -1;
    
    for (let week = 0; week < Math.ceil(adjustedTotalDays / 7); week++) {
      const weekCol: { date: string; color: string; count: number; level: number }[] = [];
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);
        
        if (currentDate > today) {
          weekCol.push({ date: '', color: 'transparent', count: 0, level: 0 });
          continue;
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push(dateStr);
        
        const dayStats = stats[dateStr];
        let color = EMPTY_COLOR;
        let count = 0;
        let level = 0;
        
        if (dayStats && dayStats.total > 0) {
          count = dayStats.total;
          level = getDominantDifficulty(dayStats);
          color = getColor(level, count);
        }
        
        weekCol.push({ date: dateStr, color, count, level });
        
        // 记录月份标签
        const month = currentDate.getMonth();
        if (month !== lastMonth && day === 0) {
          const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
          monthLabels.push({ label: monthNames[month], col: week });
          lastMonth = month;
        }
      }
      
      grid.push(weekCol);
    }
    
    return { grid, dates, months: monthLabels };
  }, [stats, weeks]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-fit">
        {/* 月份标签 */}
        <div className="flex ml-8 mb-1">
          {grid.map((_, weekIdx) => {
            const monthLabel = months.find(m => m.col === weekIdx);
            return (
              <div key={weekIdx} className="w-3 h-4 mr-0.5 text-[10px] text-gray-500">
                {monthLabel?.label || ''}
              </div>
            );
          })}
        </div>
        
        {/* 热力图主体 */}
        <div className="flex">
          {/* 星期标签 */}
          <div className="flex flex-col mr-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
              <div key={idx} className="w-6 h-3 flex items-center text-[10px] text-gray-500">
                {idx % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          {/* 格子 */}
          <div className="flex gap-0.5">
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5">
                {week.map((cell, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="w-3 h-3 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-gray-400 cursor-pointer relative group"
                    style={{ backgroundColor: cell.color }}
                    title={cell.date ? `${cell.date}: ${cell.count} 题 (难度 ${cell.level})` : ''}
                  >
                    {/* Tooltip */}
                    {cell.date && cell.count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        <div>{cell.date}</div>
                        <div>AC: {cell.count} 题</div>
                        <div>主要难度: Lv.{cell.level} {DIFFICULTY_NAMES[cell.level]}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
