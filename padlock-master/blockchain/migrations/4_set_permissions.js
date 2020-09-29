require('dotenv').config()
let PadlockContract = artifacts.require('Padlock')

module.exports = async (deployer) => {
  let instance = await PadlockContract.deployed()
  await instance.enrollAdmin(process.env.ADMIN)
  await instance.enrollAdmin(process.env.CRON)
}
