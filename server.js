// import express from 'express'
const express = require('express')
// import io from 'socket.io'
// ({
//     path = '/webrtc'
// })

const app = express()
const port = 8080

app.use(express.static(__dirname+'/build'))
app.get('/',(req,res,next)=>{
    res.sendFile(__dirname+'/build/index.html')
})

const server = app.listen(port,()=>console.log('sdhkal'))