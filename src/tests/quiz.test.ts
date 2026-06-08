import { describe, expect, it } from 'vitest';
import { checkAnswer, generateQuestion } from '../lib/quiz';

describe('quiz helpers', () => {
  it('checks normalized answers', () => {
    expect(checkAnswer(' 255.255.255.0 ', '255.255.255.0').correct).toBe(true);
    expect(checkAnswer('62', '64').correct).toBe(false);
  });

  it('generates a question with a checkable answer', () => {
    const question = generateQuestion('easy', () => 0.5);
    expect(question.prompt.length).toBeGreaterThan(10);
    expect(checkAnswer(question.answer, question.answer).correct).toBe(true);
  });
});
