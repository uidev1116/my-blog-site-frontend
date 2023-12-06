const newlineRegex = /(\r\n|\r|\n)/g;

export default function nl2br(string: string) {
  if (typeof string !== 'string') {
    return string;
  }

  return string
    .split(newlineRegex)
    .map(function (line, index) {
      if (line.match(newlineRegex)) {
        return '<br />';
      }
      return line;
    })
    .join('');
}
