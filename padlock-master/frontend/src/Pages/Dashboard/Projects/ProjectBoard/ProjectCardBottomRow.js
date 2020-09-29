import React from 'react'
function ProjectCardBottomRow(props) {
  return (
    <div>
      <div className="project-stats">
        <div className="stat-container">
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.scs : 'N/A'}</h3>
            <img alt="Profile" className="stat-image" src={require('../../../../Images/stock_profile_icon.png')} />
            <p>Subcontractors</p>
          </div>
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.tasks : 'N/A'}</h3>
            <img alt="Clipboard" className="stat-image" src={require('../../../../Images/clipboard-8-xxl.png')} />
            <p>Tasks</p>
          </div>
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.unassigned : 'N/A'}</h3>
            <img alt="Assign Task" className="stat-image" src={require('../../../../Images/assign task.png')} />
            <p>Unassigned</p>
          </div>
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.assigned : 'N/A'}</h3>
            <img
              alt="Assigned To Yourself"
              className="stat-image"
              src={require('../../../../Images/assigned icon.png')}
            />
            <p>Assigned</p>
          </div>
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.awaiting_payment : 'N/A'}</h3>
            <img
              alt="Awaiting Payment"
              className="stat-image"
              src={require('../../../../Images/awaiting payment.png')}
            />
            <p>Awaiting Payment</p>
          </div>
          <div className="inner-stats">
            <h3>{props.statistics !== undefined ? props.statistics.paid : 'N/A'}</h3>
            <img alt="Paid" className="stat-image" src={require('../../../../Images/paid.png')} />
            <p>Paid</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCardBottomRow
