import { describe, expect, it } from 'vitest';
import {
  checkWizardAnswer,
  explainWrongAnswer,
  getDecimalBinaryBreakdown,
  getSubnetLearningDetails,
  getWizardSteps,
  scoreTeacherExamAnswers,
} from '../lib/learning';

describe('educational subnetting helpers', () => {
  it('builds magic number learning details for /26', () => {
    const details = getSubnetLearningDetails('192.168.1.130', 26);

    expect(details.activeOctetIndex).toBe(3);
    expect(details.activeMaskOctet).toBe(192);
    expect(details.magicNumber).toBe(64);
    expect(details.boundaries).toEqual([0, 64, 128, 192, 256]);
    expect(details.blockLabel).toBe('128 - 191');
  });

  it('creates checkable wizard steps', () => {
    const steps = getWizardSteps('192.168.1.130', 26);

    expect(steps).toHaveLength(9);
    expect(checkWizardAnswer('/26', steps[0]).correct).toBe(true);
    expect(checkWizardAnswer('255.255.255.192', steps[1]).correct).toBe(true);
    expect(checkWizardAnswer('192.168.1.128', steps[4]).correct).toBe(true);
  });

  it('explains wrong network answers with block reasoning', () => {
    const explanation = explainWrongAnswer('network', '192.168.1.64', '192.168.1.128', '192.168.1.130', 26);

    expect(explanation).toContain('block size is 64');
    expect(explanation).toContain('between 128 and 191');
    expect(explanation).toContain('192.168.1.128');
  });

  it('scores teacher exam fields independently', () => {
    const question = {
      id: 'fixed',
      ip: '192.168.1.130',
      cidr: 26,
      summary: getSubnetLearningDetails('192.168.1.130', 26).summary,
    };

    const result = scoreTeacherExamAnswers(question, {
      networkAddress: '192.168.1.128',
      broadcastAddress: 'wrong',
      firstUsableHost: '192.168.1.129',
      lastUsableHost: '192.168.1.190',
      subnetMask: '255.255.255.192',
      usableHosts: '62',
    });

    expect(result.filter((item) => item.correct)).toHaveLength(5);
    expect(result.find((item) => item.key === 'broadcastAddress')?.correct).toBe(false);
  });

  it('breaks decimal octets into binary weights', () => {
    const breakdown = getDecimalBinaryBreakdown(138);

    expect(breakdown.selectedWeights).toEqual([128, 8, 2]);
    expect(breakdown.expression).toBe('128 + 8 + 2');
    expect(breakdown.binary).toBe('10001010');
  });
});
