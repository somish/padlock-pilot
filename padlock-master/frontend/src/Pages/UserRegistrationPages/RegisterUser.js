import React, { useState, useContext } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import NavigationBar from '../LandingPage/LandingPageNavigationbar'
import { Form, Button } from 'react-bootstrap'
import { AuthContext } from '../../Components/Auth'
import '../../App.css'
import LandingPageNavigationbar from '../LandingPage/LandingPageNavigationbar'
import $ from 'jquery'

function RegisterUser(props) {
  let { register } = useContext(AuthContext)
  let orgnanizationName
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [image, setImage] = useState('')

  let displayPhoto = (target) => {
    let read = new FileReader()
    read.onload = (e) => {
      $('#photo-upload').attr('src', e.target.result)
    }
    read.readAsDataURL(target.files[0])
  }
  $(document).ready(() => {
    $('#image-upload').on('change', (event) => {
      displayPhoto(event.target)
    })
  })

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = (error) => reject(error)
    })

  function handleFile(event) {
    setImage(event.target.files[0])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    let invitationId = props.inviteId
    let imagePayload
    if (image !== '') {
      let b64 = await toBase64(image)
      imagePayload = {
        type: image.type,
        file: b64,
      }
    }
    let payload =
      image !== ''
        ? { name, email, streetAddress, invitationId, imagePayload }
        : { name, email, streetAddress, invitationId } //needs phone number and id token as well
    register(payload)
  }

  return (
    <div>
      <LandingPageNavigationbar />
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <h1 className="registerTitle">Registration: User Details</h1>
        <p className="invitee-info">
          PadLock has invited {props.name} to join the platform as a {props.role}
        </p>
        <Container style={{ marginTop: '5%' }}>
          <Row>
            <Col sm={6}>
              <div className="profile-photo-div">
                {image !== '' ? (
                  <img id="photo-upload" alt="Upload" />
                ) : (
                  <img src={require('../../Images/stock_profile_icon.png')} alt="PadLock" />
                )}
              </div>
              <p id="photo-span">(Optional)</p>
              <Form.File id="formcheck-api-regular" className="formFile">
                <input type="file" name="image" id="image-upload" accept=".jpg, .png" onChange={handleFile} />
              </Form.File>
              <br />
            </Col>
            <Col sm={6}>
              <div style={{ backgroundColor: '#306ec5', borderRadius: '10px' }}>
                <h1 style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Personal Info</h1>
                <Form className="loginForm">
                  <Form.Group controlId="formBasicEmail">
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Name"
                      onChange={(newName) => setName(newName.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={(newEmail) => setEmail(newEmail.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicAddress">
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="Street Address"
                      onChange={(newAddress) => setStreetAddress(newAddress.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Control type="hidden" name="image" value={image} />
                  <Button variant="dark" type="submit" style={{ marginBottom: '3%', justifyContent: 'center' }}>
                    Confirm Registration
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </form>
    </div>
  )
}

export default RegisterUser
