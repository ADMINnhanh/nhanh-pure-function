/**
 * 将不同格式的数据转换为图像 URL
 * 此函数支持多种类型的数据输入，包括字符串（Base64/Data URL）、ArrayBuffer、Uint8Array和File，
 * 并尝试将这些数据转换为指定MIME类型的图像URL
 *
 * @param data - 输入数据，可以是字符串（Base64/Data URL）、ArrayBuffer、Uint8Array或File实例
 * @param mimeType - 期望的图像MIME类型，默认为'image/png'
 * @returns 成功时返回图像的URL，失败时返回null
 */
export function _Blob_ConvertDataToImageUrl(
  data: string | ArrayBuffer | Uint8Array | File,
  mimeType: string = "image/png"
) {
  try {
    let uint8Array: Uint8Array;
    let resolvedMimeType = mimeType;

    // 处理 File 类型
    if (data instanceof File) {
      return URL.createObjectURL(data);
    }

    // 处理字符串类型（Base64/Data URL）
    else if (typeof data === "string") {
      let base64Data = data;

      // 匹配 Data URL 格式（支持任意MIME类型）
      const dataUrlMatch = base64Data.match(/^data:([^;]*)(;base64)?,(.*)$/i);

      if (dataUrlMatch) {
        // 验证是否包含base64声明
        if (!dataUrlMatch[2]) {
          return console.error("无效的数据 URL：缺少 base64 编码声明");
        }

        // 提取并处理MIME类型
        resolvedMimeType = dataUrlMatch[1] || resolvedMimeType;
        base64Data = dataUrlMatch[3];

        if (!base64Data) {
          return console.error("数据 URL 包含空有效负载");
        }
      }

      // 清理非Base64标准字符（包括空格、换行等）
      base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");

      // 解码Base64字符串
      const binaryString = atob(base64Data);
      uint8Array = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
    }

    // 处理ArrayBuffer类型
    else if (data instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(data);
    }

    // 处理Uint8Array类型
    else if (data instanceof Uint8Array) {
      uint8Array = data;
    }

    // 无效数据类型
    else {
      return console.error(
        "不支持的数据类型。应为 Base64 字符串、ArrayBuffer 或 Uint8Array"
      );
    }

    // 创建Blob对象（自动处理MIME类型）
    const blob = new Blob([uint8Array], { type: resolvedMimeType });

    // 生成临时URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(
      "数据到 ImageURL 的转换失败：",
      (error as Error).message,
      (error as Error).stack || "没有可用的堆栈跟踪"
    );
    return null;
  }
}
