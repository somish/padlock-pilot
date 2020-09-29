import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useApi } from '../api'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

function SubcontractorSearchBar(props) {
  const api = useApi()
  const [subcontractorSelected, setSubcontractorSelected] = useState('')
  const [inviting, setInviting] = useState(false)
  let [inviteSuccess, setInviteSuccess] = useState(false)
  let [inviteFailure, setInviteFailure] = useState(false)
  const [scName, setSCName] = useState('None')
  let action
  if (props.selectedRow !== undefined) {
    action = props.assingSc
  }

  let taskModalSCAssignment = async () => {
    try {
      setInviting(true)
      let tx = await props.project.inviteSubcontractor(props.index, props.scList[scName][1])
      let receipt = await tx.wait()
      await api.inviteSubcontractor(props.id, props.scList[scName][1])
      props.onHide()
      setInviting(false)
      setInviteSuccess(true)
    } catch (e) {
      setInviteFailure(true)
    }
  }

  let selectSC = (name) => {
    let subcontractor = [
      <>
        <div className="selected-user">
          {props.scList[name][0] !== 'None' ? (
            <img src={props.scList[name][0]} alt="Profile" />
          ) : (
            <img src={require('../Images/stock_profile_icon.png')} alt="Profile" />
          )}
          <p>{name}</p>
        </div>
      </>,
    ]
    setSubcontractorSelected(subcontractor)
    setSCName(name)
  }

  let createSCArray = () => {
    let scArray = []
    for (let sc in props.scList) {
      scArray.push(
        <>
          <div className="user-select-option" onClick={() => selectSC(sc)}>
            {props.scList[sc][0] !== 'None' ? (
              <img src={props.scList[sc][0]} alt="Profile" />
            ) : (
              <img src={require('../Images/stock_profile_icon.png')} alt="Profile" />
            )}
            <p className="sc-name">{sc}</p>
          </div>
        </>
      )
    }
    return scArray
  }

  let searchSCs = () => {
    let input, filter, individuals, name, txtValue
    input = document.getElementById('sc-component-search')
    filter = input.value.toUpperCase()
    individuals = document.getElementsByClassName('user-select-option')
    name = document.getElementsByClassName('sc-name')
    for (let i = 0; i < individuals.length; i++) {
      txtValue = name[i].textContent || name[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        individuals[i].style.display = ''
      } else {
        individuals[i].style.display = 'none'
      }
    }
  }

  let removeSC = (num) => {
    let scs = document.getElementsByClassName('batch-import-sc')
    scs[num].innerText = 'null'
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setInviteFailure(false)
    setInviteSuccess(false)
  }

  return (
    <div>
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Subcontractors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subcontractor-search-bar">
            <div>
              <i className="fa fa-search"></i>
              <input id="sc-component-search" type="text" onKeyUp={searchSCs} placeholder="Search Subcontractors" />
            </div>
          </div>
          <div className="user-search-body">{createSCArray()}</div>
          <div className="selected-container">
            <p className="user-selected">Subcontractor Selected: </p>
            {subcontractorSelected}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            Close
          </Button>
          {!props.isTaskModal ? (
            <Button
              variant="danger"
              onClick={() => {
                props.onHide()
                removeSC(props.selectedRow)
              }}
            >
              Deselect
            </Button>
          ) : null}
          <Button
            onClick={
              props.isTaskModal
                ? () => taskModalSCAssignment()
                : () => {
                    props.onHide()
                    action(scName)
                  }
            }
          >
            {!inviting ? (props.isTaskModal ? 'Invite' : 'Select') : '...'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={inviteSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Invitation Sent!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={inviteFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Invitation Failed To Send!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default SubcontractorSearchBar
