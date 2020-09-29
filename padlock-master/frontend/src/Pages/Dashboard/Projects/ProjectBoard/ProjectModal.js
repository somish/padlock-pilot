import React, { useState } from 'react'
import { Modal, Button, Row, Col, Alert } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import GCFees from '../TaskBoard/GCFees'
import mixpanel from '../../../../api/mixpanel'
import { usePadlock, useApi } from '../../../../api'
import OwnerSearchBar from '../../../../Components/OwnerSearchBar'
import { Snackbar } from '@material-ui/core'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import DoneIcon from '@material-ui/icons/Done'

function ProjectModal(props) {
  let padlock = usePadlock()
  let api = useApi()
  let [modalShow5, setModalShow5] = React.useState(false)
  let [gcFeeData, setGCFeeData] = useState([])
  let [owner, setOwner] = useState('')
  let [showOwnerList, setShowOwnerList] = useState(false)
  let [uploadAlert, setUploadAlert] = useState(false)
  let [errors, setErrors] = useState([])
  let [actionLoading, setActionLoading] = useState(false)
  let [uploadSuccess, setUploadSuccess] = useState(false)
  let [uploadFailure, setUploadFailure] = useState(false)

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = (error) => reject(error)
    })

  let handleSubmit = async (event) => {
    setActionLoading(true)
    event.preventDefault()
    if (gcFeeData.length == 0 || owner === '') {
      let errorList = []
      if (gcFeeData.length == 0) errorList.push('Error: You must provide GC Fee Data.')
      if (owner === '') errorList.push('Error: You must assign an owner to the project.')
      setErrors(errorList)
      setUploadAlert(true)
      return
    }
    let title = event.target.name.value
    let address = event.target.address.value
    let file = event.target.image.files[0]
    let imagePayload
    if (file) {
      let b64 = await toBase64(file)
      imagePayload = {
        type: file.type,
        file: b64,
      }
    }
    let tx = await padlock.newProject(owner[2], gcFeeData)
    await tx.wait()
    let index = (await padlock.projectSerial()).toNumber()
    let deployed = await padlock.projects(index)
    let payload = {
      title,
      deployed,
      address,
      imagePayload,
      owner: owner[2],
    }
    try {
      await api.postProject(payload)
      props.onHide()
      setUploadSuccess(true)
    } catch (e) {
      props.onHide()
      setUploadFailure(true)
    }
    mixpanel.track('new_project')
    await props.refreshProjectData()
    setActionLoading(false)
  }

  let displayErrors = () => {
    let errorList = []
    for (let i = 0; i < errors.length; i++) {
      errorList.push(<p>{errors[i]}</p>)
    }
    return errorList
  }

  const buttonText = actionLoading ? '...' : 'Create'

  let handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setUploadFailure(false)
    setUploadSuccess(false)
  }

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
        keyboard="false"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group controlId="formName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control type="text" name="name" placeholder="" required />
            </Form.Group>

            <Form.Group controlId="formAddress">
              <Form.Label>Project Postal Address</Form.Label>
              <Form.Control type="text" name="address" placeholder="" required />
            </Form.Group>

            <Form.Group controlId="formOwner">
              <Button onClick={() => setShowOwnerList(true)}>Choose Owner</Button>:{' '}
              <span>
                {owner !== '' ? (
                  <>
                    <label>{owner[0]}</label>{' '}
                    {owner[1] !== 'None' ? (
                      <img id="owner-image-project" src={owner[1]} alt="Profile" />
                    ) : (
                      <img
                        id="owner-image-project"
                        src={require('../../../../Images/stock_profile_icon.png')}
                        alt="Profile"
                      />
                    )}
                  </>
                ) : null}
              </span>
            </Form.Group>

            <Row>
              <Col sm={6}>
                <Form.File id="formcheck-api-regular">
                  <Form.Label>Upload Project Picture</Form.Label>
                  <Form.File accept=".jpg, .png" name="image" />
                </Form.File>
              </Col>
              <br />
              <Col sm={6}>
                <Button
                  variant="primary"
                  style={{ marginTop: '5%', float: 'right' }}
                  onClick={() => setModalShow5(true)}
                >
                  Fee Schedule
                </Button>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide} style={{ backgroundColor: 'rgba(0,0,0,0', color: 'black' }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {buttonText}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <GCFees setData={setGCFeeData} image={props.image} show={modalShow5} onHide={() => setModalShow5(false)} />
      <OwnerSearchBar
        ownerList={props.ownerList}
        chooseOwner={setOwner}
        show={showOwnerList}
        onHide={() => {
          setShowOwnerList(false)
        }}
      />
      <Alert show={uploadAlert} variant="danger" id="project__upload__alert">
        <Alert.Heading>Errors</Alert.Heading>
        {displayErrors()}
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setUploadAlert(false)
            }}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </Alert>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert id="project__upload__notification__success" onClose={handleClose} severity="success">
          <DoneIcon className="project__upload__alert__icon" color="#11a029"></DoneIcon> Upload Successful!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert id="project__upload__notification__failure" onClose={handleClose} severity="error">
          <ErrorOutlineIcon className="project__upload__alert__icon" color="#9b061a"></ErrorOutlineIcon> Failed to
          Upload!
        </Alert>
      </Snackbar>
    </>
  )
}

export default ProjectModal
