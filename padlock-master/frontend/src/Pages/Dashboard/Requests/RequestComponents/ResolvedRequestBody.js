import React from 'react'
import Request from '../Request'

function ResolvedRequestBody(props) {
  let messages = require('../../../../api/requests/messages.json')

  /* Create an array of resolved requests to be displayed in DOM */
  let createResolvedRequestArray = () => {
    let resolvedArray = []
    if (props.requests === undefined) return
    for (let i = 0; i < props.requests.length; i++) {
      let reqType = props.requests[i].reqType
      let message = messages[reqType]
      resolvedArray.push(
        <Request
          type="resolved"
          from={props.requests[i].from}
          requestId={props.requests[i].id}
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
    return resolvedArray
  }

  return <>{createResolvedRequestArray()}</>
}
export default ResolvedRequestBody
