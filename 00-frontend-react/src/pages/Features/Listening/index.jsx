import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Mic2, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

// Data bank với nhiều bài tập
const DICTATION_EXERCISES = [
    {
        id: 1,
        title: "Daily Routine",
        videoId: "eUXkj6j6Ezw",
        videoUrl: "https://www.youtube.com/embed/eUXkj6j6Ezw",
        correctText: "I wake up at seven o'clock every morning. After breakfast, I go to work by bus. I usually arrive at the office around eight thirty.",
        difficulty: "Easy"
    },
    {
        id: 2,
        title: "Job Interview - Part 1",
        videoId: "Uy0m7jnyEaE",
        videoUrl: "https://www.youtube.com/embed/Uy0m7jnyEaE",
        correctText: "Tell me a little bit about yourself. Well, I'm currently a student and I'm looking for a part-time job. I have some experience in customer service.",
        difficulty: "Easy"
    },
    {
        id: 3,
        title: "At the Doctor's Office",
        videoId: "SFmAk43hjNo",
        videoUrl: "https://www.youtube.com/embed/SFmAk43hjNo",
        correctText: "What seems to be the problem? I have a terrible headache and I've been feeling dizzy. How long have you had these symptoms?",
        difficulty: "Easy"
    },
    {
        id: 4,
        title: "Shopping for Clothes",
        videoId: "h1zOQDfEwKg",
        videoUrl: "https://www.youtube.com/embed/h1zOQDfEwKg",
        correctText: "Can I help you find something? Yes, I'm looking for a blue shirt in medium size. Let me check if we have that in stock.",
        difficulty: "Easy"
    },
    {
        id: 5,
        title: "Weather Report",
        videoId: "qMa0NTuAJbA",
        videoUrl: "https://www.youtube.com/embed/qMa0NTuAJbA",
        correctText: "Tomorrow will be mostly sunny with temperatures reaching twenty-five degrees. There's a slight chance of rain in the evening.",
        difficulty: "Medium"
    },
    {
        id: 6,
        title: "Restaurant Conversation",
        videoId: "ZyLR1BBambQ",
        videoUrl: "https://www.youtube.com/embed/ZyLR1BBambQ",
        correctText: "Good evening. Do you have a reservation? Yes, a table for two under the name Johnson. Right this way, please.",
        difficulty: "Medium"
    },
    {
        id: 7,
        title: "Airport Check-in",
        videoId: "fnJRKZeNu4A",
        videoUrl: "https://www.youtube.com/embed/fnJRKZeNu4A",
        correctText: "May I see your passport and ticket please? Here you are. Would you prefer a window or aisle seat? A window seat would be great.",
        difficulty: "Medium"
    },
    {
        id: 8,
        title: "Hotel Reservation",
        videoId: "4G6QDNC4jPs",
        videoUrl: "https://www.youtube.com/embed/4G6QDNC4jPs",
        correctText: "I'd like to make a reservation for next weekend. How many nights will you be staying? Two nights, from Friday to Sunday.",
        difficulty: "Medium"
    },
    {
        id: 9,
        title: "Business Meeting",
        videoId: "cEVTQHiAQRA",
        videoUrl: "https://www.youtube.com/embed/cEVTQHiAQRA",
        correctText: "Let's move on to the next item on the agenda. We need to discuss the marketing strategy for the new product launch.",
        difficulty: "Hard"
    },
    {
        id: 10,
        title: "Phone Conversation",
        videoId: "qXnT3LFTc-s",
        videoUrl: "https://www.youtube.com/embed/qXnT3LFTc-s",
        correctText: "Hello, this is Sarah calling from the accounting department. I'm calling regarding your invoice from last month.",
        difficulty: "Hard"
    }
];

