import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const LiveClassroom = forwardRef(({ tokenInfo = {} }, ref) => {
  const [room, setRoom] = useState(null);
  const roomRef = useRef(null);
  const [localTracks, setLocalTracks] = useState([]);
  const localTracksRef = useRef([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [roomNameState, setRoomNameState] = useState(undefined);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const mainParticipantIdRef = useRef("local");
  const isLocalLecturerRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_BASE_MS = 2000;
  // maximum allowed participants in the room (including local participant)
  const MAX_PARTICIPANTS = 200;
  const [userJoined, setUserJoined] = useState(true);

  // utility: attach a track's element to a container (safe)
  const attachTrack = (track, container, participantId) => {
    if (!track || !container) return;
    try {
      if (typeof track.attach === "function") {
        const el = track.attach();
        if (participantId && el) el.dataset.participant = participantId;
        // remove any placeholder when attaching real media
        try {
          const ph = container.querySelector('.participant-placeholder');
          if (ph) ph.remove();
        } catch { /* ignore */ }
        container.appendChild(el);
      } else if (track instanceof MediaStream) {
        const v = document.createElement("video");
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.srcObject = track;
        if (participantId) v.dataset.participant = participantId;
        try {
          const ph = container.querySelector('.participant-placeholder');
          if (ph) ph.remove();
        } catch { /* ignore */ }
        container.appendChild(v);
      } else if (track instanceof MediaStreamTrack) {
        const ms = new MediaStream([track]);
        const v = document.createElement("video");
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.srcObject = ms;
        if (participantId) v.dataset.participant = participantId;
        try {
          const ph = container.querySelector('.participant-placeholder');
          if (ph) ph.remove();
        } catch { /* ignore */ }
        container.appendChild(v);
      }
    } catch (err) {
      // ignore attach errors
      console.warn("attachTrack error", err);
    }
  };

  // determine whether a participant looks like the lecturer
  const isLecturerParticipant = (participant) => {
    try {
      const id = (participant && (participant.identity || participant.sid || participant.name)) || "";
      if (typeof id === "string" && /lecturer|teacher|instructor|host/i.test(id)) return true;

      // metadata may be an object or a JSON string in different SDK versions
      let meta = participant && (participant.metadata || participant.info?.metadata || participant.info);
      if (meta && typeof meta === "string") {
        try {
          meta = JSON.parse(meta);
        } catch {
          // leave as string
        }
      }

      if (meta && typeof meta === "object") {
        // common keys that may indicate role
        const roleVal = meta.role || meta.userRole || meta.roleName || meta.role_type || meta.type;
        if (roleVal && /lecturer|teacher|instructor|host/i.test(String(roleVal))) return true;
        if (meta.isLecturer || meta.isInstructor || meta.isHost || meta.host === true) return true;
      }

      // also check nested info fields if present
      const infoMeta = participant && participant.info && participant.info.metadata;
      if (infoMeta && typeof infoMeta === "string") {
        try {
          const im = JSON.parse(infoMeta);
          if (im && im.role && /lecturer|teacher|instructor|host/i.test(String(im.role))) return true;
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.warn("isLecturerParticipant error", err);
    }
    return false;
  };

  // detect whether a publication/track represents a screen share (robust across SDK shapes)
  const isScreenShareTrack = (publicationOrTrack) => {
    if (!publicationOrTrack) return false;
    try {
      const pub = publicationOrTrack;
      const track = pub.track || pub;
      // check common source fields
      if (pub && pub.source && /screen|desktop|share|window/i.test(String(pub.source))) return true;
      if (track && track.source && /screen|desktop|share|window/i.test(String(track.source))) return true;
      // some SDKs expose trackName/name or underlying mediaStreamTrack.label
      const name = track && (track.name || track.trackName || (track.mediaStreamTrack && track.mediaStreamTrack.label) || '');
      if (typeof name === 'string' && /screen|display|window|share/i.test(name)) return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  };

  // ensure AudioContext is created/resumed after a user gesture (for autoplay policy)
  const ensureAudioContext = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window.__livekitAudioContext) {
        window.__livekitAudioContext = new AC();
      }
      const ac = window.__livekitAudioContext;
      if (ac && ac.state === "suspended") {
        ac.resume().catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  // Always promote the lecturer's video to the main preview for all users
  const promoteLecturerToMain = (room) => {
    if (!room) return;
    let lecturerParticipant = null;
    _iterate(room.participants, (participant) => {
      if (isLecturerParticipant(participant)) {
        lecturerParticipant = participant;
      }
    });
    if (!lecturerParticipant && isLecturerParticipant(room.localParticipant)) {
      lecturerParticipant = room.localParticipant;
    }
    if (!lecturerParticipant) return;
    let videoTrack = null;
    if (lecturerParticipant.videoTracks && typeof lecturerParticipant.videoTracks.forEach === 'function') {
      lecturerParticipant.videoTracks.forEach((pub) => {
        if (pub.track) videoTrack = pub.track;
      });
    } else if (lecturerParticipant.tracks) {
      Object.values(lecturerParticipant.tracks).forEach((pub) => {
        if (pub.track) videoTrack = pub.track;
      });
    }
    if (!videoTrack && lecturerParticipant === room.localParticipant && localTracksRef.current) {
      videoTrack = localTracksRef.current.find((t) => t && t.kind === "video");
    }
    if (videoTrack && localRef.current) {
      localRef.current.innerHTML = "";
      attachTrack(videoTrack, localRef.current, lecturerParticipant.identity || lecturerParticipant.sid || lecturerParticipant.name || "lecturer");
      mainParticipantIdRef.current = lecturerParticipant.identity || lecturerParticipant.sid || lecturerParticipant.name || "lecturer";
    }
  };

  // iterate helper for Map/Array/object
  const _iterate = (iterable, fn) => {
    if (!iterable) return;
    if (typeof iterable.forEach === "function") {
      try {
        iterable.forEach(fn);
      } catch (err) {
        console.warn("iterate.forEach error", err);
      }
      return;
    }
    if (Array.isArray(iterable)) {
      iterable.forEach(fn);
      return;
    }
    if (typeof iterable === "object") {
      Object.values(iterable).forEach(fn);
      return;
    }
  };

  useEffect(() => {
    if (!tokenInfo) return;
    // attempt to ensure audio context (may be suspended if browser blocks autoplay)
    try { ensureAudioContext(); } catch { /* ignore */ }
    // auto-join by default or when tokenInfo.autoJoin is true
    if (!tokenInfo.autoJoin && !userJoined) return;
    let mounted = true;
    let r = null;

    // event handlers references so we can remove them on cleanup
    const handlers = {};

    const connectRoom = async () => {
      try {
        const token =
          tokenInfo.token || tokenInfo.accessToken || tokenInfo.jwt || null;
        const url =
          tokenInfo.url ||
          tokenInfo.wsUrl ||
          (tokenInfo.room &&
            (tokenInfo.room.url ||
              tokenInfo.room.wsUrl ||
              tokenInfo.room.host)) ||
          import.meta.env.VITE_LIVEKIT_URL;
        const roomName =
          tokenInfo.room &&
          (tokenInfo.room.name || tokenInfo.room.room || tokenInfo.room)
            ? tokenInfo.room.name || tokenInfo.room.room || tokenInfo.room
            : undefined;
        if (roomName) setRoomNameState(roomName);
        if (!url || !token) throw new Error("Missing LiveKit URL or token");

        const LK = await import("livekit-client");

        // resolve connect/createLocalTracks across variations
        const connectFn = LK.connect || (LK.default && LK.default.connect);
        const createLocalTracksFn =
          LK.createLocalTracks || (LK.default && LK.default.createLocalTracks);
        const RoomClass = LK.Room || (LK.default && LK.default.Room);
        // construct rtcConfig/iceServers from tokenInfo or env if provided
        let rtcCfg = null;
        try {
          if (tokenInfo && tokenInfo.rtcConfig) rtcCfg = tokenInfo.rtcConfig;
          else if (tokenInfo && tokenInfo.iceServers) rtcCfg = { iceServers: tokenInfo.iceServers };
          else if (import.meta && import.meta.env && import.meta.env.VITE_ICE_SERVERS) {
            try {
              const parsed = JSON.parse(import.meta.env.VITE_ICE_SERVERS);
              if (Array.isArray(parsed)) rtcCfg = { iceServers: parsed };
              else if (parsed && typeof parsed === 'object' && parsed.iceServers) rtcCfg = parsed;
            } catch (e) {
              console.warn('LiveClassroom: VITE_ICE_SERVERS parse failed', e);
            }
          }
        } catch (e) {
          console.warn('LiveClassroom: rtcConfig detection failed', e);
        }

        const connectOptions = { autoSubscribe: true };
        if (rtcCfg) connectOptions.rtcConfig = rtcCfg;
        console.debug('LiveClassroom: connecting with options', connectOptions);

        if (connectFn && typeof connectFn === "function") {
          r = await connectFn(url, token, connectOptions);
        } else if (RoomClass) {
          r = new RoomClass();
          if (typeof r.connect === "function") {
            await r.connect(url, token, connectOptions);
          } else {
            throw new Error("LiveKit Room.connect unavailable");
          }
        } else {
          throw new Error("LiveKit connect not available in imported module");
        }

        if (!mounted) {
          try {
            r.disconnect();
          } catch { /* ignore */}
          return;
        }

        roomRef.current = r;
        setRoom(r);
        // enforce max participants immediately after connecting
        try {
          const partCount = (r && typeof r.participants?.size === 'number')
            ? (r.participants.size + 1)
            : (r && r.participants ? Object.keys(r.participants).length + 1 : 1);
          if (partCount > MAX_PARTICIPANTS) {
            setError(`Room is full (${MAX_PARTICIPANTS} participants max)`);
            try { r.disconnect(); } catch { /* ignore */ };
            setConnected(false);
            roomRef.current = null;
            return;
          }
        } catch { /* ignore */ }
        setConnected(true);
        try {
          const partKeys = r && r.participants && typeof r.participants.keys === 'function'
            ? Array.from(r.participants.keys())
            : Object.keys(r.participants || {});
          console.debug('LiveClassroom: connected to room', { room: r?.name || r?.roomName || r, participants: partKeys });
        } catch (e) { console.debug('LiveClassroom: connected (debug failed)', e); }

        // create local tracks (but only publish if user is a lecturer)
        const isLocalLecturer = isLecturerParticipant({ identity: tokenInfo?.identity, metadata: tokenInfo?.metadata || tokenInfo?.info });
        let tracks = [];
        if (createLocalTracksFn && typeof createLocalTracksFn === "function") {
          try {
            // create tracks for preview; publishing is conditional below
            tracks = await createLocalTracksFn({ audio: true, video: true });
          } catch (err) {
            console.warn("createLocalTracks failed", err);
          }
        }

        // if we didn't get wrapped tracks, try low-level getUserMedia and wrap if necessary
        if ((!tracks || !tracks.length) && navigator.mediaDevices) {
          try {
            const ms = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true,
            });
            const audioTrack = ms.getAudioTracks()[0];
            const videoTrack = ms.getVideoTracks()[0];
            // try to wrap with LocalAudioTrack/LocalVideoTrack if available
            const LocalAudioTrack =
              LK.LocalAudioTrack || (LK.default && LK.default.LocalAudioTrack);
            const LocalVideoTrack =
              LK.LocalVideoTrack || (LK.default && LK.default.LocalVideoTrack);
            if (audioTrack) {
              const at = LocalAudioTrack ? new LocalAudioTrack(audioTrack) : audioTrack;
              tracks.push(at);
            }
            if (videoTrack) {
              const vt = LocalVideoTrack ? new LocalVideoTrack(videoTrack) : videoTrack;
              tracks.push(vt);
            }
          } catch (err) {
            console.warn("navigator.getUserMedia fallback failed", err);
          }
        }

        if (!mounted) {
          tracks.forEach((t) => t.stop && t.stop());
          try {
            r.disconnect();
          } catch { /* ignore */}
          return;
        }

        // store tracks
        localTracksRef.current = tracks || [];
        setLocalTracks([...localTracksRef.current]);
        // attempt to publish local tracks for all participants. If publishing fails
        // (permission or API differences), continue with local preview only.
        try {
          const lp = r.localParticipant;
          if (lp && typeof lp.publishTracks === "function") {
            try {
              await lp.publishTracks(localTracksRef.current);
            } catch (e) {
              console.warn("localParticipant.publishTracks failed", e);
            }
          } else if (lp && typeof lp.publishTrack === "function") {
            for (const t of localTracksRef.current) {
              try {
                await lp.publishTrack(t);
              } catch (e) {
                console.warn("localParticipant.publishTrack single failed", e);
              }
            }
          } else if (typeof r.publishTracks === "function") {
            try {
              await r.publishTracks(localTracksRef.current);
            } catch (e) {
              console.warn("room.publishTracks failed", e);
            }
          } else {
            console.debug("No publish API found; continuing local preview only");
          }
        } catch (pubErr) {
          console.warn("publishTracks attempt failed; continuing local preview", pubErr);
        }

        // attach local video to preview
        const localVideo = localTracksRef.current.find((t) => t && t.kind === "video");
        if (localVideo && localRef.current) {
          localRef.current.innerHTML = "";
          attachTrack(localVideo, localRef.current, "local");
        }

        // helper: ensure there's a participant container element in the participants grid
        const getParticipantContainer = (participant, pid) => {
          if (!remoteRef.current) return null;
          const id = pid || (participant && (participant.identity || participant.sid || participant.name)) || "remote";
          let el = remoteRef.current.querySelector(`[data-participant="${id}"]`);
          if (el) return el;
          el = document.createElement("div");
          el.className = "participant-item bg-black/10 rounded overflow-hidden flex items-center justify-center p-1";
          el.dataset.participant = id;
          const label = document.createElement("div");
          label.className = "participant-label text-xs text-center text-gray-600 absolute top-0 left-0 p-1";
          label.style.pointerEvents = "none";
          label.textContent = (participant && (participant.name || participant.identity)) || id;
          // placeholder shown when no video is attached
          const placeholder = document.createElement('div');
          placeholder.className = 'participant-placeholder flex flex-col items-center justify-center text-gray-500 w-full h-full';
          placeholder.style.pointerEvents = 'none';
          const name = document.createElement('div');
          name.className = 'text-sm mt-1';
          name.textContent = label.textContent;
          // use inline SVG user icon (inherits currentColor)
          const userSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
          placeholder.innerHTML = userSvg;
          placeholder.appendChild(name);
          el.style.position = "relative";
          el.appendChild(label);
          el.appendChild(placeholder);
          remoteRef.current.appendChild(el);
          return el;
        };

        // render only students in the participants section
        const renderParticipant = (participant) => {
          try {
            const id = participant.identity || participant.sid || participant.name || "remote";
            const looksLikeLecturer = isLecturerParticipant(participant);
            if (!looksLikeLecturer) {
              const container = getParticipantContainer(participant, id);
              const tryCollections = [participant.videoTracks, participant.tracks, participant.publications, participant.tracks || participant.trackPublications];
              for (const col of tryCollections) {
                _iterate(col, (publicationOrTrack) => {
                  try {
                    const publication = publicationOrTrack;
                    const track = publicationOrTrack.track || publicationOrTrack;
                    if (!track) {
                      // try subscribing to publication if available
                      try {
                        if (publication && typeof publication.subscribe === "function") {
                          publication.subscribe()
                            .then((subTrack) => {
                              if (!subTrack || !container) return;
                              try { attachTrack(subTrack, container, id); } catch { /* ignore */ }
                            })
                            .catch((sErr) => console.warn("publication.subscribe failed", sErr));
                          return;
                        }
                      } catch (sErr) {
                        console.warn("subscribe attempt error", sErr);
                      }
                      return;
                    }
                    if (!container) return;
                    try {
                      // if this track appears to be a screen share, promote to main preview
                      if (isScreenShareTrack(publicationOrTrack) || isScreenShareTrack(track)) {
                        try {
                          if (localRef.current) {
                            localRef.current.innerHTML = "";
                            attachTrack(track, localRef.current, id);
                            mainParticipantIdRef.current = id;
                          }
                        } catch (pmErr) {
                          console.warn('promote screen share to main failed', pmErr);
                        }
                        return;
                      }
                      attachTrack(track, container, id);
                    } catch (err) { console.warn("attach track to container failed", err); }
                  } catch (err) {
                    console.warn("renderParticipant inner error", err);
                  }
                });
              }
              // if no video/media element attached, ensure placeholder visible
              try {
                if (container && !container.querySelector('video') && !container.querySelector('.participant-placeholder')) {
                  const label = container.querySelector('.participant-label');
                  const placeholder = document.createElement('div');
                  placeholder.className = 'participant-placeholder flex flex-col items-center justify-center text-gray-500 w-full h-full';
                  placeholder.style.pointerEvents = 'none';
                  const name = document.createElement('div');
                  name.className = 'text-sm mt-1';
                  name.textContent = (label && label.textContent) || id;
                  const userSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  placeholder.innerHTML = userSvg;
                  placeholder.appendChild(name);
                  container.appendChild(placeholder);
                }
              } catch { /* ignore */ }
            }
          } catch (err) {
            console.warn("renderParticipant error", err);
          }
        };

        // mark whether local user is a lecturer so handlers can behave accordingly
        try { isLocalLecturerRef.current = isLecturerParticipant({ identity: tokenInfo?.identity, metadata: tokenInfo?.metadata || tokenInfo?.info }); } catch { /* ignore */ }

        _iterate(r.participants, renderParticipant);
        // Always promote lecturer to main preview for all
        promoteLecturerToMain(r);

        // event handlers (store references to remove later)
        handlers.partConnected = (participant) => {
          try { console.debug("participantConnected", participant.identity || participant.sid, participant); } catch { /* ignore */ };
          try {
            // if room already at capacity, ignore rendering this new participant
            const currentCount = (r && typeof r.participants?.size === 'number')
              ? (r.participants.size + 1)
              : (r && r.participants ? Object.keys(r.participants).length + 1 : 1);
            if (currentCount > MAX_PARTICIPANTS) {
              console.warn('participantConnected: room at capacity, ignoring participant', participant.identity || participant.sid || participant.name);
              return;
            }
            const pid = participant.identity || participant.sid || participant.name || 'remote';
            if (remoteRef.current) {
              const existing = remoteRef.current.querySelector(`[data-participant="${pid}"]`);
              if (!existing) getParticipantContainer(participant, pid);
            }
          } catch (e) { console.warn('participantConnected container create failed', e); }
          renderParticipant(participant);
          // Always promote lecturer to main preview
          promoteLecturerToMain(roomRef.current);
        };

        handlers.partDisconnected = (participant) => {
          // remove any elements for this participant
          try { console.debug("participantDisconnected", participant.identity || participant.sid); } catch { /* ignore */ }
          if (!remoteRef.current) return;
          const id = participant.identity || participant.sid;
          const els = Array.from(
            remoteRef.current.querySelectorAll(`[data-participant="${id}"]`)
          );
          els.forEach((e) => e.remove());
          // if the disconnected participant was promoted to main, revert to local preview
          const mainId = mainParticipantIdRef.current;
          if (mainId && (mainId === id)) {
            // clear main preview and reattach local video if available
            try {
              if (localRef.current) localRef.current.innerHTML = "";
              const localVideo = localTracksRef.current && localTracksRef.current.find((t) => t && t.kind === "video");
              if (localVideo && localRef.current) {
                attachTrack(localVideo, localRef.current, "local");
                mainParticipantIdRef.current = "local";
              }
            } catch (err) {
              console.warn("revert main to local failed", err);
            }
          }
        };

        handlers.trackSubscribed = (track, publication, participant) => {
          try { console.debug("trackSubscribed", { participant: participant?.identity || participant?.sid, kind: track?.kind, track, publication }); } catch { /* ignore */ }
          if (!track || !participant) return;
          // If lecturer, always promote to main preview
          if (track.kind === "video" && isLecturerParticipant(participant)) {
            promoteLecturerToMain(roomRef.current);
            return;
          }
          // Otherwise, only attach student videos to participants section
          if (!remoteRef.current) return;
          const pid = participant.identity || participant.sid || participant.name || "remote";
          const container = remoteRef.current.querySelector(`[data-participant="${pid}"]`) || (function(){
            const el = document.createElement("div");
            el.dataset.participant = pid;
            el.className = "participant-item bg-black/10 rounded overflow-hidden flex items-center justify-center p-1";
            const label = document.createElement("div");
            label.className = "participant-label text-xs text-center text-gray-600 absolute top-0 left-0 p-1";
            label.style.pointerEvents = "none";
            label.textContent = participant.name || participant.identity || pid;
            el.style.position = "relative";
            el.appendChild(label);
            remoteRef.current.appendChild(el);
            return el;
          })();
          if (!isLecturerParticipant(participant)) {
            attachTrack(track, container, pid);
          }
        };

        handlers.trackUnsubscribed = (track, publication, participant) => {
          // remove attached elements for this track if possible
          try { console.debug("trackUnsubscribed", { participant: participant?.identity || participant?.sid, kind: track?.kind, publication }); } catch { /* ignore */ }
          if (!remoteRef.current || !participant) return;
          const id = participant.identity || participant.sid || participant.name || 'remote';
          const els = Array.from(
            remoteRef.current.querySelectorAll(`[data-participant="${id}"]`)
          );
          // Instead of removing the whole container, clear media elements and show placeholder
          els.forEach((e) => {
            try {
              // remove any video/audio/media elements
              const medias = e.querySelectorAll('video, audio, canvas, img');
              medias.forEach((m) => m.remove());
              // ensure placeholder exists
              if (!e.querySelector('.participant-placeholder')) {
                const label = e.querySelector('.participant-label');
                const placeholder = document.createElement('div');
                placeholder.className = 'participant-placeholder flex flex-col items-center justify-center text-gray-500 w-full h-full';
                placeholder.style.pointerEvents = 'none';
                const name = document.createElement('div');
                name.className = 'text-sm mt-1';
                name.textContent = (label && label.textContent) || id;
                const userSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                placeholder.innerHTML = userSvg;
                placeholder.appendChild(name);
                e.appendChild(placeholder);
              }
            } catch {
              try { e.remove(); } catch { /* ignore */ };
            }
          });
          // if track belonged to promoted main participant and it's unsubscribed, revert main to local
          const mainId = mainParticipantIdRef.current;
          if (mainId && (mainId === id)) {
            try {
              if (localRef.current) localRef.current.innerHTML = "";
              const localVideo = localTracksRef.current && localTracksRef.current.find((t) => t && t.kind === "video");
              if (localVideo && localRef.current) {
                attachTrack(localVideo, localRef.current, "local");
                mainParticipantIdRef.current = "local";
              }
            } catch (err) {
              console.warn("revert main to local on unsubscribed failed", err);
            }
          }
        };

        r.on("participantConnected", handlers.partConnected);
        r.on("participantDisconnected", handlers.partDisconnected);
        r.on("trackSubscribed", handlers.trackSubscribed);
        r.on("trackUnsubscribed", handlers.trackUnsubscribed);
        // connection state changes: log and attempt reconnects with backoff
        try {
          handlers.connState = (state) => {
            try { console.debug('LiveClassroom connectionStateChanged', state); } catch { /* ignore */ }
            if (!mounted) return;
            if (state === 'connected') {
              reconnectAttemptsRef.current = 0;
              setError('');
            }
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              setError(`Connection ${state}. Attempting reconnect...`);
              // schedule reconnect with exponential backoff
              if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                const attempt = ++reconnectAttemptsRef.current;
                const delay = RECONNECT_BASE_MS * Math.pow(2, attempt - 1);
                try { if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current); } catch { /* ignore */ }
                reconnectTimerRef.current = setTimeout(() => {
                  try {
                    console.debug('LiveClassroom: reconnect attempt', attempt);
                    // attempt to cleanup previous room first
                    try { if (roomRef.current && typeof roomRef.current.disconnect === 'function') roomRef.current.disconnect(); } catch { /* ignore */ }
                    connectRoom();
                  } catch (e) { console.warn('reconnect attempt failed', e); }
                }, delay);
              } else {
                setError('Unable to reconnect after several attempts');
              }
            }
          };
          if (typeof r.on === 'function') r.on('connectionStateChanged', handlers.connState);
        } catch { /* ignore */ }
      } catch (e) {
        console.error("LiveClassroom connect error", e);
        setError(e?.message || "Failed to connect to live classroom");
      }
    };

    connectRoom();

    // cleanup
    return () => {
      mounted = false;
      try {
        // remove listeners
        if (r && typeof r.off === "function") {
          try {
            if (handlers.partConnected) r.off("participantConnected", handlers.partConnected);
            if (handlers.partDisconnected) r.off("participantDisconnected", handlers.partDisconnected);
            if (handlers.trackSubscribed) r.off("trackSubscribed", handlers.trackSubscribed);
            if (handlers.trackUnsubscribed) r.off("trackUnsubscribed", handlers.trackUnsubscribed);
              if (handlers.connState) r.off("connectionStateChanged", handlers.connState);
          } catch { /* ignore */}
        }

        // stop local tracks
        const lt = localTracksRef.current;
        if (lt && lt.length) {
          lt.forEach((t) => {
            try {
              if (typeof t.stop === "function") t.stop();
              if (t.mediaStreamTrack && typeof t.mediaStreamTrack.stop === "function")
                t.mediaStreamTrack.stop();
            } catch (err) {
              console.warn("track stop error", err);
            }
          });
        }

        // stop any screen stream stored on localRef
        try {
          if (localRef.current && localRef.current.__screenStream) {
            localRef.current.__screenStream.getTracks().forEach((t) => {
              try {
                t.stop();
              } catch { /* ignore */}
            });
          }
        } catch { /* ignore */}

        if (r) {
          try {
            r.disconnect();
          } catch {
            /* ignore */
          }
        }
        try { if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current); } catch { /* ignore */ }
      } catch (e) {
        console.warn("cleanup error", e);
      } finally {
        roomRef.current = null;
      }
    };
  }, [tokenInfo, userJoined]);

  // helpers to read and set enabled flags from various track shapes
  function getTrackEnabled(track) {
    if (!track) return undefined;
    try {
      if (typeof track.isEnabled === "boolean") return track.isEnabled;
      if (typeof track.enabled === "boolean") return track.enabled;
      if (typeof track.isMuted === "boolean") return !track.isMuted;
      if (track.mediaStreamTrack && typeof track.mediaStreamTrack.enabled === "boolean")
        return track.mediaStreamTrack.enabled;
      if (typeof track.getEnabled === "function") {
        return !!track.getEnabled();
      }
    } catch (err) {
      console.warn("getTrackEnabled error", err);
    }
    return undefined;
  }

  function setTrackEnabled(track, enabled) {
    if (!track) return false;
    try {
      if (typeof track.setEnabled === "function") {
        track.setEnabled(enabled);
        return true;
      }
      if (typeof track.enable === "function") {
        track.enable(enabled);
        return true;
      }
      if (typeof track.setMuted === "function") {
        // setMuted expects boolean muted -> inverse of enabled
        try {
          track.setMuted(!enabled);
          return true;
        } catch { /* ignore */}
      }
      if ("enabled" in track && typeof track.enabled === "boolean") {
        track.enabled = enabled;
        return true;
      }
      if (track.mediaStreamTrack && "enabled" in track.mediaStreamTrack) {
        track.mediaStreamTrack.enabled = enabled;
        return true;
      }
    } catch (err) {
      console.warn("setTrackEnabled error", err);
    }
    return false;
  }

  // helper to publish a track using the available API
  const publishTrack = async (track) => {
    if (!track) return false;
    const r = roomRef.current;
    try {
      if (r && r.localParticipant) {
        const lp = r.localParticipant;
        if (typeof lp.publishTrack === "function") {
          await lp.publishTrack(track);
          return true;
        }
        if (typeof lp.publishTracks === "function") {
          await lp.publishTracks([track]);
          return true;
        }
      }
      if (r && typeof r.publishTracks === "function") {
        await r.publishTracks([track]);
        return true;
      }
    } catch (err) {
      console.warn("publishTrack helper error", err);
    }
    return false;
  };

  const unpublishTrack = async (track) => {
    if (!track) return false;
    const r = roomRef.current;
    try {
      if (r && r.localParticipant) {
        const lp = r.localParticipant;
        if (typeof lp.unpublishTrack === "function") {
          try {
            lp.unpublishTrack(track);
          } catch (err) {
            console.warn("unpublishTrack attempt failed", err);
          }
          return true;
        }
      }
      // some older builds might have Room.unpublishTracks
      if (r && typeof r.unpublishTracks === "function") {
        try {
          r.unpublishTracks([track]);
        } catch (err) {
          console.warn("room.unpublishTracks attempt failed", err);
        }
        return true;
      }
    } catch (err) {
      console.warn("unpublishTrack helper error", err);
    }
    return false;
  };

  // toggle audio: intelligent across API shapes
  const toggleAudio = async () => {
    try {
      // find audio in ref-backed list
      let audio = localTracksRef.current.find((t) => t && t.kind === "audio");
      const backup = localRef.current && localRef.current.__audioBackup;

      // if no audio and we want to enable -> create & publish
      if (!audio) {
        // create new audio track
        try {
          const LK = await import("livekit-client");
          const createLocalTracksFn =
            LK.createLocalTracks || (LK.default && LK.default.createLocalTracks);
          let newTracks = [];
          if (createLocalTracksFn && typeof createLocalTracksFn === "function") {
            newTracks = await createLocalTracksFn({ audio: true });
          } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
            const at = ms.getAudioTracks()[0];
            const LocalAudioTrack =
              LK.LocalAudioTrack || (LK.default && LK.default.LocalAudioTrack);
            newTracks = at ? [LocalAudioTrack ? new LocalAudioTrack(at) : at] : [];
          }
          if (newTracks && newTracks.length) {
            const newAudio = newTracks.find((t) => t.kind === "audio") || newTracks[0];
            if (newAudio) {
              await publishTrack(newAudio);
              localTracksRef.current.push(newAudio);
              setLocalTracks([...localTracksRef.current]);
              if (localRef.current && !localRef.current.querySelector('[data-participant="local"]')) {
                try {
                  localRef.current.innerHTML = "";
                  attachTrack(newAudio, localRef.current, "local");
                } catch { /* ignore */}
              }
              return true;
            }
          }
        } catch (err) {
          console.warn("toggleAudio create/publish failed", err);
        }
        // if create/publish failed but backup exists, try publish backup
        if (backup) {
          try {
            await publishTrack(backup);
            localTracksRef.current.push(backup);
            setLocalTracks([...localTracksRef.current]);
            delete localRef.current.__audioBackup;
            return true;
          } catch (err) {
            console.warn("toggleAudio republish backup failed", err);
          }
        }
        return false;
      }

      // audio exists: toggle enabled (prefer setEnabled)
      const current = getTrackEnabled(audio);
      const desired = typeof current === "boolean" ? !current : true;

      // if disabling and unpublish API exists, unpublish to stop upstream
      if (!desired) {
        const didUnpublish = await unpublishTrack(audio);
        // keep backup so we can re-publish later
        try {
          if (didUnpublish && localRef.current) {
            localRef.current.__audioBackup = audio;
            // remove from localTracksRef
            localTracksRef.current = localTracksRef.current.filter((t) => t !== audio);
            setLocalTracks([...localTracksRef.current]);
            // try to stop media capture so OS microphone indicator off if possible
            if (audio && typeof audio.stop === "function") audio.stop();
            if (audio && audio.mediaStreamTrack && typeof audio.mediaStreamTrack.stop === "function")
              audio.mediaStreamTrack.stop();
            return true;
          }
        } catch (err) {
          console.warn("toggleAudio unpublish cleanup failed", err);
        }
      } else {
        // enabling: if we have a backup, publish it
        if (backup) {
          try {
            const published = await publishTrack(backup);
            if (published) {
              localTracksRef.current.push(backup);
              setLocalTracks([...localTracksRef.current]);
              delete localRef.current.__audioBackup;
              return true;
            }
          } catch (err) {
            console.warn("toggleAudio republish backup failed", err);
          }
        }
      }

      // fallback: try setEnabled/enable on the track
      const ok = setTrackEnabled(audio, desired);
      if (!ok) console.warn("toggleAudio: unable to change audio track state");
      // ensure state reflects ref
      setLocalTracks([...localTracksRef.current]);
      return !!ok;
    } catch (e) {
      console.warn("toggleAudio error", e);
      return false;
    }
  };

  // toggle video/camera
  const toggleVideo = async () => {
    try {
      let video =
        (localTracksRef.current && localTracksRef.current.find((t) => t && t.kind === "video")) ||
        localTracks.find((t) => t && t.kind === "video"); // fallback
      const backup = localRef.current && localRef.current.__cameraBackup;

      // if no video -> try to create/publish new camera track
      if (!video) {
        try {
          const LK = await import("livekit-client");
          const createLocalTracksFn =
            LK.createLocalTracks || (LK.default && LK.default.createLocalTracks);
          let newTracks = [];
          if (createLocalTracksFn && typeof createLocalTracksFn === "function") {
            newTracks = await createLocalTracksFn({ video: true });
          } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const ms = await navigator.mediaDevices.getUserMedia({ video: true });
            const t = ms.getVideoTracks()[0];
            const LocalVideoTrack =
              LK.LocalVideoTrack || (LK.default && LK.default.LocalVideoTrack);
            if (t) newTracks = [LocalVideoTrack ? new LocalVideoTrack(t) : t];
          }
          if (newTracks && newTracks.length) {
            const newVideo = newTracks.find((t) => t.kind === "video") || newTracks[0];
            if (newVideo) {
              await publishTrack(newVideo);
              localTracksRef.current.push(newVideo);
              setLocalTracks([...localTracksRef.current]);
              if (localRef.current) {
                localRef.current.innerHTML = "";
                try {
                  attachTrack(newVideo, localRef.current, "local");
                } catch { /* ignore */}
              }
              return true;
            }
          }
        } catch (err) {
          console.warn("failed to create/publish new camera track", err);
        }
        return false;
      }

      // toggle existing
      const current = getTrackEnabled(video);
      const desired = typeof current === "boolean" ? !current : true;

      if (!desired) {
        // attempt to unpublish to stop upstream sending and stop capture
        const didUnpublish = await unpublishTrack(video);
        if (didUnpublish) {
          if (localRef.current) localRef.current.__cameraBackup = video;
          localTracksRef.current = localTracksRef.current.filter((t) => t !== video);
          setLocalTracks([...localTracksRef.current]);

          // detach preview elements if possible
          try {
            if (typeof video.detach === "function") {
              const els = video.detach();
              if (Array.isArray(els)) els.forEach((e) => e.remove());
            } else if (localRef.current) {
              localRef.current.innerHTML = "";
            }
          } catch (dErr) {
            console.warn("error detaching video elements", dErr);
            if (localRef.current) localRef.current.innerHTML = "";
          }

          // try to stop the underlying media capture
          try {
            if (video && typeof video.stop === "function") {
              video.stop();
            } else if (video && video.mediaStreamTrack && typeof video.mediaStreamTrack.stop === "function") {
              video.mediaStreamTrack.stop();
            }
          } catch (stopErr) {
            console.warn("error stopping video track", stopErr);
          }

          return true;
        }
      } else {
        // enabling: if we have a backup and it's not ended try republish
        if (backup) {
          try {
            const isStopped =
              (backup.mediaStreamTrack && backup.mediaStreamTrack.readyState === "ended") ||
              (typeof backup.isStopped === "boolean" && backup.isStopped === true);
            if (!isStopped) {
              try {
                await publishTrack(backup);
                localTracksRef.current.push(backup);
                setLocalTracks([...localTracksRef.current]);
                // attach preview
                if (localRef.current) {
                  localRef.current.innerHTML = "";
                  try {
                    attachTrack(backup, localRef.current, "local");
                  } catch { /* ignore */}
                }
                delete localRef.current.__cameraBackup;
                return true;
              } catch (err) {
                console.warn("republish camera backup failed", err);
              }
            }
          } catch (err) {
            console.warn("error checking backup", err);
          }

          // backup stopped: continue to recreate new camera track below
        }

        // fallback recreation of camera track
        try {
          const LK = await import("livekit-client");
          const createLocalTracksFn =
            LK.createLocalTracks || (LK.default && LK.default.createLocalTracks);
          let newTracks = [];
          if (createLocalTracksFn && typeof createLocalTracksFn === "function") {
            newTracks = await createLocalTracksFn({ video: true });
          } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const ms = await navigator.mediaDevices.getUserMedia({ video: true });
            const t = ms.getVideoTracks()[0];
            const LocalVideoTrack =
              LK.LocalVideoTrack || (LK.default && LK.default.LocalVideoTrack);
            if (t) newTracks = [LocalVideoTrack ? new LocalVideoTrack(t) : t];
          }

          if (newTracks && newTracks.length) {
            const newVideo = newTracks.find((t) => t.kind === "video") || newTracks[0];
            if (newVideo) {
              await publishTrack(newVideo);
              localTracksRef.current.push(newVideo);
              setLocalTracks([...localTracksRef.current]);
              if (localRef.current) {
                localRef.current.innerHTML = "";
                try {
                  attachTrack(newVideo, localRef.current, "local");
                } catch { /* ignore */}
              }
              return true;
            }
          }
        } catch (err) {
          console.warn("error recreating/publishing camera track", err);
        }
      }

      // fallback: toggle enabled flag
      const ok = setTrackEnabled(video, desired);
      if (!ok) console.warn("toggleVideo: unable to change video track state");
      setLocalTracks([...localTracksRef.current]);
      return !!ok;
    } catch (e) {
      console.warn("toggleVideo error", e);
      return false;
    }
  };

  // screenshare helpers
  const startScreenShare = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia)
        throw new Error("Screen sharing not supported");
      const ms = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const [videoTrack] = ms.getVideoTracks();
      if (!videoTrack) throw new Error("No screen track obtained");

      // create preview for screen share
      if (localRef.current) {
        localRef.current.innerHTML = "";
        const v = document.createElement("video");
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.srcObject = ms;
        v.style.width = "100%";
        v.style.height = "100%";
        localRef.current.appendChild(v);
      }

      // attempt to publish via LiveKit APIs
      try {
        const LK = await import("livekit-client");
        const LocalVideoTrack = LK.LocalVideoTrack || (LK.default && LK.default.LocalVideoTrack);
        const r = roomRef.current;
        if (r && r.localParticipant) {
          // unpublish existing camera track so remote sees screen instead
          try {
            const existingVideo = localTracksRef.current.find((t) => t && t.kind === "video");
            if (existingVideo && typeof r.localParticipant.unpublishTrack === "function") {
              try {
                r.localParticipant.unpublishTrack(existingVideo);
              } catch { /* ignore */}
              if (localRef.current) localRef.current.__cameraBackup = existingVideo;
              localTracksRef.current = localTracksRef.current.filter((t) => t !== existingVideo);
            }
          } catch (innerErr) {
            console.warn("screen-share unpublish existing camera failed", innerErr);
          }

          // wrap MediaStreamTrack if wrapper available
          if (LocalVideoTrack) {
            const lvt = new LocalVideoTrack(videoTrack);
            try {
              await publishTrack(lvt);
              localRef.current.__screenLocalTrack = lvt;
              localTracksRef.current.push(lvt);
              setLocalTracks([...localTracksRef.current]);
            } catch (err) {
              console.warn("publishing wrapped screen track failed", err);
            }
          } else {
            try {
              await publishTrack(videoTrack);
              localRef.current.__screenLocalTrack = videoTrack;
              // note: not adding to localTracksRef for raw track in some SDKs, but we add for consistency
              localTracksRef.current.push(videoTrack);
              setLocalTracks([...localTracksRef.current]);
            } catch (err) {
              console.warn("publishing raw screen track failed", err);
            }
          }
        }
      } catch (err) {
        console.warn("screen-share publish attempt failed", err);
      }

      // store screen stream for stop
      if (localRef.current) localRef.current.__screenStream = ms;
      return true;
    } catch (e) {
      console.warn("startScreenShare error", e);
      return false;
    }
  };

  const stopScreenShare = async () => {
    try {
      if (localRef.current && localRef.current.__screenStream) {
        try {
          localRef.current.__screenStream.getTracks().forEach((t) => t.stop());
        } catch { /* ignore */}
        delete localRef.current.__screenStream;
      }

      // unpublish screen-local track and re-publish camera backup
      try {
        const screenTrack = localRef.current && localRef.current.__screenLocalTrack;
        if (screenTrack && roomRef.current && roomRef.current.localParticipant && typeof roomRef.current.localParticipant.unpublishTrack === "function") {
          try { roomRef.current.localParticipant.unpublishTrack(screenTrack); } catch { /* ignore */}
        }
        try { if (screenTrack && typeof screenTrack.stop === "function") screenTrack.stop(); } catch { /* ignore */}
        delete localRef.current.__screenLocalTrack;

        const cam = localRef.current && localRef.current.__cameraBackup;
        if (cam && roomRef.current && roomRef.current.localParticipant) {
          try {
            await publishTrack(cam);
            localTracksRef.current.push(cam);
            setLocalTracks([...localTracksRef.current]);
          } catch (repErr) {
            console.warn("failed to republish camera backup", repErr);
          }
          delete localRef.current.__cameraBackup;
        } else {
          // fallback: attach any available current video track to preview
          const video = localTracksRef.current.find((t) => t && t.kind === "video");
          if (video && localRef.current) {
            localRef.current.innerHTML = "";
            try {
              attachTrack(video, localRef.current, "local");
            } catch { /* ignore */}
          }
        }
      } catch (e) {
        console.warn("stopScreenShare restore error", e);
      }
      return true;
    } catch (e) {
      console.warn("stopScreenShare error", e);
      return false;
    }
  };

  // exposed API for parent via ref
  useImperativeHandle(ref, () => ({
    toggleAudio: async () => await toggleAudio(),
    toggleVideo: async () => await toggleVideo(),
    startScreenShare: async () => await startScreenShare(),
    stopScreenShare: async () => await stopScreenShare(),
    // return true if audio enabled, false if disabled, undefined if unknown
    isAudioEnabled: () => {
      const audio = localTracksRef.current.find((t) => t && t.kind === "audio");
      if (!audio) {
        // if we have a backup, it's currently disabled; else unknown
        const backup = localRef.current && localRef.current.__audioBackup;
        return backup ? false : undefined;
      }
      return getTrackEnabled(audio);
    },
    isVideoEnabled: () => {
      const video = localTracksRef.current.find((t) => t && t.kind === "video");
      if (!video) {
        const backup = localRef.current && localRef.current.__cameraBackup;
        return backup ? false : undefined;
      }
      return getTrackEnabled(video);
    },
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          Live Classroom {roomNameState ? `— ${roomNameState}` : ""}
        </div>
        <div className="flex gap-2">
          {/* auto-join enabled: no Join button shown */}
          <button
            onClick={() => {
              // local UI preview toggle: call toggleAudio (does the heavy lifting)
              toggleAudio();
            }}
            className="px-3 py-1 rounded border"
          >
            {getTrackEnabled(localTracks.find((t) => t && t.kind === "audio"))
              ? "Mute"
              : "Unmute"}
          </button>
          <button
            onClick={() => {
              toggleVideo();
            }}
            className="px-3 py-1 rounded border"
          >
            {getTrackEnabled(localTracks.find((t) => t && t.kind === "video"))
              ? "Stop Video"
              : "Start Video"}
          </button>
        </div>
      </div>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="font-semibold mb-2">Local preview</div>
          <div
            ref={localRef}
            className="w-full h-48 bg-black/5 rounded overflow-hidden flex items-center justify-center"
          ></div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow p-3">
          <div className="font-semibold mb-2">Participants</div>
          <div
            ref={remoteRef}
            className="w-full h-64 bg-black/5 rounded overflow-auto grid grid-cols-2 gap-2 p-2"
          />
        </div>
      </div>
    </div>
  );
});

export default LiveClassroom;
