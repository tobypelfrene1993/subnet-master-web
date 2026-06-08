import {
  calculateSubnet,
  cidrToSubnetMask,
  getUsableHosts,
  intToIPv4,
} from './subnet';
import type { CheckedAnswer, Difficulty, QuizQuestion, QuizQuestionType } from '../types/subnet';

const questionTypes: QuizQuestionType[] = ['network', 'broadcast', 'firstHost', 'lastHost', 'usableHosts', 'mask'];

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function cidrRangeForDifficulty(difficulty: Difficulty): [number, number] {
  if (difficulty === 'easy') {
    return [24, 30];
  }
  if (difficulty === 'medium') {
    return [20, 30];
  }

  return [16, 30];
}

function promptFor(type: QuizQuestionType, ip: string, cidr: number): string {
  const network = `${ip}/${cidr}`;
  switch (type) {
    case 'network':
      return `Find the network address for ${network}.`;
    case 'broadcast':
      return `Find the broadcast address for ${network}.`;
    case 'firstHost':
      return `Find the first usable host for ${network}.`;
    case 'lastHost':
      return `Find the last usable host for ${network}.`;
    case 'usableHosts':
      return `How many usable hosts are available in a /${cidr} subnet?`;
    case 'mask':
      return `Convert /${cidr} to a subnet mask.`;
  }
}

function answerFor(type: QuizQuestionType, summary: ReturnType<typeof calculateSubnet>): string {
  switch (type) {
    case 'network':
      return summary.networkAddress;
    case 'broadcast':
      return summary.broadcastAddress;
    case 'firstHost':
      return summary.firstUsableHost;
    case 'lastHost':
      return summary.lastUsableHost;
    case 'usableHosts':
      return String(summary.usableHosts);
    case 'mask':
      return summary.subnetMask;
  }
}

export function generateQuestion(
  difficulty: Difficulty = 'medium',
  random: () => number = Math.random,
): QuizQuestion {
  const [minCidr, maxCidr] = cidrRangeForDifficulty(difficulty);
  const cidr = randomInt(minCidr, maxCidr, random);
  const ip = intToIPv4(
    ((10 << 24) >>> 0) +
      (randomInt(0, 255, random) << 16) +
      (randomInt(0, 255, random) << 8) +
      randomInt(1, 254, random),
  );
  const type = questionTypes[randomInt(0, questionTypes.length - 1, random)];
  const summary = calculateSubnet(ip, cidr);
  const answer = answerFor(type, summary);

  return {
    id: `${Date.now()}-${Math.round(random() * 100000)}`,
    type,
    prompt: promptFor(type, ip, cidr),
    ip,
    cidr,
    answer,
    explanation:
      type === 'mask'
        ? `A /${cidr} prefix uses ${cidr} network bits, which equals subnet mask ${cidrToSubnetMask(cidr)}.`
        : type === 'usableHosts'
          ? `/${cidr} has ${summary.totalAddresses} total addresses. Usable hosts are ${getUsableHosts(cidr)} for this subnet size.`
          : `${ip}/${cidr} belongs to ${summary.networkAddress}/${cidr}, with broadcast ${summary.broadcastAddress} and usable range ${summary.firstUsableHost} to ${summary.lastUsableHost}.`,
  };
}

export function generateExamQuestions(count: number, difficulty: Difficulty): QuizQuestion[] {
  return Array.from({ length: count }, () => generateQuestion(difficulty));
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, '');
}

export function checkAnswer(actual: string, expected: string): CheckedAnswer {
  const normalizedActual = normalizeAnswer(actual);
  const normalizedExpected = normalizeAnswer(expected);

  return {
    correct: normalizedActual === normalizedExpected,
    normalizedActual,
    normalizedExpected,
  };
}
