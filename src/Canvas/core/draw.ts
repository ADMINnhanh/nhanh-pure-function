import { _Utility_Debounce, _Utility_TimeConsumption } from "../..";
import Style from "./style";
import _Canvas from "..";
import type { OverlayType } from "../OverlayGroup";

import Custom from "../OverlayGroup/custom";
import Text from "../OverlayGroup/text";
import Point from "../OverlayGroup/point";
import Line from "../OverlayGroup/line";
import Polygon from "../OverlayGroup/polygon";
import Arc from "../OverlayGroup/arc";
import ArcTo from "../OverlayGroup/arcTo";

type ConstructorOption = ConstructorParameters<typeof Style>[0];

/** 绘制方法 */
export default class Draw extends Style {
  /** 监听元素大小 */
  private resizeObserver?: ResizeObserver;
  /** 本次绘制的覆盖物 */
  currentDrawOverlays: OverlayType[] = [];

  /** 计算坐标所需依赖 */
  private rely = "";

  // 创建标志位，标记是否是第一次执行
  private isResizeObserverFirstRun = true;

  constructor(option: ConstructorOption) {
    super(option);
    if (this.canvas) {
      this.resizeObserver = new ResizeObserver(
        _Utility_Debounce(() => {
          if (this.isResizeObserverFirstRun)
            return (this.isResizeObserverFirstRun = false);

          [this.canvas.width, this.canvas.height] = [
            this.rect.width,
            this.rect.height,
          ];
          this.redrawOnce();
        }, 200)
      );
      this.resizeObserver.observe(this.canvas);
    }
    this.updateRely();
    this.isRecalculate = false;
  }

  /** 更新 计算坐标所需依赖 */
  private updateRely() {
    const { center, scale, rect, axisConfig } = this;

    const newRely = [
      center.x,
      center.y,
      scale,
      JSON.stringify(axisConfig),
      rect.width,
      rect.height,
    ].join();
    this.isRecalculate = this.rely !== newRely;
    this.rely = newRely;
  }

  /** 获取最大/小的 值 */
  maxMinValue = {
    minXV: 0,
    maxXV: 0,
    minYV: 0,
    maxYV: 0,
  };

  /** 重绘画布 */
  private redraw() {
    if (!this.canvas) return console.warn("canvas is not HTMLCanvasElement");
    if (this.canvas.clientWidth == 0 || this.canvas.clientHeight == 0)
      return console.warn(
        "The image argument is a canvas element with a width or height of 0."
      );

    if (!this.shouldRender()) return this.clearScreen(false);

    this.ctx.globalAlpha = this.opacity ?? 1;

    this.updateCenter();

    this.updateRely();

    this.maxMinValue = this.getMaxMinValue();

    this.clearScreen();

    /** 本次绘制的覆盖物 */
    const currentDrawOverlays: [[number, number], OverlayType][] = [];
    let canvasArr: [
      number,
      HTMLCanvasElement,
      [[number, number], OverlayType][]
    ][] = [];

    const axis_canvas = this.drawAxis?.drawAxisAndGrid();
    if (axis_canvas) canvasArr.push([0, axis_canvas, []]);

    this.layerGroups.forEach((layerGroup) =>
      canvasArr.push(...layerGroup.fetchCanvas())
    );
    canvasArr.sort((a, b) => a[0] - b[0]);

    canvasArr.forEach(([, canvas, overlays], index) => {
      this.ctx.drawImage(canvas, 0, 0);

      overlays.forEach(([[layerZIndex, overlayZIndex], overlay]) => {
        currentDrawOverlays.push([
          [layerZIndex + index, overlayZIndex],
          overlay,
        ]);
      });
    });

    // 排序
    currentDrawOverlays.sort(
      (
        [[aLayerZIndex, aOverlayZIndex], aOverlay],
        [[bLayerZIndex, bOverlayZIndex], bOverlay]
      ) => {
        // 再比较图层 z-index
        if (aLayerZIndex !== bLayerZIndex) return bLayerZIndex - aLayerZIndex;

        // 然后比较覆盖层的z-index
        if (aOverlayZIndex !== bOverlayZIndex)
          return bOverlayZIndex - aOverlayZIndex;

        // 最后比较覆盖类型优先级
        const getPriority = (overlay: any) => {
          if (overlay instanceof Custom) return 5;
          if (overlay instanceof Text) return 4;
          if (overlay instanceof Point) return 3;
          if (
            overlay instanceof Line ||
            overlay instanceof Arc ||
            overlay instanceof ArcTo
          )
            return 2;
          if (overlay instanceof Polygon) return 1;
          return 0; // 默认优先级
        };

        return getPriority(bOverlay) - getPriority(aOverlay);
      }
    );

    // 将分组结果转换为 Overlay[] 结构
    this.currentDrawOverlays = currentDrawOverlays.map(
      ([, overlay]) => overlay
    );

    // console.log("本次绘制的覆盖物数量： ", this.currentDrawOverlays.length);

    this.isRecalculate = false;
    this.isThemeUpdated = false;
    this.isScaleUpdated = false;

    this.notifyReload?.();
  }

