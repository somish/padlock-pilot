import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import $ from 'jquery'

function Filter(props) {
  const [radio, setRadio] = useState([false, false, false, false])

  let createSCArray = () => {
    let subContractors = []
    let subContractorDisplay = []
    let rows = document.getElementsByClassName('subcontractor-name')
    if (rows !== undefined) {
      for (let i = 0; i < rows.length; i++) {
        if (subContractors.indexOf(rows[i].innerHTML) == -1) subContractors.push(rows[i].innerHTML)
      }
      for (let j = 0; j < subContractors.length; j++) {
        subContractorDisplay.push(<option value={subContractors[j]}></option>)
      }
    }
    return subContractorDisplay
  }

  // Enable select box based on what radio button is selected
  $(document).ready(() => {
    $('.filter_radio').click((event) => {
      if (event.target.id === 'radio_sub') {
        setRadioSelected(0)
        $('#subcontractor').css('visibility', 'visible')
        $('#phase').prop('disabled', true)
        $('#alerts').prop('disabled', true)
        $('#tp_status').prop('disabled', true)
      } else if (event.target.id === 'radio_phase') {
        setRadioSelected(1)
        $('#subcontractor').css('visibility', 'hidden')
        $('#phase').prop('disabled', false)
        $('#alerts').prop('disabled', true)
        $('#tp_status').prop('disabled', true)
      } else if (event.target.id === 'radio_alert') {
        setRadioSelected(2)
        $('#subcontractor').css('visibility', 'hidden')
        $('#phase').prop('disabled', true)
        $('#alerts').prop('disabled', false)
        $('#tp_status').prop('disabled', true)
      } else if (event.target.id === 'radio_status') {
        setRadioSelected(3)
        $('#subcontractor').css('visibility', 'hidden')
        $('#phase').prop('disabled', true)
        $('#alerts').prop('disabled', true)
        $('#tp_status').prop('disabled', false)
      }
    })
  })

  // Sets the state based on whatever button is selected. A selected button will correspond
  // to a "true" value in the state array
  let setRadioSelected = (num) => {
    let select = [false, false, false, false]
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
    0: 'subcontractor',
    1: 'phase',
    2: 'alerts',
    3: 'tp_status',
  }

  let radioToSelect = {}

  let setFilter = (event) => {
    event.preventDefault()
    let type, value
    type = radioToFilter[radio.indexOf(true)]
    if (type !== 'subcontractor') {
      value = document.getElementById(type).value
    } else {
      value = document.getElementById('sub').value
    }
    props.setFilter({ type: type, value: value })
    props.resetChecks()
    props.onHide()
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
                  <Row>
                    {props.role !== 'sc' ? (
                      <Col lg={5} sm={4}>
                        <Form.Check
                          type="radio"
                          label="Subcontractor"
                          className="filter_radio"
                          name="filter_type"
                          id="radio_sub"
                          required
                        />
                        <div id="subcontractor">
                          <input id="sub" list="subcontractor_list" />
                          <datalist id="subcontractor_list">{createSCArray()}</datalist>
                        </div>
                      </Col>
                    ) : null}
                    <Col lg={5} sm={3.5}>
                      <Form.Check
                        type="radio"
                        label="Phase"
                        className="filter_radio"
                        name="filter_type"
                        id="radio_phase"
                      />
                      <Form.Control as="select" className="mr-sm-2" id="phase" custom disabled>
                        <option value="0">Choose...</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </Form.Control>
                    </Col>

                    <Col lg={5} sm={3.5}>
                      <Form.Check
                        type="radio"
                        label="Alerts"
                        className="filter_radio"
                        name="filter_type"
                        id="radio_alert"
                      />
                      <Form.Control as="select" className="mr-sm-2" id="alerts" custom disabled>
                        <option value="0">Choose...</option>
                        <option value="No GC Fees">No GC Fees</option>
                        <option value="No SC Enrolled">No SC Enrolled</option>
                        <option value="Task Not Funded">Task Not Funded</option>
                        <option value="Change Order Pending">Change Order Pending</option>
                        <option value="Lien Release Pending">Lien Release Pending</option>
                        <option value="Multiple">Multiple Alerts</option>
                      </Form.Control>
                    </Col>
                    <Col lg={5} sm={3.5}>
                      <Form.Check
                        type="radio"
                        label="Status"
                        className="filter_radio"
                        name="filter_type"
                        id="radio_status"
                      />
                      <Form.Control as="select" className="mr-sm-2" id="tp_status" custom disabled>
                        <option value="0">Choose...</option>
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="complete">Complete</option>
                      </Form.Control>
                    </Col>
                  </Row>
                </Form.Row>
              </Form.Group>
            </fieldset>
            <div>
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

export default Filter
