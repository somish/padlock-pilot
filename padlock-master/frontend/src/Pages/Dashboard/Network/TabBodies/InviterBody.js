import React, { useEffect, useState } from 'react'
import { ListGroup } from 'react-bootstrap'
import Collapsible from 'react-collapsible'
import { useApi } from '../../../../api'
import Loading from 'react-loading'

function InviterBody(props) {
  const api = useApi()
  const [profile, setProfile] = useState('')

  let getPhotos = async () => {
    let photo
    try {
      photo = await api.getProfilePhoto(props.inviterInfo[0].address)
    } catch (error) {
      photo = 'None'
    }
    return photo
  }

  useEffect(() => {
    getPhotos().then(setProfile)
  }, [])

  return (
    <div>
      <Collapsible
        className="network-individual"
        trigger={
          <div className="network-individual-div">
            {profile !== '' ? (
              profile !== 'None' ? (
                <img className="network-owner-image" src={profile} />
              ) : (
                <img className="network-owner-image" src={require('../../../../Images/stock_profile_icon.png')} />
              )
            ) : (
              <Loading type="bubbles" height="70px" width="70px" color="blue" />
            )}
            <div className="individual-info">
              <span>{props.inviterInfo[0].name}</span>
              <br />
              <p>{props.inviterInfo[0].email}</p>
            </div>
          </div>
        }
        transitionTime={10}
        easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
        accordionPosition={100}
      ></Collapsible>
    </div>
  )
}
export default InviterBody
