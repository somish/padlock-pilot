import React, { useState, useEffect, useContext } from 'react'
import { Button } from 'react-bootstrap'
import { Row, Col, Table } from 'react-bootstrap'
import { useApi, usePadlock } from '../../../api/hook'
import { AuthContext } from '../../../Components/Auth'
import Collapsible from 'react-collapsible'
import Loading from 'react-loading'
import WalletFilterModal from './WalletFiterModal'
import ClearRequestFilter from '../../../Components/ClearRequestFilter'

function Wallet(props) {
  let { ethers } = useContext(AuthContext)
  let padlock = usePadlock()
  let api = useApi()
  console.log('Padlock Contract Object: ', padlock)
  let [balance, setBalance] = useState(null)
  const [requests, setRequests] = useState([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showClearFilter, setShowClearFilter] = useState(false)
  const [projects, setProjects] = useState([])
  const [senderReciever, setSenderReciever] = useState([])

  let messages = require('../../../api/requests/messages.json')

  let resetFilter = () => {
    let rows = document.getElementsByClassName('network-owner')
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display = ''
    }
  }

  let totalCost = (num) => {
    let cost = 0
    for (let i = 0; i < senderReciever[num].length; i++) cost += senderReciever[num][i][2]
    return cost
  }

  let openDropdown = (num) => {
    let id = 'arrow-' + num
    let arrow = document.getElementById(id)
    arrow.style.borderTopColor = 'blue'
    arrow.style.transform = 'rotate(180deg)'
  }

  let closeDropdown = (num) => {
    let id = 'arrow-' + num
    let arrow = document.getElementById(id)
    arrow.style.borderTopColor = 'black'
    arrow.style.transform = 'rotate(360deg)'
  }

  let getProjectRequests = async () => {
    let projectRequests = []
    let rows = props.projectData
    if (!rows) return
    for (let i = 0; i < rows.length; i++) {
      debugger
      let requests = await api.getMoneyRequestByProject(rows[i].deployed)
      projectRequests.push(requests)
    }
    return projectRequests
  }

  let getSenderAndReceiver = async () => {
    if (!requests) return
    let senderRecieverArray = []
    for (let i = 0; i < requests.length; i++) {
      let subArray = []
      for (let j = 0; j < requests[i].length; j++) {
        let project = requests[i][j].to
        let to = requests[i][j].to
        let from = requests[i][j].from
        let value = requests[i][j].value
        let receiver = to === 'admin' ? 'Admin' : (await api.getUser(to)).name
        let sender = from === 'admin' ? 'Admin' : (await api.getUser(from)).name
        subArray.push([sender, receiver, value])
      }
      senderRecieverArray.push(subArray)
    }
    setSenderReciever(senderRecieverArray)
  }

  let createRequestArray = (num) => {
    let requestArray = []
    for (let i = 0; i < requests[num].length; i++) {
      let message = messages[requests[num][i].reqType]
      requestArray.push(
        <div className="wallet__page__project__collapsible__request">
          <div>{message[0]}</div>
          <div>
            <span>{senderReciever[num][i][0]}</span>
            <div>
              <p>Sent</p>
              <img className="wallet__page__transaction__arrow" src={require('../../../Images/Right Arrow.png')} />
              <p className="wallet__page__transaction__cost">${senderReciever[num][i][2]}</p>
            </div>
            <span>{senderReciever[num][i][1]}</span>
          </div>
        </div>
      )
    }
    return requestArray
  }

  let createProjectArray = async () => {
    if (!requests[0]) return
    let projectArray = []
    let rows = props.projectData
    for (let i = 0; i < rows.length; i++) {
      let metaData = await api.getProject(rows[i].deployed)
      projectArray.push(
        <div>
          <Collapsible
            className="wallet__page__project__collapsible"
            onOpen={() => openDropdown(i)}
            onClose={() => closeDropdown(i)}
            trigger={
              <>
                <div className="wallet__page__project__collapsible__trigger__left">
                  <p className="wallet__page__project__collapsible__name">{metaData.title}</p>
                  <hr />
                  <div>
                    <span>Requests: {requests[i].length}</span>
                    <span>Total Cost: ${totalCost(i)}</span>
                  </div>
                </div>
                <div id={'arrow-' + i} className="wallet__page__project__collapsible__arrow"></div>
              </>
            }
            transitionTime={10}
            easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
            accordionPosition={100}
          >
            {createRequestArray(i)}
          </Collapsible>
        </div>
      )
    }
    setProjects(projectArray)
  }

  useEffect(() => {
    getProjectRequests().then(setRequests)
  }, [props.projectData])

  useEffect(() => {
    getSenderAndReceiver()
  }, [requests])

  useEffect(() => {
    createProjectArray()
  }, [senderReciever])

  useEffect(() => {
    let t = setInterval(async () => {
      if (!padlock) return
      let address = await ethers.getSigner().getAddress()
      let bn = await padlock.balance(address)
      setBalance(bn.toNumber())
    }, 1000)
    return () => clearInterval(t)
  }, [setBalance, ethers, padlock])

  let searchRequests = () => {
    let input, filter, projects, titles, txtValue
    input = document.getElementById('wallet-request-search')
    filter = input.value.toUpperCase()
    projects = document.getElementsByClassName('wallet__page__project__collapsible')
    titles = document.getElementsByClassName('wallet__page__project__collapsible__name')
    for (let i = 0; i < titles.length; i++) {
      let title = titles[i]
      txtValue = title.textContent || title.innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        projects[i].style.display = ''
      } else {
        projects[i].style.display = 'none'
      }
    }
  }

  return (
    <div>
      <h4 style={{ marginLeft: '3%' }}>My Wallet</h4>
      <Row>
        <Col>
          <h3 id="wallet-balance">
            Available Balance: <span>${balance}</span>
          </h3>
          <div id="wallet-tab-body" style={{ marginRight: '5%', marginTop: '5%' }}>
            <div id="wallet-search-div">
              <i className="fa fa-search"></i>
              <input id="wallet-request-search" type="text" onKeyUp={searchRequests} placeholder="Search Requests" />
            </div>
            <Table bordered>
              <tr>
                <th>Recent Transactions</th>
              </tr>
              <tr>
                <td>{projects}</td>
              </tr>
            </Table>
          </div>
        </Col>
      </Row>
      <WalletFilterModal show={showFilterModal} onHide={() => setShowFilterModal(false)} />
      <ClearRequestFilter show={showClearFilter} onHide={() => setShowClearFilter(false)} clear={resetFilter} />
    </div>
  )
}

export default Wallet
