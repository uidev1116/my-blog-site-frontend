// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Container from './Container';

it('子要素を描画する', () => {
  render(<Container>中身</Container>);
  expect(screen.getByText('中身')).toBeInTheDocument();
});
