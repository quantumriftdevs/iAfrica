import React, { useEffect, useRef, useState } from 'react';

const LiveClassroom = ({ tokenInfo = {} }) => {
  const [room, setRoom] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const localTracksRef = React.useRef([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [roomNameState, setRoomNameState] = useState(undefined);
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (!tokenInfo) return;
    let mounted = true;
    let r = null;

    const attachTrack = (track, container, participantId) => {
      try {
        const el = track.attach();
        if (participantId) el.dataset.participant = participantId;
        container.appendChild(el);
      } catch {
        // ignore attach errors
      }
    };

    const _iterate = (iterable, fn) => {
      if (!iterable) return;
      // Map or objects with forEach
      if (typeof iterable.forEach === 'function') {
        try { iterable.forEach(fn); } catch (err) { console.warn('iterate.forEach error', err); }
        return;
      }
      if (Array.isArray(iterable)) {
        iterable.forEach(fn);
        return;
      }
      if (typeof iterable === 'object') {
        Object.values(iterable).forEach(fn);
        return;
      }
    };

    const connectRoom = async () => {
      try {
        const token = tokenInfo.token || tokenInfo.accessToken || tokenInfo.jwt;
        const url = tokenInfo.url || tokenInfo.wsUrl || (tokenInfo.room && (tokenInfo.room.url || tokenInfo.room.wsUrl || tokenInfo.room.host)) || import.meta.env.VITE_LIVEKIT_URL;
        const roomName = tokenInfo.room && (tokenInfo.room.name || tokenInfo.room.room || tokenInfo.room) ? (tokenInfo.room.name || tokenInfo.room.room || tokenInfo.room) : undefined;
        if (roomName) setRoomNameState(roomName);
        if (!url || !token) throw new Error('Missing LiveKit URL or token');

        const LK = await import('livekit-client');

        // resolve connect/createLocalTracks across variations
        const connectFn = LK.connect || (LK.default && LK.default.connect);
        const createLocalTracksFn = LK.createLocalTracks || (LK.default && LK.default.createLocalTracks);
        const RoomClass = LK.Room || (LK.default && LK.default.Room);

        if (connectFn && typeof connectFn === 'function') {
          r = await connectFn(url, token, { autoSubscribe: true });
        } else if (RoomClass) {
          r = new RoomClass();
          if (typeof r.connect === 'function') {
            await r.connect(url, token, { autoSubscribe: true });
          } else {
            throw new Error('LiveKit Room.connect unavailable');
          }
        } else {
          throw new Error('LiveKit connect not available in imported module');
        }
        if (!mounted) {
          r.disconnect();
          return;
        }
        setRoom(r);
        setConnected(true);

        // create and publish local tracks
        let tracks;
        if (createLocalTracksFn && typeof createLocalTracksFn === 'function') {
          tracks = await createLocalTracksFn({ audio: true, video: true });
        } else if (LK && LK.createLocalTracks && typeof LK.createLocalTracks === 'function') {
          tracks = await LK.createLocalTracks({ audio: true, video: true });
        } else {
          throw new Error('createLocalTracks not available from livekit-client import');
        }
        if (!mounted) {
          tracks.forEach(t => t.stop && t.stop());
          r.disconnect();
          return;
        }
        setLocalTracks(tracks);
        localTracksRef.current = tracks;

        try {
          const lp = r.localParticipant;
          if (lp && typeof lp.publishTracks === 'function') {
            await lp.publishTracks(tracks);
          } else if (lp && typeof lp.publishTrack === 'function') {
            for (const t of tracks) {
              await lp.publishTrack(t);
            }
          } else if (typeof r.publishTracks === 'function') {
            // some builds expose publish on the Room
            await r.publishTracks(tracks);
          } else {
            console.warn('No publishTracks API found on LiveKit Room/localParticipant');
          }
        } catch (pubErr) {
          console.warn('publishTracks error, continuing local preview', pubErr);
        }

        // attach local video to preview container
        const localVideo = tracks.find(t => t.kind === 'video');
        if (localVideo && localRef.current) {
          // clear any previous
          localRef.current.innerHTML = '';
          attachTrack(localVideo, localRef.current, 'local');
        }

        // render existing remote participants
        const renderParticipant = (participant) => {
          try {
            // For each published track that is subscribed, attach
            participant.videoTracks.forEach((publication) => {
              if (publication.track && remoteRef.current) {
                attachTrack(publication.track, remoteRef.current, participant.identity || participant.sid);
              }
            });
          } catch (err) {
            console.warn('renderParticipant error', err);
          }
        };

        _iterate(r.participants, renderParticipant);

        r.on('participantConnected', (participant) => {
          renderParticipant(participant);
        });

        r.on('participantDisconnected', (participant) => {
          // remove any elements for this participant
          if (remoteRef.current) {
            const els = Array.from(remoteRef.current.querySelectorAll(`[data-participant="${participant.identity || participant.sid}"]`));
            els.forEach(e => e.remove());
          }
        });

        r.on('trackSubscribed', (track, publication, participant) => {
          if (track && track.kind === 'video' && remoteRef.current) {
            attachTrack(track, remoteRef.current, participant.identity || participant.sid);
          }
        });

      } catch (e) {
        console.error('LiveClassroom connect error', e);
        setError(e?.message || 'Failed to connect to live classroom');
      }
    };

    connectRoom();

    return () => {
      mounted = false;
      try {
        const lt = localTracksRef.current;
        if (lt && lt.length) {
          lt.forEach(t => { try { t.stop && t.stop(); } catch (err) { console.warn('track stop error', err); } });
        }
        if (r) r.disconnect();
      } catch (e) {
        console.warn('cleanup error', e);
      }
    };
  }, [tokenInfo]);

  // Helpers to get/set enabled state for local tracks across SDK shapes
  function getTrackEnabled(track) {
    if (!track) return undefined;
    try {
      if (typeof track.isEnabled === 'boolean') return track.isEnabled;
      if (typeof track.enabled === 'boolean') return track.enabled;
      if (track.mediaStreamTrack && typeof track.mediaStreamTrack.enabled === 'boolean') return track.mediaStreamTrack.enabled;
    } catch (err) {
      console.warn('getTrackEnabled error', err);
    }
    return undefined;
  }

  function setTrackEnabled(track, enabled) {
    if (!track) return false;
    try {
      if (typeof track.setEnabled === 'function') {
        track.setEnabled(enabled);
        return true;
      }
      if (typeof track.enable === 'function') {
        track.enable(enabled);
        return true;
      }
      if ('enabled' in track && typeof track.enabled === 'boolean') {
        track.enabled = enabled;
        return true;
      }
      if (track.mediaStreamTrack && 'enabled' in track.mediaStreamTrack) {
        track.mediaStreamTrack.enabled = enabled;
        return true;
      }
    } catch (err) {
      console.warn('setTrackEnabled error', err);
    }
    return false;
  }

  const toggleAudio = () => {
    if (!localTracks || !localTracks.length) return;
    const audio = localTracks.find(t => t.kind === 'audio');
    if (!audio) return;
    try {
      const current = getTrackEnabled(audio);
      const desired = typeof current === 'boolean' ? !current : true;
      const ok = setTrackEnabled(audio, desired);
      if (!ok) console.warn('toggleAudio: unable to change audio track state');
    } catch (e) {
      console.warn('toggleAudio error', e);
    }
    setLocalTracks([...localTracks]);
  };

  const toggleVideo = () => {
    if (!localTracks || !localTracks.length) return;
    const video = localTracks.find(t => t.kind === 'video');
    if (!video) return;
    try {
      const current = getTrackEnabled(video);
      const desired = typeof current === 'boolean' ? !current : true;
      const ok = setTrackEnabled(video, desired);
      if (!ok) console.warn('toggleVideo: unable to change video track state');
    } catch (e) {
      console.warn('toggleVideo error', e);
    }
    setLocalTracks([...localTracks]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Live Classroom {roomNameState ? `— ${roomNameState}` : ''}</div>
        <div className="flex gap-2">
          <button onClick={toggleAudio} className="px-3 py-1 rounded border">{getTrackEnabled(localTracks.find(t=>t.kind==='audio')) ? 'Mute' : 'Unmute'}</button>
          <button onClick={toggleVideo} className="px-3 py-1 rounded border">{getTrackEnabled(localTracks.find(t=>t.kind==='video')) ? 'Stop Video' : 'Start Video'}</button>
        </div>
      </div>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="font-semibold mb-2">Local preview</div>
          <div ref={localRef} className="w-full h-48 bg-black/5 rounded overflow-hidden flex items-center justify-center"></div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow p-3">
          <div className="font-semibold mb-2">Participants</div>
          <div ref={remoteRef} className="w-full h-64 bg-black/5 rounded overflow-auto grid grid-cols-2 gap-2 p-2" />
        </div>
      </div>
    </div>
  );
};

export default LiveClassroom;
