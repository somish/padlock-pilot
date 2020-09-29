import React, { useEffect, useState } from 'react'
import ProjectCardTopRow from './ProjectCardTopRow'
import ProjectCardBottomRow from './ProjectCardBottomRow'
import { Link } from 'react-router-dom'
import { useApi } from '../../../../api'

function ProjectCard(props) {
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  let api = useApi()

  /* Get a list of active requests related to projects */
  let getProjectRequests = async () => {
    let projectRequests = await api.getRequestByProject(props.data.deployed)
    setRequests(projectRequests)
    return projectRequests
  }

  /* Get a list of users that are involved in active requests */
  let getUsers = async (requests) => {
    let userArray = []
    for (let i = 0; i < requests.length; i++) {
      let name, photo
      if (requests[i].from === 'admin') {
        name = 'Administrator'
        photo = require('../../../../Images/padlock.png')
      } else {
        name = (await api.getUser(requests[i].from)).name
        try {
          photo = await api.getProfilePhoto(requests[i].from)
        } catch (e) {
          photo = 'None'
        }
      }
      userArray.push({ name, photo })
    }
    setUsers(userArray)
  }

  useEffect(() => {
    getProjectRequests().then((requests) => getUsers(requests))
  }, [])

  return (
    <div className="project-card">
      <ProjectCardTopRow
        name={props.data.title}
        address={props.data.address}
        photo={props.photo}
        requests={requests}
        user={users}
        projectAddress={props.data.deployed}
      />
      <ProjectCardBottomRow statistics={props.data.statistics} />
      <div className="task-view-link">
        <Link to={`/dashboard/projects/${props.data.deployed}`} onClick={props.action}>
          View Tasks
        </Link>
      </div>
    </div>
  )
}

export default ProjectCard
