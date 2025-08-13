export interface Point {
  x: number;
  y: number;
}

/** 定义所有可能的数据类型字符串 */
export type DataType =
  | "null"
  | "undefined"
  | "boolean"
  | "number"
  | "string"
  | "symbol"
  | "bigint"
  | "function"
  | "array"
  | "object"
  | "date"
  | "regexp"
  | "map"
  | "set"
  | "error"
  | "promise"
  | "weakmap"
  | "weakset"
  | "arraybuffer"
  | "dataview"
  | "int8array"
  | "uint8array"
  | "uint8clampedarray"
  | "int16array"
  | "uint16array"
  | "int32array"
  | "uint32array"
  | "float32array"
  | "float64array"
  | "bigint64array"
  | "biguint64array";
