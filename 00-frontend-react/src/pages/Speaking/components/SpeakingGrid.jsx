import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/services/apiClient";
import { toast } from "react-toastify";
import { History, LogOut, Mic } from "lucide-react";

const GridButton = ({ number, active, onClick }) => {
    return (
        <button
            onClick={() => onClick(number)}
            className={`text-2xl font-bold aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg ${
                active
                    ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-110 shadow-purple-400"
                    : "bg-white text-gray-700 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300"
            }`}
        >
            {number}
        </button>
    );
};

const SpeakingGrid = ({ setCurrentQuestion, setCurrentIndex }) => {
    const navigate = useNavigate();
    const { lessonId } = useParams();

    const [activeNumber, setActiveNumber] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [lessonTitle, setLessonTitle] = useState("");

    const handleClick = (index) => {
        setActiveNumber(index + 1);
        const question = questions[index];
        if (question) {
            setCurrentQuestion(question);
            setCurrentIndex(index);
        }
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await apiClient.get(`/api/questions/${lessonId}`);

                if (data.message && (!data.questions || !Array.isArray(data.questions))) {
                    toast.error(data.message);
                    setQuestions([]);
                    return;
                }

                if (data.questions && Array.isArray(data.questions)) {
                    setQuestions(data.questions);
                    if (data.questions.length > 0) {
                        setCurrentQuestion(data.questions[0]);
                        setCurrentIndex(0);
                        setLessonTitle(data.questions[0].name || "");
                    }
                } else {
                    toast.error("Dữ liệu không hợp lệ từ server");
                    setQuestions([]);
                }
            } catch (err) {
                console.error("Lỗi fetch API:", err);
                toast.error("Lỗi fetch API: " + (err.message || err));
                setQuestions([]);
            }
        };

        fetchQuestions();
    }, [lessonId]);

    return (
        <section className="h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200">
            <div className="flex flex-col items-center gap-6 h-full">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Mic className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Questions
                        </h2>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                        <h3 className="text-base font-bold text-purple-800">
                            Lesson {lessonId}: {lessonTitle}
                        </h3>
                    </div>
                </div>

                {/* Question Grid */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[350px]">
                        {questions.map((q, index) => (
                            <GridButton
                                key={index}
                                number={index + 1}
                                active={activeNumber === (index + 1)}
                                onClick={() => handleClick(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => navigate("/admin/features/speaking/history")}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        <History className="h-5 w-5" />
                        <span>View History</span>
                    </button>
                    <button
                        onClick={() => navigate("/admin/features/lesson")}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Exit Lesson</span>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(activeNumber / questions.length) * 100}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-600">
                    Question {activeNumber} of {questions.length}
                </p>
            </div>
        </section>
    );
};

export default SpeakingGrid;
