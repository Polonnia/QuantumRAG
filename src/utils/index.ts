/**
 * 日期格式化
 * @param date 日期
 * @param fmt 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, fmt: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  
  let d: Date;
  if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  
  const o: Record<string, number> = {
    'M+': d.getMonth() + 1, // 月份
    'D+': d.getDate(), // 日
    'H+': d.getHours(), // 小时
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
    'Q+': Math.floor((d.getMonth() + 3) / 3), // 季度
    'S': d.getMilliseconds() // 毫秒
  };
  
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k].toString() : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  }
  
  return fmt;
}

/**
 * 文件大小格式化
 * @param size 文件大小(KB)
 * @returns 格式化后的文件大小
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return size.toFixed(2) + ' KB';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' MB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' GB';
  }
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间(ms)
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param interval 时间间隔(ms)
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, interval: number): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (obj instanceof Object) {
    const copy = {} as Record<string, any>;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return copy as T;
  }
  
  return obj;
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 获取文件图标类名
 * @param fileType 文件类型或扩展名
 * @returns 图标类名
 */
export function getFileIconClass(fileType: string): string {
  const type = fileType.toLowerCase();
  
  // 文档类型
  if (['doc', 'docx', 'word'].includes(type)) return 'document';
  if (['xls', 'xlsx', 'excel'].includes(type)) return 'excel';
  if (['ppt', 'pptx', 'powerpoint'].includes(type)) return 'ppt';
  if (['pdf'].includes(type)) return 'pdf';
  if (['txt', 'text'].includes(type)) return 'text-file';
  
  // 图片类型
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'image'].includes(type)) return 'picture';
  
  // 视频类型
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'video'].includes(type)) return 'video';
  
  // 音频类型
  if (['mp3', 'wav', 'ogg', 'audio'].includes(type)) return 'music';
  
  // 压缩文件类型
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return 'folder-zip';
  
  // 代码文件类型
  if (['js', 'ts', 'java', 'py', 'c', 'cpp', 'cs', 'php', 'html', 'css', 'code'].includes(type)) return 'code-file';
  
  // 默认返回普通文件图标
  return 'files';
}