const QUESTION_EXERCISES = [
    {
        id: 1,
        title: "BBC Learning English - Grammar Lesson",
        videoUrl: "https://www.youtube.com/embed/GOK1tKFFIQI",
        questions: [
            {
                id: 1,
                question: "What language skill is being taught?",
                options: ["Grammar", "Vocabulary", "Pronunciation", "Listening"],
                correct: 0
            },
            {
                id: 2,
                question: "Who is the target audience?",
                options: ["Children", "Beginners", "Advanced learners", "Teachers"],
                correct: 1
            }
        ]
    },
    {
        id: 2,
        title: "TED Talk - Success",
        videoUrl: "https://www.youtube.com/embed/8CrOL-ydFMI",
        questions: [
            {
                id: 1,
                question: "What is the main topic of this talk?",
                options: ["Money", "Success", "Happiness", "Career"],
                correct: 1  
            },
            {
                id: 2,
                question: "According to the speaker, what is most important?",
                options: ["Hard work", "Luck", "Passion", "Education"],
                correct: 2
            },
            {
                id: 3,
                question: "How many key points does the speaker mention?",
                options: ["Two", "Three", "Four", "Five"],
                correct: 1
            }
        ]
    },
    {
        id: 3,
        title: "English Conversation - At a Coffee Shop",
        videoUrl: "https://www.youtube.com/embed/lXNXLJGAV8E",
        questions: [
            {
                id: 1,
                question: "What does the customer order?",
                options: ["Tea", "Coffee", "Juice", "Water"],
                correct: 1
            },
            {
                id: 2,
                question: "What size drink does the customer want?",
                options: ["Small", "Medium", "Large", "Extra large"],
                correct: 1
            },
            {
                id: 3,
                question: "Does the customer want sugar?",
                options: ["Yes, one spoon", "Yes, two spoons", "No sugar", "Not mentioned"],
                correct: 2
            }
        ]
    },
    {
        id: 4,
        title: "IELTS Listening Practice - Travel",
        videoUrl: "https://www.youtube.com/embed/TQN5qyNJhO0",
        questions: [
            {
                id: 1,
                question: "Where is the traveler going?",
                options: ["London", "Paris", "New York", "Sydney"],
                correct: 0
            },
            {
                id: 2,
                question: "How long is the flight?",
                options: ["2 hours", "4 hours", "6 hours", "8 hours"],
                correct: 2
            },
            {
                id: 3,
                question: "What time does the flight depart?",
                options: ["9:00 AM", "10:30 AM", "2:00 PM", "4:30 PM"],
                correct: 1
            },
            {
                id: 4,
                question: "How much luggage is allowed?",
                options: ["One bag", "Two bags", "Three bags", "Unlimited"],
                correct: 1
            }
        ]
    },
    {
        id: 5,
        title: "University Lecture - Environmental Science",
        videoUrl: "https://www.youtube.com/embed/2pFhDK8vhvU",
        questions: [
            {
                id: 1,
                question: "What is the main topic of the lecture?",
                options: ["Global warming", "Pollution", "Renewable energy", "Wildlife"],
                correct: 2
            },
            {
                id: 2,
                question: "How many types of renewable energy are mentioned?",
                options: ["Two", "Three", "Four", "Five"],
                correct: 2
            },
            {
                id: 3,
                question: "What is the lecturer's recommendation?",
                options: ["Use less energy", "Buy electric cars", "Install solar panels", "Plant more trees"],
                correct: 0
            }
        ]
    },
    {
        id: 6,
        title: "News Report - Technology",
        videoUrl: "https://www.youtube.com/embed/qV3s7Sa6B6w",
        questions: [
            {
                id: 1,
                question: "What new technology is being discussed?",
                options: ["Smartphones", "Artificial Intelligence", "Virtual Reality", "5G Networks"],
                correct: 1
            },
            {
                id: 2,
                question: "Which industry will benefit most?",
                options: ["Healthcare", "Education", "Entertainment", "Agriculture"],
                correct: 0
            },
            {
                id: 3,
                question: "When will this technology be available?",
                options: ["This year", "Next year", "In 2 years", "In 5 years"],
                correct: 1
            },
            {
                id: 4,
                question: "What is the main concern mentioned?",
                options: ["Cost", "Privacy", "Complexity", "Safety"],
                correct: 1
            }
        ]
    }
];

