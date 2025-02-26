import {
  EXTENSION_TO_MIME,
  FILE_EXTENSIONS,
  FileType,
  WindowTarget,
} from "../Constant";

/**
 * 非null | undefined判断
 * @param value any
 * @returns boolean
 */
export function _NotNull(value: any) {
  return value !== null && value !== undefined;
}

/**
 * 是正常对象吗
 * @param {} value
 * @returns boolean
 */
export function _IsObject(value: any) {
  return !(value === null || typeof value !== "object" || Array.isArray(value));
}

/**
 * 寻找空闲时机执行传入方法
 * @param callback  需执行的方法
 */
export function _ExecuteWhenIdle(callback: Function) {
  if (typeof callback !== "function")
    return console.error("非函数：", callback);
  const loop = function (deadline: IdleDeadline) {
    if (deadline.didTimeout || deadline.timeRemaining() <= 0)
      requestIdleCallback(loop);
    else callback();
  };
  requestIdleCallback(loop);
}

/**
 * 等待条件满足
 * @param conditionChecker 条件检查器
 * @param timeoutMillis 超时毫秒数
 * @returns Promise<unknown>
 */
export function _WaitForCondition(
  conditionChecker: () => boolean,
  timeoutMillis: number
): Promise<"完成" | "超时"> {
  const startTime = +new Date();
  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      const nowTime = +new Date();
      if (nowTime - startTime >= timeoutMillis) return reject("超时");
      if (conditionChecker()) return resolve("完成");
      requestIdleCallback(checkCondition);
    };
    checkCondition();
  });
}

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
 * 首字母大写
 * @param str
 * @returns string
 */
export function _CapitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 合并对象  注意: 本函数会直接操作 A
 * @param {Object | Array} A
 * @param {Object | Array} B
 * @returns (A & B) | A | B | undefined
 */
export function _MergeObjects<T, T1>(
  A: T,
  B: T1,
  visitedObjects: [any, any][] = [],
  outTime = +new Date()
): (T & T1) | T | T1 | undefined {
  /** 疑似死循环 */
  if (outTime < +new Date() - 50) {
    console.error("_MergeObjects 合并异常：疑似死循环");
    return undefined;
  }

  const TA = _DataType(A);
  const TB = _DataType(B);

  if (TA != TB) return B;

  if (TA == "object" || TA == "array") {
    if (visitedObjects.some(([a, b]) => a == A && b == B)) return A;
    visitedObjects.push([A, B]);

    if (TA == "object") {
      for (const key in B) {
        if (Object.prototype.hasOwnProperty.call(B, key)) {
          const BC = B[key];
          /** @ts-ignore */
          const AC = A[key];
          const fianlValue = _MergeObjects(AC, BC, visitedObjects, outTime);
          /** @ts-ignore */
          A[key] = fianlValue;
        }
      }
      return A;
    } else if (TA == "array") {
      /** @ts-ignore */
      B.forEach((item, index) => {
        const BC = item;
        /** @ts-ignore */
        const AC = A[index];
        const fianlValue = _MergeObjects(AC, BC, visitedObjects, outTime);
        /** @ts-ignore */
        A[index] = fianlValue;
      });
      return A;
    }
  } else return B;
}

/**
 * 时间戳转换字符串
 * @param {Number | Date} time 时间戳或Date对象
 * @param {String} template 完整模板 -->  YYYY MM DD hh mm ss ms
 * @param {Boolean} pad 补0
 */
