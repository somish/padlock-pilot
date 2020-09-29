import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'

function OwnerSearchBar(props) {
  const [ownerSelected, setOwnerSelected] = useState('')
  const [ownerName, setOwnerName] = useState('None')

  let selectOwner = (name) => {
    let owner = [
      <>
        <div className="selected-user">
          {props.ownerList[name][0] !== 'None' ? (
            <img src={props.ownerList[name][0]} alt="Profile" />
          ) : (
            <img src={require('../Images/stock_profile_icon.png')} alt="Profile" />
          )}
          <p>{name}</p>
        </div>
      </>,
    ]
    setOwnerSelected(owner)
    setOwnerName(name)
  }

  let createOwnerArray = () => {
    let ownerArray = []
    for (let owner in props.ownerList) {
      ownerArray.push(
        <>
          <div className="user-select-option" onClick={() => selectOwner(owner)}>
            {props.ownerList[owner][0] !== 'None' ? (
              <img src={props.ownerList[owner][0]} alt="Profile" />
            ) : (
              <img src={require('../Images/stock_profile_icon.png')} alt="Profile" />
            )}
            <p className="owner-name">{owner}</p>
          </div>
        </>
      )
    }
    return ownerArray
  }

  let searchOwners = () => {
    let input, filter, individuals, name, txtValue
    input = document.getElementById('owner-component-search')
    filter = input.value.toUpperCase()
    individuals = document.getElementsByClassName('user-select-option')
    name = document.getElementsByClassName('owner-name')
    for (let i = 0; i < individuals.length; i++) {
      txtValue = name[i].textContent || name[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        individuals[i].style.display = ''
      } else {
        individuals[i].style.display = 'none'
      }
    }
  }

  return (
    <div>
      <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Owners</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subcontractor-search-bar">
            <div>
              <i className="fa fa-search"></i>
              <input id="owner-component-search" type="text" onKeyUp={searchOwners} placeholder="Search Owners" />
            </div>
          </div>
          <div className="user-search-body">{createOwnerArray()}</div>
          <div className="selected-container">
            <p className="user-selected">Owner Selected: </p>
            {ownerSelected}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            Close
          </Button>
          <Button
            onClick={() => {
              props.onHide()
              props.chooseOwner([ownerName, props.ownerList[ownerName][0], props.ownerList[ownerName][1]])
            }}
          >
            Choose Owner
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default OwnerSearchBar
