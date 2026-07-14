import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, X, CheckCheck, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationsDrawer() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const drawerRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        // Poll every 15 seconds
        pollRef.current = setInterval(fetchNotifications, 15000);
        return () => clearInterval(pollRef.current);
    }, [user]);

    // Close drawer on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (err) {
            // Silently ignore — user may not be logged in
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.post(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000); // minutes
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={drawerRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 notification-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Drawer Panel */}
            {open && (
                <div className="absolute right-0 top-10 w-80 sm:w-96 z-50 animate-fade-in">
                    <div className="glass-effect rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 bg-brand-card/90 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">{unreadCount} unread</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                    >
                                        <CheckCheck size={12} />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-10 text-xs text-gray-500">
                                    <Bell className="mx-auto mb-2 text-gray-700" size={24} />
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read && handleMarkRead(n.id)}
                                        className={`px-5 py-4 cursor-pointer transition-colors ${!n.read ? 'bg-purple-950/10 hover:bg-purple-950/20' : 'hover:bg-white/3'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 shrink-0">
                                                {!n.read
                                                    ? <Circle className="text-purple-400 fill-purple-400" size={8} />
                                                    : <Circle className="text-gray-700" size={8} />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold leading-snug ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <span className="text-[9px] text-gray-600 mt-1 block">
                                                    {formatTime(n.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
