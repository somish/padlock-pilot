import React, { useEffect, useState } from 'react'
import { useApi } from '../../../api'
import Loading from 'react-loading'
import { Button } from 'react-bootstrap'
import ActiveRequestBody from './RequestComponents/ActiveRequestBody'
import ResolvedRequestBody from './RequestComponents/ResolvedRequestBody'
import RequestFilterModal from './RequestComponents/RequestFilterModal'
import ClearRequestFilter from '../../../Components/ClearRequestFilter'

function RequestPage() {
  let messages = require('../../../api/requests/messages.json')
  const [requests, setRequests] = useState([])
  const [resolvedUsers, setResolvedUsers] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [doneLoading, setDoneLoading] = useState(false)
  const [activeVisible, setActiveVisible] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [showClearFilter, setShowClearFilter] = useState(false)
  const [callNum, setCallNum] = useState(0)
  const [requestUpdated, setRequestUpdated] = useState(false)
  let api = useApi()

  /* When triggered this function makes all active requests visible on the Request page */
  let showActive = () => {
    document.getElementById('resolved-request-search').value = ''
    setActiveVisible(true)
  }

  /* When triggered this function makes all resolved requests visible on the Request page */
  let showResolved = () => {
    document.getElementById('active-request-search').value = ''
    setActiveVisible(false)
  }

  /* Retrieves all requests, active and resolved, that belong to a user */
  let getRequests = async () => {
    let result = await api.myRequests()
    setRequests(result)
    console.log('Requests: ', result)
    return result
  }

  /* Returns a list of users that have sent visible requests */
  let getUsers = async (result) => {
    let activeUsers = []
    let resolvedUsers = []
    for (let i = 0; i < result.active.length; i++) {
      let row = {}
      let userPhoto, userName
      let from = result.active[i].from
      if (from === 'admin') userName = 'Padlock Administrator'
      else {
        userName = await api.getUser(from)
        try {
          userPhoto = await api.getProfilePhoto(from)
        } catch (e) {
          userPhoto = 'None'
        }
      }
      row['name'] = userName.name
      row['photo'] = userPhoto
      activeUsers.push(row)
    }

    for (let i = 0; i < result.resolved.length; i++) {
      let row = {}
      let userPhoto, userName
      let from = result.resolved[i].from
      if (from === 'admin') userName = 'Padlock Administrator'
      else {
        userName = await api.getUser(from)
        try {
          userPhoto = await api.getProfilePhoto(result.resolved[i].from)
        } catch (e) {
          userPhoto = 'None'
        }
      }

      row['name'] = userName.name
      row['photo'] = userPhoto
      resolvedUsers.push(row)
    }
    setActiveUsers(activeUsers)
    setResolvedUsers(resolvedUsers)
    setDoneLoading(true)
  }

  let openArrow = (status, num) => {
    let arrow = document.getElementById('request-' + status + '-' + num)
    arrow.style.transform = 'rotate(180deg)'
  }
  let closeArrow = (status, num) => {
    let arrow = document.getElementById('request-' + status + '-' + num)
    arrow.style.transform = 'rotate(360deg)'
  }

  let resetFilter = () => {
    let rows = document.getElementsByClassName('request-container')
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = ''
    }
  }

  useEffect(() => {
    getRequests().then((result) => {
      setRequests(result)
      getUsers(result)
    })
  }, [requestUpdated])

  let searchActiveRequests = () => {
    let input, filter, requestList, statuses, txtValue
    input = document.getElementById('active-request-search')
    filter = input.value.toUpperCase()
    requestList = document.getElementsByClassName('active-request')
    statuses = document.getElementsByClassName('request-status')
    for (let i = 0; i < requestList.length; i++) {
      txtValue = statuses[i].textContent || statuses[i].innerTsext
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        requestList[i].style.display = ''
      } else {
        requestList[i].style.display = 'none'
      }
    }
  }

  let searchResolvedRequests = () => {
    let input, filter, requestList, statuses, txtValue
    input = document.getElementById('resolved-request-search')
    filter = input.value.toUpperCase()
    requestList = document.getElementsByClassName('resolved-request')
    statuses = document.getElementsByClassName('request-status')
    for (let i = 0; i < requestList.length; i++) {
      txtValue = statuses[i].textContent || statuses[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        requestList[i].style.display = ''
      } else {
        requestList[i].style.display = 'none'
      }
    }
  }

  if (doneLoading) {
    return (
      <div>
        <div id="request-page-header">
          <h4>My Requests</h4>
          <div id="request-filter-buttons">
            <Button id="request-filter-button" onClick={() => setShowFilter(true)}>
              Filter
            </Button>
            <Button id="request-reset-filter" onClick={() => setShowClearFilter(true)}>
              Reset Filter
            </Button>
          </div>
        </div>
        <div className="request-body">
          <div id="request-search-bar">
            <i className="fa fa-search"></i>
            {activeVisible ? (
              <input
                id="active-request-search"
                type="text"
                placeholder={'Search ' + requests.active.length + ' Active'}
                onKeyUp={searchActiveRequests}
              />
            ) : (
              <input
                id="resolved-request-search"
                type="text"
                placeholder={'Search ' + requests.resolved.length + ' Resolved'}
                onKeyUp={searchResolvedRequests}
              />
            )}
            {activeVisible ? (
              <Button className="request-status-toggle" onClick={showResolved}>
                View Resolved Requests
              </Button>
            ) : (
              <Button className="request-status-toggle" onClick={showActive}>
                View Active Requests
              </Button>
            )}
          </div>
          {activeVisible ? (
            <ActiveRequestBody
              requests={requests.active}
              requestUpdated={setRequestUpdated}
              users={activeUsers}
              open={openArrow}
              close={closeArrow}
            />
          ) : (
            <ResolvedRequestBody
              requests={requests.resolved}
              requestUpdated={setRequestUpdated}
              users={resolvedUsers}
              open={openArrow}
              close={closeArrow}
            />
          )}
        </div>
        <RequestFilterModal
          activeUsers={activeUsers}
          resolvedUsers={resolvedUsers}
          show={showFilter}
          onHide={() => setShowFilter(false)}
        />
        <ClearRequestFilter show={showClearFilter} onHide={() => setShowClearFilter(false)} clear={resetFilter} />
      </div>
    )
  } else {
    return (
      <div id="request-loading-div">
        <Loading className="request-loading" height={'200px'} width={'200px'} color={'blue'} type={'spin'} />
        <h4>Loading Requests</h4>
      </div>
    )
  }
}

export default RequestPage
