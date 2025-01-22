import { _IsObject, _NotNull, _Debounce } from "../Utility/Utility";

/**
 * 滚动结束监听器
 * @param {(trigger: "vertical" | "horizontal") => void} callback
 */
export function _ScrollEndListener(callback) {
  const debouncedCallback = _Debounce(callback, 100);
  let lastScrollTop = 0;
  let lastScrollLeft = 0;
  return function (payload) {
    const target = payload.target;
    if (!target) return;

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
 * 设置量词属性
 * @param {*} data 需修改对象
 * @param {*} options 配置
 * @returns data
 */
export function _SetQuantifierAttribute(data, options = []) {
  if (!_IsObject(data)) {
    console.error("异常输入：", data);
    return data;
  }

  options.forEach((item) => {
    if (typeof item === "string") {
      data[item] = _FormatNumberWithUnit(data[item]);
    } else if (Array.isArray(item)) {
      const [label, config] = data[item];
      if (_NotNull(label) && _IsObject(config))
        data[label] = _FormatNumberWithUnit(label, config);
    }
  });
  return data;
}

/**
 * 为属性值为null | undefined的属性设置默认值
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetDefaultValue(data, options = {}) {
  if (!_IsObject(data)) {
    console.error("异常输入：", data);
    return data;
  }

  const { defaultValue = "--", fieldsNotRequiringAction } = options;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      if (fieldsNotRequiringAction) {
        if (!fieldsNotRequiringAction.includes(key) && !_NotNull(element)) {
          data[key] = defaultValue;
        }
      } else if (!_NotNull(element)) {
        data[key] = defaultValue;
      }
    }
  }

  return data;
}

/**
 * 将字典value转为对应label
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetDictionary(data, options = {}) {
  if (!_IsObject(data)) {
    console.error("异常输入：", data);
    return data;
  }

  const {
    dictionaryLabel = [],
    dictionaryLabelJoin = [],
    dictionaryOptions,
    defaultValue = "--",
  } = options;

  if (dictionaryOptions) {
    dictionaryLabel.forEach((label) => {
      if (_NotNull(data[label])) {
        const options = dictionaryOptions[label];

        if (options) {
          data[label] = options[data[label]];
        } else {
          data[label] = defaultValue;
        }
      } else {
        data[label] = defaultValue;
      }
    });
    dictionaryLabelJoin.forEach((label) => {
      if (_NotNull(data[label]) && data[label] != "") {
        const options = dictionaryOptions[label];
        if (options) {
          const oldvalue = data[label].split(",");
          data[label] = "";
          oldvalue.forEach((_label) => {
            data[label] += options[_label];
          });
        } else {
          data[label] = defaultValue;
        }
      } else {
        data[label] = defaultValue;
      }
    });
  }

  return data;
}

/**
 * 将字符串拼接的图片地址转为数组
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetPhoto(data, options = {}) {
  if (!_IsObject(data)) {
    console.error("异常输入：", data);
    return data;
  }

  const { label, defaultUrl } = options;

  if (label) {
    label.forEach((label) => {
      const defaultValue = (defaultUrl && defaultUrl[label]) || [];
      const value = data[label];
      if (typeof value === "string") {
        data[label] = value.split(",").filter(Boolean);
      } else {
        data[label] = defaultValue;
      }
    });
  }

  return data;
}

/**
 * 将接口返回的数据进行处理，得到展示数据
 * @param data object 类型的数据
 * @param options 配置
 * @returns exhibit_data
 */
export function _Exhibit_details(data, options = {}) {
  if (!_IsObject(data)) {
    console.error("异常输入：", data);
    return {};
  }

  data = JSON.parse(JSON.stringify(data));

  const {
    dictionaryLabel = [],
    dictionaryLabelJoin = [],
    dictionaryOptions,

    photoLabel = [],
    photoDefaultUrl,

    quantifierLabel = [],

    filterLabel = [],

    defaultValue = "--",
  } = options;

  _SetDictionary(data, {
    dictionaryLabel,
    dictionaryLabelJoin,
    dictionaryOptions,
    defaultValue,
  });

  _SetPhoto(data, {
    label: photoLabel,
    defaultUrl: photoDefaultUrl,
  });

  _SetQuantifierAttribute(data, quantifierLabel);

  _SetDefaultValue(data, {
    defaultValue,
    fieldsNotRequiringAction: dictionaryLabel
      .concat(dictionaryLabelJoin)
      .concat(photoLabel)
      .concat(
        quantifierLabel
          .map((item) => {
            if (typeof item == "string") return item;
            if (Array.isArray(item)) return item[0];
          })
          .filter(Boolean)
      )
      .concat(filterLabel),
  });

  return data;
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
export function _CloseOnOutsideClick(querySelector, callback, options) {
  const { isClickAllowed, uiLibrary = ["naiveUI", "ElementPlus", "Element"] } =
    options || {};

  const UI = (function (obj) {
    const arr = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
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
  function mousedown(event) {
    if (isClickAllowed) {
      const bool = isClickAllowed(event);
      if (bool) return;
      if (bool === false) return end();
    }

    const target = event.target;

    /** 元素这时可能已经被删除了 */
    if (!target?.closest("body")) return;

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
  #dom = null;
  #isAllowed = false;
  #eventFunction = {};
  #pageX = 0;
  #pageY = 0;
  #top = 0;
  #left = 0;
  #limit;
  #dragDom;

  init(dom, option) {
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
  bindOrUnbindEvent(type) {
    const EventType =
      type === "bind" ? "addEventListener" : "removeEventListener";
    if (!this.#dom) return console.error("No DOM");

    this.#dom[EventType]("mousedown", this.#eventFunction.mousedown);
    document[EventType]("mousemove", this.#eventFunction.mousemove);
    document[EventType]("mouseup", this.#eventFunction.mouseup);
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
  mousedown(event) {
    if (!this.#dom) return console.error("No DOM");
    if (this.#dragDom && event.target != this.#dragDom) return;
    document.body.classList.add("no-select");

    this.#isAllowed = true;
    const clientRect = this.#dom.getBoundingClientRect();

    const { pageX, pageY } = event;
    this.#pageX = pageX;
    this.#pageY = pageY;
    this.#top = clientRect.y;
    this.#left = clientRect.x;
  }
  mousemove(event) {
    const { pageX, pageY } = event;
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
  #parentDom = null;
  #isAllowed = false;
  #eventFunction = {};
  #clientRectX = 0;
  #clientRectY = 0;
  #top = 0;
  #left = 0;
  #limit;
  #update_move;
  #update_up;

  init(parentDom, options = {}) {
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
  bindOrUnbindEvent(type) {
    const EventType =
      type === "bind" ? "addEventListener" : "removeEventListener";
    if (!this.#parentDom) return window.customize_error("No DOM");

    this.#parentDom[EventType]("mousedown", this.#eventFunction.mousedown);
    document[EventType]("mousemove", this.#eventFunction.mousemove);
    document[EventType]("mouseup", this.#eventFunction.mouseup);
  }
  updateValue() {
    const value = {
      top: this.#top,
      left: this.#left,
    };
    if (this.#limit) {
      const v = (type) =>
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
    if (!this.#parentDom) return window.customize_error("No DOM");
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
  mousedown(event) {
    if (!this.#parentDom) return window.customize_error("No DOM");
    document.body.classList.add("no-select");

    this.#isAllowed = true;
    const clientRect = this.#parentDom.getBoundingClientRect();
    this.#clientRectY = clientRect.y;
    this.#clientRectX = clientRect.x;

    const { pageX, pageY } = event;
    this.#top = pageY - this.#clientRectY;
    this.#left = pageX - this.#clientRectX;

    this.alterLocation();
  }
  mousemove(event) {
    const { pageX, pageY } = event;
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
export function _EnterFullscreen(content) {
  if (!content) {
    return Promise.reject("No DOM: ", content);
  } else if (content.requestFullscreen) {
    return content.requestFullscreen();
  } else if (content.mozRequestFullScreen) {
    // Firefox
    return content.mozRequestFullScreen();
  } else if (content.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    return content.webkitRequestFullscreen();
  } else if (content.msRequestFullscreen) {
    // IE/Edge
    return content.msRequestFullscreen();
  }
}
/** 退出全屏模式 */
export function _ExitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    // Firefox
    return document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    // Chrome, Safari and Opera
    return document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    // IE/Edge
    return document.msExitFullscreen();
  }
}
/** 判断是否处于全屏模式 */
export function _IsFullscreen() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}
/**
 * 返回一个用于切换全屏模式的函数
 * @param {HTMLElement} content - 需要进入全屏的元素
 * 该函数通过检查不同浏览器的特定方法来实现全屏切换
 */
export function _Fullscreen(content) {
  return function () {
    if (_IsFullscreen()) _ExitFullscreen();
    else _EnterFullscreen(content);
  };
}
