import React from 'react'
import { Col, Row } from 'react-bootstrap'
import ProjectRequestList from '../ProjectComponents/ProjectRequestList'

function ProjectCardTopRow(props) {
  return (
    <div>
      <Row>
        <Col sm={6} className="image-col">
          <p className="project-title">{props.name}</p>
          {props.photo !== 'None' ? (
            <img className="project-image" src={props.photo} alt="Construction" />
          ) : (
            <img className="project-image" src={require('../../../../Images/padlock.png')} alt="Construction" />
          )}
        </Col>
        <Col sm={6}>
          <p className="project-address">{props.address}</p>
          <div className="recent-tasks">
            <div>
              <h6>Recent Updates</h6>
              <ProjectRequestList projectAddress={props.projectAddress} user={props.user} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default ProjectCardTopRow
