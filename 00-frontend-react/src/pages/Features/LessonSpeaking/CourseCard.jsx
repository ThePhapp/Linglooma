import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ChevronRight } from "lucide-react";
import PropTypes from 'prop-types';

const CourseCard = ({ title, topic, description, imageUrl, lessonId, gradient }) => {
    const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);
    
    const handleLearnClick = () => {
        if (lessonId) {
            navigate(`/admin/features/practice/${lessonId}`);
        }
    }

    return (
        <article className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 transform hover:scale-105">
            {/* Gradient Top Bar */}
            <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
            
            {/* Content */}
            <div className="p-6">
                {/* Topic Badge */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-bold shadow-md`}>
                        {topic}
                    </span>
                    <div className={`bg-gradient-to-br ${gradient} p-2 rounded-lg`}>
                        <Play className="h-5 w-5 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {title}
                </h3>

                <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 shadow-md">
                    {imageUrl && !imageFailed ? <img src={imageUrl} onError={() => setImageFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="" /> : <span aria-hidden="true" className="text-6xl">🎤</span>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {description && <p className="mb-5 text-sm leading-6 text-gray-600">{description}</p>}

                {/* Button */}
                <button
                    onClick={handleLearnClick}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95`}
                >
                    <span>Start Learning</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Hover Effect Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
        </article>
    );
};

CourseCard.propTypes = {
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    lessonId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    gradient: PropTypes.string.isRequired,
};

export default CourseCard;
