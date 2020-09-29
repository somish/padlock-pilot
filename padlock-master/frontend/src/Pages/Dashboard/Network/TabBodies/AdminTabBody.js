import React, { useEffect, useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import Collapsible from 'react-collapsible'
import { useApi } from '../../../../api'
import Loading from 'react-loading'

function AdminTabBody(props) {
  const api = useApi()
  const [photos, setPhotos] = useState([])

  let searchAdmins = () => {
    let input, filter, individuals, name, txtValue
    input = document.getElementById('admin-search')
    filter = input.value.toUpperCase()
    individuals = document.getElementsByClassName('network-admin')
    name = document.getElementsByClassName('network-admin-name')
    for (let i = 0; i < individuals.length; i++) {
      txtValue = name[i].textContent || name[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        individuals[i].style.display = ''
      } else {
        individuals[i].style.display = 'none'
      }
    }
  }

  let creatAdminArray = () => {
    let admins = []
    for (let i = 0; i < props.admins.length; i++) {
      admins.push(
        <Collapsible
          className="network-individual"
          trigger={
            <div className="network-individual-div network-admin">
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
                <span className="network-admin-name">{props.admins[i].name}</span>
                <br />
                <p>{props.admins[i].email}</p>
              </div>
            </div>
          }
          transitionTime={10}
          easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
          accordionPosition={100}
        ></Collapsible>
      )
    }
    return admins
  }

  let getPhotos = async () => {
    let photos = []
    for (let i = 0; i < props.admins.length; i++) {
      try {
        let result = await api.getProfilePhoto(props.admins[i].address)
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
        <input id="admin-search" type="text" onKeyUp={searchAdmins} placeholder="Search Admins" />
      </div>
      <hr />
      {creatAdminArray()}
    </div>
  )
}
export default AdminTabBody
