class Holder {
  promise: Promise<void>
  resolve: (value: void) => void

  constructor() {
    this.resolve = () => null
    this.promise = new Promise((resolve: (value: void) => void) => {
      this.resolve = resolve
    })
  }
}

export function hold(): Holder {
  return new Holder()
}

/* async function supervise(agents) { */
/*   const counters = { */
/*     agents: 0, */
/*     cycle_start: new Date().getTime(), */
/*     reqs: 0, */
/*     cancel: () => {}, */
/*   } */

/*   let done: boolean = false */
/*   let agent */
/*   while (!done) { */
/*     if (counters.agents < config.caw.agents) { */
/*       ;({ done, value: agent } = await agents.next()) */
/*       if (done) break */

/*       // if at max_rph, hold until next cycle */

/*       // TODO: move to assign agents determine allotted requests */
/*       agent.settings.agent_time = keepTime(agent.settings, counters) */
/*       dispatch(agent.epicycle, counters) */
/*     } else { */
/*       const time = wait(100000) */
/*       counters.cancel = time.cancel */
/*       await time */
/*     } */
/*   } */
/* } */
