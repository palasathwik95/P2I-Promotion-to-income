import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Calendar, Clock, MapPin, Clipboard, Image, ShieldAlert, CheckCircle, CreditCard, ChevronRight, Check } from 'lucide-react';

export default function BookingPage() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Checkout flow state
    const [step, setStep] = useState(1);
    const [selectedPkg, setSelectedPkg] = useState(null);

    const [shootDate, setShootDate] = useState('');
    const [shootTime, setShootTime] = useState('');
    const [location, setLocation] = useState('');
    const [requirements, setRequirements] = useState('');
    const [referenceImages, setReferenceImages] = useState('');

    // Payment inputs
    const [cardNo, setCardNo] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const [bookingId, setBookingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorHeader, setErrorHeader] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPackages();
        fetchCategories();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await axios.get('/api/services/public/packages');
            setPackages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/services/public/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPkg(pkg);
        setStep(2);
    };

    const handleBookingDetailsSubmit = async (e) => {
        e.preventDefault();
        setErrorHeader('');
        setLoading(true);

        try {
            const payload = {
                packageId: selectedPkg.id,
                shootDate,
                shootTime,
                location,
                requirements,
                referenceImages
            };

            const res = await axios.post('/api/bookings', payload);
            setBookingId(res.data.id);
            setStep(3); // Proceed to paying
        } catch (err) {
            setErrorHeader(err.response?.data?.message || 'Error creating booking session. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setErrorHeader('');
        setLoading(true);

        try {
            // Confirm payment with mock payment id
            const payRes = await axios.post(`/api/bookings/${bookingId}/pay`, {
                cardNo, // strictly for mock verification, not saved
                paymentStatus: 'PAID'
            });

            setSuccess("Booking paid and confirmed! Standard invoice has been generated.");
            setStep(4);
        } catch (err) {
            setErrorHeader(err.response?.data?.message || 'Payment simulation failed.');
        } finally {
            setLoading(false);
        }
    };

    const filteredPkgs = packages.filter(p => !selectedCategory || p.serviceName === selectedCategory);

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-4 mb-12">
                {[
                    { num: 1, label: "Choose Package" },
                    { num: 2, label: "Schedule Shoot" },
                    { num: 3, label: "Secure Payment" },
                    { num: 4, label: "Confirmation" }
                ].map((s) => (
                    <div key={s.num} className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === s.num ? 'bg-purple-600 text-white' : step > s.num ? 'bg-green-600 text-white' : 'bg-slate-900 border border-white/10 text-gray-500'}`}>
                            {step > s.num ? <Check size={14} /> : s.num}
                        </div>
                        <span className={`text-xs font-semibold hidden md:inline ${step === s.num ? 'text-white' : 'text-gray-500'}`}>{s.label}</span>
                        {s.num < 4 && <ChevronRight className="text-gray-700 hidden md:block" size={14} />}
                    </div>
                ))}
            </div>

            {errorHeader && (
                <div className="mb-8 p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex items-center gap-2 max-w-xl mx-auto">
                    <ShieldAlert size={16} />
                    <span>{errorHeader}</span>
                </div>
            )}

            {/* STEP 1: Select Service Package */}
            {step === 1 && (
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Select Service Package</h2>
                            <p className="text-gray-400 text-xs mt-1">Pick a curated production packages that fits your promotion requirements</p>
                        </div>

                        {/* Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-brand-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="">All Services</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredPkgs.map((pkg) => (
                            <div key={pkg.id} className="glass-effect p-6 rounded-3xl flex flex-col justify-between hover:border-purple-500/20 hover:bg-slate-900/40 transition-all group">
                                <div>
                                    <span className="text-[10px] tracking-wider uppercase font-bold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full">{pkg.serviceName}</span>
                                    <h3 className="text-xl font-bold mt-4 mb-2">{pkg.name}</h3>
                                    <div className="text-3xl font-extrabold text-white mb-4">${pkg.price}</div>
                                    <p className="text-gray-400 text-xs mb-6 max-w-xs">{pkg.description}</p>
                                </div>

                                <button
                                    onClick={() => handleSelectPackage(pkg)}
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all"
                                >
                                    Choose Package
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: Shoot Booking Details Form */}
            {step === 2 && selectedPkg && (
                <div className="max-w-xl mx-auto glass-effect p-8 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-2">Schedule Shoot details</h2>
                    <p className="text-gray-400 text-xs mb-6">Package: <strong className="text-purple-400">{selectedPkg.serviceName} - {selectedPkg.name}</strong> (${selectedPkg.price})</p>

                    <form onSubmit={handleBookingDetailsSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Shoot Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="date" required
                                        value={shootDate} onChange={(e) => setShootDate(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Shoot Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="time" required
                                        value={shootTime} onChange={(e) => setShootTime(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Location (Precise address or city)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text" required
                                    value={location} onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. MG Road Studio, Bangalore"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Creative Requirements & Directives</label>
                            <div className="relative">
                                <Clipboard className="absolute left-3 top-3 text-gray-500" size={16} />
                                <textarea
                                    rows="3" required
                                    value={requirements} onChange={(e) => setRequirements(e.target.value)}
                                    placeholder="Describe your goals, branding guidelines, models list, video duration..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                ></textarea>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Reference Mood board Images (Cloud URLs, comma-split)</label>
                            <div className="relative">
                                <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={referenceImages} onChange={(e) => setReferenceImages(e.target.value)}
                                    placeholder="https://drive.google.com/..., https://unsplash.com/..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-white/5"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-2/3 py-3 gradient-btn rounded-xl text-xs font-bold transition-all shadow-glow"
                            >
                                {loading ? "Creating booking..." : "Proceed to Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* STEP 3: Payment Section (Razorpay Simulation) */}
            {step === 3 && selectedPkg && bookingId && (
                <div className="max-w-xl mx-auto glass-effect p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <h2 className="text-2xl font-bold">Secure checkout</h2>
                        <CreditCard className="text-purple-400" size={24} />
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-6 text-xs text-gray-300">
                        <div className="flex justify-between mb-2">
                            <span>Service:</span>
                            <span className="font-semibold text-white">{selectedPkg.serviceName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Package Tier:</span>
                            <span className="font-semibold text-white">{selectedPkg.name}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/5 text-sm font-bold text-white">
                            <span>Total Price:</span>
                            <span className="text-purple-400">${selectedPkg.price}</span>
                        </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Card Holder Name</label>
                            <input
                                type="text" required placeholder="John Doe"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-450 mb-2">Dummy Card Number (16-Digit)</label>
                            <input
                                type="text" required
                                maxLength="16" minLength="16"
                                value={cardNo} onChange={(e) => setCardNo(e.target.value)}
                                placeholder="4111 2222 3333 4444"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Expiry Date</label>
                                <input
                                    type="text" required placeholder="MM/YY"
                                    value={expiry} onChange={(e) => setExpiry(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">CVV Security Code</label>
                                <input
                                    type="text" required maxLength="3" minLength="3"
                                    value={cvv} onChange={(e) => setCvv(e.target.value)}
                                    placeholder="123"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 gradient-btn rounded-xl text-xs font-bold transition-all shadow-glow flex items-center justify-center gap-1.5"
                        >
                            {loading ? "Simulating Payment..." : `Authorize Payment of $${selectedPkg.price}`}
                        </button>

                        <span className="text-[10px] text-gray-450 block text-center mt-2 leading-relaxed">
                            * This is a secure sandbox transaction simulating Razorpay billing gateways. No actual money will be charged.
                        </span>
                    </form>
                </div>
            )}

            {/* STEP 4: Success & Invoice Details */}
            {step === 4 && success && bookingId && (
                <div className="max-w-xl mx-auto glass-effect p-8 rounded-3xl text-center space-y-6">
                    <div className="w-16 h-16 bg-green-950 border border-green-500 rounded-full flex items-center justify-center text-green-400 mx-auto animate-bounce">
                        <CheckCircle size={32} />
                    </div>

                    <h2 className="text-3xl font-extrabold text-white">Payment Received!</h2>
                    <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
                        Your payment for booking ID <strong className="text-white">#{bookingId}</strong> has been successfully approved.
                        An email with your invoice details has been sent to your primary address.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                        <button
                            onClick={() => navigate('/customer')}
                            className="px-6 py-2.5 bg-purple-650 hover:bg-purple-650/80 border border-purple-500 text-white rounded-xl text-xs font-semibold transition-all width-full sm:width-auto"
                        >
                            Go to Customer Dashboard
                        </button>
                        <a
                            href={`/api/bookings/invoice/${bookingId}`}
                            target="_blank" rel="noreferrer"
                            className="px-6 py-2.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1Width"
                        >
                            Download PDF Invoice
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
