import React, { useEffect, useState } from 'react'
import TaskTable from './TaskTable'
import '../../../../App.css'
import { Row, Col, Button } from 'react-bootstrap'
import { useHistory, Link } from 'react-router-dom'
import Reset from './Reset'
import Group from './Group'
import Filter from './Filter'
import BatchImport from './BatchImport'
import GCFeesTaskPage from './GCFeesTaskPage'
import { useApi, useProject } from '../../../../api'

function TaskPage(props) {
  const api = useApi()
  const history = useHistory()
  let project = useProject(props.projectId)
  const [doneLoading, setDoneLoading] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [modalShow2, setModalShow2] = useState(false)
  const [modalShow3, setModalShow3] = useState(false)
  const [modalShow4, setModalShow4] = useState(false)
  const [modalShow5, setModalShow5] = useState(false)
  const [addingTasks, setAddingTasks] = useState(false)
  const [tasks, setTasks] = useState([])
  const [checkedBoxes, setCheckedBoxes] = useState([])
  const [gc, setGc] = useState(['None'])
  const [alerts, setAlerts] = useState({})
  const [filter, setFilter] = useState('None')
  const [funded, setFunded] = useState('')
  const [phaseData, setPhaseData] = useState([])
  const [paymentUpdated, setPaymentUpdate] = useState(false)

  useEffect(() => {
    getProjectInfo().then(getGCInfo)
    isFunded().then(setFunded)
    getData().then(setPhaseData)
  }, [paymentUpdated])

  let isFunded = async () => {
    return await project.funded()
  }

  let getTasks = (tasks) => {
    setTasks(tasks)
  }

  let getData = async () => {
    let feesLength = (await project.feesLength()).toNumber()
    let data = []
    for (let i = 0; i < feesLength; i++) {
      let cost = await project.fees(i)
      let paid = await project.paid(i)
      data.push({ cost: cost.toNumber(), paid: paid })
    }
    return data
  }

  let getProjectInfo = async () => {
    let project = await api.getProject(props.projectId)
    return project.gc
  }

  let getGCInfo = async (id) => {
    let gc = await api.getUser(id)
    let photo = await api.getProfilePhoto(id)
    setGc([gc.name, photo])
  }

  if (doneLoading === true) {
    let topCheckbox = document.getElementById('task-checkbox-top')
    let checkboxes = document.getElementsByClassName('task-table-checkbox')
    topCheckbox.style.display = 'block'
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].style.display = 'block'
    }
  }

  let getActiveAlerts = (taskNum, newAlerts) => {
    let alertList = alerts
    if (!(taskNum in alerts) && newAlerts.length != 0) {
      alertList[taskNum] = newAlerts
    }
    setAlerts(alertList)
  }

  let uncheckBoxesWhenFiltered = () => {
    console.log(tasks)
    if (tasks === 'None' || tasks.length == 0) return
    setCheckedBoxes([])
    let topCheckbox = document.getElementById('task-checkbox-top')
    let checkboxes = document.getElementsByClassName('task-table-checkbox')
    topCheckbox.checked = false
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false
    }
  }

  let resetFilters = () => {
    uncheckBoxesWhenFiltered()
    setFilter('None')
    let rows = document.getElementsByClassName('inner-task-row')
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = ''
    }
  }

  let setChecks = (operation, element) => {
    console.log(checkedBoxes)
    if (operation === 'Individual Add') {
      setCheckedBoxes((prevArray) => [...prevArray, element])
    } else if (operation === 'Individual Remove') {
      setCheckedBoxes((prevState) => prevState.filter((item) => item !== element))
    } else if (operation === 'All') {
      setCheckedBoxes(element)
    }
  }

  let findProjectName = () => {
    if (!props.projectData) return
    for (let i = 0; i < props.projectData.length; i++)
      if (props.projectData[i].deployed == props.projectId) return props.projectData[i].title
  }

  let filterTypeToColNum = {
    phase: 3,
    tp_status: 4,
    alerts: 5,
    subcontractor: 10,
  }

  useEffect(() => {
    let checkForValueInMultiple = (alertType) => {
      for (let taskNum in alerts) {
        if (alerts[taskNum].indexOf(alertType) != -1) {
          return true
        }
      }
      return false
    }

    if (filter.value != 0) {
      let colNum, rows, columns
      columns = []
      colNum = filterTypeToColNum[filter.type]
      rows = document.getElementsByClassName('inner-task-row')
      if (rows !== undefined && colNum !== undefined) {
        for (let i = 0; i < rows.length; i++) {
          columns.push(rows[i].getElementsByTagName('td')[colNum].innerText)
        }
        for (let j = 0; j < columns.length; j++) {
          if (columns[j] === filter.value) {
            rows[j].style.display = ''
          } else if (columns[j] === 'Multiple' && filter.type === 'alerts') {
            if (checkForValueInMultiple(filter.value)) {
              rows[j].style.display = ''
            } else {
              rows[j].style.display = 'none'
            }
          } else {
            rows[j].style.display = 'none'
          }
        }
      }
    }
  })

  function backToHomePage() {
    history.push('/dashboard/projects')
  }

  return (
    <div>
      <h4 style={{ marginLeft: '4%' }}>{findProjectName()}</h4>
      <Col sm={12} style={{ backgroundColor: '#F5F5F5', padding: 'none' }}>
        <Row style={{ marginBottom: '2%', backgroundColor: '#F5F5F5', marginTop: '2%' }}>
          <Col sm={10}>
            <Row style={{ marginLeft: '3%' }}>
              <Col sm={2} style={{ marginBottom: '1%' }}>
                <Button
                  variant="outline-primary"
                  onClick={() => setModalShow(true)}
                  size="lg"
                  className="task-page-button"
                >
                  <img
                    className="table-option-image"
                    src={require('../../../../Images/main view.png')}
                    alt="Main View"
                  />
                  <span style={{ paddingRight: '10px' }}>Reset View </span>
                </Button>
              </Col>
              <Col sm={2} style={{ marginBottom: '1%' }}>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => setModalShow3(true)}
                  className="task-page-button"
                >
                  <img className="table-option-image" src={require('../../../../Images/filter.png')} alt="Filter" />
                  <span>Filter</span>
                </Button>
              </Col>
              <Col sm={3} style={{ marginBottom: '1%' }}>
                <Button
                  variant="outline-primary"
                  onClick={() => setModalShow2(true)}
                  size="lg"
                  className="task-page-button"
                >
                  <img className="table-option-image" src={require('../../../../Images/grouped.png')} alt="Grouped" />
                  <span>Grouped Action</span>
                </Button>
              </Col>
              <Col sm={2} style={{ marginBottom: '1%' }}>
                {props.role === 'gc' ? (
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => setModalShow4(true)}
                    className="task-page-button"
                  >
                    <span style={{ color: 'black' }}>+ </span>
                    <span>New Task</span>
                  </Button>
                ) : null}
              </Col>
              <Col sm={3}>
                {props.role !== 'sc' ? (
                  <Button
                    variant="outline-primary"
                    size="lg"
                    style={{ marginLeft: '1%' }}
                    className="task-page-button"
                    onClick={() => setModalShow5(true)}
                  >
                    <span>
                      <strong style={{ color: 'black' }}>$</strong> Fee Schedule
                    </span>
                  </Button>
                ) : null}
              </Col>
            </Row>
          </Col>
          <Col sm={2}>
            <div style={{ marginTop: '3%' }}>
              <a href="#" onClick={props.action}>
                <Link to="/dashboard/projects">Projects</Link>
              </a>
              <a active>/ Tasks</a>
            </div>
          </Col>
        </Row>
      </Col>
      <div className="task-table-background">
        <TaskTable
          addingTasks={addingTasks}
          getTasks={getTasks}
          userAddress={props.userAddress}
          doneLoading={() => setDoneLoading(true)}
          getAlerts={getActiveAlerts}
          scList={props.scs}
          role={props.role}
          projectId={props.projectId}
          taskId={props.taskId}
          checkList={checkedBoxes}
          setChecks={setChecks}
        />
      </div>
      <GCFeesTaskPage
        paymentUpdate={setPaymentUpdate}
        funded={funded}
        phaseData={phaseData}
        project={project}
        gc={gc}
        user={props.user}
        image={props.image}
        show={modalShow5}
        onHide={() => setModalShow5(false)}
      />

      <Reset resetFilter={resetFilters} show={modalShow} onHide={() => setModalShow(false)} />

      <Group
        checkedTasks={checkedBoxes}
        role={props.role}
        scList={props.scs}
        show={modalShow2}
        onHide={() => setModalShow2(false)}
      />

      <Filter
        resetChecks={uncheckBoxesWhenFiltered}
        role={props.role}
        setFilter={setFilter}
        show={modalShow3}
        onHide={() => setModalShow3(false)}
      />

      <BatchImport
        addTasks={setAddingTasks}
        projectId={props.projectId}
        maxPhase={phaseData.length}
        scList={props.scs}
        show={modalShow4}
        onHide={() => setModalShow4(false)}
      />
    </div>
  )
}
export default TaskPage
