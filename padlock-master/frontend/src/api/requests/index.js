import { useApi, usePadlock, useProject, useAsync } from '../index.js'
import { useCallback } from 'react'

/**
 * Logic handler for request functionality according to supplied requestId
 * @param {string} requestId the couchdb uuid of the request being resolved
 */
export default function useRequest(requestId) {
  //initialize
  let api = useApi()
  let cb = useCallback(() => api.getRequestById(requestId), requestId)
  let request = useAsync(cb).value
  let padlock = usePadlock()
  let deployed = request ? request.project : null
  let project = useProject(deployed)

  //short circuit on early load
  if (!request) return null
  console.log('REQTYPE: ', request.reqType)
  //set resolve logic according to given code (request type)
  let requestFunction = {
    admin_joined: async () => await joined(request, api, padlock),
    admin_approved: async () => await dismissed(api, requestId),
    owner_joined: async () => await joined(request, api, padlock),
    owner_approved: async () => await dismissed(api, requestId),
    gc_joined: async () => await joined(request, api, padlock),
    gc_approved: async () => await dismissed(api, requestId),
    sc_joined: async () => await dismissed(api, requestId),
    new_project: async () => await dismissed(api, requestId),
    project_funding_needed: async () => await funded(request, api, padlock, project),
    project_funded: async () => await dismissed(api, requestId),
    escrow_released: async () => await dismissed(api, requestId),
    new_task: async () => await dismissed(api, requestId),
    task_funding_needed: async () => await funded(request, api, padlock, project),
    task_funded: async () => await dismissed(api, requestId),
    sc_invited: async () => await interacted(request, api, padlock, project),
    sc_invitation_expired: async () => await dismissed(api, requestId),
    sc_approved: async () => await dismissed(api, requestId),
    task_active: async () => await dismissed(api, requestId),
    photo_added: async () => await dismissed(api, requestId),
    document_added: async () => await dismissed(api, requestId),
    comment_added: async () => await dismissed(api, requestId),
    change_order: async () => await unimplemented(), //@dev todo
    change_order_funding_needed: async () => await unimplemented(), //@dev todo
    change_order_funded: async () => unimplemented(), //@dev todo
    lien_release_submitted: async () => await interacted(request, api, padlock, project),
    task_pending: async () => await dismissed(api, requestId),
    task_complete: async () => await dismissed(api, requestId),
  }[request.reqType]

  //if unknown request code, throw
  if (!requestFunction) throw new Error(`encountered unknown request type of "${request.id}"`)
  return requestFunction
}

/**
 * Handle Request resolution that is dependent on nothing
 * @param {object} api useApi instance of backend api routes
 * @param {string} requestId the couchdb uuid of the request
 */
let dismissed = async (api, requestId) => {
  await api.resolve(requestId)
}

/**
 * Handle Request resolution that is dependent on nothing
 * @param {object} request couchdb entry of request
 * @param {object} api useApi instance of backend api routes
 * @param {object} padlock usePadlock instance of Padlock Service contract
 */
let joined = async (request, api, padlock) => {
  //initialize
  let { _id, reqType, from } = request
  //enroll logic
  let enrollFunction = {
    admin_joined: async (from) => await padlock.enrollAdmin(from),
    owner_joined: async (from) => await padlock.enrollOwner(from),
    gc_joined: async (from) => await padlock.enrollGC(from),
  }[reqType]
  //ensure integrity of on-chain enrollment
  let tx = await enrollFunction(from)
  let receipt = await tx.wait()
  //resolve internally
  await api.resolve(_id)
}

/**
 * Handle Request resolution that is dependent on funding
 * @param {object} request couchdb entry of request
 * @param {object} api useApi instance of backend api routes
 * @param {object} padlock usePadlock instance of Padlock Service contract
 */
let funded = async (request, api, padlock, project) => {
  debugger
  //initialize
  let { _id, reqType, project: projectAddress, task } = request
  let index = task ? (await api.getTask(task)).index : null
  let tx, receipt, value
  //fund logic
  if (reqType === 'project_funding_needed') {
    tx = await padlock.fundProject(projectAddress)
    let hex = await project.projectCost()
    value = hex.toNumber()
  } else if (reqType === 'task_funding_needed') {
    tx = await padlock.fundTask(projectAddress, index)
    let task = await project.tasks(index)
    let hex = task.cost
    value = hex.toNumber()
  } else {
    throw new Error('Unknown reqType')
  }
  await api.resolve(_id, value)
}

/**
 * Handle Request resolution that is dependent on arbitrary interaction with a task
 * @param {object} request couchdb entry of request
 * @param {object} api useApi instance of backend api routes
 * @param {object} padlock usePadlock instance of Padlock Service contract
 * @param {object} project useProject instance of Padlock Project contract
 */
let interacted = async (request, api, padlock, project) => {
  debugger
  let { _id, reqType, task } = request
  let index = (await api.getTask(task)).index
  let tx, value
  //initialize
  if (reqType === 'sc_invited') {
    tx = await project.acceptInvite(index)
  } else if (reqType === 'lien_release_submitted') {
    tx = await project.setPending(index)
    let task = await project.tasks(index)
    let hex = task.cost
    value = hex.toNumber()
  } else {
    throw new Error('Unknown reqType')
  }
  let receipt = await tx.wait()
  //resolve internally
  await api.resolve(_id, value)
}

/**
 * Throw if error is not recognized as described
 */
async function unimplemented() {
  throw new Error("this request type isn't implemented")
}
