import React, { useEffect, useState } from 'react'
import Collapsible from 'react-collapsible'
import { ListGroup } from 'react-bootstrap'
import Loading from 'react-loading'
import { useApi } from '../../../../api'

function GeneralContractorTabBody(props) {
  const api = useApi()
  const [photos, setPhotos] = useState([])

  let openDropdown = (num) => {
    let id = 'arrow-' + num
    let arrow = document.getElementById(id)
    arrow.style.borderTopColor = 'blue'
    arrow.style.transform = 'rotate(90deg)'
    arrow.style.marginTop = '5px'
  }

  let closeDropdown = (num) => {
    let id = 'arrow-' + num
    let arrow = document.getElementById(id)
    arrow.style.borderTopColor = 'black'
    arrow.style.transform = 'rotate(360deg)'
    arrow.style.marginTop = '5px'
  }

  let createProjectArray = (num) => {
    let projectArray = []
    if (!props.gcs[num] || !props.gcs[num].sharedProjects) return
    for (let i = 0; i < props.gcs[num].sharedProjects.length; i++) {
      projectArray.push(
        <ListGroup variant="flush">
          <ListGroup.Item>
            <div className="individual-project-div">
              <div className="individual-project-list-name">
                <p className="individual-project-list-left">Project: {props.gcs[num].sharedProjects[i]}</p>
              </div>
              <div className="individual-project-task-link-div">
                <a
                  href={`/dashboard/projects/${props.gcs[num].sharedProjects[i]}`}
                  className="individual-project-task-link"
                >
                  View Tasks
                </a>
              </div>
            </div>
          </ListGroup.Item>
        </ListGroup>
      )
    }
    return projectArray
  }

  let searchGCs = () => {
    let input, filter, individuals, name, txtValue
    input = document.getElementById('gc-search')
    filter = input.value.toUpperCase()
    individuals = document.getElementsByClassName('network-gc')
    name = document.getElementsByClassName('network-gc-name')
    for (let i = 0; i < individuals.length; i++) {
      txtValue = name[i].textContent || name[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        individuals[i].style.display = ''
      } else {
        individuals[i].style.display = 'none'
      }
    }
  }

  let createGCArray = () => {
    let gcs = []
    for (let i = 0; i < props.gcs.length; i++) {
      gcs.push(
        <Collapsible
          className="network-individual"
          onOpen={() => openDropdown(i)}
          onClose={() => closeDropdown(i)}
          trigger={
            <div className="network-individual-div network-gc">
              {photos.length !== 0 ? (
                photos[i] !== 'None' ? (
                  <img className="network-owner-image" src={photos[i]} />
                ) : (
                  <img className="network-owner-image" src={require('../../../../Images/stock_profile_icon.png')} />
                )
              ) : (
                <Loading type="bubbles" height="70px" width="70px" color="blue" />
              )}
              <div className="individual-info">
                <span className="network-gc-name">{props.gcs[i].name}</span>
                <br />
                <p>{props.gcs[i].email}</p>
              </div>
              {props.gcs[i].sharedProjects.length ? (
                <div className="network-individual-div-right">
                  <h3>Projects</h3>
                  <div className="network-dropdown-arrow" id={'arrow-' + i}></div>
                </div>
              ) : null}
            </div>
          }
          transitionTime={10}
          easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
          accordionPosition={100}
        >
          {createProjectArray(i)}
        </Collapsible>
      )
    }
    return gcs
  }

  let getPhotos = async () => {
    let photos = []
    for (let i = 0; i < props.gcs.length; i++) {
      try {
        let result = await api.getProfilePhoto(props.gcs[i].address)
        photos.push(result)
      } catch (error) {
        photos.push('None')
      }
    }
    return photos
  }

  useEffect(() => {
    getPhotos().then(setPhotos)
  }, [])

  return (
    <div className="network-scroll-container">
      <div className="network-searchbar">
        <i className="fa fa-search"></i>
        <input id="gc-search" type="text" onKeyUp={searchGCs} placeholder="Search GCs" />
      </div>
      <hr />
      {createGCArray()}
    </div>
  )
}
export default GeneralContractorTabBody
