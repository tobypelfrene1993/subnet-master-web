import { useMemo, useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { Panel } from '../components/Panel';
import type { LearningMode } from '../lib/learning';
import { explainWrongAnswer, generateTeacherExamQuestion, getSubnetLearningDetails } from '../lib/learning';

type MagicNumberTrainerProps = {
  mode: LearningMode;
};

export function MagicNumberTrainer({ mode }: MagicNumberTrainerProps) {
  const [ip, setIp] = useState('192.168.1.130');
  const [cidr, setCidr] = useState('26');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const details = useMemo(() => {
    try {
      return { value: getSubnetLearningDetails(ip, Number(cidr)), error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : 'Could not build the trainer exercise.' };
    }
  }, [ip, cidr]);

  const randomExercise = () => {
    const question = generateTeacherExamQuestion();
    setIp(question.ip);
    setCidr(String(question.cidr));
    setAnswer('');
    setFeedback(null);
  };

  const check = () => {
    if (!details.value) {
      return;
    }

    const expected = String(details.value.subnetStartOctet);
    const correct = answer.trim() === expected || answer.trim() === details.value.summary.networkAddress;
    setFeedback({
      correct,
      text: correct
        ? `Correct. ${details.value.ipOctets[details.value.activeOctetIndex]} falls inside the block that starts at ${details.value.subnetStartOctet}. The Network ID is ${details.value.summary.networkAddress}.`
        : explainWrongAnswer('block', answer, details.value.blockLabel, details.value.summary.inputIp, details.value.summary.cidr),
    });
  };

  return (
    <div className="space-y-6">
      <section className="classroom-board rounded-[2rem] border border-cyan/20 p-6 shadow-glow md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Magic Number Trainer</p>
        <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">See subnet boundaries before calculating anything.</h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
          The magic number tells you where subnet blocks start. Count by the magic number, then place the IP inside the correct block.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
        <Panel title="Exercise" eyebrow={mode === 'beginner' ? 'Guided boundary practice' : 'Fast drill'} className="self-start">
          <div className="space-y-4">
            <div>
              <FieldLabel term="IP address">IPv4 address</FieldLabel>
              <input value={ip} onChange={(event) => { setIp(event.target.value); setFeedback(null); }} placeholder="192.168.1.130" />
            </div>
            <div>
              <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
              <input type="number" min="1" max="32" value={cidr} onChange={(event) => { setCidr(event.target.value); setFeedback(null); }} placeholder="26" />
            </div>
            <button type="button" className="secondary-button w-full" onClick={randomExercise}>Generate random exercise</button>
            <ErrorBox message={details.error} />
          </div>
        </Panel>

        <Panel title="Boundary whiteboard" eyebrow="Magic number">
          {details.value ? (
            <div className="space-y-6">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-line/70 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-400">Mask</p>
                  <p className="mt-1 font-mono text-2xl font-black text-white">{details.value.summary.subnetMask}</p>
                </div>
                <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4">
                  <p className="text-sm text-slate-400">Magic formula</p>
                  <p className="mt-1 font-mono text-2xl font-black text-cyan">256 - {details.value.activeMaskOctet} = {details.value.magicNumber}</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-slate-950/55 p-4">
                  <p className="text-sm text-slate-400">IP octet to place</p>
                  <p className="mt-1 font-mono text-2xl font-black text-white">{details.value.ipOctets[details.value.activeOctetIndex]}</p>
                </div>
              </div>

              {mode === 'beginner' ? (
                <p className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4 leading-7 text-slate-200">
                  In the {details.value.activeOctetLabel}, valid subnet starts are created by counting {details.value.magicNumber} at a time. The IP octet {details.value.ipOctets[details.value.activeOctetIndex]} lands in the highlighted block.
                </p>
              ) : null}

              <div className="rounded-3xl border border-line/70 bg-slate-950/45 p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan">Subnet boundaries</p>
                <div className="flex flex-wrap gap-3">
                  {details.value.boundaries.map((boundary) => {
                    const isStart = boundary === details.value?.subnetStartOctet;
                    const isEndMarker = boundary === details.value?.subnetStartOctet + details.value?.magicNumber;
                    return (
                      <div key={boundary} className={`boundary-marker ${isStart ? 'boundary-marker-active' : ''} ${isEndMarker ? 'boundary-marker-end' : ''}`}>
                        <span>{boundary}</span>
                        {isStart ? <strong>correct subnet starts here</strong> : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="whiteboard-card p-5">
                <FieldLabel>Which boundary does this subnet start at?</FieldLabel>
                <input value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && check()} placeholder={`Example: ${details.value.subnetStartOctet}`} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="primary-button" onClick={check}>Check boundary</button>
                  <button type="button" className="secondary-button" onClick={() => setAnswer(details.value ? String(details.value.subnetStartOctet) : '')}>Show answer</button>
                </div>
                {feedback ? (
                  <p className={`mt-4 rounded-2xl border p-4 leading-7 ${feedback.correct ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100' : 'border-red-400/40 bg-red-950/40 text-red-100'}`}>{feedback.text}</p>
                ) : null}
              </div>
            </div>
          ) : <p className="text-slate-400">Enter a valid IPv4 address and CIDR to show boundaries.</p>}
        </Panel>
      </div>
    </div>
  );
}
