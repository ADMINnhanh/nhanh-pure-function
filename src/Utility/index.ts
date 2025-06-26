import { WindowTarget } from "../Constant";
import { _Format_HrefName } from "../Format";
import { _Valid_DataType } from "../Valid";

/**
 * 寻找空闲时机执行传入方法
 * @param callback  需执行的方法
 */
export function _Utility_ExecuteWhenIdle(callback: Function) {
  if (typeof callback !== "function")
    return console.error("非函数：", callback);
  const loop = function _Utility(deadline: IdleDeadline) {
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
export function _Utility_WaitForCondition(
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
export function _Utility_ExcludeSubstring(
  inputString: string,
  substringToDelete: string,
  delimiter = ","
) {
  const regex = new RegExp(
    `(^|${delimiter})${substringToDelete}(${delimiter}|$)`,
    "g"
  );
  return inputString.replace(regex, function _Utility($0, $1, $2) {
    return $1 === $2 ? delimiter : "";
  });
}

/**
 * 合并对象  注意: 本函数会直接操作 A
 * @param {Object | Array} A
 * @param {Object | Array} B
 * @returns (A & B) | A | B | undefined
 */
export function _Utility_MergeObjects<T, T1>(
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

  const TA = _Valid_DataType(A);
  const TB = _Valid_DataType(B);

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
          const fianlValue = _Utility_MergeObjects(
            AC,
            BC,
            visitedObjects,
            outTime
          );
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
        const fianlValue = _Utility_MergeObjects(
          AC,
          BC,
          visitedObjects,
          outTime
        );
        /** @ts-ignore */
        A[index] = fianlValue;
      });
      return A;
    }
  } else return B;
}

/**
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _Utility_ReadFile(src: string): Promise<string> {
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
 * 下载文件
 * @param {string} href - 文件路径
 * @param {string} [fileName] - 导出文件名
 */
