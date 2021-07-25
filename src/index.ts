export class Holder {
  promise: Promise<void>
  resolve: (value: void) => void

  constructor() {
    this.resolve = () => null
    this.promise = new Promise((resolve: (value: void) => void) => {
      this.resolve = resolve
    })
  }
}

export const holder = new Holder()

type queue = any[] | (() => any[])

export async function* q(queue: queue) {
  let _queue: queue
  if (typeof queue === 'function') {
    // fill queue from fn
    _queue = await queue()
  } else {
    _queue = queue
  }

  while (_queue.length) {
    for await (let row of _queue) {
      yield row
    }

    // refill queue
    if (typeof queue === 'function') {
      _queue = await queue()
      // or end
    } else {
      _queue = []
    }
  }
}

interface Counter {
  concurrent: number
  hold: Holder
}

export async function supervise(queue: queue, maxConcurrent: number) {
  let done: boolean | undefined = false
  let value: any
  const _q = q(queue)
  const counter: Counter = {
    concurrent: 0,
    hold: new Holder(),
  }

  // event loop, cancelled by async generator
  while (true) {
    ;({ done, value } = await _q.next())
    if (done) break

    // check concurrent operations, hold if necessary;
    // hold is cancelled by resolved async calls
    if (counter.concurrent >= maxConcurrent) {
      counter.hold = new Holder()
      await counter.hold.promise
    }
    // exec promise
    dispatch(value, counter)
  }

  // await last _n_ dispatches, ensures function returns only when all
  // functions have finished execution
  while (counter.hold && counter.concurrent > 0) {
    counter.hold = new Holder()
    await counter.hold.promise
  }
}

// increment counter, await individual async calls, decrement
// counter, resolve hold
async function dispatch(fn: () => any, counter: Counter) {
  counter.concurrent++

  await fn()

  counter.concurrent--
  if (counter.hold) {
    counter.hold.resolve()
  }
}
