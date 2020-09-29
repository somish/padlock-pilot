import React from 'react'
import { Button, Modal } from 'react-bootstrap'

function ActionButtonModal(props) {
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
      keyboard="false"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter"></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="action-to-perform">Are you sure you want to {props.perform}?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button
          onClick={() => {
            props.action()
            props.onHide()
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ActionButtonModal
