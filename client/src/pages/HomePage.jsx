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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
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
      setIncomingCall(null);
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

  // End call (from modal)
  const handleEndCall = () => {
    setIsCallModalOpen(false);
    setCallType(null);
    setCallFrom(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallLoading(false);
    closeConnection();
    if (callType === "incoming" && callFrom) {
      socketRef.current.emit("end-call", { targetUserId: callFrom });
    }
  };

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
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
            <p className="text-lg font-semibold mb-2">
              Incoming {incomingCall.isVideo ? "Video" : "Voice"} Call
            </p>
            <p className="mb-4">User {incomingCall.from} is calling you...</p>
            <div className="flex gap-4">
              <button
                onClick={handleAcceptCall}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
              <button
                onClick={handleRejectCall}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
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
