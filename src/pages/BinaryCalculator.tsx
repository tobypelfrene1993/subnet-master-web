import { type ReactNode, useMemo, useState } from 'react';
import { ErrorBox } from '../components/ErrorBox';
import { FieldLabel } from '../components/FieldLabel';
import { InfoTooltip } from '../components/InfoTooltip';
import { Panel } from '../components/Panel';
import {
  type BinaryBoardBit,
  calculateBinaryAnd,
  cidrToBinaryMaskBits,
  decimalOctetToBinary,
  getBinaryBoardExplanation,
  getBinaryVisualizer,
  ipv4ToBinaryOctets,
  ipv4ToDecimalOctets,
} from '../lib/binarySubnet';
import { cidrToSubnetMask } from '../lib/subnet';

const cheatRows = [128, 192, 224, 240, 248, 252, 254, 255];
const defaultBoardIp = '138.25.47.69';
const defaultBoardCidr = '/13';
const bitWeights = [128, 64, 32, 16, 8, 4, 2, 1];

function parseCidrInput(value: string): number {
  const normalized = value.trim().replace(/^\//, '');
  return Number(normalized);
}

function BinaryText({ value }: { value: string }) {
  return (
    <p className="break-all rounded-2xl border border-cyan/20 bg-slate-950/70 px-4 py-3 font-mono text-sm leading-7 text-cyan md:text-base">
      {value}
    </p>
  );
}

function buildCopyText(result: ReturnType<typeof getBinaryBoardExplanation>): string {
  return [
    'Step-by-step subnet explanation',
    `Input: ${result.inputIp}/${result.cidr}`,
    '',
    '1. Decimal IP',
    result.decimalOctets.join(' . '),
    'CIDR tells how many bits are network bits.',
    '',
    '2. IP in binary',
    result.ipBinaryOctets.join(' . '),
    'Each decimal octet becomes 8 binary bits.',
    '',
    '3. Subnet mask from CIDR',
    `/${result.cidr} = ${result.subnetMask}`,
    'The subnet mask has 1s for network bits and 0s for host bits.',
    '',
    '4. Subnet mask in binary',
    result.maskBinaryOctets.join(' . '),
    '',
    '5. Network bits and host bits',
    `${result.networkBits} network bits, ${result.hostBits} host bits`,
    '',
    '6. Binary AND calculation',
    `IP:   ${result.ipBinaryOctets.join(' . ')}`,
    `MASK: ${result.maskBinaryOctets.join(' . ')}`,
    `AND:  ${result.networkBinaryOctets.join(' . ')}`,
    'Network ID is found with binary AND.',
    '',
    '7. Network ID',
    `Binary: ${result.networkBinaryOctets.join(' . ')}`,
    `Decimal: ${result.networkAddress}`,
    '',
    '8. Broadcast address',
    'Broadcast is created by keeping the network bits the same and setting all host bits to 1.',
    `Binary: ${result.broadcastBinaryOctets.join(' . ')}`,
    `Decimal: ${result.broadcastAddress}`,
    '',
    '9. First and last host',
    `First host: ${result.firstUsableHost}`,
    `Last host: ${result.lastUsableHost}`,
    'Usable hosts are between network ID and broadcast.',
  ].join('\n');
}

function bitClassName(type: 'network' | 'host' | 'result') {
  if (type === 'network') {
    return 'border-cyan/45 bg-cyan/20 text-cyan shadow-[0_0_14px_rgba(39,217,255,0.18)]';
  }
  if (type === 'host') {
    return 'border-amber-300/45 bg-amber-400/15 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.12)]';
  }

  return 'border-emerald-300/45 bg-emerald-400/15 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.14)]';
}

function BinaryBoardOctets({
  octets,
  bits,
  result = false,
}: {
  octets: string[];
  bits?: BinaryBoardBit[];
  result?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line/70 bg-slate-950/70 p-3">
      <div className="flex min-w-max items-end gap-2">
        {octets.map((octet, octetIndex) => (
          <div key={`${octet}-${octetIndex}`} className="flex items-end gap-2">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-3">
              <div className="grid grid-cols-8 gap-1 pb-2 font-mono text-[0.65rem] font-semibold text-slate-500">
                {bitWeights.map((weight) => <span key={weight} className="text-center">{weight}</span>)}
              </div>
              <div className="grid grid-cols-8 gap-1 font-mono text-sm font-black md:text-base">
                {octet.split('').map((bit, bitIndex) => {
                  const globalIndex = octetIndex * 8 + bitIndex;
                  const type = result ? 'result' : bits?.[globalIndex]?.type ?? 'host';

                  return (
                    <span key={`${globalIndex}-${bit}`} className={`rounded-lg border px-1.5 py-1 text-center ${bitClassName(type)}`}>
                      {bit}
                    </span>
                  );
                })}
              </div>
            </div>
            {octetIndex < octets.length - 1 ? <span className="pb-4 font-mono text-2xl font-black text-slate-500">.</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardStep({
  number,
  title,
  explanation,
  children,
}: {
  number: number;
  title: string;
  explanation: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-cyan/15 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 font-mono text-sm font-black text-cyan">{number}</span>
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{explanation}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function MaskBits({ cidr }: { cidr: number }) {
  const bits = cidrToBinaryMaskBits(cidr);

  return (
    <div className="overflow-x-auto rounded-2xl border border-line/70 bg-slate-950/70 p-4">
      <div className="flex min-w-max flex-wrap gap-x-1 gap-y-2 font-mono text-sm md:text-base">
        {bits.map((item) => (
          <span key={item.index} className="inline-flex items-center">
            <span
              className={`rounded px-1.5 py-1 ${
                item.type === 'network'
                  ? 'bg-cyan/20 text-cyan ring-1 ring-cyan/35'
                  : 'bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20'
              }`}
            >
              {item.bit}
            </span>
            {(item.index + 1) % 8 === 0 && item.index !== 31 ? <span className="px-1 text-slate-500">.</span> : null}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
        <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-cyan">Network bits: 1</span>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">Host bits: 0</span>
      </div>
    </div>
  );
}

export function BinaryCalculator() {
  const [converterIp, setConverterIp] = useState('192.168.1.10');
  const [maskCidr, setMaskCidr] = useState('/26');
  const [andIp, setAndIp] = useState('192.168.1.130');
  const [andCidr, setAndCidr] = useState('/26');
  const [visualCidr, setVisualCidr] = useState('/26');
  const [boardIp, setBoardIp] = useState(defaultBoardIp);
  const [boardCidr, setBoardCidr] = useState(defaultBoardCidr);
  const [copyStatus, setCopyStatus] = useState('');

  const converter = useMemo(() => {
    try {
      return { decimal: ipv4ToDecimalOctets(converterIp), binary: ipv4ToBinaryOctets(converterIp), error: null };
    } catch (error) {
      return { decimal: null, binary: null, error: error instanceof Error ? error.message : 'Invalid IPv4 address.' };
    }
  }, [converterIp]);

  const mask = useMemo(() => {
    try {
      const cidr = parseCidrInput(maskCidr);
      return { cidr, mask: cidrToSubnetMask(cidr), error: null };
    } catch (error) {
      return { cidr: null, mask: null, error: error instanceof Error ? error.message : 'Invalid CIDR prefix.' };
    }
  }, [maskCidr]);

  const andResult = useMemo(() => {
    try {
      return { value: calculateBinaryAnd(andIp, parseCidrInput(andCidr)), error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : 'Could not run binary AND.' };
    }
  }, [andIp, andCidr]);

  const visualizer = useMemo(() => {
    try {
      return { value: getBinaryVisualizer(parseCidrInput(visualCidr)), error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : 'Invalid CIDR prefix.' };
    }
  }, [visualCidr]);

  const board = useMemo(() => {
    try {
      return { value: getBinaryBoardExplanation(boardIp, parseCidrInput(boardCidr)), error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : 'Could not build this binary explanation.' };
    }
  }, [boardIp, boardCidr]);

  const resetBoardExample = () => {
    setBoardIp(defaultBoardIp);
    setBoardCidr(defaultBoardCidr);
    setCopyStatus('');
  };

  const copyBoardExplanation = async () => {
    if (!board.value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildCopyText(board.value));
      setCopyStatus('Copied explanation.');
    } catch {
      setCopyStatus('Copy unavailable in this browser.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan/20 bg-slate-950/65 p-6 shadow-glow md:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan/15 blur-3xl" />
        <div className="relative max-w-4xl">
          <p className="mb-3 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Binary Calculator</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">See subnetting as 1s and 0s.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Convert IPv4 addresses, inspect CIDR masks, and watch the binary AND operation reveal the network address.
          </p>
        </div>
      </section>

      <Panel title="Step-by-step subnet explanation" eyebrow="Binary Board">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-cyan/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
            <div className="relative grid gap-5 lg:grid-cols-[0.45fr_0.55fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan">Digital whiteboard</p>
                <h3 className="mt-2 text-2xl font-black text-white">Subnetting written out like a classroom board.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Enter an IPv4 address and CIDR prefix. The board marks network bits in cyan, host bits in amber, and final result bits in green.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_0.5fr]">
                <div>
                  <FieldLabel term="IP address">IPv4 address</FieldLabel>
                  <input value={boardIp} onChange={(event) => setBoardIp(event.target.value)} placeholder={defaultBoardIp} className={board.error ? 'border-red-400 bg-red-950/25' : undefined} />
                </div>
                <div>
                  <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
                  <input value={boardCidr} onChange={(event) => setBoardCidr(event.target.value)} placeholder={defaultBoardCidr} className={board.error ? 'border-red-400 bg-red-950/25' : undefined} />
                </div>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <button type="button" className="primary-button" onClick={copyBoardExplanation} disabled={!board.value}>Copy explanation</button>
                  <button type="button" className="secondary-button" onClick={resetBoardExample}>Reset example</button>
                  {copyStatus ? <span className="self-center text-sm font-semibold text-cyan">{copyStatus}</span> : null}
                </div>
              </div>
            </div>
          </div>

          <ErrorBox message={board.error} />

          {board.value ? (
            <div className="space-y-4 rounded-[2rem] border border-line/70 bg-slate-950/35 p-4 md:p-5">
              <div className="grid gap-3 text-xs font-semibold uppercase tracking-[0.18em] sm:grid-cols-3">
                <span className="rounded-full border border-cyan/35 bg-cyan/10 px-3 py-2 text-cyan">Network bits = cyan</span>
                <span className="rounded-full border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-amber-200">Host bits = amber</span>
                <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-emerald-200">Result bits = green</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <BoardStep number={1} title="Decimal IP" explanation="CIDR tells how many bits are network bits.">
                  <p className="rounded-2xl border border-line/70 bg-slate-950/70 px-4 py-3 font-mono text-2xl font-black text-white">
                    {board.value.decimalOctets.join(' . ')}
                  </p>
                </BoardStep>

                <BoardStep number={2} title="IP in binary" explanation="Each decimal octet becomes 8 binary bits, so IPv4 always has 32 bits.">
                  <BinaryBoardOctets octets={board.value.ipBinaryOctets} bits={board.value.ipBits} />
                </BoardStep>

                <BoardStep number={3} title="Subnet mask from CIDR" explanation="The subnet mask has 1s for network bits and 0s for host bits.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4">
                      <p className="text-sm text-slate-400">CIDR</p>
                      <p className="mt-1 font-mono text-3xl font-black text-cyan">/{board.value.cidr}</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Subnet mask</p>
                      <p className="mt-1 font-mono text-3xl font-black text-white">{board.value.subnetMask}</p>
                    </div>
                  </div>
                </BoardStep>

                <BoardStep number={4} title="Subnet mask in binary" explanation="Mask 1s protect the network side. Mask 0s leave room for hosts.">
                  <BinaryBoardOctets octets={board.value.maskBinaryOctets} bits={board.value.maskBits} />
                </BoardStep>

                <BoardStep number={5} title="Network bits and host bits" explanation="The first CIDR bits are the network. The rest are host bits inside that network.">
                  <div className="space-y-4">
                    <BinaryBoardOctets octets={board.value.ipBinaryOctets} bits={board.value.ipBits} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4">
                        <p className="text-sm text-slate-400">Network bits</p>
                        <p className="mt-1 font-mono text-3xl font-black text-cyan">{board.value.networkBits}</p>
                      </div>
                      <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4">
                        <p className="text-sm text-slate-400">Host bits</p>
                        <p className="mt-1 font-mono text-3xl font-black text-amber-200">{board.value.hostBits}</p>
                      </div>
                    </div>
                  </div>
                </BoardStep>

                <BoardStep number={6} title="Binary AND calculation" explanation="Network ID is found with binary AND: only 1 AND 1 stays 1. Everything else becomes 0.">
                  <div className="space-y-3">
                    {[
                      ['IP', board.value.ipBinaryOctets, board.value.ipBits, false],
                      ['MASK', board.value.maskBinaryOctets, board.value.maskBits, false],
                      ['AND', board.value.networkBinaryOctets, undefined, true],
                    ].map(([label, octets, bits, result]) => (
                      <div key={label as string} className="grid gap-2 rounded-2xl border border-line/70 bg-slate-950/55 p-3 md:grid-cols-[4rem_1fr] md:items-center">
                        <p className="font-mono text-sm font-black text-cyan">{label as string}:</p>
                        <BinaryBoardOctets octets={octets as string[]} bits={bits as BinaryBoardBit[] | undefined} result={Boolean(result)} />
                      </div>
                    ))}
                  </div>
                </BoardStep>

                <BoardStep number={7} title="Network ID" explanation="After the AND, the host bits are 0. That gives the network ID.">
                  <div className="space-y-3">
                    <BinaryBoardOctets octets={board.value.networkBinaryOctets} result />
                    <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4">
                      <p className="text-sm text-slate-400">Decimal</p>
                      <p className="mt-1 font-mono text-3xl font-black text-emerald-200">{board.value.networkAddress}</p>
                    </div>
                  </div>
                </BoardStep>

                <BoardStep number={8} title="Broadcast address" explanation="Broadcast is created by keeping the network bits the same and setting all host bits to 1.">
                  <div className="space-y-3">
                    <BinaryBoardOctets octets={board.value.broadcastBinaryOctets} bits={board.value.ipBits} />
                    <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4">
                      <p className="text-sm text-slate-400">Decimal</p>
                      <p className="mt-1 font-mono text-3xl font-black text-white">{board.value.broadcastAddress}</p>
                    </div>
                  </div>
                </BoardStep>

                <BoardStep number={9} title="First and last host" explanation="Usable hosts are between network ID and broadcast.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-line/70 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">First host</p>
                      <p className="mt-1 font-mono text-2xl font-black text-white">{board.value.firstUsableHost}</p>
                    </div>
                    <div className="rounded-2xl border border-line/70 bg-slate-950/70 p-4">
                      <p className="text-sm text-slate-400">Last host</p>
                      <p className="mt-1 font-mono text-2xl font-black text-white">{board.value.lastUsableHost}</p>
                    </div>
                  </div>
                </BoardStep>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="IPv4 to Binary Converter" eyebrow="Octets">
          <div className="space-y-4">
            <div>
              <FieldLabel term="IP address">IPv4 address</FieldLabel>
              <input
                value={converterIp}
                onChange={(event) => setConverterIp(event.target.value)}
                placeholder="192.168.1.10"
                className={converter.error ? 'border-red-400 bg-red-950/25' : undefined}
              />
            </div>
            <ErrorBox message={converter.error} />
            {converter.decimal && converter.binary ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-300">Decimal</p>
                  <p className="font-mono text-xl text-white">{converter.decimal.join(' . ')}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-300">Binary</p>
                  <BinaryText value={converter.binary.join(' . ')} />
                </div>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="CIDR to Binary Mask" eyebrow="Mask bits">
          <div className="space-y-4">
            <div>
              <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
              <input
                value={maskCidr}
                onChange={(event) => setMaskCidr(event.target.value)}
                placeholder="/26"
                className={mask.error ? 'border-red-400 bg-red-950/25' : undefined}
              />
            </div>
            <ErrorBox message={mask.error} />
            {mask.cidr !== null && mask.mask ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line/70 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-400">CIDR</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-white">/{mask.cidr}</p>
                  </div>
                  <div className="rounded-2xl border border-line/70 bg-slate-950/50 p-4">
                    <p className="text-sm text-slate-400">Subnet Mask</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-white">{mask.mask}</p>
                  </div>
                </div>
                <MaskBits cidr={mask.cidr} />
              </div>
            ) : null}
          </div>
        </Panel>
      </div>

      <Panel title="Binary AND Calculator" eyebrow="Network address math">
        <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
          <div className="space-y-4">
            <div>
              <FieldLabel term="IP address">IPv4 address</FieldLabel>
              <input value={andIp} onChange={(event) => setAndIp(event.target.value)} placeholder="192.168.1.130" className={andResult.error ? 'border-red-400 bg-red-950/25' : undefined} />
            </div>
            <div>
              <FieldLabel term="CIDR">CIDR prefix</FieldLabel>
              <input value={andCidr} onChange={(event) => setAndCidr(event.target.value)} placeholder="/26" className={andResult.error ? 'border-red-400 bg-red-950/25' : undefined} />
            </div>
            <ErrorBox message={andResult.error} />
          </div>
          {andResult.value ? (
            <div className="space-y-3">
              {[
                ['IP', andResult.value.ipBinary],
                ['MASK', andResult.value.maskBinary],
                ['AND', andResult.value.andBinary],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 rounded-2xl border border-line/70 bg-slate-950/55 p-4 md:grid-cols-[5rem_1fr] md:items-center">
                  <p className="font-mono text-sm font-bold text-cyan">{label}</p>
                  <p className="break-all font-mono text-sm leading-7 text-white md:text-base">{value}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4">
                <p className="text-sm font-semibold text-cyan">Result</p>
                <p className="mt-1 font-mono text-3xl font-black text-white">{andResult.value.resultIp}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Every bit that is 1 in both the IP and mask stays 1. Host bits become 0, which gives the network address.</p>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Binary Subnetting Visualizer" eyebrow="Network vs host bits">
          <div className="space-y-4">
            <div>
              <FieldLabel term="Network bits">CIDR prefix</FieldLabel>
              <input value={visualCidr} onChange={(event) => setVisualCidr(event.target.value)} placeholder="/26" className={visualizer.error ? 'border-red-400 bg-red-950/25' : undefined} />
            </div>
            <ErrorBox message={visualizer.error} />
            {visualizer.value ? (
              <div className="space-y-5">
                <BinaryText value={visualizer.value.binaryMask} />
                <p className="break-all rounded-2xl border border-line/70 bg-slate-950/60 px-4 py-3 font-mono text-lg leading-8 text-slate-200">{visualizer.value.visualLine}</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Network bits', visualizer.value.networkBits],
                    ['Host bits', visualizer.value.hostBits],
                    ['Total addresses', visualizer.value.totalAddresses.toLocaleString()],
                    ['Usable hosts', visualizer.value.usableHosts.toLocaleString()],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-line/70 bg-slate-950/50 p-4">
                      <p className="text-sm text-slate-400">{label}</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Binary Cheat Sheet" eyebrow="Common mask octets">
          <div className="overflow-x-auto rounded-2xl border border-line/70">
            <table>
              <thead>
                <tr>
                  <th>Decimal</th>
                  <th>Binary</th>
                </tr>
              </thead>
              <tbody>
                {cheatRows.map((decimal) => (
                  <tr key={decimal}>
                    <td className="font-mono text-white">{decimal}</td>
                    <td className="font-mono text-cyan">{decimalOctetToBinary(decimal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Help Popups" eyebrow="Binary concepts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Binary',
            'Octet',
            'Network bits',
            'Host bits',
            'CIDR',
            'Subnet mask',
            'Why binary matters',
          ].map((term) => (
            <div key={term} className="rounded-2xl border border-line/70 bg-slate-950/50 p-4 text-white">
              {term}
              <InfoTooltip term={term} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
