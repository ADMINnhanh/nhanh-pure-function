/**
 * 非null | undefined判断
 * @param value any
 * @returns boolean
 */
export function _NotNull(value) {
  return value !== null && value !== undefined;
}

/**
 * 是正常对象吗
 * @param {} value
 * @returns boolean
 */
export function _IsObject(value) {
  return !(value === null || typeof value !== "object" || Array.isArray(value));
}

/**
 * 寻找空闲时机执行传入方法
 * @param callback  需执行的方法
 */
export function _ExecuteWhenIdle(callback) {
  if (typeof callback !== "function")
    return console.error("非函数：", callback);
  const loop = function (deadline) {
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
export function _WaitForCondition(conditionChecker, timeoutMillis) {
  const startTime = new Date() - 0;
  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      const nowTime = new Date() - 0;
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
  inputString,
  substringToDelete,
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
export function _CapitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 合并对象  注意: 本函数会直接操作 A
 * @param {Object | Array} A
 * @param {Object | Array} B
 * @returns A&B || B
 */
export function _MergeObjects(
  A,
  B,
  visitedObjects = [],
  outTime = +new Date()
) {
  /** 疑似死循环 */
  if (outTime < +new Date() - 300) {
    console.error("_MergeObjects 合并异常：疑似死循环");
    return null;
  }

  const getType = (v) => (Array.isArray(v) ? "array" : typeof v);
  const TA = getType(A);
  const TB = getType(B);

  if (TA != TB) return B;

  if (TA == "object" || TA == "array") {
    if (visitedObjects.some(([a, b]) => a == A && b == B)) return A;
    visitedObjects.push([A, B]);

    if (TA == "object") {
      for (const key in B) {
        if (Object.prototype.hasOwnProperty.call(B, key)) {
          const BC = B[key];
          const AC = A[key];
          const fianlValue = _MergeObjects(AC, BC, visitedObjects, outTime);
          A[key] = fianlValue;
        }
      }
      return A;
    } else if (TA == "array") {
      B.forEach((item, index) => {
        const BC = item;
        const AC = A[index];
        const fianlValue = _MergeObjects(AC, BC, visitedObjects, outTime);
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
  time,
  template = "YYYY-MM-DD hh:mm:ss",
  pad = true
) {
  try {
    time = new Date(time);
  } catch (error) {
    console.error(error);
    return "";
  }
  const dictionary = {
    YYYY: "getFullYear",
    MM: "getMonth",
    DD: "getDate",
    hh: "getHours",
    mm: "getMinutes",
    ss: "getSeconds",
    ms: (num) => +num % 1000,
  };
  for (const key in dictionary) {
    if (Object.hasOwnProperty.call(dictionary, key)) {
      if (new RegExp(key).test(template)) {
        let value,
          fun = dictionary[key];

        if (typeof fun == "function") value = fun(time);
        else value = time[fun]();

        if (key == "MM") value++;

        if (pad) value = String(value).padStart(2, "0");

        template = template.replace(key, value);
      }
    }
  }
  return template;
}

/**
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _ReadFile(src) {
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
export function _GetHrefName(href, defaultName = "file") {
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
export async function _DownloadFile(href, fileName) {
  try {
    const response = await fetch(href); // 获取文件
    if (!response.ok) throw new Error("文件下载失败");

    const blob = await response.blob(); // 将响应转换为 Blob 对象
    const url = URL.createObjectURL(blob); // 创建文件 URL

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || _GetHrefName(href, "image");

    // 临时将 a 标签添加到 DOM，然后触发点击事件，最后移除
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 释放 URL 对象
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载文件时发生错误:", error);
  }
}

/**
 * 获取帧率
 * @param {(fps , frameTime)=>void} callback callback( 帧率 , 每帧时间 )
 * @param {Number} referenceNode 参考节点数量
 */
export function _GetFrameRate(callback, referenceNode = 10) {
  let t,
    l = referenceNode;
  function loop() {
    if (l > 0) {
      l--;
      requestAnimationFrame(loop);
    } else {
      const time = new Date() - t;
      const frameTime = time / referenceNode;
      const fps = 1000 / frameTime;
      callback(Number(fps.toFixed(2)), Number(frameTime.toFixed(2)));
    }
  }
  requestAnimationFrame(() => {
    t = new Date() - 0;
    loop();
  });
}

/**
 * 单位转换 12** -> **px
 * @param {string} width
 * @returns 对应的单位为px的宽
 */
export function _GetOtherSizeInPixels(width) {
  if (/px/.test(width)) return width;
  const dom = document.createElement("div");
  dom.style.width = width;
  document.body.appendChild(dom);
  width = parseFloat(window.getComputedStyle(dom).width);
  document.body.removeChild(dom);
  return width;
}

/**
 * 驼峰命名
 * @param {字符串} str
 * @param {是否删除分割字符} isRemoveDelimiter
 * @returns 'wq1wqw-qw2qw' -> 'wq1Wqw-Qw2Qw' / 'wqWqwQwQw'
 */
export function _ConvertToCamelCase(str, isRemoveDelimiter) {
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
export function _CreateAndDownloadFile(content, fileName, options) {
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
 * 获取url参数
 * @param {string} url
 * @returns {Object}
 */
export function _GetQueryParams(url) {
  const queryString = url.split("?")[1] || "";
  const params = new URLSearchParams(queryString);
  const result = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
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
export function _Debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Throttle(fn, delay) {
  let timer;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 数据类型
 * @param {any} value
 * @returns string
 */
export function _DataType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

/**
 * 复制到剪贴板
 * @param {string} text
 */
export function _CopyToClipboard(text) {
  const handleSuccess = () => Promise.resolve();
  const handleError = (error) => {
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
 * 格式化文件大小
 * @param {number} size
 * @returns string
 */
export function _FormatFileSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let unitIndex = 0;
  while (size > 1024) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
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
export function _InitTargetByPath(model, path) {
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
export function _GetTargetByPath(model, path) {
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
export function _UpdateTargetByPath(model, path, value) {
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
export function _CheckConnectionWithXHR(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // 发送 HEAD 请求
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(xhr);
      }
    };
    xhr.onerror = reject;
    xhr.send();
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
export function _IsSecureContext(url) {
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
  // 定义各种文件类型的文件扩展名
  static fileExtensions = {
    image: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".tiff",
      ".svg",
      ".heif",
      ".heic",
      ".ico",
      ".raw",
      ".jfif",
    ],
    ppt: [".ppt", ".pptx"],
    word: [".doc", ".docx"],
    excel: [".xls", ".xlsx"],
    pdf: [".pdf"],
    text: [".txt", ".csv"],
    audio: [
      ".mp3",
      ".wav",
      ".ogg",
      ".flac",
      ".aac",
      ".wma",
      ".m4a",
      ".alac",
      ".ape",
      ".opus",
      ".amr",
      ".ra",
    ],
    video: [
      ".mp4",
      ".avi",
      ".mkv",
      ".mov",
      ".wmv",
      ".flv",
      ".webm",
      ".mpg",
      ".mpeg",
      ".3gp",
      ".vob",
      ".ogv",
      ".m4v",
      ".ts",
      ".rm",
      ".rmvb",
    ],
    archive: [
      ".zip",
      ".rar",
      ".tar",
      ".gz",
      ".bz2",
      ".xz",
      ".7z",
      ".tar.gz",
      ".tar.bz2",
      ".tar.xz",
    ],
    code: [".js", ".ts", ".py", ".java", ".cpp", ".c"],
    font: [".woff", ".woff2", ".ttf", ".otf"],
  };

  // 缓存文件扩展名的条目，以提高性能
  static cachedEntries = Object.entries(_FileTypeChecker.fileExtensions);

  /**
   * 检查给定URL的文件类型
   * @param {string} url - 文件的URL
   * @param {string} [type] - 可选参数，指定要检查的文件类型
   * @returns {string} - 如果URL与指定类型或任何已知类型匹配，则返回文件类型，否则返回"unknown"
   * @throws {Error} - 如果URL无效或指定的文件类型未知，则抛出错误
   */
  static check(url, type) {
    // 确保提供的URL是字符串且非空
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL provided");
    }

    // 将URL转换为小写，以确保文件扩展名匹配不区分大小写
    const lowerCaseUrl = _GetHrefName(url).toLowerCase();

    // 如果指定了文件类型，则检查URL是否具有该类型的任何文件扩展名
    if (type) {
      // 确保指定的文件类型是已知的
      if (!_FileTypeChecker.fileExtensions.hasOwnProperty(type)) {
        throw new Error(`Unknown file type: ${type}`);
      }
      const extensions = _FileTypeChecker.fileExtensions[type];
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
   * @throws {Error} - 如果提供的URL为空或不是字符串，则抛出错误
   */
  static parseAddresses(url) {
    // 确保提供的URL是字符串且非空
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL provided");
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
   * 检查URL是否具有任何指定的文件扩展名
   * @param {string} url - 文件的URL
   * @param {string[]} validExtensions - 有效文件扩展名的数组
   * @returns {boolean} - 如果URL具有任何指定的文件扩展名，则返回true，否则返回false
   */
  static _checkExtension(url, validExtensions) {
    return validExtensions.some((extension) => url.endsWith(extension));
  }

  /**
   * 检测文件URL的类型
   * @param {string} url - 文件的URL
   * @returns {string} - 如果URL与任何已知类型匹配，则返回文件类型，否则返回"unknown"
   */
  static _detectFileType(url) {
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
export function _RotateList(list) {
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
export function _Clone(val) {
  // 保存原始的structuredClone方法引用
  const oldClone = window.structuredClone;

  // 定义一个新的克隆方法，用于处理非对象或null值，以及对象的合并
  const newClone = (val) => {
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
    // 如果oldClone存在且之前的尝试失败，则再次使用newClone方法尝试克隆
    return oldClone && newClone(val);
  }
}
