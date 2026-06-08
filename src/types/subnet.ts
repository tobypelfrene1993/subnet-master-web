export type SubnetSummary = {
  inputIp: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  subnetMask: string;
  wildcardMask: string;
  totalAddresses: number;
  usableHosts: number;
  blockSize: number;
};

export type VlsmInput = {
  id: string;
  name: string;
  hosts: number;
};

export type VlsmOrder = 'original' | 'optimized' | 'random';

export type VlsmAllocation = {
  id: string;
  name: string;
  requiredHosts: number;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  usableHosts: number;
  totalAddresses: number;
  startInt: number;
  endInt: number;
};

export type QuizQuestionType =
  | 'network'
  | 'broadcast'
  | 'firstHost'
  | 'lastHost'
  | 'usableHosts'
  | 'mask';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  ip: string;
  cidr: number;
  answer: string;
  explanation: string;
};

export type CheckedAnswer = {
  correct: boolean;
  normalizedExpected: string;
  normalizedActual: string;
};
