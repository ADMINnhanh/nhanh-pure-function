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
  template: string,
  pad?: boolean
): string;

/**
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _ReadFile(src: string): Promise<string>;

/**
 * 从给定的URL中提取文件名
 * 如果无法提取文件名，则返回默认的文件名
 *
 * @param {string} href - 包含文件路径的URL
 * @param {string} [defaultName="file"] - 默认的文件名，当无法提取时使用
 * @returns {string} 提取到的文件名或默认的文件名
 */
export function _GetHrefName(href: string, defaultName = "file"): string;

/**
 * 下载文件
 * @param {string} href 文件路径
 * @param {string} fileName 导出文件名
 */
export function _DownloadFile(href: string, fileName?: string): void;

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
export function _Debounce<T extends Function>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;

/**
 * 节流
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Throttle<T extends Function>(
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
