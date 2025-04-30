import { _IsObject, _NotNull, _Debounce } from "../Utility";
import {
  DragOption,
  EventFunctionMap,
  LocalDragOptions,
  UiLibrary,
} from "./type";

/**
 * 滚动结束监听器
 * @param {(trigger: "vertical" | "horizontal") => void} callback
 */
export function _ScrollEndListener(
  callback: (trigger: "vertical" | "horizontal") => void
) {
  const debouncedCallback = _Debounce(callback, 100);
  let lastScrollTop = 0;
  let lastScrollLeft = 0;
  return function (payload: Event) {
    const target = payload.target;
    if (!target || !(target instanceof HTMLElement)) return;

    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = target;
    function vertical() {
      if (lastScrollTop == scrollTop) return;
      /** 向上滚动？ */
      const isUp = lastScrollTop > scrollTop;
      lastScrollTop = scrollTop;
      if (isUp) return;
      const bottom = scrollHeight - scrollTop - clientHeight;
      if (bottom <= 1) debouncedCallback("vertical");
    }
    function horizontal() {
      if (lastScrollLeft == scrollLeft) return;
      /** 向左滚动？ */
      const isLeft = lastScrollLeft > scrollLeft;
      lastScrollLeft = scrollLeft;
      if (isLeft) return;
      const right = scrollWidth - scrollLeft - clientWidth;
      if (right <= 1) debouncedCallback("horizontal");
    }

    vertical();
    horizontal();
  };
}

/**
 * 点击非指定dom(包含子级dom)时执行 callback
 * @param  querySelector 允许点击的 dom 顶层祖先元素选择器
 * @param  callback 满足条件时执行的回调
 *
 * @param  options 其他配置
 * @param  options.uiLibrary 项目使用的 ui库 , 用于排除  ui库 创建的元素 , 避免点击 ui库 创建的元素时意外的执行 callback
 * @param  options.isClickAllowed 是否允许该点击 ( 如果不确定可以返回 undefined )
 */
export function _CloseOnOutsideClick(
  querySelector: string[],
  callback: Function,
  options?: {
    uiLibrary?: UiLibrary[];
    isClickAllowed?: (event: MouseEvent) => boolean | undefined;
  }
) {
  const { isClickAllowed, uiLibrary = ["naiveUI", "ElementPlus", "Element"] } =
    options || {};

  const UI = (function (obj) {
    const arr: string[] = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        /** @ts-ignore */
        if (uiLibrary.includes(key)) arr.push(...obj[key]);
      }
    }
    return arr;
  })({
    naiveUI: [
      ".v-binder-follower-container",
      ".n-image-preview-container",
      ".n-modal-container",
    ],
    ElementPlus: [".el-popper"],
    Element: [".el-popper"],
  });

  function end() {
    callback();
    document.removeEventListener("mousedown", mousedown);
  }
  function mousedown(event: MouseEvent) {
    if (isClickAllowed) {
      const bool = isClickAllowed(event);
      if (bool) return;
      if (bool === false) return end();
    }

    const target = event.target;

    /** 元素这时可能已经被删除了 */
    if (!(target instanceof HTMLElement) || !target?.closest("body")) return;

    const isClickable = querySelector
      .concat(UI)
      .some((className) => Boolean(target?.closest(className)));

    if (!isClickable) end();
  }
  requestAnimationFrame(() =>
    document.addEventListener("mousedown", mousedown)
  );
}

/** 拖拽dom */
export class _Drag {
  #dom: DragOption["dragDom"] = undefined;
  #isAllowed = false;
  #eventFunction: EventFunctionMap = {};
  #pageX = 0;
  #pageY = 0;
  #top = 0;
  #left = 0;
  #limit: DragOption["limit"] = undefined;
  #dragDom: DragOption["dragDom"] = undefined;

  init(dom: HTMLElement, option?: DragOption) {
    this.#dom = dom;
    this.#limit = option?.limit;
    this.#dragDom = option?.dragDom;
    this.#eventFunction = {
      mousedown: this.mousedown.bind(this),
      mousemove: this.mousemove.bind(this),
      mouseup: this.mouseup.bind(this),
    };

