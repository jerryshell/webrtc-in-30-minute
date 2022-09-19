import { useRef, useState } from 'react'
import './App.css'

function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection>()

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

  const createRtcConnection = () => {
    const _pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.stunprotocol.org:3478'],
        }
      ]
    })
    pc.current = _pc
    console.log('rtc 连接创建成功', _pc)
  }

  const createOffer = () => {
    pc.current?.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    })
      .then(sdp => {
        console.log('offer', JSON.stringify(sdp))
        pc.current?.setLocalDescription(sdp)
      })
  }

  return (
    <div>
      <button onClick={getMediaDevices}>获取摄像头和麦克风</button>
      <br />
      <video style={{ width: '400px' }} ref={localVideoRef} autoPlay></video>
      <br />
      <button onClick={createRtcConnection}>创建 RTC 连接</button>
      <br />
      <button onClick={createOffer}>创建 Offer</button>
    </div>
  )
}

export default App
