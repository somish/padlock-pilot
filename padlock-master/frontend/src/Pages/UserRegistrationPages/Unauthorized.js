import React from 'react'
import NavigationBar from '../LandingPage/LandingPageNavigationbar'
import LandingPageNavigationbar from '../LandingPage/LandingPageNavigationbar'

function Unauthorized() {
  return (
    <div>
      <LandingPageNavigationbar />
      <div className="unAuth1-first-body">
        <div id="unAuth-circle">
          <img src={require('../../Images/padlock.png')} alt="PadLock" />
        </div>
        <h1>401: Unauthorized!</h1>
        <br />
      </div>
    </div>
  )
}

export default Unauthorized
