import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [pageTransition, setPageTransition] = useState(false);
    const location = useLocation();

    // Page transition effect khi chuyển route
    useEffect(() => {
        setPageTransition(true);
        const timer = setTimeout(() => setPageTransition(false), 300);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Overlay với fade animation */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar với smooth animation */}
            <div className={`
                fixed inset-y-0 left-0 z-50 
                transform transition-all duration-500 ease-out
                ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
                lg:relative lg:translate-x-0 lg:shadow-xl
                ${!sidebarOpen ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-72'}
            `}>
                <Sidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)}
                    shouldAnimate={sidebarOpen}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar with Toggle */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:scale-110 active:scale-95"
                        aria-label="Toggle sidebar"
                    >
                        <div className="transition-transform duration-300">
                            {sidebarOpen ? (
                                <X className="h-6 w-6 text-gray-600" />
                            ) : (
                                <Menu className="h-6 w-6 text-gray-600" />
                            )}
                        </div>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-800">Linglooma English Platform</h1>
                    </div>
                </div>

                {/* Page Content với transition effect */}
                <div className="flex-1 overflow-y-auto">
                    <div className={`dashboard-main p-4 lg:p-6 transition-all duration-300 ${
                        pageTransition ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Admin;

