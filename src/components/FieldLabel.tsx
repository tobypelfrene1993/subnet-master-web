import type { ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';
import { termDefinitions } from '../data/terms';

type FieldLabelProps = {
  children: ReactNode;
  term?: keyof typeof termDefinitions;
};

export function FieldLabel({ children, term }: FieldLabelProps) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-200">
      {children}
      {term ? <InfoTooltip term={term} /> : null}
    </label>
  );
}
