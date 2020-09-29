import React, { useEffect, useState, useContext, useLayoutEffect } from 'react'
import { Col, Modal, Row, Button } from 'react-bootstrap'
import $ from 'jquery'
import AddDocument from './TaskItemModals/AddDocument'
import AddComment from './TaskItemModals/AddComment'
import AddPhoto from './TaskItemModals/AddPhoto'
import '../../../../App.css'
import ViewComment from './TaskItemModals/ViewComment'
import { useApi } from '../../../../api'
import { AuthContext } from '../../../../Components/Auth'
import SubcontractorSearchBar from '../../../../Components/SubcontractorSearchBar'
import mixpanel from '../../../../api/mixpanel'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { utils } from 'ethers'

function Task(props) {
  const api = useApi()
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showCommentUpload, setShowCommentUpload] = useState(false)
  const [showCommentView, setShowCommentView] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showSCModal, setShowSCModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadFailure, setUploadFailure] = useState(false)
  const [activateSuccess, setActivateSuccess] = useState(false)
  const [activateFailure, setActivateFailure] = useState(false)
  const [lienSuccess, setLienSuccess] = useState(false)
  const [lienFailure, setLienFailure] = useState(false)
  const [completeSuccess, setCompleteSuccess] = useState(false)
  const [completeFailure, setCompleteFailure] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [progress, setProgress] = useState(0)

  let { ethers } = useContext(AuthContext)

  let linkFilesToImages = async () => {
    let imageLinks = document.getElementsByClassName('task-image-download')
    let documentLinks = document.getElementsByClassName('task-document-download')

    if (imageLinks.length != 0) {
      for (let i = 0; i < props.images.length; i++) {
        let id = props.images[i]._id
        let file = await api.getDocumentFile(id)
        if (imageLinks[i] !== undefined) {
          imageLinks[i].href = file
          imageLinks[i].download = props.images[i].fileName + '.' + props.images[i].extension
        }
      }
    }

    if (documentLinks.length != 0) {
      for (let i = 0; i < props.documents.length; i++) {
        let id = props.documents[i]._id
        let file = await api.getDocumentFile(id)
        if (documentLinks[i] !== undefined) {
          documentLinks[i].href = file
          documentLinks[i].download = props.documents[i].fileName + '.' + props.documents[i].extension
        }
      }
    }
  }
  useLayoutEffect(() => {
    linkFilesToImages()
  })

  $(document).ready(() => {
    if (!props.taskStatus) return
    switch (props.taskStatus.toLowerCase()) {
      case 'inactive':
        setProgress(0)
        break
      case 'active':
        setProgress(1)
        break
      case 'pending':
        setProgress(2)
        break
      case 'complete':
        setProgress(3)
        break
      default:
        setProgress(4)
        break
    }
  })

  let progressColor = (progressBar) => {
    switch (progressBar) {
      case 'inactive':
        if (progress == 0) {
          return '#90ee90'
        } else {
          return '#35a7ff'
        }
        break

      case 'active':
        if (progress == 1) {
          return '#90ee90'
        } else if (progress > 1) {
          return '#35a7ff'
        } else {
          return 'gray'
        }
        break

      case 'pending':
        if (progress == 2) {
          return '#90ee90'
        } else if (progress > 2) {
          return '#35a7ff'
        } else {
          return 'gray'
        }
        break

      case 'complete':
        if (progress >= 3) {
          return '#35a7ff'
        } else {
          return 'gray'
        }
        break

      default:
        break
    }
  }

  let handleSetActive = async () => {
    try {
      let tx = await props.project.setActive(props.taskNum)
      let receipt = await tx.wait()
      setActivateSuccess(true)
    } catch (e) {
      setActivateFailure(true)
    }
  }

  let checkActivateTask = () => {
    return props.alerts.includes('TaskFunded') && props.alerts.includes('SCConfirmed')
  }

  let checkLienAlert = () => {
    return props.alerts.includes('LienReleaseAdded')
  }

  let createAlertArray = () => {
    let alertArray = []
    for (let i = 0; i < props.alerts.length; i++) {
      alertArray.push(
        <>
          <Button variant="warning" style={{ borderRadius: '50px' }}>
            {props.alerts[i]}
          </Button>
          <br />
          <br />
        </>
      )
    }
    return alertArray
  }

  let handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    if (uploadFailure) setUploadFailure(false)
    if (uploadSuccess) setUploadSuccess(false)
    if (activateFailure) setActivateFailure(false)
    if (activateSuccess) setActivateSuccess(false)
  }

  let createCommentArray = () => {
    let commentArray = []
    if (props.comments.length == 0) return
    for (let i = 0; i < props.comments.length; i += 2) {
      let leftComment = props.comments[i]
      let rightComment = props.comments[i + 1]
      let visibility = 'visible'
      if (props.comments[i + 1] === undefined) {
        visibility = 'hidden'
      }
      commentArray.push(
        <>
          <br />
          <div className="task-attachment-div">
            <a
              href
              onClick={(event) => {
                setShowCommentView('Comment-' + i)
              }}
            >
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">{leftComment.fileName + '.' + leftComment.extension}</p>
              </div>
            </a>
            {showCommentView === 'Comment-' + i ? (
              <ViewComment
                info={leftComment}
                visibility={true}
                close={() => {
                  commentViewClose()
                  uploadModalHide()
                }}
              />
            ) : null}
          </div>
          <div style={{ visibility: visibility }} className="task-attachment-div">
            <a
              href
              onClick={(event) => {
                setShowCommentView('Comment-' + (i + 1))
              }}
            >
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">
                  {rightComment !== undefined ? rightComment.fileName + '.' + rightComment.extension : null}
                </p>
              </div>
            </a>
            {showCommentView === 'Comment-' + (i + 1) ? (
              <ViewComment
                info={rightComment}
                visibility={true}
                close={() => {
                  commentViewClose()
                  uploadModalHide()
                }}
              />
            ) : null}
          </div>
        </>
      )
    }
    return commentArray
  }

  let createImageArray = () => {
    let imageArray = []
    for (let i = 0; i < props.images.length; i += 2) {
      let leftImage = props.images[i]
      let rightImage = props.images[i + 1]
      let visibility = 'visible'
      if (props.images[i + 1] === undefined) {
        visibility = 'hidden'
      }
      imageArray.push(
        <>
          <br />
          <div className="task-attachment-div">
            <a className="task-image-download" href download>
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">{leftImage.fileName + '.' + leftImage.extension}</p>
              </div>
            </a>
          </div>
          <div style={{ visibility: visibility }} className="task-attachment-div">
            <a className="task-image-download" download>
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">
                  {rightImage !== undefined ? rightImage.fileName + '.' + rightImage.extension : null}
                </p>
              </div>
            </a>
          </div>
        </>
      )
    }
    return imageArray
  }

  let createDocumentArray = () => {
    let documentArray = []
    for (let i = 0; i < props.documents.length; i += 2) {
      let leftDocument = props.documents[i]
      let rightDocument = props.documents[i + 1]
      let visibility = 'visible'
      if (props.documents[i + 1] === undefined) {
        visibility = 'hidden'
      }
      documentArray.push(
        <>
          <br />
          <div className="task-attachment-div">
            <a className="task-document-download" href download>
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">{leftDocument.fileName + '.' + leftDocument.extension}</p>
              </div>
            </a>
          </div>
          <div style={{ visibility: visibility }} className="task-attachment-div">
            <a className="task-document-download" href download>
              <div>
                <img alt="Background" className="task-image" src={require('../../../../Images/document.png')} />
                <br />
                <p className="task-attachment-name">
                  {rightDocument !== undefined ? rightDocument.fileName + '.' + rightDocument.extension : null}
                </p>
              </div>
            </a>
          </div>
        </>
      )
    }
    return documentArray
  }

  // Methods for opening and closing photo upload modal
  const photoUploadClose = () => setShowPhotoUpload(false)
  const photoUploadShow = () => setShowPhotoUpload(true)

  // Methods for opening and closing comment upload modal
  const commentUploadClose = () => setShowCommentUpload(false)
  const commentUploadShow = () => setShowCommentUpload(true)

  // Methods for opening and closing document upload modal
  const documentUploadClose = () => setShowDocumentUpload(false)
  const documentUploadShow = () => setShowDocumentUpload(true)

  // Methods for opening and closing exist comment modal
  const commentViewClose = () => setShowCommentView(false)
  const commentViewShow = () => setShowCommentView(true)

  // Alter brightness of background modal
  const uploadModalOpen = () => setBrightness(50)
  const uploadModalHide = () => setBrightness(100)

  useEffect(() => {
    if (props.show === true) {
      if (window.location.href.indexOf('task') === -1) {
        props.onHide()
      }
    }
  }, [])

  let handleCommentView = (event) => {
    event.preventDefault()
    setShowCommentView(true)
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = (error) => reject(error)
    })

  let handleDocumentSubmit = async (event) => {
    event.preventDefault()
    mixpanel.track('new_task_comment')
    let file = event.target.document.files[0]
    let mimeType = file.type
    let name = event.target.document.files[0].name
    let extension = name.substring(name.lastIndexOf('.') + 1)
    name = name.substring(0, name.lastIndexOf('.'))
    let b64 = await toBase64(file)
    let payload = {
      title: name,
      file: b64,
      type: mimeType,
      extension: extension,
    }
    try {
      await api.postDocument(props.id, payload)
      setUploadSuccess(true)
      props.attachmentUpdate(true)
    } catch (e) {
      setUploadFailure(true)
    }
  }

  let handleCommentSubmit = async (event) => {
    event.preventDefault()
    mixpanel.track('new_task_photo')
    let title = event.target.title.value
    let comment = event.target.comment.value
    let payload = {
      title: title,
      task: props.id,
      file: comment,
      type: 'text/plain',
      extension: 'txt',
      description: comment,
    }
    try {
      await api.postDocument(props.id, payload)
      setUploadSuccess(true)
      props.attachmentUpdate(true)
    } catch (e) {
      setUploadFailure(true)
    }
  }
  let hash = (str) => utils.keccak256(utils.formatBytes32String(str))

  let handleLienRelease = async () => {
    try {
      let signer = await ethers.getSigner()
      let signature = await signer.signMessage('Padlock Task Complete' + props.id)
      let lien = await api.getLienRelease(props.id, signature)
      let payload = {
        title: 'lien_release',
        file: lien,
        type: 'application/pdf',
        extension: 'pdf',
      }
      let title = hash(payload.title)
      console.log(typeof payload.file)
      let body = hash(payload.file.substr(0, 25))
      let tx = await props.project.addDocument(props.taskNum, title, body)
      let receipt = await tx.wait()
      let index = receipt.events[0].args._document
      let tx2 = await props.project.designateLienRelease(props.taskNum, index.toNumber())
      let receipt2 = await tx2.wait()
      await api.postDocument(props.id, payload)
      console.log(lien)
      setLienSuccess(true)
    } catch (err) {
      setLienFailure(true)
    }
  }

  let handleConfirmPayment = async () => {
    try {
      await props.project.setComplete(props.taskNum)
      setCompleteSuccess(true)
    } catch (err) {
      setCompleteFailure(true)
    }
  }

  let button
  if (props.sc && props.alerts.includes('SCConfirmed')) {
    button = (
      <Button className="sc-reassign" variant="success" style={{ borderRadius: '50px' }}>
        Accepted
      </Button>
    )
  } else if (props.sc) {
    button = (
      <Button
        className="sc-reassign"
        variant="danger"
        style={{ borderRadius: '50px' }}
        onClick={() => {
          setShowSCModal(true)
          uploadModalOpen()
        }}
      >
        Reassign
      </Button>
    )
  } else {
    button = (
      <Button
        className="sc-reassign"
        variant="primary"
        style={{ borderRadius: '50px' }}
        onClick={() => {
          setShowSCModal(true)
          uploadModalOpen()
        }}
      >
        Assign
      </Button>
    )
  }
  return (
    <div>
      <Modal
        style={{ filter: `brightness(${brightness}%)` }}
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-hcenter">
            <Row>
              <Col>
                <p className="task-number-heading">
                  <i>Task# {props.taskNum}</i>
                </p>
                <h2 style={{ width: '100%' }} className="task-modal-title">
                  {props.taskTitle}
                </h2>
              </Col>
            </Row>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row style={{ justifyContent: 'center' }}>
            <div style={{ backgroundColor: progressColor('inactive') }} className="task-progress-inactive">
              <p>Inactive</p>
            </div>
            <div style={{ backgroundColor: progressColor('active') }} className="task-progress-active">
              <p>Active</p>
            </div>
            <div style={{ backgroundColor: progressColor('pending') }} className="task-progress-ip">
              <p>Pending</p>
            </div>
            <div style={{ backgroundColor: progressColor('complete') }} className="task-progress-complete">
              <p>Complete</p>
            </div>
          </Row>
          <br />
          <Row>
            <Col sm={4}>
              <div>
                <h5 id="task-about-heading">About this task</h5>
                <br />
                <p>Cost: ${props.cost}</p>
                <div className="task-cost-box">{props.description}</div>
                <br />
                {props.taskStatus !== 'Complete' ? (
                  <div id="alert-actions">
                    {props.taskStatus === 'Inactive' && props.role === 'gc' ? (
                      <Button variant={checkActivateTask() ? 'primary' : 'secondary'} onClick={() => handleSetActive()}>
                        Activate Task
                      </Button>
                    ) : null}
                    {props.taskStatus === 'Active' && props.role === 'sc' ? (
                      <Button variant={checkLienAlert() ? 'secondary' : 'primary'} onClick={() => handleLienRelease()}>
                        Submit Lien Release
                      </Button>
                    ) : null}
                    {/* {props.taskStatus === 'Active' && props.role === 'gc' ? (
                      <Button variant={checkLienAlert() ? 'primary' : 'secondary'}>Approve Lien Release</Button>
                    ) : null} */}
                    {props.taskStatus === 'Pending' && props.role === 'gc' ? (
                      <Button variant="primary" onClick={() => handleConfirmPayment()}>
                        Confirm Payment
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Col>
            <Col sm={4}>
              <h5 id="task-alerts-heading">Alerts</h5>
              <br />
              <div id="task-alerts">{createAlertArray()}</div>
              <br />
              <br />
            </Col>
            <Col sm={4}>
              <h5 id="task-subcontractor-heading">Subcontractor</h5>
              <br />
              <div className="subcontractor-box">
                {props.sc ? (
                  props.profilePhoto === 'None' ? (
                    <img
                      className="task-subcontractor-image"
                      src={require('../../../../Images/stock_profile_icon.png')}
                    />
                  ) : (
                    <img className="task-subcontractor-image" src={props.profilePhoto} />
                  )
                ) : (
                  <h4>None</h4>
                )}
                {props.sc}
              </div>
              <br />
              {props.role === 'gc' ? button : null}
            </Col>
          </Row>
          <br />
          <Row>
            <Col sm={4}>
              <div className="task-box">
                Comments
                {createCommentArray()}
              </div>
              <div className="task-item-upload">
                <Button
                  className="task-document-upload-button"
                  variant="primary"
                  onClick={() => {
                    commentUploadShow()
                    uploadModalOpen()
                  }}
                >
                  Add Comment
                </Button>
              </div>
              <br />
            </Col>
            <Col sm={4}>
              <div className="task-box">
                Photos
                {createImageArray()}
              </div>
              <div className="task-item-upload">
                <Button
                  className="task-document-upload-button"
                  variant="primary"
                  onClick={() => {
                    photoUploadShow()
                    uploadModalOpen()
                  }}
                >
                  Add Photo
                </Button>
              </div>
              <br />
            </Col>
            <Col sm={4}>
              <div className="task-box">
                Documents
                {createDocumentArray()}
              </div>
              <div className="task-item-upload">
                <Button
                  className="task-document-upload-button"
                  variant="primary"
                  onClick={() => {
                    documentUploadShow()
                    uploadModalOpen()
                  }}
                >
                  Add Document
                </Button>
              </div>
              <br />
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      <AddDocument
        visibility={showDocumentUpload}
        save={handleDocumentSubmit}
        close={() => {
          documentUploadClose()
          uploadModalHide()
        }}
      />
      <AddComment
        visibility={showCommentUpload}
        save={handleCommentSubmit}
        close={() => {
          commentUploadClose()
          uploadModalHide()
        }}
      />
      <AddPhoto
        visibility={showPhotoUpload}
        save={handleDocumentSubmit}
        close={() => {
          photoUploadClose()
          uploadModalHide()
        }}
      />
      <SubcontractorSearchBar
        isTaskModal={true}
        id={props.id}
        index={props.taskNum}
        scList={props.scList}
        show={showSCModal}
        project={props.project}
        onHide={() => {
          setShowSCModal(false)
          uploadModalHide()
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Document Uploaded!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Document Upload Failed!
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={activateSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Task Activated!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={activateFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Task Failed To Activate!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={lienSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Lien Release Submitted!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={lienFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Failed to add Lien Release!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={completeSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Task set to complete state!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={completeFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Failed to set task to complete state!
        </Alert>
      </Snackbar>
    </div>
  )
}
export default Task
