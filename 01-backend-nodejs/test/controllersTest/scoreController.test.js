jest.mock("fs");
jest.mock("../../utils/fileUtils");
jest.mock("../../services/azurePronunciationService");
jest.mock("../../services/geminiFeedbackService");
jest.mock("../../services/ieltsScoringService");
jest.mock("../../services/miscueService");
jest.mock("../../utils/analyzePhonemes");
jest.mock("../../utils/wordsAssessmentHelper");
jest.mock("../../utils/phonemeErrorCounter");

const fs = require("fs");
const path = require("path");

const {
  saveBase64AudioToFile, audioSize
} = require("../../utils/fileUtils");

const {
  assessPronunciation
} = require("../../services/azurePronunciationService");

const {
  calculateIELTSBand
} = require("../../services/ieltsScoringService");

const {
  findMismatchedWords
} = require("../../services/miscueService");

const {
  analyzePhonemes
} = require("../../utils/analyzePhonemes");

const {
  vietnameseWordsAssessment
} = require("../../utils/wordsAssessmentHelper");

const {
  countPhonemeErrors
} = require("../../utils/phonemeErrorCounter");

const { scoreAudio } = require("../../controllers/scoreController"); // đường dẫn thay đổi theo bạn
const { getGeminiFeedback } = require('../../services/geminiFeedbackService');

