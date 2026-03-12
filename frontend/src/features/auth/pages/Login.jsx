import React from 'react'
import "../auth.form.scss"
import { Link,useNavigate } from 'react-router'

const Login = () => {

  const handelSubmit = (e) => {
    e.preventDefault()
  }

  const navigate = useNavigate()


  return (
    <main>
      <div className="login-container">
        <h1>Login</h1>
        <form className="login-form" onSubmit={handelSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required placeholder='enter email address'/>
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required placeholder='enter your password'/>
        </div>

        <button className='button primary-button'>Login</button>


        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>


    </main>
  )
}

export default Login
