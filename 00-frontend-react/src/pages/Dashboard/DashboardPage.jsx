import { ArrowRight, BookOpen, Headphones, Mic, PenLine, BarChart3, History } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardHeader from "./components/DashboardHeader";

const practiceModules = [
    { title: "Reading", description: "Work through reading practice passages.", href: "/admin/features/reading", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { title: "Listening", description: "Practice with the available listening exercises.", href: "/admin/features/listening", icon: Headphones, color: "from-pink-500 to-rose-500" },
    { title: "Speaking", description: "Browse speaking lessons and start a practice response.", href: "/admin/features", icon: Mic, color: "from-purple-500 to-violet-500" },
    { title: "Writing", description: "Submit a writing response for evaluation.", href: "/admin/features/writing", icon: PenLine, color: "from-emerald-500 to-green-600" },
];

const Dashboard = () => (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <DashboardHeader />
            <section aria-labelledby="practice-heading" className="mt-8">
                <div className="mb-5">
                    <h2 id="practice-heading" className="text-2xl font-bold text-gray-900">Choose a practice module</h2>
                    <p className="mt-1 text-gray-600">Start a real practice activity whenever you’re ready.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {practiceModules.map(({ title, description, href, icon: Icon, color }) => (
                        <Link key={title} to={href} className="group flex min-h-48 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300">
                            <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}><Icon aria-hidden="true" className="h-6 w-6" /></span>
                            <span className="text-lg font-bold text-gray-900">{title}</span>
                            <span className="mt-2 flex-1 text-sm leading-6 text-gray-600">{description}</span>
                            <span className="mt-4 inline-flex items-center gap-2 font-semibold text-purple-700">Open practice <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                        </Link>
                    ))}
                </div>
            </section>

            <section aria-labelledby="progress-heading" className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="rounded-xl bg-purple-100 p-3 text-purple-700"><History aria-hidden="true" className="h-6 w-6" /></span>
                        <div>
                            <h2 id="progress-heading" className="text-lg font-bold text-gray-900">Speaking history</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">Review saved speaking attempts and their feedback.</p>
                            <Link to="/admin/features/speaking/history" className="mt-4 inline-flex items-center gap-2 font-semibold text-purple-700 hover:text-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">View history <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="rounded-xl bg-blue-100 p-3 text-blue-700"><BarChart3 aria-hidden="true" className="h-6 w-6" /></span>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Speaking analytics</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">Analytics currently summarize saved speaking results only.</p>
                            <Link to="/admin/analytics" className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">View analytics <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                        </div>
                    </div>
                </div>
            </section>
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                Listening progress is session-only; it is not currently saved to your account or included in analytics.
            </p>
        </div>
    </main>
);

export default Dashboard;
