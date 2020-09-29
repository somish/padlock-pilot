require('dotenv').config()
let PadlockABI = require('./abi/padlock.json')
let ProjectABI = require('./abi/project.json')

let ethers = require('ethers')
let utils = require('ethers').utils
let provider = ethers.getDefaultProvider(`https://rinkeby.infura.io/v3/${process.env.INFURA}`, 'rinkeby')
let wallet = new ethers.Wallet(`0x${process.env.FAUCET_PKEY}`, provider)

/**
 * Create an instance of the padlock contract with CRON as the signer
 */
let usePadlock = () => {
  if (!PadlockABI || !process.env.PADLOCK || !ethers) return null
  return new ethers.Contract(process.env.PADLOCK, PadlockABI, wallet)
}

/**
 * Create an instance of a specified project contract with CRON as the signer
 * @param {string} address - the address of the targeted contract
 */
let useProject = (address) => {
  if (!ProjectABI || !address || !ethers) return null
  return new ethers.Contract(address, ProjectABI, wallet)
}

/**
 * Send ether to an account so that it can fund its transactions on-chain
 * @dev HACKY AF, workaround for GSN being out of reach with current scope
 * @param {string} account address of the account being funded
 */
let faucet = async (account) => {
  if (!account) return null
  let balance = await provider.getBalance(account)
  let minimum = await utils.parseEther('0.5')
  if (balance.lt(minimum)) {
    let tx = {
      to: account,
      value: utils.parseEther('0.3'),
    }
    await wallet.signTransaction(tx)
    await wallet.sendTransaction(tx)
  }
}

module.exports = { usePadlock, useProject, faucet }