export function _TimeTransition(
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
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _ReadFile(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(src)
      .then((response) => resolve(response.text()))
      .catch((error) => {
        console.error("Error fetching :", error);
        reject(error);
      });
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
export function _GetHrefName(href: string, defaultName = "file") {
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
 * 下载文件
 * @param {string} href - 文件路径
 * @param {string} [fileName] - 导出文件名
 */
export function _DownloadFile(href: string, fileName?: string) {
  return new Promise((resolve, reject) => {
    try {
      fileName = fileName || _GetHrefName(href, "downloaded_file");
      fetch(href)
        .then((response) => {
          if (!response.ok) reject(`文件下载失败，状态码: ${response.status}`);
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = decodeURIComponent(fileName!);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(blob);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 获取帧率
 * @param {(fps , frameTime)=>void} callback callback( 帧率 , 每帧时间 )
 * @param {Number} referenceNode 参考节点数量
 */
export function _GetFrameRate(
  callback: (fps: number, frameTime: number) => void,
  referenceNode = 10
) {
  let t = 0,
    l = referenceNode;
  function loop() {
    if (l > 0) {
      l--;
      requestAnimationFrame(loop);
    } else {
      const time = +new Date() - t;
      const frameTime = time / referenceNode;
      const fps = 1000 / frameTime;
      callback(Number(fps.toFixed(2)), Number(frameTime.toFixed(2)));
    }
  }
  requestAnimationFrame(() => {
    t = +new Date();
    loop();
  });
}

/**
 * 驼峰命名
 * @param {字符串} str
 * @param {是否删除分割字符} isRemoveDelimiter
 * @returns 'wq1wqw-qw2qw' -> 'wq1Wqw-Qw2Qw' / 'wqWqwQwQw'
 */
export function _ConvertToCamelCase(str: string, isRemoveDelimiter?: boolean) {
  str = str.replace(/([^a-zA-Z][a-z])/g, (match) => match.toUpperCase());
  if (isRemoveDelimiter) return str.replace(/[^a-zA-Z]+/g, "");
  return str;
}

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
) {
  if (!options) {
    let type = fileName.replace(/^[^.]+./, "");
    type = type == fileName ? "text/plain" : "application/" + type;
    options = { type };
  }
  const bolb = new Blob(content, options);
  // 创建一个 URL，该 URL 可以用于在浏览器中引用 Blob 对象（例如，在 <a> 标签的 href 属性中）
  const url = URL.createObjectURL(bolb);
  // 你可以创建一个链接来下载这个 Blob 对象
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName; // 设置下载文件的名称
  document.body.appendChild(downloadLink); // 添加到文档中
  downloadLink.click(); // 模拟点击以开始下载
  document.body.removeChild(downloadLink); // 然后从文档中移除
  // 最后，别忘了撤销 Blob 对象的 URL，以释放资源
  URL.revokeObjectURL(url);
}

/**
 * 生成一个UUID（通用唯一标识符）字符串
 * 可以选择性地在UUID前面添加前缀
 *
 * @param {string} prefix - 可选参数，要添加到UUID前面的前缀
 * @returns {string} 一个带有可选前缀的UUID字符串
 */
export function _GenerateUUID(prefix = "") {
  return (
    prefix +
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0; // 随机生成一个0到15的数
      const v = c === "x" ? r : (r & 0x3) | 0x8; // 对于'y'位, v = (r & 0x3 | 0x8) 确保变体正确
      return v.toString(16); // 将数字转换为16进制
    })
  );
}

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = undefined; // 清除后重置为 null
    }, delay);
  };
}

/**
 * 节流
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = -Infinity;

  return function (...args) {
    const now = performance.now();
    if (now - lastCallTime > delay) {
      lastCallTime = now;
      try {
        fn(...args);
      } catch (error) {
        console.error("Throttled function execution failed:", error);
      }
    }
  };
}

/**
 * 数据类型
 * @param {any} value
 * @returns string
 */
export function _DataType(value: any) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

/**
 * 复制到剪贴板
 * @param {string} text
 */
export function _CopyToClipboard(text: string) {
  const handleSuccess = () => Promise.resolve();
  const handleError = (error: string) => {
    console.error(error);
    return Promise.reject(error);
  };

  /** 最新方式 */
  function writeText() {
    return navigator.clipboard
      .writeText(text)
      .then(handleSuccess)
      .catch(handleError);
  }
  /** 旧方式 - createRange */
  function createRange() {
    const div = document.createElement("div");
    div.innerText = text;
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNodeContents(div);
    const selection = window.getSelection();

    let isFinished = false;
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);

      isFinished = document.execCommand("copy");
    }
    document.body.removeChild(div);
    return isFinished ? Promise.resolve() : Promise.reject();
  }
  /** 旧方式 - execCommand */
  function execCommand() {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, text.length); // 对于移动设备

    let isFinished = false;

    /** aria-hidden 及 tabindex 可能会影响聚焦元素 */
    if (document.activeElement === textarea)
      isFinished = document.execCommand("Copy", true);

    document.body.removeChild(textarea);
    return isFinished ? Promise.resolve() : Promise.reject();
  }

  function old() {
    return createRange()
      .then(handleSuccess)
      .catch(() => {
        execCommand()
          .then(handleSuccess)
          .catch(() => handleError("复制方式尽皆失效"));
      });
  }

  if (navigator.clipboard) return writeText().catch(old);
  return old();
}

