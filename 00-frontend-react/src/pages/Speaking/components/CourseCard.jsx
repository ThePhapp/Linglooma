import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ChevronRight, Mic2 } from "lucide-react";
import PropTypes from 'prop-types';

const CourseCard = ({ title, topic, description, imageUrl, lessonId }) => {
    const navigate = useNavigate();
    const [imageFailed, setImageFailed] = useState(false);
    
    const handleLearnClick = () => {
        if (lessonId) {
            navigate(`/admin/features/practice/${lessonId}`);
        }
    }

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-brand-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
                        {topic}
                    </span>
                    <div className="rounded-lg bg-slate-100 p-2">
                        <Play className="h-5 w-5 text-slate-600" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-4 text-xl font-bold text-slate-900">
                    {title}
                </h3>

                <div className="relative mb-4 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                    {imageUrl && !imageFailed ? <img src={imageUrl} onError={() => setImageFailed(true)} className="h-full w-full object-cover" alt="" /> : <Mic2 aria-hidden="true" className="h-12 w-12 text-slate-400" />}
                </div>

                {description && <p className="mb-5 text-sm leading-6 text-gray-600">{description}</p>}

                {/* Button */}
                <button
                    onClick={handleLearnClick}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                    <span>Start Learning</span>
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

        </article>
    );
};

CourseCard.propTypes = {
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    lessonId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default CourseCard;
