import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getClassToken, updateClassRecording, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';

const Classroom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const remoteContainerRef = useRef(null);
  const roomRef = useRef(null);
  const livekitRef = useRef(null);
  const localVideoRef = useRef(null);
  const pinnedVideoRef = useRef(null);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [hasSDK, setHasSDK] = useState(true);
  const [roomInfo, setRoomInfo] = useState({});
  const [participants, setParticipants] = useState([]);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [screenTrack, setScreenTrack] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [pinnedSid, setPinnedSid] = useState(null);
  const [participantSubs, setParticipantSubs] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const params = new URLSearchParams(location.search);
      const classId = params.get('classId');
      let token = params.get('token');
      let url = params.get('url');
      const startRecordingParam = params.get('startRecording');

      try {
        if (!token && classId) {
          const res = await getClassToken(classId);
          const data = res && (res.data || res) ? (res.data || res) : res;
          token = data?.token || data?.accessToken || data?.jwt || token;
          url = data?.url || data?.wsUrl || data?.livekitUrl || url;
        }

        setRoomInfo({ classId, token, url, startRecording: startRecordingParam === '1' });

        if (!token) {
          setError('No token available to join the classroom.');
          return;
        }

        setConnecting(true);

        // dynamic import of livekit-client
        let livekit;
        try {
          livekit = await import('livekit-client');
          livekitRef.current = livekit;
        } catch (e) {
          console.warn('livekit-client is not installed', e);
          setHasSDK(false);
          setError('The LiveKit client SDK is not installed in this project. Install with `npm install livekit-client` to enable in-app classroom.');
          return;
        }

        const { connect, Room } = livekit;

        let room;
        try {
          if (typeof connect === 'function') {
            room = await connect(url || window.location.origin, token, { autoSubscribe: true });
          } else if (typeof Room === 'function') {
            room = new Room();
            await room.connect(url || window.location.origin, token);
          } else {
            throw new Error('livekit-client does not expose connect/Room API');
          }

          if (!mounted) {
            // if unmounted during connect, disconnect
            if (room && typeof room.disconnect === 'function') room.disconnect();
            return;
          }

          roomRef.current = room;

          // helper to attach a track element into a container
          const attachTrack = (track, container) => {
            try {
              if (!track || !container) return null;
              const el = (track.attach && track.attach()) || null;
              if (el) container.appendChild(el);
              return el;
            } catch (e) {
              console.warn('attachTrack error', e);
              return null;
            }
          };

          // build participants list and attach already-published tracks
          const updateParticipants = () => {
            try {
              const parts = Array.from(room.participants && typeof room.participants.values === 'function'
                ? room.participants.values()
                : (Array.isArray(room.participants) ? room.participants : []));
              const list = [];
              for (const p of parts) {
                if (!p) continue;
                list.push({ sid: p.sid, identity: p.identity || p.sid });

                const audioPubs = p.audioTracks && typeof p.audioTracks.values === 'function' ? Array.from(p.audioTracks.values()) : (Array.isArray(p.audioTracks) ? p.audioTracks : []);
                for (const pub of audioPubs) { if (pub && pub.track) attachTrack(pub.track, remoteContainerRef.current); }

                const videoPubs = p.videoTracks && typeof p.videoTracks.values === 'function' ? Array.from(p.videoTracks.values()) : (Array.isArray(p.videoTracks) ? p.videoTracks : []);
                for (const pub of videoPubs) { if (pub && pub.track) attachTrack(pub.track, remoteContainerRef.current); }
              }
              setParticipants(list);
            } catch (e) {
              console.warn('updateParticipants error', e);
            }
          };

          updateParticipants();

          room.on('participantConnected', (p) => {
            setParticipants(prev => [...prev, { sid: p.sid, identity: p.identity || p.sid }]);
            p.on('trackSubscribed', (track) => {
              attachTrack(track, remoteContainerRef.current);
            });
            p.on('trackUnsubscribed', () => {
              // no-op: elements should be removed in cleanup
            });
          });

          room.on('participantDisconnected', (p) => {
            setParticipants(prev => prev.filter(x => x.sid !== p.sid));
          });

          room.on('trackPublished', (publication) => {
            // publication might fire subscribed event later
            if (publication && typeof publication.on === 'function') {
              publication.on('subscribed', (track) => {
                attachTrack(track, remoteContainerRef.current);
              });
            }
          });

          // create local audio track (best-effort)
          try {
            if (livekit.createLocalAudioTrack) {
              const a = await livekit.createLocalAudioTrack();
              if (a) {
                setLocalAudioTrack(a);
                if (room.localParticipant && typeof room.localParticipant.publishTrack === 'function') {
                  await room.localParticipant.publishTrack(a);
                }
              }
            }
          } catch (aErr) { console.warn('local audio error', aErr); }

          // create local video track (best-effort) and preview
          try {
            if (livekit.createLocalVideoTrack) {
              const v = await livekit.createLocalVideoTrack({ facingMode: 'user' });
              if (v) {
                setLocalVideoTrack(v);
                try {
                  if (room.localParticipant && typeof room.localParticipant.publishTrack === 'function') {
                    await room.localParticipant.publishTrack(v);
                  }
                } catch { /* ignore publish error */ }

                const preview = attachTrack(v, document.createElement('div'));
                if (preview && localVideoRef.current) {
                  localVideoRef.current.innerHTML = '';
                  localVideoRef.current.appendChild(preview);
                }
              }
            }
          } catch (pubErr) {
            console.warn('Failed to obtain local camera', pubErr);
          }

          // If the caller asked to auto-start recording, try to enable it now (after connect)
          if (startRecordingParam === '1' || startRecordingParam === true) {
            try {
              if (classId) {
                await updateClassRecording(classId, { recording: true });
                setRecording(true);
                toast.push('Recording started on server', { type: 'success' });
              }
            } catch (recErr) {
              console.warn('Auto-start recording failed', recErr);
              // surface more detail for debugging but keep UI usable
              toast.push('Unable to request server recording at connect time. You can try again from the classroom. Classroom will still open.', { type: 'warning' });
            }
          }
        } catch (connErr) {
          console.error('Failed to connect to LiveKit', connErr);
          setError(formatApiError(connErr) || String(connErr));
        }
      } catch (e) {
        console.error('Classroom init error', e);
        setError(formatApiError(e) || 'Failed to initialize classroom');
      } finally {
        setConnecting(false);
      }
    })();

    return () => {
      mounted = false;
      try {
        const r = roomRef.current;
        if (r && typeof r.disconnect === 'function') r.disconnect();
      } catch (err) {
        console.warn('cleanup disconnect error', err);
      }
      // detach any attached track elements in remote container & pinned container
      if (remoteContainerRef.current) remoteContainerRef.current.innerHTML = '';
      if (localVideoRef.current) localVideoRef.current.innerHTML = '';
      if (pinnedVideoRef.current) pinnedVideoRef.current.innerHTML = '';
    };
  }, [location.search]);

  const toggleRecording = async () => {
    const classId = roomInfo.classId;
    if (!classId) return;
    try {
      const next = !recording;
      await updateClassRecording(classId, { recording: next });
      setRecording(next);
      toast.push(next ? 'Recording started on server' : 'Recording stopped on server', { type: 'success' });
    } catch (e) {
      console.error('Toggle recording error', e);
      toast.push(formatApiError(e) || 'Failed to toggle recording on server', { type: 'error' });
    }
  };

  const toggleMute = () => {
    try {
      if (!localAudioTrack) return;
      const m = localAudioTrack.mediaStreamTrack || localAudioTrack.track || localAudioTrack;
      if (m && typeof m.enabled === 'boolean') {
        m.enabled = !m.enabled;
        setMuted(!m.enabled);
        return;
      }
      setMuted(prev => !prev);
    } catch (e) {
      console.warn('toggleMute error', e);
    }
  };

  const toggleCamera = () => {
    try {
      if (!localVideoTrack) return;
      const v = localVideoTrack.mediaStreamTrack || localVideoTrack.track || localVideoTrack;
      if (v && typeof v.enabled === 'boolean') {
        v.enabled = !v.enabled;
        setCameraOn(v.enabled);
        return;
      }
      setCameraOn(prev => !prev);
    } catch (e) {
      console.warn('toggleCamera error', e);
    }
  };

  const startScreenShare = async () => {
    try {
      const lk = livekitRef.current;
      const room = roomRef.current;
      if (!room || !lk) return toast.push('Unable to start screen share (no room/SDK)', { type: 'error' });

      // 1) Prefer the official helper (newer SDKs)
      if (typeof lk.createLocalScreenTracks === 'function') {
        // createLocalScreenTracks returns LocalVideoTrack (+ possibly LocalAudioTrack)
        const tracks = await lk.createLocalScreenTracks({ audio: false });
        const videoTrack = tracks.find(t => t.kind === 'video') || tracks[0];
        if (videoTrack) {
          await room.localParticipant.publishTrack(videoTrack);
          setScreenTrack(videoTrack);
          const preview = (videoTrack.attach && videoTrack.attach()) || null;
          if (preview && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            localVideoRef.current.appendChild(preview);
          }
        }
        return;
      }

      // 2) If the LocalParticipant helper exists (some SDKs)
      if (room.localParticipant && typeof room.localParticipant.setScreenShareEnabled === 'function') {
        try {
          await room.localParticipant.setScreenShareEnabled(true);
          setScreenTrack(true);
          return;
        } catch (err) {
          console.warn('setScreenShareEnabled failed, falling back', err);
        }
      }

      // 3) Fallback: use getDisplayMedia + publish raw MediaStreamTrack or wrap in LocalVideoTrack if SDK supports it
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const mediaTrack = stream.getVideoTracks()[0];
        if (!mediaTrack) throw new Error('No display media track obtained');

        // If SDK exposes LocalVideoTrack constructor, wrap it
        if (lk && typeof lk.LocalVideoTrack === 'function') {
          const localTrack = new lk.LocalVideoTrack(mediaTrack);
          await room.localParticipant.publishTrack(localTrack);
          setScreenTrack(localTrack);
          const preview = (localTrack.attach && localTrack.attach()) || null;
          if (preview && localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            localVideoRef.current.appendChild(preview);
          }
        } else {
          // publish the raw MediaStreamTrack directly (LiveKit supports publishing any MediaStreamTrack)
          try { await room.localParticipant.publishTrack(mediaTrack); } catch (e) { console.warn('publish raw track failed', e); }
          setScreenTrack(mediaTrack);
          // show local preview using a <video> element from the stream
          const videoEl = document.createElement('video');
          videoEl.autoplay = true;
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.srcObject = stream;
          if (localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
            localVideoRef.current.appendChild(videoEl);
          }
        }
        return;
      }

      // final fallback
      toast.push('Screen share not supported by this browser or installed LiveKit SDK', { type: 'error' });
    } catch (e) {
      console.error('startScreenShare error', e);
      toast.push(formatApiError(e) || 'Failed to start screen share', { type: 'error' });
    }
  };

  const stopScreenShare = async () => {
    try {
      const room = roomRef.current;
      const st = screenTrack;
      if (!st || !room) return;

      // If we published a LiveKit LocalTrack instance (has stop() and attach())
      try {
        // If it's a LiveKit LocalTrack object, unpublish by object
        await room.localParticipant.unpublishTrack(st);
      } catch {
        // try unpublish by raw MediaStreamTrack if that's what we stored
        await room.localParticipant.unpublishTrack(st);
      }

      // Stop underlying media if possible
      if (st && typeof st.stop === 'function') {
        st.stop();
      }
      // else if (st && st instanceof MediaStreamTrack && typeof st.stop === 'function') {
      //   st.stop();
      // }

      setScreenTrack(null);

      // restore camera preview if you still have localVideoTrack
      if (localVideoTrack) {
        const preview = (localVideoTrack.attach && localVideoTrack.attach()) || null;
        if (preview && localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
          localVideoRef.current.appendChild(preview);
        }
      } else if (localVideoRef.current) {
        localVideoRef.current.innerHTML = 'Local preview will appear here';
      }
    } catch (e) {
      console.error('stopScreenShare error', e);
    }
  };

  const toggleParticipantSub = async (sid, kind) => {
    try {
      const room = roomRef.current;
      if (!room) return;
      const p = Array.from(room.participants && typeof room.participants.values === 'function' ? room.participants.values() : []).find(x => x.sid === sid);
      if (!p) return;
      const pubs = kind === 'audio' ? (p.audioTracks || []) : (p.videoTracks || []);
      const current = participantSubs[sid] && typeof participantSubs[sid][kind] !== 'undefined' ? participantSubs[sid][kind] : true;
      let succeeded = false;
      for (const pub of pubs) {
        if (pub && typeof pub.setSubscribed === 'function') {
          try {
            await pub.setSubscribed(!current);
            succeeded = true;
          } catch (e) {
            console.warn('setSubscribed error', e);
          }
        }
      }
      setParticipantSubs(prev => ({ ...prev, [sid]: { ...(prev[sid] || {}), [kind]: succeeded ? !current : !current } }));
    } catch (e) {
      console.error('toggleParticipantSub error', e);
    }
  };

  const pinParticipant = (sid) => {
    try {
      setPinnedSid(sid);
      const room = roomRef.current;
      if (!room || !sid || !pinnedVideoRef.current) return;
      const p = Array.from(room.participants && typeof room.participants.values === 'function' ? room.participants.values() : []).find(x => x.sid === sid);
      if (!p) return;
      const pub = (p.videoTracks && (Array.isArray(p.videoTracks) ? p.videoTracks.find(pp => pp.track) : (p.videoTracks.values && Array.from(p.videoTracks.values())[0]))) || null;
      if (pub && pub.track) {
        pinnedVideoRef.current.innerHTML = '';
        try { pinnedVideoRef.current.appendChild(pub.track.attach()); } catch (e) { console.warn('pin attach error', e); }
      }
    } catch (e) {
      console.warn('pinParticipant error', e);
    }
  };

  const unpinParticipant = () => {
    setPinnedSid(null);
    if (pinnedVideoRef.current) pinnedVideoRef.current.innerHTML = '';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Live Classroom</h2>
          <div className="space-x-2 flex items-center">
            {roomInfo.classId && (
              <button onClick={toggleRecording} className={`px-3 py-2 rounded ${recording ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>
            )}
            <button onClick={() => { try { const r = roomRef.current; if (r && typeof r.disconnect === 'function') r.disconnect(); } catch (e) { console.warn('leave error', e); } navigate(-1); }} className="px-3 py-2 rounded border">Leave</button>
          </div>
        </div>

        {connecting && <div className="mb-4 text-sm text-gray-600">Connecting to LiveKit...</div>}
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {!hasSDK && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="mb-2">The LiveKit client SDK is not installed in this project. To enable an in-app classroom and recording preview, add the dependency and rebuild the app:</p>
            <pre className="bg-white p-3 rounded text-sm">npm install livekit-client</pre>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-50 p-4 rounded">
            <div className="mb-3 flex gap-2">
              <button onClick={toggleMute} className={`px-3 py-2 rounded ${muted ? 'bg-gray-400 text-white' : 'bg-emerald-600 text-white'}`}>{muted ? 'Unmute' : 'Mute'}</button>
              <button onClick={toggleCamera} className={`px-3 py-2 rounded ${cameraOn ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'}`}>{cameraOn ? 'Camera Off' : 'Camera On'}</button>
              {screenTrack ? (
                <button onClick={stopScreenShare} className="px-3 py-2 rounded bg-red-600 text-white">Stop Screen Share</button>
              ) : (
                <button onClick={startScreenShare} className="px-3 py-2 rounded bg-blue-600 text-white">Start Screen Share</button>
              )}
            </div>
            <div className="bg-black rounded overflow-hidden" style={{ minHeight: 240 }}>
              <div ref={localVideoRef} className="w-full h-full">Local preview will appear here</div>
            </div>
            <div className="mt-3 bg-gray-50 p-3 rounded h-48 overflow-auto" ref={remoteContainerRef}>Remote participants will appear here</div>
          </div>

          <div className="bg-white rounded p-4">
            <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
            <ul className="space-y-2 text-sm">
              {participants.map(p => (
                <li key={p.sid} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.identity}</div>
                    <div className="text-xs text-gray-500">{p.sid}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleParticipantSub(p.sid, 'audio')} className="px-2 py-1 text-xs rounded border">
                      {participantSubs[p.sid] && participantSubs[p.sid].audio === false ? 'Unsub Audio' : 'Sub Audio'}
                    </button>
                    <button onClick={() => toggleParticipantSub(p.sid, 'video')} className="px-2 py-1 text-xs rounded border">
                      {participantSubs[p.sid] && participantSubs[p.sid].video === false ? 'Unsub Video' : 'Sub Video'}
                    </button>
                    {pinnedSid === p.sid ? (
                      <button onClick={unpinParticipant} className="px-2 py-1 text-xs rounded bg-gray-200">Unpin</button>
                    ) : (
                      <button onClick={() => pinParticipant(p.sid)} className="px-2 py-1 text-xs rounded bg-gray-100">Pin</button>
                    )}
                  </div>
                </li>
              ))}
              {participants.length === 0 && <li className="text-gray-500">No participants yet</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
