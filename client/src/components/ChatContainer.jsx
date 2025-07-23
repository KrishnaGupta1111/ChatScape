import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import CallModal from "./CallModal";
import io from "socket.io-client";
import {
  startLocalStream,
  getLocalStream,
  getRemoteStream,
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  closeConnection,
} from "../lib/webrtc";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

const ChatContainer = ({
  isCallModalOpen,
  setIsCallModalOpen,
  callType,
  setCallType,
  localStream,
  setLocalStream,
  remoteStream,
  setRemoteStream,
  callLoading,
  setCallLoading,
  isVideoCall,
  setIsVideoCall,
  callFrom,
  setCallFrom,
  socketRef,
}) => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");

  const selectedUserId = selectedUser?._id;

  // Dummy avatars for now
  const localAvatar = authUser?.profilePic || assets.avatar_icon;
  const remoteAvatar = selectedUser?.profilePic || assets.avatar_icon;

  // --- OUTGOING CALL ---
  const handleStartVideoCall = async () => {
    await startCall(true);
  };
  const handleStartVoiceCall = async () => {
    await startCall(false);
  };
  const startCall = async (video) => {
    if (!selectedUserId) return;
    setIsVideoCall(video);
    setCallType("outgoing");
    setIsCallModalOpen(true);
    setCallLoading(true);
    const local = await startLocalStream(video);
    setLocalStream(local);
    createPeerConnection(
      (candidate) => {
        socketRef.current.emit("ice-candidate", {
          targetUserId: selectedUserId,
          candidate,
        });
      },
      (remote) => setRemoteStream(remote)
    );
    const offer = await createOffer();
    // Add a 'video' flag to offer for call type
    offer.video = video;
    socketRef.current.emit("call-user", {
      targetUserId: selectedUserId,
      offer,
    });
  };

  // --- HANG UP / END CALL ---
  const handleEndCall = () => {
    setIsCallModalOpen(false);
    setCallType(null);
    setCallFrom(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallLoading(false);
    closeConnection();
    // Notify peer if outgoing or in call
    if (callType === "outgoing" && selectedUserId) {
      socketRef.current.emit("end-call", { targetUserId: selectedUserId });
    } else if (callType === "incoming" && callFrom) {
      socketRef.current.emit("end-call", { targetUserId: callFrom });
    }
  };

  // --- MODAL PROPS ---
  const modalLocalStream = localStream;
  const modalRemoteStream = remoteStream;
  const modalLocalAvatar = localAvatar;
  const modalRemoteAvatar =
    callType === "incoming"
      ? selectedUser?._id === callFrom
        ? selectedUser?.profilePic
        : assets.avatar_icon
      : remoteAvatar;

  //Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  //Handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 tex-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <button
          onClick={handleStartVideoCall}
          className="bg-transparent p-1 hover:bg-white/20 rounded-full"
        >
          <img src={assets.video_icon2} alt="Video Call" className="w-6 h-6" />
        </button>
        {/* Phone (Voice Call) Button */}
        <button
          onClick={handleStartVoiceCall}
          className="bg-transparent p-1 hover:bg-white/20 rounded-full ml-1"
          title="Voice Call"
        >
          {/* Inline SVG for phone icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 8.63 19.86 19.86 0 0 1 0 0.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
      </div>

      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
      {/* Call Modal is now handled globally in HomePage, not here */}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime ,anywhere</p>
    </div>
  );
};

export default ChatContainer;
