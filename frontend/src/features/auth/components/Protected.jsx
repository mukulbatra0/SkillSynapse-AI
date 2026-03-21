import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'
import Loading from '../../../components/Loading'

const Protected = ({children}) => {

  const {loading , user} = useAuth()
  
  if(loading){
    return <Loading message="Authenticating..." fullScreen={true} />
  }

  if(!user){
    return (<Navigate to={"/register"} />)
  }
  return children
}

export default Protected
