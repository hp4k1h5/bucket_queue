// Example Usage
const { supervise, counter } = require('./dist/src/index.js')

// bucket_queue depends on the user passing the supervisor an array of functions or a generator that returns arrays of functions

// A queue made of an array of functions typically looks like:
const queueArr = [async () => {}, async () => {}]

// A queue function will return a queue array, as above, or an empty array, signalling process termination
const queueFn = function (MAX = 0, LIMIT = 100) {
  // it is recommended to maintain your own state, either
  // inside this function, or by using an external mechanism
  let OFFSET = 0

  return async function () {
    // log progress on queue refresh
    const elapsed = new Date().getTime() - counter.start_time
    console.log({
      conc: counter.concurrent,
      elapsed,
      executed: counter.executed,
      'ex/ms': +((counter.executed / elapsed) * 1000).toFixed(4),
    })

    // sample function, returns arrays of async timeouts
    let sleeps = []
    if (OFFSET + LIMIT <= MAX)
      sleeps = Array.from(Array(LIMIT)).map(() => {
        return Math.floor(Math.random() * 1000)
      })

    // empty array signals end of process to the queue
    // manager,
    if (!sleeps.length) return []

    OFFSET += LIMIT

    // otherwise wrap sleeps to be queued by the queue manager
    return sleeps.map((sleep) => async () => await wait(sleep))
  }
}

const TOTAL_SLEEPS = 1000 // total functions to call
const MAX_CONCURRENT = 50 // max concurrency
const LIMIT = 200 // batch size

let count = 0

;(async () => {
  // instantiate queue function
  const _qFn = queueFn(TOTAL_SLEEPS, LIMIT)

  console.time('super')

  // pass queue function to supervisor
  await supervise(_qFn, MAX_CONCURRENT)

  console.timeEnd('super')

  console.log('count', count)
})()

// sample async function
async function wait(time) {
  return new Promise((res) =>
    setTimeout(() => {
      count++
      res()
    }, time),
  )
}
