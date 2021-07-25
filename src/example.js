// Example Usage

// This package depends on the user passing the supervisor
// an array of functions or a generator that returns arrays
// of functions

// A queue made of an array of functions typically looks
// like:
const queueArr = [async () => {}, async () => {}]

// A queue function will return a queue array, as above, or an empty array,
// signalling process termination
const queueFn = function (): () => number[] {

  // it is recommended to maintain your own state, either
  // inside this function, or by using an external mechanism
  const LIMIT = 100
  let OFFSET = 0

  return async function (): any[] {
    // example db query to bring back next batch of urls
    const urls = await _db.get('urls', {LIMIT, OFFSET})
    
    // empty array signals end of process to the queue
    // manager,
    if (!urls.length) return []

    // increment OFFSET
    OFFSET += LIMIT

    // otherwise wrap urls in requests to be queued by the queue manager and
    // executed by the supervisor
    return urls.map(url => async () => await fetch(url))
    }
  }
}

// instantiate queue function
const _qFn = queueFn()

const maxConcurrent = 20

// pass queue function to supervisor
;(async () => {
  await supervise(_qFn, maxConcurrent)
})()

// In general it might be best to ensure that the queue function returns more
// functions than max concurrent processes to allow the queue function enough
// time to keep the bucket of active processes full.
