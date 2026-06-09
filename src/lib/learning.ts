import type { QuizQuestionType, SubnetSummary } from '../types/subnet';
import {
  calculateSubnet,
  cidrToSubnetMask,
  getTotalAddresses,
  getUsableHosts,
  intToIPv4,
  parseIPv4,
  recommendCidrForHosts,
  validateCidr,
} from './subnet';
import { decimalOctetToBinary } from './binarySubnet';

export type LearningMode = 'beginner' | 'expert';

export type SubnetLearningDetails = {
  summary: SubnetSummary;
  ipOctets: number[];
  maskOctets: number[];
  activeOctetIndex: number;
  activeOctetLabel: string;
  activeMaskOctet: number;
  magicNumber: number;
  subnetStartOctet: number;
  subnetEndOctet: number;
  boundaries: number[];
  blockLabel: string;
};

export type WizardStep = {
  id: string;
  title: string;
  question: string;
  expected: string;
  acceptedAnswers: string[];
  hint: string;
  explanation: string;
  answerType: QuizQuestionType | 'networkBits' | 'magic' | 'block' | 'review';
};

export type CheckedLearningAnswer = {
  correct: boolean;
  expected: string;
  normalizedActual: string;
  normalizedExpected: string;
};

export type TeacherExamQuestion = {
  id: string;
  ip: string;
  cidr: number;
  summary: SubnetSummary;
};

export type DecimalBinaryBreakdown = {
  decimal: number;
  weights: number[];
  selectedWeights: number[];
  binary: string;
  expression: string;
};

