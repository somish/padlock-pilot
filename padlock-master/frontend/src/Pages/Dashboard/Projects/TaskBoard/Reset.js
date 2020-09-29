import React from 'react'
import { Modal, Button } from 'react-bootstrap'

function Reset(props) {
  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Reset Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to reset your filtering options?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            props.onHide()
            props.resetFilter()
          }}
        >
          Confirm
        </Button>
        <Button variant="secondary" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Reset
