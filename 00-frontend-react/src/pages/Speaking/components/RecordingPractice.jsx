import { useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Send, Square } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import apiClient from '@/services/apiClient';
import HighlightTextWithTooltip from './HighlightText';
import ResultPDFDownloader from './ResultPDFDownloader';
import TextToSpeechButton from './TextToSpeechButton';

const formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const RecordingPractice = ({ currentQuestion, referenceText, onScore, currentIndex, setLoading, mode = 'practice' }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [status, setStatus] = useState('Choose a question, then start recording.');
  const [statusTone, setStatusTone] = useState('neutral');
  const [scoreData, setScoreData] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [prepRemaining, setPrepRemaining] = useState(60);
  const [notes, setNotes] = useState('');
  const recorderRef = useRef(null);
  const audioURLRef = useRef(null);
  const { lessonId } = useParams();

  const releaseAudioURL = () => {
    if (audioURLRef.current) URL.revokeObjectURL(audioURLRef.current);
    audioURLRef.current = null;
  };
  const stopMediaTracks = recorder => recorder?.stream?.getTracks().forEach(track => track.stop());

  useEffect(() => () => {
    releaseAudioURL();
    stopMediaTracks(recorderRef.current);
    recorderRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    if (!preparing || prepRemaining <= 0) return undefined;
    const timer = window.setInterval(() => setPrepRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [preparing, prepRemaining]);

  useEffect(() => {
    if (!currentQuestion) return;
    setStatus('Ready to record your response.');
    setStatusTone('neutral');
    setScoreData(null);
    setElapsed(0);
    setPreparing(false);
    setPrepRemaining(60);
    setNotes('');
  }, [currentQuestion?.id]);

  const resetRecording = () => {
    stopMediaTracks(recorderRef.current);
    recorderRef.current?.destroy?.();
    recorderRef.current = null;
    releaseAudioURL();
    setAudioURL(null);
    setScoreData(null);
    setElapsed(0);
    setStatus('Ready to record a new response.');
    setStatusTone('neutral');
  };

  const startRecording = async () => {
    if (!currentQuestion) {
      setStatus('Choose a question before recording.');
      setStatusTone('error');
      return;
    }
    try {
      resetRecording();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!stream.active) throw new Error('Microphone stream is unavailable');
      recorderRef.current = new RecordRTC(stream, { type: 'audio', mimeType: 'audio/wav', recorderType: RecordRTC.StereoAudioRecorder, desiredSampRate: 16000, numberOfAudioChannels: 1 });
      recorderRef.current.startRecording();
      setPreparing(false);
      setRecording(true);
      setStatus('Recording in progress. Speak clearly, then choose Stop recording.');
      setStatusTone('recording');
    } catch {
      setStatus('Microphone access is unavailable. Check your browser permission and try again.');
      setStatusTone('error');
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current || !recording) return;
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      releaseAudioURL();
      const url = URL.createObjectURL(blob);
      audioURLRef.current = url;
      setAudioURL(url);
      setRecording(false);
      setStatus('Recording ready. Review the audio, then submit it for feedback.');
      setStatusTone('ready');
      stopMediaTracks(recorderRef.current);
    });
  };

  useEffect(() => {
    if ((mode === 'part2' || mode === 'mock') && recording && elapsed >= 120) stopRecording();
  }, [elapsed, mode, recording]);

  const blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });

  const sendAudioToBackend = async () => {
    if (!recorderRef.current || !audioURL || !currentQuestion) return;
    setSubmitting(true);
    setLoading(true);
    setStatus('Analyzing your response. Keep this page open.');
    setStatusTone('processing');

    try {
      const data = await apiClient.post('/api/score-audio', {
        audio: await blobToBase64(recorderRef.current.getBlob()),
        referenceText,
        questionId: currentQuestion.id,
        index: currentIndex,
      });
      if (!data?.wordsAssessment) throw new Error('The analysis response was incomplete.');

      setScoreData(data);
      onScore?.(data);
      setStatus('Analysis complete. Your feedback is shown below.');
      setStatusTone('success');

      try {
        const lessonResult = await apiClient.post('/api/lessons/results', { lessonId, finishedTime: new Date().toISOString(), averageScore: data.score, feedback: data.feedback });
        if (!lessonResult?.id) throw new Error('Lesson result was not saved');
        const questionResult = await apiClient.post('/api/questions/results', { lessonResultId: lessonResult.id, questionId: currentQuestion.id, ieltsBand: data.score, accuracy: data.accuracyScore, fluency: data.fluencyScore, completeness: data.completenessScore, pronunciation: data.pronScore, feedback: data.feedback });
        if (!questionResult?.id) throw new Error('Question result was not saved');
        if (data.err && Object.keys(data.err).length > 0) await apiClient.post('/api/incorrectphonemes/add', { phoneme: data.err, questionResultId: questionResult.id, lessonResultId: lessonResult.id, questionId: currentQuestion.id });
      } catch (historyError) {
        setStatus('Feedback is ready, but this attempt could not be saved to history.');
        setStatusTone('warning');
        toast.warning(historyError?.response?.data?.message || 'Your score is available, but saving history failed.');
      }
    } catch (error) {
      setScoreData(null);
      setStatus(error?.response?.data?.message || error.message || 'We couldn’t analyze this recording. Please try again.');
      setStatusTone('error');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const toneClasses = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
    recording: 'border-red-200 bg-red-50 text-red-800',
    ready: 'border-blue-200 bg-blue-50 text-blue-800',
    processing: 'border-brand-200 bg-brand-50 text-brand-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-800',
  };

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="recording-heading">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-sm font-semibold text-brand-700">Response workspace</p><h2 id="recording-heading" className="mt-1 text-xl font-bold text-slate-950">Record your answer</h2></div>
        <div className={`rounded-full px-3 py-1 text-sm font-semibold ${recording ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>{recording ? `Recording ${formatDuration(elapsed)}` : formatDuration(elapsed)}</div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-base font-medium leading-7 text-slate-900 sm:text-lg">
            {scoreData?.wordsAssessment?.length ? <HighlightTextWithTooltip text={referenceText} wordsAssessment={scoreData.wordsAssessment} /> : referenceText}
          </div>
          {currentQuestion && <TextToSpeechButton text={referenceText} />}
        </div>
      </div>

      <div className={`mt-5 rounded-lg border px-4 py-3 text-sm leading-6 ${toneClasses[statusTone]}`} aria-live="polite">
        <span className="flex items-center gap-2">{recording && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />}{status}</span>
      </div>

      {mode === 'part2' && !recording && !audioURL && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-amber-950">Preparation</p><p className="mt-1 text-sm text-amber-800">Write keywords only. Notes are not submitted.</p></div><span className="text-2xl font-bold text-amber-900">{formatDuration(prepRemaining)}</span></div><textarea value={notes} onChange={event => setNotes(event.target.value)} className="form-control mt-3 min-h-20" placeholder="Keywords and ideas…" /><Button size="small" variant="secondary" className="mt-3" onClick={() => setPreparing(value => !value)} disabled={prepRemaining === 0}>{preparing ? 'Pause preparation' : prepRemaining < 60 ? 'Continue preparation' : 'Start 1-minute preparation'}</Button></div>}

      {recording && <div aria-hidden="true" className="mt-5 flex h-12 items-center justify-center gap-1.5">{[3, 7, 5, 10, 6, 12, 8, 4, 9, 5, 11, 7].map((height, index) => <span key={index} className="w-1.5 animate-pulse rounded-full bg-red-500" style={{ height: `${height * 3}px`, animationDelay: `${index * 70}ms` }} />)}</div>}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!recording && !audioURL && <Button onClick={startRecording} disabled={!currentQuestion} className="sm:flex-1"><Mic className="h-4 w-4" aria-hidden="true" /> Start recording</Button>}
        {recording && <Button variant="danger" onClick={stopRecording} className="sm:flex-1"><Square className="h-4 w-4" aria-hidden="true" /> Stop recording</Button>}
        {!recording && audioURL && <>
          <Button variant="secondary" onClick={resetRecording}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Record again</Button>
          <Button onClick={sendAudioToBackend} isLoading={submitting} className="sm:flex-1"><Send className="h-4 w-4" aria-hidden="true" /> {submitting ? 'Analyzing response…' : 'Submit for feedback'}</Button>
        </>}
      </div>

      {audioURL && !recording && <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Review recording</p><audio controls src={audioURL} className="w-full" /></div>}
      {scoreData && <div className="mt-4"><ResultPDFDownloader scoreData={scoreData} /></div>}
    </section>
  );
};

export default RecordingPractice;
