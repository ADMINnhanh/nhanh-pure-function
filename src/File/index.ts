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
// function _File_Download1(
//   href: string,
//   fileName?: string,
//   onProgress?: (progress: number) => void
// ) {
//   return new Promise((resolve, reject) => {
//     try {
//       // 处理文件名
//       fileName = fileName || _Format_HrefName(href, "downloaded_file");
//       const decodedFileName = decodeURIComponent(fileName);

//       const xhr = new XMLHttpRequest();
//       xhr.open("GET", href);
//       // 设置响应类型为blob，适合二进制文件
//       xhr.responseType = "blob";

//       // 进度监控
//       xhr.addEventListener("progress", (event) => {
//         if (event.lengthComputable) {
//           const progress = (event.loaded / event.total) * 100;
//           onProgress?.(Number(progress.toFixed(2)));
//         }
//       });

//       // 下载完成处理
//       xhr.addEventListener("load", () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           const url = URL.createObjectURL(xhr.response);
//           const a = document.createElement("a");
//           a.href = url;
//           a.download = decodedFileName;

//           // 不需要添加到body也能触发下载
//           a.click();

//           // 清理资源
//           URL.revokeObjectURL(url);
//           resolve(xhr.response);
//         } else {
//           reject(new Error(`下载失败，状态码: ${xhr.status}`));
//         }
//       });

//       // 错误处理
//       xhr.addEventListener("error", () =>
//         reject(new Error("网络错误，下载失败"))
//       );

//       // 中断处理
//       xhr.addEventListener("abort", () => reject(new Error("下载已被中断")));

//       xhr.send();
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

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
