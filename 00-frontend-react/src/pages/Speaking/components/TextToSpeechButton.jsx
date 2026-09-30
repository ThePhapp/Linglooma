import { FaVolumeUp } from "react-icons/fa";

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
      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
      aria-label="Play text to speech"
      title="Nghe mẫu giọng đọc"
    >
      <FaVolumeUp size={20} />
    </button>
  );
};

export default TextToSpeechButton;
