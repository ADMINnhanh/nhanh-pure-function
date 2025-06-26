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
 * 下载文件
 * @param {string} href - 文件路径
 * @param {string} [fileName] - 导出文件名
 */
export function _File_Download(href: string, fileName?: string) {
  return new Promise((resolve, reject) => {
    try {
      fileName = fileName || _Format_HrefName(href, "downloaded_file");
      fetch(href)
        .then((response) => {
          if (!response.ok) reject(`文件下载失败，状态码: ${response.status}`);
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = decodeURIComponent(fileName!);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve(blob);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
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
