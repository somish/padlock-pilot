import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReactLoading from 'react-loading'
import '../../App.css'
import LandingPageNavigationbar from '../LandingPage/LandingPageNavigationbar'
import RegisterUser from './RegisterUser'
import Unauthorized from './Unauthorized'
import { getInvite } from '../../api/methods'

function RegistrationPage() {
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userInviter, setUserInviter] = useState('')
  const [isNotValid, setIsNotValid] = useState(false)
  let page = ''
  let query = new URLSearchParams(useLocation().search)
  const token = query.get('token')

  useEffect(() => {
    ;(async () => {
      try {
        const invite = await getInvite(token)
        setUserName(invite.name)
        setUserEmail(invite.email)
        setUserRole(invite.role)
        setUserInviter(invite.inviter)
      } catch (e) {
        setIsNotValid(true)
      }
    })()
  }, [token])

  if (isNotValid === true) {
    page = <Unauthorized />
  } else if (userName !== '') {
    page = <RegisterUser name={userName} email={userEmail} inviter={userInviter} role={userRole} inviteId={token} />
  } else {
    page = <ReactLoading width={'200px'} height={'200px'} type={'spin'} color={'#306EC5'} className={'login-loader'} />
  }

  return <div>{page}</div>
}
export default RegistrationPage
