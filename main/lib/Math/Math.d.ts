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
  decimalPlaces?: number
): number;

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
): boolean;

/**
 * 进度
 * @param {(schedule)=>void} callback callback( 进度百分比 )
 * @param {Number} TIME 总时长
 */
export function _Schedule(
  callback: (schedule: number) => void,
  TIME: number
): void;

/**
 * 格式化数字，给数字加上千位分隔符。
 * @param {number} number - 要格式化的数字。
 * @returns {string} - 格式化后的字符串。
 */
export function _FormatNumber(number: number): string;

/**
 * 纯数字转  数字加单位
 * @param number 数字或字符串数字
 * @param config : {
 *    join 拼接起来吗
 *    suffix 后缀
 *    integer 不超过万位的数字时保持整数吗
 * }
 * @returns 123456  -->  12.34万 | [ 12.34 , 万 ]
 */
export function _FormatNumberWithUnit(
  number: string | number,
  config?: {
    join?: boolean;
    suffix?: string;
    integer?: boolean;
  }
): string | [number, string];

interface Point {
  x: number;
  y: number;
}
/**
 * 判断点是否在多边形内
 * @param point - 待检测的点，包含 x 和 y 坐标
 * @param polygon - 多边形的点集，数组形式，每个点包含 x 和 y 坐标
 * @returns boolean - 点是否在多边形内
 */
export function _IsPointInPolygon(point: Point, polygon: Point[]): boolean;
