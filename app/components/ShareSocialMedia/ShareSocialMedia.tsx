'use client';

import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type Props = {
  title: string;
  url: string;
};

export default function ShareSocialMedia({ title, url }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  function handleCopy() {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }
  return (
    <aside aria-label="Share social media">
      <a
        href={`https://twitter.com/intent/tweet?${new URLSearchParams({
          text: title,
          url,
        })}`}
        className="hover:text-primary-700 mr-2 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 no-underline hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          className="mr-2 h-[16px] w-[16px]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill="currentColor"
            d="M12.186 8.672 18.743.947h-2.927l-5.005 5.9-4.44-5.9H0l7.434 9.876-6.986 8.23h2.927l5.434-6.4 4.82 6.4H20L12.186 8.672Zm-2.267 2.671L8.544 9.515 3.2 2.42h2.2l4.312 5.719 1.375 1.828 5.731 7.613h-2.2l-4.699-6.237Z"
          />
        </svg>{' '}
        Share
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams(
          { u: url },
        )}`}
        className="hover:text-primary-700 mr-2 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 no-underline hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          className="mr-2 h-[16px] w-[16px]"
          fill="currentColor"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
        </svg>{' '}
        Share
      </a>
      <CopyToClipboard text={url} onCopy={handleCopy}>
        <button
          type="button"
          className="hover:text-primary-700 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 no-underline hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        >
          {isCopied ? (
            <>
              <svg
                className="mr-2 h-[16px] w-[16px]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 12"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5.917 5.724 10.5 15 1.5"
                />
              </svg>{' '}
              URL copied!
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-[16px] w-[16px]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m7.708 2.292.706-.706A2 2 0 0 1 9.828 1h6.239A.97.97 0 0 1 17 2v12a.97.97 0 0 1-.933 1H15M6 5v4a1 1 0 0 1-1 1H1m11-4v12a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V9.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 5h5.239A.97.97 0 0 1 12 6Z"
                />
              </svg>{' '}
              Copy URL
            </>
          )}
        </button>
      </CopyToClipboard>
    </aside>
  );
}
