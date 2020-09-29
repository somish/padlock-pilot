import React, { useState, useEffect } from 'react'
import Task from './Task'
import { useHistory } from 'react-router-dom'
import $ from 'jquery'
import { useApi } from '../../../../api'
import Loading from 'react-loading'

function TaskRow(props) {
  let { cost, title, description, phase, _id, index } = props.task
  const api = useApi()
  const history = useHistory()
  const [taskId, setTaskId] = useState(_id)
  const [showTask, setShowTask] = useState(props.urlTaskId == props.clickTaskId)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [chainInstance, setChainInstance] = useState(false)
  const [scName, setSCName] = useState('')
  const [scPhoto, setSCPhoto] = useState('')
  const [taskComments, setTaskComments] = useState([])
  const [taskDocuments, setTaskDocuments] = useState([])
  const [taskImages, setTaskImages] = useState([])
  const [attachmentUpdated, setAttachmentUpdated] = useState(false)
  let color = ''

  $(`#checkbox-${index}`).on('click', function (event) {
    event.stopImmediatePropagation()
    if (event.target.checked === true) {
      props.selection(true, index)
    } else {
      props.selection(false, index)
    }
  })

  let getSubcontractorName = async () => {
    try {
      if (chainInstance.subcontractor) {
        let sc = await api.getUser(chainInstance.subcontractor.toLowerCase())
        return sc.name
      }
    } catch (error) {
      // throw error
    }
  }

  let getSubcontractorPhoto = async () => {
    if (chainInstance.subcontractor) {
      try {
        let imagesrc = await api.getProfilePhoto(chainInstance.subcontractor.toLowerCase())
        return imagesrc
      } catch (error) {
        return 'None'
      } finally {
        props.doneLoading()
      }
    }
  }

  let getSubcontractorInfo = async () => {
    await getSubcontractorName().then(setSCName)
    await getSubcontractorPhoto().then(setSCPhoto)
  }

  let getTaskAttachments = async () => {
    let documents = await api.taskDocuments(_id)
    setTaskComments(documents.comments)
    console.log('COMMENTS', documents.comments)
    setTaskImages(documents.images)
    setTaskDocuments(documents.documents)
  }

  let indexToStatusType = {
    1: 'Inactive',
    2: 'Active',
    3: 'Pending',
    4: 'Complete',
  }

  let indexToAlertType = {
    0: 'None',
    1: 'TaskFunded',
    2: 'SCConfirmed',
    3: 'LienReleaseAdded',
  }

  useEffect(() => {
    getTaskAttachments()
  }, [attachmentUpdated])

  useEffect(() => {
    if (!api) return
    getTaskAttachments()
  }, [api])

  function closeModal() {
    setShowTask(false)
    history.push(`/dashboard/projects/${props.projectId}`)
  }

  function pickColor(status) {
    switch (status) {
      case 'Inactive':
      case 'inactive':
        color = 'salmon'
        break
      case 'Active':
      case 'active':
        color = 'limegreen'
        break
      case 'Pending':
      case 'pending':
        color = 'yellow'
        break
      case 'Complete':
      case 'complete':
        color = '#0000FF'
        break
      case 'None':
        color = ''
        break
      case 'SCConfirmed':
        color = '#f0efa8'
        break
      case 'LienReleaseAdded':
        color = '#a8d2f0'
        break
      case 'TaskFunded':
        color = '#FFC0CB'
        break
      default:
        break
    }
    return color
  }

  function styleBasedOnAlerts() {
    if (activeAlerts.length == 1) {
      return pickColor(activeAlerts[0])
    }
    if (activeAlerts.length > 1) {
      return ''
    }
  }

  function displayAlerts() {
    if (activeAlerts.length == 1) {
      return activeAlerts[0]
    } else if (activeAlerts.length > 1) {
      return 'Multiple'
    } else {
      return 'None'
    }
  }

  useEffect(() => {
    let getAlerts = async () => {
      let active = []
      let alerts = await props.project.getAlerts(index)
      for (let i = 0; i < alerts.length; i++) {
        if (alerts[i]) active.push(indexToAlertType[i])
      }
      setActiveAlerts(active)
      let task = await props.project.tasks(index)
      let status = indexToStatusType[task.state]
      setChainInstance(task)
    }
    getAlerts()
  }, [])

  useEffect(() => {
    if (!chainInstance) return
    getSubcontractorInfo()
  }, [chainInstance])
  return (
    <>
      <tr
        className="inner-task-row"
        onClick={() => {
          setShowTask(true)
          setTaskId(_id)
          history.push(`/dashboard/projects/${props.projectId}?task=${_id}`)
        }}
      >
        <td className="table-content">
          <input className="task-table-checkbox" id={'checkbox-' + index} type="checkbox" />
        </td>
        <td className="num-cell">{index}</td>
        <td className="name-cell">{title}</td>
        <td className="phase-cell">{phase}</td>
        <td className="status-cell">
          <span className="task-status" style={{ backgroundColor: pickColor(indexToStatusType[chainInstance.state]) }}>
            {indexToStatusType[chainInstance.state]}
          </span>
        </td>
        <td className="alert-cell">
          <span className="task-alert" style={{ backgroundColor: styleBasedOnAlerts() }}>
            {displayAlerts()}
          </span>
        </td>
        <td className="cost-cell">${cost}</td>
        <td className="notes-cell">
          <img className="task-table-image" src={require('../../../../Images/txt-icon.png')} />
          <span style={{ marginLeft: '3%' }}>:x{taskComments.length}</span>
        </td>
        <td className="image-cell">
          <img className="task-table-image" src={require('../../../../Images/jpg-icon.png')} />
          <span style={{ marginLeft: '3%' }}>:x{taskImages.length}</span>
        </td>
        <td>
          <img className="task-table-image" src={require('../../../../Images/pdf-icon.png')} />
          <span style={{ marginLeft: '3%' }}>:x{taskDocuments.length}</span>
        </td>
        {scPhoto !== '' ? (
          <td className="subcontractor-cell">
            {scName !== undefined ? (
              scPhoto === 'None' ? (
                <img alt="Profile" src={require('../../../../Images/stock_profile_icon.png')} />
              ) : (
                <img alt="Profile" src={scPhoto} />
              )
            ) : null}
            <span className="subcontractor-name">{scName !== undefined ? scName : 'None'}</span>
          </td>
        ) : (
          <Loading type="bubbles" height="70px" width="70px" color="blue" />
        )}
      </tr>
      <Task
        attachmentUpdate={setAttachmentUpdated}
        userAddress={props.userAddress}
        role={props.role}
        scList={props.scList}
        onChain={chainInstance}
        alerts={activeAlerts}
        comments={taskComments}
        cost={cost}
        description={description}
        documents={taskDocuments}
        images={taskImages}
        taskTitle={title}
        taskNum={index}
        taskStatus={indexToStatusType[chainInstance.state]}
        sc={scName}
        profilePhoto={scPhoto}
        project={props.project}
        show={showTask}
        id={taskId}
        onHide={closeModal}
      />
    </>
  )
}
export default TaskRow
