import React from 'react';
import { useState,useEffect } from 'react';
import Navbar from './Components/Navbar';

function App() {
  const[name,setName]=useState("");
  const[to,setTo]=useState("To");

const addName =()=>{
  setName("To: Par patingin ng prompt mo!");
  setTo("aray ko!");
};




  return (
    <div className="App" style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      <Navbar name={name}></Navbar>
      <h1>{name ?name:"From: Par patingin nga ng code mo!"}</h1>
      <button onClick={addName} style={{fontSize:"25px",fontWeight:"700px",width:"150px",height:"40px",marginLeft:"20px"}}>{to}</button>
    </div>
  );
}

export default App;
