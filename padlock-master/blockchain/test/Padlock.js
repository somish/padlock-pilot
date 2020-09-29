let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let PadlockContract = artifacts.require('./Padlock')
let ProjectContract = artifacts.require('./Project')

/**
 * Testing for main Padlock contract in Padlock v0.1.0
 */
contract('Service Contract Testing', (accounts) => {
  let instance, project
  let admin = accounts[0]
  let admin2 = accounts[1]
  let owner = accounts[2]
  let gc = accounts[3]
  let sc = accounts[4]
  let zero = '0x0000000000000000000000000000000000000000'

  before(async () => {
    instance = await PadlockContract.deployed()
  })

  describe('Registration', async () => {
    describe('enrollAdmin()', async () => {
      it('Admin is added on-chain', async () => {
        let { logs } = await instance.enrollAdmin(admin2, { from: admin })
        expectEvent.inLogs(logs, 'AdminAdded', { _admin: admin2 })
        let role = await instance.roles(admin2)
        expect(role.toNumber()).to.be.equal(3)
      })
      it('Cannot enroll existing account', async () => {
        await expectRevert(instance.enrollAdmin(admin2, { from: admin }), 'Address is already enrolled in Padlock!')
      })
      it('Only Admin can enroll a new Admin', async () => {
        await expectRevert(instance.enrollAdmin(gc, { from: gc }), 'Method can only be called by an administrator!')
      })
    })
    describe('enrollOwner()', async () => {
      it('Owner is added on-chain', async () => {
        let { logs } = await instance.enrollOwner(owner, { from: admin })
        expectEvent.inLogs(logs, 'OwnerAdded', { _owner: owner })
        let role = await instance.roles(owner)
        expect(role.toNumber()).to.be.equal(2)
      })
      it('Cannot enroll existing account', async () => {
        await expectRevert(instance.enrollOwner(owner, { from: admin }), 'Address is already enrolled in Padlock!')
      })
      it('Only Admin can enroll a new Owner', async () => {
        await expectRevert(instance.enrollOwner(gc, { from: gc }), 'Method can only be called by an administrator!')
      })
    })
    describe('enrollGC()', async () => {
      it('GC is added on-chain', async () => {
        let { logs } = await instance.enrollGC(gc, { from: owner })
        expectEvent.inLogs(logs, 'GCAdded', { _gc: gc })
        let role = await instance.roles(gc)
        expect(role.toNumber()).to.be.equal(1)
      })
      it('Cannot enroll existing account', async () => {
        await expectRevert(instance.enrollGC(gc, { from: owner }), 'Address is already enrolled in Padlock!')
      })
      it('Only Owner can enroll a new GC', async () => {
        await expectRevert(instance.enrollGC(sc, { from: sc }), 'Method can only be called by an Owner!')
      })
    })
  })
  describe('Project', async () => {
    let fees = [1000, 2000, 3000, 4000]
    describe('newProject()', async () => {
      it('A New Project can be created', async () => {
        let { logs } = await instance.newProject(owner, fees, { from: gc })
        expectEvent.inLogs(logs, 'ProjectAdded', { _index: new BN(1) })
      })
      it('Only GC can make a new project', async () => {
        await expectRevert(
          instance.newProject(owner, fees, { from: owner }),
          'Method can only be called by a General Contractor!'
        )
      })
    })
    describe('fundProject()', async () => {
      it('Only Admin can fund a project', async () => {
        let address = await instance.projects(1)
        await expectRevert(
          instance.fundProject(address, { from: gc }),
          'Method can only be called by an administrator!'
        )
      })
      it('Project can be funded according to fees', async () => {
        let expected = 10000
        let address = await instance.projects(1)
        let preBal = await instance.balance(address)
        expect(preBal.toNumber()).to.be.equal(0)
        let { logs } = await instance.fundProject(address, { from: admin })
        expectEvent.inLogs(logs, 'ProjectFunded', { _project: address })
        let postBal = await instance.balance(address)
        expect(postBal.toNumber()).to.be.equal(expected)
      })
      it('Project cannot be funded twice', async () => {
        let address = await instance.projects(1)
        await expectRevert(instance.fundProject(address, { from: admin }), 'Fees have already been funded!')
      })
    })
    describe('fundTask()', async () => {
      before(async () => {
        let address = await instance.projects(1)
        project = await ProjectContract.at(address)
        await project.createTask(web3.utils.sha3('MyTask'), 1000, zero, { from: gc })
      })
      it('Only Admin can fund a task', async () => {
        let address = await instance.projects(1)
        await expectRevert(
          instance.fundTask(address, 1, { from: owner }),
          'Method can only be called by an administrator!'
        )
      })
      it('Task can be funded according to cost', async () => {
        let expected = 1000
        let address = await instance.projects(1)
        let preBal = await instance.balance(address)
        let { logs } = await instance.fundTask(address, 1, { from: admin })
        expectEvent.inLogs(logs, 'TaskFunded', { _project: address, _task: new BN(1) })
        let postBal = await instance.balance(address)
        expect(postBal.toNumber()).to.be.equal(expected + preBal.toNumber())
      })
      it('Task cannot be funded twice', async () => {
        let address = await instance.projects(1)
        await expectRevert(
          instance.fundTask(address, 1, { from: admin }),
          'Cannot fund task that has already been funded!'
        )
      })
    })
  })
})
