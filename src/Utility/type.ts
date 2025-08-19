// 公共常量
export const PATH_SEGMENT_REGEX = /\w*(?:\[\d+\])+|\w+/g;
export const ARRAY_PATH_REGEX = /^\w*(?:\[\d+\])+$/;
export const ARRAY_PART_REGEX = /\w+|(\[\d+\])/g;
export const INDEX_EXTRACT_REGEX = /\[(\d+)\]/;

/**
 * 解析路径字符串为路径段数组
 * @param path - 需要解析的路径字符串
 * @returns 路径段数组，如果路径为空则返回空数组
 */
export function _parsePathSegments(path: string): string[] {
  if (!path) return [];
  const segments = path.match(PATH_SEGMENT_REGEX);
  return segments || [];
}
