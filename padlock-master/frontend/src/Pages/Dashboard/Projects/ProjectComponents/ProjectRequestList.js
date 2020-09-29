import React, { useEffect, useState } from 'react'
import Collapsible from 'react-collapsible'
import Loading from 'react-loading'
import { useApi } from '../../../../api'

function ProjectRequestList(props) {
  let messages = require('../../../../api/requests/messages.json')
  let api = useApi()
  let [projectRequests, setProjectRequests] = useState([])
  let [projectTasks, setProjectTasks] = useState([])

  let createAttachmentArray = (num) => {
    let attachmentArray = []
    if (projectTasks[num] === 'None') return
    attachmentArray.push(
      <>
        <div className="owner-project-div">
          <div className="owner-project-list-name">
            <p className="owner-project-list-left">Task: {projectTasks[num]}</p>
          </div>
          <div className="project-request-link">
            <a
              href={`projects/${projectRequests[num].project}/?task=${projectRequests[num].task}`}
              className="wallet-transaction-link"
            >
              <span className="wallet-link">View Task</span>
            </a>
          </div>
        </div>
      </>
    )
    return attachmentArray
  }

  let createRequestArray = () => {
    let requestArray = []
    for (let i = 0; i < projectRequests.length; i++) {
      let message = messages[projectRequests[i].reqType]
      requestArray.push(
        <>
          <Collapsible
            className="network-owner"
            trigger={
              <div className="network-owner-div">
                {props.user.length != 0 ? (
                  props.user[i].name === 'Admin' ? (
                    <img className="wallet-image" src={require('../../../../Images/padlock.png')} />
                  ) : props.user[i].photo !== 'None' ? (
                    <img className="wallet-image" src={props.user[i].photo} />
                  ) : (
                    <img className="wallet-image" src={require('../../../../Images/stock_profile_icon.png')} />
                  )
                ) : (
                  <Loading type="bubbles" width="40px" height="30px" color="blue" />
                )}
                <div className="owner-info-project-page">
                  <span>{props.user.length != 0 ? props.user[i].name : null}</span>
                  <br />
                  <p>Status: {message}</p>
                </div>
              </div>
            }
            transitionTime={10}
            easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            accordionPosition={100}
          >
            {createAttachmentArray(i)}
          </Collapsible>
        </>
      )
    }
    return requestArray
  }

  let getProjectRequests = async () => {
    let result = await api.getRequestByProject(props.projectAddress)
    return await result
  }

  let getProjectTasks = async () => {
    let taskArray = []
    for (let i = 0; i < projectRequests.length; i++) {
      try {
        let task = await api.getTask(projectRequests[i].task)
        taskArray.push(task.title)
      } catch (e) {
        taskArray.push('None')
      }
    }
    return taskArray
  }

  useEffect(() => {
    getProjectRequests().then(setProjectRequests)
  }, [])

  useEffect(() => {
    if (!projectRequests) return
    getProjectTasks().then(setProjectTasks)
  }, [projectRequests])

  return <>{createRequestArray()}</>
}
export default ProjectRequestList
