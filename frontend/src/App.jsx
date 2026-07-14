import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, Compass, Shield, Bell, MessageSquare, ChevronRight } from 'lucide-react';
import NotificationsDrawer from './components/NotificationsDrawer';

// Pages lazy/placeholder imports (we will write their actual content)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreatorProfilePage from './pages/CreatorProfilePage';
import BookingPage from './pages/BookingPage';

// Simple Route Protection
const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div class="flex items-center justify-center min-h-screen bg-brand-dark">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Global Layout
function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    if (isAuthPage) {
        return <div class="min-h-screen bg-brand-dark">{children}</div>;
    }

    return (
        <div class="min-h-screen bg-brand-dark flex flex-col justify-between">
            {/* Premium Glass Nav */}
            <nav class="sticky top-0 z-50 glass-nav px-6 py-4 flex items-center justify-between">
                <Link to="/" class="flex items-center space-x-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    <img src="/assets/p2i-logo.png" alt="P2I logo" class="h-10 w-auto object-contain" />
                    <span class="sr-only">P2I</span>
                    
                </Link>

                <div class="hidden md:flex items-center space-x-6">
                    <Link to="/" class="text-gray-300 hover:text-white transition-colors">Home</Link>
                    <Link to="/#services" class="text-gray-300 hover:text-white transition-colors" onClick={() => navigate('/#services')}>Services</Link>
                    <Link to="/#portfolio" class="text-gray-300 hover:text-white transition-colors" onClick={() => navigate('/#portfolio')}>Portfolio</Link>

                    {user && (
                        <>
                            {user.role === 'CUSTOMER' && <Link to="/customer" class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"><BookOpen size={16} /> Dashboard</Link>}
                            {user.role === 'CREATOR' && <Link to="/creator" class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"><Compass size={16} /> Workspaces</Link>}
                            {user.role === 'ADMIN' && <Link to="/admin" class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"><Shield size={16} /> Admin CP</Link>}
                        </>
                    )}
                </div>

                <div class="flex items-center space-x-4">
                    {user ? (
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-300 hidden sm:inline-block">Welcome, <strong class="text-white">{user.name}</strong> ({user.role})</span>
                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                class="flex items-center space-x-1 text-sm bg-red-950 border border-red-800 text-red-300 hover:bg-red-900 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div class="flex items-center space-x-3">
                            <Link to="/login" class="text-sm font-medium hover:text-white transition-colors px-3 py-1.5">Sign In</Link>
                            <Link to="/register" class="text-sm font-medium gradient-btn px-4 py-2 rounded-lg">Get Started</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Page Area */}
            <main class="flex-grow">
                {children}
            </main>

            {/* Luxury Footer */}
            <footer class="bg-black/40 border-t border-white/5 py-12 px-6">
                <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 class="text-lg font-bold text-white mb-4">📈 P2I</h3>
                        <p class="text-sm text-gray-400 leading-relaxed mb-4">
                            "We Turn Your Promotion Into Income." Connecting brands with professional media creators for premium engagements.
                        </p>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold uppercase text-gray-200 tracking-wider mb-4">Roles</h4>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><Link to="/register" class="hover:text-purple-400">Customer Bookings</Link></li>
                            <li><Link to="/register?role=creator" class="hover:text-purple-400">Apply as Creator</Link></li>
                            <li><Link to="/login" class="hover:text-purple-400">Admin Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold uppercase text-gray-200 tracking-wider mb-4">Platform</h4>
                        <ul class="space-y-2 text-sm text-gray-400">
                            <li><a href="#services" class="hover:text-purple-400">Services</a></li>
                            <li><a href="#portfolio" class="hover:text-purple-400">Creators Network</a></li>
                            <li><a href="#faq" class="hover:text-purple-400">FAQ Core</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold uppercase text-gray-200 tracking-wider mb-4">Enterprise</h4>
                        <p class="text-sm text-gray-400 mb-2">Need a custom enterprise shoot?</p>
                        <p class="text-sm text-purple-400 font-medium">enterprise@p2i.com</p>
                    </div>
                </div>
                <div class="max-w-6xl mx-auto border-t border-white/5 mt-10 pt-6 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} P2I (Promotion To Income). All Rights Reserved. Built with Spring Security & React Vite hooks.
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <Layout>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/creators/:id" element={<CreatorProfilePage />} />

                {/* Customer Dashboard & Booking Core */}
                <Route path="/customer" element={
                    <PrivateRoute allowedRoles={['CUSTOMER']}>
                        <CustomerDashboard />
                    </PrivateRoute>
                } />
                <Route path="/book" element={
                    <PrivateRoute allowedRoles={['CUSTOMER']}>
                        <BookingPage />
                    </PrivateRoute>
                } />

                {/* Creator Dashboard */}
                <Route path="/creator" element={
                    <PrivateRoute allowedRoles={['CREATOR']}>
                        <CreatorDashboard />
                    </PrivateRoute>
                } />

                {/* Admin Dashboard */}
                <Route path="/admin" element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />

                {/* Fallback to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}
