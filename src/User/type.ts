export type UiLibrary = "naiveUI" | "ElementPlus" | "Element";

export type EventFunctionMap = Partial<
  Record<
    | "mousedown"
    | "mousemove"
    | "mouseup"
    | "click"
    | "touchstart"
    | "touchmove"
    | "touchend"
    | "touchcancel",
    (event: Event) => void
  >
>;

/** 拖拽配置 */
export type DragOption = {
  /** 拖拽范围限制 */
  limit?: {
    max: {
      top: number;
      left: number;
    };
    min: {
      top: number;
      left: number;
    };
  };
  /** 指定的拖拽元素 */
  dragDom?: HTMLElement;
};

/** 更新后的位置信息 */
export type UpdateValue = {
  top: number;
  left: number;
  percentage?: {
    top: number;
    left: number;
  };
};
/** 局部拖拽配置 */
export type LocalDragOptions = {
  limit?: DragOption["limit"];
  update_move?: (value: UpdateValue) => void | undefined;
  update_up?: (value: UpdateValue) => void | undefined;
};
