import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import '../../../../../App.css'

function AddDocument(props) {
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
          <Modal.Title>Upload a PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Add Document</h4>
          <form
            onSubmit={(event) => {
              props.save(event)
              props.close()
            }}
          >
            <label htmlFor="myfile">Select a document (PDF only):</label>
            <input type="file" id="task-document-upload" name="document" accept=".pdf" />
            <br />
            <br />
            <br />
            <br />
            <Button variant="secondary" onClick={props.close}>
              Close
            </Button>
            <Button className="save-changes" type="submit" variant="primary">
              Save Changes
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default AddDocument