    this.bindOrUnbindEvent("bind");
  }
  finish() {
    this.bindOrUnbindEvent("unbind");
  }
  bindOrUnbindEvent(type: "bind" | "unbind") {
    const EventType =
      type === "bind" ? "addEventListener" : "removeEventListener";
    if (!this.#dom) return console.error("No DOM");

    this.#dom[EventType]("mousedown", this.#eventFunction.mousedown!);
    document[EventType]("mousemove", this.#eventFunction.mousemove!);
    document[EventType]("mouseup", this.#eventFunction.mouseup!);
  }
  alterLocation() {
    if (!this.#dom) return console.error("No DOM");
    if (this.#limit) {
      this.#top = Math.min(this.#top, this.#limit.max.top);
      this.#top = Math.max(this.#top, this.#limit.min.top);
      this.#left = Math.min(this.#left, this.#limit.max.left);
      this.#left = Math.max(this.#left, this.#limit.min.left);
    }
    this.#dom.style.setProperty("--top", this.#top + "px");
    this.#dom.style.setProperty("--left", this.#left + "px");
  }
  mousedown(event: Event) {
    if (!this.#dom) return console.error("No DOM");
    if (this.#dragDom && event.target != this.#dragDom) return;
    document.body.classList.add("no-select");

    this.#isAllowed = true;
    const clientRect = this.#dom.getBoundingClientRect();

    const { pageX, pageY } = event as MouseEvent;
    this.#pageX = pageX;
    this.#pageY = pageY;
    this.#top = clientRect.y;
    this.#left = clientRect.x;
  }
  mousemove(event: Event) {
    const { pageX, pageY } = event as MouseEvent;
    if (this.#isAllowed) {
      this.#top += pageY - this.#pageY;
      this.#left += pageX - this.#pageX;
      this.#pageX = pageX;
      this.#pageY = pageY;

      this.alterLocation();
    }
  }
  mouseup() {
    if (this.#isAllowed) {
      this.#isAllowed = false;
      document.body.classList.remove("no-select");
    }
  }
}

/** 局部拖拽 计算位置距离/百分比 */
export class _LocalDrag {
  #parentDom: DragOption["dragDom"] = undefined;
  #isAllowed = false;
  #eventFunction: EventFunctionMap = {};
  #clientRectX = 0;
  #clientRectY = 0;
  #top = 0;
  #left = 0;
  #limit: LocalDragOptions["limit"] = undefined;
  #update_move: LocalDragOptions["update_move"] = undefined;
  #update_up: LocalDragOptions["update_up"] = undefined;

  init(parentDom: HTMLElement, options: LocalDragOptions = {}) {
    this.#parentDom = parentDom;
    this.#limit = options.limit;
    this.#update_move = options.update_move;
    this.#update_up = options.update_up;
    this.#eventFunction = {
      mousedown: this.mousedown.bind(this),
      mousemove: this.mousemove.bind(this),
      mouseup: this.mouseup.bind(this),
    };

    this.bindOrUnbindEvent("bind");
  }
  finish() {
    this.bindOrUnbindEvent("unbind");
  }
  bindOrUnbindEvent(type: "bind" | "unbind") {
    const EventType =
      type === "bind" ? "addEventListener" : "removeEventListener";
    if (!this.#parentDom) return console.error("No DOM");

    this.#parentDom[EventType]("mousedown", this.#eventFunction.mousedown!);
    document[EventType]("mousemove", this.#eventFunction.mousemove!);
    document[EventType]("mouseup", this.#eventFunction.mouseup!);
  }
  updateValue() {
    const value = {
      top: this.#top,
      left: this.#left,
      percentage: { top: 0, left: 0 },
    };
    if (this.#limit) {
      const v = (type: "top" | "left") =>
        this.#limit
          ? (value[type] - this.#limit.min[type]) /
            (this.#limit.max[type] - this.#limit.min[type])
          : 0;

      value.percentage = {
        top: v("top") || 0,
        left: v("left") || 0,
      };
    }
    return value;
  }
  alterLocation() {
    if (!this.#parentDom) return console.error("No DOM");
    if (this.#limit) {
      this.#top = Math.min(this.#top, this.#limit.max.top);
      this.#top = Math.max(this.#top, this.#limit.min.top);
      this.#left = Math.min(this.#left, this.#limit.max.left);
      this.#left = Math.max(this.#left, this.#limit.min.left);
    }
    if (this.#update_move) this.#update_move(this.updateValue());

    this.#parentDom.style.setProperty("--top", this.#top + "px");
    this.#parentDom.style.setProperty("--left", this.#left + "px");
  }
  mousedown(event: Event) {
    if (!this.#parentDom) return console.error("No DOM");
    document.body.classList.add("no-select");

    this.#isAllowed = true;
    const clientRect = this.#parentDom.getBoundingClientRect();
    this.#clientRectY = clientRect.y;
    this.#clientRectX = clientRect.x;

    const { pageX, pageY } = event as MouseEvent;
    this.#top = pageY - this.#clientRectY;
    this.#left = pageX - this.#clientRectX;

    this.alterLocation();
  }
  mousemove(event: Event) {
    const { pageX, pageY } = event as MouseEvent;
    if (this.#isAllowed) {
      this.#top = pageY - this.#clientRectY;
      this.#left = pageX - this.#clientRectX;
      this.alterLocation();
    }
  }
  mouseup() {
    if (this.#isAllowed) {
      this.#isAllowed = false;
      document.body.classList.remove("no-select");
      if (this.#update_up) this.#update_up(this.updateValue());
    }
  }
}

/** 进入全屏模式 */
export function _EnterFullscreen(content: HTMLElement): Promise<void> {
  const ts_content = content as any;
  if (!content) {
    return Promise.reject("No DOM");
  } else if (content.requestFullscreen) {
    return content.requestFullscreen();
  } else if (ts_content.mozRequestFullScreen) {
    // Firefox
    return ts_content.mozRequestFullScreen();
  } else if (ts_content.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    return ts_content.webkitRequestFullscreen();
  } else if (ts_content.msRequestFullscreen) {
    // IE/Edge
    return ts_content.msRequestFullscreen();
  }
  return Promise.reject("No Fullscreen API");
}
/** 退出全屏模式 */
export function _ExitFullscreen(): Promise<void> {
  const ts_document = document as any;

  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (ts_document.mozCancelFullScreen) {
    // Firefox
    return ts_document.mozCancelFullScreen();
  } else if (ts_document.webkitExitFullscreen) {
    // Chrome, Safari and Opera
    return ts_document.webkitExitFullscreen();
  } else if (ts_document.msExitFullscreen) {
    // IE/Edge
    return ts_document.msExitFullscreen();
  }
  return Promise.reject("No ExitFullscreen API");
}
/** 判断是否处于全屏模式 */
export function _IsFullscreen(): HTMLElement | undefined {
  const ts_document = document as any;
  return (
    document.fullscreenElement ||
    ts_document.webkitFullscreenElement ||
    ts_document.mozFullScreenElement ||
    ts_document.msFullscreenElement
  );
}
/**
 * 返回一个用于切换全屏模式的函数
 * @param {HTMLElement} content - 需要进入全屏的元素
 * 该函数通过检查不同浏览器的特定方法来实现全屏切换
 */
export function _Fullscreen(content: HTMLElement) {
  return function () {
    if (_IsFullscreen()) _ExitFullscreen();
    else _EnterFullscreen(content);
  };
}

/**
 * 单位转换 12** -> **px
 * @param {string} width
 * @returns 对应的单位为px的宽
 */
export function _GetOtherSizeInPixels(width: string, target?: HTMLElement) {
  if (typeof width == "number") return width;
  if (/px/.test(width)) return Number(width.replace(/px/, "")) || 0;
  const dom = document.createElement("div");
  dom.style.width = width;
  target = target || document.body;
  target.appendChild(dom);
  const widthPX = dom.getBoundingClientRect().width;
  target.removeChild(dom);
  return widthPX;
}

/**
 * 根据给定的宽高比和目标元素或尺寸，计算画布的尺寸
 * 此函数旨在适应不同场景下，如何根据宽高比约束，计算出适合的画布大小
 *
 * @param aspectRatio 宽高比，表示期望的画布宽度与高度的比例
 * @param target 目标元素或尺寸，可以是DOM元素、选择器字符串或尺寸数组
 * @returns 返回计算后的画布尺寸，格式为[宽度, 高度]
 */
export function _CalculateCanvasSize(
  aspectRatio: number,
  target: Element | string | [number, number]
) {
  // 检查宽高比是否有效，若无效则不进行计算
  if (!aspectRatio) return;

  // 定义宽度和高度变量，待计算后赋值
  let width: number, height: number;

  // 判断target类型，以决定如何获取尺寸
  if (typeof target == "string") {
    // 若为字符串，视为DOM选择器，获取对应元素
    const dom = document.querySelector(target);
    // 未找到元素则不进行后续操作
    if (!dom) return;
    // 获取元素的尺寸信息
    const rect = dom.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  } else if (Array.isArray(target)) {
    // 若非字符串，直接从数组中获取宽高
    width = target[0];
    height = target[1];
  } else {
    // 获取元素的尺寸信息
    const rect = target.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  // 计算当前的宽高比
  const scale = width / height;

  // 根据宽高比对比，确保最终尺寸符合预期的宽高比
  if (scale > aspectRatio) return [aspectRatio * height, height];
  if (scale < aspectRatio) return [width, width / aspectRatio];
  // 宽高比一致，直接返回当前尺寸
  return [width, height];
}

/**
 * 异步加载图片，并返回图片对象及其宽高比
 * @param src 图片的URL地址
 * @param timeout 超时时间，单位为毫秒，默认为5000ms
 * @returns 一个Promise对象，包含加载的图片对象及其宽高比
 */
export function _LoadImage(
  src: string,
  timeout: number = 5000
): Promise<[HTMLImageElement, number]> {
  return new Promise((resolve, reject) => {
    const img: HTMLImageElement = new Image();
    img.src = src;

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      reject(new Error("图片加载超时"));
      img.onload = null;
      img.onerror = null;
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId); // 清除超时计时器
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      resolve([img, aspectRatio]);
    };

    img.onerror = () => {
      clearTimeout(timeoutId); // 清除超时计时器
      reject(new Error("图片加载失败"));
    };

    // 可选：增加跨域支持
    img.crossOrigin = "Anonymous";
  });
}

/**
 * 暂停执行指定毫秒数的操作
 * 此函数通过 busy-wait（忙等待）的方式实现，它会持续执行一些无用的操作以消耗时间
 * 这种方法虽然简单，但会占用CPU资源，因此不推荐在实际应用中使用
 *
 * @param ms 暂停的毫秒数
 * @returns 实际暂停的毫秒数
 */
export function _Sleep(ms: number) {
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