export function _Utility_DownloadFile(href: string, fileName?: string) {
  return new Promise((resolve, reject) => {
    try {
      fileName = fileName || _Format_HrefName(href, "downloaded_file");
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
export function _Utility_GetFrameRate(
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
 * 创建文件并下载
 * @param {BlobPart[]} content 文件内容
 * @param {string} fileName 文件名称
 * @param {BlobPropertyBag} options Blob 配置
 */
export function _Utility_CreateAndDownloadFile(
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
export function _Utility_GenerateUUID(prefix = "") {
  return (
    prefix +
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function _Utility(c) {
        const r = (Math.random() * 16) | 0; // 随机生成一个0到15的数
        const v = c === "x" ? r : (r & 0x3) | 0x8; // 对于'y'位, v = (r & 0x3 | 0x8) 确保变体正确
        return v.toString(16); // 将数字转换为16进制
      }
    )
  );
}

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function _Utility_Debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  return function _Utility(...args) {
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
export function _Utility_Throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = -Infinity;

  return function _Utility(...args) {
    const now = performance.now();
    if (now - lastCallTime > delay) {
      lastCallTime = now;
      try {
        fn(...args);
      } catch (error) {
        console.error("Throttled function _Utilityexecution failed:", error);
      }
    }
  };
}

/**
 * 复制到剪贴板
 * @param {string} text
 */
export function _Utility_CopyToClipboard(text: string) {
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
export function _Utility_InitTargetByPath(model: any, path: string): any {
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
export function _Utility_GetTargetByPath(model: any, path: string): any {
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
export function _Utility_UpdateTargetByPath(
  model: any,
  path: string,
  value: any
): any {
  const arr = path.split(".");
  return arr.reduce((prev, curr, index) => {
    if (index === arr.length - 1) prev[curr] = value;
    return prev[curr];
  }, model);
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
export function _Utility_RotateList<T>(list: T[]) {
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
export function _Utility_Clone<T>(val: T) {
  // 保存原始的structuredClone方法引用
  const oldClone = window.structuredClone;

  // 定义一个新的克隆方法，用于处理非对象或null值，以及对象的合并
  const newClone = (val: T) => {
    // 如果val为null或不是对象，则直接返回val
    if (val === null || typeof val !== "object") return val;
    // 使用_MergeObjects函数合并对象，如果是数组则传递空数组作为第一个参数，否则传递空对象
    return _Utility_MergeObjects(Array.isArray(val) ? [] : {}, val) as
      | T
      | undefined;
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
export class _Utility_KeyedWindowManager {
  // 存储键与对应窗口的Map
  private static keys = new Map<string, Window>();

  /** 请使用静态方法 */
  private constructor() {}

  /** 添加已有窗口 */
  static add(key: string, win: Window) {
    this.keys.set(key, win);
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
export function _Utility_ConvertDataToImageUrl(
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
          return console.error("无效的数据 URL：缺少 base64 编码声明");
        }

        // 提取并处理MIME类型
        resolvedMimeType = dataUrlMatch[1] || resolvedMimeType;
        base64Data = dataUrlMatch[3];

        if (!base64Data) {
          return console.error("数据 URL 包含空有效负载");
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
      return console.error(
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

/**
 * 函数装饰器，用于测量并记录另一个函数的执行时间
 * @param func 要测量执行时间的函数
 * @param level 耗时与颜色对应的数组，用于在控制台中着色显示
 * @param maxHistory 保留的最大历史记录数，默认为30
 */
export function _Utility_TimeConsumption(
  func: Function,
  level: [number, string][],
  maxHistory = 30
) {
  // 检查参数类型
  if (typeof func !== "function") {
    return console.error("第一个参数必须是一个函数。");
  }
  if (!Array.isArray(level)) {
    return console.error("第二个参数必须是一个数组。");
  }

  // 在类中添加属性
  let drawTimes: number[] = [];
  // 保留最近x次的耗时数据
  /** 平均耗时 */
  let avgTime: number = 0;

  // 定义一个辅助函数来确定颜色
  const getColor = (elapsedTime: number, level: [number, string][]) => {
    for (const [time, color] of level) {
      if (elapsedTime >= time) {
        return color;
      }
    }
    return "black"; // 默认颜色
  };

  // 返回一个闭包函数，用于执行原始函数并测量其执行时间
  return function _Utility(...args: any[]) {
    // 记录开始时间
    const startTime = performance.now();

    // 执行函数
    const result = func(...args);

    // 记录结束时间并计算本次重绘的耗时
    const elapsedTime = performance.now() - startTime;

    // 将本次耗时添加到 drawTimes 数组中
    drawTimes.push(elapsedTime);

    // 如果 drawTimes 数组的长度超过最大历史记录数，移除最早的记录
    if (drawTimes.length > maxHistory) drawTimes.shift();

    // 计算平均耗时
    avgTime =
      drawTimes.reduce((sum, time) => sum + time, 0) / drawTimes.length || 0;

    // 根据单次耗时确定颜色
    const singleColor = getColor(elapsedTime, level);

    // 根据平均耗时确定颜色
    const avgColor = getColor(avgTime, level);

    // 输出带样式的日志，包含单次耗时和平均耗时
    console.log(
      `%c单次耗时：${elapsedTime.toFixed(2)}ms\n%c平均耗时（${
        drawTimes.length
      }次）：${avgTime.toFixed(2)}ms`,
      `color: ${singleColor}; padding: 2px 0;`,
      `color: ${avgColor}; padding: 2px 0;`
    );

    return result;
  };
}

/**
 * 暂停执行指定毫秒数的操作
 * 此函数通过 busy-wait（忙等待）的方式实现，它会持续执行一些无用的操作以消耗时间
 * 这种方法虽然简单，但会占用CPU资源，因此不推荐在实际应用中使用
 *
 * @param ms 暂停的毫秒数
 * @returns 实际暂停的毫秒数
 */
export function _Utility_Sleep(ms: number) {
  // 记录开始时间
  const start = Date.now();
  // 初始化一个用于防优化的变量
  let dummy = performance.now();

  // 当前时间未达到指定的暂停时间时，继续执行循环
  while (Date.now() - start < ms) {
    // 复合型防优化操作
    // 通过数学运算和条件判断，防止JavaScript引擎优化掉这段无用的循环
    dummy = Math.sin(dummy) * 1e6;
    if (dummy > 1e6 || dummy < -1e6) dummy = 0;
    try {
      // 进一步的防优化操作
      // 将dummy的值转换为字符串并试图修改URL的hash值，以防止被优化
      const str = dummy.toString().substring(0, 8);
      history.replaceState(null, "", `#${str}`);
    } catch {}
  }

  // 返回实际暂停的时间
  return Date.now() - start;
}
