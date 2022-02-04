type Resolve = (value: void) => void

export class Holder {
  promise: Promise<void>
  resolve: Resolve

  constructor() {
    // order of these is important, else resolve clears itself
    this.resolve = () => null
    this.promise = new Promise((resolve: Resolve) => {
      this.resolve = resolve
    })
  }
}

export const holder = new Holder()

type Queue = any[] | (() => any[])

export async function* q(queue: Queue) {
  let _queue: Queue
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
  executed: number
  hold: Holder
  start_time: number | null
}

export const counter: Counter = {
  concurrent: 0,
  executed: 0,
  hold: new Holder(),
  start_time: null,
}

export async function supervise(
  queue: Queue,
  maxConcurrent: number,
  stats = false,
) {
  counter.start_time = new Date().getTime()

  const _q = q(queue)

  let done: boolean | undefined = false
  let value: any

  // event loop
  while (true) {
    ;({ done, value } = await _q.next())

    // cancelled by async generator
    if (done) break

    // check concurrent operations, hold if necessary;
    // hold is cancelled by resolved async calls
    if (counter.concurrent >= maxConcurrent) {
      counter.hold = new Holder()
      await counter.hold.promise
    }
    // exec promise asynchronously
    dispatch(value, counter)
  }

  // await last _n_ dispatches
  // ensure function returns only when all functions have finished execution
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

  counter.executed++
}