/**
 * 根据路径初始化目标对象
 * 如果路径中某个属性不存在，则会创建该属性及其所有父属性
 * 最终返回路径的最后一个属性对应的值或undefined（如果路径不存在）
 *
 * @param {Object} model - 要初始化的模型对象
 * @param {string} path - 属性路径，使用英文句点分隔
 * @returns {any} 路径的最后一个属性对应的值或undefined
 */
export function _InitTargetByPath(model: any, path: string): any {
  const arr = path.split(".");
  return arr.reduce((prev, curr, index) => {
    if (!(curr in prev)) {
      if (index === arr.length - 1) prev[curr] = undefined;
      else prev[curr] = {};
    }
    return prev[curr];
  }, model);
}
/**
 * 根据路径获取目标对象
 * 该函数用于在给定的模型中，通过路径字符串来获取深层嵌套的目标对象如果路径中的某一部分不存在，则会创建一个新的对象（除非已经是路径的最后一部分）
 *
 * @param {Object} model - 包含要查询的数据的模型对象
 * @param {string} path - 用点分隔的路径字符串，表示要访问的对象属性路径
 * @returns {Object|undefined} - 返回目标对象，如果路径不存在则返回undefined
 */
export function _GetTargetByPath(model: any, path: string): any {
  const arr = path.split(".");
  return arr.reduce((prev, curr, index) => {
    if (prev.hasOwnProperty(curr)) return prev[curr];
    return (prev[curr] = index == arr.length - 1 ? undefined : {});
  }, model);
}
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
export function _UpdateTargetByPath(model: any, path: string, value: any): any {
  const arr = path.split(".");
  return arr.reduce((prev, curr, index) => {
    if (index === arr.length - 1) prev[curr] = value;
    return prev[curr];
  }, model);
}

/**
 * 使用 XMLHttpRequest 检查指定 URL 的连接状态
 *
 * 此函数通过发送一个 HEAD 请求来检查给定 URL 是否可访问 HEAD 请求仅请求文档头部信息，
 * 而不是整个页面，因此比 GET 或 POST 请求更快此方法常用于检查 URL 是否有效，以及服务器的响应时间等
 *
 * @param {string} url - 需要检查连接的 URL 地址
 * @returns {Promise} - 返回一个 Promise 对象，该对象在连接成功时解析，在连接失败时拒绝
 */
export function _CheckConnectionWithXHR(url: string) {
  return new Promise((resolve, reject) => {
    // 前置校验：确保 URL 合法
    if (typeof url !== "string" || url.trim() === "" || !url.includes("://")) {
      reject(new Error("Invalid URL: Must be a non-empty string"));
      return;
    }

    // 显式处理浏览器兼容性错误（如无效协议或非法字符）
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("HEAD", url, true);
    } catch (error) {
      reject(new Error(`Invalid URL format: ${(error as Error).message}`));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true);

    // 统一错误处理逻辑
    const handleError = (event: ProgressEvent<EventTarget>) => {
      reject(new Error(`Request failed: ${event.type}`));
    };

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        // 兼容性处理：status=0 可能是跨域或网络错误
        if (xhr.status === 0) {
          reject(new Error("Network error or CORS blocked"));
        } else if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      }
    };

    // 绑定所有可能的错误事件
    xhr.onerror = handleError; // 网络层错误（如 DNS 解析失败）
    xhr.onabort = handleError; // 请求被中止
    xhr.ontimeout = handleError; // 超时

    try {
      xhr.send();
    } catch (error) {
      reject(new Error(`Request send failed: ${(error as Error).message}`));
    }
  });
}

/**
 * 判断给定URL是否指向一个安全上下文
 *
 * 安全上下文是指通过一系列安全协议访问的资源，这些协议提供了数据的加密传输和身份验证
 * 本函数通过检查URL的协议前缀来判断是否属于安全上下文
 *
 * @param {string} url - 待检查的URL字符串
 * @returns {boolean} - 如果URL指向安全上下文，则返回true；否则返回false
 */
