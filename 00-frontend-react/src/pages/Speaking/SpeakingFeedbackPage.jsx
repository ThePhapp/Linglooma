import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "@/services/apiClient";
import QuestionItem from "./components/QuestionItem";
import QuestionScoreChart from "./components/QuestionScoreChart";

const historyPath = "/admin/features/speaking/history";
const practicePath = "/admin/features/lesson";

const PronunciationFeedback = () => {
  const { lessonId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChart, setShowChart] = useState(false);

  const fetchFeedback = useCallback(async () => {
    if (!lessonId || !/^\d+$/.test(lessonId)) {
      setData(null);
      setError("This speaking result could not be found. Choose a session from your history.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/incorrectphonemes/feedback-summary", {
        params: { lessonResultId: lessonId },
      });
      if (!response || typeof response !== "object" || !Array.isArray(response.questions)) {
        throw new Error("The feedback response was not in the expected format.");
      }
      setData(response.isDemo ? { lessonInfo: null, questions: [] } : response);
    } catch (requestError) {
      setData(null);
      const status = requestError?.response?.status;
      setError(status === 404
        ? "This speaking result was not found. It may have been removed."
        : requestError?.response?.data?.message || requestError?.message || "We couldn't load feedback right now.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const questions = data?.questions ?? [];
  const scores = questions
    .map((question) => Number(question?.averageScores?.ieltsBand))
    .filter((score) => Number.isFinite(score) && score > 0);
  const averageScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
  const title = data?.lessonInfo?.lessonName || `Speaking session ${lessonId}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10" aria-labelledby="feedback-title">
      <nav aria-label="Feedback navigation" className="mb-6 flex flex-wrap gap-3">
        <Link className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600" to={historyPath}>
          ← Speaking history
        </Link>
        <Link className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2" to={practicePath}>
          Start speaking practice
        </Link>
      </nav>

      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Speaking feedback</p>
        <h1 id="feedback-title" className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        {data?.lessonInfo && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          {data.lessonInfo.finishedTime && <span>Completed: <time dateTime={data.lessonInfo.finishedTime}>{formatDate(data.lessonInfo.finishedTime)}</time></span>}
          {data.lessonInfo.lessonType && <span>Type: {data.lessonInfo.lessonType}</span>}
          {Number.isFinite(Number(data.lessonInfo.questionCount)) && <span>{data.lessonInfo.questionCount} questions</span>}
        </div>}
      </header>

      {loading ? <section className="rounded-xl border border-slate-200 bg-white p-8 text-center" role="status" aria-live="polite">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" aria-hidden="true" />
        <p className="font-medium text-slate-700">Loading speaking feedback…</p>
      </section> : error ? <section className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert" aria-live="assertive">
        <h2 className="text-lg font-semibold text-red-900">Feedback unavailable</h2>
        <p className="mt-2 text-red-800">{error}</p>
        <button type="button" onClick={fetchFeedback} className="mt-4 rounded-lg bg-red-800 px-4 py-2 font-semibold text-white hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2">Try again</button>
      </section> : questions.length === 0 ? <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="empty-title">
        <h2 id="empty-title" className="text-lg font-semibold text-slate-900">No detailed feedback for this session</h2>
        <p className="mt-2 text-slate-600">This session has no saved question level feedback yet. Your speaking history may still show its overall result.</p>
        <Link className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2" to={historyPath}>Return to speaking history</Link>
      </section> : <>
        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-700 p-5 text-white">
            <p className="text-sm text-blue-100">Session overall score</p>
            <p className="mt-1 text-3xl font-bold">{formatBand(data.lessonInfo?.lessonScore)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Average across scored questions</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{averageScore === null ? "Not available" : `${roundToHalf(averageScore).toFixed(1)} / 9`}</p>
          </div>
        </section>

        <section aria-labelledby="questions-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 id="questions-title" className="mb-4 text-xl font-bold text-slate-900">Question feedback</h2>
          <div className="hidden grid-cols-[minmax(4rem,0.5fr)_minmax(8rem,1.2fr)_minmax(8rem,0.7fr)_minmax(12rem,2fr)] gap-4 border-b border-slate-200 px-3 pb-3 text-sm font-semibold text-slate-600 md:grid">
            <span>Question</span><span>Pronunciation points</span><span>Score</span><span>Feedback</span>
          </div>
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => {
              const phonemes = Array.isArray(question?.topIncorrectPhonemes) ? question.topIncorrectPhonemes : [];
              const band = Number(question?.averageScores?.ieltsBand);
              const validBand = Number.isFinite(band) && band > 0 ? band : null;
              return <QuestionItem key={question.questionId ?? index} number={question.questionId ?? index + 1}
                falseWords={phonemes.map((item) => item?.phoneme).filter(Boolean).join("; ") || "No pronunciation points recorded"}
                level={validBand ? getLevelFromScore(validBand) : "Not scored"}
                score={validBand ? roundToHalf(validBand).toFixed(1) : "—"}
                feedback={typeof question.feedback === "string" && question.feedback.trim() ? question.feedback : "No written feedback was provided for this question."} />;
            })}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-xl font-bold text-slate-900">Session summary</h2>
          {averageScore === null ? <p className="mt-2 text-slate-600">There are no scored questions to summarize yet.</p> : <>
            <p className="mt-2 text-slate-700">Average question band: <strong>{roundToHalf(averageScore).toFixed(1)} / 9</strong> ({getLevelFromScore(averageScore)}).</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Average question band score" aria-valuemin="0" aria-valuemax="9" aria-valuenow={Math.min(9, averageScore)}>
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, (averageScore / 9) * 100)}%` }} />
            </div>
            <p className="mt-4 text-slate-700">{getSuggestion(averageScore)}</p>
          </>}
          <button type="button" className="mt-5 rounded-lg border border-blue-700 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600" aria-expanded={showChart} aria-controls="question-score-chart" onClick={() => setShowChart((shown) => !shown)}>
            {showChart ? "Hide score chart" : "Show score chart"}
          </button>
          {showChart && <div id="question-score-chart" className="mt-4"><QuestionScoreChart questions={questions} /></div>}
        </section>
      </>}
    </main>
  );
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}
function formatBand(value) {
  const band = Number(value);
  return Number.isFinite(band) && band > 0 ? `${roundToHalf(band).toFixed(1)} / 9` : "Not available";
}
function roundToHalf(value) { return Math.round(value * 2) / 2; }
function getLevelFromScore(score) {
  if (!score || score <= 0) return "Not scored";
  if (score >= 8) return "Proficient";
  if (score >= 6.5) return "Upper Intermediate";
  if (score >= 5) return "Intermediate";
  if (score >= 3) return "Elementary";
  return "Beginner";
}
function getSuggestion(score) {
  if (score < 5) return "Focus your next practice on clear individual sounds and steady pacing. Repeating short recordings can help you notice changes.";
  if (score < 7) return "Work on word stress and sentence intonation. Record a short answer again and compare its rhythm and clarity.";
  return "Keep practicing with longer, spontaneous answers and maintain clear stress and natural pacing.";
}

export default PronunciationFeedback;
