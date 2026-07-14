import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Compass, DollarSign, Award, CheckCircle, Video, Play, Check, Send, Upload, ShieldAlert, Image, Plus, Trash2 } from 'lucide-react';

export default function CreatorDashboard() {
    const { user, setUser } = useAuth();

    // Dashboard lists and details
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Earnings
    const [earnings, setEarnings] = useState({
        walletBalance: 0.0,
        totalEarnings: 0.0,
        completedProjects: 0,
        rating: 5.0
    });

    // Chat/Coordination
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const chatEndRef = useRef(null);
    const pollInterval = useRef(null);

    // Portfolio items
    const [portfolio, setPortfolio] = useState([]);
    const [itemTitle, setItemTitle] = useState('');
    const [itemType, setItemType] = useState('Photography');
    const [itemUrl, setItemUrl] = useState('');

    // Editor deliverables URL
    const [deliverablesUrl, setDeliverablesUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [msgSending, setMsgSending] = useState(false);
    const [errorHeader, setErrorHeader] = useState('');

    useEffect(() => {
        fetchCreatorData();
        pollInterval.current = setInterval(fetchCreatorData, 10000);
        return () => {
            clearInterval(pollInterval.current);
        };
    }, []);

    useEffect(() => {
        if (selectedBooking) {
            fetchChatHistory();
            const interval = setInterval(fetchChatHistory, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedBooking]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchCreatorData = async () => {
        try {
            const bRes = await axios.get('/api/bookings/creator');
            setBookings(bRes.data);
            if (bRes.data.length > 0 && !selectedBooking) {
                setSelectedBooking(bRes.data[0]);
            }

            const eRes = await axios.get('/api/creators/earnings');
            setEarnings(eRes.data);

            const pRes = await axios.get('/api/creators/portfolio');
            setPortfolio(pRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchChatHistory = async () => {
        if (!selectedBooking) return;
        try {
            const res = await axios.get(`/api/chats/booking/${selectedBooking.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptBooking = async () => {
        try {
            const res = await axios.post(`/api/bookings/${selectedBooking.id}/accept`);
            setSelectedBooking(res.data);
            setBookings(bookings.map(b => b.id === res.data.id ? res.data : b));
            alert("Booking Accepted! You can now chat directly with the customer.");
        } catch (err) {
            alert("Error accepting booking");
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            const res = await axios.post(`/api/bookings/${selectedBooking.id}/status`, { status });
            setSelectedBooking(res.data);
            setBookings(bookings.map(b => b.id === res.data.id ? res.data : b));
        } catch (err) {
            alert("Status update failed");
        }
    };

    const handleDeliverWork = async (e) => {
        e.preventDefault();
        if (!deliverablesUrl.trim()) return;

        try {
            const res = await axios.post(`/api/bookings/${selectedBooking.id}/deliver`, {
                deliverablesUrl
            });
            setSelectedBooking(res.data);
            setBookings(bookings.map(b => b.id === res.data.id ? res.data : b));
            setDeliverablesUrl('');
            alert("Files delivered successfully! Client has been notified.");
        } catch (err) {
            alert("Error delivering files");
        }
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

    // Portfolio actions
    const handleAddPortfolio = async (e) => {
        e.preventDefault();
        if (!itemTitle.trim() || !itemUrl.trim()) return;

        try {
            const res = await axios.post('/api/creators/portfolio', {
                title: itemTitle,
                type: itemType,
                imageUrl: itemUrl
            });
            setPortfolio([res.data, ...portfolio]);
            setItemTitle('');
            setItemUrl('');
            alert("Portfolio item saved!");
        } catch (err) {
            alert("Error saving item");
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm("Remove item?")) return;
        try {
            await axios.delete(`/api/creators/portfolio/${id}`);
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    // Status mapping
    const getStatusAction = (booking) => {
        if (booking.status === 'CREATOR_ASSIGNED') {
            return (
                <button
                    onClick={handleAcceptBooking}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all shadow-glow"
                >
                    Accept Invitation
                </button>
            );
        }
        if (booking.status === 'CREATOR_ACCEPTED') {
            return (
                <button
                    onClick={() => handleUpdateStatus('SHOOT_STARTED')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all"
                >
                    Confirm Shoot Started
                </button>
            );
        }
        if (booking.status === 'SHOOT_STARTED') {
            return (
                <button
                    onClick={() => handleUpdateStatus('EDITING')}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-xs font-bold transition-all"
                >
                    Start Editing Phase
                </button>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* 1. Wallet & Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="glass-effect p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Unpaid Wallet Balance</span>
                        <h3 className="text-2xl font-extrabold mt-1 text-white">${earnings.walletBalance.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-950/40 rounded-2xl border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="glass-effect p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Total Earnings</span>
                        <h3 className="text-2xl font-extrabold mt-1 text-white">${earnings.totalEarnings.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-950/40 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="glass-effect p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Completed Projects</span>
                        <h3 className="text-2xl font-extrabold mt-1 text-white">{earnings.completedProjects}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-950/40 rounded-2xl border border-green-500/20 flex items-center justify-center text-green-400">
                        <Award size={24} />
                    </div>
                </div>

                <div className="glass-effect p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Platform Rating</span>
                        <h3 className="text-2xl font-extrabold mt-1 text-white">{earnings.rating.toFixed(1)} ★</h3>
                    </div>
                    <div className="w-12 h-12 bg-pink-950/40 rounded-2xl border border-pink-500/20 flex items-center justify-center text-pink-400">
                        <Compass size={24} />
                    </div>
                </div>
            </div>

            {/* 2. Main Workspaces */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left list: Bookings pipeline (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-1.5 mb-2">
                        <Compass className="text-purple-400" size={18} />
                        <span>Assigned Projects</span>
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="glass-effect p-8 rounded-2xl text-center text-xs text-gray-500">
                            No assigned projects yet. Complete register profile details to start receiving bookings.
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {bookings.map((b) => (
                                <div
                                    key={b.id}
                                    onClick={() => setSelectedBooking(b)}
                                    className={`p-5 rounded-2xl cursor-pointer border transition-all ${selectedBooking?.id === b.id ? 'bg-brand-card/85 border-purple-500/40' : 'glass-effect border-white/5 hover:border-white/10 hover:bg-slate-900/10'}`}
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] text-gray-500 font-semibold font-mono">#{b.id}</span>
                                        <span className="text-[10px] font-bold text-purple-400 bg-purple-950/30 py-0.5 px-2 rounded-full uppercase border border-purple-500/20">{b.status.replace("_", " ")}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-white mb-1">{b.servicePackage.serviceName}</h4>
                                    <p className="text-[11px] text-gray-400">{b.shootDate} at {b.shootTime}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right workspace: Details & coordination chat (8 cols) */}
                <div className="lg:col-span-8">
                    {selectedBooking ? (
                        <div className="space-y-6">

                            {/* Top details block */}
                            <div className="glass-effect p-6 rounded-3xl relative">
                                <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Project Coordination</span>
                                        <h3 className="text-xl font-bold mt-1 text-white">{selectedBooking.servicePackage.serviceName} - {selectedBooking.servicePackage.name}</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">Client: <strong className="text-white">{selectedBooking.customer.name}</strong></span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-6">
                                    <div>
                                        <span className="text-gray-500 block">Shoot location:</span>
                                        <span className="font-semibold text-gray-300">{selectedBooking.location}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Schedule:</span>
                                        <span className="font-semibold text-gray-300">{selectedBooking.shootDate} ({selectedBooking.shootTime})</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Payout Reward:</span>
                                        <span className="font-bold text-purple-400">${selectedBooking.amount}</span>
                                    </div>
                                </div>

                                {/* Status Trigger Callouts */}
                                <div className="space-y-4">
                                    {getStatusAction(selectedBooking)}

                                    {/* Upload deliverables form */}
                                    {(selectedBooking.status === 'EDITING' || selectedBooking.status === 'DELIVERED') && (
                                        <form onSubmit={handleDeliverWork} className="border-t border-purple-500/20 pt-4 mt-4 space-y-3">
                                            <label className="block text-xs font-bold text-purple-400">Deliver Production Files (Google Drive, Dropbox, Cloudinary link)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url" required
                                                    value={deliverablesUrl} onChange={(e) => setDeliverablesUrl(e.target.value)}
                                                    placeholder="e.g. https://drive.google.com/drive/folders/..."
                                                    className="flex-grow bg-black/45 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                                                />
                                                <button type="submit" className="py-2.5 px-4 bg-green-650 hover:bg-green-600 border border-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                                                    <Upload size={14} /> Deliver
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Chat Coordination */}
                            <div className="glass-effect rounded-3xl flex flex-col h-[350px] overflow-hidden border border-white/5">
                                <div className="px-6 py-3 bg-brand-card/90 border-b border-white/5 flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-300">Coordination Chat Thread</span>
                                    <span className="text-[10px] text-gray-500">#{selectedBooking.id} &bull; Client</span>
                                </div>

                                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8 text-xs text-gray-500">
                                            No chat messages. Begin coordination.
                                        </div>
                                    ) : (
                                        messages.map((m) => {
                                            const isMe = m.sender.id === user.id;
                                            return (
                                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${isMe ? 'bg-purple-650 text-white rounded-tr-none' : 'bg-black/35 border border-white/10 text-gray-350 rounded-tl-none'}`}>
                                                        <div className="font-semibold text-[9px] opacity-60 mb-0.5">{m.sender.name}</div>
                                                        <p>{m.content}</p>
                                                        <span className="block text-[7px] text-right mt-1 opacity-55">
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-slate-950/20 flex gap-2">
                                    <input
                                        type="text"
                                        value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                                        placeholder="Coordinate with the customer..."
                                        className="flex-grow bg-black/45 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-650 focus:outline-none"
                                    />
                                    <button type="submit" disabled={msgSending} className="p-2 bg-purple-650 text-white rounded-lg">
                                        <Send size={13} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-xs text-gray-500">
                            Select project pipeline to begin.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Portfolio Manager Section */}
            <div className="mt-12 border-t border-white/5 pt-12">
                <h2 className="text-xl font-bold flex items-center gap-1.5 mb-6">
                    <Award className="text-purple-400" size={20} />
                    <span>My Profile Portfolio Items</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add item form (4 cols) */}
                    <div className="lg:col-span-4 glass-effect p-6 rounded-3xl self-start">
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-1"><Plus size={16} /> Upload New Asset</h4>
                        <form onSubmit={handleAddPortfolio} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2">Item Title</label>
                                <input
                                    type="text" required
                                    value={itemTitle} onChange={(e) => setItemTitle(e.target.value)}
                                    placeholder="e.g. Lifestyle Apparel Shoot"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2">Category Type</label>
                                <select
                                    value={itemType} onChange={(e) => setItemType(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="Photography">Photography</option>
                                    <option value="Videography">Videography</option>
                                    <option value="Drone Shoot">Drone Shoot</option>
                                    <option value="Product Shoot">Product Shoot</option>
                                    <option value="Event Coverage">Event Coverage</option>
                                    <option value="Video Editing">Video Editing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2">Image/Media URL</label>
                                <input
                                    type="url" required
                                    value={itemUrl} onChange={(e) => setItemUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <button type="submit" className="w-full py-2.5 gradient-btn rounded-xl text-xs font-semibold">
                                Submit Asset to Portfolio
                            </button>
                        </form>
                    </div>

                    {/* List items (8 cols) */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {portfolio.map((p) => (
                            <div key={p.id} className="relative rounded-2xl overflow-hidden group aspect-video bg-black max-w-full">
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-4">
                                    <span className="text-[9px] text-purple-400 font-bold uppercase">{p.type}</span>
                                    <h5 className="text-xs font-bold text-white mt-1 leading-tight">{p.title}</h5>
                                    <button
                                        onClick={() => handleDeletePortfolio(p.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
