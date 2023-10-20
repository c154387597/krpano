export interface PromiseQueueItem<T> {
  resolve(value: T): void;
  reject(error: Error): void;
}

export class PromiseQueue<T> {
  private queue: Array<PromiseQueueItem<T>> = [];

  /**
   * 返回一个 promise 用于等待
   */
  push = () => {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  };
  unshift = () => {
    return new Promise<T>((resolve, reject) => {
      this.queue.unshift({ resolve, reject });
    });
  };

  /**
   * 清空队列, 正常结束
   */
  flushResolve = (value: T) => {
    this.queue.forEach((item) => item.resolve(value));
    this.queue = [];
  };

  /**
   * 清空队列, 移除结束
   */
  flushReject = (error: Error) => {
    this.queue.forEach((item) => item.reject(error));
    this.queue = [];
  };
}
