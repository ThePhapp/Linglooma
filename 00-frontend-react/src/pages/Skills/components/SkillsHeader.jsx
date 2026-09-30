import React from "react";
import { GraduationCap, Target } from "lucide-react";

const SkillsHeader = () => {
    return (
        <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-10 mb-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative flex flex-col items-center text-center">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-6">
                    <GraduationCap className="h-16 w-16 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                    English 4-Skill Training
                </h1>
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                    <Target className="h-5 w-5 text-white" />
                    <p className="text-lg text-white font-medium">
                        Master All Four Skills: Listening, Speaking, Reading & Writing
                    </p>
                </div>

                <p className="mt-5 text-white/90 text-base max-w-2xl leading-relaxed">
                    Choose your practice path and start improving your English skills today. 
                    Each module is designed to help you achieve your target score.
                </p>
            </div>
        </header>
    );
};

export default SkillsHeader;
