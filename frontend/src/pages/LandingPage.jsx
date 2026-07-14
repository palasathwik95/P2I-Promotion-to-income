import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Camera, Video, Compass, Star, ChevronDown, Check, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [creators, setCreators] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            const res = await axios.get('/api/creators/public');
            setCreators(res.data.slice(0, 3)); // show top 3 on landing page
        } catch (err) {
            console.error("Error loading creators", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/creators/public/search?q=${searchQuery}`);
            setCreators(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Mock beautiful portfolio
    const portfolioItems = [
        { title: "Gourmet Bakery Reel", type: "Video Editing", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop" },
        { title: "Luxury Real Estate", type: "Drone Shoot", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop" },
        { title: "Organic Cosmetic Promo", type: "Product Shoot", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop" },
        { title: "Annual Tech Summit", type: "Event Coverage", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop" },
        { title: "Neon Energy Drink Ad", type: "Branding", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop" },
        { title: "Streetwear Catalog", type: "Photography", url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop" }
    ];

    // Services defined in prompt
    const services = [
        { name: "Photography", desc: "Corporate headshots, retail, and commercial photography.", icon: Camera },
        { name: "Videography", desc: "Premium cinematic commercial edits and promos.", icon: Video },
        { name: "Drone Shoot", desc: "Creative 4K aerial photography and structural video fits.", icon: Compass },
        { name: "Product Shoot", desc: "Stunning lifestyle and studio product visual sets.", icon: Camera },
        { name: "Event Coverage", desc: "Festive showcases, tech meetups, and wedding overlays.", icon: Video },
        { name: "Instagram Reels", desc: "Trending reels and shorts for maximum social reach.", icon: Compass }
    ];

    const faqs = [
        { q: "How quickly are creators assigned?", a: "Typically within 24 hours of booking and payment confirmation. You will receive an instant email and WhatsApp prompt." },
        { q: "Can I choose my preferred creator directly?", a: "Yes, you can browse creators, read their verified equipment checklist/completed shoots list, and request them during checkout." },
        { q: "Is editing included in the standard price?", a: "Yes, all standard, premium, and enterprise packages include custom color grading, sound overlays, and edit revisions." },
        { q: "How do I download the final deliverables?", a: "Once the creator uploads the file archive, you will receive a secure high-speed download link on your Customer dashboard." }
    ];

    return (
        <div className="w-full">
            {/* 1. Hero Section */}
            <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
                {/* Background glow effects */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute top-40 left-1/4 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>

                <span className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                    Premium Marketplace for Digital Assets and Shoots
                </span>

                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl text-white">
                    Professional Promotional Services <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                        For Every Business
                    </span>
                </h1>

                <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
                    We connect businesses with professional creators to produce high-quality promotional content that increases sales.
                    <strong> "We Turn Your Promotion Into Income."</strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
                    <Link to="/book" className="gradient-btn px-8 py-3.5 rounded-xl font-semibold text-base shadow-glow flex items-center gap-2">
                        Book Now <ChevronDown size={18} />
                    </Link>
                    <a href="#services" className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all font-semibold text-base">
                        Explore Services
                    </a>
                </div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="w-full max-w-xl glass-effect p-2 rounded-2xl flex items-center shadow-2xl">
                    <input
                        type="text"
                        placeholder="Search creators by skill, location (e.g. Bangalore)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow bg-transparent outline-none border-none text-white px-4 py-2 placeholder-gray-500 text-sm"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-all"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>
            </section>

            {/* 2. Statistics Section */}
            <section className="border-y border-white/5 bg-slate-950/20 py-12 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: "500+", label: "Projects Completed" },
                        { value: "250+", label: "Happy Clients" },
                        { value: "100+", label: "Professional Creators" },
                        { value: "4.9 ★", label: "Average Star Rating" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl sm:text-4xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Services Section */}
            <section id="services" className="py-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 inline-block mb-3">
                        Our Premium Services
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
                        Select one of our specialized categories to boost your business visibility, social presence, and revenue.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((srv, idx) => {
                        const Icon = srv.icon;
                        return (
                            <div key={idx} className="glass-effect p-6 rounded-2xl hover:border-purple-500/40 hover:bg-brand-card/50 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-purple-950/50 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{srv.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">{srv.desc}</p>
                                <Link to="/book" className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1">
                                    Book package <ExternalLink size={14} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. Portfolio Section */}
            <section id="portfolio" className="py-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">Featured Creator Portfolio</h2>
                    <p className="text-gray-400 max-w-lg mx-auto text-sm">See how we build professional assets that power brand conversions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl bg-brand-card border border-white/5 aspect-video sm:aspect-square">
                            <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                <span className="text-purple-400 text-xs font-semibold uppercase">{item.type}</span>
                                <h4 className="text-lg font-bold text-white mt-1">{item.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Verified Creators Section */}
            <section className="py-20 px-6 max-w-4xl mx-auto bg-brand-card/30 border border-white/5 rounded-3xl mb-20 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-2xl"></div>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">Collaborate With Leading Creators</h2>
                    <p className="text-gray-400 text-sm">Browse elite photographers, videographers, and drone pilots</p>
                </div>

                <div className="space-y-6">
                    {creators.length > 0 ? (
                        creators.map((c) => (
                            <div key={c.id} className="glass-effect p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white">
                                        {c.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold flex items-center gap-1.5">
                                            {c.user.name}
                                            <ShieldCheck className="text-blue-400" size={16} />
                                        </h4>
                                        <p className="text-xs text-purple-400 font-semibold">{c.specialization} &bull; {c.location}</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm line-clamp-1">{c.bio}</p>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0 mt-2 sm:mt-0 justify-between">
                                    <div className="text-sm font-semibold">${c.hourlyRate}/Hr</div>
                                    <Link to={`/creators/${c.id}`} className="px-4 py-1.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/20 hover:border-purple-500 text-purple-300 hover:text-white rounded-lg text-xs font-semibold transition-all">
                                        View Portfolio
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 text-sm">No creators found. Search above to find creators.</div>
                    )}
                </div>
            </section>

            {/* 6. FAQ Section */}
            <section id="faq" className="py-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
                    <p className="text-gray-400 text-sm">Got questions? We've got answers.</p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="glass-effect p-6 rounded-2xl">
                            <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
