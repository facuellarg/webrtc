// import express from 'express'
const express = require('express')
let io = require('socket.io')
({
    path:'/webRTC'
})
// import io from 'socket.io'

const app = express()
const port = 8080

app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html')
})


const server = app.listen(port, () => console.log('sdhkal'))

io.listen(server)

const peers =io.of('/webrtcPeer')

const connectedPeers = new Map()

peers.on('connection',socket =>{
    console.log(socket.id)
    socket.emit('connection-success',{success:socket.id})
    connectedPeers.set(socket.id,socket)

    socket.on('offerOrAnswer',(data)=>{
        for(const[socketID,socket]of connectedPeers.entries() ){
            if(socketID != data.socketID){
                socket.emit('offerOrAnswer',data.payload)
            }
        }
    })
    socket.on('candidate',(data)=>{
        for(const[socketID,socket]of connectedPeers.entries() ){
            if(socketID != data.socketID){
                socket.emit('candidate',data.payload)
            }
        }
    })

    socket.on('disconnect',()=>{
        console.log('disconnected')
        connectedPeers.delete(socket.id)
    })
})