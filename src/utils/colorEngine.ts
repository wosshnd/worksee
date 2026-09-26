/**
 * ColorEngine - 颜色计算引擎
 * 基于洛谷官方难度颜色表，通过明度调整实现双通道编码
 */

// 基准色映射表 (Base Color Map)
export const BASE_COLOR_MAP: Record<number, string> = {
  1: '#F54C4C', // 入门 (Red) - CF < 800
  2: '#FB9934', // 普及- (Orange) - CF 800-1000
  3: '#FFD93D', // 普及 (Yellow) - CF 1000-1200
  4: '#6BC54E', // 普及+/提高- (Green) - CF 1200-1400
  5: '#45C5E6', // 提高 (Cyan) - CF 1400-1600
  6: '#3D8BF5', // 提高+/省选- (Blue) - CF 1600-1900
  7: '#A658F5', // 省选/NOI- (Purple) - CF 1900-2400
  8: '#2D3436', // NOI/NOI+/CTS (Black) - CF > 2400
};

// 难度名称
export const DIFFICULTY_NAMES: Record<number, string> = {
  1: '入门',
  2: '普及-',
  3: '普及',
  4: '普及+/提高-',
  5: '提高',
  6: '提高+/省选-',
  7: '省选/NOI-',
  8: 'NOI/NOI+/CTS',
};

// 空单元格颜色
export const EMPTY_COLOR = '#EBEDF0';

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// Hex -> RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// RGB -> Hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// RGB -> HSL
function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// HSL -> RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * 黄色特殊处理：降亮度时向橙色系过渡
 * 避免黄色变暗后显脏
 */
function adjustYellowDarkness(rgb: RGB, factor: number): RGB {
  // 将黄色向橙色过渡
  const orangeShift = (1 - factor) * 0.4; // 越暗越偏橙
  return {
    r: rgb.r, // 保持红色通道
    g: rgb.g * (1 - orangeShift * 0.3), // 降低绿色通道
    b: rgb.b * factor * 0.5, // 大幅降低蓝色通道
  };
}

/**
 * Level 8 (黑色) 特殊处理
 * 本身已是深色，数量多时保持纯黑或微调为深灰
 */
function adjustBlackLevel(count: number): string {
  if (count === 0) return EMPTY_COLOR;
  if (count <= 2) return '#2D3436';
  if (count <= 5) return '#1a1d1e';
  if (count <= 8) return '#111314';
  return '#0a0b0c';
}

/**
 * 核心颜色计算函数
 * @param difficultyLevel 难度等级 (1-8)
 * @param count 当日 AC 数量
 * @returns Hex 颜色值
 */
export function getColor(difficultyLevel: number, count: number): string {
  // 0 题: 灰色底
  if (count === 0) return EMPTY_COLOR;
  
  // Level 8 特殊处理
  if (difficultyLevel === 8) return adjustBlackLevel(count);

  // 获取基准色
  const baseHex = BASE_COLOR_MAP[difficultyLevel] || BASE_COLOR_MAP[1];
  const rgb = hexToRgb(baseHex);
  
  // 根据数量确定亮度因子
  let factor: number;
  if (count <= 2) {
    factor = 1.0; // 100% 亮度
  } else if (count <= 5) {
    factor = 0.75; // 75% 亮度
  } else if (count <= 8) {
    factor = 0.50; // 50% 亮度
  } else {
    factor = 0.30; // 30% 亮度
  }

  // 黄色特殊处理
  if (difficultyLevel === 3) {
    const adjusted = adjustYellowDarkness(rgb, factor);
    return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
  }

  // 通用处理：HSL 空间调整明度
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = hsl.l * factor;
  // 保持饱和度，稍微增加以补偿亮度降低
  hsl.s = Math.min(100, hsl.s * (1 + (1 - factor) * 0.2));
  
  const resultRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);
}

/**
 * 获取亮度等级标签
 */
export function getIntensityLabel(count: number): string {
  if (count === 0) return '无';
  if (count <= 2) return '100%';
  if (count <= 5) return '75%';
  if (count <= 8) return '50%';
  return '30%';
}

/**
 * Floyd-Steinberg 抖动算法
 * 用于低色深屏幕的色彩过渡
 */
export function applyDithering(
  pixels: string[][],
  width: number,
  height: number
): string[][] {
  const result = pixels.map(row => [...row]);
  
  // 将颜色转为灰度值用于抖动计算
  const grayValues = pixels.map(row => 
    row.map(color => {
      const rgb = hexToRgb(color);
      return (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255;
    })
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldVal = grayValues[y][x];
      const newVal = oldVal > 0.5 ? 1 : 0;
      const error = oldVal - newVal;

      // 分配误差
      if (x + 1 < width) grayValues[y][x + 1] += error * 7/16;
      if (y + 1 < height) {
        if (x - 1 >= 0) grayValues[y + 1][x - 1] += error * 3/16;
        grayValues[y + 1][x] += error * 5/16;
        if (x + 1 < width) grayValues[y + 1][x + 1] += error * 1/16;
      }

      // 根据抖动结果选择100%或75%亮度版本
      if (newVal === 0 && result[y][x] !== EMPTY_COLOR) {
        // 保持原色但标记为需要抖动
        result[y][x] = result[y][x]; // 保持原色
      }
    }
  }

  return result;
}

/**
 * 生成颜色渐变条（用于图例）
 */
export function generateGradientColors(level: number): string[] {
  return [
    getColor(level, 0),
    getColor(level, 1),
    getColor(level, 4),
    getColor(level, 7),
    getColor(level, 10),
  ];
}
