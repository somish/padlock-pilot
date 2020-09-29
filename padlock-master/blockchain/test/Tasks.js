let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let TestTasks = artifacts.require('./TestTasks')

/**
 * Testing for Task capabilities in Padlock v0.1.0
 * @dev uses TestTasks.sol
 */
contract('Task Library Testing', (accounts) => {
  let instance
  let admin = accounts[0]
  let owner = accounts[1]
  let gc = accounts[2]
  let sc = accounts[3]
  let sc2 = accounts[4]

  before(async () => {
    instance = await TestTasks.deployed()
  })

  it('initialize()', async () => {
    let { logs } = await instance.testInitialize(web3.utils.sha3('test title'), 1000, { from: gc })
    expectEvent.inLogs(logs, 'TaskCreated', { _index: new BN(1) })
    let alerts = await instance.testGetAlerts(new BN(1))
    expect(alerts[0]).to.be.true
    expect(alerts[1]).to.be.false
    expect(alerts[2]).to.be.false
    expect(alerts[3]).to.be.false
  })

  describe('Inactive State', async () => {
    describe('inviteSubcontractor()', async () => {
      it('Subcontractor can be invited', async () => {
        let { logs } = await instance.testInviteSubcontractor(1, sc, { from: gc })
        expectEvent.inLogs(logs, 'SubcontractorInvited', { _index: new BN(1), _sc: sc })
      })
      it('Subcontractor can be replaced if Lifecycle.SCConfirmed is false', async () => {
        let { logs } = await instance.testInviteSubcontractor(1, sc2, { from: gc })
        expectEvent.inLogs(logs, 'SubcontractorSwapped', { _index: new BN(1), _old: sc, _new: sc2 })
      })
      it('Subcontractor cannot be replaced if Lifecycle.SCConfirmed is true', async () => {
        await instance.testInitialize(web3.utils.sha3('Test for SCConfirmed'), 10, { from: gc })
        await instance.testInviteSubcontractor(2, sc2, { from: gc })
        await instance.testAcceptInvitation(2, { from: sc2 })
        await expectRevert(
          instance.testInviteSubcontractor(2, sc, { from: gc }),
          'Cannot change subcontractor once confirmed!'
        )
      })
      it('onlyInactive', async () => {
        await instance.testFundTask(2, { from: admin })
        await instance.testSetActive(2, { from: gc })
        await expectRevert(instance.testInviteSubcontractor(2, sc, { from: gc }), 'Method reserved for Inactive tasks!')
      })
    })
    describe('acceptInvite()', async () => {
      it('Addresses that are not invited cannot accept invitation', async () => {
        await expectRevert(instance.testAcceptInvitation(1, { from: owner }), 'Can only join if invited!')
      })
      it('Lifecycle.SCConfirmed becomes true once called', async () => {
        let { logs } = await instance.testAcceptInvitation(1, { from: sc2 })
        expectEvent.inLogs(logs, 'SubcontractorConfirmed', { _index: new BN(1) })
        let alerts = await instance.testGetAlerts(new BN(1))
        expect(alerts[0]).to.be.false
        expect(alerts[1]).to.be.false
        expect(alerts[2]).to.be.true
        expect(alerts[3]).to.be.false
      })
      it('onlyInactive', async () => {
        await instance.testInitialize(web3.utils.sha3('Test for acceptInvite()'), 10, { from: gc })
        await instance.testInviteSubcontractor(3, sc, { from: gc })
        await instance.testAcceptInvitation(3, { from: sc })
        await instance.testFundTask(3, { from: admin })
        await instance.testSetActive(3, { from: gc })
        await expectRevert(instance.testAcceptInvitation(3, { from: sc }), 'Method reserved for Inactive tasks!')
      })
    })
    describe('fundTask()', async () => {
      it('Lifecycle.TaskFunded becomes true once called', async () => {
        let { logs } = await instance.testFundTask(1, { from: admin })
        expectEvent.inLogs(logs, 'TaskFunded', { _index: new BN(1) })
        let alerts = await instance.testGetAlerts(new BN(1))
        expect(alerts[0]).to.be.false
        expect(alerts[1]).to.be.true
        expect(alerts[2]).to.be.true
        expect(alerts[3]).to.be.false
      })
      it('Cannot fund a task twice', async () => {
        await expectRevert(instance.testFundTask(1, { from: admin }), 'Cannot fund task that has already been funded!')
      })
      it('onlyInactive', async () => {
        await instance.testInitialize(web3.utils.sha3('Test for fundTask()'), 10, { from: gc })
        await instance.testInviteSubcontractor(4, sc, { from: gc })
        await instance.testAcceptInvitation(4, { from: sc })
        await instance.testFundTask(4, { from: admin })
        await instance.testSetActive(4, { from: gc })
        await expectRevert(instance.testFundTask(4, { from: admin }), 'Method reserved for Inactive tasks!')
      })
    })
    describe('setActive()', async () => {
      it('Does not work if !Lifecycle.SCConfirmed', async () => {
        await instance.testInitialize(web3.utils.sha3('Test for no SC'), 10, { from: gc })
        await instance.testFundTask(5, { from: admin })
        await expectRevert(
          instance.testSetActive(5, { from: gc }),
          'Cannot activate without a confirmed Subcontractor!'
        )
      })
      it('Does not work if !Lifecycle.TaskFunded', async () => {
        await instance.testInitialize(web3.utils.sha3('Test for no Funding'), 10, { from: gc })
        await instance.testInviteSubcontractor(6, sc, { from: gc })
        await instance.testAcceptInvitation(6, { from: sc })
        await expectRevert(instance.testSetActive(6, { from: gc }), 'Cannot activate without PUSD Escrow!')
      })
      it('Transitions task to active state', async () => {
        let state = await instance.testGetState(1, { from: gc })
        expect(state.toNumber()).to.be.equal(1)
        let { logs } = await instance.testSetActive(1, { from: gc })
        expectEvent.inLogs(logs, 'TaskActive', { _index: new BN(1) })
        state = await instance.testGetState(1, { from: gc })
        expect(state.toNumber()).to.be.equal(2)
        let alerts = await instance.testGetAlerts(new BN(1))
        expect(alerts[0]).to.be.true
        expect(alerts[1]).to.be.false
        expect(alerts[2]).to.be.false
        expect(alerts[3]).to.be.false
      })
      it('onlyInactive', async () => {
        await expectRevert(instance.testSetActive(1, { from: gc }), 'Method reserved for Inactive tasks!')
      })
    })
  })

  describe('Active State', async () => {
    describe('designatePurchaseOrder()', async () => {
      it('Can designate an existing document index as purchase order', async () => {
        await instance.testAddDocument(1, { from: gc })
        let { logs } = await instance.testDesignatePurchaseOrder(1, 1, { from: gc })
        expectEvent.inLogs(logs, 'PurchaseOrderDesignated', { _index: new BN(1) })
      })
      it('Cannot designate multiple documents as a purchase order', async () => {
        await instance.testAddDocument(1, { from: gc })
        await expectRevert(instance.testDesignatePurchaseOrder(1, 2, { from: gc }), 'Purchase order already defined!')
      })
      it('onlyActive', async () => {
        await expectRevert(instance.testDesignatePurchaseOrder(7, 1, { from: gc }), 'Method reserved for Active tasks!')
      })
    })
    describe('designateLienRelease()', async () => {
      it('Can designate an existing document index as lien release', async () => {
        let { logs } = await instance.testDesignateLienRelease(1, 2, { from: sc })
        expectEvent.inLogs(logs, 'LienReleaseDesignated', { _index: new BN(1) })
      })
      it('Lifecycle.LienReleaseAdded is true', async () => {
        let alerts = await instance.testGetAlerts(new BN(1))
        expect(alerts[0]).to.be.false
        expect(alerts[1]).to.be.false
        expect(alerts[2]).to.be.false
        expect(alerts[3]).to.be.true
      })
      it('Cannot designate multiple documents as a lien release', async () => {
        await instance.testAddDocument(1, { from: gc })
        await expectRevert(instance.testDesignateLienRelease(1, 3, { from: sc }), 'Lien release already defined!')
      })
      it('onlyActive', async () => {
        await expectRevert(instance.testDesignatePurchaseOrder(7, 1, { from: gc }), 'Method reserved for Active tasks!')
      })
    })
    describe('setPending()', async () => {
      it('Cannot use if !Lifecycle.LienReleaseAdded', async () => {
        await expectRevert(instance.testSetPending(2, { from: gc }), 'Cannot set to pending without Lien Release!')
      })
      it('Transitions to pending state', async () => {
        let state = await instance.testGetState(1, { from: gc })
        expect(state.toNumber()).to.be.equal(2)
        let { logs } = await instance.testSetPending(1, { from: gc })
        expectEvent.inLogs(logs, 'TaskPending', { _index: new BN(1) })
        state = await instance.testGetState(1, { from: gc })
        expect(state.toNumber()).to.be.equal(3)
        let alerts = await instance.testGetAlerts(new BN(1))
        expect(alerts[0]).to.be.true
        expect(alerts[1]).to.be.false
        expect(alerts[2]).to.be.false
        expect(alerts[3]).to.be.false
      })
      it('onlyActive', async () => {
        await expectRevert(instance.testSetPending(1, { from: gc }), 'Method reserved for Active tasks!')
      })
    })
  })

  describe('setComplete()', async () => {
    it('Task can be set to complete', async () => {
      let { logs } = await instance.testSetComplete(1, { from: gc })
      expectEvent.inLogs(logs, 'TaskComplete', { _index: new BN(1) })
    })
    it('onlyPending', async () => {
      await expectRevert(instance.testSetComplete(1, { from: gc }), 'Method reserved for Payment Pending tasks!')
    })
  })
})
