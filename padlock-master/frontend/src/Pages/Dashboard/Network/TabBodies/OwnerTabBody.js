import React, { useEffect, useState } from 'react'
import Collapsible from 'react-collapsible'
import { ListGroup } from 'react-bootstrap'
import '../../../../App.css'
import { useApi } from '../../../../api'
import Loading from 'react-loading'

function OwnerTabBody(props) {
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
    if (!props.owners[num] || !props.owners[num].sharedProjects) return
    for (let i = 0; i < props.owners[num].sharedProjects.length; i++) {
      projectArray.push(
        <ListGroup variant="flush">
          <ListGroup.Item>
            <div className="individual-project-div">
              <div className="individual-project-list-name">
                <p className="individual-project-list-left">Project: {props.owners[num].sharedProjects[i]}</p>
              </div>
              <div className="individual-project-task-link-div">
                <a
                  href={`/dashboard/projects/${props.owners[num].sharedProjects[i]}`}
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

  let createOwnerArray = () => {
    let owners = []
    for (let i = 0; i < props.owners.length; i++) {
      owners.push(
        <Collapsible
          className="network-individual"
          onOpen={() => openDropdown(i)}
          onClose={() => closeDropdown(i)}
          trigger={
            <div className="network-individual-div network-owner">
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
                <span className="network-owner-name">{props.owners[i].name}</span>
                <br />
                <p>{props.owners[i].email}</p>
              </div>
              {props.owners[i].sharedProjects.length ? (
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
    return owners
  }

  let searchOwners = () => {
    let input, filter, individuals, name, txtValue
    input = document.getElementById('owner-search')
    filter = input.value.toUpperCase()
    individuals = document.getElementsByClassName('network-owner')
    name = document.getElementsByClassName('network-owner-name')
    for (let i = 0; i < individuals.length; i++) {
      txtValue = name[i].textContent || name[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        individuals[i].style.display = ''
      } else {
        individuals[i].style.display = 'none'
      }
    }
  }

  let getPhotos = async () => {
    let photos = []
    for (let i = 0; i < props.owners.length; i++) {
      try {
        let result = await api.getProfilePhoto(props.owners[i].address)
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
    <div>
      <div className="network-searchbar">
        <i className="fa fa-search"></i>
        <input id="owner-search" type="text" onKeyUp={searchOwners} placeholder="Search Owners" />
      </div>
      <hr />
      {createOwnerArray()}
    </div>
  )
}
export default OwnerTabBody
