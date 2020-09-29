let { expect } = require('chai')
let { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let TestAgreements = artifacts.require('./TestAgreements')

/**
 * Testing for multisignature agreement capabilities in Padlock v0.1.0
 * @dev uses TestAgreements.sol
 */
contract('Multisignature Agreement Library Testing', (accounts) => {
  let instance
  let admin = accounts[0]
  let owner = accounts[1]
  let gc = accounts[2]
  let sc = accounts[3]

  before(async () => {
    instance = await TestAgreements.deployed()
  })

  describe('Initialization', async () => {
    it('A new "Change Order" Agreement can be deployed', async () => {
      let { logs } = await instance.testInitChangeOrder(admin, owner, gc, sc)
      expectEvent.inLogs(logs, 'ChangeOrderAgreement', { _admin: admin, _owner: owner, _gc: gc, _sc: sc })
      let { threshold, kind } = await instance.agreements(1)
      expect(threshold.toNumber()).to.be.equal(4)
      expect(kind.toNumber()).to.be.equals(1)
    })

    it('A new "Lien Release" Agreement can be deployed', async () => {
      let { logs } = await instance.testInitLienRelease(gc, sc)
      expectEvent.inLogs(logs, 'LienReleaseAgreement', { _gc: gc, _sc: sc })
      let { threshold, kind } = await instance.agreements(2)
      expect(threshold.toNumber()).to.be.equal(2)
      expect(kind.toNumber()).to.be.equals(2)
    })
  })

  describe('Signing', async () => {
    it('Only signatories can sign the Agreement', async () => {
      let { logs } = await instance.testSign(2, { from: gc })
      expectEvent.inLogs(logs, 'AgreementSigned', { _by: gc })
      await expectRevert(
        instance.testSign(2, { from: owner }),
        'Only predefined signers can participate in this agreement!'
      )
    })

    it('One address cannot sign Agreement twice', async () => {
      await expectRevert(instance.testSign(2, { from: gc }), 'Cannot sign an agreement twice!')
    })
  })

  describe('Resolution', async () => {
    it('Resolved evaluates false if not all addresses have signed Agreement', async () => {
      let quorum = await instance.testResolved(2)
      expect(quorum).to.be.false
    })

    it('Resolved evaluates true if all addresses have signed Agreement', async () => {
      await instance.testSign(2, { from: sc })
      let quorum = await instance.testResolved(2)
      expect(quorum).to.be.true
    })
  })
})
