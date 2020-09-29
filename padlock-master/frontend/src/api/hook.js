import { useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { AuthContext } from '../Components/Auth'
import mapValues from 'lodash/mapValues'
import * as api from './methods'
import { ethers as Ethers } from 'ethers'
import { PadlockABI, ProjectABI } from './abi'

export function useApi() {
  let { ethers } = useContext(AuthContext)
  let sign = async (message) => await ethers.getSigner().signMessage(message)
  let obj = useMemo(() => mapValues(api, (fn) => fn.bind(null, sign)), [ethers])
  if (!ethers) return null
  return obj
}

export function useUser() {
  let { user } = useContext(AuthContext)
  return user
}

export function usePadlock() {
  return useContract(PadlockABI, process.env.REACT_APP_PADLOCK)
}

export function useProject(address) {
  return useContract(ProjectABI, address)
}

function useContract(abi, address) {
  let { ethers } = useContext(AuthContext)
  let signer = ethers.getSigner()
  if (!abi || !address || !ethers) return null
  return new Ethers.Contract(address, abi, signer)
}

// https://usehooks.com/useAsync
export let useAsync = (asyncFunction, immediate = true) => {
  let [pending, setPending] = useState(false)
  let [value, setValue] = useState(null)
  let [error, setError] = useState(null)

  let execute = useCallback(() => {
    setPending(true)
    setValue(null)
    setError(null)
    return asyncFunction()
      .then((response) => setValue(response))
      .catch((error) => setError(error))
      .finally(() => setPending(false))
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, pending, value, error }
}
