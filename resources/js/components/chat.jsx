import { useState, useEffect, useRef } from "react";

export default function Chat({ gameId, gameSlug, playerId }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    
    function csrfToken() {
        return document.querySelector('meta[name="csrf-token"]').content;
    }
    
    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if (!gameId) return;
        
        const channel = window.Echo.private(`game.${gameId}`);
        
        channel.listen("MessageSent", (event) => {
            // Only add if from another player — sender already added it immediately
            if (event.message?.user?.id !== playerId) {
                setMessages(prev => [...prev, event.message]);
                setUnread(prev => prev + 1);
            }
        });
        
        return () => {
            channel.stopListening("MessageSent");
        };
    }, [gameId, playerId]);
    
    useEffect(() => {
        if (!gameSlug) return;
        
        fetch(`/game/${gameSlug}/messages`, {
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            credentials: 'include',
        })
        .then(res => {
            if (!res.ok) throw new Error(`Messages fetch failed: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setMessages(data);
            } else {
                console.warn('Messages response was not an array:', data);
                setMessages([]);
            }
        })
        .catch(err => {
            console.error('Failed to load messages:', err);
            setMessages([]);
        });
    }, [gameSlug]);
    
    function sendMessage() {
        if (!input.trim()) return;
        
        fetch(`/game/${gameSlug}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
            },
            credentials: "include",
            body: JSON.stringify({ body: input }),
        })
        .then(res => {
            if (!res.ok) throw new Error(`Send failed: ${res.status}`);
            return res.json();
        })
        .then(message => {
            if (message && message.body) {
                // Sender adds immediately — receiver gets it via broadcast
                setMessages(prev => [...prev, message]);
            }
            setInput("");
        })
        .catch(err => console.error('Failed to send message:', err));
    }
    
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    function formatTime(timestamp) {
        try {
            return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }
    
    return (
        <>
        <button className="chat-toggle" onClick={() => { setOpen(prev => !prev); setUnread(0); }}>
        💬
        {unread > 0 && <span className="unread-badge">{unread}</span>}
        </button>
        
        <div className={`chat-sidebar ${open ? 'open' : ''}`}>
        <div className="chat-header">
        <span className="chat-title">Game Chat</span>
        <button className="chat-close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>✕</button>
        </div>
        
        <div className="chat-messages">
        {messages.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
            No messages yet
            </p>
        )}
        {messages.map((msg, i) => (
            msg?.type === 'system' ? (
                <div key={i} className="chat-system-message">
    ⚡ <span dangerouslySetInnerHTML={{ __html: msg.body }} />
</div>
            ) : (
                <div key={i} className={`chat-message ${msg?.user?.id === playerId ? 'own' : ''}`}>
                <span className="chat-message-user">
                {msg?.user?.username ?? 'Unknown'}
                </span>
                <div className="chat-message-body">{msg?.body}</div>
                <span className="chat-message-time">
                {formatTime(msg?.created_at)}
                </span>
                </div>
            )
        ))}
        <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-area">
        <input
        className="chat-input"
        type="text"
        placeholder="Type a message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={500}
        />
        <button className="chat-send" onClick={sendMessage}>▶</button>
        </div>
        </div>
        </>
    );
}