import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import { LayoutDashboard, Calendar, TrendingUp } from "lucide-react";

const DashboardHeader = () => {
    const { auth } = useContext(AuthContext);
    const name = auth?.user?.username;
    const email = auth?.user?.email;

    // Get first letter of name for avatar
    const avatarInitial = name?.charAt(0).toUpperCase() || 'U';
    
    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left Section - Greeting */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            <LayoutDashboard className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {getGreeting()}, {name}! 👋
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                Ready to continue your IELTS journey?
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - User Info */}
                <div className="flex items-center gap-4">
                    {/* Stats Quick View */}
                    <div className="hidden lg:flex items-center gap-4 mr-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <div className="flex items-center gap-2 text-white">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <div className="flex items-center gap-2 text-white">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm font-medium">On Track</span>
                            </div>
                        </div>
                    </div>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {avatarInitial}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-white font-semibold">{name}</p>
                            <p className="text-blue-100 text-xs">{email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader;
