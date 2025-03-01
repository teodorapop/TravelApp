import React, {useState} from "react";
import PasswordInput from "../../components/Input/PasswordInput.jsx";
import {useNavigate} from "react-router-dom";
import {validateEmail} from "../../utils/helper.js";
import axiosInstance from "../../utils/axiosInstance.js";

const LogIn = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }

    if(!password){
      setError("Please enter a password");
      return;
    }

    setError("");

    // Login API Call
    try{
      const response = await axiosInstance.post("/login", {
        email: email, password: password
        });

      // Handle successful login response
      if(response.data && response.data.accessToken){
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }
    } catch(error){
      // Handle login error
      console.log("error in login page frontend")
      if(
          error.response &&
          error.response.data &&
          error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">

      <div className="login-ui-box right-10 -top-40"/>
      <div className="login-ui-box bg-cyan-300 -bottom-40 right-1/2"/>

      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[90vh] flex items-end bg-cover bg-[70%_center] rounded-lg p-10 z-50" style={{ backgroundImage: "url('https://images.pexels.com/photos/1123767/pexels-photo-1123767.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
          <div>
            <h4 className="text-5xl text-outline text-white font-semibold leading-[58px]">Capture Your <br/>Journeys</h4>
            <p className="text-[15px] text-white text-outline leading-6 pr-7 mt-4 ">
              Record your travel experiences and memories in your personal travel journal.
            </p>
          </div>
        </div>

        <div className="w-2/4 h-[90vh] bg-white rounded-r-lg relative p-16 shadow-lg">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold mb-7">Login</h4>

            <input
                type="text"
                placeholder="Email"
                className="input-box"
                value={email}
                onChange={({target}) => {
                  setEmail(target.value);
                }}
            />

            <PasswordInput value={password}
                           onChange={({target}) => {
                             setPassword(target.value);
                           }}
            />

            {error && <p className="text-red-500 text-xs pb-1"> {error} </p>}

            <button type="submit" className="btn-primary">LOGIN</button>

            <p className="text-xs text-slate-500 text-center my-4">or</p>

            <button
                type="submit"
                className="btn-primary btn-light"
                onClick={() => {
                  navigate("/signUp");
                }}
            >CREATE ACCOUNT
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default LogIn;
