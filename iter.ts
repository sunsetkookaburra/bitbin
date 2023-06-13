export function* iterable<T>(iter: Iterator<T>) {
  while (true) {
    const { value, done } = iter.next();
    if (done) break;
    yield value;
  }
}

export function* take<T>(count: number, iter: Iterable<T>): Iterable<T> {
  const it = iter[Symbol.iterator]();
  for (let i = 0; i < count; ++i) {
    const { value, done } = it.next();
    if (done) break;
    yield value;
  }
}

export function* zip<T>(...iters: Iterable<T>[]): Iterable<T> {
  for (const iter of iters) yield* iter;
}

export function* map<T, U>(iter: Iterable<T>, f: (item: T) => U): Iterable<U> {
  for (const item of iter) yield f(item);
}

export function* chunks<T>(
  chunkSize: number,
  iter: Iterable<T>,
): Iterable<T[]> {
  let chunk = [];
  for (const item of iter) {
    chunk.push(item);
    if (chunk.length >= chunkSize) {
      yield chunk;
      chunk = [];
    }
  }

  if (chunk.length > 0) yield chunk;
}

export function readableFromIterable<T>(
  iter: Iterable<T> | AsyncIterable<T>,
): ReadableStream<T> {
  const it =
    (Symbol.iterator in iter
      ? iter[Symbol.iterator]()
      : iter[Symbol.asyncIterator]());
  return new ReadableStream({
    pull: async (controller) => {
      for (let i = 0; i < (controller.desiredSize ?? 1); ++i) {
        const { value, done } = await it.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      }
    },
    cancel: async (reason) => {
      await it.throw?.(reason);
    },
  });
}
