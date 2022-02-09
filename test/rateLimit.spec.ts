import { expect } from 'chai'

import { supervise, RPM } from '../src/index'

describe('rate limit', () => {
  it('limits rate of callback execution', async () => {
    // 100 req/sec * 100 0ms waits should take 1 second
    const rpm = { req: 100, min: 1 / 60, smooth: false }
    const reqs = 112

    let q = new Array(reqs).fill(0)
    q = q.map(() => r)
    // q = q.map(() => () => p(1))

    let start = new Date().getTime()
    await supervise(q, 1, rpm)
    let end = new Date().getTime()

    expect(reqs / (end - start)).below(rpm.req / (rpm.min * 60_000))

    // 50 / 10 sleeps should be close to 50/10 * wait or 5 * 50 = 250ms
    // q = new Array(50).fill(0)
    // q = q.map(() => () => p(50))

    // start = new Date().getTime()
    // await supervise(q, 10)
    // end = new Date().getTime()

    // expect(end - start)
    //   .to.be.above(250)
    //   .and.below(280)
  })

  //   it('supervises variable known sleeps', async () => {
  //     const p = (wait: number) => () =>
  //       new Promise<void>((res) =>
  //         setTimeout(() => {
  //           res()
  //         }, wait),
  //       )

  //     let q = [p(30), p(60), p(20), p(60), p(10), p(40)]

  //     // with 4 agents running, the total should be just over 70 ms.
  //     // in an initial block of: [p(30), p(60), p(20), p(60)], the 20
  //     // sleep finishes first and is replaced with a 10; the 30 finishes next and
  //     // is replaced with 40, this should be the last sleep to finish 30 + 40 = 70
  //     // factor in runtime and time slippage
  //     const start = new Date().getTime()
  //     await supervise(q, 4)
  //     const end = new Date().getTime()

  //     expect(end - start)
  //       .to.be.above(69)
  //       .and.below(80)
  //   })

  //   it('supervises variable random sleeps', async () => {
  //     const p = (wait: number) =>
  //       new Promise<void>((res) =>
  //         setTimeout(() => {
  //           res()
  //         }, wait),
  //       )

  //     let q = new Array(100).fill(0)
  //     const rand = (): number => Math.ceil(Math.random() * 50)
  //     q = q.map(() => {
  //       const r = rand()
  //       return () => p(r)
  //     })

  //     // 100 in batches of 10, w/ max 50 ms per sleep
  //     // expectations are built on observational norms
  //     // Average wait is 25ms; rough guess about math
  //     // 100/10 * 25ms = ~250ms
  //     let start = new Date().getTime()
  //     await supervise(q, 10)
  //     let end = new Date().getTime()

  //     expect(end - start)
  //       .to.be.above(220)
  //       .and.below(320)
  //   })

  //   it('supervises other variable random sleeps', async () => {
  //     const p = (wait: number) =>
  //       new Promise<void>((res) =>
  //         setTimeout(() => {
  //           res()
  //         }, wait),
  //       )

  //     let q = new Array(1000).fill(0)
  //     const rand = (): number => Math.ceil(Math.random() * 50)
  //     q = q.map(() => {
  //       const r = rand()
  //       return () => p(r)
  //     })

  //     // 1000 in batches of 100, w/ max 50 ms per sleep
  //     // expectations are built on observational norms
  //     // Average wait is 25ms; rough guess about math
  //     // 1000/100 * 25ms = ~250ms
  //     let start = new Date().getTime()
  //     await supervise(q, 100)
  //     let end = new Date().getTime()

  //     expect(end - start)
  //       .to.be.above(250)
  //       .and.below(300)
  //   })

  //   it('supervises large numbers of variable random sleeps', async () => {
  //     const p = (wait: number) =>
  //       new Promise<void>((res) =>
  //         setTimeout(() => {
  //           res()
  //         }, wait),
  //       )

  //     let q = new Array(10_000).fill(0)
  //     const rand = (): number => Math.ceil(Math.random() * 50)
  //     q = q.map(() => {
  //       const r = rand()
  //       return () => p(r)
  //     })

  //     // 10,000 in batches of 1,000, w/ max 50 ms per sleep
  //     // expectations are built on observational norms
  //     // Average wait is 25ms; rough guess about math
  //     // 10,000/1,000 * 25ms = ~250ms
  //     let start = new Date().getTime()
  //     await supervise(q, 1_000)
  //     let end = new Date().getTime()

  //     expect(end - start)
  //       .to.be.above(280)
  //       .and.below(310)
  //   })

  //   it('compares to Promise.all', async () => {
  //     function p(wait: number) {
  //       return new Promise<number>((res) =>
  //         setTimeout(() => {
  //           res(1)
  //         }, wait),
  //       )
  //     }

  //     const COUNT = 10_000
  //     const SLEEP_MS = 500
  //     let q = new Array(COUNT).fill(0)
  //     const rand = (): number => Math.ceil(Math.random() * SLEEP_MS)
  //     q = q.map(() => {
  //       const r = rand()
  //       return p(r)
  //     })

  //     let start = new Date().getTime()
  //     const batchLen = 1_000
  //     let i = 0
  //     function* generator() {
  //       while (i + batchLen <= COUNT) {
  //         yield q.slice(i, (i += batchLen))
  //       }
  //     }
  //     for await (let promises of generator()) {
  //       await Promise.all(promises)
  //     }

  //     let end = new Date().getTime()

  //     expect(end - start)
  //       .to.be.above(480)
  //       .and.below(520)
  //   })
})
// let i = 0
const r = () => {
  // const s = `asdf${i}`
  // i++
  // console.log(s)
}

const p = (wait: number) => {
  return new Promise<void>((res) =>
    setTimeout(() => {
      res()
    }, wait),
  )
}
