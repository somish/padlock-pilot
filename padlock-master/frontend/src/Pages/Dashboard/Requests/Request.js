import React, { useEffect, useState } from 'react'
import Collapsible from 'react-collapsible'
import ActionButton from './ActionButton'
import { useApi } from '../../../api'

function Request(props) {
  const api = useApi()
  const [projectName, setProjectName] = useState('')
  const [relatedTask, setRelatedTask] = useState('')

  let getProjectName = async () => {
    if (props.relatedProject === null || props.relatedProject === undefined) return
    let result = await api.getProject(props.relatedProject)
    return result.title
  }

  let getTaskName = async () => {
    if (props.relatedTask === null || props.relatedTask === undefined) return
    let result = await api.getTask(props.relatedTask)
    return result.title
  }

  useEffect(() => {
    console.log('Request props: ', props)
    getProjectName().then(setProjectName)
    getTaskName().then(setRelatedTask)
  }, [])

  return (
    <div>
      <div className="request-container">
        <Collapsible
          className={`${props.type}-request`}
          onOpen={() => props.openRequest(props.status, props.requestNum)}
          onClose={() => props.closeRequest(props.status, props.requestNum)}
          trigger={
            <div>
              {props.image !== 'None' ? (
                props.from !== 'admin' ? (
                  <img alt="Profile" className="request-notification-image" src={props.image} />
                ) : (
                  <img
                    alt="Profile"
                    className="request-notification-image"
                    src={require('../../../Images/padlock.png')}
                  />
                )
              ) : (
                <img
                  alt="Profile"
                  className="request-notification-image"
                  src={require('../../../Images/stock_profile_icon.png')}
                />
              )}
              <span className="request-user-name">{props.name ? props.name : 'Admin'}</span>
              <span className="request-status">
                Status:(<span className="request-status-variable">{props.message ? props.message[0] : null}</span>)
              </span>
              <div className="request-right">
                <img
                  alt="Dropdown Arrow"
                  id={`request-${props.status}-${props.requestNum}`}
                  src={require('../../../Images/dropdown-arrow-request.png')}
                />
              </div>
            </div>
          }
          transitionTime={10}
          easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
          accordionPosition={100}
        >
          <div className="request-body-div">
            <div>
              {props.relatedProject ? (
                <div className="request-inner-div">
                  <div className="request-link-div">
                    <span>
                      Project: <span className="request-project-name">{projectName}</span>
                    </span>
                    <a href={`projects/${props.relatedProject}`} className="request-project-link">
                      View Project
                    </a>
                  </div>
                </div>
              ) : null}
              {props.relatedTask ? (
                <div className="request-inner-div">
                  <div className="request-link-div">
                    <span>Task: {relatedTask}</span>
                    <a
                      href={`projects/${props.relatedProject}/?task=${props.relatedTask}`}
                      className="request-task-link"
                    >
                      View Task
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="action-button-div">
              {props.type === 'active' ? (
                <ActionButton
                  requestId={props.requestId}
                  requestType={props.reqType}
                  requestUpdated={props.requestUpdated}
                />
              ) : null}
            </div>
          </div>
        </Collapsible>
      </div>
    </div>
  )
}
export default Request
