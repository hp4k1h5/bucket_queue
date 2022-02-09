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

  const drain = false
  while (_queue.length) {
    for await (let row of _queue) {
      yield row
    }

    // refill queue
    if (typeof queue === 'function' && !drain) {
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
  hold: new Holder(),
  concurrent: 0,
  executed: 0,
  start_time: null,
}

export async function supervise(
  queue: Queue,
  maxConcurrent: number,
  stats = false,
  rpm?: { req: 1000; min: 1; smooth: false },
) {
  counter.start_time = new Date().getTime()
  let rpmTarget = 1000
  if (rpm) {
    rpmTarget = rpm.req / rpm.min
  }

  const _q = q(queue)

  let done: boolean | undefined = false
  let value: any

  // main loop
  while (true) {
    ;({ done, value } = await _q.next())

    // cancelled by async generator
    if (done) break

    if (rpm) {
      const rpmObserved =
        (counter.executed / (new Date().getTime() - counter.start_time)) *
        60_000

      const rpmDiff = rpmObserved - rpmTarget
      if (rpmDiff > 0) {
        let waitTime = (60_000 / rpmDiff) * rpm.req
        if (rpm.smooth) {
          waitTime = waitTime / maxConcurrent
        }
        await wait(waitTime)
      }
    }

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

// increment counter, await individual async calls, decrement counter, resolve
// hold, increment execution count
async function dispatch(fn: () => any, counter: Counter) {
  counter.concurrent++

  await fn()

  counter.concurrent--

  if (counter.hold) {
    counter.hold.resolve()
  }

  counter.executed++
}

function wait(time: number) {
  return new Promise((res) => setTimeout(() => res(true), time))
}
