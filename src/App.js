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
    <div className="App" style={{display:"flex",justifyContent:"center",alignContent:"center",height:"100vh",width:"100%",background:"#181C14"}}>

      <div  style={{flexDirection:"column",borderRadius:20,padding:10,minWidth:"400px",minHeightheight:"200px",margin:"auto",display:"flex",justifyContent:"center",alignItems:"center",background:"#3C3D37"}}>
          
               <h1 style={{margin:10,fontSize:"250px",fontWeight:"700px",color:"#ECDFCC",fontFamily:"Myfont"}}>
               {time.toLocaleTimeString()}
               </h1>
      </div>
      
    </div>
  );
}

export default App;
