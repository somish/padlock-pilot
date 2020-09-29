import React from 'react'
import Request from '../Request'

function ActiveRequestBody(props) {
  console.log(props.requests)
  let messages = require('../../../../api/requests/messages.json')

  /* Create an array of active requests to be displayed in DOM */
  let createActiveRequestArray = () => {
    let activeArray = []
    if (props.requests === undefined) return
    for (let i = 0; i < props.requests.length; i++) {
      let reqType = props.requests[i].reqType
      let message = messages[reqType]
      activeArray.push(
        <Request
          type="active"
          from={props.requests[i].from}
          requestId={props.requests[i]._id}
          requestUpdated={props.requestUpdated}
          relatedProject={props.requests[i].project}
          relatedTask={props.requests[i].task}
          name={props.users[i].name}
          image={props.users[i].photo}
          reqType={reqType}
          message={message}
          requestNum={i}
          openRequest={props.open}
          closeRequest={props.close}
        />
      )
    }
    return activeArray
  }

  return <>{createActiveRequestArray()}</>
}
export default ActiveRequestBody
