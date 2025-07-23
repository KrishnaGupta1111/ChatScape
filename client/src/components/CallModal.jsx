import React from "react";

const CallModal = ({
  isOpen,
  onClose,
  isVideoCall,
  localStream,
  remoteStream,
  localAvatar,
  remoteAvatar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center relative min-w-[320px] min-h-[320px]">
        {/* Call Content */}
        {isVideoCall ? (
          <div className="flex flex-row items-center gap-6 justify-center w-full mt-8 mb-8">
            <video
              ref={(el) => {
                if (el && localStream) el.srcObject = localStream;
              }}
              autoPlay
              muted
              className="w-56 h-40 bg-black rounded-lg border border-gray-700 object-cover"
            />
            <video
              ref={(el) => {
                if (el && remoteStream) el.srcObject = remoteStream;
              }}
              autoPlay
              className="w-56 h-40 bg-black rounded-lg border border-gray-700 object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-row items-center gap-8 justify-center w-full mt-8 mb-8">
            <img
              src={localAvatar}
              alt="You"
              className="w-24 h-24 rounded-full border-2 border-violet-500 shadow-md object-cover"
            />
            <img
              src={remoteAvatar}
              alt="Remote user"
              className="w-24 h-24 rounded-full border-2 border-green-500 shadow-md object-cover"
            />
          </div>
        )}
        {/* Hang up button at center bottom */}
        <div className="absolute left-0 right-0 bottom-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
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
              className="w-7 h-7"
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
