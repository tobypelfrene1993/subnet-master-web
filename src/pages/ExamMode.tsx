import { useEffect, useState } from 'react';
import { FieldLabel } from '../components/FieldLabel';
import { InfoTooltip } from '../components/InfoTooltip';
import { Panel } from '../components/Panel';
import { explainWrongAnswer } from '../lib/learning';
import { checkAnswer, generateExamQuestions } from '../lib/quiz';
import type { Difficulty, QuizQuestion } from '../types/subnet';

type MissedAnswer = { question: QuizQuestion; actual: string };

const secondsPerQuestion: Record<Difficulty, number> = { easy: 75, medium: 60, hard: 45 };

export function ExamMode() {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<MissedAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  const active = questions.length > 0 && !finished;

  useEffect(() => {
    if (!active) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [active]);

  const start = () => {
    const safeCount = Math.min(Math.max(count, 3), 50);
    setQuestions(generateExamQuestions(safeCount, difficulty));
    setIndex(0);
    setAnswer('');
    setScore(0);
    setMissed([]);
    setSecondsLeft(safeCount * secondsPerQuestion[difficulty]);
    setFinished(false);
  };

  const submit = () => {
    const question = questions[index];
    const checked = checkAnswer(answer, question.answer);
    if (checked.correct) {
      setScore((current) => current + 1);
    } else {
      setMissed((current) => [...current, { question, actual: answer || '(blank)' }]);
    }

    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((current) => current + 1);
      setAnswer('');
    }
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  if (finished && questions.length > 0) {
    return (
      <Panel title="Exam results" eyebrow="Timed quiz complete">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-cyan/30 bg-cyan/10 p-5"><p className="text-slate-400">Score</p><p className="text-4xl font-black text-white">{score}/{questions.length}</p></div>
          <div className="rounded-3xl border border-line bg-slate-950/60 p-5"><p className="text-slate-400">Accuracy</p><p className="text-4xl font-black text-white">{Math.round((score / questions.length) * 100)}%</p></div>
          <div className="rounded-3xl border border-line bg-slate-950/60 p-5"><p className="text-slate-400">Difficulty</p><p className="text-4xl font-black capitalize text-white">{difficulty}</p></div>
        </div>
        <button type="button" className="primary-button mt-6" onClick={start}>Restart exam</button>
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-white">Wrong answers</h3>
          {missed.length === 0 ? <p className="text-emerald-200">No wrong answers. Strong work.</p> : (
            <div className="space-y-3">
              {missed.map((item) => (
                <article key={item.question.id} className="rounded-2xl border border-line bg-slate-950/60 p-4">
                  <p className="font-semibold text-white">{item.question.prompt}</p>
                  <p className="mt-2 text-sm text-slate-400">Your answer: <span className="font-mono text-red-200">{item.actual}</span></p>
                  <p className="text-sm text-slate-400">Correct answer: <span className="font-mono text-cyan">{item.question.answer}</span></p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{explainWrongAnswer(item.question.type, item.actual, item.question.answer, item.question.ip, item.question.cidr)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Exam Mode" eyebrow="Timed subnetting quiz">
      {!active ? (
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <FieldLabel term="Exam mode">Number of questions</FieldLabel>
            <input type="number" min="3" max="50" value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </div>
          <div>
            <FieldLabel>Difficulty</FieldLabel>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end"><button type="button" className="primary-button w-full" onClick={start}>Start exam</button></div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.35fr]">
          <div className="rounded-3xl border border-line bg-slate-950/60 p-5">
            <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-400">
              <span>Question {index + 1} of {questions.length}</span>
              <span>Score {score}</span>
            </div>
            <p className="mt-5 text-2xl font-bold leading-10 text-white">{questions[index].prompt}</p>
            <div className="mt-6">
              <FieldLabel>Your answer</FieldLabel>
              <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} />
            </div>
            <button type="button" className="primary-button mt-5" onClick={submit}>Submit answer</button>
          </div>
          <div className="rounded-3xl border border-cyan/30 bg-cyan/10 p-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan">Timer <InfoTooltip term="Exam mode" /></p>
            <p className="mt-4 font-mono text-5xl font-black text-white">{minutes}:{seconds}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}
