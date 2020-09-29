import React, { useState, useEffect } from 'react'
import { usePadlock, useApi, useProject } from '../../../../api/hook'
import { Alert as BootstrapAlert, Button, Col, Modal, Row, Table } from 'react-bootstrap'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

function GCFeesTaskPage(props) {
  const [paymentAlert, setPaymentAlert] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [phaseSelected, setPhaseSelected] = useState('')
  const [paymentSucces, setPaymentSuccess] = useState(false)
  const [paymentFailure, setPaymentFailure] = useState(false)
  const modalOpen = () => setBrightness(50)
  const modalHide = () => setBrightness(100)
  let api = useApi()

  let releaseEscrow = async () => {
    try {
      debugger
      let tx = await props.project.releaseFeeEscrow(phaseSelected)
      let receipt = await tx.wait()
      let phase = receipt.events[1].args._phase
      let value = await props.project.feeByPhase(phase.toNumber())
      await api.releaseFeeEscrow(props.project.address, value[0].toNumber())
      setPaymentSuccess(true)
      props.paymentUpdate(true)
    } catch (e) {
      setPaymentFailure(true)
    }
  }

  let triggerAlert = () => {
    modalOpen()
    setPaymentAlert(true)
  }

  let handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setPaymentFailure(false)
    setPaymentSuccess(false)
  }

  let calculateInitialPayment = () => {
    let payment = 0
    for (let i = 0; i < props.phaseData.length; i++) {
      if (props.phaseData[i].paid) {
        payment += props.phaseData[i].cost
      }
    }
    return payment
  }

  let calculateTotalCost = () => {
    let cost = 0
    for (let i = 0; i < props.phaseData.length; i++) {
      cost += props.phaseData[i].cost
    }
    return cost
  }

  let createTable = () => {
    let data = []
    for (let i = 0; i < props.phaseData.length; i++) {
      let paid = props.phaseData[i].paid
      let color
      if (props.user.role === 'gc' || props.user.role === 'admin' || (props.user.role === 'owner' && !props.funded)) {
        color = paid ? '#00FFFF' : 'grey'
      } else {
        color = paid ? '#00FFFF' : 'yellow'
      }
      let status = paid ? 'Paid!' : 'Pay Now!'

      data.push(
        <>
          <tr>
            <td className="phase-col">Phase #{i + 1}</td>
            <td className="cost-col">Completion Fee: ${props.phaseData[i].cost}</td>
            {(props.user.role === 'owner' && !props.funded) || props.user.role !== 'owner' ? (
              <td className="pay-col-gcadmin" style={{ backgroundColor: color }}>
                {status}
              </td>
            ) : (
              <td
                className={paid ? 'pay-col-owner-paid' : 'pay-col-owner-unpaid'}
                style={{ backgroundColor: color }}
                onClick={
                  paid
                    ? null
                    : () => {
                        triggerAlert()
                        setPhaseSelected(i)
                      }
                }
              >
                {status}
              </td>
            )}
          </tr>
        </>
      )
    }
    return data
  }

  return (
    <>
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        style={{ filter: `brightness(${brightness}%)` }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" style={{ textAlign: 'center' }}>
            General Contractor Fee Schedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={4}>
              <h4 className="gc-fee-profile">
                {props.image !== 'None' ? (
                  <img src={props.gc[1]} alt="Profile" />
                ) : (
                  <img src={require('../../../../Images/stock_profile_icon.png')} alt="Profile" />
                )}
              </h4>
              <h6 id="batch__import__gc__name">{props.user.role === 'gc' ? props.user.name : props.gc[0]}</h6>
            </Col>
            <Col sm={4}>
              <div id="batch__import__header__center">
                <h4>${calculateInitialPayment()} Paid</h4>
                <div id="batch__import__cost__line"></div>
                <h4>${calculateTotalCost()} Owed</h4>
              </div>
            </Col>
            <Col sm={4}>
              <div id="batch__import__header__right">
                <div>
                  <div style={{ backgroundColor: props.funded ? 'lightgreen' : 'lightcoral' }}></div>
                  <h5>{props.funded ? 'Funded!' : 'Not Funded!'}</h5>
                </div>
              </div>
            </Col>
          </Row>
          <hr />
          <div id="batch-import-table-div">
            <Table responsive bordered hover striped id="batch-import-table">
              <thead>
                <tr>
                  <th>({props.phaseData.length}) Phases</th>
                </tr>
              </thead>
              <tbody>{createTable()}</tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
      <BootstrapAlert show={paymentAlert} variant="info" className="payment-alert">
        <BootstrapAlert.Heading>Notice</BootstrapAlert.Heading>
        <p>Would you like to release custody of this fund to {props.gc[0]}?</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setPaymentAlert(false)
              modalHide()
            }}
            variant="secondary"
            className="escrow-cancel"
          >
            No
          </Button>
          <Button
            onClick={() => {
              setPaymentAlert(false)
              modalHide()
              releaseEscrow()
            }}
            className="escrow-proceed"
            variant="success"
          >
            Yes
          </Button>
        </div>
      </BootstrapAlert>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={paymentSucces}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Payment Successful!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={paymentFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Payment Failed!
        </Alert>
      </Snackbar>
    </>
  )
}
export default GCFeesTaskPage
