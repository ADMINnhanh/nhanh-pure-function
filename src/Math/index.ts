import { UNIT_LABELS } from "../Constant";
import { Point } from "./type";

/** 提取固定值 */
const HALF_PI = Math.PI / 2;
const PI_OVER_180 = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const MAX_LAT = 85.05112878;

/**
 * 将经纬度转换为平面坐标
 * @param lng 经度
 * @param lat 纬度
 * @returns 平面坐标 [x, y]（米）
 */
export function _LngLatToPlane(lng: number, lat: number): [number, number] {
  const clampedLng = Math.max(Math.min(lng, 180), -180);
  const clampedLat = Math.max(Math.min(lat, MAX_LAT), -MAX_LAT);

  const x = clampedLng * PI_OVER_180 * EARTH_RADIUS;
  const phi = clampedLat * PI_OVER_180;
  const y = Math.log(Math.tan(Math.PI / 4 + phi / 2)) * EARTH_RADIUS;
  return [x, y];
}

/**
 * 将平面坐标转换为经纬度
 * @param x 平面坐标 X 值（米）
 * @param y 平面坐标 Y 值（米）
 * @returns 经纬度 [lng, lat]（度）
 */
export function _PlaneToLngLat(x: number, y: number): [number, number] {
  // 计算经度
  const lng = x / EARTH_RADIUS / PI_OVER_180;

  // 计算纬度
  const lat =
    (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - HALF_PI) / PI_OVER_180;

  return [lng, lat];
}

/**
 * 计算点到线段的距离
 * @param point 点击位置
 * @param lineStart 线段起点
 * @param lineEnd 线段终点
 * @returns 点到线段的距离
 */
export function _PointToLineDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [x0, y0] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);

  let t = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));

  return Math.sqrt(
    (x0 - (x1 + t * (x2 - x1))) ** 2 + (y0 - (y1 + t * (y2 - y1))) ** 2
  );
}

/**
 * 检查单个一维数组参数是否合法（元素为有限数字）
 * @param arr - 待检查的数组
 * @param minLength - 数组最小长度 (默认2)
 * @returns 参数合法返回 true，否则返回 false
 */
export function _IsValidNumberArray(
  arr: unknown,
  minLength: number = 2
): boolean {
  return (
    Array.isArray(arr) &&
    arr.length >= minLength &&
    arr.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

/**
 * 检查二维数组结构是否合法（每个元素都是有效的一维数组）
 * @param arr - 待检查的二维数组
 * @param minLength - 外层数组最小长度 (默认1)
 * @param innerMinLength - 内层数组最小长度 (默认2)
 * @returns 所有元素都合法返回 true，否则返回 false
 */
export function _IsValid2DArray(
  arr: unknown,
  minLength: number = 1,
  innerMinLength: number = 2
): boolean {
  return (
    Array.isArray(arr) &&
    arr.length >= minLength &&
    arr.every((innerArr) => _IsValidNumberArray(innerArr, innerMinLength))
  );
}

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
  // 将数字转换为字符串
  const numStr = number.toString();
  // 按小数点分割字符串
  const parts = numStr.split(".");
  // 处理整数部分
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    // 如果有小数部分，拼接整数部分和小数部分
    return integerPart + "." + parts[1];
  }
  // 如果没有小数部分，直接返回处理后的整数部分
  return integerPart;
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

/**
 * 计算圆弧的起点和终点坐标
 * @param x 圆心X坐标
 * @param y 圆心Y坐标
 * @param radius 圆弧半径
 * @param startAngle 起始角度（弧度制，0表示X轴正方向）
 * @param endAngle 结束角度（弧度制）
 * @returns [起点坐标[x,y], 终点坐标[x,y]]
 */
export function _GetArcPoints(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): [[number, number], [number, number]] {
  // 计算起点坐标
  const startX = x + radius * Math.cos(startAngle);
  const startY = y + radius * Math.sin(startAngle);

  // 计算终点坐标
  const endX = x + radius * Math.cos(endAngle);
  const endY = y + radius * Math.sin(endAngle);

  return [
    [startX, startY],
    [endX, endY],
  ];
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
