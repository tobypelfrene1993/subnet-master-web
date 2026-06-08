import { useState } from 'react';
import { FieldLabel } from '../components/FieldLabel';
import { InfoTooltip } from '../components/InfoTooltip';
import { Panel } from '../components/Panel';
import { checkAnswer, generateQuestion } from '../lib/quiz';
import type { CheckedAnswer, QuizQuestion } from '../types/subnet';

export function PracticeMode() {
  const [question, setQuestion] = useState<QuizQuestion>(() => generateQuestion('medium'));
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<CheckedAnswer | null>(null);

  const submit = () => setChecked(checkAnswer(answer, question.answer));
  const next = () => {
    setQuestion(generateQuestion('medium'));
    setAnswer('');
    setChecked(null);
  };

  return (
    <Panel title="Practice Mode" eyebrow="Instant feedback">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-line bg-slate-950/55 p-5">
          <h3 className="text-xl font-semibold text-white">Question <InfoTooltip term="Practice mode" /></h3>
          <p className="mt-4 text-2xl font-bold leading-10 text-cyan-50">{question.prompt}</p>
          <div className="mt-6">
            <FieldLabel>Your answer</FieldLabel>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Type an IP, subnet mask, or number" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={submit}>Check answer</button>
            <button type="button" className="secondary-button" onClick={next}>Next question</button>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-slate-950/55 p-5">
          <h3 className="text-xl font-semibold text-white">Feedback</h3>
          {checked ? (
            <div className="mt-4 space-y-4">
              <p className={`rounded-2xl p-4 font-semibold ${checked.correct ? 'border border-emerald-400/40 bg-emerald-950/40 text-emerald-100' : 'border border-red-400/40 bg-red-950/40 text-red-100'}`}>
                {checked.correct ? 'Correct.' : 'Incorrect.'}
              </p>
              <p className="text-slate-300">Correct answer: <span className="font-mono text-cyan">{question.answer}</span></p>
              <p className="leading-7 text-slate-300">{question.explanation}</p>
            </div>
          ) : <p className="mt-4 leading-7 text-slate-400">Submit an answer to see the correct answer and a short explanation.</p>}
        </div>
      </div>
    </Panel>
  );
}
