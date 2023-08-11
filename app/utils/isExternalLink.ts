export default function isExternalLink(url: string) {
  if (!/^(https?)?:/.test(url)) {
    return false;
  }

  if (new RegExp(`${globalThis.location?.hostname}(:\\d+)*`).test(url)) {
    return false;
  }

  return true;
}
