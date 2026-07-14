import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorHeader, setErrorHeader] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorHeader('');
        setLoading(true);

        try {
            const user = await login(email, password);
            // Success redirection based on role
            if (user.role === 'CUSTOMER') navigate('/customer');
            else if (user.role === 'CREATOR') navigate('/creator');
            else if (user.role === 'ADMIN') navigate('/admin');
            else navigate('/');
        } catch (err) {
            console.error(err);
            setErrorHeader(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Automated Quick Fill for convenience
    const handleQuickFill = (roleName) => {
        if (roleName === 'ADMIN') {
            setEmail('admin@p2i.com');
            setPassword('admin123');
        } else if (roleName === 'CREATOR') {
            setEmail('creator@p2i.com');
            setPassword('creator123');
        } else if (roleName === 'CUSTOMER') {
            setEmail('customer@p2i.com');
            setPassword('customer123');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-brand-dark">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl -z-10"></div>

            <div className="w-full max-w-md glass-effect p-8 rounded-3xl shadow-glow">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        P2I
                    </Link>
                    <h2 className="text-xl font-bold text-white mt-4">Welcome Back</h2>
                    <p className="text-gray-400 text-xs mt-1">Sign in to coordinate your bookings & deliverables</p>
                </div>

                {errorHeader && (
                    <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                        <ShieldAlert size={16} />
                        <span>{errorHeader}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold gradient-btn flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                        <ArrowRight size={16} />
                    </button>
                </form>

                {/* Demo Fast-Connect */}
                <div className="mt-8 pt-6 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block text-center mb-3">
                        Demo Portal Quick Access (Automated Seed Users)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleQuickFill('CUSTOMER')}
                            className="py-1.5 px-2 bg-blue-950/40 border border-blue-900/30 text-[10px] text-blue-300 rounded-lg hover:bg-blue-900/40 transition-all font-semibold"
                        >
                            Customer Client
                        </button>
                        <button
                            onClick={() => handleQuickFill('CREATOR')}
                            className="py-1.5 px-2 bg-indigo-950/40 border border-indigo-900/30 text-[10px] text-indigo-300 rounded-lg hover:bg-indigo-900/40 transition-all font-semibold"
                        >
                            Creator Partner
                        </button>
                        <button
                            onClick={() => handleQuickFill('ADMIN')}
                            className="py-1.5 px-2 bg-purple-950/40 border border-purple-900/30 text-[10px] text-purple-300 rounded-lg hover:bg-purple-900/40 transition-all font-semibold"
                        >
                            System Admin
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                    Don't have an account? <Link to="/register" className="text-purple-400 hover:underline">Sign up now</Link>
                </div>
            </div>
        </div>
    );
}
