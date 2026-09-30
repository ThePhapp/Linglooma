// ScoreBadge.jsx
const ScoreBadge = ({ level, score }) => {
  const getBadgeColor = (level) => {
    if (level === 'Not scored') return 'bg-slate-600';
    return 'bg-green-600';
  };

  const displayScore = score > 10 ? `${score}%` : score;

  return (
    <div className="w-fit min-w-24 rounded-lg bg-slate-50 p-2 text-center">
      <div
        className={`px-2 py-1 mb-1.5 text-xs font-bold leading-6 text-white ${getBadgeColor(
          level
        )} rounded`}
      >
        {level}
      </div>
      <div className="text-xl font-bold">{displayScore}</div>
    </div>
  );
};

export default ScoreBadge;
