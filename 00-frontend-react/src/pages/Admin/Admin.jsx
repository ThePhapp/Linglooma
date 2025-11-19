import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";

const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative inset-y-0 left-0 z-50 
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar with Toggle */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? (
                            <X className="h-6 w-6 text-gray-600" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-600" />
                        )}
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-800">Linglooma English Platform</h1>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="dashboard-main p-4 lg:p-6">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Admin;

