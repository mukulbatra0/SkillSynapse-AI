import React from "react";
import { useNavigate,Link } from "react-router";

const Register = () => {
  const handelSubmit = (e) => {
    e.preventDefault();
  };
  const navigate = useNavigate();

  return (
    <main>
      <div className="login-container">
        <h1>Register</h1>
        <form className="login-form" onSubmit={handelSubmit}>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" placeholder="enter your username" required></input>

            </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="enter email address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="enter your password"
            />
          </div>

          <button className="button primary-button">Register</button>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  );
};

export default Register;