const octetLabels = ['first octet', 'second octet', 'third octet', 'fourth octet'];
const binaryWeights = [128, 64, 32, 16, 8, 4, 2, 1];

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '').replace(/^\//, '');
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function activeOctetForCidr(cidr: number): number {
  if (cidr >= 32) {
    return 3;
  }
  if (cidr % 8 === 0) {
    return Math.min(3, cidr / 8);
  }

  return Math.floor(cidr / 8);
}

function buildBoundaries(magicNumber: number): number[] {
  const step = Math.max(1, magicNumber);
  const boundaries: number[] = [];

  for (let boundary = 0; boundary < 256; boundary += step) {
    boundaries.push(boundary);
  }

  if (boundaries[boundaries.length - 1] !== 256) {
    boundaries.push(256);
  }

  return boundaries;
}

export function parseCidrInput(value: string): { ip: string; cidr: number } {
  const [ipPart, cidrPart, extra] = value.trim().split('/');
  if (!ipPart || !cidrPart || extra !== undefined) {
    throw new Error('Enter the value as IPv4/CIDR, for example 192.168.1.130/26.');
  }

  parseIPv4(ipPart);
  return { ip: ipPart, cidr: validateCidr(Number(cidrPart), 1, 32) };
}

export function getSubnetLearningDetails(ip: string, cidrInput: number): SubnetLearningDetails {
  const cidr = validateCidr(cidrInput, 1, 32);
  const summary = calculateSubnet(ip, cidr);
  const ipOctets = summary.inputIp.split('.').map(Number);
  const maskOctets = cidrToSubnetMask(cidr).split('.').map(Number);
  const activeOctetIndex = activeOctetForCidr(cidr);
  const activeMaskOctet = maskOctets[activeOctetIndex];
  const magicNumber = activeMaskOctet === 255 ? 1 : 256 - activeMaskOctet;
  const subnetStartOctet = Math.floor(ipOctets[activeOctetIndex] / magicNumber) * magicNumber;
  const subnetEndOctet = Math.min(255, subnetStartOctet + magicNumber - 1);
  const blockLabel = `${subnetStartOctet} - ${subnetEndOctet}`;

  return {
    summary,
    ipOctets,
    maskOctets,
    activeOctetIndex,
    activeOctetLabel: octetLabels[activeOctetIndex],
    activeMaskOctet,
    magicNumber,
    subnetStartOctet,
    subnetEndOctet,
    boundaries: buildBoundaries(magicNumber),
    blockLabel,
  };
}

export function getWizardSteps(ip: string, cidr: number): WizardStep[] {
  const details = getSubnetLearningDetails(ip, cidr);
  const { summary } = details;

  return [
    {
      id: 'network-bits',
      title: 'Network bits',
      question: `How many network bits does /${summary.cidr} contain?`,
      expected: String(summary.cidr),
      acceptedAnswers: [String(summary.cidr), `/${summary.cidr}`, `${summary.cidr} bits`],
      hint: 'In CIDR notation, the number after the slash is the number of network bits.',
      explanation: `/${summary.cidr} means the first ${summary.cidr} bits identify the network. The remaining ${32 - summary.cidr} bits are host bits.`,
      answerType: 'networkBits',
    },
    {
      id: 'subnet-mask',
      title: 'Subnet mask',
      question: `What is the subnet mask for /${summary.cidr}?`,
      expected: summary.subnetMask,
      acceptedAnswers: [summary.subnetMask],
      hint: 'Write network bits as 1s, host bits as 0s, then convert each octet to decimal.',
      explanation: `/${summary.cidr} becomes subnet mask ${summary.subnetMask}. The mask separates network bits from host bits.`,
      answerType: 'mask',
    },
    {
      id: 'magic-number',
      title: 'Magic number',
      question: `What is the magic number in the ${details.activeOctetLabel}?`,
      expected: String(details.magicNumber),
      acceptedAnswers: [String(details.magicNumber)],
      hint: `Use 256 - the mask value in the changing octet. Here that is 256 - ${details.activeMaskOctet}.`,
      explanation: `The changing octet mask value is ${details.activeMaskOctet}. The magic number is 256 - ${details.activeMaskOctet} = ${details.magicNumber}.`,
      answerType: 'magic',
    },
    {
      id: 'block',
      title: 'Subnet block',
      question: `Which ${details.activeOctetLabel} block contains ${summary.inputIp}?`,
      expected: details.blockLabel,
      acceptedAnswers: [details.blockLabel, `${details.subnetStartOctet}-${details.subnetEndOctet}`, summary.networkAddress, `${summary.networkAddress}-${summary.broadcastAddress}`],
      hint: `Count by ${details.magicNumber}: ${details.boundaries.slice(0, 8).join(', ')}${details.boundaries.length > 8 ? ', ...' : ''}`,
      explanation: `${details.ipOctets[details.activeOctetIndex]} falls between ${details.subnetStartOctet} and ${details.subnetEndOctet}, so this IP belongs to the ${details.blockLabel} block.`,
      answerType: 'block',
    },
    {
      id: 'network-id',
      title: 'Network ID',
      question: 'What is the Network ID?',
      expected: summary.networkAddress,
      acceptedAnswers: [summary.networkAddress],
      hint: 'Use the start of the subnet block and set host bits to 0.',
      explanation: `The block starts at ${details.subnetStartOctet} in the ${details.activeOctetLabel}, therefore the Network ID is ${summary.networkAddress}.`,
      answerType: 'network',
    },
    {
      id: 'broadcast',
      title: 'Broadcast Address',
      question: 'What is the Broadcast Address?',
      expected: summary.broadcastAddress,
      acceptedAnswers: [summary.broadcastAddress],
      hint: 'Broadcast is the last address in the subnet block.',
      explanation: `The block ends at ${details.subnetEndOctet} in the ${details.activeOctetLabel}, so the broadcast address is ${summary.broadcastAddress}.`,
      answerType: 'broadcast',
    },
    {
      id: 'first-host',
      title: 'First Host',
      question: 'What is the First Host?',
      expected: summary.firstUsableHost,
      acceptedAnswers: [summary.firstUsableHost],
      hint: 'For normal subnets, first host is Network ID + 1.',
      explanation: `The first usable host is ${summary.firstUsableHost}. It comes immediately after the Network ID for normal subnet ranges.`,
      answerType: 'firstHost',
    },
    {
      id: 'last-host',
      title: 'Last Host',
      question: 'What is the Last Host?',
      expected: summary.lastUsableHost,
      acceptedAnswers: [summary.lastUsableHost],
      hint: 'For normal subnets, last host is Broadcast - 1.',
      explanation: `The last usable host is ${summary.lastUsableHost}. It comes immediately before the broadcast address for normal subnet ranges.`,
      answerType: 'lastHost',
    },
    {
      id: 'review',
      title: 'Review and explanation',
      question: 'Type done when you can explain the block, Network ID, Broadcast, and host range.',
      expected: 'done',
      acceptedAnswers: ['done', 'ready', 'yes', 'ok'],
      hint: 'Say the logic out loud: mask, magic number, block, network, broadcast, hosts.',
      explanation: `${summary.inputIp}/${summary.cidr} uses mask ${summary.subnetMask}, magic number ${details.magicNumber}, block ${details.blockLabel}, Network ID ${summary.networkAddress}, Broadcast ${summary.broadcastAddress}, hosts ${summary.firstUsableHost} to ${summary.lastUsableHost}.`,
      answerType: 'review',
    },
  ];
}

export function checkWizardAnswer(actual: string, step: WizardStep): CheckedLearningAnswer {
  const normalizedActual = normalize(actual);
  const accepted = step.acceptedAnswers.map(normalize);

  return {
    correct: accepted.includes(normalizedActual),
    expected: step.expected,
    normalizedActual,
    normalizedExpected: normalize(step.expected),
  };
}

export function explainWrongAnswer(type: QuizQuestionType | 'networkBits' | 'magic' | 'block' | 'review', actual: string, expected: string, ip: string, cidr: number): string {
  const details = getSubnetLearningDetails(ip, cidr);
  const { summary } = details;
  const actualText = actual.trim() || '(blank)';

  if (type === 'network') {
    return `You entered ${actualText}, but the Network ID is ${expected}. For /${cidr}, the block size is ${details.magicNumber}. Valid starts in the ${details.activeOctetLabel} are ${details.boundaries.join(', ')}. ${details.ipOctets[details.activeOctetIndex]} falls between ${details.subnetStartOctet} and ${details.subnetEndOctet}, so the Network ID is ${summary.networkAddress}.`;
  }
  if (type === 'broadcast') {
    return `You entered ${actualText}, but broadcast is ${expected}. Broadcast is the final address in the subnet block. This block runs from ${summary.networkAddress} to ${summary.broadcastAddress}.`;
  }
  if (type === 'firstHost') {
    return `You entered ${actualText}, but the first host is ${expected}. First host normally equals Network ID + 1, so ${summary.networkAddress} becomes ${summary.firstUsableHost}.`;
  }
  if (type === 'lastHost') {
    return `You entered ${actualText}, but the last host is ${expected}. Last host normally equals Broadcast - 1, so ${summary.broadcastAddress} becomes ${summary.lastUsableHost}.`;
  }
  if (type === 'mask') {
    return `You entered ${actualText}, but /${cidr} uses mask ${expected}. A /${cidr} mask has ${cidr} network bits set to 1 and ${32 - cidr} host bits set to 0.`;
  }
  if (type === 'usableHosts') {
    return `You entered ${actualText}, but the usable host count is ${expected}. /${cidr} has ${summary.totalAddresses} total addresses; normal usable hosts are total minus network and broadcast.`;
  }
  if (type === 'magic') {
    return `You entered ${actualText}, but the magic number is ${expected}. Use 256 - ${details.activeMaskOctet} in the changing octet, which gives ${details.magicNumber}.`;
  }
  if (type === 'block') {
    return `You entered ${actualText}, but the correct block is ${expected}. Count by ${details.magicNumber}; ${details.ipOctets[details.activeOctetIndex]} lands between ${details.subnetStartOctet} and ${details.subnetEndOctet}.`;
  }

  return `Review the full chain: /${cidr}, mask ${summary.subnetMask}, magic number ${details.magicNumber}, Network ID ${summary.networkAddress}, Broadcast ${summary.broadcastAddress}.`;
}

export function explainCidrChoice(requiredHosts: number): string {
  const recommendation = recommendCidrForHosts(requiredHosts);
  const neededAddresses = requiredHosts === 1 ? 1 : requiredHosts + 2;
  const hostBits = 32 - recommendation.cidr;

  return `${requiredHosts} hosts need ${neededAddresses} addresses because normal subnets reserve network and broadcast. The next power of 2 is ${recommendation.totalAddresses}, which needs ${hostBits} host bits. 32 - ${hostBits} = /${recommendation.cidr}.`;
}

export function generateTeacherExamQuestion(random: () => number = Math.random): TeacherExamQuestion {
  const examples = [
    { base: [138, 25, 47, 69], cidr: 13 },
    { base: [192, 168, 4, 222], cidr: 27 },
    { base: [10, 15, 98, 123], cidr: 21 },
    { base: [172, 16, 88, 44], cidr: 22 },
    { base: [192, 168, 12, 77], cidr: 28 },
  ];
  const template = examples[randomInt(0, examples.length - 1, random)];
  const jitteredIp = intToIPv4(
    ((template.base[0] << 24) >>> 0) +
      (template.base[1] << 16) +
      (template.base[2] << 8) +
      randomInt(1, 254, random),
  );
  const cidr = random() > 0.35 ? template.cidr : randomInt(18, 30, random);

  return {
    id: `${Date.now()}-${Math.round(random() * 100000)}`,
    ip: jitteredIp,
    cidr,
    summary: calculateSubnet(jitteredIp, cidr),
  };
}

export function getTeacherExamExpected(question: TeacherExamQuestion): Record<string, string> {
  return {
    networkAddress: question.summary.networkAddress,
    broadcastAddress: question.summary.broadcastAddress,
    firstUsableHost: question.summary.firstUsableHost,
    lastUsableHost: question.summary.lastUsableHost,
    subnetMask: question.summary.subnetMask,
    usableHosts: String(question.summary.usableHosts),
  };
}

export function scoreTeacherExamAnswers(question: TeacherExamQuestion, answers: Record<string, string>) {
  const expected = getTeacherExamExpected(question);

  return Object.entries(expected).map(([key, value]) => ({
    key,
    expected: value,
    actual: answers[key] ?? '',
    correct: normalize(answers[key] ?? '') === normalize(value),
  }));
}

export function getDecimalBinaryBreakdown(decimal: number): DecimalBinaryBreakdown {
  if (!Number.isInteger(decimal) || decimal < 0 || decimal > 255) {
    throw new Error('Decimal value must be a whole number from 0 to 255.');
  }

  let remainder = decimal;
  const selectedWeights: number[] = [];

  for (const weight of binaryWeights) {
    if (remainder >= weight) {
      selectedWeights.push(weight);
      remainder -= weight;
    }
  }

  return {
    decimal,
    weights: binaryWeights,
    selectedWeights,
    binary: decimalOctetToBinary(decimal),
    expression: selectedWeights.length > 0 ? selectedWeights.join(' + ') : '0',
  };
}

export function getRemainingAddressSpace(baseNetwork: string, usedAddresses: number): string {
  const { cidr } = parseCidrInput(baseNetwork);
  const total = getTotalAddresses(cidr);
  const remaining = Math.max(total - usedAddresses, 0);

  return `${remaining} of ${total} addresses still unallocated`;
}

export function getHostCapacity(cidr: number): string {
  return `${getUsableHosts(cidr)} usable hosts, ${getTotalAddresses(cidr)} total addresses`;
}
