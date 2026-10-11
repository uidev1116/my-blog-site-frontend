import { lazy, Suspense, type ComponentType } from 'react';

/**
 * `next/dynamic` のテスト用差し替え。
 * ローダーを実際に実行し、React.lazy + Suspense で描画する(`await screen.findBy...` で待つ)。
 */
export function dynamicMock<P extends object>(
  loader: () => Promise<ComponentType<P>>,
) {
  const Lazy = lazy(async () => ({ default: await loader() }));
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...(props as P & object)} />
      </Suspense>
    );
  };
}
