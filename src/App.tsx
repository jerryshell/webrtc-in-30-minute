import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection>()
  const localStreamRef = useRef<MediaStream>()
  const wsRef = useRef(new WebSocket('ws://127.0.0.1:1234'))
  const username = (Math.random() + 1).toString(36).substring(7)

  useEffect(() => {
    initWs()
    getMediaDevices().then(() => {
      createRtcConnection()
      addLocalStreamToRtcConnection()
    })
  }, [])

  const initWs = () => {
    wsRef.current.onopen = () => console.log('ws 已经打开')
    wsRef.current.onmessage = wsOnMessage
  }

  const wsOnMessage = (e: MessageEvent) => {
    const wsData = JSON.parse(e.data)
    console.log('wsData', wsData)

    const wsUsername = wsData['username']
    console.log('wsUsername', wsUsername)
    if (username === wsUsername) {
      console.log('跳过处理本条消息')
      return
    }

    const wsType = wsData['type']
    console.log('wsType', wsType)

    if (wsType === 'offer') {
      const wsOffer = wsData['data']
      pc.current?.setRemoteDescription(new RTCSessionDescription(JSON.parse(wsOffer)))
    }
    if (wsType === 'answer') {
      const wsAnswer = wsData['data']
      pc.current?.setRemoteDescription(new RTCSessionDescription(JSON.parse(wsAnswer)))
    }
    if (wsType === 'candidate') {
      const wsCandidate = JSON.parse(wsData['data'])
      pc.current?.addIceCandidate(new RTCIceCandidate(wsCandidate))
      console.log('添加候选成功', wsCandidate)
    }
  }

  const wsSend = (type: string, data: any) => {
    wsRef.current.send(JSON.stringify({
      username,
      type,
      data,
    }))
  }

  const getMediaDevices = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    console.log('stream', stream)
    localVideoRef.current!.srcObject = stream
    localStreamRef.current = stream
  }

  const createRtcConnection = () => {
    const _pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.stunprotocol.org:3478'],
        }
      ]
    })
    _pc.onicecandidate = e => {
      if (e.candidate) {
        console.log('candidate', JSON.stringify(e.candidate))
        wsSend('candidate', JSON.stringify(e.candidate))
      }
    }
    _pc.ontrack = e => {
      remoteVideoRef.current!.srcObject = e.streams[0]
    }
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
        wsSend('offer', JSON.stringify(sdp))
      })
  }

  const createAnswer = () => {
    pc.current?.createAnswer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    })
      .then(sdp => {
        console.log('answer', JSON.stringify(sdp))
        pc.current?.setLocalDescription(sdp)
        wsSend('answer', JSON.stringify(sdp))
      })
  }

  const addLocalStreamToRtcConnection = () => {
    const localStream = localStreamRef.current!
    localStream.getTracks().forEach(track => {
      pc.current!.addTrack(track, localStream)
    })
    console.log('将本地视频流添加到 RTC 连接成功')
  }

  return (
    <div>
      <div>{`username:${username}`}</div>
      <video style={{ width: '400px' }} ref={localVideoRef} autoPlay controls></video>
      <video style={{ width: '400px' }} ref={remoteVideoRef} autoPlay controls></video>
      <br />
      <button onClick={createOffer}>创建 Offer</button>
      <button onClick={createAnswer}>创建 Answer</button>
    </div>
  )
}

export default App
