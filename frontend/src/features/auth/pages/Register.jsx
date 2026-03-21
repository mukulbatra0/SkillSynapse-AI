import {useState} from "react";
import { useNavigate,Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loading from "../../../components/Loading";
import "../auth.form.scss"; // added for styling

const Register = () => {
  const navigate = useNavigate();
  const {loading , handleRegister} = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handelSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({username , email ,password})
    navigate("/")
  };
  

  if(loading){
    return <Loading message="Creating your account..." fullScreen={true} />
  }

  return (
    <main>
      <div className="login-container register-container">
        <div className="brand-logo">SkillSynapse<span>AI</span></div>
        <h1>Register</h1>
        <form className="login-form" onSubmit={handelSubmit}>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input onChange = {(e)=>{setUsername(e.target.value)}}type="text" id="username" name="username" placeholder="enter your username" required></input>

            </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange = {(e)=>{setEmail(e.target.value)}}
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
              onChange = {(e)=>{setPassword(e.target.value)}}
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