export function _IsSecureContext(url: string) {
  // 定义一个包含安全协议前缀的数组
  // 这里列出的协议代表了数据在传输过程中是加密的，从而保护了数据的机密性和完整性
  const secureProtocols = [
    "https:", // HTTPS协议，用于安全地浏览网页
    "wss:", // WebSocket Secure协议，用于安全的WebSocket通信
    "ftps:", // FTP Secure协议，用于安全的文件传输
    "sftp:", // SSH File Transfer Protocol，通过SSH安全地传输文件
    "smpts:", // Secure SMTP协议，用于安全地发送邮件
    "smtp+tls:", // SMTP协议结合STARTTLS扩展，用于升级到安全连接
    "imap+tls:", // IMAP协议结合STARTTLS扩展，用于安全地访问邮件
    "pop3+tls:", // POP3协议结合STARTTLS扩展，用于安全地接收邮件
    "rdp:", // Remote Desktop Protocol，用于安全的远程桌面连接
    "vpn:", // VPN协议，用于创建安全的网络连接
  ];

  // 遍历安全协议数组，检查给定URL是否以任一安全协议前缀开始
  // 使用startsWith方法来判断URL是否使用了安全协议
  // 如果找到匹配的安全协议前缀，则返回true，表示URL指向安全上下文；否则返回false
  return secureProtocols.some((protocol) => url.startsWith(protocol));
}

/**
 * 文件类型检查器类
 * 用于检查文件URL的类型
 */
export class _FileTypeChecker {
  // 缓存文件扩展名的条目，以提高性能
  private static cachedEntries = Object.entries(FILE_EXTENSIONS) as [
    FileType,
    string[]
  ][];

  constructor() {
    if (new.target === _FileTypeChecker) {
      throw new Error("请直接使用静态方法，而不是实例化此类");
    }
  }

  /**
   * 检查给定URL的文件类型
   * @param {string} url - 文件的URL
   * @param {string} [type] - 可选参数，指定要检查的文件类型
   * @returns {string} - 如果URL与指定类型或任何已知类型匹配，则返回文件类型，否则返回"unknown"
   */
  static check(url: string): FileType | "unknown";
  static check(url: string, type: FileType): boolean;
  static check(url: string, type?: FileType) {
    // 确保提供的URL是字符串且非空
    if (!url || typeof url !== "string") {
      console.error("Invalid URL provided");
      return type ? false : "unknown";
    }

    // 将URL转换为小写，以确保文件扩展名匹配不区分大小写
    const lowerCaseUrl = _GetHrefName(url).toLowerCase();

    // 如果指定了文件类型，则检查URL是否具有该类型的任何文件扩展名
    if (type) {
      // 确保指定的文件类型是已知的
      if (!FILE_EXTENSIONS.hasOwnProperty(type)) {
        console.error(`Unknown file type: ${type}`);
        return "unknown";
      }
      const extensions = FILE_EXTENSIONS[type];
      return _FileTypeChecker._checkExtension(lowerCaseUrl, extensions);
    }

    // 如果未指定文件类型，则检测URL属于哪种文件类型
    return _FileTypeChecker._detectFileType(lowerCaseUrl);
  }

  /**
   * 静态方法，用于解析地址信息
   * 该方法接受一个URL字符串，将其解析为一个包含地址详情的对象数组
   * 主要用于批量处理以逗号分隔的URL列表，为每个URL生成相应的名称和类型
   *
   * @param {string} url - 以逗号分隔的URL字符串，每个URL代表一个资源的位置
   * @returns {Array} - 包含每个URL及其相关信息（名称和类型）的对象数组
   */
  static parseAddresses(url: string) {
    // 确保提供的URL是字符串且非空
    if (!url || typeof url !== "string") {
      console.error("Invalid URL provided");
      return [];
    }

    // 分割URL字符串并映射每个URL到包含其详细信息的对象
    return url.split(",").map((url) => {
      // 从URL中提取名称
      const name = _GetHrefName(url);
      // 检查URL的类型
      const type = this.check(url);
      // 返回包含URL、名称和类型的对象
      return { url, name, type };
    });
  }

  /**
   * 检查 MIME 类型是否与指定的模式匹配
   * @param {string} type - 要检查的 MIME 类型（如 "image/png"）
   * @param {string} [accept] - 可接受的 MIME 类型模式（如 "image/*, text/plain"）
   * @returns {boolean} - 如果类型匹配，则返回 true，否则返回 false
   */
  static matchesMimeType(type: string, accept?: string) {
    /** 如果 accept 为空，则默认为 true */
    if (!accept) return true;
    if (typeof type !== "string" || typeof accept !== "string") return false;

    // 标准化类型和接受模式
    const normalizedType = _FileTypeChecker._normalizeType(type);
    const mimePatterns = accept
      .split(",")
      .map((pattern) => _FileTypeChecker._normalizeType(pattern.trim()));

    // 拆分主/子类型
    const [typeMain, typeSub = "*"] = normalizedType.split("/");

    return mimePatterns.some((pattern) => {
      const [patternMain, patternSub = "*"] = pattern.split("/");

      // 主类型匹配逻辑
      const mainMatch =
        patternMain === "*" || typeMain === "*" || patternMain === typeMain;

      // 子类型匹配逻辑
      const subMatch =
        patternSub === "*" || typeSub === "*" || patternSub === typeSub;

      return mainMatch && subMatch;
    });
  }

