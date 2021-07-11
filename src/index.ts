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

export async function* q(queue: any[] | (() => any[])) {
  let _queue: any
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

// async function supervise(agents) {
// })

//   return 0
// })
// const counters = {
//   agents: 0,
//   cycle_start: new Date().getTime(),
//   reqs: 0,
//   cancel: () => {},
// }

// let done: boolean = false
// let agent
// while (!done) {
//   if (counters.agents < config.caw.agents) {
//     ;({ done, value: agent } = await agents.next())
//     if (done) break

//     // if at max_rph, hold until next cycle

//     // TODO: move to assign agents determine allotted requests
//     agent.settings.agent_time = keepTime(agent.settings, counters)
//     dispatch(agent.epicycle, counters)
//   } else {
//     const time = wait(100000)
//     counters.cancel = time.cancel
//     await time
//   }
// }
// }
