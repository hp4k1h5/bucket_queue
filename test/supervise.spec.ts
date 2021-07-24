import { expect } from 'chai'

import { supervise } from '../src/index'

describe('supervise', () => {
  it('supervises static random sleeps', async () => {
    const p = (wait: number) => {
      return new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )
    }

    // five concurrent sleeps should be close to 1 * wait
    // or 50ms +/- 10
    let q = new Array(5).fill(0)
    q = q.map(() => () => p(50))

    let start = new Date().getTime()
    await supervise(q, 5)
    let end = new Date().getTime()

    expect(end - start)
      .to.be.above(50)
      .and.below(60)

    // 50 / 10 sleeps should be close to 50/10 * wait
    // or 5 * 50 = 250ms + 20 latency
    q = new Array(50).fill(0)
    q = q.map(() => () => p(50))

    start = new Date().getTime()
    await supervise(q, 10)
    end = new Date().getTime()

    expect(end - start)
      .to.be.above(260)
      .and.below(280)
  })

  it('supervises variable known sleeps', async () => {
    const p = (wait: number) => () =>
      new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )

    let q = [p(30), p(60), p(20), p(60), p(10), p(10)]

    // with 4 agents running, the total should be just over 60 ms
    // an initial block of:
    // [p(30), p(60), p(20), p(60)]
    // the 30 and 20 sleeps finish first and are replaced with 10 and 10 before the 60's complete
    // factor in runtime and time slippage
    const start = new Date().getTime()
    await supervise(q, 4)
    const end = new Date().getTime()

    expect(end - start)
      .to.be.above(59)
      .and.below(70)
  })

  it('supervises variable random sleeps', async () => {
    const p = (wait: number) =>
      new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )

    let q = new Array(100).fill(0)
    const rand = (): number => Math.ceil(Math.random() * 50)
    q = q.map(() => {
      const r = rand()
      return () => p(r)
    })

    // 100 in batches of 10, w/ max 50 ms per sleep
    // expectations are built on observational norms
    // Average wait is 25ms; rough guess about math
    // 100/10 * 25ms = ~250ms
    let start = new Date().getTime()
    await supervise(q, 10)
    let end = new Date().getTime()

    expect(end - start)
      .to.be.above(250)
      .and.below(310)
  })

  it('supervises other variable random sleeps', async () => {
    const p = (wait: number) =>
      new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )

    let q = new Array(1000).fill(0)
    const rand = (): number => Math.ceil(Math.random() * 50)
    q = q.map(() => {
      const r = rand()
      return () => p(r)
    })

    // 1000 in batches of 100, w/ max 50 ms per sleep
    // expectations are built on observational norms
    // Average wait is 25ms; rough guess about math
    // 1000/100 * 25ms = ~250ms
    let start = new Date().getTime()
    await supervise(q, 100)
    let end = new Date().getTime()

    expect(end - start)
      .to.be.above(250)
      .and.below(300)
  })

  it('supervises large numbers of variable random sleeps', async () => {
    const p = (wait: number) =>
      new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )

    let q = new Array(10_000).fill(0)
    const rand = (): number => Math.ceil(Math.random() * 50)
    q = q.map(() => {
      const r = rand()
      return () => p(r)
    })

    // 10,000 in batches of 1,000, w/ max 50 ms per sleep
    // expectations are built on observational norms
    // Average wait is 25ms; rough guess about math
    // 10,000/1,000 * 25ms = ~250ms
    let start = new Date().getTime()
    await supervise(q, 1_000)
    let end = new Date().getTime()

    expect(end - start)
      .to.be.above(280)
      .and.below(310)
  })

  it('compares to Promise.all', async () => {
    function p(wait: number) {
      return new Promise<number>((res) =>
        setTimeout(() => {
          // console.log('resolving', wait)
          res(1)
        }, wait),
      )
    }

    let q = new Array(100).fill(0)
    const rand = (): number => Math.ceil(Math.random() * 500)
    q = q.map(() => {
      const r = rand()
      return p(r)
    })

    // async function pA(promises) {
    //   const a = Promise.all(promises)
    //   await a
    // }
    // 100,000 in batches of 10,000, w/ max 50 ms per sleep
    // expectations are built on observational norms
    // Average longest sleep should be near max 50ms; rough guess about math
    // 100,000/10,000 * 50ms = ~500ms

    let start = new Date().getTime()
    let i = 0
    const batchLen = 10
    for (i; i < 100; i += batchLen) {
      // const promises = [new Promise((res) => setTimeout(res, 50))]
      const promises = q.slice(i, i + batchLen)
      await Promise.allSettled(promises)
      i += batchLen
      console.log('i', i)
    }

    let end = new Date().getTime()

    expect(end - start)
      .to.be.above(500)
      .and.below(550)
  })
})
