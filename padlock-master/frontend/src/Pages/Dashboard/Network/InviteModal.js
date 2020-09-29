import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useApi } from '../../../api'
import mixpanel from '../../../api/mixpanel'

function InviteModal({ close, visible, inviteRole, addInvite }) {
  let [inviteSuccess, setInviteSuccess] = useState(false)
  let [inviteFailure, setInviteFailure] = useState(false)
  let nameEl = React.useRef(null)
  let emailEl = React.useRef(null)
  let api = useApi()
  if (!api) return null

  let handleSubmit = async (e) => {
    e.preventDefault()
    close()
    let payload = {
      name: nameEl.current.value.trim(),
      email: emailEl.current.value.trim(),
    }
    try {
      await api.invite(payload)
      setInviteSuccess(true)
      addInvite(true)
      mixpanel.track('new_invite', { role: inviteRole })
    } catch (error) {
      setInviteFailure(true)
      console.log(inviteFailure)
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setInviteFailure(false)
    setInviteSuccess(false)
  }

  return (
    <>
      <Modal show={visible} onHide={close}>
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>Invite a {inviteRole}:</Modal.Header>
          <Modal.Body>
            <label>
              Email:
              <input type="email" ref={emailEl} required />
            </label>
            <label>
              Name:
              <input type="text" ref={nameEl} required />
            </label>
          </Modal.Body>
          <Modal.Footer>
            <input type="submit" value="Invite by Email" />
          </Modal.Footer>
        </form>
      </Modal>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={inviteSuccess}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          Invitation Sent!!!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={inviteFailure}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          Invitation Failed To Send!!!
        </Alert>
      </Snackbar>
    </>
  )
}
export default InviteModal
