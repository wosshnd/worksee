import { useState, useMemo, useCallback } from 'react';
import Heatmap from './components/Heatmap';
import FolotoyScreen from './components/FolotoyScreen';
import Legend from './components/Legend';
import StatsPanel from './components/StatsPanel';
import { generateMockData, groupByDate } from './utils/mockData';
import { BASE_COLOR_MAP, DIFFICULTY_NAMES, getColor, EMPTY_COLOR } from './utils/colorEngine';
import { mapCFRatingToLevel, mapLuoguDifficulty, getCFRankName } from './utils/difficultyMapper';

export default function App() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'folotoy' | 'color-engine'>('heatmap');
  const [showSettings, setShowSettings] = useState(false);
  const [luoguUser, setLuoguUser] = useState('OIer_Example');
  const [cfUser, setCfUser] = useState('tourist');
  const [useMockData, setUseMockData] = useState(true);
  
  // 生成模拟数据
  const problems = useMemo(() => generateMockData(), []);
  const stats = useMemo(() => groupByDate(problems), [problems]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              OI
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                洛谷 + Codeforces 双平台刷题可视化系统
              </h1>
              <p className="text-xs text-gray-500">Folotoy 屏幕适配 · 热力图 · 双通道颜色编码</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            ⚙️ 设置
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">洛谷用户名</label>
              <input
                type="text"
                value={luoguUser}
                onChange={(e) => setLuoguUser(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Codeforces 用户名</label>
              <input
                type="text"
                value={cfUser}
                onChange={(e) => setCfUser(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Folotoy 屏幕分辨率</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue={128}
                  className="w-16 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                />
                <span className="text-gray-500 self-center">×</span>
                <input
                  type="number"
                  defaultValue={64}
                  className="w-16 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
          {[
            { id: 'heatmap' as const, label: '📊 热力图' },
            { id: 'folotoy' as const, label: '📱 Folotoy 屏幕' },
            { id: 'color-engine' as const, label: '🎨 颜色引擎' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            {/* Stats */}
            <StatsPanel problems={problems} stats={stats} />
            
            {/* Heatmap */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-300">刷题热力图 (过去 20 周)</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>少</span>
                  {[EMPTY_COLOR, getColor(5, 1), getColor(5, 4), getColor(5, 7), getColor(5, 10)].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                  <span>多</span>
                </div>
              </div>
              <Heatmap stats={stats} weeks={20} />
            </div>

            {/* Legend */}
            <Legend />
          </div>
        )}

        {activeTab === 'folotoy' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 flex flex-col items-center">
              <FolotoyScreen stats={stats} />
              
              <div className="mt-6 max-w-lg">
                <h3 className="text-sm font-bold text-gray-300 mb-2">Folotoy 硬件适配说明</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 屏幕分辨率: 128×64 像素 (可配置)</li>
                  <li>• 采用 Floyd-Steinberg 抖动算法防止色彩断层</li>
                  <li>• 底部微型图例: 左侧难度条 (红→黑)，右侧数量条 (浅→深)</li>
                  <li>• 每个像素点代表一天的刷题状态</li>
                  <li>• 颜色方案: 基准色固定 + 明度动态的双通道编码</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'color-engine' && (
          <ColorEngineDemo />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-600">
          <p>洛谷 + Codeforces 双平台刷题可视化系统 | 适配 Folotoy AI Passport</p>
          <p className="mt-1">颜色引擎: 基准色固定 + 明度动态 · 难度归一化: 洛谷 1-8 级 ↔ CF Rating</p>
        </div>
      </footer>
    </div>
  );
}

// 颜色引擎演示组件
function ColorEngineDemo() {
  const [selectedLevel, setSelectedLevel] = useState(5);
  const [selectedCount, setSelectedCount] = useState(4);

  return (
    <div className="space-y-6">
      {/* 颜色矩阵 */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-4">颜色矩阵 (难度 × 数量)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-xs text-gray-500 p-2 text-left">难度 \ 数量</th>
                <th className="text-xs text-gray-500 p-2">0 题</th>
                <th className="text-xs text-gray-500 p-2">1-2 题</th>
                <th className="text-xs text-gray-500 p-2">3-5 题</th>
                <th className="text-xs text-gray-500 p-2">6-8 题</th>
                <th className="text-xs text-gray-500 p-2">&gt;8 题</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(BASE_COLOR_MAP).map(([level, baseColor]) => (
                <tr key={level} className="border-t border-gray-800">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: baseColor }} />
                      <span className="text-xs text-gray-400">
                        Lv.{level} {DIFFICULTY_NAMES[parseInt(level)]}
                      </span>
                    </div>
                  </td>
                  {[0, 1, 4, 7, 10].map(count => (
                    <td key={count} className="p-2">
                      <div
                        className="w-10 h-10 rounded-md border border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: getColor(parseInt(level), count) }}
                        title={`Lv.${level}, ${count}题: ${getColor(parseInt(level), count)}`}
                      />
                      <div className="text-[9px] text-gray-600 text-center mt-1">
                        {getColor(parseInt(level), count)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 交互式测试 */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-4">交互式颜色测试</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">难度等级: {selectedLevel} ({DIFFICULTY_NAMES[selectedLevel]})</label>
              <input
                type="range"
                min={1}
                max={8}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>入门</span>
                <span>NOI+</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">当日 AC 数量: {selectedCount}</label>
              <input
                type="range"
                min={0}
                max={15}
                value={selectedCount}
                onChange={(e) => setSelectedCount(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>0</span>
                <span>15</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-32 h-32 rounded-xl border-2 border-gray-600 shadow-lg transition-colors duration-300"
                style={{ backgroundColor: getColor(selectedLevel, selectedCount) }}
              />
              <div className="mt-3 text-sm font-mono text-gray-300">
                {getColor(selectedLevel, selectedCount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                基准色: {BASE_COLOR_MAP[selectedLevel]} → 输出: {getColor(selectedLevel, selectedCount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 难度映射说明 */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-4">难度归一化映射表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs text-gray-400 mb-2">洛谷 → 等级</h3>
            <div className="space-y-1">
              {[1,2,3,4,5,6,7,8].map(l => (
                <div key={l} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: BASE_COLOR_MAP[l] }} />
                  <span className="text-gray-400">Lv.{l} {DIFFICULTY_NAMES[l]}</span>
                  <span className="text-gray-600">→ 直接映射</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs text-gray-400 mb-2">Codeforces Rating → 等级</h3>
            <div className="space-y-1">
              {[
                { range: '< 800', level: 1 },
                { range: '800-1000', level: 2 },
                { range: '1000-1200', level: 3 },
                { range: '1200-1400', level: 4 },
                { range: '1400-1600', level: 5 },
                { range: '1600-1900', level: 6 },
                { range: '1900-2400', level: 7 },
                { range: '> 2400', level: 8 },
              ].map(item => (
                <div key={item.level} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: BASE_COLOR_MAP[item.level] }} />
                  <span className="text-gray-400 w-20">CF {item.range}</span>
                  <span className="text-gray-600">→ Lv.{item.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API 配置说明 */}
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h2 className="text-sm font-bold text-gray-300 mb-4">数据层 API 配置</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded p-3 border border-gray-700">
            <h3 className="text-xs font-bold text-blue-400 mb-2">洛谷 API</h3>
            <code className="text-[11px] text-gray-400 block">
              GET https://www.luogu.com.cn/api/record/list<br/>
              ?user={'{username}'}<br/>
              &page={'{page}'}<br/>
              Headers: UA 伪装 + Cookie
            </code>
            <p className="text-[10px] text-gray-600 mt-2">需处理分页、限流、UA 伪装</p>
          </div>
          <div className="bg-gray-900 rounded p-3 border border-gray-700">
            <h3 className="text-xs font-bold text-green-400 mb-2">Codeforces API</h3>
            <code className="text-[11px] text-gray-400 block">
              GET https://codeforces.com/api/<br/>
              • user.status?handle={'{handle}'}<br/>
              • user.rating?handle={'{handle}'}
            </code>
            <p className="text-[10px] text-gray-600 mt-2">无需认证，直接调用</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-900 rounded p-3 border border-gray-700">
          <h3 className="text-xs font-bold text-yellow-400 mb-2">缓存策略 (SQLite / IndexedDB)</h3>
          <code className="text-[11px] text-gray-400 block">
            -- 本地缓存表结构<br/>
            CREATE TABLE problems (<br/>
            &nbsp;&nbsp;id TEXT, platform TEXT, name TEXT,<br/>
            &nbsp;&nbsp;difficulty INTEGER, rating INTEGER,<br/>
            &nbsp;&nbsp;solved_at TEXT, cached_at TEXT<br/>
            );
          </code>
        </div>
      </div>
    </div>
  );
}
