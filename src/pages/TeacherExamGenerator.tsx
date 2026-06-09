import { useState } from 'react';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import type { LearningMode } from '../lib/learning';
import { explainWrongAnswer, generateTeacherExamQuestion, scoreTeacherExamAnswers } from '../lib/learning';

type TeacherExamGeneratorProps = {
  mode: LearningMode;
};

const answerFields = [
  { key: 'networkAddress', label: 'Network ID', type: 'network' },
  { key: 'broadcastAddress', label: 'Broadcast Address', type: 'broadcast' },
  { key: 'firstUsableHost', label: 'First Host', type: 'firstHost' },
  { key: 'lastUsableHost', label: 'Last Host', type: 'lastHost' },
  { key: 'subnetMask', label: 'Subnet Mask', type: 'mask' },
  { key: 'usableHosts', label: 'Usable Hosts', type: 'usableHosts' },
] as const;

export function TeacherExamGenerator({ mode }: TeacherExamGeneratorProps) {
  const [question, setQuestion] = useState(() => generateTeacherExamQuestion(() => 0.42));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const results = submitted ? scoreTeacherExamAnswers(question, answers) : [];
  const score = results.filter((item) => item.correct).length;

  const updateAnswer = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const nextQuestion = () => {
    setQuestion(generateTeacherExamQuestion());
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      <section className="classroom-board rounded-[2rem] border border-cyan/20 p-6 shadow-glow md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Teacher Exam Generator</p>
        <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">Generate realistic subnetting exam questions.</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
          Students calculate the complete addressing table, then receive a field-by-field score and explanations for mistakes.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
        <Panel title="Generated question" eyebrow={mode === 'beginner' ? 'Full educational feedback' : 'Exam drill'} className="self-start">
          <div className="rounded-3xl border border-cyan/25 bg-cyan/10 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">Calculate everything for</p>
            <p className="mt-3 break-all font-mono text-4xl font-black text-white">{question.ip}/{question.cidr}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={() => setSubmitted(true)}>Score answers</button>
            <button type="button" className="secondary-button" onClick={nextQuestion}>Generate Exam Question</button>
          </div>
          {submitted ? (
            <div className="mt-5 rounded-3xl border border-line bg-slate-950/55 p-5">
              <p className="text-sm text-slate-400">Score</p>
              <p className="mt-1 font-mono text-5xl font-black text-white">{score}/{answerFields.length}</p>
              <p className="mt-2 text-sm text-slate-400">Each row is scored independently.</p>
            </div>
          ) : null}
        </Panel>

        <Panel title="Student answer sheet" eyebrow="Network ID, broadcast, hosts, mask">
          <div className="space-y-4">
            {answerFields.map((field) => {
              const result = results.find((item) => item.key === field.key);
              return (
                <article key={field.key} className="whiteboard-card p-4">
                  <div className="grid gap-4 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
                    <div>
                      <FieldLabel>{field.label}</FieldLabel>
                      <input value={answers[field.key] ?? ''} onChange={(event) => updateAnswer(field.key, event.target.value)} placeholder="Type answer" />
                    </div>
                    <div>
                      {result ? (
                        <div className={`rounded-2xl border p-4 ${result.correct ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-red-400/40 bg-red-950/40'}`}>
                          <p className={`font-black ${result.correct ? 'text-emerald-100' : 'text-red-100'}`}>{result.correct ? 'Correct' : 'Incorrect'}</p>
                          <p className="mt-2 text-sm text-slate-300">Correct answer: <span className="font-mono text-cyan">{result.expected}</span></p>
                          {!result.correct || mode === 'beginner' ? (
                            <p className="mt-3 leading-7 text-slate-200">
                              {explainWrongAnswer(field.type, result.actual, result.expected, question.ip, question.cidr)}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="rounded-2xl border border-line bg-slate-950/50 p-4 text-sm leading-6 text-slate-400">
                          {mode === 'beginner' ? 'Think through mask -> magic number -> block -> final address.' : 'Awaiting score.'}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