  /**
   * 类型标准化函数
   * 该函数旨在将文件类型或MIME类型字符串转换为标准格式
   * 主要处理三种情况：带扩展名的字符串、简写格式的类型以及已标准格式的类型
   *
   * @param {string} type - 文件类型或MIME类型字符串
   * @returns {string} 标准化的MIME类型字符串，如果无法识别则返回原始输入
   */
  static _normalizeType(type: string) {
    // 处理扩展名（如 .mp3）
    if (type.startsWith(".") && !type.includes("/")) {
      return EXTENSION_TO_MIME[type.toLowerCase() as ".mp3"] || type;
    }

    // 处理简写格式（如 "image" 转换为 "image/*"）
    if (!type.includes("/")) {
      return `${type}/*`;
    }

    // 返回原始输入，因为它已经是标准格式
    return type;
  }

  /**
   * 检查URL是否具有任何指定的文件扩展名
   * @param {string} url - 文件的URL
   * @param {string[]} validExtensions - 有效文件扩展名的数组
   * @returns {boolean} - 如果URL具有任何指定的文件扩展名，则返回true，否则返回false
   */
  static _checkExtension(url: string, validExtensions: string[]) {
    return validExtensions.some((extension) => url.endsWith(extension));
  }

  /**
   * 检测文件URL的类型
   * @param {string} url - 文件的URL
   * @returns {string} - 如果URL与任何已知类型匹配，则返回文件类型，否则返回"unknown"
   */
  static _detectFileType(url: string) {
    for (const [type, extensions] of _FileTypeChecker.cachedEntries) {
      if (extensions.some((extension) => url.endsWith(extension))) {
        return type;
      }
    }
    return "unknown";
  }
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
export function _RotateList<T>(list: T[]) {
  // 使用map函数遍历列表，对于列表中的每个元素（这里不需要元素本身，所以用_表示）
  // i表示当前元素的索引，利用这个索引对列表进行分割和重组
  return list.map((_, i) => {
    // 将当前索引i之后的元素与从列表开头到索引i之前的元素拼接成一个新的列表
    // 这样做可以实现列表的旋转效果
    return list.slice(i).concat(list.slice(0, i));
  });
}

/**
 * 克隆给定值的函数
 * 该函数尝试使用window.structuredClone方法进行深克隆，如果失败则使用自定义方法
 * @param {any} val - 需要克隆的值
 * @returns {any} - 克隆后的值
 */
export function _Clone<T>(val: T) {
  // 保存原始的structuredClone方法引用
  const oldClone = window.structuredClone;

  // 定义一个新的克隆方法，用于处理非对象或null值，以及对象的合并
  const newClone = (val: T) => {
    // 如果val为null或不是对象，则直接返回val
    if (val === null || typeof val !== "object") return val;
    // 使用_MergeObjects函数合并对象，如果是数组则传递空数组作为第一个参数，否则传递空对象
    return _MergeObjects(Array.isArray(val) ? [] : {}, val);
  };

  // 尝试使用原始的structuredClone方法或自定义的newClone方法进行克隆
  try {
    // 如果oldClone存在，则使用oldClone方法进行克隆，否则使用newClone方法
    return oldClone ? oldClone(val) : newClone(val);
  } catch (error) {
    // 使用日志系统或其他方式记录错误信息
    console.error("structuredClone error:", error);
    // @ts-ignore 如果oldClone存在且之前的尝试失败，则再次使用newClone方法尝试克隆
    return oldClone && newClone(val);
  }
}

/**
 * 管理通过键值对打开的窗口
 */
export class _KeyedWindowManager {
  // 存储键与对应窗口的Map
  private static keys = new Map<string, Window>();

  /**
   * 构造函数
   * @throws 如果尝试实例化该类，则抛出错误，因为应该使用静态方法
   */
  constructor() {
    if (new.target === _KeyedWindowManager) {
      throw new Error("请直接使用静态方法，而不是实例化此类");
    }
  }

