import { expect } from 'chai'

import { Holder, holder } from '../src/index'

describe('Holder', () => {
  it('exports a class', () => {
    expect(Holder).to.be.a('function')
  })

  it('exports an instance of Holder named holder', () => {
    expect(holder).to.be.an.instanceof(Holder)
  })

  it('holds until resolved', async () => {
    const start = new Date().getTime()
    setTimeout(() => holder.resolve(), 10)
    await holder.promise
    const end = new Date().getTime()

    expect(end - start)
      .to.be.above(5)
      .and.below(15)
  })

  it('holds until resolved -- long', async () => {
    const holder = new Holder()
    const start = new Date().getTime()
    setTimeout(() => holder.resolve(), 50)
    await holder.promise
    const end = new Date().getTime()

    expect(end - start)
      .to.be.above(45)
      .and.below(60)
  })
})
