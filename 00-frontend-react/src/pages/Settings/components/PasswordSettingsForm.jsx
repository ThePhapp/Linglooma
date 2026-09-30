import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import apiClient from "@/services/apiClient";
import { AuthContext } from '@/contexts/AuthContext';

const PasswordSettingsForm = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        gender: '',
        nationality: '',
        phonenumber: ''
    });

    useEffect(() => {
        if (auth?.user) {
            setFormData(prev => ({
                ...prev,
                username: auth.user.username || '',
                gender: auth.user.gender || '',
                nationality: auth.user.nationality || '',
                phonenumber: auth.user.phonenumber || ''
            }));
        }
    }, [auth]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.username.trim()) {
            toast.error('Username is required');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }

        if (formData.newPassword) {
            const passwordLength = [...formData.newPassword].length;
            if (passwordLength < 8 || passwordLength > 128) {
                toast.error('Password must be between 8 and 128 characters');
                return;
            }
        }

        if (formData.newPassword && !formData.currentPassword) {
            toast.error('Please enter your current password to change it');
            return;
        }

        const payload = {
            email: auth?.user?.email,
            username: formData.username,
            password: formData.newPassword || '',
            currentPassword: formData.currentPassword || '',
            gender: formData.gender,
            nationality: formData.nationality,
            phonenumber: formData.phonenumber
        };

        try {
            setIsSubmitting(true);
            const data = await apiClient.put(`/api/users/update`, payload);

            if (data.success === true) {
                toast.success('✅ Profile updated successfully!');

                const updatedUser = {
                    email: auth.user.email,
                    username: formData.username,
                    gender: formData.gender,
                    nationality: formData.nationality,
                    phonenumber: formData.phonenumber
                };

                setAuth(prev => ({
                    ...prev,
                    user: updatedUser
                }));

                // Reset password fields
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            if (err.response) {
                toast.error('❌ ' + (err.response.data.message || 'Unknown error'));
            } else if (err.request) {
                toast.error('❌ No response from server');
            } else {
                toast.error('❌ Connection error: ' + (err.message || 'Unknown error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>👤</span>
                        <span>Account Information</span>
                    </h3>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                placeholder="Enter your username"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">👤</span>
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>🔒</span>
                        <span>Change Password</span>
                    </h3>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                placeholder="Enter current password"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔑</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                maxLength={256}
                                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                placeholder="Enter new password (8–128 characters)"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔐</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                maxLength={256}
                                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                placeholder="Re-enter new password"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">✓</span>
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>📝</span>
                        <span>Personal Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                    placeholder="e.g., Male, Female, Other"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">⚥</span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                    placeholder="Enter phone number"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">📱</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                                Nationality
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors duration-200"
                                    placeholder="Enter your nationality"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🌍</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-95 ${
                        isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>💾</span>
                            <span>Save Changes</span>
                        </span>
                    )}
                </button>
            </form>

            {/* Security Tips */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Security Tips</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>Use a unique password with 8–128 characters</li>
                            <li>Don't share your password with anyone</li>
                            <li>Change your password regularly</li>
                            <li>Use a unique password for this account</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordSettingsForm;
