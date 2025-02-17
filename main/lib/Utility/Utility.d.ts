/**
 * 非null | undefined判断
 * @param value any
 * @returns boolean
 */
export function _NotNull(value: any): boolean;

/**
 * 是正常对象吗
 * @param {} value
 * @returns boolean
 */
export function _IsObject(value: any): boolean;

/**
 * 寻找空闲时机执行传入方法
 * @param callback  需执行的方法
 */
export function _ExecuteWhenIdle(callback: Function);

/**
 * 等待条件满足
 * @param conditionChecker 条件检查器
 * @param timeoutMillis 超时毫秒数
 * @returns Promise<unknown>
 */
export function _WaitForCondition(
  conditionChecker: () => boolean,
  timeoutMillis: number
): Promise<"完成" | "超时">;

/**
 * 排除子串
 * @param inputString 需裁剪字符串
 * @param substringToDelete 被裁减字符串
 * @param delimiter 分隔符
 * @returns 裁减后的字符串
 */
export function _ExcludeSubstring(
  inputString: string,
  substringToDelete: string,
  delimiter?: string
): string;

/**
 * 首字母大写
 * @param string
 * @returns string
 */
export function _CapitalizeFirstLetter(string: string): string;

/**
 * 合并对象  注意: 本函数会直接操作 A
 * @param {Object | Array} A
 * @param {Object | Array} B
 * @returns A&B || B
 */
export function _MergeObjects<T, T1>(A: T, B: T1): T & T1;

/**
 * 时间戳转换字符串
 * @param {Number | Date} time 时间戳或Date对象
 * @param {String} template 完整模板 -->  YYYY MM DD hh mm ss ms
 * @param {Boolean} pad 补0
 */
export function _TimeTransition(
  time: number | Date,
  template?: string,
  pad?: boolean
): string;

/**
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _ReadFile(src: string): Promise<string>;

/**
 * 从给定的href中提取名称部分
 * 该函数旨在处理URL字符串，并返回URL路径的最后一部分，去除查询参数
 *
 * @param {string} href - 待处理的URL字符串
 * @param {string} [defaultName="file"] - 默认的文件名，当无法提取时使用
 * @returns {string} URL路径的最后一部分，不包括查询参数
 */
export function _GetHrefName(href: string, defaultName?: string): string;

/**
 * 下载文件
 * @param {string} href 文件路径
 * @param {string} fileName 导出文件名
 */
export function _DownloadFile(href: string, fileName?: string): Promise<void>;

/**
 * 获取帧率
 * @param {(fps , frameTime)=>void} callback callback( 帧率 , 每帧时间 )
 * @param {Number} referenceNode 参考节点数量
 */
export function _GetFrameRate(
  callback: (fps: number, frameTime: number) => void,
  referenceNode: number
): void;

/**
 * 单位转换 12** -> **px
 * @param {string} width
 * @returns 对应的单位为px的宽
 */
export function _GetOtherSizeInPixels(width: string): string;

/**
 * 驼峰命名
 * @param {字符串} str
 * @param {是否删除分割字符} isRemoveDelimiter
 * @returns 'wq1wqw-qw2qw' -> 'wq1Wqw-Qw2Qw' / 'wqWqwQwQw'
 */
export function _ConvertToCamelCase(
  str: string,
  isRemoveDelimiter?: boolean
): string;

/**
 * 创建文件并下载
 * @param {BlobPart[]} content 文件内容
 * @param {string} fileName 文件名称
 * @param {BlobPropertyBag} options Blob 配置
 */
export function _CreateAndDownloadFile(
  content: BlobPart[],
  fileName: string,
  options?: BlobPropertyBag
): void;

/**
 * 获取url参数
 * @param {string} url
 * @returns {Object}
 */
export function _GetQueryParams(url: string): void;

/**
 * 生成一个UUID（通用唯一标识符）字符串
 * 可以选择性地在UUID前面添加前缀
 *
 * @param {string} prefix - 可选参数，要添加到UUID前面的前缀
 * @returns {string} 一个带有可选前缀的UUID字符串
 */
export function _GenerateUUID(prefix?: string): string;

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Debounce<T extends (...args: any) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;

/**
 * 节流
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Throttle<T extends (...args: any) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;

/**
 * 数据类型
 * @param {any} value
 * @returns string
 */
export function _DataType(
  value: string
):
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "array"
  | "null";

/**
 * 复制到剪贴板
 * @param {string} text
 */
export function _CopyToClipboard(text: string): Promise<void>;

/**
 * 格式化文件大小
 * @param {number} size
 * @returns string
 */
export function _FormatFileSize(size: number): string;

/**
 * 根据路径初始化目标对象
 * 如果路径中某个属性不存在，则会创建该属性及其所有父属性
 * 最终返回路径的最后一个属性对应的值或undefined（如果路径不存在）
 *
 * @param {Object} model - 要初始化的模型对象
 * @param {string} path - 属性路径，使用英文句点分隔
 * @returns {any} 路径的最后一个属性对应的值或undefined
 */
export function _InitTargetByPath(model: any, path: string): any;

/**
 * 根据路径获取目标对象
 * 该函数用于在给定的模型中，通过路径字符串来获取深层嵌套的目标对象如果路径中的某一部分不存在，则会创建一个新的对象（除非已经是路径的最后一部分）
 *
 * @param {Object} model - 包含要查询的数据的模型对象
 * @param {string} path - 用点分隔的路径字符串，表示要访问的对象属性路径
 * @returns {Object|undefined} - 返回目标对象，如果路径不存在则返回undefined
 */
