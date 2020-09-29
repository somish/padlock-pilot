import React, { useEffect, useState, useContext } from 'react'
import { Tabs, Tab } from '@material-ui/core'
import OwnerTabBody from './TabBodies/OwnerTabBody'
import SubcontractorTabBody from './TabBodies/SubcontractorTabBody'
import PendingInvitesTabBody from './TabBodies/PendingInvitesTabBody'
import InviteModal from './InviteModal'
import AdminInviteModal from './AdminInviteModal'
import AdminTabBody from './TabBodies/AdminTabBody'
import { AuthContext } from '../../../Components/Auth.js'
import GeneralContractorTabBody from './TabBodies/GeneralContractorTabBody'
import { useApi } from '../../../api/hook'
import Loading from 'react-loading'
import InviterBody from './TabBodies/InviterBody'

function Network(props) {
  console.log(props.network)
  const api = useApi()
  const { user } = useContext(AuthContext)
  let role = ''
  if (user !== null) {
    role = user.role
  }

  const [modalShow, setModalShow] = useState(false)
  const [adminModalShow, setAdminModalShow] = useState(false)
  const [value, setValue] = useState(0)
  const [screenWidth, setScreenWidth] = useState(window.screen.width)
  const [invites, setInvites] = useState([])
  const [newInvite, setNewInvite] = useState(false)

  const roleToInviteeRole = {
    admin: 'Owner',
    owner: 'GC',
    gc: 'SC',
  }

  // TODO: Fix scrollable tabs
  let getScreenSize = () => {
    setScreenWidth(window.screen.width)
  }

  window.onresize = getScreenSize

  let initialTab = ''

  switch (props.role) {
    case 'admin':
      initialTab = 1
      break
    case 'owner':
      initialTab = 3
      break
    case 'gc':
      initialTab = 4
      break
    case 'sc':
      initialTab = 0
      break
    default:
      break
  }

  let getInviterRole = () => {
    switch (props.role) {
      case 'owner':
        return 'Admin'
        break
      case 'gc':
        return 'Owner'
        break
      case 'sc':
        return 'GC'
        break
      default:
        break
    }
  }

  let getInviterInfo = () => {
    switch (props.role) {
      case 'owner':
        return props.network.admin
        break
      case 'gc':
        return props.network.owner
        break
      case 'sc':
        return props.network.gc
      default:
        break
    }
  }

  const [selectedTab, setSelectedTab] = useState(initialTab)

  let handleChange = (event, newValue) => {
    setValue(newValue)
  }
  let handleClose = () => setModalShow(false)
  let handleShow = () => setModalShow(true)
  let handleAdminClose = () => setAdminModalShow(false)
  let handleAdminShow = () => setAdminModalShow(true)

  useEffect(() => {
    if (!api) return
    ;(async () => {
      let invitations = await api.getInvitations()
      setInvites(invitations.invitations)
    })()
  }, [api])

  useEffect(() => {
    if (!newInvite) return
    ;(async () => {
      let invitations = await api.getInvitations()
      setInvites(invitations.invitations)
    })()
  }, [newInvite])

  if (user !== null && props.network.length != 0 && props.network !== 'No Network') {
    return (
      <div>
        <div id="network-page-header">
          <h4>My Network</h4>
          <div id="network-page-top-admin">
            {props.role !== 'sc' ? (
              <a
                id="network-invite-owner-admin"
                href=""
                onClick={(e) => {
                  e.preventDefault()
                  handleShow()
                }}
              >
                Invite {roleToInviteeRole[props.role]}
              </a>
            ) : null}
            {props.role === 'admin' ? (
              <a
                id="network-invite-owner-admin"
                href=""
                onClick={(e) => {
                  e.preventDefault()
                  handleAdminShow()
                }}
              >
                Invite Administrator
              </a>
            ) : null}
          </div>
        </div>
        <InviteModal
          addInvite={setNewInvite}
          inviteRole={roleToInviteeRole[props.role]}
          visible={modalShow}
          close={handleClose}
        />
        <AdminInviteModal visible={adminModalShow} close={handleAdminClose} />
        <Tabs
          className="network-tabs"
          value={selectedTab}
          variant={512 > screenWidth ? 'scrollable' : ''}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          {props.role !== 'admin' ? <Tab label={'Inviting ' + getInviterRole()} value={0} /> : null}
          {props.role === 'admin' ? <Tab label={'Admins (' + props.network.admin.length + ')'} value={1} /> : null}
          {props.role === 'admin' ? <Tab label={'Owners (' + props.network.owner.length + ')'} value={2} /> : null}
          {props.role === 'admin' || props.role === 'owner' ? (
            <Tab label={'General Contractors (' + props.network.gc.length + ')'} value={3} />
          ) : null}
          {props.role === 'admin' || props.role === 'gc' ? (
            <Tab label={'Subcontractors (' + props.network.sc.length + ')'} value={4} />
          ) : null}
          {props.role !== 'sc' ? <Tab label={'Invites (' + invites.length + ')'} value={5} /> : null}
        </Tabs>
        <div id="network-tab-container">
          {selectedTab == 0 && <InviterBody inviterInfo={getInviterInfo()} />}
          {selectedTab == 1 && <AdminTabBody admins={props.network.admin} />}
          {selectedTab == 2 && <OwnerTabBody owners={props.network.owner} />}
          {selectedTab == 3 && <GeneralContractorTabBody gcs={props.network.gc} />}
          {selectedTab == 4 && <SubcontractorTabBody scs={props.network.sc} />}
          {selectedTab == 5 && <PendingInvitesTabBody invites={invites} />}
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <Loading id="network-loading" type="spin" color="blue" width="200px" height="200px" />
        <h4 id="role-determination">Loading Network</h4>
      </div>
    )
  }
}

export default Network
