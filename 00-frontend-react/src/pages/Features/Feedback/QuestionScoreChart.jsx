import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const QuestionScoreChart = ({ questions }) => {
    const chartData = questions.map((q) => ({
        name: `Q${q.questionId}`,
        score: Number.isFinite(Number(q?.averageScores?.ieltsBand)) ? Number(q.averageScores.ieltsBand) : 0,
    }));

    return (
        <div className="w-full min-w-0 overflow-hidden rounded-lg bg-white p-3 sm:p-4">
            <h3 className="mb-3 text-lg font-bold">Question scores by session</h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 9]} tickCount={10} />
                    <Tooltip />
                    <Bar dataKey="score">
                        {chartData.map((entry, index) => {
                            let color = "#22c55e"; // green
                            if (entry.score < 4) color = "#ef4444"; // red
                            else if (entry.score <= 6) color = "#facc15"; // yellow

                            return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4">
                <LegendItem color="#ef4444" label="Below 4" />
                <LegendItem color="#facc15" label="4 to 6" />
                <LegendItem color="#22c55e" label="Above 6" />
            </div>
        </div>
    );
};

// Legend item component
const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: color }}></span>
        <span className="text-sm">{label}</span>
    </div>
);

export default QuestionScoreChart;
