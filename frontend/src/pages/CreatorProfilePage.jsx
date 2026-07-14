import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Camera, MapPin, Clipboard, DollarSign, Award, ArrowLeft, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function CreatorProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreatorProfile();
    }, [id]);

    const fetchCreatorProfile = async () => {
        try {
            const res = await axios.get(`/api/creators/public/${id}`);
            setProfile(res.data.profile);
            setPortfolio(res.data.portfolio);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <h3 className="text-xl font-bold text-red-400">Creator Not Found</h3>
                <p className="text-gray-400 text-xs">The creator profile you are trying to view does not exist on this platform.</p>
                <Link to="/" className="inline-block py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold mb-8">
                <ArrowLeft size={14} /> Back to Search
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Side: Avatar/Bio Card (4 cols) */}
                <div className="lg:col-span-4 glass-effect p-8 rounded-3xl text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-extrabold text-3xl mx-auto border-2 border-purple-400 shadow-glow">
                        {profile.user.name.charAt(0)}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-1.5">
                            {profile.user.name}
                            <ShieldCheck className="text-blue-405" size={20} />
                        </h2>
                        <span className="text-xs font-semibold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
                            {profile.specialization}
                        </span>
                    </div>

                    <div className="flex justify-around items-center border-y border-white/5 py-4 text-center">
                        <div>
                            <div className="text-lg font-bold text-white">${profile.hourlyRate}/Hr</div>
                            <div className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Rate</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{profile.completedProjects}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Shoots</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{profile.rating.toFixed(1)} ★</div>
                            <div className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Rating</div>
                        </div>
                    </div>

                    <Link to="/book" className="w-full inline-block py-3 gradient-btn rounded-xl text-xs font-bold shadow-glow text-center">
                        Book Shoot with {profile.user.name.split(' ')[0]}
                    </Link>
                </div>

                {/* Right Side: Professional dossier (8 cols) */}
                <div className="lg:col-span-8 glass-effect p-8 rounded-3xl space-y-6">
                    <div>
                        <h4 className="text-base font-bold text-white mb-2">Biography</h4>
                        <p className="text-xs text-gray-450 leading-relaxed">{profile.bio}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Service Location</h4>
                            <div className="flex items-center gap-1.5 text-xs text-white">
                                <MapPin size={16} className="text-purple-400" />
                                <span>{profile.location}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Camera Gear & Setup</h4>
                            <div className="flex items-center gap-1.5 text-xs text-white">
                                <Clipboard size={16} className="text-purple-400" />
                                <span>{profile.equipment}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portfolio Gallery Section */}
            <div>
                <h3 className="text-xl font-bold mb-6">Work Showcase Portfolio</h3>
                {portfolio.length === 0 ? (
                    <div className="text-center text-xs text-gray-550 py-10 border border-white/5 bg-slate-950/10 rounded-2xl">
                        No portfolio uploads listed yet by this creator.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolio.map((p) => (
                            <div key={p.id} className="relative rounded-2xl overflow-hidden group aspect-video bg-black max-w-full">
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-350" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-4">
                                    <span className="text-[9px] text-purple-450 font-bold uppercase">{p.type}</span>
                                    <h4 className="text-xs font-bold text-white mt-1 leading-normal">{p.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
