type Props = {
  children?: React.ReactNode;
};
export default function EmptyState({
  children = <p>お探しの記事が見つかりませんでした。</p>,
}: Props) {
  return (
    <div className="mx-auto flex flex-wrap items-center justify-between rounded-md bg-white dark:bg-slate-500">
      <div className="flex w-full justify-center rounded-md border-2 border-dashed border-slate-200 p-20 dark:border-slate-100">
        <div className="text-center">
          <div className="mb-4 grid place-items-center">
            <svg
              className="h-[32px] w-[32px] text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 16.5c0-1-8-2.7-9-2V1.8c1-1 9 .707 9 1.706M10 16.5V3.506M10 16.5c0-1 8-2.7 9-2V1.8c-1-1-9 .707-9 1.706"
              />
            </svg>
          </div>
          <div className="space-y-2 text-xl dark:text-white">{children}</div>
        </div>
      </div>
    </div>
  );
}
