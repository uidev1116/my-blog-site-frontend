export function pageview(trackingId: string, path: string) {
  window.gtag('config', trackingId, {
    page_path: path,
  });
}
