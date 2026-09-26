import { useMemo, useRef, useEffect } from 'react';
import { getColor, EMPTY_COLOR, BASE_COLOR_MAP, DIFFICULTY_NAMES } from '../utils/colorEngine';
import { DailyStats, getDominantDifficulty } from '../utils/mockData';

interface FolotoyScreenProps {
  stats: Record<string, DailyStats>;
}

// Folotoy 屏幕参数
const SCREEN_WIDTH = 128;
const SCREEN_HEIGHT = 64;
const CELL_SIZE = 2; // 每个格子在屏幕上的像素大小
const HEATMAP_COLS = Math.floor((SCREEN_WIDTH - 10) / (CELL_SIZE + 1)); // 预留图例空间
const HEATMAP_ROWS = Math.floor((SCREEN_HEIGHT - 12) / (CELL_SIZE + 1)); // 预留底部图例

export default function FolotoyScreen({ stats }: FolotoyScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pixelData = useMemo(() => {
    const today = new Date();
    const totalDays = HEATMAP_COLS * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const pixels: string[][] = [];
    
    for (let row = 0; row < HEATMAP_ROWS; row++) {
      const pixelRow: string[] = [];
      for (let col = 0; col < HEATMAP_COLS; col++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + col * 7 + row);
        
        if (currentDate > today) {
          pixelRow.push('transparent');
          continue;
        }
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayStats = stats[dateStr];
        
        if (dayStats && dayStats.total > 0) {
          const level = getDominantDifficulty(dayStats);
          pixelRow.push(getColor(level, dayStats.total));
        } else {
          pixelRow.push(EMPTY_COLOR);
        }
      }
      pixels.push(pixelRow);
    }
    
    return pixels;
  }, [stats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布大小（放大显示）
    const scale = 3;
    canvas.width = SCREEN_WIDTH * scale;
    canvas.height = SCREEN_HEIGHT * scale;
    
    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制热力图
    for (let row = 0; row < HEATMAP_ROWS; row++) {
      for (let col = 0; col < HEATMAP_COLS; col++) {
        const color = pixelData[row]?.[col];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(
            (col * (CELL_SIZE + 1) + 2) * scale,
            (row * (CELL_SIZE + 1) + 8) * scale,
            CELL_SIZE * scale,
            CELL_SIZE * scale
          );
        }
      }
    }
    
    // 绘制底部难度图例 (微型)
    const legendY = (SCREEN_HEIGHT - 8) * scale;
    const legendX = 4 * scale;
    ctx.font = `${6 * scale}px monospace`;
    ctx.fillStyle = '#888';
    ctx.fillText('难度:', legendX, legendY + 5 * scale);
    
    for (let i = 1; i <= 8; i++) {
      ctx.fillStyle = BASE_COLOR_MAP[i];
      ctx.fillRect(
        (24 + (i - 1) * 5) * scale,
        legendY,
        4 * scale,
        4 * scale
      );
    }
    
    // 绘制标题
    ctx.font = `bold ${7 * scale}px monospace`;
    ctx.fillStyle = '#00ff88';
    ctx.fillText('OI Heatmap', 2 * scale, 6 * scale);
    
  }, [pixelData]);

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-400 mb-2">
        Folotoy 屏幕模拟 ({SCREEN_WIDTH}×{SCREEN_HEIGHT}px)
      </div>
      <div className="border-2 border-gray-700 rounded-lg p-2 bg-gray-900 shadow-lg shadow-green-900/20">
        <canvas
          ref={canvasRef}
          className="rounded"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        实际硬件分辨率: {SCREEN_WIDTH}×{SCREEN_HEIGHT} | 缩放: 3x
      </div>
    </div>
  );
}
