import { expect } from 'chai'

import { hold } from '../src/index'

describe('hold', () => {
  it('should be a function', () => {
    expect(hold).to.be.a('function')
  })

  it('should hold until resolved', async () => {
    const holder = hold()
    const start = new Date().getTime()
    setTimeout(() => holder.resolve(), 10)
    await holder.promise
    const end = new Date().getTime()

    expect(end - start)
      .to.be.above(5)
      .and.below(15)
  })
})
