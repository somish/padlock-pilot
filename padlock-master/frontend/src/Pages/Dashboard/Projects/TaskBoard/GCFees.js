import React, { useState, useContext, useEffect } from 'react'
import { Modal, Button, Row, Col, Table, Alert } from 'react-bootstrap'
import { useUser } from '../../../../api/hook'
import PhaseCostInput from '../ProjectComponents/PhaseCostInput'

function GCFees(props) {
  const user = useUser()
  const [count, setCount] = useState(1)
  const [prevCount, setPrevCount] = useState(1)
  const [showCostInput, setShowCostInput] = useState(false)
  const [selectedRow, setSelectedRow] = useState(-1)
  const [brightness, setBrightness] = useState(100)
  const [costs, setCosts] = useState(['null'])
  const [prevCosts, setPrevCosts] = useState([])
  const [closeAlert, setCloseAlert] = useState(false)
  const [prevState, setPrevState] = useState([])

  let name
  if (user !== null) {
    name = user.name
  }

  const modalOpen = () => setBrightness(30)
  const modalHide = () => setBrightness(100)

  let handleSubmit = () => {
    if (checkForErrors()) {
      document.getElementById('gc-syntax-error').innerHTML =
        'You cannot submit this form because there' +
        'are existing errors. \n (A yellow button indicated a null cost. A red button indicates a cost that is not ' +
        'a number)'
    } else {
      let gcData = []

      for (let i = 0; i < costs.length; i++) gcData.push(costs[i])
      props.setData(gcData)
      setPrevState(phaseRows)
      setPrevCount(count)
      setPrevCosts(costs)
      props.onHide()
    }
  }

  let phaseArray = [
    <tr className="gc-fee-table-row">
      <td className="gc-phase-column">Phase: 1</td>
      <td className="gc-cost-column">null</td>
      <td>
        <Button
          className="gc-change-button"
          onClick={() => {
            modalOpen()
            setSelectedRow(0)
            setShowCostInput(true)
          }}
        >
          Change
        </Button>
      </td>
    </tr>,
  ]

  const [phaseRows, setPhaseRows] = useState(prevState.length == 0 ? phaseArray : prevState)

  let addRow = () => {
    setCosts((prevData) => [...prevData, 'null'])
    let newTask = []
    setCount((prevCount) => prevCount + 1)
    newTask.push(
      <tr className="gc-fee-table-row">
        <td className="gc-phase-column">Phase: {count + 1}</td>
        <td className="gc-cost-column">null</td>
        <td>
          <Button
            className="gc-change-button"
            onClick={() => {
              modalOpen()
              setSelectedRow(count)
              setShowCostInput(true)
            }}
          >
            Change
          </Button>
        </td>
      </tr>
    )
    setPhaseRows((prevTasks) => [...prevTasks, newTask])
  }

  let removeRow = () => {
    setCosts(costs.filter((_, i) => i !== costs.length - 1))
    let costRows = document.getElementsByClassName('gc-cost-column')
    let val = costRows[costRows.length - 1]
    if (phaseRows.length > 1) {
      setCount((prevCount) => prevCount - 1)
      setPhaseRows(phaseRows.filter((_, i) => i !== phaseRows.length - 1))
    }
  }

  let getTotalCost = () => {
    let total = 0
    for (let i = 0; i < costs.length; i++) {
      let num = parseInt(costs[i])
      if (!Number.isNaN(num)) {
        total += num
      }
    }
    return total
  }

  let handleUpdate = (cost) => {
    setCosts(costs.map((value, index) => (index == selectedRow ? cost : value)))
    let costRows = document.getElementsByClassName('gc-cost-column')[selectedRow]
    costRows.innerHTML = cost
  }

  let checkForErrors = () => {
    let hasAnError = false
    let costRows = document.getElementsByClassName('gc-cost-column')
    let buttons = document.getElementsByClassName('gc-change-button')
    for (let i = 0; i < costRows.length; i++) {
      if ((isNaN(costRows[i].innerHTML) && costRows[i].innerHTML !== 'null') || costRows[i].innerHTML.trim() === '') {
        buttons[i].style.backgroundColor = 'red'
        hasAnError = true
      } else if (costRows[i].innerHTML === 'null') {
        buttons[i].style.backgroundColor = 'yellow'
        hasAnError = true
      } else {
        buttons[i].style.backgroundColor = 'blue'
      }
    }
    return hasAnError
  }

  let loadCostData = () => {
    let costRows = document.getElementsByClassName('gc-cost-column')
    for (let i = 0; i < costRows.length; i++) {
      costRows[i].innerHTML = costs[i]
    }
  }

  useEffect(() => {
    checkForErrors()
  }, [costs])

  useEffect(() => {
    loadCostData()
    checkForErrors()
  }, [props.show])

  return (
    <>
      <Alert show={closeAlert} variant="danger" id="close-gc-alert">
        <Alert.Heading>Warning!</Alert.Heading>
        <p>Your data will be lost if you choose to proceed.</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setCloseAlert(false)
              modalHide()
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            id="remove-row-proceed"
            onClick={() => {
              setCloseAlert(false)
              props.onHide()
              prevState.length == 0 ? setCount(1) : setCount(prevCount)
              prevState.length == 0 ? setCosts(['null']) : setCosts(prevCosts)
              prevState.length == 0 ? setPhaseRows(phaseArray) : setPhaseRows(prevState)
              modalHide()
            }}
            variant="primary"
          >
            Continue
          </Button>
        </div>
      </Alert>
      <Modal
        {...props}
        style={{ filter: `brightness(${brightness}%)` }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        backdrop="static"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter" style={{ textAlign: 'center' }}>
            General Contractor Fee Schedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={4}>
              <h4 className="gc-fee-profile">
                {props.image !== 'None' ? (
                  <img src={props.image} alt="Profile" />
                ) : (
                  <img src={require('../../../../Images/stock_profile_icon.png')} alt="Profile" />
                )}
              </h4>
            </Col>
            <Col sm={4}>
              <h6>{name}</h6>
            </Col>
            <Col sm={4}>
              <h4 style={{ textAlign: 'center' }}>Total Owed: ${getTotalCost()}</h4>
            </Col>
          </Row>
          <hr />

          <div id="batch-import-table-div">
            <Table responsive bordered hover striped id="batch-import-table">
              <thead>
                <tr>
                  <th>({count}) Phases</th>
                  <th colSpan="3">
                    <Button
                      variant="light"
                      borderless
                      style={{ float: 'right' }}
                      id="batch-import-add-row"
                      onClick={addRow}
                    >
                      + Add Phase
                    </Button>
                    <Button
                      variant="danger"
                      borderless
                      style={{ float: 'right' }}
                      id="batch-import-add-row"
                      onClick={removeRow}
                    >
                      + Remove Phase
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>{phaseRows}</tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <p id="gc-syntax-error"></p>
          <Button
            variant="danger"
            onClick={() => {
              modalOpen()
              setCloseAlert(true)
            }}
          >
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <PhaseCostInput
        show={showCostInput}
        updateTable={handleUpdate}
        onHide={() => {
          setShowCostInput(false)
          modalHide()
        }}
      />
    </>
  )
}

export default GCFees
