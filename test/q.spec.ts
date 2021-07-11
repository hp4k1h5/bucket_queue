import { expect } from 'chai'

import { q } from '../src/index'

describe('q', () => {
  it('exports a function', () => {
    expect(q).to.be.a('function')
  })

  it('generates a queue from array', async () => {
    const queue = q([0, 1, 2])
    let { done, value } = await queue.next()

    expect(done).to.not.be.ok
    expect(value).to.equal(0)

    // call again
    ;({ done, value } = await queue.next())
    expect(done).to.not.be.ok
    expect(value).to.equal(1)
    // call again
    ;({ done, value } = await queue.next())
    expect(done).to.not.be.ok
    expect(value).to.equal(2)

    // done now
    ;({ done, value } = await queue.next())
    expect(done).to.be.ok
    expect(value).to.equal(undefined)
  })

  it('generates a queue from a function', async () => {
    const fn = function (): () => number[] {
      const max = 1
      let i = -1
      return function (): any[] {
        while (i++ < max) {
          return [i, i + 1, i + 2]
        }
        return []
      }
    }
    const _fn = fn()

    const queue = q(_fn)

    let { done, value } = await queue.next()

    expect(done).to.not.be.ok
    expect(value).to.equal(0)
    ;({ done, value } = await queue.next())
    expect(value).to.equal(1)
    ;({ done, value } = await queue.next())
    expect(value).to.equal(2)
    // second iteration
    ;({ done, value } = await queue.next())
    expect(value).to.equal(1)
    ;({ done, value } = await queue.next())
    expect(value).to.equal(2)
    ;({ done, value } = await queue.next())
    expect(value).to.equal(3)

    // done now
    ;({ done, value } = await queue.next())

    // expect(done).to.be.ok
    expect(value).to.equal(undefined)
  })
})