const ListeningPractice = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null); // 'dictation' or 'questions'

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-500 rounded-2xl shadow-2xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Headphones className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    IELTS Listening Practice
                                </h1>
                                <p className="text-white/90 mt-1">
                                    Improve your listening skills with video-based exercises
                                </p>
                            </div>
                        </div>

                        <button
                            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            onClick={() => navigate("/admin/features")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Features</span>
                        </button>
                    </div>
                </div>

                {/* Mode Selection */}
                {!mode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Dictation Mode */}
                        <button
                            type="button"
                            onClick={() => setMode('dictation')}
                            className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-white/80 text-left shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-pink-300 hover:shadow-2xl focus-visible:border-pink-500"
                        >
                            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-600"></div>
                            <div className="p-8">
                                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <Mic2 className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Dictation Practice
                                </h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Watch a video and type exactly what you hear. Perfect for improving spelling, vocabulary, and listening accuracy.
                                </p>
                                <div className="flex items-center gap-2 text-pink-600 font-semibold">
                                    <span>Start Dictation</span>
                                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </button>

                        {/* Questions Mode */}
                        <button
                            type="button"
                            onClick={() => setMode('questions')}
                            className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-transparent bg-white/80 text-left shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:shadow-2xl focus-visible:border-purple-500"
                        >
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-600"></div>
                            <div className="p-8">
                                <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Question & Answer
                                </h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Listen to the video and answer comprehension questions. Test your understanding and critical thinking skills.
                                </p>
                                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                                    <span>Start Practice</span>
                                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </button>
                    </div>
                ) : mode === 'dictation' ? (
                    <DictationMode onBack={() => setMode(null)} />
                ) : (
                    <QuestionsMode onBack={() => setMode(null)} />
                )}
            </div>
        </main>
    );
};

