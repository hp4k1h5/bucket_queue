import { expect } from 'chai'

import { supervise } from '../src/index'

describe('supervise', () => {
  it('supervises', async () => {
    let q = new Array(1000).fill(0)
    q = q.map((val) => {
      return () =>
        new Promise<void>((res) =>
          setTimeout(() => {
            res()
          }, 5),
        )
    })

    const start = new Date().getTime()
    await supervise(q, 100)

    const end = new Date().getTime()
    expect(end - start)
      .to.be.above(50)
      .and.below(65)
  })

  it('supervises', async () => {
    let p = (wait: number) => () =>
      new Promise<void>((res) =>
        setTimeout(() => {
          res()
        }, wait),
      )
    let q = [p(30), p(10), p(20), p(60), p(10), p(10)]
    // 10
    const start = new Date().getTime()
    await supervise(q, 2)

    const end = new Date().getTime()
    expect(end - start)
      .to.be.above(60)
      .and.below(65)
  })
})
