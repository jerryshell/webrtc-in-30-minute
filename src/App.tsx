import { useRef, useState } from 'react'
import './App.css'

function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const getMediaDevices = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
      .then(stream => {
        console.log('stream', stream)
        localVideoRef.current!.srcObject = stream
      })
  }

  return (
    <div>
      <button onClick={getMediaDevices}>获取摄像头和麦克风</button>
      <br />
      <video style={{ width: '400px' }} ref={localVideoRef} autoPlay></video>
    </div>
  )
}

export default App
