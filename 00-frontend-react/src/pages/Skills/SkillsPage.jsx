import React from "react";
import { PracticeCard } from "./components/PracticeCard";
import SkillsHeader from "./components/SkillsHeader";

const Skill4 = () => {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="flex flex-col lg:flex-row">
                <section className="w-full px-6 py-8">
                    <div className="max-w-screen-xl mx-auto">
            <SkillsHeader />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                            <PracticeCard
                                title="Listening Practice"
                                emoji="🎧"
                                description="Use the listening exercises currently available. Progress in this module is session-only."
                                href="/admin/features/listening"
                                gradient="from-pink-500 to-rose-600"
                                bgColor="bg-pink-50"
                            />

                            <PracticeCard
                                title="Speaking Practice"
                                emoji="🎤"
                                description="Choose an active speaking lesson, record a response, and review saved speaking results."
                                href="/admin/features/lesson"
                                gradient="from-purple-500 to-violet-600"
                                bgColor="bg-purple-50"
                            />

                            <PracticeCard
                                title="Reading Practice"
                                emoji="📖"
                                description="Choose from the active reading passages and submit answers for scoring."
                                href="/admin/features/reading"
                                gradient="from-blue-500 to-cyan-600"
                                bgColor="bg-blue-50"
                            />

                            <PracticeCard
                                title="Writing Practice"
                                emoji="✍️"
                                description="Choose an active writing prompt and submit a response for evaluation."
                                href="/admin/features/writing"
                                gradient="from-green-500 to-emerald-600"
                                bgColor="bg-green-50"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Skill4;
