import { useNavigate } from "react-router-dom";
import SidebarLink from "./Sidebar-link";
import { Home, BookOpen, BarChart2, Settings, ClipboardList, MessageSquare, LogOut, Activity, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/context/auth.context";

const Sidebar = ({ isOpen, onClose, shouldAnimate = false }) => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [animateItems, setAnimateItems] = useState(false);

    // Stagger animation cho sidebar items
    useEffect(() => {
        if (isOpen && shouldAnimate) {
            const timer = setTimeout(() => setAnimateItems(true), 100);
            return () => clearTimeout(timer);
        } else if (!isOpen) {
            setAnimateItems(false);
        }
    }, [isOpen, shouldAnimate]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setAuth({
            isAuthenticated: false,
            user: {
                email: "",
                username: "",
            },
        });
        navigate("/");
    };

    return (
        <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col h-full shadow-2xl border-r border-slate-700">
            {/* Header with Close Button for Mobile */}
            <div className={`p-6 border-b border-slate-700/50 transition-all duration-500 ${
                animateItems ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Linglooma
                            </h2>
                            <p className="text-xs text-slate-400">English Learning Platform</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 hover:scale-110 active:scale-90 hover:rotate-90"
                        aria-label="Close sidebar"
                    >
                        <X className="h-5 w-5 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* User Profile Card */}
            <div className={`px-4 py-5 border-b border-slate-700/50 transition-all duration-500 delay-100 ${
                animateItems ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 hover:scale-110">
                                {auth?.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full">
                                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {auth?.user?.username || 'Student'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {auth?.user?.email || 'No email'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto py-6 px-3 transition-all duration-500 delay-200 ${
                animateItems ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
                <div className="mb-4 px-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
                </div>
                <ul className="space-y-2">
                    <SidebarLink href="/admin/dashboard" icon={<Home className="h-5 w-5" />}>
                        Dashboard
                    </SidebarLink>
                    <SidebarLink
                        href="/admin/features"
                        icon={<ClipboardList className="h-5 w-5" />}
                        matchPaths={["/admin/lesson", "/admin/features"]}
                    >
                        Features
                    </SidebarLink>
                    <SidebarLink href="/admin/ai-chat" icon={<MessageSquare className="h-5 w-5" />}>
                        AI Chat
                    </SidebarLink>
                    <SidebarLink href="/admin/analytics" icon={<Activity className="h-5 w-5" />}>
                        Smart Analytics
                    </SidebarLink>
                </ul>

                <div className="my-6 px-3">
                    <div className="h-px bg-slate-700/50"></div>
                </div>

                <div className="mb-4 px-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                </div>
                <ul className="space-y-2">
                    <SidebarLink href="/admin/settings" icon={<Settings className="h-5 w-5" />}>
                        Settings
                    </SidebarLink>
                </ul>
            </nav>

            {/* Footer - Logo & Logout */}
            <div className={`p-4 border-t border-slate-700/50 space-y-4 transition-all duration-500 delay-300 ${
                animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-105 active:scale-95"
                >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-semibold">Logout</span>
                </button>

                {/* Logo */}
                <button 
                    className="w-full flex items-center justify-center p-3 hover:bg-slate-800/50 rounded-xl transition-all duration-300 group"
                    onClick={() => navigate("/")}
                >
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <img 
                                src="/images/img_logo_140x196.png" 
                                alt="Linglooma Logo" 
                                className="h-20 w-auto opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" 
                            />
                        </div>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">© 2025 Linglooma</p>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default Sidebar;