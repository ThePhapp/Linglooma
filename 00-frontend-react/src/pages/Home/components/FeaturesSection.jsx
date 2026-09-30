import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Headphones, PenTool, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, gradient, iconColor, href, linkLabel }) => (
  <article className="group rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${gradient} transition-transform duration-300 group-hover:scale-105`}>
      <Icon aria-hidden="true" className={`h-7 w-7 ${iconColor}`} />
    </div>
    <h3 className="mb-3 text-xl font-bold text-gray-800">{title}</h3>
    <p className="mb-5 leading-relaxed text-gray-600">{description}</p>
    <Link to={href} className="inline-flex items-center gap-2 font-semibold text-purple-700 transition-all hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
      {linkLabel}<ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  </article>
);

const FeaturesSection = () => {
  const features = [
    { icon: BookOpen, title: "Reading Practice", description: "Practice with the reading passages available in Linglooma.", href: "/admin/features/reading", linkLabel: "Start reading", gradient: "bg-gradient-to-br from-blue-500 to-cyan-500", iconColor: "text-white" },
    { icon: Headphones, title: "Listening Practice", description: "Try the available listening exercises. Your listening progress is session-only.", href: "/admin/features/listening", linkLabel: "Start listening", gradient: "bg-gradient-to-br from-pink-500 to-rose-500", iconColor: "text-white" },
    { icon: MessageSquare, title: "Speaking Practice", description: "Browse speaking lessons and practice available responses.", href: "/admin/features", linkLabel: "Start speaking", gradient: "bg-gradient-to-br from-purple-500 to-violet-500", iconColor: "text-white" },
    { icon: PenTool, title: "Writing Practice", description: "Submit writing responses for evaluation and feedback.", href: "/admin/features/writing", linkLabel: "Start writing", gradient: "bg-gradient-to-br from-green-500 to-emerald-500", iconColor: "text-white" },
    { icon: TrendingUp, title: "Speaking Analytics", description: "Review summaries based on your saved speaking results only.", href: "/admin/analytics", linkLabel: "View speaking analytics", gradient: "bg-gradient-to-br from-orange-500 to-yellow-500", iconColor: "text-white" },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600">Practice tools</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-800 lg:text-5xl">Practice English skills with Linglooma</h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">Choose a module to explore the practice activities currently available.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
