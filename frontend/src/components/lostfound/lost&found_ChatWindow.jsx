import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';

const socket = io('http://localhost:5000');

const ChatWindow = ({ isOpen, onClose, conversation, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    useEffect(() => {
        if (!conversation) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const res = await axios.get(`http://localhost:5000/api/lostfound/messages/${conversation._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);

                // Instantly notify server this conversation is now read
                await axios.put(`http://localhost:5000/api/lostfound/messages/read/${conversation._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        socket.emit("join_conversation", conversation._id);

        const messageHandler = (msg) => {
            if (msg.conversationId === conversation._id) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("receive_message", messageHandler);

        return () => {
            socket.off("receive_message", messageHandler);
        };
    }, [conversation]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const receiverId = conversation.members.find(m => m._id !== currentUser._id)?._id;
        
        const messageData = {
            conversationId: conversation._id,
            senderId: currentUser._id,
            receiverId,
            text: newMessage
        };

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.post('http://localhost:5000/api/lostfound/messages', messageData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            socket.emit("send_message", res.data);
            setMessages((prev) => [...prev, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Transmission Blocked',
                text: 'Failed to broadcast message to the Nexus network. Check connection.',
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    if (!isOpen || !conversation) return null;

    const currentUserId = currentUser?._id || currentUser?.id;
    const otherUser = conversation.members.find(m => m._id !== currentUserId && m._id?.toString() !== currentUserId?.toString());

    return (
        <div className="fixed inset-y-0 right-0 z-[110] w-[340px] pt-[4.5rem] bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col text-left border-l border-unihub-border">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-unihub-teal/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-unihub-teal flex items-center justify-center text-white shadow-lg">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-unihub-text tracking-tighter uppercase leading-none">
                            {otherUser?.name || 'Nexus User'}
                        </h3>
                        <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">
                            Chat • {conversation.itemId?.title || 'System Ref'}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                    <X className="w-5 h-5 text-unihub-textMuted" />
                </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#fdfdfd]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-unihub-teal animate-spin opacity-20" />
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((m) => (
                        <div key={m._id} className={`flex flex-col ${(m.senderId === currentUserId || m.senderId?.toString() === currentUserId?.toString()) ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold shadow-sm leading-relaxed ${
                                (m.senderId === currentUserId || m.senderId?.toString() === currentUserId?.toString()) 
                                    ? 'bg-unihub-teal text-white rounded-br-none shadow-unihub-teal/10' 
                                    : 'bg-white border border-unihub-border text-unihub-text rounded-bl-none'
                            }`}>
                                {m.text}
                            </div>
                            <span className="text-[8px] font-black text-unihub-textMuted uppercase tracking-widest mt-2 px-1">
                                {(m.senderId === currentUserId || m.senderId?.toString() === currentUserId?.toString()) ? 'YOU' : otherUser?.name?.split(' ')[0]} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                        <MessageSquare className="w-12 h-12" />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-loose">No previous telemetry found.<br/>Initiate secure communication below.</p>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-gray-50 shadow-2xl">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="PROTOCOL SECURE: TYPE MESSAGE..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 pl-6 pr-14 py-4 rounded-xl outline-none font-black text-unihub-text text-[10px] uppercase tracking-widest transition-all focus:border-unihub-teal/30 focus:bg-white shadow-inner"
                    />
                    <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-unihub-teal text-white shadow-xl hover:bg-unihub-tealHover transition-all active:scale-90">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
