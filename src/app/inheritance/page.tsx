
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heirs, CalculationResult, Heir, Madhab } from '@/lib/inheritance/types';
import { calculateInheritance } from '@/lib/inheritance/calculate';
import { awlInfo, raddInfo, hajbInfo, grandfatherSiblingsInfo, umariyyatanInfo, jafariSystemInfo, getBaytAlMalInfo } from '@/lib/inheritance/scholarly-info';

// Simple GCD and number to fraction converter
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}
function numberToFraction(num: number, tolerance = 1.e-9): string {
    if (num === 0) return "0";
    if (num === 1) return "1";

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = num;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(num - h1 / k1) > num * tolerance);

    return `${h1}/${k1}`;
}

// Shared Components (assuming they exist in @/components/)
import { CurrencyInput } from '@/components/CurrencyInput';
import { OptionCard } from '@/components/OptionCard';
import { InfoAccordion } from '@/components/InfoAccordion';

const HEIR_OPTIONS: { id: Heir; title: string; description: string; type: 'boolean' | 'count' }[] = [
  { id: 'husband', title: 'Husband', description: '', type: 'boolean' },
  { id: 'wife', title: 'Wife / Wives', description: '', type: 'count' },
  { id: 'son', title: 'Sons', description: '', type: 'count' },
  { id: 'daughter', title: 'Daughters', description: '', type: 'count' },
  { id: 'father', title: 'Father', description: '', type: 'boolean' },
  { id: 'mother', title: 'Mother', description: '', type: 'boolean' },
  { id: 'paternalGrandfather', title: 'Paternal Grandfather', description: 'The father of the deceased\'s father.', type: 'boolean' },
  { id: 'paternalGrandmother', title: 'Paternal Grandmother', description: 'The mother of the deceased\'s father.', type: 'boolean' },
  { id: 'maternalGrandmother', title: 'Maternal Grandmother', description: 'The mother of the deceased\'s mother.', type: 'boolean' },
  { id: 'fullBrother', title: 'Full Brothers', description: '', type: 'count' },
  { id: 'fullSister', title: 'Full Sisters', description: '', type: 'count' },
];


