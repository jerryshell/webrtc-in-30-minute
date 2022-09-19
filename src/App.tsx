import { useState } from 'react'
import './App.css'

function App() {
  const getMediaDevices = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
      .then(stream => {
        console.log('stream', stream)
      })
  }
  return (
    <div>
      <button onClick={getMediaDevices}>获取摄像头和麦克风</button>
      <video></video>
    </div>
  )
}

export default App
