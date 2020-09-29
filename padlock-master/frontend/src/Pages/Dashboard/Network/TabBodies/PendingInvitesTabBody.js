import React from 'react'

function PendingInvitesTabBody(props) {
  let inviteArray = []
  for (let i = props.invites.length - 1; i >= 0; i--) {
    inviteArray.push(
      <li>
        <div style={{ backgroundColor: i == 0 || i % 2 == 0 ? 'white' : '#d1d1d1' }} className="network-invitation-div">
          <p id="invite-name">{props.invites[i].name}</p>
          <p id="invite-email">{props.invites[i].email}</p>
        </div>
      </li>
    )
  }

  let searchInvites = () => {
    let input, filter, ul, li, div, i, txtValue
    input = document.getElementById('invites-search')
    filter = input.value.toUpperCase()
    ul = document.getElementById('invite-list')
    li = ul.getElementsByTagName('li')
    for (i = 0; i < li.length; i++) {
      div = li[i].getElementsByTagName('div')[0]
      txtValue = div.textContent || div.innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = ''
      } else {
        li[i].style.display = 'none'
      }
    }
  }

  return (
    <div>
      <div className="network-searchbar">
        <i className="fa fa-search"></i>
        <input id="invites-search" type="text" onKeyUp={searchInvites} placeholder="Search Invites" />
      </div>
      <hr />
      <ul id="invite-list">{inviteArray}</ul>
    </div>
  )
}
export default PendingInvitesTabBody
