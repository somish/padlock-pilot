import React from 'react'
import { Modal, Button } from 'react-bootstrap'

function PhaseCostInput(props) {
  let submit = (event) => {
    event.preventDefault()
    let costInput = event.target.cost.value
    if (costInput < 100000000 || isNaN(costInput)) {
      document.getElementById('bounds-alert').innerHTML = ''
      props.updateTable(costInput.replace(/[$,]/g, ''))
      props.onHide()
    } else {
      document.getElementById('bounds-alert').innerHTML = 'Error. Number cannot exceed 100000000'
    }
  }

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
        <h4 id="phase-cost-header">Input Cost</h4>
        <p id="cost-description">Please only enter numerical values. (0 - 1000000000)</p>
        <form id="cost-form" onSubmit={submit}>
          <input type="text" name="cost" id="cost-input" />
          <p id="bounds-alert"></p>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button form="cost-form" type="submit">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default PhaseCostInput
