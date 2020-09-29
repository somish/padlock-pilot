let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let PadlockContract = artifacts.require('./Padlock')
let ProjectContract = artifacts.require('./Project')

/**
 * Testing for Padlock's child project contract in Padlock v0.1.0
 */
contract('Project Contract Testing', (accounts) => {
  let instance, project, address
  let admin = accounts[0]
  let admin2 = accounts[1]
  let owner = accounts[2]
  let gc = accounts[3]
  let sc = accounts[4]
  let sc2 = accounts[5]
  let zero = '0x0000000000000000000000000000000000000000'

  before(async () => {
    instance = await PadlockContract.deployed()
    await instance.enrollOwner(owner, { from: admin })
    await instance.enrollGC(gc, { from: owner })
    await instance.newProject(owner, [6000, 12000, 18000], { from: gc })
    let index = await instance.projectSerial()
    address = await instance.projects(index)
    project = await ProjectContract.at(address)
  })

  describe('Project-Specific', async () => {
    describe('releaseFeeEscrow()', async () => {
      it('Only owner can release escrow', async () => {
        await expectRevert(project.releaseFeeEscrow(1, { from: gc }), 'Method can only be called by the project owner!')
      })
      it('Cannot pay escrow before project has been funded', async () => {
        await expectRevert(
          project.releaseFeeEscrow(1, { from: owner }),
          'Cannot pay fees until Administrator provides contract liquidity!'
        )
      })
      it('Owner can release fee payments to General Contractor', async () => {
        await instance.fundProject(address, { from: admin })

        let before = {}
        let phase0 = {}
        let phase1 = {}
        let phase2 = {}

        before.project = (await instance.balance(address)).toNumber()
        before.gc = (await instance.balance(gc)).toNumber()

        let { logs } = await project.releaseFeeEscrow(0, { from: owner })
        expectEvent.inLogs(logs, 'EscrowReleased', { _phase: new BN(0) })
        phase0.project = (await instance.balance(address)).toNumber()
        phase0.gc = (await instance.balance(gc)).toNumber()

        await project.releaseFeeEscrow(1, { from: owner })
        phase1.project = (await instance.balance(address)).toNumber()
        phase1.gc = (await instance.balance(gc)).toNumber()

        await project.releaseFeeEscrow(2, { from: owner })
        phase2.project = (await instance.balance(address)).toNumber()
        phase2.gc = (await instance.balance(gc)).toNumber()

        expect(before.project).to.be.equal(36000)
        expect(before.gc).to.be.equal(0)
        expect(phase0.project).to.be.equal(30000)
        expect(phase0.gc).to.be.equal(6000)
        expect(phase1.project).to.be.equal(18000)
        expect(phase1.gc).to.be.equal(18000)
        expect(phase2.project).to.be.equal(0)
        expect(phase2.gc).to.be.equal(36000)
      })
      it('Can access GC Fee Data', async () => {
        await instance.newProject(owner, [6000, 12000, 18000], { from: gc })
        let index = await instance.projectSerial()
        let address2 = await instance.projects(index)
        let project2 = await ProjectContract.at(address2)

        let funded = await project2.funded()
        expect(funded).to.be.false
        let feesLength = await project2.feesLength()
        expect(feesLength.toNumber()).to.be.equal(3)

        await instance.fundProject(address2, { from: admin })
        funded = await project2.funded()
        expect(funded).to.be.true

        let feeState = []
        for (let i = 0; i < feesLength.toNumber(); i++) {
          let cost = await project2.fees(i)
          let paid = await project2.paid(i)
          feeState.push({ cost: cost.toNumber(), paid: paid })
        }
        expect(feeState[0].cost).to.be.equal(6000)
        expect(feeState[0].paid).to.be.false
        expect(feeState[1].cost).to.be.equal(12000)
        expect(feeState[1].paid).to.be.false
        expect(feeState[2].cost).to.be.equal(18000)
        expect(feeState[2].paid).to.be.false

        feeState = []
        await project2.releaseFeeEscrow(1, { from: owner })
        await project2.releaseFeeEscrow(2, { from: owner })
        for (let i = 0; i < feesLength.toNumber(); i++) {
          let cost = await project2.fees(i)
          let paid = await project2.paid(i)
          feeState.push({ cost: cost.toNumber(), paid: paid })
        }
        expect(feeState[0].cost).to.be.equal(6000)
        expect(feeState[0].paid).to.be.false
        expect(feeState[1].cost).to.be.equal(12000)
        expect(feeState[1].paid).to.be.true
        expect(feeState[2].cost).to.be.equal(18000)
        expect(feeState[2].paid).to.be.true
      })
    })
  })
  describe('Task-Specific', async () => {
    describe('createTask()', async () => {
      it('Only GC can create new task', async () => {
        await expectRevert(
          project.createTask(web3.utils.sha3('MyTask'), 6000, zero, { from: owner }),
          'Method can only be called by the project general contractor!'
        )
      })
      it('Task can be created without subcontractor', async () => {
        let { logs } = await project.createTask(web3.utils.sha3('MyTask'), 6000, zero, { from: gc })
        expectEvent.inLogs(logs, 'TaskCreated', { _index: new BN(1) })
      })
      it('Task can be created with subcontractor', async () => {
        let { logs } = await project.createTask(web3.utils.sha3('MyTask'), 6000, sc2, { from: gc })
        expectEvent.inLogs(logs, 'TaskCreated', { _index: new BN(2) })
        expectEvent.inLogs(logs, 'SubcontractorInvited', { _index: new BN(2), _sc: sc2 })
      })
    })
    describe('inviteSubcontractor()', async () => {
      it('Only GC can invite a subcontractor', async () => {
        await expectRevert(
          project.inviteSubcontractor(1, sc, { from: owner }),
          'Method can only be called by the project general contractor!'
        )
      })
      it('GC can invite a subcontractor to a task', async () => {
        let { logs } = await project.inviteSubcontractor(1, sc, { from: gc })
        expectEvent.inLogs(logs, 'SubcontractorInvited', { _index: new BN(1), _sc: sc })
      })
      it('If a subcontractor is already invited, they will be swapped out', async () => {
        let { logs } = await project.inviteSubcontractor(1, sc2, { from: gc })
        expectEvent.inLogs(logs, 'SubcontractorSwapped', { _index: new BN(1), _old: sc, _new: sc2 })
      })
    })
    describe('acceptInvite()', async () => {
      it('Only the invitee can accept an invitation', async () => {
        await expectRevert(
          project.acceptInvite(1, { from: sc }),
          'Method can only be called by a subcontractor on this task!'
        )
      })
      it('An SC can accept an invitation', async () => {
        let { logs } = await project.acceptInvite(1, { from: sc2 })
        expectEvent.inLogs(logs, 'SubcontractorConfirmed', { _index: new BN(1) })
      })
    })
    describe('setActive()', async () => {
      before(async () => {
        await instance.fundTask(address, 1, { from: admin })
      })
      it('Only a GC can set a task as active', async () => {
        await expectRevert(
          project.setActive(1, { from: sc }),
          'Method can only be called by the project general contractor!'
        )
      })
      it('Can set a task as active', async () => {
        let { logs } = await project.setActive(1, { from: gc })
        expectEvent.inLogs(logs, 'TaskActive', { _index: new BN(1) })
      })
    })
    describe('addDocument()', async () => {
      it('Documents can be added', async () => {
        let { logs } = await project.addDocument(1, web3.utils.sha3('title'), web3.utils.sha3('body'))
        expectEvent.inLogs(logs, 'DocumentAdded', { _task: new BN(1), _document: new BN(1) })
      })
      it('Document metadata can be retrieved', async () => {
        let { _timestamp, _hash, _title } = await project.getDocument(1, 1, { from: sc })
        expect(_timestamp).to.not.equal(0)
        expect(_hash).to.be.equal(web3.utils.sha3('body'))
        expect(_title).to.be.equal(web3.utils.sha3('title'))
      })
    })
    describe('designateLienRelease()', async () => {
      it('Only a SC can designate a lien release', async () => {
        await expectRevert(
          project.designateLienRelease(1, 1, { from: sc }),
          'Method can only be called by a subcontractor on this task!'
        )
      })
      it('Can designate a lien release', async () => {
        let { logs } = await project.designateLienRelease(1, 1, { from: sc2 })
        expectEvent.inLogs(logs, 'LienReleaseDesignated', { _index: new BN(1) })
      })
    })
    describe('setPending()', async () => {
      it('Only GC can set a task as payment pending', async () => {
        await expectRevert(
          project.setPending(1, { from: sc }),
          'Method can only be called by the project general contractor!'
        )
      })
      it('Task moves to payment pending status & releases escrow to SC', async () => {
        let beforeProject = (await instance.balance(address)).toNumber()
        let beforeSC = (await instance.balance(sc2)).toNumber()
        let { logs } = await project.setPending(1, { from: gc })
        expectEvent.inLogs(logs, 'TaskPending', { _index: new BN(1) })
        let afterProject = (await instance.balance(address)).toNumber()
        let afterSC = (await instance.balance(sc2)).toNumber()
        expect(beforeProject).to.be.equal(6000)
        expect(beforeSC).to.be.equal(0)
        expect(afterProject).to.be.equal(0)
        expect(afterSC).to.be.equal(6000)
      })
    })
    describe('setComplete()', async () => {
      it('Only GC can set a task as payment complete', async () => {
        await expectRevert(
          project.setComplete(1, { from: sc }),
          'Method can only be called by the project general contractor!'
        )
      })
      it('A task can be set as complete', async () => {
        let { logs } = await project.setComplete(1, { from: gc })
        expectEvent.inLogs(logs, 'TaskComplete', { _index: new BN(1) })
      })
    })
  })
})
