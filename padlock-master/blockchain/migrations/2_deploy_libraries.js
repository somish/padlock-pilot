let AgreementsLibrary = artifacts.require('Agreements')
let TestAgreementsContract = artifacts.require('TestAgreements')
let DocumentsLibrary = artifacts.require('Documents')
let TestDocumentsContract = artifacts.require('TestDocuments')
let TasksLibrary = artifacts.require('Tasks')
let TestTasksContract = artifacts.require('TestTasks')

/**
 * Migrations for libraries used across Padlock v0.1.0
 * Includes migration of test files
 */
module.exports = async (deployer) => {
  // Deploy Agreements and link to test contract
  await deployer.deploy(AgreementsLibrary)
  await deployer.link(AgreementsLibrary, TestAgreementsContract)
  await deployer.deploy(TestAgreementsContract)

  // Deploy Documents and link to test contract
  await deployer.deploy(DocumentsLibrary)
  await deployer.link(DocumentsLibrary, TestDocumentsContract)
  await deployer.deploy(TestDocumentsContract)

  // Deploy Tasks and link to test contract
  await deployer.deploy(TasksLibrary)
  await deployer.link(TasksLibrary, TestTasksContract)
  await deployer.deploy(TestTasksContract)
}
