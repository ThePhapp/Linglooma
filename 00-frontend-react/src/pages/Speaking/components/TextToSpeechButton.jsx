import { Volume2 } from "lucide-react";

const TextToSpeechButton = ({ text }) => {
  const speak = () => {
    if (!window.speechSynthesis) {
      alert("Trình duyệt của bạn không hỗ trợ chức năng này.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const davidVoice = voices.find(
    voice => voice.name.toLowerCase().includes("mark") && voice.lang === "en-US"
  );

  const selectedVoice = davidVoice || voices.find(voice => voice.lang === "en-US") || voices[0];

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      className="ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label="Play text to speech"
      title="Nghe mẫu giọng đọc"
    >
      <Volume2 aria-hidden="true" className="h-5 w-5" />
    </button>
  );
};

export default TextToSpeechButton;
