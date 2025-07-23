import React, { useContext, useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import CallModal from "../components/CallModal";
import io from "socket.io-client";
import {
  startLocalStream,
  createPeerConnection,
  setRemoteDescription,
  createAnswer,
  closeConnection,
} from "../lib/webrtc";
import toast from "react-hot-toast";
import ringtoneSound from "../assets/ringtone.mp3";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

const HomePage = () => {
  const { selectedUser, users } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  // Incoming call state
  const [incomingCall, setIncomingCall] = useState(null); // { from, offer, isVideo }
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState(null); // 'incoming' | 'outgoing' | null
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callLoading, setCallLoading] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [callFrom, setCallFrom] = useState(null);
  const socketRef = useRef();
  const audioRef = useRef();

  // Play/stop ringtone on incoming call
  useEffect(() => {
    if (incomingCall && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (!incomingCall && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [incomingCall]);

  // Also stop ringtone when call modal opens (accepted)
  useEffect(() => {
    if (isCallModalOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isCallModalOpen]);

  useEffect(() => {
    if (!authUser?._id) return;
    const socket = io(SOCKET_URL, {
      query: { userId: authUser._id },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Incoming call
    socket.on("call-made", ({ from, offer }) => {
      setIncomingCall({ from, offer, isVideo: !!offer?.video });
    });

    // Call ended (reset state)
    socket.on("call-ended", () => {
      setIsCallModalOpen(false);
      setCallType(null);
      setCallFrom(null);
      setLocalStream(null);
      setRemoteStream(null);
      setCallLoading(false);
      setIncomingCall(null); // <-- Ensure incoming call notification is cleared
      closeConnection();
    });

    // Call rejected (notify caller)
    socket.on("call-rejected", ({ from }) => {
      toast.error("Your call was rejected.");
      setIsCallModalOpen(false);
      setCallType(null);
      setCallFrom(null);
      setLocalStream(null);
      setRemoteStream(null);
      setCallLoading(false);
      setIncomingCall(null);
      closeConnection();
    });

    return () => {
      socket.disconnect();
    };
  }, [authUser?._id]);

  // Accept incoming call
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    setIsCallModalOpen(true);
    setCallType("incoming");
    setIsVideoCall(incomingCall.isVideo);
    setCallFrom(incomingCall.from);
    setCallLoading(false);
    setIncomingCall(null);
    // Prepare local stream for answer
    const local = await startLocalStream(incomingCall.isVideo);
    setLocalStream(local);
    createPeerConnection(
      (candidate) => {
        socketRef.current.emit("ice-candidate", {
          targetUserId: incomingCall.from,
          candidate,
        });
      },
      (remote) => setRemoteStream(remote)
    );
    await setRemoteDescription(incomingCall.offer);
    const answer = await createAnswer();
    socketRef.current.emit("answer-call", {
      targetUserId: incomingCall.from,
      answer,
    });
  };

  // Reject incoming call
  const handleRejectCall = () => {
    if (incomingCall) {
      socketRef.current.emit("reject-call", {
        targetUserId: incomingCall.from,
      });
    }
    setIncomingCall(null);
  };

  // End call (from modal or caller cuts before answer)
  const handleEndCall = () => {
    setIsCallModalOpen(false);
    setCallType(null);
    setCallFrom(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallLoading(false);
    setIncomingCall(null); // <-- Ensure incoming call notification is cleared
    closeConnection();
    if (callType === "incoming" && callFrom) {
      socketRef.current.emit("end-call", { targetUserId: callFrom });
    }
    // If caller cancels before callee answers, notify callee
    if (callType === "outgoing" && selectedUser) {
      socketRef.current.emit("end-call", { targetUserId: selectedUser._id });
    }
  };

  // Get caller's name from users array
  let callerName = null;
  if (incomingCall && users && users.length > 0) {
    const caller = users.find((u) => u._id === incomingCall.from);
    callerName = caller ? caller.fullName : incomingCall.from;
  }

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        <Sidebar
          incomingCall={incomingCall}
          onAcceptCall={handleAcceptCall}
          onRejectCall={handleRejectCall}
        />
        <ChatContainer
          isCallModalOpen={isCallModalOpen}
          setIsCallModalOpen={setIsCallModalOpen}
          callType={callType}
          setCallType={setCallType}
          localStream={localStream}
          setLocalStream={setLocalStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
          callLoading={callLoading}
          setCallLoading={setCallLoading}
          isVideoCall={isVideoCall}
          setIsVideoCall={setIsVideoCall}
          callFrom={callFrom}
          setCallFrom={setCallFrom}
          socketRef={socketRef}
        />
        <RightSidebar />
      </div>
      {/* Incoming call notification (global, not per user) */}
      {incomingCall && (
        <>
          <audio ref={audioRef} src={ringtoneSound} loop />
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gradient-to-br from-[#282142] to-[#8185b2]/80 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-[90vw] max-w-xs sm:max-w-sm md:max-w-md border-2 border-violet-500">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center mb-2 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A2 2 0 0021 6.382V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-1.382a2 2 0 00-1.447-1.942L15 14M10 9v6m4-6v6"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-white mb-1 text-center">
                  Incoming {incomingCall.isVideo ? "Video" : "Voice"} Call
                </p>
                <p className="mb-4 text-gray-200 text-center text-sm">
                  {callerName
                    ? `${callerName} is calling you...`
                    : `User is calling you...`}
                </p>
                <div className="flex gap-4 w-full justify-center mt-2">
                  <button
                    onClick={handleAcceptCall}
                    className="flex-1 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold shadow-md hover:scale-105 transition-transform text-base"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleRejectCall}
                    className="flex-1 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-bold shadow-md hover:scale-105 transition-transform text-base"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Call Modal for accepted/active call */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={handleEndCall}
        isVideoCall={isVideoCall}
        localStream={localStream}
        remoteStream={remoteStream}
        localAvatar={null}
        remoteAvatar={null}
        callType={callType}
        callLoading={callLoading}
      />
    </div>
  );
};

export default HomePage;
