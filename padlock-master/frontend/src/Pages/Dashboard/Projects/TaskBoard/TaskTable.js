import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import '../../../../App.css'
import TaskRow from './TaskRow'
import { useApi, useProject } from '../../../../api/hook'
import Loading from 'react-loading'

function TaskTable(props) {
  const [doneLoading, setDoneLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [statuses, setStatuses] = useState([])
  const api = useApi()
  const projectID = props.projectId
  const project = useProject(projectID)
  let taskRows = []

  let numToStatus = {
    0: 'Inactive',
    1: 'Active',
    2: 'Pending',
    3: 'Complete',
  }

  let toggleAllBoxes = () => {
    let checkedCheckboxes = []
    let topChecked = document.getElementById('task-checkbox-top').checked
    let checkboxes = document.getElementsByClassName('task-table-checkbox')
    let rows = document.getElementsByClassName('inner-task-row')
    for (let i = 0; i < checkboxes.length; i++) {
      let style = window.getComputedStyle(rows[i])
      let display = style.getPropertyValue('display')
      if (topChecked != checkboxes[i].checked) {
        checkboxes[i].checked = topChecked
      }
      if (topChecked === true && display !== 'none') {
        checkedCheckboxes.push(i + 1)
      }
    }
    if (checkedCheckboxes.length == 0) {
      props.setChecks('All', [])
    } else {
      props.setChecks('All', checkedCheckboxes)
    }
  }

  let handleSelection = (checked, taskNum) => {
    if (checked === true) {
      props.setChecks('Individual Add', taskNum)
    } else {
      props.setChecks('Individual Remove', taskNum)
    }
  }

  useEffect(async () => {
    if (!api) return
    let tasks = await api.getProjectTasks(props.projectId)
    tasks.type === 'cors' ? setTasks('None') : setTasks(tasks)
    setDoneLoading(true)
  }, [api, projectID])

  useEffect(() => {
    let refreshTasks = async () => {
      if (!props.addingTasks) return
      let tasks = await api.getProjectTasks(props.projectId)
      setTasks(tasks)
    }
    refreshTasks()
  }, [props.addingTasks])

  if (tasks.length > 0) {
    for (let i = 0; i < tasks.length; i++) {
      taskRows.push(
        <TaskRow
          userAddress={props.userAddress}
          doneLoading={props.doneLoading}
          selection={handleSelection}
          role={props.role}
          scList={props.scList}
          task={tasks[i]}
          project={project}
          projectId={props.projectId}
        />
      )
    }
  }
  if (tasks.rows !== undefined) {
    setTimeout(() => {
      setDoneLoading(true)
    }, 100 * tasks.rows.length)
  }

  if (doneLoading && tasks !== 'None') {
    return (
      <div>
        <Table striped hover className="task-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '15%' }}>
                {' '}
                <input type="checkbox" id="task-checkbox-top" onClick={toggleAllBoxes} />
              </th>
              <th style={{ textAlign: 'left', width: '7%' }}>
                <span className="task-total-span" style={{ fontSize: '12px' }}>
                  Count: {tasks !== undefined ? tasks.length : ''}
                </span>
              </th>
              <th style={{ textAlign: 'center' }}>Name</th>
              <th style={{ textAlign: 'center' }}>Phase</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th className="alert-cell">Alerts</th>
              <th style={{ textAlign: 'center' }}>Cost</th>
              <th style={{ textAlign: 'center' }}>Notes</th>
              <th style={{ textAlign: 'center' }}>Photos</th>
              <th style={{ textAlign: 'center' }}>Documents</th>
              <th style={{ textAlign: 'center' }}>Subcontractor</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th className="task-total"></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>{taskRows}</tbody>
          <tfoot>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      </div>
    )
  } else if (doneLoading) {
    return <h1 id="no-tasks">No Tasks</h1>
  } else {
    return (
      <>
        <Loading id="task-page-loading" type="spin" height="100px" width="100px" color="blue" />
        <h1 id="task-indicator">Loading Tasks</h1>
      </>
    )
  }
}
export default TaskTable
