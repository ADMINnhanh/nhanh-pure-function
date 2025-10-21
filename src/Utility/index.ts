import { _Valid_DataType } from "../Valid";
import {
  _parsePathSegments,
  ARRAY_PART_REGEX,
  ARRAY_PATH_REGEX,
  INDEX_EXTRACT_REGEX,
} from "./type";

/**
 * 寻找空闲时机执行传入方法
 * @param callback  需执行的方法
 * @param timeout 超时时间
 */
export function _Utility_ExecuteWhenIdle(callback: Function, timeout = 3000) {
  if (typeof callback !== "function")
    return console.error("非函数：", callback);

  const requestIdleCallback = window.requestIdleCallback;
  const loop = function (deadline: IdleDeadline) {
    if (deadline.timeRemaining() <= 0 && !deadline.didTimeout)
      requestIdleCallback(loop, { timeout });
    else callback();
  };

  if (requestIdleCallback) requestIdleCallback(loop, { timeout });
  else requestAnimationFrame(() => callback());
}

/**
 * 等待条件满足
 * @param conditionChecker 条件检查器
 * @param timeoutMillis 超时毫秒数
 * @returns Promise<number> 耗时
 */
export function _Utility_WaitForCondition(
  conditionChecker: () => boolean,
  timeoutMillis: number
): Promise<number> {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= timeoutMillis) return reject(elapsedTime);
      if (conditionChecker()) return resolve(elapsedTime);

      requestAnimationFrame(checkCondition);
    };
    checkCondition();
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
  outTime = Date.now()
): (T & T1) | T | T1 | undefined {
  /** 疑似死循环 */
  if (outTime < Date.now() - 50) {
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
 * 生成一个UUID（通用唯一标识符）字符串
 * 可以选择性地在UUID前面添加前缀
 *
 * @param {string} prefix - 可选参数，要添加到UUID前面的前缀
 * @returns {string} 一个带有可选前缀的UUID字符串
 */
export function _Utility_GenerateUUID(prefix = "") {
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
export function _Utility_Debounce<T extends (...args: any[]) => void>(
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
export function _Utility_Throttle<T extends (...args: any[]) => void>(
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
 * 根据路径从对象中获取目标值
 * @param rootObject - 根对象
 * @param path - 访问路径，支持点号和数组索引语法（如 "a1.b2[0].c3"）
 * @returns 目标值，如果路径无效则返回根对象
 */
export function _Utility_GetTargetByPath(rootObject: any, path: string): any {
  if (!rootObject || !path) return rootObject;

  const pathSegments = _parsePathSegments(path);
  if (!pathSegments.length) return rootObject;

  // 遍历路径段，逐层访问对象属性
  return pathSegments.reduce((currentObj, segment, segmentIndex) => {
    const isFinalSegment = segmentIndex === pathSegments.length - 1;

    // 处理数组路径段（包含索引的路径段）
    if (ARRAY_PATH_REGEX.test(segment)) {
      const pathParts = segment.match(ARRAY_PART_REGEX) || [];

      // 遍历路径段内的各个部分（属性名和索引）
      return pathParts.reduce((currentPart, part, partIndex) => {
        // 处理属性名部分 (如 "items")
        if (/^\w+$/.test(part)) {
          return (
            currentPart[part] || (partIndex < pathParts.length - 1 ? [] : {})
          );
        }

        // 处理数组索引 (如 "[0]")
        const indexMatch = part.match(INDEX_EXTRACT_REGEX);
        const index = indexMatch ? parseInt(indexMatch[1], 10) : 0;
        const isFinalPart = partIndex === pathParts.length - 1;

        if (isFinalPart && isFinalSegment) {
          return currentPart[index]; // 最终值直接返回
        }

        // 初始化中间结构
        return currentPart[index] || (isFinalPart ? {} : []);
      }, currentObj);
    }

    // 处理普通属性路径段
    return isFinalSegment
      ? currentObj[segment] // 最终值
      : currentObj[segment] || {}; // 中间对象
  }, rootObject);
}

/**
 * 根据路径设置对象中的目标值
 * @param rootObject - 根对象
 * @param path - 访问路径，支持点号和数组索引语法（如 "a1.b2[0].c3"）
 * @param value - 要设置的值
 * @param skipIfExists - 如果为true，当目标位置已有值时跳过设置
 * @returns 设置后的根对象
 */
export function _Utility_SetTargetByPath(
  rootObject: any,
  path: string,
  value: any,
  skipIfExists?: boolean
): any {
  if (!rootObject || !path) return value;

  const pathSegments = _parsePathSegments(path);
  if (!pathSegments.length) return value;

  // 遍历路径段，逐层创建对象结构并设置值
  return pathSegments.reduce((currentObj, segment, segmentIndex) => {
    const isFinalSegment = segmentIndex === pathSegments.length - 1;

    // 处理数组路径段（包含索引的路径段）
    if (ARRAY_PATH_REGEX.test(segment)) {
      const pathParts = segment.match(ARRAY_PART_REGEX) || [];

      // 遍历路径段内的各个部分（属性名和索引）
      return pathParts.reduce((currentPart, part, partIndex) => {
        const isFinalPart = partIndex === pathParts.length - 1;

        // 处理属性名部分
        if (/^\w+$/.test(part)) {
          if (!currentPart.hasOwnProperty(part)) {
            currentPart[part] = []; // 初始化数组
          }
          return currentPart[part];
        }

        // 处理数组索引
        const indexMatch = part.match(INDEX_EXTRACT_REGEX);
        const index = indexMatch ? parseInt(indexMatch[1], 10) : 0;
        const shouldSetValue = isFinalPart && isFinalSegment;

        // 初始化或设置值
        if (!currentPart.hasOwnProperty(index)) {
          currentPart[index] = shouldSetValue ? value : isFinalPart ? {} : [];
        } else if (shouldSetValue && !skipIfExists) {
          currentPart[index] = value;
        }

        return currentPart[index];
      }, currentObj);
    }

    // 处理普通属性路径段
    if (isFinalSegment) {
      if (!skipIfExists || !currentObj.hasOwnProperty(segment)) {
        currentObj[segment] = value;
      }
      return currentObj[segment];
    }

    if (!currentObj.hasOwnProperty(segment)) {
      currentObj[segment] = {};
    }
    return currentObj[segment];
  }, rootObject);
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

  // 深度克隆函数
  const deepClone = <T>(_value: T, referenceMap = new WeakMap()): T => {
    const value: any = _value;
    // 基本类型直接返回
    if (value === null || typeof value !== "object") {
      return value;
    }

    // 处理循环引用
    if (referenceMap.has(value)) {
      return referenceMap.get(value);
    }

    const dataType = _Valid_DataType(value);

    switch (dataType) {
      case "array": {
        const newArray: any[] = [];
        referenceMap.set(value, newArray);
        for (const item of value) {
          newArray.push(deepClone(item, referenceMap));
        }
        return newArray as T;
      }

      case "object": {
        // 处理 null（虽然前面已处理，但确保类型安全）
        if (value === null) return value;

        const newObj: Record<any, any> = {};
        referenceMap.set(value, newObj);
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            newObj[key] = deepClone(value[key], referenceMap);
          }
        }
        return newObj as T;
      }

      case "date": {
        const newDate = new Date(value.getTime());
        referenceMap.set(value, newDate);
        return newDate as T;
      }

      case "regexp": {
        const regex = value;
        const newRegex = new RegExp(regex.source, regex.flags);
        newRegex.lastIndex = regex.lastIndex;
        referenceMap.set(value, newRegex);
        return newRegex as T;
      }

      case "map": {
        const newMap = new Map();
        referenceMap.set(value, newMap);
        (value as Map<any, any>).forEach((val, key) => {
          newMap.set(
            deepClone(key, referenceMap),
            deepClone(val, referenceMap)
          );
        });
        return newMap as T;
      }

      case "set": {
        const newSet = new Set();
        referenceMap.set(value, newSet);
        (value as Set<any>).forEach((val) => {
          newSet.add(deepClone(val, referenceMap));
        });
        return newSet as T;
      }

      // 处理其他可克隆对象类型
      case "arraybuffer":
      case "dataview":
      case "int8array":
      case "uint8array":
      case "uint8clampedarray":
      case "int16array":
      case "uint16array":
      case "int32array":
      case "uint32array":
      case "float32array":
      case "float64array":
      case "bigint64array":
      case "biguint64array": {
        const typedArray = value as ArrayBufferView;
        const constructor = typedArray.constructor as new (
          buffer: ArrayBuffer,
          byteOffset?: number,
          length?: number
        ) => typeof typedArray;

        // 克隆底层ArrayBuffer
        const buffer = typedArray.buffer.slice(
          typedArray.byteOffset,
          typedArray.byteOffset + typedArray.byteLength
        );

        const cloned = new constructor(
          buffer as ArrayBuffer,
          typedArray.byteOffset,
          typedArray.byteLength / (typedArray as any).BYTES_PER_ELEMENT
        );

        referenceMap.set(value, cloned);
        return cloned as T;
      }

      // 处理特殊对象类型
      case "error": {
        const error = value as Error;
        const newError = new (error.constructor as any)(error.message);
        newError.stack = error.stack;
        newError.name = error.name;
        referenceMap.set(value, newError);
        return newError as T;
      }

      // 处理不可克隆对象（直接返回原值）
      case "function":
      case "promise":
      case "weakmap":
      case "weakset":
      case "file":
      default: {
        return value;
      }
    }
  };

  // 尝试使用原始的structuredClone方法或自定义的deepClone方法进行克隆
  try {
    // 如果oldClone存在，则使用oldClone方法进行克隆，否则使用deepClone方法
    return oldClone ? oldClone(val) : deepClone(val);
  } catch (error) {
    // 使用日志系统或其他方式记录错误信息
    console.error("structuredClone error:", error);
    // @ts-ignore 如果oldClone存在且之前的尝试失败，则再次使用deepClone方法尝试克隆
    return oldClone && deepClone(val);
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
  return function (...args: any[]) {
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
