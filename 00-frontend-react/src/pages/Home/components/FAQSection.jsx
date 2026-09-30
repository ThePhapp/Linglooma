import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick, id }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <h3>
      <button type="button" aria-expanded={isOpen} aria-controls={`faq-answer-${id}`} onClick={onClick} className="flex min-h-14 w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6">
        <span className="pr-6 text-base font-semibold text-slate-900 sm:text-lg">{question}</span>
        <ChevronDown aria-hidden="true" className={`h-5 w-5 flex-shrink-0 text-brand-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </h3>
    <div id={`faq-answer-${id}`} hidden={!isOpen} className="px-5 pb-5 leading-7 text-slate-600 sm:px-6">{answer}</div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqItems = [
    { question: "What is Linglooma?", answer: "Linglooma provides Reading, Listening, Speaking, and Writing practice modules. Saved progress and analytics are currently limited: speaking results can be reviewed, while listening progress is session-only." },
    { question: "What feedback is available?", answer: "Speaking attempts can be saved with feedback and reviewed in speaking history and speaking analytics. Writing submissions can receive an evaluation. Feedback and saved progress are not available in the same way for every module." },
    { question: "How can I track my progress?", answer: "The history and analytics pages use saved speaking results. Listening progress is session-only and is not included in account history or analytics." },
    { question: "What does Linglooma cost?", answer: "No pricing plans or paid feature limits are documented on this page. Check the current sign-up and practice experience for availability." },
    { question: "Can I use Linglooma on mobile devices?", answer: "The interface is designed to adapt to phone, tablet, and desktop screen sizes. The practice experience may vary by device and browser." },
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5"><HelpCircle aria-hidden="true" className="h-4 w-4 text-brand-600" /><span className="text-sm font-semibold text-brand-700">FAQ</span></div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Frequently asked questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">A clear guide to the practice and progress features currently available.</p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {faqItems.map((item, index) => <FAQItem key={item.question} id={index} {...item} isOpen={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? -1 : index)} />)}
        </div>
        <div className="mt-10 text-center sm:mt-12">
          <div className="mx-auto max-w-3xl rounded-2xl bg-brand-700 p-6 text-white sm:p-8">
            <h3 className="mb-3 text-2xl font-bold">Ready to practice?</h3>
            <p className="mb-6 text-white/90">Choose a module and get started with an available practice activity.</p>
            <Link to="/register" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Create an account <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
