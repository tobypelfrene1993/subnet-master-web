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

export type VlsmRequirementInput = {
  id: string;
  name: string;
  hosts: number;
  quantity: number;
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

export type VlsmUnusedRange = {
  startAddress: string;
  endAddress: string;
  totalAddresses: number;
  startInt: number;
  endInt: number;
};

export type VlsmPlan = {
  baseNetwork: string;
  baseCidr: number;
  baseSubnetMask: string;
  baseBroadcast: string;
  baseTotalAddresses: number;
  allocations: VlsmAllocation[];
  unusedRanges: VlsmUnusedRange[];
  totalRequiredHosts: number;
  totalAllocatedAddresses: number;
  efficiencyPercent: number;
};

export type AvailableSubnet = {
  subnet: string;
  networkAddress: string;
  firstHost: string;
  lastHost: string;
  broadcastAddress: string;
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