  /**
   * 根据键打开或聚焦窗口
   * @param key 窗口的唯一键
   * @param url 要打开的URL
   * @param target 窗口的目标
   * @param windowFeatures 新窗口的特性
   * @returns 返回已打开或新打开的窗口
   */
  static open(
    key: string,
    url?: string | URL,
    target?: WindowTarget,
    windowFeatures?: string
  ) {
    const win = this.keys.get(key);
    if (win && !win.closed) {
      win.focus();
      return win;
    } else {
      const newWin = window.open(url, target, windowFeatures);
      if (newWin) {
        this.keys.set(key, newWin);
        return newWin;
      } else {
        console.error("window.open failed: 可能是浏览器阻止了弹出窗口");
        this.keys.delete(key);
      }
    }
  }

  /**
   * 检查指定键的窗口是否打开
   * @param key 窗口的唯一键
   * @returns 如果窗口打开则返回true，否则返回false
   */
  static isOpen(key: string): boolean {
    const window = this.keys.get(key);
    if (window?.closed) this.keys.delete(key);
    return this.keys.has(key);
  }

  /**
   * 获取与指定键关联的窗口
   * @param key 窗口的唯一键
   * @returns 返回对应的窗口，如果窗口已关闭则返回undefined
   */
  static getWindow(key: string) {
    if (this.isOpen(key)) return this.keys.get(key);
  }

  /**
   * 关闭与指定键关联的窗口
   * @param key 窗口的唯一键
   */
  static close(key: string): void {
    const win = this.keys.get(key);
    if (win) {
      win.close();
      this.keys.delete(key);
    }
  }

  /**
   * 关闭所有打开的窗口并清空Map
   */
  static closeAll(): void {
    this.keys.forEach((window, key) => window.close());
    this.keys.clear();
  }
}

/**
 * 将不同格式的数据转换为图像 URL
 * 此函数支持多种类型的数据输入，包括字符串（Base64/Data URL）、ArrayBuffer、Uint8Array和File，
 * 并尝试将这些数据转换为指定MIME类型的图像URL
 *
 * @param data - 输入数据，可以是字符串（Base64/Data URL）、ArrayBuffer、Uint8Array或File实例
 * @param mimeType - 期望的图像MIME类型，默认为'image/png'
 * @returns 成功时返回图像的URL，失败时返回null
 */
export function _Danger_ConvertDataToImageUrl(
  data: string | ArrayBuffer | Uint8Array | File,
  mimeType: string = "image/png"
) {
  try {
    let uint8Array: Uint8Array;
    let resolvedMimeType = mimeType;

    // 处理 File 类型
    if (data instanceof File) {
      return URL.createObjectURL(data);
    }

    // 处理字符串类型（Base64/Data URL）
    else if (typeof data === "string") {
      let base64Data = data;

      // 匹配 Data URL 格式（支持任意MIME类型）
      const dataUrlMatch = base64Data.match(/^data:([^;]*)(;base64)?,(.*)$/i);

      if (dataUrlMatch) {
        // 验证是否包含base64声明
        if (!dataUrlMatch[2]) {
          throw new Error("无效的数据 URL：缺少 base64 编码声明");
        }

        // 提取并处理MIME类型
        resolvedMimeType = dataUrlMatch[1] || resolvedMimeType;
        base64Data = dataUrlMatch[3];

        if (!base64Data) {
          throw new Error("数据 URL 包含空有效负载");
        }
      }

      // 清理非Base64标准字符（包括空格、换行等）
      base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");

      // 解码Base64字符串
      const binaryString = atob(base64Data);
      uint8Array = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
    }

    // 处理ArrayBuffer类型
    else if (data instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(data);
    }

    // 处理Uint8Array类型
    else if (data instanceof Uint8Array) {
      uint8Array = data;
    }

    // 无效数据类型
    else {
      throw new Error(
        "不支持的数据类型。应为 Base64 字符串、ArrayBuffer 或 Uint8Array"
      );
    }

    // 创建Blob对象（自动处理MIME类型）
    const blob = new Blob([uint8Array], { type: resolvedMimeType });

    // 生成临时URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(
      "数据到 ImageURL 的转换失败：",
      (error as Error).message,
      (error as Error).stack || "没有可用的堆栈跟踪"
    );
    return null;
  }
}
