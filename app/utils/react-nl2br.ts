import { createElement, type ReactNode } from 'react';

export default function nl2br(text: string): ReactNode[] {
  return text
    .split('\n')
    .map((line, index) => [line, createElement('br', { key: index })])
    .flat()
    .slice(0, -1);
}
