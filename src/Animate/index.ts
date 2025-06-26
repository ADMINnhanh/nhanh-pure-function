/**
 * 进度
 * @param {(schedule)=>void} callback callback( 进度百分比 )
 * @param {Number} TIME 总时长
 * @returns {Function} 停止函数
 */
export function _Animate_Schedule(
  callback: (schedule: number) => void,
  TIME = 500
) {
  let t: number;
  let canContinueExecution = true;
  function loop(time: number) {
    if (!canContinueExecution) return;
    if (!t) t = time;
    let percentage = Math.min((time - t) / TIME, 1);
    callback(percentage);
    if (time - t < TIME) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  return () => (canContinueExecution = false);
}

/**
 * 创建指定范围的振荡器，在最小值和最大值之间循环变化
 * @param initialMin - 振荡器初始最小值
 * @param initialMax - 振荡器初始最大值
 * @param initialSteps - 从最小值到最大值所需的动画步数
 * @param callback - 每帧更新时的回调函数，接收当前振荡值
 * @param precision - 数值精度（保留小数位数，默认2位）
 * @returns 振荡器控制对象，包含播放/暂停/参数更新等方法
 */
export function _Animate_CreateOscillator(
  initialMin: number,
  initialMax: number,
  initialSteps: number,
  callback: (value: number) => void,
  precision = 2
) {
  // 状态变量
  let current = initialMin;
  let isPlaying = false;
  let direction: 1 | -1 = 1;

  // 可修改参数
  let min = initialMin;
  let max = initialMax;
  let steps = initialSteps;

  // 计算步长
  const calculateStepSize = () => {
    const rawStep = (max - min) / steps;
    return Number(rawStep.toFixed(precision));
  };

  let stepSize = calculateStepSize();

  // 数值处理工具
  const clamp = (value: number) => Math.min(Math.max(value, min), max);
  const toPrecision = (value: number) => Number(value.toFixed(precision));

  // 参数验证函数
  const validateParams = (newMin: number, newMax: number, newSteps: number) => {
    const errors: string[] = [];

    if (newMin >= newMax) {
      errors.push("最小值必须小于最大值");
    }

    if (newSteps <= 0) {
      errors.push("分段数必须为正数");
    }

    return errors;
  };

  // 更新参数的核心方法
  const updateParams = (newMin: number, newMax: number, newSteps: number) => {
    const errors = validateParams(newMin, newMax, newSteps);

    if (errors.length > 0) {
      console.error(`参数更新失败: ${errors.join("; ")}`);
      return false;
    }

    min = newMin;
    max = newMax;
    steps = newSteps;
    stepSize = calculateStepSize();

    // 校正当前值
    current = clamp(current);

    return true;
  };

  // 动画循环
  const animate = () => {
    if (!isPlaying) return;

    // 更新方向和值
    direction = current >= max ? -1 : current <= min ? 1 : direction;
    current = clamp(current + stepSize * direction);

    callback(toPrecision(current));
    requestAnimationFrame(animate);
  };

  return {
    /** 启动/继续动画 */
    play(target = current) {
      current = clamp(target);

      if (validateParams(min, max, steps).length) {
        return console.warn("配置参数错误", this.getParams());
      }

      // 3. 启动动画（如果未运行）
      if (!isPlaying) {
        isPlaying = true;
        animate();
      }
    },

    /** 暂停动画 */
    pause() {
      isPlaying = false;
    },

    /** 获取当前值 */
    getCurrent: () => toPrecision(current),

    /** 是否正在运行 */
    isPlaying: () => isPlaying,

    /** 更新参数（不中断动画） */
    updateParams,

    /** 获取当前参数 */
    getParams: () => ({ min, max, steps, precision, stepSize }),
  };
}

/**
 * 动画过渡数值变化
 * @param startValue - 起始值
 * @param targetValue - 目标值
 * @param stepCount - 动画步数
 * @param callback - 每帧回调函数
 * @param precision - 数值精度（默认2位小数）
 */
export function _Animate_NumericTransition(
  startValue: number,
  targetValue: number,
  stepCount: number,
  callback: (currentValue: number) => void,
  precision: number = 2
): void {
  if (stepCount <= 0) return;

  const toFixedPrecision = (value: number) => Number(value.toFixed(precision));
  const distance = targetValue - startValue;

  // 计算实际步长（考虑精度）
  const stepSize = toFixedPrecision(Math.abs(distance) / stepCount);
  if (stepSize === 0) return;

  const direction = Math.sign(distance);
  let currentValue = startValue;

  const animate = () => {
    // 计算新值并应用精度
    currentValue = toFixedPrecision(currentValue + stepSize * direction);

    // 边界检查防止过冲
    const shouldContinue =
      direction > 0 ? currentValue < targetValue : currentValue > targetValue;

    if (shouldContinue) {
      callback(currentValue);
      requestAnimationFrame(animate);
    } else {
      // 确保最终到达目标值
      callback(targetValue);
    }
  };

  // 启动动画
  animate();
}
