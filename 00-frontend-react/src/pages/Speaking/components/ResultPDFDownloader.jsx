import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ResultPDFDownloader = ({ scoreData }) => {
  const addHeaderFooter = (doc, studentName) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Header
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("Linglooma", 14, 12);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text(
        `Generated for: ${studentName || "Student"} | Page ${i} of ${pageCount} | ${new Date().toLocaleDateString()}`,
        14,
        pageHeight - 10
      );
    }
  };

  // Highlight transcript
  const renderTranscript = (doc, transcript, wordsAssessment, startY) => {
    let x = 14;
    let y = startY;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const words = transcript.split(" ");

    words.forEach((word) => {
      let color = [0, 0, 0];
      const match = wordsAssessment?.find(
        (w) => w.word.toLowerCase() === word.toLowerCase()
      );
      if (match) {
        if (match.errorType === "None") color = [0, 128, 0];
        else color = [200, 0, 0];
      }

      const wordWidth = doc.getTextWidth(word + " ");
      if (x + wordWidth > pageWidth - 14) {
        x = 14;
        y += 8;
      }

      if (y > pageHeight - 20) {
        doc.addPage();
        x = 14;
        y = 20;
      }

      doc.setTextColor(...color);
      doc.text(word, x, y);
      x += wordWidth;
    });

    doc.setTextColor(0, 0, 0);
  };

  const handleDownload = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.text("English Speaking Result", 14, 20);

    // Table
    autoTable(doc, {
      startY: 30,
      head: [["Accuracy", "Fluency", "Completeness", "Pronunciation"]],
      body: [[
        scoreData.accuracyScore ?? "N/A",
        scoreData.fluencyScore ?? "N/A",
        scoreData.completenessScore ?? "N/A",
        scoreData.pronScore ?? "N/A",
      ]],
    });

    // Feedback
    const feedback = scoreData.feedback ?? "No feedback provided.";
    const lines = doc.splitTextToSize(feedback, pageWidth - 20);
    let y = (doc.lastAutoTable?.finalY || 40) + 20;
    doc.setFontSize(12);
    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 7;
    });

    // Transcript highlight
    if (scoreData.transcript) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Transcript", 14, 20);
      renderTranscript(doc, scoreData.transcript, scoreData.wordsAssessment, 35);
    }

    addHeaderFooter(doc, scoreData.name);

    doc.save("speaking-result.pdf");
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!scoreData}
      className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
    >
      Save PDF
    </button>
  );
};

export default ResultPDFDownloader;
