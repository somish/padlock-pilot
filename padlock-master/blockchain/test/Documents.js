let { expect } = require('chai')
let { BN, expectEvent } = require('@openzeppelin/test-helpers')
let TestDocuments = artifacts.require('./TestDocuments')

/**
 * Testing for Document capabilities in Padlock v0.1.0
 * @dev uses TestDocuments.sol
 */
contract('Document Library Testing', (accounts) => {
  let instance, header, body

  let toB64 = (str) => Buffer.from(str).toString('base64')

  before(async () => {
    instance = await TestDocuments.deployed()
    header = web3.utils.sha3(toB64('This is my comment title!'))
    body = web3.utils.sha3(toB64('This is my comment body! There is lots of text here because it is a body.'))
  })

  it('Can create a document with title, body, op, timestamp', async () => {
    let { logs } = await instance.testInit(header, body, { from: accounts[0] })
    expectEvent.inLogs(logs, 'DocumentAdded', { _by: accounts[0], _index: new BN(1) })
  })

  it('Document data can be retrieved with integrity', async () => {
    let { init, title, op, docHash, timestamp } = await instance.documents(1)
    expect(init).to.be.true
    expect(title).to.be.equal(header)
    expect(op).to.be.equal(accounts[0])
    expect(docHash).to.be.equal(body)
    expect(timestamp.toNumber()).to.be.not.equal(0)
  })
})
