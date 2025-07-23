// WebRTC utility for video/voice calls

let peerConnection = null;
let localStream = null;
let remoteStream = null;

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // You can add TURN servers here for production
  ],
};

export async function startLocalStream(isVideo = true) {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: isVideo,
    audio: true,
  });
  return localStream;
}

export function getLocalStream() {
  return localStream;
}

export function getRemoteStream() {
  return remoteStream;
}

export function createPeerConnection(onIceCandidate, onTrack) {
  peerConnection = new RTCPeerConnection(iceServers);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }
    remoteStream.addTrack(event.track);
    if (onTrack) onTrack(remoteStream);
  };

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }

  return peerConnection;
}

export async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offer;
}

export async function createAnswer() {
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  return answer;
}

export async function setRemoteDescription(desc) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
}

export async function addIceCandidate(candidate) {
  if (candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

export function closeConnection() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }
  if (remoteStream) {
    remoteStream = null;
  }
}
