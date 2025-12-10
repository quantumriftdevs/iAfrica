import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Phone,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { getClass, getClassToken } from "../utils/api";
import { formatDate } from "../utils/helpers";
import LiveClassroom from "../components/LiveClassroom";

const Classroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLeavingClass, setIsLeavingClass] = useState(false);
  const liveRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("iafrica-token");
    if (!token) {
      const returnUrl = encodeURIComponent(`/classroom/${encodeURIComponent(classId || "")}`);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        if (!classId) throw new Error("Missing class id");
        const info = await getClass(classId);
        if (!mounted) return;
        setClassInfo(info || null);

        try {
          const tk = await getClassToken(classId);
          if (!mounted) return;
          const tokenData = tk && (tk.data || tk) ? (tk.data || tk) : tk;
          setTokenInfo(tokenData || null);
        } catch {
          if (mounted) setTokenInfo(null);
        }
      } catch (e) {
        console.error("Classroom load error", e);
        if (mounted) setError(e?.message || "Failed to load classroom");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [classId, navigate]);

  const handleLeaveClass = () => {
    setIsLeavingClass(true);
    setTimeout(() => navigate(-1), 300);
  };

  // sync initial states when tokenInfo and liveRef are ready
  useEffect(() => {
    if (!tokenInfo) return;
    const sync = async () => {
      try {
        if (liveRef.current) {
          const audioEnabled = await liveRef.current.isAudioEnabled?.();
          const videoEnabled = await liveRef.current.isVideoEnabled?.();
          // audioEnabled === true => not muted
          setIsMuted(audioEnabled === undefined ? false : !audioEnabled);
          setIsVideoOff(videoEnabled === undefined ? false : !videoEnabled);
        }
      } catch {
        // ignore
      }
    };
    sync();
  }, [tokenInfo]);

  const handleToggleMute = async () => {
    try {
      if (liveRef.current && typeof liveRef.current.toggleAudio === "function") {
        await liveRef.current.toggleAudio();
        const audioEnabled = await liveRef.current.isAudioEnabled?.();
        setIsMuted(!(audioEnabled));
      } else {
        setIsMuted((prev) => !prev);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleVideo = async () => {
    try {
      if (liveRef.current && typeof liveRef.current.toggleVideo === "function") {
        await liveRef.current.toggleVideo();
        const videoEnabled = await liveRef.current.isVideoEnabled?.();
        setIsVideoOff(!(videoEnabled));
      } else {
        setIsVideoOff((prev) => !prev);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleShare = async () => {
    try {
      if (!isSharing) {
        if (liveRef.current && typeof liveRef.current.startScreenShare === "function") {
          const ok = await liveRef.current.startScreenShare();
          if (ok) setIsSharing(true);
        } else {
          setIsSharing(true);
        }
      } else {
        if (liveRef.current && typeof liveRef.current.stopScreenShare === "function") {
          await liveRef.current.stopScreenShare();
        }
        setIsSharing(false);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-emerald-200 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg font-semibold">Loading classroom...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting you to the live session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-6 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex flex-col transition-opacity duration-300 ${isLeavingClass ? "opacity-50" : "opacity-100"}`}>
      <div className="border-b border-emerald-500/20 bg-black/40 backdrop-blur-md">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {classInfo?.name || classInfo?.title || classInfo?.course || "Live Class"}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Live Now
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{formatDate(classInfo?.scheduledDate || classInfo?.startDate) || "Ongoing"}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Room ID</div>
              <div className="text-2xl font-bold text-emerald-400">{classInfo?.room || classId}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-hidden">
        {!tokenInfo ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 md:p-12 max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 mb-6">
                <Video className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Class Hasn't Started Yet</h2>
              <p className="text-gray-400 mb-8">The instructor will start the session shortly. Please wait or refresh the page to check again.</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition font-semibold group"
              >
                <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 group">
              <LiveClassroom ref={liveRef} tokenInfo={tokenInfo} classId={classId} />

              <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold">Live</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-6 px-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleToggleMute}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm backdrop-blur-sm border ${
                      isMuted
                        ? "bg-red-600/80 hover:bg-red-700 border-red-500/50 text-white"
                        : "bg-emerald-600/80 hover:bg-emerald-700 border-emerald-500/50 text-white"
                    }`}
                    title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                  </button>

                  <button
                    onClick={handleToggleVideo}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm backdrop-blur-sm border ${
                      isVideoOff
                        ? "bg-red-600/80 hover:bg-red-700 border-red-500/50 text-white"
                        : "bg-emerald-600/80 hover:bg-emerald-700 border-emerald-500/50 text-white"
                    }`}
                    title={isVideoOff ? "Start Camera" : "Stop Camera"}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isVideoOff ? "Start" : "Stop"}</span>
                  </button>

                  <button
                    onClick={handleToggleShare}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm backdrop-blur-sm border ${
                      isSharing
                        ? "bg-blue-600/80 hover:bg-blue-700 border-blue-500/50 text-white"
                        : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
                    }`}
                    title={isSharing ? "Stop Sharing" : "Share Screen"}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isSharing ? "Sharing" : "Share"}</span>
                  </button>

                  <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

                  <button
                    onClick={handleLeaveClass}
                    disabled={isLeavingClass}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed border border-red-500/50 text-white transition-all font-medium text-sm backdrop-blur-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">Leave</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Classroom;
