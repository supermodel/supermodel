export type Worker = (data: any) => Promise<any>;
export type DataFetcher = () => any | undefined;

export class PromisePool {
  private worker: Worker;
  private dataFetcher: DataFetcher;
  private concurrency: number;
  private poolSize: number;
  private callbacks?: { reject: (error: Error) => void; resolve: () => void };
  private done: boolean;

  constructor(worker: Worker, dataFetcher: DataFetcher, concurrency: number) {
    this.worker = worker;
    this.dataFetcher = dataFetcher;
    this.concurrency = concurrency;
    this.poolSize = 0;
    this.done = false;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.callbacks = { reject, resolve };
      this.startPool();
    });
  }

  abort(err = new Error('Abort pool without particular reason')) {
    if (!this.callbacks) {
      throw new Error("Can't abort unstarted pool");
    }

    if (this.done) {
      throw new Error("Can't abort finished pool");
    }

    this.done = true;
    this.callbacks.reject(err);
  }

  private async fetchData() {
    return await this.dataFetcher();
  }

  private startPool() {
    for (let i = 0; i < this.concurrency; i++) {
      this.buildWorker(Promise.resolve());
    }
  }

  private buildWorker(promise: Promise<any>) {
    ++this.poolSize;

    promise.then(this.onWorkerDone).catch(this.onWorkerFail);
  }

  private onWorkerDone = async () => {
    --this.poolSize;

    if (!this.done) {
      const data = await this.fetchData();

      if (data) {
        this.buildWorker(this.worker(data));
      } else if (this.poolSize === 0 && this.callbacks) {
        this.done = true;
        this.callbacks.resolve();
      }
    }
  };

  private onWorkerFail = (error: Error) => {
    if (this.callbacks) {
      this.done = true;
      // TODO: wait for pending workers and then reject
      this.callbacks.reject(error);
    }
  };
}
