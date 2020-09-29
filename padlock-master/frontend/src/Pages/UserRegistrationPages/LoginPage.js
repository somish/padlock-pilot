import React, { useState, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import ReactLoading from 'react-loading'
import Navigationbar from '../Components/Navigationbar'
import { AuthContext } from '../Components/Auth'
import LandingPageNavigationbar from '../LandingPage/LandingPageNavigationbar'
import Fortmatic from 'fortmatic'
import Web3 from 'web3'
require('dotenv').config()

function LoginPage(props) {
  let { login } = useContext(AuthContext)
  const history = useHistory()
  const [showLoad, setShowLoad] = useState(false)

  return (
    <div>
      <LandingPageNavigationbar isLandingPage="false" />
      <div className="login-first-body">
        <h2>Registration Step 1/2: Magic Link</h2>
        <div id="lock-circle">
          <img src={require('../../Images/padlock.png')} alt="PadLock" />
        </div>
        <p>
          PadLock has invited {props.name} to join the platform as a {props.role}
        </p>
        <br />
        <p>Please sign in with Magic.Link to continue</p>
        <img id="fortmatic-logo" src={require('../../Images/fortmatic logo.png')} alt="Fortmatic" />
        <br />
        <Button
          id="fortmatic-link"
          onClick={() => {
            setShowLoad(true)
            login()
            //getAddress()
          }}
        >
          Email
        </Button>
        {showLoad ? <ReactLoading id="loading-bar" type={'bars'} color={'#306EC5'} /> : null}
      </div>
    </div>
  )
}
export default LoginPage
