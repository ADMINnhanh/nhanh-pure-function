import { _MergeObjects } from "../src/Utility";

describe("_MergeObjects", () => {
  it("should return B when types of A and B are different", () => {
    const A = { key: "value" };
    const B = [1, 2, 3];
    expect(_MergeObjects(A, B)).toBe(B);
  });

  it("should merge objects with overlapping keys", () => {
    const A = { key1: "value1", key2: "value2" };
    const B = { key2: "newValue2", key3: "value3" };
    const expected = { key1: "value1", key2: "newValue2", key3: "value3" };
    expect(_MergeObjects(A, B)).toEqual(expected);
  });

  it("should merge objects with no overlapping keys", () => {
    const A = { key1: "value1" };
    const B = { key2: "value2" };
    const expected = { key1: "value1", key2: "value2" };
    expect(_MergeObjects(A, B)).toEqual(expected);
  });

  it("should merge arrays with overlapping indices", () => {
    const A = [1, 2, 3];
    const B = [4, 5];
    const expected = [4, 5, 3];
    expect(_MergeObjects(A, B)).toEqual(expected);
  });

  it("should merge arrays with no overlapping indices", () => {
    const A = [1, 2];
    const B = [3, 4, 5];
    const expected = [3, 4, 5];
    expect(_MergeObjects(A, B)).toEqual(expected);
  });

  it("should handle empty objects", () => {
    const A = {};
    const B = {};
    expect(_MergeObjects(A, B)).toEqual({});
  });

  it("should handle empty arrays", () => {
    const A = [];
    const B = [];
    expect(_MergeObjects(A, B)).toEqual([]);
  });
});