export function _GetTargetByPath(model: any, path: string): any;

/**
 * 根据路径更新目标值
 *
 * 该函数通过一个点分隔的路径来更新一个对象中的嵌套属性值
 * 它使用了reduce方法来遍历路径数组，并在路径的终点设置新的值
 *
 * @param {Object} model - 包含要更新数据的模型对象
 * @param {string} path - 点分隔的字符串路径，指示如何到达目标属性
 * @param {*} value - 要设置的新值
 * @returns {*} - 返回更新后的模型对象中的值
 */
export function _UpdateTargetByPath(model: any, path: string, value: any): any;

/**
 * 使用 XMLHttpRequest 检查指定 URL 的连接状态
 *
 * 此函数通过发送一个 HEAD 请求来检查给定 URL 是否可访问 HEAD 请求仅请求文档头部信息，
 * 而不是整个页面，因此比 GET 或 POST 请求更快此方法常用于检查 URL 是否有效，以及服务器的响应时间等
 *
 * @param {string} url - 需要检查连接的 URL 地址
 * @returns {Promise} - 返回一个 Promise 对象，该对象在连接成功时解析，在连接失败时拒绝
 */
export function _CheckConnectionWithXHR(url: string): Promise<any>;

/**
 * 判断给定URL是否指向一个安全上下文
 *
 * 安全上下文是指通过一系列安全协议访问的资源，这些协议提供了数据的加密传输和身份验证
 * 本函数通过检查URL的协议前缀来判断是否属于安全上下文
 *
 * @param {string} url - 待检查的URL字符串
 * @returns {boolean} - 如果URL指向安全上下文，则返回true；否则返回false
 */
export function _IsSecureContext(url: string): boolean;

type FileExtensions = {
  image: string[];
  ppt: string[];
  word: string[];
  excel: string[];
  pdf: string[];
  text: string[];
  audio: string[];
  video: string[];
  archive: string[];
  code: string[];
  font: string[];
};
/**
 * 文件类型检查器类
 * 用于检查和验证文件的类型
 */
export class _FileTypeChecker {
  // 定义各种文件类型的文件扩展名
  static fileExtensions: FileExtensions;

  // 缓存文件扩展名的条目，以提高性能
  static cachedEntries: [keyof FileExtensions, string[]][];

  /**
   * 检查给定URL的文件类型
   * @param {string} url - 文件的URL
   * @returns {keyof _FileTypeChecker['fileExtensions'] | 'unknown'} - 返回文件类型或 "unknown"
   */
  static check(url: string): keyof FileExtensions | "unknown";
  /**
   * 检查给定URL的文件类型
   * @param {string} url - 文件的URL
   * @param {keyof _FileTypeChecker['fileExtensions']} [type] - 可选参数，指定要检查的文件类型
   * @returns {boolean} - 返回布尔值
   */
  static check(url: string, type: keyof FileExtensions): boolean;

  /**
   * 静态方法，用于解析地址信息
   * 该方法接受一个URL字符串，将其解析为一个包含地址详情的对象数组
   * 主要用于批量处理以逗号分隔的URL列表，为每个URL生成相应的名称和类型
   *
   * @param {string} url - 以逗号分隔的URL字符串，每个URL代表一个资源的位置
   * @returns {Array} - 包含每个URL及其相关信息（名称和类型）的对象数组
   */
  static parseAddresses(
    url: string
  ): { url: string; name: string; type: keyof FileExtensions | "unknown" }[];

  /**
   * 检查 MIME 类型是否与指定的模式匹配
   * @param {string} type - 要检查的 MIME 类型（如 "image/png"）
   * @param {string} [accept] - 可接受的 MIME 类型模式（如 "image/*, text/plain"）
   * @returns {boolean} - 如果类型匹配，则返回 true，否则返回 false
   */
  static matchesMimeType(type: string, accept?: string): boolean;

  /**
   * 检查URL是否具有任何指定的文件扩展名
   * @param {string} url - 文件的URL
   * @param {string[]} validExtensions - 有效文件扩展名的数组
   * @returns {boolean} - 如果URL具有任何指定的文件扩展名，则返回true，否则返回false
   */
  private static _checkExtension(
    url: string,
    validExtensions: string[]
  ): boolean;

  /**
   * 检测文件URL的类型
   * @param {string} url - 文件的URL
   * @returns {keyof _FileTypeChecker['fileExtensions'] | 'unknown'} - 如果URL与任何已知类型匹配，则返回文件类型，否则返回"unknown"
   */
  private static _detectFileType(url: string): keyof FileExtensions | "unknown";
}

/**
 * 旋转列表函数
 *
 * 该函数接受一个列表作为参数，并返回一个二维数组，其中每个内部数组都是原列表的一种旋转形式
 * 旋转列表的原理是将原列表分割成两部分，并将这两部分重新组合，形成一个新的列表
 *
 * @param list T[] - 需要旋转的列表，列表元素类型为泛型T
 * @returns T[][] - 返回一个二维数组，每个内部数组代表原列表的一种旋转形式
 */
export function _RotateList<T>(list: T[]): T[][];

/**
 * 克隆给定值的函数
 * 该函数尝试使用window.structuredClone方法进行深克隆，如果失败则使用自定义方法
 * @param {any} val - 需要克隆的值
 * @returns {any} - 克隆后的值
 */
export function _Clone<T>(val: T): T;
