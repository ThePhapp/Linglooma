import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PropTypes from 'prop-types';

export const PracticeCard = ({ title, emoji, description, gradient, bgColor, href }) => {
    const navigate = useNavigate();

    const handleLearnClick = () => {
        navigate(href);
    }

    return (
        <article className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 ${bgColor}/30 h-full flex flex-col`}>
            {/* Gradient Top Bar */}
            <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
            
            {/* Content */}
            <div className="p-8 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-4xl">{emoji}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 flex-1">
                        {title}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {description}
                </p>

                {/* Footer with Button */}
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-200">
                    <button
                        onClick={handleLearnClick}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95`}
                    >
                        <span>Open practice</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
        </article>
    );
};

PracticeCard.propTypes = {
    title: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    gradient: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
};
