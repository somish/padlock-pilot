import { Magic } from 'magic-sdk'
import React, { useState, useEffect } from 'react'
import { ethers as Ethers } from 'ethers'
import { useHistory } from 'react-router-dom'
import { sleep } from '../utils'
import * as api from '../api/methods'
import mixpanel from '../api/mixpanel'

const DEFAULT_AUTH_CONTEXT = {
  user: null,
  loading: null,
  error: null,
  ethers: null,
  login: null,
  logout: null,
  ready: null,
}
export let AuthContext = React.createContext(DEFAULT_AUTH_CONTEXT)

let magic = new Magic(process.env.REACT_APP_MAGIC_API, { network: 'rinkeby' })
let magicPreloadPromise = null

export default function AuthContextProvider({ children }) {
  let [m, setM] = useState(null)
  let [ready, setReady] = useState(false)
  let [ethers, setEthers] = useState(null)
  let [user, setUser] = useState(null) // { address, name, role, email }
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState(false)
  let [magicOK, setMagicOK] = useState(false)

  // immediately load up the Magic Link SDK
  if (!magicPreloadPromise) magicPreloadPromise = magic.preload()
  if (!m) {
    setM(magic)
  }
  // on first load, attempt to restore session
  useEffect(() => {
    ;(async () => {
      try {
        await refreshUser()
      } catch (e) {
        console.error('first load refreshUser', e)
      } finally {
        setReady(true)
      }
    })()
  }, [])

  async function refreshUser() {
    let loggedIn = await magic.user.isLoggedIn()
    setMagicOK(true)
    if (!loggedIn) {
      setUser(null)
      return
    }

    // initialize ethers.js
    let eth = new Ethers.providers.Web3Provider(magic.rpcProvider)
    let signer = eth.getSigner()
    let sign = async (message) => await signer.signMessage(message)
    console.log('signer.getAddress()', await signer.getAddress())

    setEthers(eth)
    try {
      const u = await api.me(sign)
      setUser(u)

      mixpanel.identify(await signer.getAddress())
    } catch (err) {
      if (err.code === 404) {
        // magic link success but they're not in the database
        await logout()
        window.location = '/401'
      }
    }
  }

  async function register(payload) {
    if (!payload) {
      throw new Error('No info provided to AuthContext.register()')
    }

    let { name, email, phone, inviteId } = payload

    setLoading(true)
    setError(false)

    // don't continue until Magic SDK is done preloading
    await magicPreloadPromise

    // kick off the login process
    await magic.auth.loginWithMagicLink({ email })

    // sleep because there appears to be a race condition in the Magic SDK
    await sleep(1000)

    // sanity check
    if (!(await magic.user.isLoggedIn())) {
      throw new Error('Not logged in after login with magic link')
    }
    //@todo call API to create new user in db
    let eth = new Ethers.providers.Web3Provider(magic.rpcProvider)
    let sign = async (message) => await eth.getSigner().signMessage(message)

    const u = await api.register(sign, payload)
    await refreshUser()
    window.location = '/dashboard'
  }

  async function login(email) {
    try {
      mixpanel.track('login_start')

      if (!email) {
        throw new Error('No email address provided to AuthContext.login()')
      }
      email = email.trim()

      setLoading(true)
      setError(false)

      // don't continue until Magic SDK is done preloading
      await magicPreloadPromise

      // kick off the login process
      await magic.auth.loginWithMagicLink({ email })

      // sleep because there appears to be a race condition in the Magic SDK
      await sleep(1000)

      // sanity check
      if (!(await magic.user.isLoggedIn())) {
        throw new Error('Not logged in after login with magic link')
      }

      await refreshUser()

      mixpanel.track('login_success')
      window.location = '/dashboard'
    } catch (e) {
      mixpanel.track('login_error')
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setEthers(null)
    setUser(null)
    setLoading(null)
    setError(null)
    setMagicOK(null)
    setM(null)
    await magic.user.logout()
    // TODO: reset state
    // TODO: call magic sdk logout

    mixpanel.track('logout')
  }

  const ctx = { m, user, loading, error, ethers, register, login, logout, ready }
  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>
}
