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
