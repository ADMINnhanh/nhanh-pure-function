import { PAPER_SIZE_DEFINITIONS, PaperType, WindowTarget } from "../Constant";
import { _Utility_GenerateUUID, _Utility_WaitForCondition } from "../Utility";

/**
 * 获取帧率
 * @param {(fps , frameTime)=>void} callback callback( 帧率 , 每帧时间 )
 * @param {Number} referenceNode 参考节点数量
 */
export function _Browser_GetFrameRate(
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
      const time = Date.now() - t;
      const frameTime = time / referenceNode;
      const fps = 1000 / frameTime;
      callback(Number(fps.toFixed(2)), Number(frameTime.toFixed(2)));
    }
  }
  requestAnimationFrame(() => {
    t = Date.now();
    loop();
  });
}

/**
 * 复制到剪贴板
 * @param {string} text
 */
export function _Browser_CopyToClipboard(text: string) {
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
 * 管理通过键值对打开的窗口
 */
export class _Browser_KeyedWindowManager {
  // 存储键与对应窗口的Map
  private static keys = new Map<string, Window>();

  /** 请使用静态方法 */
  private constructor() {}

  /** 获取键值对管理器的唯一标识符 */
  static Get_KeyedWindowManager = Symbol.for("_Browser_KeyedWindowManager");

  /**
   * 初始化
   * @param name 窗口名称
   */
  static init(name: string) {
    this.keys.set(name, window);
    window.name = name;
    (window as any)[this.Get_KeyedWindowManager] = () => this;

    /** 获取 opener 的实例 */
    const manager: typeof _Browser_KeyedWindowManager = (
      window.opener as any
    )?.[this.Get_KeyedWindowManager]?.();
    /** 使用 opener 同步所有可访问的窗口 */
    manager?.notify();
  }

  /**
   * 更新窗口管理器
   * @param self 最新实例
   */
  static update(self: typeof _Browser_KeyedWindowManager) {
    self.keys.forEach((win, key) => {
      if (window.name == key) return;
      this.keys.set(key, win);
    });
  }

  /**
   * 通知所有窗口 同步所以可访问的窗口
   */
  static notify() {
    this.keys.forEach((win, key) => {
      // 如果窗口已关闭，应该清理
      if (win.closed) {
        this.keys.delete(key); // 需要key信息
        return;
      }
      const manager: typeof _Browser_KeyedWindowManager = (win as any)[
        this.Get_KeyedWindowManager
      ]?.();
      manager?.update(this);
    });
  }

  /**
   * 检查窗口的 opener 是否与当前页面同源
   * @param win 窗口对象
   * @returns 如果 opener 与当前页面同源则返回true，否则返回false
   */
  static isSameOrigin(url?: string | URL) {
    return url && new URL(url).origin === location.origin;
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
    if (this.keys.size == 0) {
      return console.error(
        "请先使用 _Browser_KeyedWindowManager.init 方法进行初始化"
      );
    }

    const win = this.keys.get(key);
    if (win && !win.closed) {
      if (win.name) open("javascript:;", win.name);
      else win.focus();

      return win;
    } else if (this.isSameOrigin(url)) {
      const newWin = window.open(url, target, windowFeatures);
      if (newWin) {
        this.keys.set(key, newWin);
        return newWin;
      } else {
        console.error("window.open failed: 可能是浏览器阻止了弹出窗口");
        this.keys.delete(key);
        this.notify();
      }
    } else {
      console.error(`"${url}" 不符合同源策略，仅能管理同源标签页`);
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
      this.notify();
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
 * 计算纸张内容可用宽高及边距（考虑设备DPI）
 * 确保：contentWidth + 2*paddingPx = 纸张宽度像素
 * @param type 纸张类型
 * @param padding 边距（毫米）
 * @returns {
 *   contentWidth: number;  // 内容可用宽度(px)
 *   contentHeight: number; // 内容可用高度(px)
 *   paddingPx: number;     // 边距(px) - 单边值
 *   paperWidthPx: number;  // 纸张总宽度(px)
 *   paperHeightPx: number; // 纸张总高度(px)
 * }
 */
export function _Browser_CalculatePrintableArea(
  type: PaperType,
  padding: number
) {
  // 获取纸张基础尺寸
  const paper = PAPER_SIZE_DEFINITIONS[type];
  if (!paper) return console.error(`未知纸张类型: ${type}`);

  const { width: paperWidthMM, height: paperHeightMM } = paper;

  // 毫米转英寸（1英寸=25.4毫米）
  const mmToInch = (mm: number) => mm / 25.4;

  // 获取设备DPI
  const getDeviceDPI = () => {
    if (typeof window !== "undefined") {
      return window.devicePixelRatio * 96;
    }
    return 300; // Node.js/打印环境
  };

  const dpi = getDeviceDPI();

  // 辅助函数：毫米转像素（带四舍五入）
  const mmToPx = (mm: number) => Math.round(mmToInch(mm) * dpi);

  // 1. 先计算整个纸张的像素尺寸
  const paperWidthPx = mmToPx(paperWidthMM);
  const paperHeightPx = mmToPx(paperHeightMM);

  // 2. 计算边距像素值（单边）
  const paddingPx = mmToPx(padding);

  // 3. 基于纸张像素尺寸计算内容区域（确保没有累积误差）
  const contentWidth = Math.max(0, paperWidthPx - 2 * paddingPx);
  const contentHeight = Math.max(0, paperHeightPx - 2 * paddingPx);

  return {
    /** 内容宽度（像素） */
    contentWidth,
    /** 内容高度（像素） */
    contentHeight,
    /** 边距（像素） */
    paddingPx,
    /** 纸张宽度（像素） */
    paperWidthPx,
    /** 纸张高度（像素） */
    paperHeightPx,
  };
}
