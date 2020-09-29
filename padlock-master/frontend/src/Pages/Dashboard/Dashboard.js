import React, { useState, useEffect, useContext } from 'react'
import '../../App.css'
import Wallet from './Wallet/Wallet'
import Network from './Network/Network'
import ProjectBoard from './Projects/ProjectBoard/ProjectBoard'
import TaskPage from './Projects/TaskBoard/TaskPage'
import FrequentlyAskedQuestions from './FrequentlyAskedQuestions'
import Profile from './Profile.js'
import { useApi, useUser } from '../../api/hook'
import { AppBar, Tabs, Tab } from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import { AuthContext } from '../../Components/Auth'
import Loading from 'react-loading'
import LandingPageNavigationbar from '../LandingPage/LandingPageNavigationbar'
import mixpanel from '../../api/mixpanel'
import RequestPage from './Requests/RequestPage'

function Dashboard(props) {
  const { match, location, history } = props
  const { params } = match
  const { page, projectid } = params
  const api = useApi()
  const user = useUser()
  const { ready } = useContext(AuthContext)

  let { ethers } = useContext(AuthContext)
  let [image, setImage] = useState({})
  let [address, setAddress] = useState('')

  let getUserId = async (eth) => {
    if (eth !== null) {
      let id = await ethers.getSigner().getAddress()
      return id
    }
    return ''
  }

  let getUserImage = async (id) => {
    try {
      if (!api) return
      if (id !== '') {
        let photo = await api.getProfilePhoto(id)
        setImage(photo)
        setAddress(id)
      }
    } catch (e) {
      setImage('None')
    }
  }
  let role
  if (user !== null) {
    role = user.role
  }

  let projectTabView = ''
  let task = location.search.substr(6)

  const nameToIndex = {
    0: 'wallet',
    1: 'projects',
    2: 'requests',
    3: 'network',
  }

  const indexToName = {
    wallet: 0,
    projects: 1,
    requests: 2,
    network: 3,
  }

  const refreshProjectData = async () => {
    let projects = await api.getMyProjects()
    await appendPhoto(projects[projects.length - 1])
    setProjectData(projects)
  }

  const [selectedTab, setSelectedTab] = useState(indexToName[page])
  const [modalShow, setModalShow] = useState(false)
  const [profileModalShow, setProfileModalShow] = useState(false)
  const [projectData, setProjectData] = useState('')
  const [projectPhotos, setProjectPhotos] = useState([])
  const [registeredUser, setRegisteredUser] = useState(null)
  const [userNetwork, setUserNetwork] = useState([])
  const [scList, setSCList] = useState([])
  const [ownerList, setOwnerList] = useState([])
  const [authComplete, setAuthComplete] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [imageUpload, setImageUpload] = useState(false)

  const handleChange = (event, newValue) => {
    mixpanel.track('dashboard_tab_switch', { tab: nameToIndex[newValue] })
    history.push(`/dashboard/${nameToIndex[newValue]}`)
    setSelectedTab(newValue)
  }

  const fetchProjectPhotos = async (data) => {
    let photoArray = []
    for (let i = 0; i < data.length; i++) {
      try {
        let projectAddress = data[i].deployed
        let photo = await api.getProjectPhoto(projectAddress)
        photoArray.push(photo)
      } catch (e) {
        photoArray.push('None')
      }
    }
    setProjectPhotos(photoArray)
    setDataLoaded(true)
  }

  const appendPhoto = async (data) => {
    let projectAddress = data.deployed
    try {
      let photo = await api.getProjectPhoto(projectAddress)
      setProjectPhotos((prevArray) => [...prevArray, photo])
    } catch (e) {
      setProjectPhotos((prevArray) => [...prevArray, 'None'])
    }
  }

  const getNetwork = async () => {
    let network
    try {
      network = await api.getNetwork()
      console.log('NETWORK: ', network)
    } catch (e) {
      network = 'No Network'
    }
    if (role === 'gc') {
      createSCList(network.sc)
      createOwnerList(network.owner)
    }
    return network
  }

  const createSCList = async (scs) => {
    let scObj = {}
    for (let i = 0; i < scs.length; i++) {
      try {
        scObj[scs[i].name] = [await api.getProfilePhoto(scs[i].address), scs[i].address]
      } catch (error) {
        scObj[scs[i].name] = ['None', scs[i].address]
      }
    }
    setSCList(scObj)
  }

  const createOwnerList = async (owners) => {
    let ownerObj = {}
    for (let i = 0; i < owners.length; i++) {
      try {
        ownerObj[owners[i].name] = [await api.getProfilePhoto(owners[i].address), owners[i].address]
      } catch (error) {
        ownerObj[owners[i].name] = ['None', owners[i].address]
      }
    }
    setOwnerList(ownerObj)
  }

  useEffect(() => {
    if (!user) return
    setRegisteredUser(user)
    setAuthComplete(true)
    if (!api) return
    console.log(user)
    ;(async () => {
      let projects
      try {
        projects = await api.getMyProjects()
      } catch (e) {
        setDataLoaded(true)
        projects = 'No Projects'
        setDataLoaded(true)
      }
      setProjectData(projects)
      if (projects !== 'No Projects') {
        await fetchProjectPhotos(projects)
      }
      getNetwork().then(setUserNetwork)
    })()
    mixpanel.track('dashboard_visit')
  }, [api, user])

  useEffect(() => {
    window.onpopstate = (e) => {
      let newPath = history.location.pathname.substr(11)
      if (window.location.href.indexOf('task') == -1) {
        if (newPath.indexOf('/') == -1) {
          setSelectedTab(indexToName[newPath])
        } else {
          setSelectedTab(1)
        }
      } else {
        history.push('/dashboard/projects')
      }
    }
  }, [])

  useEffect(() => {
    getUserId(ethers).then(getUserImage)
  }, [ethers])

  useEffect(() => {
    if (!address) return
    let getNewImage = async () => {
      let newImage = await api.getProfilePhoto(address)
      setImage(newImage)
    }
    getNewImage()
  }, [imageUpload])

  if (projectid !== undefined) {
    projectTabView = (
      <TaskPage
        user={user}
        image={image}
        scs={scList}
        role={role}
        projectData={projectData}
        projectId={projectid}
        taskId={task}
      />
    )
  } else {
    projectTabView = (
      <ProjectBoard
        ownerList={ownerList}
        image={image}
        role={role}
        data={projectData}
        photos={projectPhotos}
        refreshProjectData={refreshProjectData}
      />
    )
  }
  if (registeredUser !== null && ready) {
    return (
      <div>
        <AppBar position="static" style={{ backgroundColor: '#306ec5' }}>
          <div className="tab-container">
            <Tabs className="tabs-container" variant={'scrollable'} value={selectedTab} onChange={handleChange}>
              <Tab className="tab" label="Wallet" value="0" />
              <Tab className="tab" label="Projects" value="1" selected={true} />
              <Tab className="tab" label="Requests" value="2" />
              <Tab className="tab" label="Network" value="3" />
            </Tabs>
          </div>
          <div className="dashboard-nav-right-dummy">
            <div>
              <a
                className="dashboard-nav-link-dummy"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setProfileModalShow(true)
                }}
              >
                {image !== 'None' ? (
                  <img alt="Profile" className="dashboard-nav-image dashboard-profileicon" src={image} />
                ) : (
                  <img
                    alt="Profile"
                    className="dashboard-nav-image dashboard-profileicon"
                    src={require('../../Images/stock_profile_icon.png')}
                  />
                )}
              </a>
              <span className="caption-dummy">Profile</span>
            </div>

            <div>
              <a
                href="#"
                className="dashboard-nav-link-dummy"
                onClick={(e) => {
                  e.preventDefault()
                  setModalShow(true)
                }}
              >
                <img
                  alt="Help"
                  className="dashboard-nav-image dashboard-profileicon"
                  src={require('../../Images/help.png')}
                />
              </a>
              <span style={{ marginLeft: '4px' }} className="caption-dummy">
                Help
              </span>
            </div>
            <div>
              <a className="dashboard-nav-link-dummy" href="/dashboard">
                <img
                  alt="Padlock Logo"
                  className="dashboard-nav-image-dummy"
                  src={require('../../Images/padlock.png')}
                />
                <h6>PadLock</h6>
              </a>
            </div>
          </div>
        </AppBar>

        {selectedTab == 0 && <Wallet projectData={projectData} />}
        {selectedTab == 1 &&
          (dataLoaded ? (
            projectTabView
          ) : (
            <div>
              <Loading className="dashboard-data-loading" type="spin" height="200px" width="200px" color="blue" />
              <h2 id="project-loading-indicator">Loading Projects</h2>
            </div>
          ))}
        {selectedTab == 2 && <RequestPage />}
        {selectedTab == 3 && <Network role={role} network={userNetwork} />}

        <FrequentlyAskedQuestions show={modalShow} onHide={() => setModalShow(false)} />
        <Profile
          upload={setImageUpload}
          user={user}
          image={image}
          show={profileModalShow}
          onHide={() => setProfileModalShow(false)}
        />
      </div>
    )
  } else if (registeredUser === null && ready) {
    return (
      <>
        <Redirect to="/401" />
      </>
    )
  } else {
    return (
      <>
        <LandingPageNavigationbar />
        <Loading className="dashboard-loading" type="bars" height="300px" width="350px" color="blue" />
        <h1 id="auth-indicator">Authenticating...</h1>
      </>
    )
  }
}
export default Dashboard
