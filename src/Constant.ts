export const EXTENSION_TO_MIME = {
  /* 常见扩展名映射 */
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".opus": "audio/opus",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".wmv": "video/x-ms-wmv",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".ico": "image/vnd.microsoft.icon",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".heif": "image/heif",
  ".heic": "image/heic",
  ".json": "application/json",
  ".xml": "application/xml",
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".ts": "application/typescript",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".rtf": "application/rtf",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".7z": "application/x-7z-compressed",
  ".exe": "application/x-msdownload",
  ".apk": "application/vnd.android.package-archive",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".jsonld": "application/ld+json",
  ".yaml": "application/x-yaml",
  ".yml": "application/x-yaml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
  // 可根据需要继续扩展
};

export const FILE_EXTENSIONS = {
  image: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
    ".svg",
    ".heif",
    ".heic",
    ".ico",
    ".raw",
    ".jfif",
    ".avif",
    ".png8",
    ".indd",
    ".eps",
    ".ai",
  ],
  ppt: [".ppt", ".pptx", ".odp"],
  word: [".doc", ".docx", ".odt", ".rtf"],
  excel: [".xls", ".xlsx", ".ods", ".csv", ".tsv"],
  pdf: [".pdf"],
  text: [
    ".txt",
    ".csv",
    ".md",
    ".json",
    ".yaml",
    ".yml",
    ".log",
    ".ini",
    ".rtf",
  ],
  audio: [
    ".mp3",
    ".wav",
    ".ogg",
    ".flac",
    ".aac",
    ".wma",
    ".m4a",
    ".alac",
    ".ape",
    ".opus",
    ".amr",
    ".ra",
    ".mid",
    ".midi",
    ".aiff",
    ".pcm",
    ".au",
    ".wavpack",
    ".spx",
  ],
  video: [
    ".mp4",
    ".avi",
    ".mkv",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mpg",
    ".mpeg",
    ".3gp",
    ".vob",
    ".ogv",
    ".m4v",
    ".ts",
    ".rm",
    ".rmvb",
    ".m2ts",
    ".divx",
    ".xvid",
    ".swf",
    ".f4v",
  ],
  archive: [
    ".zip",
    ".rar",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
    ".7z",
    ".tar.gz",
    ".tar.bz2",
    ".tar.xz",
    ".tar.lz",
    ".tar.lzma",
    ".cab",
    ".iso",
    ".dmg",
    ".tgz",
    ".apk",
    ".gz2",
    ".tar.zst",
  ],
  code: [
    ".js",
    ".ts",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".html",
    ".css",
    ".scss",
    ".less",
    ".sass",
    ".php",
    ".rb",
    ".go",
    ".swift",
    ".rs",
    ".kt",
    ".scala",
    ".lua",
    ".pl",
    ".m",
    ".h",
    ".xml",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".vue",
    ".ejs",
    ".handlebars",
    ".jinja",
    ".dart",
  ],
  font: [
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".eot",
    ".svg",
    ".ttc",
    ".fnt",
    ".fon",
    ".otc",
  ],
  database: [
    ".sql",
    ".sqlite",
    ".db",
    ".mdb",
    ".accdb",
    ".jsonld",
    ".xml",
    ".csv",
  ],
  markup: [".html", ".htm", ".xhtml", ".xml", ".json", ".yaml", ".yml"],
  configuration: [
    ".ini",
    ".conf",
    ".cfg",
    ".env",
    ".properties",
    ".json",
    ".toml",
  ],
  logs: [".log", ".err", ".trace", ".out"],
  script: [
    ".bash",
    ".sh",
    ".zsh",
    ".bat",
    ".ps1",
    ".vbs",
    ".cmd",
    ".sed",
    ".awk",
    ".php",
  ],
};

export const UNIT_LABELS = [
  "",
  "万",
  "亿",
  "兆",
  "京",
  "垓",
  "秭",
  "穰",
  "沟",
  "涧",
  "正",
  "载",
  "极",
] as const;

export const WINDOW_TARGET = ["_self", "_blank", "_parent", "_top"] as const;
export type WindowTarget = (typeof WINDOW_TARGET)[number];
