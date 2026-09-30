import React, { useState } from "react";
import SpeakingGrid from "./components/SpeakingGrid";
import RecordingPractice from "./components/RecordingPractice";
import IncorrectPhonemesTable from "./components/IncorrectPhonemesTable";
import PhonemeDetails from "./components/PhonemeDetails";
import { Award, Target, Zap, TrendingUp } from "lucide-react";

const IeltsSpeakingPractice = () => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [scoreData, setScoreData] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const handleScore = async (dataPromise) => {
        setLoading(true);
        try {
            const data = await dataPromise;
            setScoreData(data);
        } catch (err) {
            console.error("Error scoring:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Overlay loading */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-800 mt-6 text-xl font-bold text-center">
                            Analyzing Your Speech...
                        </p>
                        <p className="text-gray-500 mt-2 text-sm text-center">
                            Please wait while we evaluate your pronunciation
                        </p>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col p-6 gap-6 max-w-[1600px] w-full mx-auto">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            <Target className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white">
                            IELTS Speaking Practice
                        </h1>
                    </div>
                    <p className="text-center text-white/90 text-lg">
                        Record yourself and get instant AI-powered feedback on your pronunciation
                    </p>
                </header>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1">
                    {/* Left Side - Recording Practice */}
                    <div className="flex flex-col w-full lg:w-3/5 gap-5">
                        <RecordingPractice
                            currentQuestion={currentQuestion}
                            currentIndex={currentIndex}
                            referenceText={currentQuestion?.content || "Choose a question from the right panel to begin"}
                            onScore={(data) => setScoreData(data)}
                            setLoading={setLoading}
                        />
                    </div>

                    {/* Right Side - Question Grid */}
                    <div className="w-full lg:w-2/5">
                        <SpeakingGrid
                            setCurrentQuestion={setCurrentQuestion}
                            setCurrentIndex={setCurrentIndex}
                        />
                    </div>
                </div>

                {/* Results Section */}
                {scoreData && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Score Card */}
                        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <Award className="h-8 w-8 text-purple-600" />
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Your Results
                                </h3>
                            </div>

                            {/* Overall Score */}
                            <div className="text-center mb-8 p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                                <div className="text-lg font-medium text-gray-700 mb-2">IELTS Band Score</div>
                                <div className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {scoreData.score ?? "N/A"}
                                </div>
                            </div>

                            {/* Detailed Scores */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl text-center border-2 border-blue-200">
                                    <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <div className="text-sm text-blue-700 mb-1 font-medium">Accuracy</div>
                                    <div className="text-2xl font-bold text-blue-900">{scoreData.accuracyScore ?? "N/A"}</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl text-center border-2 border-green-200">
                                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-sm text-green-700 mb-1 font-medium">Fluency</div>
                                    <div className="text-2xl font-bold text-green-900">{scoreData.fluencyScore ?? "N/A"}</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl text-center border-2 border-purple-200">
                                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <div className="text-sm text-purple-700 mb-1 font-medium">Completeness</div>
                                    <div className="text-2xl font-bold text-purple-900">{scoreData.completenessScore ?? "N/A"}</div>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl text-center border-2 border-pink-200">
                                    <Award className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                                    <div className="text-sm text-pink-700 mb-1 font-medium">Pronunciation</div>
                                    <div className="text-2xl font-bold text-pink-900">{scoreData.pronScore ?? "N/A"}</div>
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-xl">💬</span>
                                    <span>AI Feedback</span>
                                </h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {scoreData.feedback ?? "No feedback provided."}
                                </p>
                            </div>
                        </section>

                        {/* Phoneme Details */}
                        <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200">
                            <PhonemeDetails phonemeDetails={scoreData.phonemeDetails} />
                        </section>

                        {/* Incorrect Phonemes Table */}
                        {scoreData.incorrectPhonemes && scoreData.incorrectPhonemes.length > 0 && (
                            <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200">
                                <IncorrectPhonemesTable data={scoreData.incorrectPhonemes} />
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default IeltsSpeakingPractice;
