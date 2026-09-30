import React, { useState, useRef, useEffect } from "react";
import RecordRTC from "recordrtc";
import { FaMicrophone } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import HighlightTextWithTooltip from "./HighlightText";
import TextToSpeechButton from "./TextToSpeechButton";
import axios from "@/utils/axios.customize";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import ResultPDFDownloader from "./ResultPDFDownloader";
import { Play, Square, Send, Volume2, Download } from "lucide-react";

const RecordingPractice = ({ currentQuestion, referenceText, onScore, currentIndex, setLoading }) => {
  const [lessonImage, setLessonImage] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [status, setStatus] = useState("Ready to record");
  const [scoreData, setScoreData] = useState(null);
  const recorderRef = useRef(null);
  const audioRef = useRef(null);
  const audioURLRef = useRef(null);
  const { lessonId } = useParams();

  const releaseAudioURL = () => {
    if (audioURLRef.current) {
      URL.revokeObjectURL(audioURLRef.current);
      audioURLRef.current = null;
    }
  };

  const stopMediaTracks = (recorder) => {
    recorder?.stream?.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => () => {
    releaseAudioURL();
    stopMediaTracks(recorderRef.current);
    recorderRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    const fetchLessonImage = async () => {
      try {
        const res = await axios.get("/api/lessons/all");

        const matchedLesson = res.find(
          (lesson) => lesson.id === parseInt(lessonId)
        );

        if (matchedLesson) {
          setLessonImage(matchedLesson.image);
        } else {
          toast.warn("Lesson ID not found in data.");
        }
      } catch (err) {
        toast.error("Failed to load lesson data", err);
      }
    };

    fetchLessonImage();
  }, [lessonId]);

  const startRecording = async () => {
    try {
      stopMediaTracks(recorderRef.current);
      recorderRef.current?.destroy?.();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!stream.active) throw new Error("Microphone stream is unavailable");
      recorderRef.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
      });
      recorderRef.current.startRecording();
      releaseAudioURL();
      setAudioURL(null);
      setRecording(true);
      setStatus("Recording...");
      setScoreData(null);
      setAudioURL(null);
    } catch (err) {
      setStatus("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      releaseAudioURL();
      const url = URL.createObjectURL(blob);
      audioURLRef.current = url;
      setAudioURL(url);
      setRecording(false);
      setStatus("Recording stopped");

      stopMediaTracks(recorderRef.current);
    });
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });

  const sendAudioToBackend = async () => {
    if (!recorderRef.current) {
      setStatus("No recording found");
      return;
    }

    setStatus("Sending audio to server...");
    setLoading(true);

    try {
      const blob = recorderRef.current.getBlob();
      const base64Audio = await blobToBase64(blob);

      const data = await axios.post("/api/score-audio", {
        audio: base64Audio,
        referenceText,
        questionId: currentQuestion?.id,
        index: currentIndex,
      });

      if (data?.wordsAssessment) {
        setScoreData(data);
        setStatus("Results received");
        if (onScore) onScore(data);

        try {
          const lessonResult = await axios.post('/api/lessons/results', {
            lessonId,
            finishedTime: new Date().toISOString(),
            averageScore: data.score,
            feedback: data.feedback,
          });

          if (!lessonResult?.id) throw new Error('Lesson result was not saved');

          const questionResult = await axios.post('/api/questions/results', {
            lessonResultId: lessonResult.id,
            questionId: currentQuestion.id,
            ieltsBand: data.score,
            accuracy: data.accuracyScore,
            fluency: data.fluencyScore,
            completeness: data.completenessScore,
            pronunciation: data.pronScore,
            feedback: data.feedback,
          });

          if (!questionResult?.id) throw new Error('Question result was not saved');

          if (data.err && Object.keys(data.err).length > 0) {
            await axios.post('/api/incorrectphonemes/add', {
              phoneme: data.err,
              questionResultId: questionResult.id,
              lessonResultId: lessonResult.id,
              questionId: currentQuestion.id,
            });
          }
        } catch (historyError) {
          setStatus("Results received, but history could not be saved");
          toast.warning(historyError?.response?.data?.message || "Your score is available, but saving history failed.");
        }

      } else {
        setStatus("Error: Invalid response data");
        toast.error("Invalid response data");
        setScoreData(null);
      }

    } catch (err) {
      setStatus("Connection error: " + err.message);
      toast.error(err.message);
      setScoreData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200 h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
            <FaMicrophone className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Recording Practice
          </h2>
        </div>
      </div>

      {/* Reference Text */}
      <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 text-lg font-medium text-gray-800 select-text leading-relaxed">
            {scoreData?.wordsAssessment?.length > 0 ? (
              <HighlightTextWithTooltip
                text={referenceText}
                wordsAssessment={scoreData.wordsAssessment}
              />
            ) : (
              <span>{referenceText}</span>
            )}
          </div>
          <TextToSpeechButton text={referenceText} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6 flex-1">
        {/* Recording Button */}
        <div className="relative">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex justify-center items-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95"
              aria-label="Start Recording"
            >
              <FaMicrophone size={40} />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex justify-center items-center w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 animate-pulse"
              aria-label="Stop Recording"
            >
              <FaMicrophone size={40} />
            </button>
          )}
          {recording && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 ${
              recording
                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Square className="h-4 w-4" />
            <span>Stop</span>
          </button>

          <button
            onClick={playAudio}
            disabled={!audioURL}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 ${
              audioURL
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Play</span>
          </button>

          <button
            onClick={sendAudioToBackend}
            disabled={!audioURL}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 ${
              audioURL
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Submit</span>
          </button>

          <ResultPDFDownloader scoreData={scoreData} />
        </div>

        {/* Status */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
            recording 
              ? "bg-red-100 text-red-700" 
              : audioURL 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-700"
          }`}>
            {recording && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
            <span>{status}</span>
          </div>
        </div>

        {/* Audio Player */}
        {audioURL && (
          <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
            <audio
              ref={audioRef}
              controls
              src={audioURL}
              className="w-full"
            />
          </div>
        )}

        {/* Lesson Image */}
        {lessonImage && (
          <div className="w-full flex justify-center mt-4">
            <img 
              src={lessonImage} 
              alt="Lesson illustration" 
              className="rounded-2xl shadow-lg max-w-md w-full border-2 border-purple-200" 
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default RecordingPractice;
