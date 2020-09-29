import React from 'react'
import ProjectCard from './ProjectCard.js'
import ProjectModal from './ProjectModal'
import { Container, Col, Row } from 'react-bootstrap'

function ProjectBoard(props) {
  /* Represents the visibility of the "New Project" modal */
  const [modalShow, setModalShow] = React.useState(false)

  /* Convert list of projects into project cards */
  let createProjectArray = () => {
    var projects = []
    if (props.data !== undefined && props.photos.length != 0) {
      let projectLength = props.data.length
      for (let i = projectLength - 1; i >= 0; i--) {
        projects.push(
          <Col className="project-column" md={6}>
            <ProjectCard data={props.data[i]} photo={props.photos[i]} action={props.action} />
          </Col>
        )
      }
    } else {
      projects.push(<h1 id="no-projects">No Projects</h1>)
    }
    return projects
  }

  /* Search through project cards by name of the project*/
  let searchProjects = () => {
    let input, filter, projects, titles, txtValue
    input = document.getElementById('projects-search')
    filter = input.value.toUpperCase()
    projects = document.getElementsByClassName('project-column')
    titles = document.getElementsByClassName('project-title')
    for (let i = 0; i < titles.length; i++) {
      let title = titles[i]
      txtValue = title.textContent || title.innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        projects[i].style.display = ''
      } else {
        projects[i].style.display = 'none'
      }
    }
  }

  return (
    <div>
      <div id="project-board-header">
        <h4>My Projects</h4>
        {props.role === 'gc' ? (
          <a
            id="new-project"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setModalShow(true)
            }}
          >
            + New Project
          </a>
        ) : null}
        <div id="project-search-div">
          <i className="fa fa-search"></i>
          <input id="projects-search" type="text" onKeyUp={searchProjects} placeholder="Search Projects" />
        </div>
      </div>
      <ProjectModal
        ownerList={props.ownerList}
        image={props.image}
        show={modalShow}
        onHide={() => setModalShow(false)}
        refreshProjectData={props.refreshProjectData}
      />
      <Container fluid>
        <Row>{createProjectArray()}</Row>
      </Container>
    </div>
  )
}

export default ProjectBoard
