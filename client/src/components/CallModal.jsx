import React from "react";
import assets from "../assets/assets";

const CallModal = ({
  isOpen,
  onClose,
  isVideoCall,
  localStream,
  remoteStream,
  localAvatar,
  remoteAvatar,
  callType,
  callLoading,
  remoteName,
  localName,
  callStatus = "Calling...",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gradient-to-br from-[#282142] to-[#8185b2]/80 rounded-2xl shadow-2xl p-8 flex flex-col items-center relative min-w-[320px] min-h-[340px] w-[95vw] max-w-lg">
        {/* Call Content */}
        {isVideoCall ? (
          <div className="flex flex-col items-center w-full mt-2 mb-4 gap-6">
            <div className="flex flex-row items-center justify-center gap-6 w-full">
              <div className="flex flex-col items-center">
                <video
                  ref={(el) => {
                    if (el && localStream) el.srcObject = localStream;
                  }}
                  autoPlay
                  muted
                  className="w-40 h-40 rounded-2xl border-4 border-violet-400 shadow-lg object-cover bg-black"
                  style={{ boxShadow: "0 0 16px 2px #7c3aed55" }}
                />
                <span className="mt-2 text-xs text-gray-200 font-medium">
                  {localName || "You"}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <video
                  ref={(el) => {
                    if (el && remoteStream) el.srcObject = remoteStream;
                  }}
                  autoPlay
                  className="w-40 h-40 rounded-2xl border-4 border-violet-500 shadow-lg object-cover bg-black animate-pulse"
                  style={{ boxShadow: "0 0 24px 4px #7c3aed55" }}
                />
                <span className="mt-2 text-xs text-gray-200 font-medium">
                  {remoteName || "Remote"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center mt-2">
              <span className="text-white text-lg font-semibold tracking-wide">
                Video Call
              </span>
              <span className="text-violet-200 text-sm mt-1">{callStatus}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 justify-center w-full mt-4 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex items-center justify-center">
                <img
                  src={remoteAvatar || assets.avatar_icon}
                  alt="Remote user"
                  className="w-32 h-32 rounded-full border-4 border-violet-500 shadow-xl animate-pulse"
                  style={{ boxShadow: "0 0 32px 8px #7c3aed55" }}
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-lg">
                  {/* Phone icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 8.63 19.86 19.86 0 0 1 0 0.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <span className="text-white text-xl font-semibold">
                  {remoteName || "Voice Call"}
                </span>
                <span className="text-violet-200 text-sm mt-1">
                  {callStatus}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <img
                src={localAvatar || assets.avatar_icon}
                alt="You"
                className="w-16 h-16 rounded-full border-2 border-violet-400 shadow-md object-cover"
              />
              <span className="text-xs text-gray-300">You</span>
            </div>
          </div>
        )}
        {/* Hang up button at center bottom */}
        <div className="absolute left-0 right-0 bottom-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-5 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
            title="Hang up"
          >
            {/* Phone-off SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M21 15.46V18a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.34 6.18 2 2 0 0 1 5.32 4h2.54a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.35a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.75.32 1.54.55 2.35.68A2 2 0 0 1 21 15.46z" />
              <line x1="23" y1="1" x2="1" y2="23" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
