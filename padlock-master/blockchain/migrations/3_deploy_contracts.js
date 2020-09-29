let AgreementsLibrary = artifacts.require('Agreements')
let DocumentsLibrary = artifacts.require('Documents')
let TasksLibrary = artifacts.require('Tasks')
let PadlockContract = artifacts.require('Padlock')

/**
 * Migrations main contracts in Padlock v0.1.0
 */
module.exports = async (deployer) => {
  await deployer.link(AgreementsLibrary, PadlockContract)
  await deployer.link(DocumentsLibrary, PadlockContract)
  await deployer.link(TasksLibrary, PadlockContract)
  await deployer.deploy(PadlockContract)
}
