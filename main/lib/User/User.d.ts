/**
 * 滚动结束监听器
 * @param {(trigger: "vertical" | "horizontal") => void} callback
 */
export function _ScrollEndListener(
  callback: (trigger: "vertical" | "horizontal") => void
): (payload: Event) => void;

/**
 * 设置量词属性
 * @param {*} data 需修改对象
 * @param {*} options 配置
 * @returns data
 */
export function _SetQuantifierAttribute<T>(
  data: T,
  options?: (
    | keyof T
    | [
        keyof T,
        {
          join?: boolean;
          suffix?: string;
          integer?: boolean;
        }
      ]
  )[]
): T;

/**
 * 为属性值为null | undefined的属性设置默认值
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetDefaultValue<T>(
  data: T,
  options?: {
    defaultValue?: string;
    fieldsNotRequiringAction?: (string | number | symbol)[];
  }
): T;

/**
 * 将字典value转为对应label
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetDictionary<T>(
  data: T,
  options: {
    dictionaryOptions?: { [key in keyof T]: { [key: string | number]: any } };
    dictionaryLabel?: (keyof T)[];
    dictionaryLabelJoin?: (keyof T)[];
    defaultValue?: string;
  }
): T;

/**
 * 将字符串拼接的图片地址转为数组
 * @param data 需修改对象
 * @param options 配置
 * @returns
 */
export function _SetPhoto<T>(
  data: T,
  options: {
    label?: (keyof T)[];
    defaultUrl?: {
      [key in keyof T]: string[];
    };
  }
): T;

/**
 * 将接口返回的数据进行处理，得到展示数据
 * @param data object 类型的数据
 * @param options 配置
 * @returns exhibit_data
 */
export function _Exhibit_details<T>(
  data: T,
  options?: {
    dictionaryOptions?: { [key in keyof T]: { [key: string | number]: any } };
    dictionaryLabel?: (keyof T)[];
    dictionaryLabelJoin?: (keyof T)[];

    photoLabel?: (keyof T)[];
    photoDefaultUrl?: {
      [key in keyof T]: string[];
    };

    quantifierLabel?: (
      | keyof T
      | [
          keyof T,
          {
            join?: boolean;
            suffix?: string;
            integer?: boolean;
          }
        ]
    )[];

    filterLabel?: (keyof T)[];

    defaultValue?: string;
  }
): T;

type UiLibrary = "naiveUI" | "ElementPlus" | "Element";
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
): void;

/** 拖拽配置 */
type DragOption = {
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
/** 拖拽 */
export class _Drag {
  /**
   * 初始化拖拽
   * @param  dom 被拖拽的元素
   * @param  option 拖拽配置
   */
  init(dom: HTMLElement, option?: DragOption): void;
  /** 结束拖拽 */
  finish(): void;
}

/** 更新后的位置信息 */
type UpdateValue = {
  top: number;
  left: number;
  percentage?: {
    top: number;
    left: number;
  };
};
/** 局部拖拽配置 */
type LocalDragOptions = {
  limit?: DragOption["limit"];
  update_move?: (value: UpdateValue) => void | undefined;
  update_up?: (value: UpdateValue) => void | undefined;
};
/** 局部拖拽 计算位置距离/百分比 */
export class _LocalDrag {
  /**
   * 初始化拖拽
   * @param  parentDom 被拖拽元素的祖先元素
   * @param  option 局部拖拽配置
   */
  init(parentDom: HTMLElement, options?: LocalDragOptions): void;
  /** 结束拖拽 */
  finish(): void;
}

/** 进入全屏模式 */
export function _EnterFullscreen(content: HTMLElement): void;
/** 退出全屏模式 */
export function _ExitFullscreen(): void;
/** 判断是否处于全屏模式 */
export function _IsFullscreen(): HTMLElement | undefined;

/**
 * 返回一个用于切换全屏模式的函数
 * @param {HTMLElement} content - 需要进入全屏的元素
 * 该函数通过检查不同浏览器的特定方法来实现全屏切换
 */
export function _Fullscreen(content: HTMLElement): () => void;
