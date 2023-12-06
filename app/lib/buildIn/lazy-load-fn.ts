import lozad from 'lozad';

export default function lazyLoad(
  selector: string,
  isLazy: (element: HTMLElement) => boolean,
  run: (element: HTMLElement) => void,
) {
  const observer = lozad(selector, {
    loaded: (el: HTMLElement) => {
      if (isLazy(el)) {
        run(el);
      }
    },
  });
  observer.observe();
  [].forEach.call(document.querySelectorAll(selector), (item: HTMLElement) => {
    if (!isLazy(item)) {
      run(item);
    }
  });
}
