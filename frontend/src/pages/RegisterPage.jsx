import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Camera, Clipboard, DollarSign, ShieldAlert, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role')?.toUpperCase() === 'CREATOR' ? 'CREATOR' : 'CUSTOMER';

    const [role, setRole] = useState(defaultRole);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Creator extra fields
    const [specialization, setSpecialization] = useState('Photography');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [equipment, setEquipment] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    // Business client fields
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [addressField, setAddressField] = useState('');
    const [contactPerson, setContactPerson] = useState('');

    const [errorHeader, setErrorHeader] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorHeader('');
        setSuccess('');
        setLoading(false);

        const body = {
            email,
            password,
            name,
            phone,
            role
        };

        if (role === 'CREATOR') {
            body.specialization = specialization;
            body.location = location;
            body.bio = bio;
            body.equipment = equipment;
            body.hourlyRate = parseFloat(hourlyRate) || 0.0;
        }

        if (role === 'CUSTOMER') {
            body.companyName = companyName;
            body.companyWebsite = companyWebsite;
            body.address = addressField;
            body.contactPerson = contactPerson;
        }

        setLoading(true);
        try {
            await register(body);
            setSuccess(
                role === 'CREATOR'
                    ? 'Registration successful! Your creator application has been submitted and is awaiting administrator verification approval.'
                    : 'Registration successful! You may now sign in using your credentials.'
            );
            setTimeout(() => navigate('/login'), 5000);
        } catch (err) {
            console.error(err);
            setErrorHeader(err.response?.data?.message || 'Registration failed. Check details or email conflicts.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden bg-brand-dark">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl -z-10"></div>

            <div className="w-full max-w-xl glass-effect p-8 rounded-3xl shadow-glow">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        P2I Platform
                    </Link>
                    <h2 className="text-xl font-bold text-white mt-4">Create Account</h2>
                    <p className="text-gray-400 text-xs mt-1">Join the ultimate promotional shoot & media marketplace</p>
                </div>

                {errorHeader && (
                    <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                        <ShieldAlert size={16} />
                        <span>{errorHeader}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-950/50 border border-green-800 text-green-300 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-black/45 border border-white/5 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setRole('CUSTOMER')}
                            className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${role === 'CUSTOMER' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Business Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('CREATOR')}
                            className={`py-2 text-center text-xs font-semibold rounded-lg transition-all ${role === 'CREATOR' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Creative Creator
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text" required
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text" required
                                    value={phone} onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 99999 88888"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="email" required
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="biz@company.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Creator Profile fields */}
                    {role === 'CUSTOMER' && (
                        <div className="border-t border-white/5 pt-5 space-y-4">
                            <h3 className="text-sm font-bold text-purple-400">Business Client Details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Acme Corp"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Contact Person</label>
                                    <input
                                        type="text"
                                        value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Company Website</label>
                                <input
                                    type="text"
                                    value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)}
                                    placeholder="https://acme.example"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Company Address</label>
                                <textarea
                                    rows="2"
                                    value={addressField} onChange={(e) => setAddressField(e.target.value)}
                                    placeholder="Street, City, State, Country"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                ></textarea>
                            </div>
                        </div>
                    )}
                    {role === 'CREATOR' && (
                        <div className="border-t border-white/5 pt-5 space-y-4">
                            <h3 className="text-sm font-bold text-purple-400">Creator Professional Dossier</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Specialization</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <select
                                            value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:border-purple-500 focus:outline-none transition-all appearance-none"
                                        >
                                            <option className="bg-brand-dark" value="Photography">Photography</option>
                                            <option className="bg-brand-dark" value="Videography">Videography</option>
                                            <option className="bg-brand-dark" value="Drone Shoot">Drone Shoot</option>
                                            <option className="bg-brand-dark" value="Product Shoot">Product Shoot</option>
                                            <option className="bg-brand-dark" value="Event Coverage">Event Coverage</option>
                                            <option className="bg-brand-dark" value="Video Editing">Video Editing</option>
                                            <option className="bg-brand-dark" value="Reel Creation">Reel Creation</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Hourly Rate ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="number" required
                                            value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)}
                                            placeholder="50"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Primary Work Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="text" required
                                        value={location} onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Bangalore, India"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Camera & Gear Checklist</label>
                                <div className="relative">
                                    <Clipboard className="absolute left-3.5 top-3 text-gray-500" size={16} />
                                    <textarea
                                        rows="2" required
                                        value={equipment} onChange={(e) => setEquipment(e.target.value)}
                                        placeholder="Sony FX3, DJI Mavic Pro 3, Prime lenses..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Brief Bio / Background</label>
                                <textarea
                                    rows="2" required
                                    value={bio} onChange={(e) => setBio(e.target.value)}
                                    placeholder="Creative focus on fashion shoots and viral reels campaigns..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold gradient-btn flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                        {loading ? "Registering profile..." : "Submit Registration"}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
