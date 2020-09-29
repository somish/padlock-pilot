import React, { useState, useContext, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { AuthContext } from '../../Components/Auth'
import mixpanel from '../../api/mixpanel'
import { useApi } from '../../api'
import '../../App.css'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

function Profile(props) {
  const api = useApi()
  const history = useHistory()
  let { logout } = useContext(AuthContext)
  let [uploadSuccess, setUploadSuccess] = useState(false)
  let [uploadFailure, setUploadFailure] = useState(false)
  let name
  let email
  let role
  if (props.user !== null) {
    name = props.user.name
    email = props.user.email
    role = props.user.role
  }

  let directToLandingPage = () => {
    history.push('/')
  }

  let uploadPhoto = async (event) => {
    event.preventDefault()
    let file = event.target.image.files[0]
    try {
      await api.uploadProfilePhoto(file)
      setUploadSuccess(true)
      props.upload(true)
    } catch (error) {
      setUploadFailure(true)
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setUploadFailure(false)
    setUploadSuccess(false)
  }

  useEffect(() => {
    mixpanel.track('profile_visit')
  }, [])

  return (
    <>
      <Modal
        {...props}
        size="lg"
        dialogClassName="profile-modal"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" style={{ textAlign: 'center' }}>
            Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={7} sm={8}>
              <div className="profile-photo-div">
                {props.image !== 'None' ? (
                  <img id="profile-image" src={props.image} alt="Profile" />
                ) : (
                  <img src={require('../../Images/padlock.png')} alt="PadLock" />
                )}
              </div>
              <form onSubmit={uploadPhoto} method="POST" encType="multipart/form-data">
                <input type="file" accept=".png, .jpg" name="image" />
                <br />
                <br />
                <Button className="profile-image-upload" variant="primary" type="submit">
                  Upload New Photo
                </Button>
              </form>
            </Col>
            <Col md={5} sm={7}>
              <br />
              <br />
              <h4>Name: {name}</h4>
              <br />
              <h4>Role: {role}</h4>
              <br />
              <h4 id="profile-email">Email : {email} </h4>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              logout()
              directToLandingPage()
            }}
          >
            Logout
          </Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Photo Successfully Uploaded!!!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Photo Failed To Upload. Image May Exceed Max Size!!!
        </Alert>
      </Snackbar>
    </>
  )
}

export default Profile
