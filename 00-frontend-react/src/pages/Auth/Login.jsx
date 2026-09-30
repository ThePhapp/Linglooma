import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "@/components/context/auth.context";
import axios from "@/utils/axios.customize";
import { Mail, Lock, LogIn, Home, ArrowRight } from "lucide-react";

const PageLogin = () => {
    const { setAuth, setAuthLoading, setAuthError } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmitLogin = async () => {
        // validate
        const isvaliEmail = validateEmail(email);
        if (!isvaliEmail) {
            toast.error('Invalid email address');
            return;
        }
        if (!password) {
            toast.error('Invalid password')
            return;
        }
        if (!isvaliEmail && !password) {
            toast.error("Invalid email and password");
        }
        
        setIsLoading(true);
        try {
            const res = await axios.post(`/api/login`, { email: email.trim().toLowerCase(), password });

            if (res.success === true && res?.access_token) {
                // lưu vào localStorage
                localStorage.setItem("access_token", res.access_token);
                toast.success(
                    "Login success! Welcome to Linglooma", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "light"
                }
                );

                setAuth({
                    isAuthenticated: true,
                    user: {
                        email: res?.user?.email ?? "",
                        username: res?.user?.name ?? "",
                        phonenumber: res?.user?.phone ?? "",
                        gender: res?.user?.gender ?? "",
                        nationality: res?.user?.nationality ?? ""
                    }
                })
                setAuthError(null);
                setAuthLoading(false);

                navigate("/admin/dashboard");
            } else {
                toast.error(res?.msg || res?.message || "Login failed");
            }
        } catch (err) {
            toast.error(err?.response?.data?.msg || err?.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-xl mb-4 transform hover:scale-110 transition-transform duration-300">
                        <Home className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">Sign in to continue your English journey</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                    {/* Email Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isLoading) {
                                        handleSubmitLogin();
                                    }
                                }}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleSubmitLogin}
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white/80 text-gray-500 font-medium">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                            <FaGoogle className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                            <FaFacebook className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Facebook</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 inline-flex items-center gap-1 group"
                            >
                                Create one now
                                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-600">
                    <p>© 2024 Linglooma. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}
export default PageLogin;
