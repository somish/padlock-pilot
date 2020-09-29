import React, { useState, useRef, useEffect } from 'react'
import { useApi, useProject } from '../../../../api/hook'
import { utils } from 'ethers'
import Modal from 'react-bootstrap/Modal'
import { Button, Row, Col, Table, Form, Tooltip, Overlay, Alert } from 'react-bootstrap'
import $ from 'jquery'
import SubcontractorSearchBar from '../../../../Components/SubcontractorSearchBar'
import { parseCSV, checkSyntax } from '../../../../lib/syntax'
import mixpanel from '../../../../api/mixpanel'
import { Snackbar } from '@material-ui/core'
import { Alert as UploadAlert } from '@material-ui/lab'

function BatchImport(props) {
  const [showSCModal, setShowSCModal] = useState(false)
  const target = useRef(null)
  const [showToolTip, setShowToolTip] = useState(false)
  const [showRemoveAlert, setShowRemoveAlert] = useState(false)
  const [showCloseAlert, setShowCloseAlert] = useState(false)
  const [showSyntaxErrorAlert, setShowSynxtaxErrorAlert] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadFailure, setUploadFailure] = useState(false)
  const [taskUploadNumber, setTaskUploadNumber] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [selectedRow, setSelectedRow] = useState(-1)
  let zero = '0x0000000000000000000000000000000000000000'
  let fr = new FileReader()
  let api = useApi()
  let project = useProject(props.projectId)

  $('#csv').on('change', (event) => {
    let file = event.target.files[0]
    if (file !== undefined) {
      fr.onload = () => {
        let res = parseCSV(fr.result)
        convertJSONToRows(res)
        displayErrors(checkSyntax(res, props.maxPhase, props.scList))
      }
      fr.readAsBinaryString(file)
    }
  })

  let handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setUploadFailure(false)
    setUploadSuccess(false)
  }

  let generateEmptyCSV = () => {
    const rows = [
      ['Title', 'Phase', 'Cost', 'Description', 'Subcontractor'],
      ['null', 'null', 'null', 'null', 'null'],
      ['null', 'null', 'null', 'null', 'null'],
      ['null', 'null', 'null', 'null', 'null'],
      ['null', 'null', 'null', 'null', 'null'],
      ['null', 'null', 'null', 'null', 'null'],
    ]
    let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    let encodedURI = encodeURI(csvContent)
    let link = document.createElement('a')
    link.setAttribute('href', encodedURI)
    link.setAttribute('download', 'Blank CSV.csv')
    document.body.appendChild(link)
    link.click()
  }

  let generatePopulatedCSV = () => {
    const rows = [
      ['Title', 'Phase', 'Cost', 'Description', 'Subcontractor'],
      ['Take out rotten floor', '2', '10000', 'Floor is rotten', 'Jimi Hendrix'],
      ['Place roof tiles', '5', '15000', 'Tiles in need of replacement', 'Johnathan Krier'],
      ['Move sink', '1', '500', 'Get rid of sink', 'None'],
      ['Replace pipes', '3', '8000', 'Pipes have a leak', 'Subcontractor 3'],
      ['Place bricks', '2', '450', 'Bricks need to be placed', 'Duke Morrison'],
    ]
    let csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    let encodedURI = encodeURI(csvContent)
    let link = document.createElement('a')
    link.setAttribute('href', encodedURI)
    link.setAttribute('download', 'Template CSV.csv')
    document.body.appendChild(link)
    link.click()
  }

  let createInitialRow = () => {
    let taskArray = [
      <tr className="batch-import-table-row">
        <td className="batch-import-title" contentEditable="true">
          null
        </td>
        <td className="batch-import-phase">
          <select className="phase-select" name="phase" id={'phase-1'}>
            {createPhaseSelectBox()}
          </select>
        </td>
        <td className="batch-import-cost" contentEditable="true">
          null
        </td>
        <td className="batch-import-comment" contentEditable="true">
          null
        </td>
        <td className="batch-import-sc">
          <span>null</span>
        </td>
        <td>
          <Button
            variant="primary"
            className="batch__import__add__sc"
            onClick={() => {
              modalOpen()
              setShowSCModal(true)
              setSelectedRow(0)
            }}
          >
            Assign SC
          </Button>
        </td>
      </tr>,
    ]
    return taskArray
  }

  let createInitialErrors = () => {
    let initialError = []
    initialError.push(
      <>
        <p className="error" style={{ color: 'red' }}>
          Error: (Column: "title", Row: 0):No title provided
        </p>
        <p className="error" style={{ color: 'red' }}>
          Error: (Column: "cost", Row: 0):No cost provided
        </p>
        <p className="error" style={{ color: '#c79304' }}>
          Warning: (Column: "description", Row: 0):Task description not provided
        </p>
        <p className="error" style={{ color: 'red' }}>
          Error: (Column: "subcontractor", Row: 0):No vendor in your network with this name
        </p>
      </>
    )
    return initialError
  }

  let createPhaseSelectBox = (phase) => {
    let optionsArray = []
    if (phase > props.maxPhase) {
      optionsArray.push(
        <option selected="selected" value="null">
          null
        </option>
      )
    }
    for (let i = 0; i < props.maxPhase; i++) {
      if (!(phase > props.maxPhase) && phase == i + 1) {
        optionsArray.push(
          <option selected="selected" value={i + 1}>
            {i + 1}
          </option>
        )
      } else {
        optionsArray.push(<option value={i + 1}>{i + 1}</option>)
      }
    }
    return optionsArray
  }

  const [errors, setErrors] = useState(createInitialErrors)
  const [importTasks, setImportTasks] = useState([])

  const modalOpen = () => setBrightness(50)
  const modalHide = () => setBrightness(100)

  let addRow = () => {
    let newTask = []
    let lengthOfRows = document.getElementsByClassName('batch-import-table-row').length
    newTask.push(
      <tr className="batch-import-table-row">
        <td className="batch-import-title" contentEditable="true">
          null
        </td>
        <td className="batch-import-phase">
          <select className="phase-select" name="phase" id={'phase-' + lengthOfRows}>
            {createPhaseSelectBox()}
          </select>
        </td>
        <td className="batch-import-cost" contentEditable="true">
          null
        </td>
        <td className="batch-import-comment" contentEditable="true">
          null
        </td>
        <td className="batch-import-sc">
          <span>null</span>
        </td>
        <td>
          <Button
            variant="primary"
            className="batch__import__add__sc"
            onClick={() => {
              modalOpen()
              setShowSCModal(true)
              setSelectedRow(lengthOfRows)
            }}
          >
            Assign SC
          </Button>
        </td>
      </tr>
    )
    if (importTasks.length == 0) {
      setErrors(createInitialErrors)
    }
    setImportTasks((prevTasks) => [...prevTasks, newTask])
  }

  let removeRow = () => {
    setImportTasks(importTasks.filter((_, i) => i !== importTasks.length - 1))
  }

  let convertJSONToRows = (res) => {
    setImportTasks([])
    let importedTasks = []
    for (let i = 0; i < res.length; i++) {
      console.log('SCList: ', props.scList)
      console.log('Response: ', res[i].Subcontractor)
      if (res[i].Subcontractor !== 'null') {
        console.log('See if this works: ', props.scList[res[i].Subcontractor])
      }
      importedTasks.push(
        <tr className="batch-import-table-row">
          <td className="batch-import-title" contentEditable="true">
            {res[i].Title}
          </td>
          <td className="batch-import-phase">
            <select className="phase-select" name="phase" id={'phase-' + i}>
              {console.log('Phase in convert rows: ', parseInt(res[i].Phase))}
              {createPhaseSelectBox(parseInt(res[i].Phase))}
            </select>
          </td>
          <td className="batch-import-cost" contentEditable="true">
            {res[i].Cost}
          </td>
          <td className="batch-import-comment" contentEditable="true">
            {res[i].Comment}
          </td>
          <td className="batch-import-sc">
            {props.scList[res[i].Subcontractor] && res[i].Subcontractor !== 'null' ? (
              props.scList[res[i].Subcontractor] && props.scList[res[i].Subcontractor][0] !== 'None' ? (
                <img className="batch-import-sc-image" src={props.scList[res[i].Subcontractor][0]} alt="Profile" />
              ) : (
                <img
                  className="batch-import-sc-image"
                  src={require('../../../../Images/stock_profile_icon.png')}
                  alt="Profile"
                />
              )
            ) : (
              ''
            )}
            {
              <span style={{ marginLeft: '20px' }}>
                {res[i].Subcontractor in props.scList || res[i].Subcontractor === 'null'
                  ? res[i].Subcontractor
                  : 'Invalid'}
              </span>
            }
          </td>
          <td>
            <Button
              variant="primary"
              className="batch__import__add__sc"
              onClick={() => {
                modalOpen()
                setShowSCModal(true)
                setSelectedRow(i)
              }}
            >
              Assign SC
            </Button>
          </td>
        </tr>
      )
    }
    console.log('FLAG: ', importedTasks)
    setImportTasks(importedTasks)
  }

  let displayErrors = (errors) => {
    let errorArray = []
    for (let i = 0; i < errors.length; i++) {
      if (errors[i].error === true) {
        errorArray.push(
          <>
            <p className="error" style={{ color: 'red' }}>
              Error: (Column: "{errors[i].col}", Row: {errors[i].at}):
              {errors[i].msg}
            </p>
          </>
        )
      } else {
        errorArray.push(
          <>
            <p className="error" style={{ color: '#c79304' }}>
              Warning: (Column: "{errors[i].col}", Row: {errors[i].at}):
              {errors[i].msg}
            </p>
          </>
        )
      }
    }
    setErrors(errorArray)
  }

  let recheckSyntax = () => {
    let tableData = []

    let titles = document.getElementsByClassName('batch-import-title')
    let phases = document.getElementsByClassName('phase-select')
    let costs = document.getElementsByClassName('batch-import-cost')
    let comments = document.getElementsByClassName('batch-import-comment')
    let scs = document.getElementsByClassName('batch-import-sc')

    for (let i = 0; i < titles.length; i++) {
      let row = {}
      row['Title'] = titles[i].innerText
      row['Phase'] = phases[i].value
      row['Cost'] = costs[i].innerText
      row['Comments'] = comments[i].innerText
      row['Subcontractor'] = scs[i].innerText
      tableData.push(row)
    }
    console.log(tableData)
    displayErrors(checkSyntax(tableData, props.maxPhase, props.scList))
  }

  let assignSC = (subcontractor) => {
    let rows = document.getElementsByClassName('batch-import-table-row')
    let scColumn = rows[selectedRow].getElementsByTagName('td')[4]
    let image
    if (props.scList[subcontractor][0] !== 'None') {
      image = '<img class="batch-import-sc-image" src="' + props.scList[subcontractor][0] + '" alt="Profile" />'
    } else {
      image =
        '<img class="batch-import-sc-image" src="' +
        require('../../../../Images/stock_profile_icon.png') +
        '" alt="Profile" />'
    }
    let name = '<span style="margin-left: 20px">' + subcontractor + '</span>'
    scColumn.innerHTML = image + name
  }

  let handleSubmit = async () => {
    debugger
    let err = document.getElementsByClassName('error')
    let errorFound
    for (let i = 0; i < err.length; i++) {
      if (err[i].innerHTML.indexOf('Error') != -1) {
        errorFound = err[i].innerHTML.indexOf('Error') != -1
        setShowSynxtaxErrorAlert(true)
        modalOpen()
        break
      }
    }
    if (!errorFound) {
      try {
        let taskData = makeData()
        for (let i = 0; i < taskData.length; i++) {
          setTaskUploadNumber(i + 1)
          await createTask(taskData[i])
        }
        setErrors(createInitialErrors)
        setImportTasks(createInitialRow)
        mixpanel.track('batch_new_task')
        setUploadSuccess(true)
        props.addTasks(true)
        setTaskUploadNumber(0)
        props.onHide()
      } catch (e) {
        console.log(e.message)
        setUploadFailure(true)
        setTaskUploadNumber(0)
        props.onHide()
      }
    }
  }

  /**
   * Query html for batch import
   */
  let makeData = () => {
    let data = []
    let titles = document.getElementsByClassName('batch-import-title')
    let phases = document.getElementsByClassName('phase-select')
    let costs = document.getElementsByClassName('batch-import-cost')
    let comments = document.getElementsByClassName('batch-import-comment')
    let scs = document.getElementsByClassName('batch-import-sc')
    for (let i = 0; i < importTasks.length; i++) {
      let user = props.scList[scs[i].innerText]
      let sc = user ? user[1] : null
      data.push({
        title: titles[i].innerText,
        phase: phases[i].value,
        cost: costs[i].innerText,
        description: comments[i].innerText,
        sc,
      })
    }
    return data
  }

  let hash = (str) => utils.keccak256(utils.formatBytes32String(str))

  /**
   * Modify chaincode and backend to append task
   * @param {object} task task object as created and put in makeData array
   *   - requires have title, phase, cost
   *   - accepts description, sc
   */
  let createTask = async (task) => {
    debugger
    let addr = task.sc ? task.sc : zero
    let title = hash(task.title)
    console.log('flag')
    let tx = await project.createTask(title, task.cost, addr)
    let receipt = await tx.wait()
    let index = receipt.events[0].args._index.toNumber()
    let payload = {
      project: props.projectId,
      title: task.title,
      cost: task.cost,
      phase: task.phase,
      index,
    }
    if (task.sc) payload.sc = addr
    let id = await api.postTask(payload)
    if (task.description) {
      let docPayload = {
        title: 'Initial Description',
        task: id,
        file: task.description,
        type: 'text/plain',
        extension: 'txt',
        description: task.description,
      }
      await api.postDocument(id, docPayload)
      project.addDocument(index, hash(docPayload.title), hash(docPayload.file))
    }
  }

  useEffect(() => {
    setImportTasks(createInitialRow())
  }, [props.maxPhase])

  return (
    <div>
      <Modal
        {...props}
        style={{ filter: `brightness(${brightness}%)` }}
        aria-labelledby="contained-modal-title-vcenter"
        dialogClassName="batch-import-modal"
        centered
      >
        <Modal.Header>
          <Modal.Title style={{ marginLeft: '25%' }}>Batch Import Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <div id="batch-import-table-div">
                <Table responsive striped id="batch-import-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Phase (Max: {props.maxPhase})</th>
                      <th>Cost</th>
                      <th>Description</th>
                      <th>Subcontractor</th>
                      <th>Assign</th>
                    </tr>
                  </thead>
                  <tbody>{importTasks}</tbody>
                </Table>
              </div>
            </Col>
            <Col md={3}>
              <div class="syntax">
                <h6 style={{ color: 'black', textAlign: 'center' }}>Errors</h6>
                {errors}
              </div>
              <br />
              <Button
                variant="warning"
                style={{ borderRadius: '15px', marginLeft: '25%', marginBottom: '5%' }}
                onClick={() => recheckSyntax()}
              >
                Recheck Task Errors
              </Button>
              <Form id="batch-import-form">
                <Form.Group>
                  <label>
                    File Upload (CSV Only. No Commas.){' '}
                    <img
                      ref={target}
                      onMouseOver={() => setShowToolTip(true)}
                      onMouseOut={() => setShowToolTip(false)}
                      id="csv-help-image"
                      src={require('../../../../Images/question.png')}
                      alt="Help"
                    />
                  </label>
                  <input type="file" id="csv" name="csv" accept=".csv" />
                </Form.Group>
              </Form>
              <br />
              <label>Download:</label>
              <div id="download-csv-div">
                <Button onClick={generateEmptyCSV}>Template CSV</Button>
                <Button id="csv-templates-download" onClick={generatePopulatedCSV}>
                  Example CSV
                </Button>
              </div>
              <br />
            </Col>
          </Row>
          <Button
            variant="danger"
            id="batch-import-remove-row"
            onClick={() => {
              setShowRemoveAlert(true)
              modalOpen()
            }}
          >
            Remove Row
          </Button>
          <Button variant="primary" id="batch-import-add-row" onClick={addRow}>
            Add Row
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={
              taskUploadNumber == 0
                ? () => {
                    setShowCloseAlert(true)
                    modalOpen()
                  }
                : null
            }
          >
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {taskUploadNumber == 0 ? 'Submit' : `Creating task ${taskUploadNumber} of ${importTasks.length}`}
          </Button>
        </Modal.Footer>
      </Modal>
      <SubcontractorSearchBar
        assingSc={assignSC}
        scList={props.scList}
        selectedRow={selectedRow}
        show={showSCModal}
        onHide={() => {
          setShowSCModal(false)
          modalHide()
        }}
      />
      <Overlay target={target.current} show={showToolTip} onExit={() => setShowToolTip(false)} placement="bottom">
        {(props) => (
          <Tooltip
            onMouseOver={() => setShowToolTip(true)}
            onMouseOut={() => setShowToolTip(false)}
            id="overlay-example"
            {...props}
          >
            Struggling to convert Excel (.xslx/ .xls) files to .csv? , visit{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://support.geekseller.com/knowledgebase/microsoft-excel-convert-xls-xlsx-file-csv-format/"
            >
              this link
            </a>{' '}
            to learn how!
          </Tooltip>
        )}
      </Overlay>

      <Alert show={showRemoveAlert} variant="warning" id="remove-row-alert">
        <Alert.Heading>Warning!</Alert.Heading>
        <p>
          If you choose to remove a row then you will lose any data you may have entered. This action cannot be
          reversed.
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setShowRemoveAlert(false)
              modalHide()
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            id="remove-row-proceed"
            onClick={() => {
              setShowRemoveAlert(false)
              removeRow()
              modalHide()
            }}
            variant="primary"
          >
            Continue
          </Button>
        </div>
      </Alert>

      <Alert show={showCloseAlert} variant="danger" id="close-import-alert">
        <Alert.Heading>Warning!</Alert.Heading>
        <p>Your data will be lost if you choose to proceed.</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setShowCloseAlert(false)
              modalHide()
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            id="remove-row-proceed"
            onClick={() => {
              setShowCloseAlert(false)
              props.onHide()
              modalHide()
              setImportTasks(createInitialRow)
              setErrors(createInitialErrors)
            }}
            variant="primary"
          >
            Continue
          </Button>
        </div>
      </Alert>
      <Alert show={showSyntaxErrorAlert} variant="danger" id="syntax-alert">
        <Alert.Heading>Warning!</Alert.Heading>
        <p>File contains errors. Resolve before submitting</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={() => {
              setShowSynxtaxErrorAlert(false)
              modalHide()
            }}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </Alert>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <UploadAlert onClose={handleClose} severity="success">
          Upload Successful!
        </UploadAlert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={uploadFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <UploadAlert onClose={handleClose} severity="error">
          Upload Failed!
        </UploadAlert>
      </Snackbar>
    </div>
  )
}

export default BatchImport
