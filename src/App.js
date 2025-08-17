import React from 'react';
import { useState,useEffect } from 'react';
import Navbar from './Components/Navbar';

function App() {
const[time,setTime] = useState(new Date());
useEffect(()=>{

const timer = setInterval(()=>{
  setTime(new Date());
})


});

  return (
    <div className="App" style={{display:"flex",justifyContent:"center",alignContent:"center",height:"100vh",width:"100%",background:"green"}}>
      <div  style={{minWidth:"900px",minHeightheight:"700px",margin:"auto",display:"flex",justifyContent:"center"}}>
               <h1 style={{fontSize:"250px",fontWeight:"700px"}}>
               {time.toLocaleTimeString()}
               </h1>
      </div>
      
    </div>
  );
}

export default App;
