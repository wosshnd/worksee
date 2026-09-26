import { BASE_COLOR_MAP, DIFFICULTY_NAMES, getColor, EMPTY_COLOR } from '../utils/colorEngine';

export default function Legend() {
  const intensityLevels = [
    { count: 0, label: '0 题' },
    { count: 1, label: '1-2 题' },
    { count: 4, label: '3-5 题' },
    { count: 7, label: '6-8 题' },
    { count: 10, label: '>8 题' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <h3 className="text-sm font-bold text-gray-300">图例说明</h3>
      
      {/* 难度色条 */}
      <div>
        <div className="text-xs text-gray-400 mb-2">难度等级 (色相通道)</div>
        <div className="flex gap-1">
          {Object.entries(BASE_COLOR_MAP).map(([level, color]) => (
            <div key={level} className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-sm border border-gray-600"
                style={{ backgroundColor: color }}
                title={`Lv.${level} ${DIFFICULTY_NAMES[parseInt(level)]}`}
              />
              <span className="text-[9px] text-gray-500">{level}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {Object.entries(DIFFICULTY_NAMES).map(([level, name]) => (
            <div key={level} className="w-6 text-center">
              <span className="text-[8px] text-gray-500 leading-tight">{name.slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 数量明度条 */}
      <div>
        <div className="text-xs text-gray-400 mb-2">当日 AC 数量 (明度通道)</div>
        <div className="flex gap-1">
          {intensityLevels.map(({ count, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-sm border border-gray-600"
                style={{ backgroundColor: getColor(5, count) }}
                title={`${label} (以 Lv.5 为例)`}
              />
              <span className="text-[9px] text-gray-500 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 空状态 */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-sm border border-gray-600"
          style={{ backgroundColor: EMPTY_COLOR }}
        />
        <span className="text-xs text-gray-400">无刷题记录</span>
      </div>

      {/* 明度规则说明 */}
      <div className="text-[10px] text-gray-500 space-y-1 border-t border-gray-700 pt-2">
        <p>• 1-2 题: 100% 基准色亮度</p>
        <p>• 3-5 题: 75% 亮度 (稍暗)</p>
        <p>• 6-8 题: 50% 亮度 (明显暗)</p>
        <p>• &gt;8 题: 30% 亮度 (极深)</p>
        <p>• 黄色降亮度时自动向橙色过渡</p>
      </div>
    </div>
  );
}
