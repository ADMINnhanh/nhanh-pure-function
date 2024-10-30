/**
 * 转为百分比字符串
 * @param value 分子
 * @param totalValue 分母
 * @param decimalPlaces 保留小数位
 * @returns 10.00%
 */
export function _ConvertToPercentage(value, totalValue, decimalPlaces = 2) {
  if (
    typeof value !== "number" ||
    typeof totalValue !== "number" ||
    typeof decimalPlaces !== "number" ||
    totalValue == 0
  ) {
    console.error("异常输入：", arguments);
    return "0.00%";
  }
  return (
    Number(
      parseInt((value / totalValue) * Math.pow(10, 2 + decimalPlaces)) /
        Math.pow(10, decimalPlaces)
    ) || 0
  );
}

/**
 * 误差范围
 * @param value 需要判断的数字
 * @param target 目标数字
 * @param errorMargin 正负误差范围
 * @returns 是否在误差内
 */
export function _IsWithinErrorMargin(value, target, errorMargin) {
  return Math.abs(value - target) <= errorMargin;
}

/**
 * 进度
 * @param {(schedule)=>void} callback callback( 进度百分比 )
 * @param {Number} TIME 总时长
 */
export function _Schedule(callback, TIME = 500) {
  let t;
  function loop(time) {
    if (!t) t = time;
    let percentage = Math.min((time - t) / TIME, 1);
    callback(percentage);
    if (time - t < TIME) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/**
 * 格式化数字，给数字加上千位分隔符。
 * @param {number} number - 要格式化的数字。
 * @returns {string} - 格式化后的字符串。
 */
export function _FormatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
export function _FormatNumberWithUnit(number, config = {}) {
  const { join, suffix, integer } = Object.assign(
    {
      join: true,
      suffix: "",
      integer: false,
    },
    config
  );

  function _join(value, suffix, plus = true) {
    value = (plus ? "" : "-") + value;
    if (join) return value + suffix;
    else return [value, suffix];
  }

  if (typeof number == "string") {
    if (!/^\d+$/.test(number.trim())) {
      console.error("错误输入：", number);
      return _join(0, suffix);
    }
  } else if (typeof number != "number") {
    console.error("错误输入：", number);
    return _join(0, suffix);
  }

  if (Math.abs(number) == Infinity || number == 0) {
    return _join(0, suffix);
  }

  number = Number(number);
  const plus = number >= 0;
  number = Math.abs(number);

  const units = [
    "",
    "万",
    "亿",
    "兆",
    "京",
    "垓",
    "秭",
    "穰",
    "沟",
    "涧",
    "正",
    "载",
    "极",
  ];
  const digits = Math.floor(Math.log10(number) / 4); // 计算位数

  // 不超过万位的数字直接返回
  if (digits === 0) {
    if (integer) {
      return _join(number, suffix, plus);
    } else {
      return _join(number.toFixed(2), suffix, plus);
    }
  }

  const dividedNumber = number / Math.pow(10000, digits);
  const formattedNumber = dividedNumber.toFixed(2);

  return _join(formattedNumber, units[digits] + suffix, plus);
}

/**
 * 判断点是否在多边形内
 * @param point - 待检测的点，包含 x 和 y 坐标
 * @param polygon - 多边形的点集，数组形式，每个点包含 x 和 y 坐标
 * @returns boolean - 点是否在多边形内
 */
export function _IsPointInPolygon(point, polygon) {
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
