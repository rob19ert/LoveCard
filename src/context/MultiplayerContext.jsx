import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { joinRoom } from 'trystero/torrent';
import { v4 as uuidv4 } from 'uuid';

const MultiplayerContext = createContext(null);

export function MultiplayerProvider({ children }) {
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [peerId, setPeerId] = useState(null);
  
  const [sharedState, setSharedState] = useState(null);
  const [sendUpdateFn, setSendUpdateFn] = useState(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [sendChatFn, setSendChatFn] = useState(null);

  const roomRef = useRef(null);

  const connectToRoom = useCallback((id, host = false) => {
    if (roomRef.current) {
      roomRef.current.leave();
    }
    const config = { appId: 'deeptalk-lovecard-v1' };
    const newRoom = joinRoom(config, id);
    roomRef.current = newRoom;
    
    setRoomId(id);
    setIsHost(host);
    setPeerId(null);
    setSharedState(null);
    setChatMessages([]);
    
    newRoom.onPeerJoin((id) => {
      console.log('Peer joined', id);
      setPeerId(id);
    });
    
    newRoom.onPeerLeave((id) => {
      console.log('Peer left', id);
      setPeerId(null);
    });
    
    const [sendUpdate, getUpdate] = newRoom.makeAction('update');
    setSendUpdateFn(() => sendUpdate);
    
    getUpdate((data, peerId) => {
      setSharedState(data);
    });

    const [sendChat, getChat] = newRoom.makeAction('chat');
    setSendChatFn(() => sendChat);

    getChat((data, peerId) => {
      setChatMessages(prev => [...prev, { ...data, sender: 'peer' }]);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      connectToRoom(roomParam, false);
    }
    
    // Cleanup on unmount
    return () => {
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
    };
  }, [connectToRoom]);

  // Handle late reconnects: send the current shared state to the new peer if we are the host
  useEffect(() => {
    if (isHost && peerId && sharedState && sendUpdateFn) {
      sendUpdateFn(sharedState);
    }
  }, [isHost, peerId]); // Note: only trigger on peerId change to avoid spamming

  const createRoom = () => {
    const newId = uuidv4().slice(0, 8);
    connectToRoom(newId, true);
    // Replace URL without reloading
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('room', newId);
    window.history.replaceState({}, '', newUrl);
    return newId;
  };

  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    window.location.href = window.location.pathname; // Hard reset to leave and clear URL
  };

  const broadcastState = useCallback((state) => {
    if (sendUpdateFn) {
      sendUpdateFn(state);
    }
  }, [sendUpdateFn]);

  const sendChatMessage = useCallback((text, questionId) => {
    const msg = { text, questionId, timestamp: Date.now() };
    if (sendChatFn) {
      sendChatFn(msg);
    }
    setChatMessages(prev => [...prev, { ...msg, sender: 'me' }]);
  }, [sendChatFn]);

  return (
    <MultiplayerContext.Provider value={{
      roomId,
      isHost,
      peerId,
      sharedState,
      createRoom,
      leaveRoom,
      broadcastState,
      setSharedState,
      chatMessages,
      sendChatMessage,
      setChatMessages
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
}
