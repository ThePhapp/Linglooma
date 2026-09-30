const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const { saveBase64AudioToFile, audioSize, MAX_AUDIO_BYTES } = require("../utils/fileUtils");
const { assessPronunciation } = require("../services/azurePronunciationService");
const { calculateIELTSBand } = require("../services/ieltsScoringService");
const { findMismatchedWords } = require("../services/miscueService");
const { analyzePhonemes } = require("../utils/analyzePhonemes");
const { vietnameseWordsAssessment } = require("../utils/wordsAssessmentHelper");
const { countPhonemeErrors } = require('../utils/phonemeErrorCounter');
const { getGeminiFeedback } = require("../services/geminiFeedbackService");

exports.scoreAudio = async (req, res) => {
  let filepath;
  try {
    const { audio, referenceText, questionId, index } = req.body || {};

    // Validation
    if (!audio) {
      return res.status(400).json({ error: "Thiếu dữ liệu audio" });
    }
    const bytes = audioSize(audio);
    if (bytes < 0) return res.status(400).json({ error: 'Dữ liệu audio không hợp lệ' });
    if (bytes > MAX_AUDIO_BYTES) return res.status(413).json({ error: 'Audio quá lớn' });
    if (!referenceText || typeof referenceText !== 'string' || referenceText.trim() === "") {
      return res.status(400).json({ error: "Thiếu câu mẫu (referenceText)" });
    }
    if (referenceText.length > 2000) return res.status(413).json({ error: 'Câu mẫu quá dài' });
    if (!questionId) {
      return res.status(400).json({ error: "Thiếu questionId" });
    }
    if (!/^[1-9]\d*$/.test(String(questionId)) || !Number.isSafeInteger(Number(questionId))) return res.status(400).json({ error: 'questionId không hợp lệ' });
    if (index === null || index === undefined) {
      return res.status(400).json({ error: "Thiếu curentIndex" });
    }
    if (!/^(0|[1-9]\d*)$/.test(String(index)) || !Number.isSafeInteger(Number(index))) return res.status(400).json({ error: 'curentIndex không hợp lệ' });


    const filename = `audio_${crypto.randomUUID()}.wav`;
    filepath = path.join(__dirname, "..", "temp", filename);

    // Check if temp directory exists
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await saveBase64AudioToFile(audio, filepath);

    const { assessment, transcriptText, wordsAssessment } = await assessPronunciation(filepath, referenceText);

    const miscueWordsFromTranscript = findMismatchedWords(referenceText, transcriptText);

    const ieltsResult = calculateIELTSBand(assessment);
    const phonemeDetails = analyzePhonemes(assessment);
    const wordsAssessmentVn = vietnameseWordsAssessment(wordsAssessment);
    const errorMap = countPhonemeErrors(wordsAssessment);
    
    const geminiFeedback = await getGeminiFeedback({
      ieltsResult,
      assessment,
      transcriptText,
      miscueWords: miscueWordsFromTranscript,
    });

    res.json({
      score: ieltsResult.band,
      rawScore: ieltsResult.totalScore,
      feedback: geminiFeedback || "Không có phản hồi từ Gemini",
      accuracyScore: assessment.AccuracyScore || null,
      fluencyScore: assessment.FluencyScore || null,
      completenessScore: assessment.CompletenessScore || null,
      pronScore: assessment.PronScore || null,
      transcript: transcriptText,
      miscueWords: miscueWordsFromTranscript,
      phonemeDetails,
      wordsAssessment: wordsAssessmentVn,
      incorrectPhonemes: wordsAssessment,
      err: errorMap,
    });
  } catch (error) {
    console.error('Audio scoring failed');
    res.status(500).json({ error: "Không nhận dạng được giọng nói" });
  } finally {
    if (filepath) {
      try { await fs.promises.unlink(filepath); }
      catch (error) { if (error.code !== 'ENOENT') console.error('Temp audio cleanup failed'); }
    }
  }
};