export default function InheritanceCalculatorPage() {
  const [step, setStep] = useState(1);
  const [heirs, setHeirs] = useState<Heirs>({});
  const [estateValue, setEstateValue] = useState<number>(100000);
  const [madhab, setMadhab] = useState<Madhab>('hanafi');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleHeirToggle = (heir: Heir, type: 'boolean' | 'count') => {
    setHeirs((prev) => {
      const newHeirs: any = { ...prev };
      if (newHeirs[heir]) {
        delete newHeirs[heir];
      } else {
        newHeirs[heir] = type === 'boolean' ? true : 1;
      }
      return newHeirs;
    });
  };
  
   const handleHeirCountChange = (heir: Heir, count: number) => {
    if(count > 0){
        setHeirs(prev => ({ ...prev, [heir]: count }));
    } else {
        setHeirs(prev => {
            const newHeirs: any = {...prev};
            delete newHeirs[heir];
            return newHeirs;
        })
    }
  };

  const runCalculation = () => {
    const calculatedResult = calculateInheritance(estateValue, heirs, madhab);
    setResult(calculatedResult);
    setStep(4);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-['Amiri',serif] text-[var(--ink)] luminous-header">
          <span className="font-['Noto_Naskh_Arabic',serif] block text-6xl md:text-7xl">حساب الميراث</span>
          Inheritance Calculator
        </h1>
        <p className="text-[var(--ink)] opacity-80 mt-2">
          Calculate the distribution of an estate according to Islamic law (Farāʾiḍ / Mīrāth).
        </p>
      </div>

      <div className="progress-track mb-8">
        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <h2 className="heading-display mb-4">Step 1: Select Heirs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <OptionCard
                title="No Heirs"
                description="The deceased has no living inheritors."
                selected={Object.keys(heirs).length === 0}
                onClick={() => {
                  setHeirs({});
                  setStep(2);
                }}
              />
              {HEIR_OPTIONS.map(({ id, title, description, type }) => (
                <OptionCard
                  key={id}
                  title={title}
                  description={description}
                  selected={!!heirs[id]}
                  onClick={() => handleHeirToggle(id, type)}
                >
                 {type === 'count' && heirs[id] && (
                    <div className="mt-2">
                        <input type="number" min="1" value={heirs[id] as number} 
                        onChange={e => handleHeirCountChange(id, parseInt(e.target.value))}
                        className="w-full p-2 rounded bg-[var(--sand)] border border-[var(--gold)] text-[var(--ink)]"
                        onClick={e => e.stopPropagation()}
                        />
                    </div>
                 )}
                </OptionCard>
              ))}
            </div>
          </motion.div>
        )}
        
        {step === 2 && (
           <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <h2 className="heading-display mb-4">Step 2: Set Estate Value</h2>
                <div className="card p-8">
                    <CurrencyInput 
                        label="Total Estate Value"
                        value={estateValue}
                        onChange={setEstateValue}
                        hint="Enter the final amount after all debts, funeral costs, and bequests (Waṣiyyah) have been paid."
                        prefix="$"
                    />
                </div>
           </motion.div>
        )}
        
        {step === 3 && (
             <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <h2 className="heading-display mb-4">Step 3: Choose School of Law (Madhab)</h2>
                <p className="mb-4 text-center">
                  Different schools have minor variations in some complex cases. Choose the one you wish to follow.
                  <a href="/find-your-school" className="block mt-3 text-sm font-semibold text-[var(--gold-dark)] hover:text-[var(--emerald)] bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-xl px-4 py-2.5 transition-all hover:shadow-sm no-underline">
                    🧭 Not sure which school you follow? Take our short quiz →
                  </a>
                </p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {([
                       { value: 'hanafi' as Madhab, label: 'Ḥanafī' },
                       { value: 'maliki' as Madhab, label: 'Mālikī' },
                       { value: 'shafii' as Madhab, label: 'Shāfiʿī' },
                       { value: 'hanbali' as Madhab, label: 'Ḥanbalī' },
                       { value: 'jafari' as Madhab, label: 'Jaʿfarī' },
                     ]).map(m => (
                         <OptionCard key={m.value} title={m.label} selected={madhab === m.value} onClick={() => setMadhab(m.value)}
                           description={m.value === 'jafari' ? 'Class-based system. No ʿaṣabah (residuary heirs). No ʿawl.' : ''}
                         />
                     ))}
                 </div>
                 <div className="mt-8 space-y-4">
                    <InfoAccordion info={grandfatherSiblingsInfo} />
                    <InfoAccordion info={raddInfo} />
                    {madhab === 'jafari' && <InfoAccordion info={jafariSystemInfo} />}
                 </div>
            </motion.div>
        )}
        
        {step === 4 && result && (
             <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <h2 className="heading-display mb-4">Results</h2>
                 <div className="card p-6 space-y-6">
                    <div>
                        <h3 className="text-2xl font-['Amiri',serif] mb-2">Estate Distribution</h3>
                        {result.shares.length === 0 && result.baytAlMalAmount === estateValue ? (
                            <div className="w-full h-8 bg-emerald-200 rounded-full flex items-center justify-center border border-emerald-400">
                                <span className="text-emerald-800 font-semibold text-sm">
                                    100% → Bayt al-Māl (بيت المال)
                                </span>
                            </div>
                        ) : (
                            <div className="w-full h-8 bg-[var(--sand)] rounded-full flex overflow-hidden border border-[var(--gold)]">
                                {result.shares.map((share, index) => (
                                    <motion.div 
                                        key={share.heir}
                                        className="h-full"
                                        style={{ backgroundColor: `hsl(${index * 40}, 60%, 70%)` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(share.share ?? 0) * 100}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                     <span className="sr-only">{share.label}: {(share.share ?? 0) * 100}%</span>
                                    </motion.div>
                                ))}
                                {result.baytAlMalAmount && result.baytAlMalAmount > 0 && (
                                    <motion.div 
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(result.baytAlMalAmount / estateValue) * 100}%` }}
                                        transition={{ duration: 0.5, delay: result.shares.length * 0.1 }}
                                    >
                                        <span className="sr-only">Bayt al-Māl: {((result.baytAlMalAmount / estateValue) * 100).toFixed(1)}%</span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {result.wasAwlApplied && (
                        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                            <p className="font-bold">ʿAwl (Proportional Reduction) Applied</p>
                            <p>{result.awlExplanation}</p>
                        </div>
                    )}
                    {result.wasRaddApplied && (
                        <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                            <p className="font-bold">Radd (Redistribution) Applied</p>
                            <p>{result.raddExplanation}</p>
                        </div>
                    )}
                    {result.baytAlMalAmount && result.baytAlMalAmount > 0 && (
                        <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 space-y-4">
                            <div>
                                <p className="font-bold text-lg flex items-center gap-2">
                                    <span className="font-['Noto_Naskh_Arabic',serif] text-xl">بيت المال</span>
                                    Bayt al-Māl (Public Treasury)
                                </p>
                                <p className="mt-1">{result.baytAlMalExplanation}</p>
                                <p className="font-semibold mt-2">
                                    Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.baytAlMalAmount)}
                                    <span className="ml-2 text-sm font-normal">
                                        ({((result.baytAlMalAmount / estateValue) * 100).toFixed(1)}%)
                                    </span>
                                </p>
                            </div>

                            <hr className="border-emerald-200" />

                            <div>
                                <p className="font-semibold mb-2">In countries without a Bayt al-Māl:</p>
                                <p className="text-sm mb-3">
                                    Most Western nations do not have an Islamic public treasury. Scholars have outlined the following options for handling this portion:
                                </p>
                                <div className="space-y-3 text-sm">
                                    <div className="bg-emerald-100/60 rounded-lg p-3">
                                        <p className="font-semibold text-emerald-800">1. Direct to Islamic charitable causes (majority scholarly position)</p>
                                        <p className="mt-1 text-emerald-700">
                                            Mosques, Islamic schools, Muslim welfare organizations, and community institutions serve a similar function to Bayt al-Māl. This is the position of the Fiqh Council of North America and the European Council for Fatwa and Research.
                                        </p>
                                    </div>
                                    {result.shares.some(s => s.heir === 'husband' || s.heir === 'wife') && (
                                        <div className="bg-emerald-100/60 rounded-lg p-3">
                                            <p className="font-semibold text-emerald-800">2. Redistribute to the spouse via radd (position of ʿUthmān ibn ʿAffān)</p>
                                            <p className="mt-1 text-emerald-700">
                                                Some scholars hold that when no Bayt al-Māl exists, the remainder should return to the spouse. This view is adopted in the personal status codes of Egypt, Pakistan, and some Gulf states, and is recommended by some scholars specifically for Western Muslims.
                                            </p>
                                        </div>
                                    )}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="font-semibold text-yellow-800">⚠️ Write a Waṣiyyah (Islamic Will)</p>
                                        <p className="mt-1 text-yellow-700">
                                            The best practical step is to write a waṣiyyah that explicitly directs this portion to specific Islamic charities. Without a will, most Western jurisdictions will distribute your estate according to their own intestacy laws — which will not follow Islamic inheritance rules.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-xl font-['Amiri',serif] mb-2">Heir Shares</h4>
                        <div className="divide-y divide-[var(--sand)]">
                           {result.shares.map((s, i) => (
                               <div key={s.heir} className="py-2 flex justify-between items-center">
                                   <div>
                                       <span className="font-bold text-[var(--ink)]">{s.label} {s.count > 1 ? `(x${s.count})` : ''}</span>
                                       <p className="text-sm text-gray-600">{s.reason}</p>
                                   </div>
                                   <div className="text-right">
                                       <p className="font-mono text-lg text-[var(--emerald)]">{numberToFraction(s.share ?? 0)}</p>
                                       <p className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.amount)}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>

                    {result.blocked.length > 0 && (
                         <div>
                            <h4 className="text-xl font-['Amiri',serif] mb-2">Blocked Heirs</h4>
                             <div className="divide-y divide-[var(--sand)]">
                               {result.blocked.map((b) => (
                                   <div key={b.heir} className="py-2">
                                       <p><span className="font-bold">{b.label}</span> was blocked.</p>
                                       <p className="text-sm text-gray-600">Reason: {b.reason}</p>
                                   </div>
                               ))}
                            </div>
                        </div>
                    )}

                 </div>
                 <div className="mt-8 space-y-4">
                    <InfoAccordion info={hajbInfo} />
                    {result.wasAwlApplied && <InfoAccordion info={awlInfo} />}
                    {result.wasRaddApplied && <InfoAccordion info={raddInfo} />}
                    {(result.baytAlMalAmount ?? 0) > 0 && <InfoAccordion info={getBaytAlMalInfo(result.shares.some(s => s.heir === 'husband' || s.heir === 'wife'))} />}
                    <InfoAccordion info={umariyyatanInfo} />
                 </div>
             </motion.div>
        )}
        
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-6 py-2 rounded-md bg-[var(--sand)] text-[var(--ink)] disabled:opacity-50"
        >
          Back
        </button>
        {step < 3 && (
            <button
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="px-6 py-2 rounded-md bg-[var(--emerald)] text-white"
            >
            Continue
            </button>
        )}
        {step === 3 && (
             <button
            onClick={runCalculation}
            className="px-6 py-2 rounded-md bg-[var(--emerald)] text-white font-bold"
            >
            Calculate
            </button>
        )}
      </div>
    </div>
  );
}