describe("scoreAudio", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
    require('../helpers/expectedConsole')('log', ['🎤 scoreAudio request:', '📁 Creating temp directory:', '✅ Audio file saved:', '🧠 Getting Gemini feedback...', '✅ scoreAudio completed successfully, band:']);
    require('../helpers/expectedConsole')('error', ['❌ scoreAudio:', 'Score audio failed']);
    audioSize.mockReturnValue(10);
    fs.promises = { unlink: jest.fn().mockResolvedValue() };
    getGeminiFeedback.mockResolvedValue('Good job');
  });

  it("Trả về lỗi 400 nếu thiếu audio", async () => {
    req.body = {
      referenceText: "hello",
      questionId: 1,
      index: 1
    };
    await scoreAudio(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Thiếu dữ liệu audio" });
  });

  it("Trả về lỗi 400 nếu thiếu referenceText", async () => {
    req.body = {
      audio: "base64string",
      referenceText: "   ", // trắng
      questionId: 1,
      index: 1
    };
    await scoreAudio(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Thiếu câu mẫu (referenceText)" });
  });

  it("Trả về lỗi 400 nếu thiếu questionId", async () => {
    req.body = {
      audio: "base64string",
      referenceText: "text",
      index: 1
    };
    await scoreAudio(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Thiếu questionId" });
  });

  it("Trả về lỗi 400 nếu thiếu index", async () => {
    req.body = {
      audio: "base64string",
      referenceText: "text",
      questionId: 1,
      index: null
    };
    await scoreAudio(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Thiếu curentIndex" });
  });

  it("Xử lý thành công và trả về kết quả", async () => {
    req.body = {
      audio: "base64string",
      referenceText: "reference text",
      questionId: 123,
      index: 0
    };

    // Mock các hàm
    saveBase64AudioToFile.mockResolvedValue();
    assessPronunciation.mockResolvedValue({
      assessment: {
        AccuracyScore: 90,
        FluencyScore: 85,
        CompletenessScore: 80,
        PronScore: 88
      },
      transcriptText: "transcript",
      wordsAssessment: [{ word: "hello", correct: true }]
    });

    findMismatchedWords.mockReturnValue(["word1", "word2"]);
    calculateIELTSBand.mockReturnValue({
      band: 7,
      totalScore: '6.97'
    });
    analyzePhonemes.mockReturnValue({ some: "data" });
    vietnameseWordsAssessment.mockReturnValue(["đánh giá"]);
    countPhonemeErrors.mockReturnValue({ p: 2 });

    await scoreAudio(req, res);

    expect(saveBase64AudioToFile).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    expect(assessPronunciation).toHaveBeenCalledWith(expect.any(String), "reference text");
    expect(findMismatchedWords).toHaveBeenCalledWith("reference text", "transcript");
    expect(calculateIELTSBand).toHaveBeenCalledWith({
      AccuracyScore: 90,
      FluencyScore: 85,
      CompletenessScore: 80,
      PronScore: 88
    });
    expect(analyzePhonemes).toHaveBeenCalledWith({
      AccuracyScore: 90,
      FluencyScore: 85,
      CompletenessScore: 80,
      PronScore: 88
    });
    expect(vietnameseWordsAssessment).toHaveBeenCalledWith([{ word: "hello", correct: true }]);
    expect(countPhonemeErrors).toHaveBeenCalledWith([{ word: "hello", correct: true }]);
    const savedPath = saveBase64AudioToFile.mock.calls[0][1];
    expect(path.dirname(savedPath)).toBe(path.resolve(__dirname, '../../temp'));
    expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    expect(fs.promises.unlink).toHaveBeenCalledWith(savedPath);
    expect(getGeminiFeedback).toHaveBeenCalledWith({
      ieltsResult: { band: 7, totalScore: '6.97' },
      assessment: { AccuracyScore: 90, FluencyScore: 85, CompletenessScore: 80, PronScore: 88 },
      transcriptText: 'transcript', miscueWords: ['word1', 'word2'],
    });

    expect(res.json).toHaveBeenCalledWith({
      score: 7,
      rawScore: '6.97',
      feedback: "Good job",
      accuracyScore: 90,
      fluencyScore: 85,
      completenessScore: 80,
      pronScore: 88,
      transcript: "transcript",
      miscueWords: ["word1", "word2"],
      phonemeDetails: { some: "data" },
      wordsAssessment: ["đánh giá"],
      incorrectPhonemes: [{ word: "hello", correct: true }],
      err: { p: 2 }
    });
  });

  it("Trả về lỗi 500 nếu có exception", async () => {
    req.body = {
      audio: "base64string",
      referenceText: "reference text",
      questionId: 1,
      index: 0
    };

    saveBase64AudioToFile.mockRejectedValue(new Error("Lỗi ghi file"));

    await scoreAudio(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Không nhận dạng được giọng nói" });
    expect(fs.promises.unlink).toHaveBeenCalled();
  });

  it('removes audio when recognition fails without exposing provider details', async () => {
    req.body = { audio: 'dGVzdA==', referenceText: 'hello', questionId: 1, index: 0 };
    saveBase64AudioToFile.mockResolvedValue();
    assessPronunciation.mockRejectedValue(new Error('secret provider body'));
    await scoreAudio(req, res);
    expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Không nhận dạng được giọng nói' });
  });

  it('rejects large decoded audio before saving it', async () => {
    req.body = { audio: 'dGVzdA==', referenceText: 'hello', questionId: 1, index: 0 };
    audioSize.mockReturnValue(5 * 1024 * 1024 + 1);
    await scoreAudio(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(saveBase64AudioToFile).not.toHaveBeenCalled();
    expect(assessPronunciation).not.toHaveBeenCalled();
    expect(fs.promises.unlink).not.toHaveBeenCalled();
  });

  it('removes the saved audio when feedback generation fails', async () => {
    req.body = { audio: 'dGVzdA==', referenceText: 'hello', questionId: 1, index: 0 };
    saveBase64AudioToFile.mockResolvedValue();
    assessPronunciation.mockResolvedValue({ assessment: {}, transcriptText: 'hello', wordsAssessment: [] });
    calculateIELTSBand.mockReturnValue({ band: 0, totalScore: '0.00' });
    getGeminiFeedback.mockRejectedValue(new Error('private provider detail'));
    await scoreAudio(req, res);
    expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    expect(fs.promises.unlink).toHaveBeenCalledWith(saveBase64AudioToFile.mock.calls[0][1]);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ error: 'Không nhận dạng được giọng nói' });
  });
});
