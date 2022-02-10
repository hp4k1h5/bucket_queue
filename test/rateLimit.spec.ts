import { expect } from 'chai'

import { supervise, RPM } from '../src/index'

describe('rate limit', () => {
  it('limits rate of callback execution', async () => {
    // 100 req/sec * 100 0ms waits should take 1 second
    const rpm = { req: 500, min: 1 / 60, smooth: false }
    const reqs = 1000

    let q = new Array(reqs).fill(0)
    q = q.map(() => r)
    // q = q.map(() => () => p(1))

    let start = new Date().getTime()
    await supervise(q, 1, rpm)
    let end = new Date().getTime()

    expect(reqs / (end - start)).to.be.below(rpm.req / (rpm.min * 60_000))
    // .and.above((rpm.req / (rpm.min * 60_000)) * 0.9)
  })
})
const r = () => undefined

const p = (wait: number) => {
  return new Promise<void>((res) =>
    setTimeout(() => {
      res()
    }, wait),
  )
}
