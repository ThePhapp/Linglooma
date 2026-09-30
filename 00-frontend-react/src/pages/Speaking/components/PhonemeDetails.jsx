const PhonemeDetails = ({ phonemeDetails }) => {
  if (!phonemeDetails || phonemeDetails.length === 0) return null;

  const groupedByWord = phonemeDetails.reduce((acc, item) => {
    if (!acc[item.wordIndex]) acc[item.wordIndex] = { word: item.word, phonemes: [] };
    acc[item.wordIndex].phonemes.push(item);
    return acc;
  }, {});

  return (
    <div className="mt-8 bg-gray-100 rounded p-4 shadow-inner max-h-64 overflow-y-auto">
      <h4 className="font-bold mb-2 text-blue-800 text-center">Phoneme Details</h4>
      {Object.values(groupedByWord).map(({ word, phonemes }, idx) => (
        <div key={idx} className="mb-4">
          <div className="font-semibold text-lg mb-1">Word: "{word}"</div>
          <div className="flex flex-wrap gap-3">
            {phonemes.map(({ phoneme, accuracyScore, errorType }, i) => (
              <div
                key={i}
                className={`p-2 rounded border ${errorType === "Good"
                  ? "border-green-500 text-green-600"
                  : "border-red-500 text-red-600"
                  }`}
                title={`Error type: ${errorType}`}
              >
                <div>IPA: <strong>{phoneme}</strong></div>
                <div>Score: {accuracyScore.toFixed(1)}%</div>
                <div>Status: {errorType}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhonemeDetails;
