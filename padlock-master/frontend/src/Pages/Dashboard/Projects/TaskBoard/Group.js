import React, { useState } from 'react'
import { Modal, Button, Row, Col } from 'react-bootstrap'
import SubcontractorSearchBar from '../../../../Components/SubcontractorSearchBar'

function Group(props) {
  const [showSCModal, setShowSCModal] = useState(false)
  let taskArray = []
  let checkedTasks = [].concat(props.checkedTasks)
  let taskNumbers = document.getElementsByClassName('num-cell')
  let taskTitles = document.getElementsByClassName('name-cell')
  let taskPhases = document.getElementsByClassName('phase-cell')
  let taskSCs = document.getElementsByClassName('subcontractor-name')
  if (props.checkedTasks !== undefined) {
    checkedTasks.sort()
    if (taskNumbers !== undefined && taskNumbers.length !== 0) {
      for (let i = 0; i < checkedTasks.length; i++) {
        taskArray.push(
          <tr>
            <td>{'Task: #' + taskNumbers[checkedTasks[i] - 1].innerHTML}</td>
            <td>{'Title: ' + taskTitles[checkedTasks[i] - 1].innerHTML}</td>
            <td>{'Phase: ' + taskPhases[checkedTasks[i] - 1].innerHTML}</td>
            <td>{'Subcontractor: ' + taskSCs[checkedTasks[i] - 1].innerHTML}</td>
          </tr>
        )
      }
    }
  }

  return (
    <>
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Group Actions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="group-topdiv-center">
            <h4>Selected Tasks</h4>
            <div className="task-card-recent-updates">
              <table className="selected-task-table">{taskArray}</table>
            </div>
          </div>
          <br />

          <Row>
            {props.role === 'gc' ? (
              <Col sm={3}>
                <Button style={{ marginTop: '3%' }} variant="success" onClick={() => setShowSCModal(true)}>
                  Assign Subcontractor
                </Button>
              </Col>
            ) : null}
            {props.role === 'sc' ? (
              <Col sm={3}>
                <Button style={{ marginTop: '3%' }} variant="warning" onClick={props.onHide}>
                  Generate Lien Release
                </Button>
              </Col>
            ) : null}
            {props.role === 'gc' ? (
              <Col sm={3}>
                <Button style={{ marginTop: '3%' }} variant="danger" onClick={props.onHide}>
                  Approve Lien Release
                </Button>
              </Col>
            ) : null}
            <Col sm={3}>
              <Button style={{ marginTop: '3%' }} variant="primary" onClick={props.onHide}>
                Export Data
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={props.onHide}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <SubcontractorSearchBar scList={props.scList} show={showSCModal} onHide={() => setShowSCModal(false)} />
    </>
  )
}
export default Group
