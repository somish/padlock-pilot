import React, { useContext, useRef, useState } from 'react'
import { Alert, Button, Modal, Spinner } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { MenuItem, Paper, Grow, Popper, MenuList, ClickAwayListener } from '@material-ui/core'
import { AuthContext } from './Auth'
import { useUser } from '../api'

function LoginButton({ open }) {
  return (
    <Button className="login-button" onClick={open}>
      <img className="padLogo1" src={require('../Images/clipart-key-large-1.png')} alt="Padlock logo" />| Login
    </Button>
  )
}

function LoginForm({ close, visible }) {
  let history = useHistory()
  let { error, loading, login } = useContext(AuthContext)
  let emailEl = useRef(null)

  let handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    const email = emailEl.current.value.trim()
    await login(email)
    window.location = '/dashboard/projects'
  }

  return (
    <Modal show={visible} onHide={close}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>Log In</Modal.Header>
        {error && <Alert variant="danger">{error.message}</Alert>}
        <Modal.Body>
          <label>
            Email:
            <input type="text" ref={emailEl} />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <input type="submit" value="Login via Email" disabled={loading} />
        </Modal.Footer>
      </form>
    </Modal>
  )
}

function Logout() {
  let { logout } = useContext(AuthContext)
  const history = useHistory()

  return (
    <>
      <Button onClick={logout}>Log out</Button>
    </>
  )
}

export default function Login() {
  let { ready, logout } = useContext(AuthContext)
  let user = useUser()
  let anchorRef = useRef(null)
  let [modalVisible, setModalVisible] = useState(false)
  let [menuOpen, setMenuOpen] = useState(false)

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setMenuOpen(false)
  }

  const handleToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen)
  }

  if (!ready) return <Spinner animation="border" variant="primary" />

  if (user) {
    return (
      <>
        <Button
          className="logged-in-button"
          ref={anchorRef}
          aria-controls={menuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          Logged in as {user.name}
        </Button>
        <Popper className="logged-in-popper" open={menuOpen} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: 'left top' }}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={menuOpen} id="menu-list-grow">
                    <MenuItem onClick={() => (window.location = '/dashboard/projects')}>Go To Dashboard</MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    )
  }

  return (
    <>
      <LoginButton open={() => setModalVisible(true)} />
      <LoginForm close={() => setModalVisible(false)} visible={modalVisible} />
    </>
  )
}
