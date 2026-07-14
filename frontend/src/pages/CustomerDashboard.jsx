import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Camera, ShieldCheck, Download, Star, MessageSquare, Send, Calendar, MapPin, Receipt, Clock, Image } from 'lucide-react';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const chatEndRef = useRef(null);

    // Review state
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [hasReviewed, setHasReviewed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [msgSending, setMsgSending] = useState(false);

    // Poll chats interval
    const pollInterval = useRef(null);

    useEffect(() => {
        fetchBookings();
        return () => clearInterval(pollInterval.current);
    }, []);

    useEffect(() => {
        if (selectedBooking) {
            fetchChatHistory();
            checkIfReviewed();
            // Start polling notifications
            clearInterval(pollInterval.current);
            pollInterval.current = setInterval(fetchChatHistory, 5000);
        } else {
            clearInterval(pollInterval.current);
        }
    }, [selectedBooking]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/bookings/customer');
            setBookings(res.data);
            if (res.data.length > 0) {
                setSelectedBooking(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchChatHistory = async () => {
        if (!selectedBooking) return;
        try {
            const res = await axios.get(`/api/chats/booking/${selectedBooking.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error fetching chats", err);
        }
    };

    const checkIfReviewed = async () => {
        setHasReviewed(false);
        // Simple verification check by looking at rating responses or similar
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || msgSending) return;
        setMsgSending(true);

        try {
            const res = await axios.post(`/api/chats/booking/${selectedBooking.id}`, {
                content: newMsg
            });
            setMessages([...messages, res.data]);
            setNewMsg('');
        } catch (err) {
            console.error(err);
        } finally {
            setMsgSending(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!window.confirm("Mark this project as completed?")) return;
        try {
            const res = await axios.post(`/api/bookings/${selectedBooking.id}/complete`);
            setSelectedBooking(res.data);
            // update booking list
            setBookings(bookings.map(b => b.id === res.data.id ? res.data : b));
        } catch (err) {
            alert("Error complete");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/bookings/${selectedBooking.id}/reviews`, {
                rating,
                comment: reviewComment,
                imagesUrl: ''
            });
            setHasReviewed(true);
            alert("Review submitted successfully! Thank you.");
        } catch (err) {
            alert(err.response?.data?.message || "Already reviewed or error submitting.");
        }
    };

    // Status mapping to color
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
            case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'CREATOR_ASSIGNED': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
            case 'CREATOR_ACCEPTED': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
            case 'SHOOT_STARTED': return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
            case 'EDITING': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            case 'DELIVERED': return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
            case 'COMPLETED': return 'bg-green-500/20 text-green-400 border border-green-500/30';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Bookings list (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="text-purple-400" size={20} />
                        <span>My Bookings</span>
                    </h2>
                    <span className="text-xs text-gray-500">{bookings.length} Orders</span>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500 text-xs">Loading orders...</div>
                ) : bookings.length === 0 ? (
                    <div className="glass-effect p-8 rounded-2xl text-center space-y-4">
                        <p className="text-gray-500 text-xs">No bookings found. Kickstart your business goals today!</p>
                        <a href="/book" className="inline-block py-2 px-4 gradient-btn text-xs font-semibold rounded-lg">Book Service Now</a>
                    </div>
                ) : (
                    <div className="space-y-4 h-[600px] overflow-y-auto pr-2">
                        {bookings.map((b) => (
                            <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                className={`p-5 rounded-2xl cursor-pointer border transition-all ${selectedBooking?.id === b.id ? 'bg-brand-card/85 border-purple-500/40 shadow-glow' : 'glass-effect border-white/5 hover:border-white/10 hover:bg-slate-900/20'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] text-gray-500 font-semibold font-mono">#{b.id}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full ${getStatusColor(b.status)}`}>
                                        {b.status.replace("_", " ")}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm text-white leading-tight mb-1">{b.servicePackage.serviceName}</h4>
                                <p className="text-[11px] text-purple-400 mb-2 font-medium">{b.servicePackage.name} Package</p>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>${b.amount}</span>
                                    <span>{b.shootDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT: Active Booking Details, Tracker and Chat (8 Cols) */}
            <div className="lg:col-span-8">
                {selectedBooking ? (
                    <div className="space-y-8">
                        {/* 1. Header Information Panel */}
                        <div className="glass-effect p-6 rounded-3xl relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Order details: #{selectedBooking.id}</span>
                                    <h3 className="text-xl font-bold mt-1 text-white">{selectedBooking.servicePackage.serviceName} - {selectedBooking.servicePackage.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`/api/bookings/invoice/${selectedBooking.id}`}
                                        target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-md"
                                    >
                                        <Receipt size={14} />
                                        Invoice
                                    </a>
                                    {selectedBooking.status === 'DELIVERED' && (
                                        <button
                                            onClick={handleCompleteOrder}
                                            className="py-1.5 px-3 bg-green-650 hover:bg-green-600 border border-green-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md"
                                        >
                                            Complete & Unlock files
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-gray-500 block font-medium">Scheduler Shoot</span>
                                    <div className="font-semibold text-gray-200 flex items-center gap-1"><Calendar size={13} /> {selectedBooking.shootDate}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-500 block font-medium">Shoot Timing</span>
                                    <div className="font-semibold text-gray-200 flex items-center gap-1"><Clock size={13} /> {selectedBooking.shootTime}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-500 block font-medium">Work Location</span>
                                    <div className="font-semibold text-gray-200 flex items-center gap-1"><MapPin size={13} /> {selectedBooking.location}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-500 block font-medium">Assigned Creator</span>
                                    <div className="font-semibold text-purple-400 flex items-center gap-1">
                                        <Camera size={13} />
                                        {selectedBooking.creator ? selectedBooking.creator.name : "Awaiting Assignment"}
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-400 max-w-2xl leading-relaxed">
                                <strong>Goals & Directives:</strong> {selectedBooking.requirements}
                            </div>
                        </div>

                        {/* 2. Download Deliverables (If Completed) */}
                        {selectedBooking.status === 'COMPLETED' && selectedBooking.deliverablesUrl && (
                            <div className="p-6 bg-green-950/30 border border-green-800/40 rounded-3xl flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white">Production Deliverables Ready</h4>
                                    <p className="text-[11px] text-green-400 leading-normal">Your high-resolution assets have been uploaded. Download links are active.</p>
                                </div>
                                <a
                                    href={selectedBooking.deliverablesUrl}
                                    target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 py-2.5 px-5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow"
                                >
                                    <Download size={14} />
                                    Download Archive (.ZIP)
                                </a>
                            </div>
                        )}

                        {/* 3. Review Box (If editing, delivered, or completed) */}
                        {(selectedBooking.status === 'COMPLETED' || selectedBooking.status === 'DELIVERED') && !hasReviewed && (
                            <div className="glass-effect p-6 rounded-3xl">
                                <h4 className="text-base font-bold mb-4 flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-current" /> Share Your Experience</h4>
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-400 pr-2">Rating Score:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star} type="button"
                                                onClick={() => setRating(star)}
                                                className={`text-lg transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-500' : 'text-gray-700'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 mb-2">Review Comment</span>
                                        <textarea
                                            rows="2" required
                                            value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Comment on communication quality, pacing, gear alignment..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="py-2 px-5 gradient-btn rounded-xl text-xs font-semibold shadow-md">
                                        Submit Creator Review
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* 4. Chat Workspace Panel */}
                        <div className="glass-effect rounded-3xl flex flex-col h-[420px] overflow-hidden border border-white/5">
                            {/* Chat Title */}
                            <div className="px-6 py-4 bg-brand-card/90 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-650 flex items-center justify-center font-bold text-xs uppercase text-white">
                                        {selectedBooking.creator ? selectedBooking.creator.name.charAt(0) : 'A'}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold">{selectedBooking.creator ? selectedBooking.creator.name : 'System Admin'}</h4>
                                        <p className="text-[10px] text-gray-500">Live chat for shoot coordination</p>
                                    </div>
                                </div>
                                <MessageSquare className="text-gray-500" size={18} />
                            </div>

                            {/* Chat history */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-10 text-xs text-gray-500">
                                        No messages yet. Send a note to coordinate schedule timings or references.
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.sender.id === user.id;
                                        return (
                                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 rounded-2xl text-xs ${isMe ? 'bg-purple-650 text-white rounded-tr-none' : 'bg-black/35 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                                                    <div className="font-semibold text-[10px] opacity-60 mb-1">{m.sender.name}</div>
                                                    <p>{m.content}</p>
                                                    <span className="block text-[8px] text-right mt-1 opacity-55">
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Message inputs */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-950/20 flex gap-2">
                                <input
                                    type="text"
                                    value={newMsg}
                                    onChange={(e) => setNewMsg(e.target.value)}
                                    placeholder="Type message details here..."
                                    className="flex-grow bg-black/45 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={msgSending}
                                    className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all disabled:opacity-50"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-xs text-gray-500">
                        Select a booking from the sidebar to view active pipeline details.
                    </div>
                )}
            </div>
        </div>
    );
}
