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
export function _MergeObjects(A, B, visitedObjects = []) {
  const getType = (v) => (Array.isArray(v) ? "array" : typeof v);
  const TA = getType(A);
  const TB = getType(B);

  if (TA != TB) return B;
  if (visitedObjects.some((item) => item == B)) return B;

  if (TA == "object") {
    visitedObjects.push(A, B);
    for (const key in B) {
      if (Object.prototype.hasOwnProperty.call(B, key)) {
        const BC = B[key];
        const AC = A[key];
        const fianlValue = _MergeObjects(AC, BC, visitedObjects);
        A[key] = fianlValue;
      }
    }
    return A;
  } else if (TA == "array") {
    visitedObjects.push(A, B);
    B.forEach((item, index) => {
      const BC = item;
      const AC = A[index];
      const fianlValue = _MergeObjects(AC, BC, visitedObjects);
      A[index] = fianlValue;
    });
    return A;
  } else return B;
}

/**
 * 时间戳转换字符串
 * @param {Number | Date} time 时间戳或Date对象
 * @param {String} template 完整模板 -->  yyyy MM DD hh mm ss ms
 * @param {Boolean} pad 补0
 */
export function _TimeTransition(time, template, pad = true) {
  try {
    time = new Date(time);
  } catch (error) {
    console.error(error);
    return "";
  }
  const dictionary = {
    yyyy: "getFullYear",
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
 * 从给定的URL中提取文件名
 * 如果无法提取文件名，则返回默认的文件名
 *
 * @param {string} href - 包含文件路径的URL
 * @param {string} [defaultName="file"] - 默认的文件名，当无法提取时使用
 * @returns {string} 提取到的文件名或默认的文件名
 */
export function _GetHrefName(href, defaultName = "file") {
  // 分割URL并获取最后一个路径段，然后去除查询字符串，最后返回文件名或默认名
  return href.split("/").pop().split("?")[0] || defaultName;
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
