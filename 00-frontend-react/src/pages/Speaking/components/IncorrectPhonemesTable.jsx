const IncorrectPhonemesTable = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxPhonemes = data.reduce(
        (max, item) => Math.max(max, item.phonemes.length),
        0
    );
    const phonemeHeaders = Array.from({ length: maxPhonemes }, (_, i) => `Phoneme ${i + 1}`);

    return (
        <div className="mb-8 bg-white rounded shadow p-4 overflow-x-auto max-w-[1200px] max-h-[900px] border border-red-300">
            <h4 className="text-red-700 font-bold mb-3 text-center">
                Incorrect Phonemes Detail
            </h4>
            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-red-100">
                        <th className="border border-gray-300 px-3 py-1 text-left">Word</th>
                        <th className="border border-gray-300 px-3 py-1">Accuracy Score</th>
                        <th className="border border-gray-300 px-3 py-1">Error Type</th>
                        {phonemeHeaders.map((header) => (
                            <th key={header} className="border border-gray-300 px-3 py-1 text-center">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(({ word, accuracyScore, errorType, phonemes }, idx) => (
                        <tr key={idx} className={errorType !== "None" ? "bg-red-50" : ""}>
                            <td className="border border-gray-300 px-3 py-1 font-medium">{word}</td>
                            <td className="border border-gray-300 px-3 py-1 text-center">{accuracyScore}</td>
                            <td className="border border-gray-300 px-3 py-1 text-center">{errorType}</td>

                            {Array.from({ length: maxPhonemes }).map((_, i) => {
                                const p = phonemes[i];
                                if (!p) return <td key={i} className="border border-gray-300 px-3 py-1"></td>;

                                const isLowScore = p.accuracyScore < 50;
                                const isErrorType = p.errorType !== "None";

                                let className = "px-3 py-1 border border-gray-300 text-center text-gray-600";

                                if (isErrorType) {
                                    className += " bg-red-200 text-red-800 font-semibold";
                                }

                                if (isLowScore) {
                                    className += " bg-yellow-300 text-yellow-900 font-bold";
                                }

                                return (
                                    <td key={i} className={className} title={`Score: ${p.accuracyScore.toFixed(1)}%, Error: ${p.errorType}`}>
                                        {p.phoneme}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IncorrectPhonemesTable;