  /** 测量重绘性能 */
  private measureRedrawPerformance = _Utility_TimeConsumption(() => {
    this.isRendering = true;
    this.redraw();
    this.redrawInNextRenderFrame = false;
    this.isRendering = false;
  }, [
    [1, "#F56C6C"],
    [0.5, "#E6A23C"],
    [0, "#67C23A"],
  ]);

  /** 重绘画布 同一个渲染帧只会执行一次 */
  redrawOnce() {
    if (!this.redrawInNextRenderFrame) {
      this.redrawInNextRenderFrame = true;
      Promise.resolve().then(() => {
        this.measureRedrawPerformance?.();
        // this.isRendering = true;
        // this.redraw();
        // this.redrawInNextRenderFrame = false;
        // this.isRendering = false;
      });
    }
  }

  /** 根据坐标查找覆盖物 */
  protected findOverlayByPoint(event: MouseEvent) {
    const { offsetX, offsetY, clientX, clientY } = event;

    const { x, y } = this.axisConfig;
    const mouseMin = this.getMousePositionOnAxis({
      clientX: clientX - 10 * x,
      clientY: clientY - 10 * y,
    })!;
    const mouseMax = this.getMousePositionOnAxis({
      clientX: clientX + 10 * x,
      clientY: clientY + 10 * y,
    })!;
    const mouseVMin = this.getAxisValueByPoint(mouseMin.x, mouseMin.y);
    const mouseVMax = this.getAxisValueByPoint(mouseMax.x, mouseMax.y);

    // if (window.yyp) {
    //   const arr = [...this.currentDrawOverlays]
    //     /** 覆盖物可以拖拽的情况下优先触发处于 isClick 状态的覆盖物 */
    //     .sort((a, b) => {
    //       if (a.isDraggable && a.isClick) console.log(a);
    //       if (b.isDraggable && b.isClick) console.log(b);

    //       return (
    //         (a.isDraggable && a.isClick ? 0 : 1) -
    //         (b.isDraggable && b.isClick ? 0 : 1)
    //       );
    //     });
    //   arr.forEach((overlay) => {
    //     const valueScope = overlay.valueScope;
    //     if (valueScope && overlay instanceof Text) {
    //       console.log(overlay, valueScope, mouseVMax, mouseVMin);
    //       console.log(
    //         valueScope.maxX < mouseVMin.xV,
    //         valueScope.minX > mouseVMax.xV,
    //         valueScope.maxY < mouseVMin.yV,
    //         valueScope.minY > mouseVMax.yV
    //       );
    //     }
    //   });
    //   console.log(arr);
    // }

    return (
      [...this.currentDrawOverlays]
        /** 覆盖物可以拖拽的情况下优先触发处于 isClick 状态的覆盖物 */
        .sort(
          (a, b) =>
            (a.isDraggable && a.isClick ? 0 : 1) -
            (b.isDraggable && b.isClick ? 0 : 1)
        )
        .find((overlay) => {
          const valueScope = overlay.valueScope;
          if (valueScope) {
            if (
              valueScope.maxX < mouseVMin.xV ||
              valueScope.minX > mouseVMax.xV ||
              valueScope.maxY < mouseVMin.yV ||
              valueScope.minY > mouseVMax.yV
            )
              return false;
          }

          return overlay.isPointInAnywhere(offsetX, offsetY);
        })
    );
  }

  /** 销毁resizeObserver监听器 */
  protected destroy() {
    this.resizeObserver?.disconnect();
  }
}
