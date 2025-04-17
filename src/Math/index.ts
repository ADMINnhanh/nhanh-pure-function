import { UNIT_LABELS } from "../Constant";
import { Point } from "./type";

/**
 * 转为百分比字符串
 * @param value 分子
 * @param totalValue 分母
 * @param decimalPlaces 保留小数位
 * @returns 10.00%
 */
export function _ConvertToPercentage(
  value: number,
  totalValue: number,
  decimalPlaces = 2
): string {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(totalValue) ||
    !Number.isFinite(decimalPlaces)
  ) {
    console.error("所有参数必须是有限的数字");
    return "";
  }

  if (totalValue === 0) {
    console.error("分母不能为零");
    return "";
  }

  if (decimalPlaces < 0) {
    console.error("小数位数不能为负数");
    return "";
  }

  const percentage = (value / totalValue) * 100;
  return percentage.toFixed(decimalPlaces) + "%";
}

/**
 * 误差范围
 * @param value 需要判断的数字
 * @param target 目标数字
 * @param errorMargin 正负误差范围
 * @returns 是否在误差内
 */
export function _IsWithinErrorMargin(
  value: number,
  target: number,
  errorMargin: number
): boolean {
  return Math.abs(value - target) <= errorMargin;
}

/**
 * 进度
 * @param {(schedule)=>void} callback callback( 进度百分比 )
 * @param {Number} TIME 总时长
 * @returns {Function} 停止函数
 */
export function _Schedule(callback: (schedule: number) => void, TIME = 500) {
  let t: number;
  let canContinueExecution = true;
  function loop(time: number) {
    if (!canContinueExecution) return;
    if (!t) t = time;
    let percentage = Math.min((time - t) / TIME, 1);
    callback(percentage);
    if (time - t < TIME) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return () => (canContinueExecution = false);
}

/**
 * 格式化数字，给数字加上千位分隔符。
 * @param {number} number - 要格式化的数字。
 * @returns {string} - 格式化后的字符串。
 */
export function _FormatNumber(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 将纯数字转换为带单位的数字格式
 *
 * @param value - 要转换的数字或字符串形式的数字
 * @param config - 配置对象
 * @param config.join - 是否将数字和单位拼接成一个字符串，默认为 `false`
 * @param config.suffix - 单位后缀，默认为 `万`
 * @param config.decimalPlaces - 保留的小数位数，默认为 `2`
 *
 * @returns 返回转换后的结果：
 * - 如果 `config.join` 为 `true`，返回拼接后的字符串，如 "12.34万"
 * - 如果 `config.join` 为 `false`，返回一个数组，如 [ 12.34, '万' ]
 */

export function _FormatNumberWithUnit(
  value: string | number,
  config?: {
    join?: boolean;
    suffix?: string;
    decimalPlaces?: number;
  }
) {
  // 默认配置
  const defaultConfig = {
    join: true,
    suffix: "",
    decimalPlaces: 2,
  };

  // 合并配置
  const { join, suffix, decimalPlaces } = {
    ...defaultConfig,
    ...(config || {}),
  };

  const number = Number(value);
  if (isNaN(number)) return join ? `${0}${suffix}` : [0, suffix];

  const absNumber = Math.abs(number);
  const plus = number >= 0;

  // 计算位数
  const digits = Math.max(0, Math.floor(Math.log10(absNumber) / 4));

  // 计算单位转换因子
  const unitFactor = Math.pow(10000, digits);
  const dividedNumber = absNumber / unitFactor;
  const formattedNumber =
    (plus ? 1 : -1) *
    parseFloat(dividedNumber.toFixed(Math.max(0, decimalPlaces)));

  // 返回结果
  return join
    ? `${formattedNumber}${UNIT_LABELS[digits]}${suffix}`
    : [formattedNumber, UNIT_LABELS[digits] + suffix];
}

/**
 * 判断点是否在多边形内
 * @param point - 待检测的点，包含 x 和 y 坐标
 * @param polygon - 多边形的点集，数组形式，每个点包含 x 和 y 坐标
 * @returns boolean - 点是否在多边形内
 */
export function _IsPointInPolygon(point: Point, polygon: Point[]): boolean {
  let isInside = false;

  const { x, y } = point;
  const len = polygon.length;

  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) isInside = !isInside;
  }

  return isInside;
}

/**
 * 格式化文件大小
 * @param {number} size
 * @returns string
 */
export function _FormatFileSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let unitIndex = 0;
  while (size > 1024) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/** 计算平面直角坐标系中两点的距离 */
export function _CalculateDistance2D(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/** 获取两点的中点 */
export function _GetMidpoint(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return { x: midX, y: midY };
}
