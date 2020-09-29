import React from 'react'
import { Button, Modal } from 'react-bootstrap'

function ViewComment(props) {
  return (
    <div>
      <Modal
        show={props.visibility}
        onHide={props.close}
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.info.fileName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea name="comment" rows="4" cols="50" readOnly>
            {props.info.description}
          </textarea>
          <Button variant="secondary" onClick={props.close}>
            Close
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  )
}
export default ViewComment
