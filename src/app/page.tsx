"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const calculators = [
  {
    href: "/zakat",
    icon: "☪",
    title: "Zakat",
    titleAr: "زكاة",
    description: "Obligatory almsgiving — calculate your annual Zakat on cash, gold, silver, investments, real estate, business assets, cryptocurrency, and more.",
    detail: "Supports all five major schools of Islamic jurisprudence with detailed scholarly references.",
    status: "live" as const,
  },
  {
    href: "/zakat-fitr",
    icon: "🌙",
    title: "Zakat al-Fiṭr",
    titleAr: "زكاة الفطر",
    description: "Per-person payment due before the Eid al-Fiṭr prayer at the end of Ramadan — separate from annual Zakat al-Māl.",
    detail: "Calculate for your entire household. Covers food weight equivalents, cash permissibility by school, and timing rules.",
    status: "live" as const,
  },
  {
    href: "/inheritance",
    icon: "📜",
    title: "Inheritance",
    titleAr: "مِيرَاث",
    description: "Islamic inheritance division (Farāʾiḍ) — calculate each heir's share according to Quranic rules.",
    detail: "Handles complex cases including ʿawl (proportional reduction), radd (redistribution), and ḥajb (exclusion of heirs).",
    status: "live" as const,
  },
  {
    href: "/fidya",
    icon: "🌾",
    title: "Fidya",
    titleAr: "فِدْيَة",
    description: "Compensation for missed fasts — for those unable to fast due to chronic illness, old age, or permanent medical conditions.",
    detail: "Calculate the amount owed per missed day based on your school of jurisprudence and local food costs.",
    status: "live" as const,
  },
  {
    href: "/kaffarah",
    icon: "⚖",
    title: "Kaffārah",
    titleAr: "كَفَّارَة",
    description: "Expiation for broken religious obligations — deliberately broken fasts, broken oaths, and other violations requiring atonement.",
    detail: "Different types of kaffārah with their specific requirements: fasting, feeding the poor, or freeing a slave (historical).",
    status: "live" as const,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <div className="arabesque-bg" />
      <div className="luminous-header absolute inset-x-0 top-0 h-96" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-['Noto_Naskh_Arabic',serif] text-3xl text-[var(--gold-dark)] mb-4">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <h1 className="heading-display text-5xl md:text-6xl text-[var(--ink)] mb-3">
            Islamic Ḥisāb
          </h1>
          <p className="font-['Noto_Naskh_Arabic',serif] text-2xl text-[var(--gold)] mb-2">
            حساب إسلامي
          </p>
          <p className="text-sm text-[var(--ink-faint)] mb-6">islamichisab.com</p>
          <p className="text-xl text-[var(--ink-light)] max-w-2xl mx-auto leading-relaxed mb-4">
            A comprehensive suite of Islamic calculators — built with scholarly rigor,
            supporting all major schools of jurisprudence, and designed to make
            your religious obligations clear and accessible.
          </p>
          <Link
            href="/find-your-school"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--parchment)] border border-[var(--sand)] text-sm font-medium text-[var(--ink-muted)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)] transition-all no-underline"
          >
            🧭 Not sure which school you follow?
          </Link>
        </motion.div>

        {/* Calculator Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          {calculators.map((calc) => (
            <motion.div key={calc.href} variants={item}>
              {calc.status === "live" ? (
                <Link href={calc.href} className="block no-underline">
                  <CalculatorCard calc={calc} />
                </Link>
              ) : (
                <div className="opacity-75">
                  <CalculatorCard calc={calc} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="gold-line mb-8" />
          <p className="text-sm text-[var(--ink-faint)] leading-relaxed max-w-lg mx-auto">
            This tool is for educational and reference purposes. For personal rulings,
            always consult a qualified scholar of your school of jurisprudence.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function CalculatorCard({ calc }: { calc: typeof calculators[number] }) {
  return (
    <div className="card p-6 md:p-8 cursor-pointer group">
      <div className="flex items-start gap-5">
        <div className="text-4xl flex-shrink-0 mt-1">{calc.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="heading-display text-2xl text-[var(--ink)]">
              {calc.title}
            </h2>
            <span className="font-['Noto_Naskh_Arabic',serif] text-lg text-[var(--gold-dark)]">
              {calc.titleAr}
            </span>
            {calc.status === "live" ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--emerald)]/10 text-[var(--emerald)]">
                Live
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--sand)] text-[var(--ink-faint)]">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-base text-[var(--ink-light)] leading-relaxed mb-2">
            {calc.description}
          </p>
          <p className="text-sm text-[var(--ink-faint)] leading-relaxed">
            {calc.detail}
          </p>
        </div>
        {calc.status === "live" && (
          <div className="flex-shrink-0 text-[var(--emerald)] opacity-0 group-hover:opacity-100 transition-opacity text-2xl mt-2">
            →
          </div>
        )}
      </div>
    </div>
  );
}
