// QuestionItem.jsx
import ScoreBadge from './ScoreBadge';

const QuestionItem = ({ number, falseWords, level, score, feedback }) => {
  return (
    <article className="grid gap-3 py-4 md:grid-cols-[minmax(4rem,0.5fr)_minmax(8rem,1.2fr)_minmax(8rem,0.7fr)_minmax(12rem,2fr)] md:items-center md:gap-4">
      <div className="flex items-center gap-2 font-semibold text-slate-700 md:block">
        <span className="text-xs uppercase text-slate-500 md:hidden">Question</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg text-blue-900">{number}</span>
      </div>
      <div className="min-w-0 break-words rounded-lg bg-slate-50 p-3 text-slate-800">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 md:hidden">Pronunciation points</span>
        {falseWords}
      </div>
      <div><span className="mb-1 block text-xs font-semibold uppercase text-slate-500 md:hidden">Score</span><ScoreBadge level={level} score={score} /></div>
      <div className="min-w-0 break-words rounded-lg bg-cyan-50 p-3 text-slate-800">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500 md:hidden">Feedback</span>
        {feedback}
      </div>
    </article>
  );
};

export default QuestionItem;
