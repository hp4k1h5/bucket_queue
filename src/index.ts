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
  start_time: number
}

export const counter: Counter = {
  hold: new Holder(),
  concurrent: 0,
  executed: 0,
  start_time: new Date().getTime(),
}

export interface RPM {
  req: 1_000 | number
  min: 1 | number
  smooth?: false | boolean
}

export async function supervise(
  queue: Queue,
  maxConcurrent: number,
  rpm?: RPM,
) {
  counter.start_time = new Date().getTime()
  // rpm is per minute, but treated in ms inside this fn
  const mspm = 60_000
  let rpmsTarget = 0
  let msprTarget = 0
  if (rpm) {
    rpmsTarget = rpm.req / (rpm.min * mspm)
    msprTarget = 1 / rpmsTarget
  }

  const _q = q(queue)

  let done: boolean | undefined = false
  let value: any

  // main loop
  while (true) {
    // rate limit
    rpm && (await limit(rpm, counter, rpmsTarget, msprTarget, maxConcurrent))
    ;({ done, value } = await _q.next())

    // cancelled by async generator
    if (done) break

    // check concurrent operations, hold if necessary;
    // hold is cancelled by resolved async calls
    if (counter.concurrent >= maxConcurrent) {
      counter.hold = new Holder()
      await counter.hold.promise
    }
    // dispatch promise asynchronously
    dispatch(value, counter)
  }

  // await last batch of dispatches. ensure supervisor returns only when all
  // functions have finished execution
  while (counter.hold && counter.concurrent > 0) {
    counter.hold = new Holder()
    await counter.hold.promise
  }
}

async function dispatch(fn: () => any, counter: Counter) {
  counter.concurrent++

  await fn()

  counter.concurrent--

  if (counter.hold) {
    counter.hold.resolve()
  }

  counter.executed++
}

async function limit(
  rpm: RPM,
  counter: Counter,
  rpmsTarget: number,
  msprTarget: number,
  maxConcurrent: number,
) {
  const msDiff = new Date().getTime() - counter.start_time || 1
  const rpmsObserved = counter.executed / msDiff
  const msprObserved = msDiff / counter.executed

  let waitTime = (rpmsObserved + 1) * msprTarget - msprTarget
  const rateDiff = rpmsObserved - rpmsTarget
  if (rateDiff > 0) {
    console.log('rpmDiff', {
      ex: counter.executed,
      msDiff,
      rpmsObserved,
      rpmsTarget,
      msprTarget,
      msprObserved,
      waitTime,
    })
    // if (rpm.smooth) {
    //   waitTime = waitTime / maxConcurrent
    // }
    await wait(waitTime)
  }
}

function wait(time: number) {
  return new Promise((res) => setTimeout(() => res(true), time))
}
