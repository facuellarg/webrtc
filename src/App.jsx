import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client'
import './App.css';

function App() {
  // const localVideoRef = React.createRef()
  // const remoteVideoRef = React.createRef()
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const [sdp, setSdp] = useState(null)
  let textref = useRef()
  let pc = useRef()
  let socket = useRef()

  useEffect(() => {
    socket.current = io(
      '/webrtcPeer',
      {
        path: '/webRTC',
        query: {}
      }
    )
    const pc_config = {
      "iceServers": [
        {
          urls: 'stun:stun.l.google.com:19302',
        }
      ]
    }
    pc.current = new RTCPeerConnection(pc_config)
    socket.current.on('connection-success', success => {
      console.log("succes", success)
    })
    pc.current.onicecandidate = (e) => {
      if (e.candidate) {
        sendToPeer('candidate', e.candidate)
      }
    }
    socket.current.on('disconnected', (reason) => {
      console.log("razon", reason)
      //   alert(reason)
      //   pc.current.close()

    })
    socket.current.on('candidate', (candidate) => {
      console.log("Entrando")
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
      // candidates.push(candidate)
    })
    // const pc_current.config = null

    pc.current.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    pc.current.onaddstream = (e) => {
      remoteVideoRef.current.srcObject = e.stream
    }

    const constrains = { 'video': true }
    const succes = (stream) => {
      window.localStream = stream
      localVideoRef.current.srcObject = stream
      pc.current.addStream(stream)

    }
    const failure = (e) => {
      console.log("get UserMedia error: ", e)
    }
    navigator.mediaDevices.getUserMedia(constrains)
      .then(succes)
      .catch(failure)

    socket.current.on('offerOrAnswer', (sdp) => {
      textref.value = JSON.stringify(sdp)
      pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
      setSdp(sdp)
    })

  }, []);

  const sendToPeer = (messageType, payload) => {
    socket.current.emit(messageType, {
      socketID: socket.current.id,
      payload,
    })
  }

  const createOffer = () => {
    console.log('offer')
    pc.current.createOffer({ offerToReciveVideo: 1 })
      .then(sdp => {
        pc.current.setLocalDescription(sdp)
        sendToPeer('offerOrAnswer', sdp)
      }, e => { })
  }
  const createAnswer = () => {
    console.log('Answer')
    pc.current.createAnswer({ offerToReciveVideo: 1 })
      .then(sdp => {
        pc.current.setLocalDescription(sdp)
        sendToPeer('offerOrAnswer', sdp)
      }, e => { })
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


  // if (sdp) {
  //   console.log("tenemos state")
  // }
  console.log("state :", sdp)
  return (
    <div className="App">


      <video
        ref={localVideoRef} autoPlay
        style={{
          height: 300,
          width: 300,
          backgroundColor: 'black',
          margin: 5,
        }}
      ></video>
      {sdp?<video
        ref={remoteVideoRef} autoPlay
        style={{
          height: 300,
          width: 300,
          backgroundColor: 'black',
          margin: 5,
        }}
      ></video>:
        <br/>
      }

      {/* <button onClick={createAnswer}>Answer</button>
      <button onClick={createOffer}>Offer</button> */}
      {sdp ?
        <button onClick={createAnswer}>Answer</button> :
        <button onClick={createOffer}>Offer</button>
      }
      <textarea ref={ref => textref = ref} cols="30" rows="10"></textarea>
      {/* <button onClick={setRemoteDescription}>setRemoteDescription</button>
      <button onClick={addCandidate}>addCandidate</button> */}
    </div>
  );
}

export default App;
