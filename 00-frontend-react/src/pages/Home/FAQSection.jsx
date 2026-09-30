import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick, id }) => (
  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white/80 shadow-md transition-shadow hover:shadow-lg">
    <h3>
      <button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${id}`} onClick={onClick} className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500">
        <span className="pr-8 text-lg font-semibold text-gray-800">{question}</span>
        <ChevronDown aria-hidden="true" className={`h-5 w-5 flex-shrink-0 text-purple-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </h3>
    <div id={`faq-answer-${id}`} hidden={!isOpen} className="px-6 pb-5 leading-relaxed text-gray-600">{answer}</div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqItems = [
    { question: "What is Linglooma?", answer: "Linglooma provides Reading, Listening, Speaking, and Writing practice modules. Saved progress and analytics are currently limited: speaking results can be reviewed, while listening progress is session-only." },
    { question: "What feedback is available?", answer: "Speaking attempts can be saved with feedback and reviewed in speaking history and speaking analytics. Writing submissions can receive an evaluation. Feedback and saved progress are not available in the same way for every module." },
    { question: "How can I track my progress?", answer: "The history and analytics pages use saved speaking results. Listening progress is session-only and is not included in account history or analytics." },
    { question: "What does Linglooma cost?", answer: "Please check the current sign-up and practice experience for availability. This page does not describe a free trial, premium plan, or feature limits." },
    { question: "Can I use Linglooma on mobile devices?", answer: "The interface is designed to adapt to phone, tablet, and desktop screen sizes. The practice experience may vary by device and browser." },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2"><HelpCircle aria-hidden="true" className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold text-blue-600">FAQ</span></div>
          <h2 className="mb-4 text-4xl font-bold text-gray-800 lg:text-5xl">Frequently Asked <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Questions</span></h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">A clear guide to the practice and progress features currently available.</p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {faqItems.map((item, index) => <FAQItem key={item.question} id={index} {...item} isOpen={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? -1 : index)} />)}
        </div>
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
            <h3 className="mb-3 text-2xl font-bold">Ready to practice?</h3>
            <p className="mb-6 text-white/90">Choose a module and get started with an available practice activity.</p>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-purple-700 shadow-lg transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">Create an account <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
