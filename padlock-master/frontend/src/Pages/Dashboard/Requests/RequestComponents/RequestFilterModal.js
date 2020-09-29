import React, { useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import $ from 'jquery'

function RequestFilterModal(props) {
  const [radio, setRadio] = useState([false, false, false])

  $(document).ready(() => {
    $('.filter_request_radio').click((event) => {
      if (event.target.id === 'status_radio') {
        setRadioSelected(0)
        $('#status').css('visibility', 'visible')
        $('#recipient').css('visibility', 'hidden')
        $('#project').css('visibility', 'hidden')
      } else if (event.target.id === 'recipient_radio') {
        setRadioSelected(1)
        $('#status').css('visibility', 'hidden')
        $('#recipient').css('visibility', 'visible')
        $('#project').css('visibility', 'hidden')
      } else if (event.target.id === 'project_radio') {
        setRadioSelected(2)
        $('#status').css('visibility', 'hidden')
        $('#recipient').css('visibility', 'hidden')
        $('#project').css('visibility', 'visible')
      }
    })
  })

  let setRadioSelected = (num) => {
    let select = [false, false, false]
    for (let i = 0; i < select.length; i++) {
      if (i == num) {
        select[i] = true
      } else {
        select[i] = false
      }
    }
    setRadio(select)
  }

  let radioToFilter = {
    0: 'stat',
    1: 'recip',
    2: 'proj',
  }

  let setFilter = (event) => {
    event.preventDefault()
    let type, value, filterRows
    type = radioToFilter[radio.indexOf(true)]
    value = document.getElementById(type).value
    let rows = document.getElementsByClassName('request-container')
    if (value !== '') {
      if (type === 'stat') {
        filterRows = document.getElementsByClassName('request-status-variable')
      } else if (type === 'recip') {
        filterRows = document.getElementsByClassName('request-user-name')
      } else {
        filterRows = document.getElementsByClassName('request-project-name')
      }
      for (let i = 0; i < rows.length; i++) {
        if (filterRows[i].innerHTML === value) {
          rows[i].style.display = ''
        } else {
          rows[i].style.display = 'none'
        }
      }
    }
    props.onHide()
  }

  let createStatusArray = () => {
    let selectStatus = []
    let statusNames = []
    let rows = document.getElementsByClassName('request-status-variable')
    if (rows.length != 0) {
      for (let i = 0; i < rows.length; i++) {
        let name = rows[i].innerHTML
        if (statusNames.indexOf(name) == -1) {
          statusNames.push(name)
          selectStatus.push(<option value={name}></option>)
        }
      }
    }
    return selectStatus
  }

  let createUserArray = () => {
    let userList = []
    let selectUserList = []
    for (let i = 0; i < props.activeUsers.length; i++) {
      let name = props.activeUsers[i].name
      if (userList.indexOf(name) == -1) {
        userList.push(name)
        selectUserList.push(<option value={name}></option>)
      }
    }
    for (let i = 0; i < props.resolvedUsers.length; i++) {
      let name = props.resolvedUsers[i].name
      if (userList.indexOf(name) == -1) {
        userList.push(name)
        selectUserList.push(<option value={name}></option>)
      }
    }
    return selectUserList
  }

  let createProjectArray = () => {
    let selectProject = []
    let projectNames = []
    let rows = document.getElementsByClassName('request-project-name')
    if (rows.length != 0) {
      for (let i = 0; i < rows.length; i++) {
        let name = rows[i].innerHTML
        if (projectNames.indexOf(name) == -1) {
          projectNames.push(name)
          selectProject.push(<option value={name}></option>)
        }
      }
    }
    return selectProject
  }

  return (
    <Modal {...props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Filter By</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row style={{ marginLeft: '2%', marginRight: '2%' }}>
          <Form onSubmit={setFilter}>
            <fieldset>
              <Form.Group>
                <Form.Row>
                  <Row style={{ textAlign: 'center', marginLeft: 'auto' }}>
                    <Col sm={5}>
                      <Form.Check
                        type="radio"
                        label="Status"
                        className="filter_request_radio"
                        name="type_of_filter"
                        id="status_radio"
                        required
                      />
                      <div id="status">
                        <input id="stat" list="status_list" />
                        <datalist id="status_list">{createStatusArray()}</datalist>
                      </div>
                    </Col>
                    <Col sm={5}>
                      <Form.Check
                        type="radio"
                        label="Recipient"
                        className="filter_request_radio"
                        name="type_of_filter"
                        id="recipient_radio"
                        required
                      />
                      <div id="recipient">
                        <input id="recip" list="recipient_list" />
                        <datalist id="recipient_list">{createUserArray()}</datalist>
                      </div>
                    </Col>
                    <Col sm={5}>
                      <Form.Check
                        type="radio"
                        label="Project"
                        className="filter_request_radio"
                        name="type_of_filter"
                        id="project_radio"
                        required
                      />
                      <div id="project">
                        <input id="proj" list="project_list" />
                        <datalist id="project_list">{createProjectArray()}</datalist>
                      </div>
                    </Col>
                  </Row>
                </Form.Row>
              </Form.Group>
            </fieldset>
            <div id="filter-buttons">
              <Button className="filter-submit-button" variant="primary" type="submit">
                Confirm
              </Button>
              <Button className="filter-close-button" variant="secondary" onClick={props.onHide}>
                Close
              </Button>
            </div>
          </Form>
        </Row>
      </Modal.Body>
    </Modal>
  )
}
export default RequestFilterModal
