import React from 'react'
import { Navbar, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import LoginButton from '../../Components/LoginForm'
import { useUser } from '../../api'

function LandingPageNavigationbar(props) {
  let visible = 'hidden'
  if (props.isLandingPage === 'true') {
    visible = 'visible'
  }
  let user = useUser()
  return (
    <Navbar className="navbar">
      <Navbar.Brand href="#home">
        <Link to="/" className="navbar-logo">
          <img className="padLogo2" src={require('../../Images/padlock.png')} alt="Padlock logo" />
          <h1 id="navbar-text">PadLock</h1>
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end" style={{ visibility: visible }}>
        <Navbar.Text>
          <Row>
            <LoginButton />
          </Row>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
}
export default LandingPageNavigationbar
