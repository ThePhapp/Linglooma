import { Link, useLocation } from "react-router-dom"

export default function SidebarLink({ href, icon, children, matchPaths = [] }) {
    const location = useLocation();
    const allPaths = [href, ...matchPaths];
    const isActive = allPaths.some((path) => location.pathname.startsWith(path));

    return (
        <li className="transform transition-all duration-300 hover:scale-102">
            <Link
                to={href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                        : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:translate-x-2 hover:shadow-md"
                }`}
            >
                <span className={`transition-all duration-300 ${isActive ? "animate-pulse" : "group-hover:scale-110 group-hover:rotate-3"}`}>
                    {icon}
                </span>
                <span className="transition-all duration-300">{children}</span>
                {isActive && (
                    <span className="ml-auto animate-fadeIn">
                        <div className="w-2 h-2 rounded-full bg-white">
                            <span className="absolute w-2 h-2 rounded-full bg-white animate-ping opacity-75"></span>
                        </div>
                    </span>
                )}
            </Link>
        </li>
    )
}
