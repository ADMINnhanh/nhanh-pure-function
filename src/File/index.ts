import { _Format_HrefName } from "../Format";

/**
 * 读取文件
 * @param src 文件地址
 * @returns 文件的字符串内容
 */
export function _File_Read(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(src)
      .then((response) => resolve(response.text()))
      .catch((error) => {
        console.error("Error fetching :", error);
        reject(error);
      });
  });
}

/**
 * 下载文件并支持进度监控、超时控制和主动中止
 *
 * @param {string} href - 文件的 URL 路径或下载地址，需确保跨域权限或同源
 * @param {string} [fileName] - 可选，指定导出的文件名（不含扩展名时会自动从 href 提取）
 * @param {Function} [onProgress] - 可选，下载进度回调函数
 * @param {number} [onProgress.progress] - 进度百分比（0-100）
 * @param {number} [timeout=30000] - 可选，超时时间（毫秒），默认 30 秒
 * @returns {Object} 返回包含两个属性的对象：
 *   - promise: Promise 对象，成功时 resolve 下载的 Blob 数据，失败时 reject 错误信息
 *   - abort: 中止下载的函数，调用后会触发 abort 错误
 */
export function _File_Download(
  href: string,
  fileName?: string,
  onProgress?: (progress: number) => void,
  timeout = 30000
) {
  let xhr: XMLHttpRequest;
  let isAborted = false;

  const promise = new Promise<Blob>((resolve, reject) => {
    try {
      fileName = fileName || _Format_HrefName(href, "downloaded_file");
      const decodedFileName = decodeURIComponent(fileName);

      xhr = new XMLHttpRequest();
      xhr.open("GET", href);
      xhr.responseType = "blob";
      xhr.timeout = timeout;

      // 超时处理
      xhr.ontimeout = () => {
        if (!isAborted) {
          reject(new Error(`请求超时（已超过${timeout / 1000}秒）`));
        }
      };

      // 进度监控
      xhr.addEventListener("progress", (event) => {
        if (event.lengthComputable && !isAborted) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(Number(progress.toFixed(2)));
        }
      });

      // 下载完成
      xhr.addEventListener("load", () => {
        if (isAborted) return;

        if (xhr.status >= 200 && xhr.status < 300) {
          const url = URL.createObjectURL(xhr.response);
          const a = document.createElement("a");
          a.href = url;
          a.download = decodedFileName;
          a.click();
          URL.revokeObjectURL(url);
          resolve(xhr.response);
        } else {
          reject(new Error(`下载失败，状态码: ${xhr.status}`));
        }
      });

      // 错误处理
      xhr.addEventListener("error", () => {
        if (!isAborted) {
          reject(new Error("网络错误，下载失败"));
        }
      });

      // 中止处理
      xhr.addEventListener("abort", () => {
        if (!isAborted) {
          isAborted = true;
          reject(new Error("下载已被中止"));
        }
      });

      xhr.send();
    } catch (error) {
      if (!isAborted) {
        reject(error);
      }
    }
  });

  // 中止函数
  const abort = () => !isAborted && xhr.abort();

  return { promise, abort };
}

/**
 * 创建文件并下载
 * @param {BlobPart[]} content 文件内容
 * @param {string} fileName 文件名称
 * @param {BlobPropertyBag} options Blob 配置
 */
export function _File_CreateAndDownload(
  content: BlobPart[],
  fileName: string,
  options?: BlobPropertyBag
) {
  if (!options) {
    let type = fileName.replace(/^[^.]+./, "");
    type = type == fileName ? "text/plain" : "application/" + type;
    options = { type };
  }
  const bolb = new Blob(content, options);
  // 创建一个 URL，该 URL 可以用于在浏览器中引用 Blob 对象（例如，在 <a> 标签的 href 属性中）
  const url = URL.createObjectURL(bolb);

  _File_Download(url, fileName);
}