// Dictation Mode Component
const DictationMode = ({ onBack }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(null);

    const currentExercise = DICTATION_EXERCISES[currentExerciseIndex];
    const correctText = currentExercise.correctText;

    const nextExercise = () => {
        if (currentExerciseIndex < DICTATION_EXERCISES.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setUserInput("");
            setShowAnswer(false);
            setScore(null);
        }
    };

    const previousExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(currentExerciseIndex - 1);
            setUserInput("");
            setShowAnswer(false);
            setScore(null);
        }
    };

    const checkAnswer = () => {
        const userWords = userInput.trim().toLowerCase().split(/\s+/);
        const correctWords = correctText.trim().toLowerCase().split(/\s+/);
        
        const correctCount = userWords.filter((word, index) => word === correctWords[index]).length;
        const accuracy = Math.round((correctCount / correctWords.length) * 100);
        
        setScore(accuracy);
        setShowAnswer(true);
    };

    const highlightDifferences = () => {
        const userWords = userInput.trim().toLowerCase().split(/\s+/);
        const correctWords = correctText.split(/\s+/);
        
        return correctWords.map((word, index) => {
            const isCorrect = userWords[index]?.toLowerCase() === word.toLowerCase();
            return (
                <span
                    key={index}
                    className={`${isCorrect ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-1 rounded`}
                >
                    {word}{' '}
                </span>
            );
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Mode Selection
                </button>

                {/* Exercise Navigation */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Previous dictation exercise"
                        onClick={previousExercise}
                        disabled={currentExerciseIndex === 0}
                        className={`p-2 rounded-lg transition-all ${
                            currentExerciseIndex === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                        }`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="text-center px-4">
                        <p className="text-sm font-semibold text-gray-600">
                            Exercise {currentExerciseIndex + 1} of {DICTATION_EXERCISES.length}
                        </p>
                        <p className="text-xs text-gray-500">{currentExercise.difficulty}</p>
                    </div>

                    <button
                        type="button"
                        aria-label="Next dictation exercise"
                        onClick={nextExercise}
                        disabled={currentExerciseIndex === DICTATION_EXERCISES.length - 1}
                        className={`p-2 rounded-lg transition-all ${
                            currentExerciseIndex === DICTATION_EXERCISES.length - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Exercise Title */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 border-2 border-pink-200">
                <h3 className="text-xl font-bold text-gray-800 text-center">
                    {currentExercise.title}
                </h3>
            </div>

            {/* Video Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-pink-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Headphones className="h-6 w-6 text-pink-600" />
                    Watch and Listen Carefully
                </h2>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        src={currentExercise.videoUrl}
                        title="Listening Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-pink-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Mic2 className="h-6 w-6 text-pink-600" />
                    Type What You Hear
                </h2>
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the text you hear from the video..."
                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none text-lg"
                    disabled={showAnswer}
                />
                
                <div className="flex gap-3 mt-4">
                    {!showAnswer ? (
                        <button
                            onClick={checkAnswer}
                            disabled={!userInput.trim()}
                            className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-95 ${
                                userInput.trim()
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setUserInput("");
                                    setShowAnswer(false);
                                    setScore(null);
                                }}
                                className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg transition-all duration-200 transform active:scale-95"
                            >
                                Try Again
                            </button>
                            {currentExerciseIndex < DICTATION_EXERCISES.length - 1 && (
                                <button
                                    onClick={nextExercise}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200 transform active:scale-95"
                                >
                                    Next Exercise →
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {showAnswer && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-pink-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Results</h2>
                    
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-6 rounded-xl mb-6">
                        <div className="text-center">
                            <p className="text-gray-700 mb-2">Your Accuracy</p>
                            <p className="text-5xl font-bold text-pink-600">{score}%</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 mb-3">Correct Text:</h3>
                        <div className="p-4 bg-gray-50 rounded-xl text-lg leading-relaxed">
                            {highlightDifferences()}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            <span className="text-green-600">● Green</span> = Correct | 
                            <span className="text-red-600"> ● Red</span> = Incorrect/Missing
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Questions Mode Component
const QuestionsMode = ({ onBack }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const currentExercise = QUESTION_EXERCISES[currentExerciseIndex];
    const questions = currentExercise.questions;

    const nextExercise = () => {
        if (currentExerciseIndex < QUESTION_EXERCISES.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setAnswers({});
            setShowResults(false);
        }
    };

    const previousExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(currentExerciseIndex - 1);
            setAnswers({});
            setShowResults(false);
        }
    };

    const handleAnswer = (questionId, optionIndex) => {
        setAnswers({ ...answers, [questionId]: optionIndex });
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct) correct++;
        });
        return Math.round((correct / questions.length) * 100);
    };

    const submitAnswers = () => {
        setShowResults(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Mode Selection
                </button>

                {/* Exercise Navigation */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Previous question exercise"
                        onClick={previousExercise}
                        disabled={currentExerciseIndex === 0}
                        className={`p-2 rounded-lg transition-all ${
                            currentExerciseIndex === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600'
                        }`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="text-center px-4">
                        <p className="text-sm font-semibold text-gray-600">
                            Exercise {currentExerciseIndex + 1} of {QUESTION_EXERCISES.length}
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Next question exercise"
                        onClick={nextExercise}
                        disabled={currentExerciseIndex === QUESTION_EXERCISES.length - 1}
                        className={`p-2 rounded-lg transition-all ${
                            currentExerciseIndex === QUESTION_EXERCISES.length - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Exercise Title */}
            <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl p-4 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 text-center">
                    {currentExercise.title}
                </h3>
            </div>

            {/* Video Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Headphones className="h-6 w-6 text-purple-600" />
                    Watch the Video
                </h2>
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        src={currentExercise.videoUrl}
                        title="Listening Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                    Answer the Questions
                </h2>

                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="p-5 bg-gray-50 rounded-xl">
                            <p className="font-bold text-gray-800 mb-4">
                                {qIndex + 1}. {q.question}
                            </p>
                            <div className="space-y-3">
                                {q.options.map((option, oIndex) => {
                                    const isSelected = answers[q.id] === oIndex;
                                    const isCorrect = q.correct === oIndex;
                                    const showCorrect = showResults && isCorrect;
                                    const showWrong = showResults && isSelected && !isCorrect;

                                    return (
                                        <button
                                            key={oIndex}
                                            onClick={() => !showResults && handleAnswer(q.id, oIndex)}
                                            disabled={showResults}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                                showCorrect
                                                    ? 'border-green-500 bg-green-100'
                                                    : showWrong
                                                    ? 'border-red-500 bg-red-100'
                                                    : isSelected
                                                    ? 'border-purple-500 bg-purple-100'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                            } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            <span className={`font-medium ${
                                                showCorrect ? 'text-green-700' :
                                                showWrong ? 'text-red-700' :
                                                isSelected ? 'text-purple-700' : 'text-gray-700'
                                            }`}>
                                                {String.fromCharCode(65 + oIndex)}. {option}
                                                {showCorrect && ' ✓'}
                                                {showWrong && ' ✗'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {!showResults ? (
                    <button
                        onClick={submitAnswers}
                        disabled={Object.keys(answers).length !== questions.length}
                        className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-95 ${
                            Object.keys(answers).length === questions.length
                                ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        Submit Answers ({Object.keys(answers).length}/{questions.length})
                    </button>
                ) : (
                    <div className="mt-6 space-y-4">
                        <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-6 rounded-xl text-center">
                            <p className="text-gray-700 mb-2">Your Score</p>
                            <p className="text-5xl font-bold text-purple-600">{calculateScore()}%</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setAnswers({});
                                    setShowResults(false);
                                }}
                                className="flex-1 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg transition-all duration-200"
                            >
                                Try Again
                            </button>
                            {currentExerciseIndex < QUESTION_EXERCISES.length - 1 && (
                                <button
                                    onClick={nextExercise}
                                    className="flex-1 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
                                >
                                    Next Exercise →
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListeningPractice;
