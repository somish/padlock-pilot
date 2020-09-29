import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import $ from 'jquery'

function AddPhoto(props) {
  const [photoChosen, setPhotoChosen] = useState(false)

  let displayPhoto = (target) => {
    let read = new FileReader()
    read.onload = (e) => {
      $('#photo-to-upload').attr('src', e.target.result)
    }
    read.readAsDataURL(target.files[0])
  }
  $(document).ready(() => {
    $('#task-photo-upload').on('change', (event) => {
      setPhotoChosen(true)
      displayPhoto(event.target)
    })
  })

  return (
    <Modal
      show={props.visibility}
      onHide={props.close}
      animation={false}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Photo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form
          onSubmit={(event) => {
            props.save(event)
            props.close()
          }}
        >
          <div className="profile-photo-div">
            {photoChosen ? (
              <img id="photo-to-upload" alt="Upload" />
            ) : (
              <img src={require('../../../../../Images/stock_profile_icon.png')} alt="PadLock" />
            )}
          </div>
          <br />
          <br />
          <label htmlFor="myfile">Select a photo (PNG or JPG only):</label>
          <input type="file" id="task-photo-upload" name="document" accept=".png, .jpg" />
          <br />
          <br />
          <Button variant="secondary" onClick={props.close}>
            Close
          </Button>
          <Button className="save-changes" type="submit" variant="primary">
            Upload Photo
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  )
}
export default AddPhoto
