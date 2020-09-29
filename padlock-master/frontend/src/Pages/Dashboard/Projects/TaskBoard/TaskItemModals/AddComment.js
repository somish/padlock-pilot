import React from 'react'
import { Button, Modal } from 'react-bootstrap'

function AddComment(props) {
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
          <Modal.Title>Upload Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(event) => {
              props.save(event)
              props.close()
            }}
          >
            <h3>Title: </h3>
            <input id="new-comment-title" name="title" type="text" required />
            <br />
            <h3>Body: </h3>
            <textarea name="comment" rows="4" cols="50" required></textarea>
            <Button variant="secondary" onClick={props.close}>
              Close
            </Button>
            <Button className="save-changes" type="submit" variant="primary">
              Add Comment
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
export default AddComment
