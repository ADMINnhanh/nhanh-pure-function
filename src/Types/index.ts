/**
 * 将类型 T 中指定的属性 K 改为必填，其他属性保持原有状态（必填/可选）
 * @template T - 原始类型
 * @template K - 需要改为必填的属性集合（必须是 T 的属性键）
 * @returns 新类型，其中 K 对应的属性为必填，其他属性保持 T 中原有的状态
 * @example
 * type User = { name?: string; age?: number; id: string }
 * type RequiredName = RequiredBy<User, 'name'>
 * // 结果：{ name: string; age?: number; id: string }
 */
export type RequiredBy<T, K extends keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;

/**
 * 将类型 T 中指定的属性 K 改为可选，其他属性保持原有状态（必填/可选）
 * @template T - 原始类型
 * @template K - 需要改为可选的属性集合（必须是 T 的属性键）
 * @returns 新类型，其中 K 对应的属性为可选，其他属性保持 T 中原有的状态
 * @example
 * type User = { name: string; age: number; id?: string }
 * type OptionalAge = PartialBy<User, 'age'>
 * // 结果：{ name: string; age?: number; id?: string }
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
