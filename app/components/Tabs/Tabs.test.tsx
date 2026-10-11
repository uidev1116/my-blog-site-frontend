// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, Tabs } from '.';

describe('Tabs', () => {
  it('Tabs / TabList / Tab を組み合わせて描画する', () => {
    render(
      <Tabs data-testid="tabs">
        <TabList>
          <Tab>一つ目</Tab>
          <Tab className="custom">二つ目</Tab>
        </TabList>
      </Tabs>,
    );
    expect(screen.getByTestId('tabs')).toHaveClass('flex-col');
    expect(screen.getByRole('list')).toHaveClass('-mb-px');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('一つ目')).toHaveClass('me-2');
    expect(screen.getByText('二つ目')).toHaveClass('custom');
  });

  it('className を差し替え・追加でき、ref を渡せる', () => {
    const tabsRef = createRef<HTMLDivElement>();
    const listRef = createRef<HTMLUListElement>();
    const tabRef = createRef<HTMLLIElement>();
    render(
      <Tabs ref={tabsRef} className="t">
        <TabList ref={listRef} className="l">
          <Tab ref={tabRef}>a</Tab>
        </TabList>
      </Tabs>,
    );
    expect(tabsRef.current).toHaveClass('t');
    expect(tabsRef.current).not.toHaveClass('flex-col');
    expect(listRef.current).toHaveClass('l', '-mb-px');
    expect(tabRef.current).toBe(screen.getByText('a'));
  });
});
