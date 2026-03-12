import React, { useState } from 'react'
import "../auth.form.scss"
import { Link,useNavigate } from 'react-router'
import {useAuth} from "../hooks/useAuth"

const Login = () => {
  const navigate = useNavigate()

  const [email , setEmail ] = useState("")
  const [password, setPassword] = useState("")
  const {loading , handleLogin} = useAuth()


  const handelSubmit = async(e) => {
    e.preventDefault()
    await handleLogin({email , password})
    navigate("/")
  }

  

  if(loading){
    return(<main>Loading........</main>)
  }


  return (
    <main>
      <div className="login-container">
        <h1>Login</h1>
        <form className="login-form" onSubmit={handelSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
          onChange={(e) => {setEmail(e.target.value)}}
          type="email" id="email" name="email" required placeholder='enter email address'/>
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input 
          onChange={(e)=>{setPassword(e.target.value)}}
          type="password" id="password" name="password" required placeholder='enter your password'/>
        </div>

        <button className='button primary-button'>Login</button>


        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>


    </main>
  )
}

export default Login
