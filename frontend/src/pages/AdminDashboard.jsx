
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Compass, DollarSign, Calendar, ShieldCheck, Check, Clipboard, BarChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// React-charts configurations
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [pendingCreators, setPendingCreators] = useState([]);
    const [approvedCreators, setApprovedCreators] = useState([]);
    const [bookings, setBookings] = useState([]);

    // Assignment selections
    const [assignCreatorId, setAssignCreatorId] = useState({});

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // 1. Load Analytics Statistics
            const aRes = await axios.get('/api/admin/analytics');
            setAnalytics(aRes.data);

            // 2. Load Pending Creators
            const pcRes = await axios.get('/api/admin/creators/pending');
            setPendingCreators(pcRes.data);

            // 3. Load Bookings pipeline
            const bRes = await axios.get('/api/admin/bookings');
            setBookings(bRes.data);

            // 4. Load Approved Creators (to assign them)
            const acRes = await axios.get('/api/creators/public');
            setApprovedCreators(acRes.data);
        } catch (err) {
            console.error("Error loading admin configurations", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCreator = async (creatorId) => {
        try {
            await axios.post(`/api/admin/creators/${creatorId}/approve`);
            alert("Creator profile approved successfully!");
            fetchAdminData(); // refresh
        } catch (err) {
            alert("Approval action failed.");
        }
    };

    const handleAssignCreator = async (bookingId) => {
        const creatorId = assignCreatorId[bookingId];
        if (!creatorId) {
            alert("Please select a creator to assign first.");
            return;
        }

        try {
            await axios.post(`/api/admin/bookings/${bookingId}/assign`, {
                creatorId: parseInt(creatorId)
            });
            alert("Creator assigned successfully!");
            fetchAdminData();
        } catch (err) {
            alert("Assignment action failed.");
        }
    };

    const handleCreatorSelectChange = (bookingId, creatorId) => {
        setAssignCreatorId({
            ...assignCreatorId,
            [bookingId]: creatorId
        });
    };

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    // Chart data setup
    const chartData = {
        labels: analytics.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: 'Gross Revenue Volume ($)',
                data: analytics.monthlyRevenue || [12000, 19000, 32000, 5000, 24000, 48000, 62000],
                borderColor: 'rgb(124, 58, 237)',
                backgroundColor: 'rgba(124, 58, 237, 0.5)',
                tension: 0.3
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'white' }
            }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'gray' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'gray' } }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="text-purple-400" size={24} />
                    <span>Admin Executive Workspace</span>
                </h2>
                <p className="text-gray-400 text-xs mt-1">Platform metrics, vetting queues, and creator assignments</p>
            </div>

            {/* 1. Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
                {[
                    { label: "Gross Revenue", val: `$${analytics.totalRevenue}`, icon: DollarSign, color: "text-green-400" },
                    { label: "Bookings Volume", val: analytics.totalBookings, icon: Calendar, color: "text-blue-400" },
                    { label: "Awaiting Action", val: analytics.pendingBookings, icon: Shield, color: "text-orange-400" },
                    { label: "Successful Shoots", val: analytics.completedProjects, icon: ShieldCheck, color: "text-purple-400" },
                    { label: "Business Clients", val: analytics.totalCustomers, icon: Users, color: "text-teal-400" },
                    { label: "Vetted Creators", val: analytics.totalCreators, icon: Compass, color: "text-pink-400" }
                ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="glass-effect p-5 rounded-2xl">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{card.label}</span>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xl font-extrabold ${card.color}`}>{card.val}</span>
                                <Icon size={18} className="text-gray-600" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. Charts & Service Popularity mapping */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Chart (8 cols) */}
                <div className="lg:col-span-8 glass-effect p-6 rounded-3xl">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <BarChart size={16} /> Revenue Growth & Sales Chart
                    </h3>
                    <div className="h-64 sm:h-80 flex items-center justify-center">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Popular categorization services (4 cols) */}
                <div className="lg:col-span-4 glass-effect p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 mb-6">Popular Category Distribution</h3>
                        <div className="space-y-4">
                            {Object.entries(analytics.popularServices || {}).map(([service, count]) => (
                                <div key={service} className="space-y-1 text-xs">
                                    <div className="flex justify-between font-semibold">
                                        <span>{service}</span>
                                        <span className="text-purple-400">{count} Bookings</span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                                        <div className="bg-purple-500 h-1.5" style={{ width: `${Math.min(100, (count * 15))}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(analytics.popularServices || {}).length === 0 && (
                                <div className="text-center text-xs text-gray-500 py-10">No categories booked.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Creator Verification Queue */}
            <div className="glass-effect p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-1.5">
                    <Users className="text-purple-400" size={18} />
                    <span>Creator Verification Pipeline ({pendingCreators.length} candidates)</span>
                </h3>

                {pendingCreators.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-6">All creator applications have been successfully vetted.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-500">
                                    <th className="pb-3">Candidate</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3">Location</th>
                                    <th className="pb-3">Hourly Rate</th>
                                    <th className="pb-3">Gear Specs</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingCreators.map((pc) => (
                                    <tr key={pc.id} className="hover:bg-slate-950/10">
                                        <td className="py-3 font-semibold text-white">{pc.user.name}<span className="block text-[10px] text-gray-500 font-mono">{pc.user.email}</span></td>
                                        <td className="py-3">{pc.specialization}</td>
                                        <td className="py-3">{pc.location}</td>
                                        <td className="py-3 font-mono">${pc.hourlyRate}/Hr</td>
                                        <td className="py-3 max-w-xs truncate" title={pc.equipment}>{pc.equipment}</td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => handleApproveCreator(pc.id)}
                                                className="py-1 px-3 bg-purple-650 hover:bg-purple-600 rounded-lg text-[10px] font-bold text-white transition-all shadow-md"
                                            >
                                                Approve Candidate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 4. Bookings & Creator Manual Assignment Table */}
            <div className="glass-effect p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-1.5">
                    <Calendar className="text-blue-400" size={18} />
                    <span>Active Operations & Creator Assignments</span>
                </h3>

                {bookings.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-6">No bookings generated.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-gray-500">
                                    <th className="pb-3">Order ID</th>
                                    <th className="pb-3">Client</th>
                                    <th className="pb-3">Service & Package</th>
                                    <th className="pb-3">Shoot Schedule</th>
                                    <th className="pb-3">Payment status</th>
                                    <th className="pb-3">Creator Match</th>
                                    <th className="pb-3 text-right">Operations Assignment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-950/10">
                                        <td className="py-3 font-mono">#{b.id}</td>
                                        <td className="py-3 font-semibold text-white">{b.customer.name}</td>
                                        <td className="py-3 font-medium">{b.servicePackage.serviceName} - {b.servicePackage.name}</td>
                                        <td className="py-3">{b.shootDate} ({b.shootTime})</td>
                                        <td className="py-3 font-semibold text-green-400">{b.paymentStatus}</td>
                                        <td className="py-3">
                                            {b.creator ? (
                                                <span className="text-purple-400 font-semibold">{b.creator.name}</span>
                                            ) : (
                                                <span className="text-orange-450 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">
                                            {b.status === 'CONFIRMED' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <select
                                                        value={assignCreatorId[b.id] || ''}
                                                        onChange={(e) => handleCreatorSelectChange(b.id, e.target.value)}
                                                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                                                    >
                                                        <option value="">Choose Vetted Creator...</option>
                                                        {approvedCreators
                                                            .filter(c => c.specialization.toLowerCase() === b.servicePackage.serviceName.toLowerCase())
                                                            .map(c => (
                                                                <option key={c.id} value={c.user.id}>{c.user.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <button
                                                        onClick={() => handleAssignCreator(b.id)}
                                                        className="py-1 px-2.5 bg-blue-650 hover:bg-blue-600 rounded-lg text-[10px] font-bold text-white transition-all shadow-md flex items-center gap-0.5"
                                                    >
                                                        <Check size={11} /> Match
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-sans">
                                                    {b.status.replace("_", " ")}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
