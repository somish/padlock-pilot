import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import useRequest from '../../../api/requests'
import mixpanel from '../../../api/mixpanel'
import ActionButtonModal from './ActionButtonModal'
let messages = require('../../../api/requests/messages.json')

function ActionButton({ requestId, requestType, requestUpdated }) {
  let [actionSucceeded, setActionSucceeded] = useState(false)
  let [actionFailed, setActionFailed] = useState(false)
  let [actionLoading, setActionLoading] = useState(false)
  let [showActionModal, setShowActionModal] = useState(false)
  let resolve = useRequest(requestId)

  let handleClick = async () => {
    try {
      setActionLoading(true)
      debugger
      await resolve(requestId)
      setActionSucceeded(true)
      requestUpdated(true)
      mixpanel.track('request_resolved_client', { type: requestType, id: requestId })
    } catch (error) {
      console.error('FAILURE @ REQUEST RESOLVE', error)
      setActionFailed(true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setActionFailed(false)
    setActionSucceeded(false)
  }

  const buttonText = actionLoading ? '...' : messages[requestType][1]

  return (
    <>
      <Button onClick={() => setShowActionModal(true)} disabled={actionLoading}>
        {buttonText}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={actionSucceeded}
        autoHideDuration={6000}
        onClose={handleToastClose}
      >
        <Alert onClose={handleToastClose} severity="success">
          {requestType}: Request Resolved!
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={actionFailed}
        autoHideDuration={6000}
        onClose={handleToastClose}
      >
        <Alert onClose={handleToastClose} severity="error">
          Could not resolve {requestType}
        </Alert>
      </Snackbar>
      <ActionButtonModal
        action={handleClick}
        perform={requestType ? messages[requestType][1] : null}
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
      />
    </>
  )
}

export default ActionButton
