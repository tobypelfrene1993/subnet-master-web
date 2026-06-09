import { useMemo, useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import { StatGrid } from '../components/StatGrid';
import type { LearningMode } from '../lib/learning';
import { checkWizardAnswer, explainWrongAnswer, getSubnetLearningDetails, getWizardSteps } from '../lib/learning';

type SubnettingWizardProps = {
  mode: LearningMode;
};

export function SubnettingWizard({ mode }: SubnettingWizardProps) {
  const [ip, setIp] = useState('192.168.1.130');
  const [cidr, setCidr] = useState('26');
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<ReturnType<typeof checkWizardAnswer> | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const lesson = useMemo(() => {
    try {
      const cidrNumber = Number(cidr);
      return {
        details: getSubnetLearningDetails(ip, cidrNumber),
        steps: getWizardSteps(ip, cidrNumber),
        error: null,
      };
    } catch (error) {
      return {
        details: null,
        steps: [],
        error: error instanceof Error ? error.message : 'Could not build the subnetting lesson.',
      };
    }
  }, [ip, cidr]);

  const activeStep = lesson.steps[stepIndex];
  const completedSteps = lesson.steps.reduce((total, _step, index) => total + (index < stepIndex ? 1 : 0), 0);

  const resetLesson = () => {
    setStepIndex(0);
    setAnswer('');
    setChecked(null);
    setShowHint(false);
    setShowAnswer(false);
  };

  const check = () => {
    if (!activeStep) {
      return;
    }

    setChecked(checkWizardAnswer(answer, activeStep));
    setShowAnswer(false);
  };

  const next = () => {
    setStepIndex((current) => Math.min(current + 1, lesson.steps.length - 1));
    setAnswer('');
    setChecked(null);
    setShowHint(false);
    setShowAnswer(false);
  };

  return (
    <div className="space-y-6">
      <section className="classroom-board relative overflow-hidden rounded-[2rem] border border-cyan/20 p-6 shadow-glow md:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan/15 blur-3xl" />
        <div className="relative max-w-4xl">
          <p className="mb-3 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Subnetting Wizard</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Learn subnetting one decision at a time.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Enter an IPv4/CIDR question and solve it like a teacher would on a whiteboard: mask, magic number, block, Network ID, Broadcast, and host range.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <Panel title="Lesson setup" eyebrow={mode === 'beginner' ? 'Beginner guided mode' : 'Expert compact mode'} className="self-start">
          <div className="space-y-4">
            <div>
              <FieldLabel term="IP address">IPv4 address</FieldLabel>
              <input value={ip} onChange={(event) => { setIp(event.target.value); resetLesson(); }} placeholder="192.168.1.130" />
            </div>
            <div>
              <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
              <input type="number" min="1" max="32" value={cidr} onChange={(event) => { setCidr(event.target.value); resetLesson(); }} placeholder="26" />
            </div>
            <button type="button" className="secondary-button w-full" onClick={resetLesson}>Restart lesson</button>
            <ErrorBox message={lesson.error} />
            {lesson.details ? (
              <StatGrid
                stats={[
                  { label: 'Mask', value: lesson.details.summary.subnetMask },
                  { label: 'Magic number', value: lesson.details.magicNumber },
                  { label: 'Changing octet', value: lesson.details.activeOctetLabel },
                ]}
              />
            ) : null}
          </div>
        </Panel>

        <Panel title="Step-by-step board" eyebrow={`Step ${Math.min(stepIndex + 1, lesson.steps.length || 1)} of ${lesson.steps.length || 9}`}>
          {activeStep && lesson.details ? (
            <div className="space-y-5">
              <div className="rounded-full border border-line bg-slate-950/70 p-1">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan to-blue-500 transition-all" style={{ width: `${((completedSteps + (checked?.correct ? 1 : 0)) / lesson.steps.length) * 100}%` }} />
              </div>

              <div className="grid gap-2 sm:grid-cols-9">
                {lesson.steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => { setStepIndex(index); setAnswer(''); setChecked(null); setShowHint(false); setShowAnswer(false); }}
                    className={`rounded-2xl border px-3 py-2 text-center font-mono text-sm font-black transition ${index === stepIndex ? 'border-cyan bg-cyan text-slate-950' : index < stepIndex ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200' : 'border-line bg-slate-950/55 text-slate-400'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <article className="whiteboard-card space-y-5 p-5 md:p-7">
                <div>
                  <p className="font-mono text-sm font-black uppercase tracking-[0.2em] text-cyan">Step {stepIndex + 1}</p>
                  <h3 className="mt-2 text-3xl font-black text-white">{activeStep.title}</h3>
                  <p className="mt-3 text-xl font-semibold leading-8 text-cyan-50">{activeStep.question}</p>
                </div>

                {mode === 'beginner' ? <p className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4 leading-7 text-slate-200">{activeStep.explanation}</p> : null}

                <div>
                  <FieldLabel>Your answer</FieldLabel>
                  <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && check()} placeholder="Type your answer here" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button" className="primary-button" onClick={check}>Check answer</button>
                  <button type="button" className="secondary-button" onClick={() => setShowHint((current) => !current)}>Hint</button>
                  <button type="button" className="secondary-button" onClick={() => setShowAnswer((current) => !current)}>Show answer</button>
                  <button type="button" className="secondary-button" onClick={next} disabled={stepIndex >= lesson.steps.length - 1}>Next step</button>
                </div>

                {showHint ? <p className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 leading-7 text-amber-100">Hint: {activeStep.hint}</p> : null}
                {showAnswer ? <p className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4 font-mono text-xl font-black text-cyan">Answer: {activeStep.expected}</p> : null}

                {checked ? (
                  <div className={`rounded-2xl border p-4 ${checked.correct ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-red-400/40 bg-red-950/40'}`}>
                    <p className={`font-black ${checked.correct ? 'text-emerald-100' : 'text-red-100'}`}>{checked.correct ? 'Correct. You can move to the next step.' : 'Incorrect. Here is why.'}</p>
                    <p className="mt-3 leading-7 text-slate-200">
                      {checked.correct
                        ? activeStep.explanation
                        : explainWrongAnswer(activeStep.answerType, answer, activeStep.expected, lesson.details.summary.inputIp, lesson.details.summary.cidr)}
                    </p>
                  </div>
                ) : null}
              </article>
            </div>
          ) : <p className="text-slate-400">Enter a valid IPv4 address and CIDR prefix to start.</p>}
        </Panel>
      </div>
    </div>
  );
}
