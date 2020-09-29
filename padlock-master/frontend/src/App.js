import React from 'react'
import './App.css'
import { Route, Switch, Redirect } from 'react-router-dom'
import LandingPage from './Pages/LandingPage/LandingPageSuperComponent'
import Unauthorized from './Pages/UserRegistrationPages/Unauthorized'
import RegistrationPage from './Pages/UserRegistrationPages/RegistrationPage'
import Dashboard from './Pages/Dashboard/Dashboard'

function App() {
  return (
    <>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/register" component={RegistrationPage} />
        <Route path="/401" component={Unauthorized} />
        <Redirect exact from="/dashboard" to="dashboard/projects" />
        <Route path="/dashboard/:page/:projectid?" render={(props) => <Dashboard {...props} />} />
        <Route path="*" component={Unauthorized} />
      </Switch>
    </>
  )
}

export default App
