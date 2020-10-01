import React from 'react';
import { useEffect } from 'react';
import './App.css';

function App() {
  const localVideoRef = React.createRef()
  const remoteVideoRef = React.createRef()
  let textref,pc
  
  useEffect(() => {
    const pc_config = null
    pc = new RTCPeerConnection(pc_config)
    pc.onicecandidate = (e)=>{
      if (e.candidate){
        console.log(JSON.stringify(e.candidate))
      }
    }

    pc.oniceconnectionstatechange= (e) => {
      console.log(e)
    }

    pc.onaddstream = (e)=>{
      remoteVideoRef.current.srcObject = e.stream
    }

    const constrains ={'video':true}
    const succes = (stream) =>{
      window.localStream = stream
      localVideoRef.current.srcObject=stream
      pc.addStream(stream)

    }
    const failure = (e) =>{
      console.log("get UserMedia error: ", e)
    }
    navigator.mediaDevices.getUserMedia(constrains)
    .then(succes)
    .catch(failure)
  },);
  
    const createOffer =()=>{
      console.log('offer')
      pc.createOffer({offerToReciveVideo:1})
        .then(sdp=>{
          console.log(JSON.stringify(sdp))
          pc.setLocalDescription(sdp)
        },e=>{})
    }
    const createAnswer =()=>{
      console.log('Answer')
      pc.createAnswer({offerToReciveVideo:1})
        .then(sdp=>{
          console.log(JSON.stringify(sdp))
          pc.setLocalDescription(sdp)
        },e=>{})
    }
    const setRemoteDescription =()=>{
      const dest = JSON.parse(textref.value)
      pc.setRemoteDescription(new RTCSessionDescription(dest))
    }
    const addCandidate=()=>{
      const candidate = JSON.parse(textref.value)
      console.log('adding candidate: ',candidate)
      pc.addIceCandidate(new RTCIceCandidate(candidate))
    }


  
  return (
    <div className="App">
      <video 
      ref={localVideoRef} autoPlay
      style={{
        height:300,
        width:300,
        backgroundColor:'black',
        margin:5,
      }}
      ></video>
      <video 
      ref={remoteVideoRef} autoPlay
      style={{
        height:300,
        width:300,
        backgroundColor:'black',
        margin:5,
      }}
      ></video>

      <button onClick={createOffer}>Offer</button>
      <button onClick={createAnswer}>Answer</button>
      <textarea ref={ref=>textref=ref} cols="30" rows="10"></textarea>
      <button onClick={setRemoteDescription}>setRemoteDescription</button>
      <button onClick={addCandidate}>addCandidate</button>
    </div>
  );
}

export default App;