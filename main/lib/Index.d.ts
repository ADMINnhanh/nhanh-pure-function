export * from "./Utility/Utility";
export * from "./User/User";
export * from "./Math/Math";

/** 提取单个函数的参数类型 */
export type ExtractParameters<T> = T extends (...args: infer P) => any
  ? P
  : never;
