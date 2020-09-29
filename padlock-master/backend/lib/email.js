require('dotenv').config()
let sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_SECRET)

/**
 * Send an invitation email out
 * @param {*} email the email address to deliver the invitation to
 * @param {*} inviter the name of the inviting entity
 * @param {*} invited the name of the invited entity
 * @param {*} role the role the invited entity will be assigned
 * @param {*} id the CouchDB id of the invitation document
 */
function SendInvitation(email, inviter, invited, role, id) {
  console.log(email)
  let msg = {
    to: email,
    from: 'jack@blox.consulting',
    subject: `Hi ${invited}, ${inviter} has invited you to Padlock as a ${role}!`,
    html: `<h2><a href="${process.env.SENDGRID_BASE}${id}">
             Follow this link to complete your registration!
            </a></h2>`,
  }
  sendgrid.send(msg).catch((err) => {
    console.log(err)
  })
}

module.exports = SendInvitation
