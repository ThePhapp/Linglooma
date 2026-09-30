import { useState } from 'react';
import { Award, LoaderCircle, MessageSquareText, Target, TrendingUp, Zap } from 'lucide-react';
import IncorrectPhonemesTable from './components/IncorrectPhonemesTable';
import PhonemeDetails from './components/PhonemeDetails';
import RecordingPractice from './components/RecordingPractice';
import SpeakingGrid from './components/SpeakingGrid';

const SpeakingPracticePage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const scores = scoreData ? [
    { label: 'Accuracy', value: scoreData.accuracyScore, icon: Zap, style: 'bg-blue-50 text-blue-800 border-blue-200' },
    { label: 'Fluency', value: scoreData.fluencyScore, icon: TrendingUp, style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { label: 'Completeness', value: scoreData.completenessScore, icon: Target, style: 'bg-violet-50 text-violet-800 border-violet-200' },
    { label: 'Pronunciation', value: scoreData.pronScore, icon: Award, style: 'bg-amber-50 text-amber-900 border-amber-200' },
  ].filter(item => item.value != null) : [];

  return (
    <div className="page-shell max-w-[1440px]">
      <header>
        <p className="text-sm font-semibold text-brand-700">Speaking</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">IELTS Speaking Practice</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Choose a question, record your answer, review the audio, then submit it for pronunciation feedback.</p>
      </header>

      {loading && <div role="status" className="mt-6 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /><span><strong>Analyzing your response…</strong> Keep this page open while your feedback is prepared.</span></div>}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
        <RecordingPractice currentQuestion={currentQuestion} currentIndex={currentIndex} referenceText={currentQuestion?.content || 'Choose a question from the question panel to begin.'} onScore={setScoreData} setLoading={setLoading} />
        <SpeakingGrid setCurrentQuestion={setCurrentQuestion} setCurrentIndex={setCurrentIndex} />
      </div>

      {scoreData && !loading && (
        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="speaking-results-heading">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold text-brand-700">Analysis complete</p><h2 id="speaking-results-heading" className="mt-1 text-2xl font-bold text-slate-950">Your speaking results</h2></div>
              {scoreData.score != null && <div className="rounded-xl border border-brand-200 bg-brand-50 px-6 py-4 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-brand-800">IELTS band</p><p className="mt-1 text-4xl font-bold text-brand-800">{scoreData.score}</p></div>}
            </div>

            {scores.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{scores.map(({ label, value, icon: Icon, style }) => <div key={label} className={`rounded-lg border p-4 ${style}`}><Icon className="h-5 w-5" aria-hidden="true" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}</div>}

            {scoreData.feedback && <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"><h3 className="flex items-center gap-2 font-bold text-slate-950"><MessageSquareText className="h-5 w-5 text-brand-700" aria-hidden="true" /> Feedback</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{scoreData.feedback}</p></div>}
          </section>

          {scoreData.phonemeDetails && <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><PhonemeDetails phonemeDetails={scoreData.phonemeDetails} /></section>}
          {scoreData.incorrectPhonemes?.length > 0 && <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><IncorrectPhonemesTable data={scoreData.incorrectPhonemes} /></section>}
        </div>
      )}
    </div>
  );
};

export default SpeakingPracticePage;
