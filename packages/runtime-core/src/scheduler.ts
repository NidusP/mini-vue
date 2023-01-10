// 微任务队列
const queue: any[] = [];
// 只需创建一次promise
let isFlushPending = false;
const resolvedPromise = Promise.resolve();

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;

  nextTick(flushJobs)
  // Promise.resolve().then(() => {
  //   isFlushPending = false;
  //   let job: any;
  //   while ((job = queue.shift())) {
  //     job && job();
  //   }
  // });
}

function flushJobs(){
  isFlushPending = false;
  let job: any;
  while ((job = queue.shift())) {
    job && job();
  }
}

export function nextTick(fn) {
  return fn ? resolvedPromise.then(fn) :resolvedPromise;
}
