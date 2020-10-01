import React from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client'
import './App.css';

function App() {
  const localVideoRef = React.createRef()
  const remoteVideoRef = React.createRef()
  let textref,pc,socket
  let candidates=[]
  
  useEffect(() => {

    socket=io(
      '/webrtcPeer',
      {
        path:'/webRTC',
        query:{}
      }
    )
    socket.on('connection-success',success=>{
      console.log(success)
    })

    socket.on('offerOrAnswer',(sdp)=>{
      textref.value = JSON.stringify(sdp)
      pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })
    socket.on('candidate',(candidate)=>{
      pc.addIceCandidate(new RTCIceCandidate(candidate))
      // candidates.push(candidate)
    })


    // const pc_config = null
    const pc_config = {
      "iceServers":[
        {
          urls:'stun:stun.l.google.com:19302',
        }
    ]
    }
    pc = new RTCPeerConnection(pc_config)
    pc.onicecandidate = (e)=>{
      if (e.candidate){
        sendToPeer('candidate',e.candidate)
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

  const sendToPeer =(messageType, payload)=>{
    socket.emit(messageType,{
      socketID:socket.id,
      payload,
    })
  }
  
    const createOffer =()=>{
      console.log('offer')
      pc.createOffer({offerToReciveVideo:1})
        .then(sdp=>{
          pc.setLocalDescription(sdp)
          sendToPeer('offerOrAnswer',sdp)
        },e=>{})
    }
    const createAnswer =()=>{
      console.log('Answer')
      pc.createAnswer({offerToReciveVideo:1})
        .then(sdp=>{
          pc.setLocalDescription(sdp)
          sendToPeer('offerOrAnswer',sdp)
        },e=>{})
    }
    // const setRemoteDescription =()=>{
    //   const dest = JSON.parse(textref.value)
    //   pc.setRemoteDescription(new RTCSessionDescription(dest))
    // }
    // const addCandidate=()=>{
    //   // const candidate = JSON.parse(textref.value)
    //   // console.log('adding candidate: ',candidate)
    //   // pc.addIceCandidate(new RTCIceCandidate(candidate))
    //   candidates.forEach(candidate=>{
    //     console.log('adding candidate: ',candidate)
    //     pc.addIceCandidate(new RTCIceCandidate(candidate))
    //   })
    // }


  
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
      {/* <button onClick={setRemoteDescription}>setRemoteDescription</button>
      <button onClick={addCandidate}>addCandidate</button> */}
    </div>
  );
}

export default App;
