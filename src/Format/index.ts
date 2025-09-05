import { UNIT_LABELS } from "../Constant";

/**
 * 首字母大写
 * @param str
 * @returns string
 */
export function _Format_CapitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 转为百分比字符串
 * @param value 分子
 * @param totalValue 分母
 * @param decimalPlaces 保留小数位
 * @returns 10.00%
 */
export function _Format_Percentage(
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
 * 格式化数字，给数字加上千位分隔符。
 * @param {number} number - 要格式化的数字。
 * @returns {string} - 格式化后的字符串。
 */
export function _Format_NumberWithCommas(number: number): string {
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
export function _Format_NumberWithUnit(
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
 * 格式化文件大小
 * @param {number} size
 * @returns string
 */
export function _Format_FileSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let unitIndex = 0;
  while (size > 1024) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/**
 * 时间戳转换字符串
 * @param {Number | Date} time 时间戳或Date对象
 * @param {String} template 完整模板 -->  YYYY MM DD hh mm ss ms
 * @param {Boolean} pad 补0
 */
export function _Format_Timestamp(
  time: number | Date,
  template = "YYYY-MM-DD hh:mm:ss",
  pad = true
) {
  const date = new Date(time);

  if (isNaN(date.getTime())) {
    console.error("Invalid date");
    return "";
  }

  const dictionary = {
    YYYY: (date: Date) => date.getFullYear(),
    MM: (date: Date) => date.getMonth() + 1, // Adjust for 0-based month
    DD: (date: Date) => date.getDate(),
    hh: (date: Date) => date.getHours(),
    mm: (date: Date) => date.getMinutes(),
    ss: (date: Date) => date.getSeconds(),
    ms: (date: Date) => date.getMilliseconds(),
  };

  return template.replace(/YYYY|MM|DD|hh|mm|ss|ms/g, (match) => {
    const value = dictionary[match as "ss"](date);
    return pad ? String(value).padStart(2, "0") : String(value);
  });
}

/**
 * 从给定的href中提取名称部分
 * 该函数旨在处理URL字符串，并返回URL路径的最后一部分，去除查询参数
 *
 * @param {string} href - 待处理的URL字符串
 * @param {string} [defaultName="file"] - 默认的文件名，当无法提取时使用
 * @returns {string} URL路径的最后一部分，不包括查询参数
 */
export function _Format_HrefName(href: string, defaultName = "file") {
  // 简单检查空值和其他假值
  if (!href) return defaultName;

  // 将 href 转换为字符串以防止其他类型输入
  href = String(href).trim();

  // 如果 href 是空字符串，直接返回空字符串
  if (href === "") return defaultName;

  // 分割路径部分并获取最后一部分
  const pathParts = href.split("/");
  const lastPart = pathParts[pathParts.length - 1];

  // 分割查询参数并获取基础名称
  const name = lastPart.split("?")[0];

  // 返回处理后的名称部分
  return name;
}

/**
 * 驼峰命名
 * @param {字符串} str
 * @param {是否删除分割字符} isRemoveDelimiter
 * @returns 'wq1wqw-qw2qw' -> 'wq1Wqw-Qw2Qw' / 'wqWqwQwQw'
 */
export function _Format_CamelCase(str: string, isRemoveDelimiter?: boolean) {
  str = str.replace(/([^a-zA-Z][a-z])/g, (match) => match.toUpperCase());
  if (isRemoveDelimiter) return str.replace(/[^a-zA-Z]+/g, "");
  return str;
}

/**
 * 排除子串
 * @param inputString 需裁剪字符串
 * @param substringToDelete 被裁减字符串
 * @param delimiter 分隔符
 * @returns 裁减后的字符串
 */
export function _Format_ExcludeSubstring(
  inputString: string,
  substringToDelete: string,
  delimiter = ","
) {
  const regex = new RegExp(
    `(^|${delimiter})${substringToDelete}(${delimiter}|$)`,
    "g"
  );
  return inputString.replace(regex, function ($0, $1, $2) {
    return $1 === $2 ? delimiter : "";
  });
}

/**
 * 处理不可见字符的转义和还原
 * @param {string} str - 要处理的字符串
 * @param {boolean} escape - true表示转义（默认），false表示还原
 * @returns {string} 处理后的字符串
 */
export function _Format_ToggleInvisibleChars(str: string, escape = true) {
  // 转义映射表
  const escapeMap = {
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\v": "\\v",
    "\f": "\\f",
    "\r": "\\r",
    " ": "\\s",
  } as const;

  // 还原映射表（反转转义映射）
  const unescapeMap = Object.fromEntries(
    Object.entries(escapeMap).map(([key, value]) => [value, key])
  );

  if (escape) {
    // 转义模式：将不可见字符转为转义序列
    return str.replace(
      /[\b\t\n\v\f\r ]/g,
      (match) => escapeMap[match as keyof typeof escapeMap]
    );
  } else {
    // 还原模式：将转义序列转为实际字符
    return str.replace(/\\[btnvfrs]/g, (match) => {
      return unescapeMap[match] || match; // 找不到对应项则保留原字符
    });
  }
}
