import parse, {
  attributesToProps,
  domToReact,
  Element,
  type DOMNode,
} from 'html-react-parser';

type Props = {
  html: string;
};

/**
 * 管理画面のカスタムフィールドに入力された HTML(script・meta など)をそのまま出す。
 * script の中身は React に任せるとエスケープされる(`&&` が `&amp;&amp;` になる)ため、
 * dangerouslySetInnerHTML で渡す。値は管理者が入力したもので、利用者の入力は含まない。
 */
export default function CustomHtml({ html }: Props) {
  if (html.trim() === '') {
    return null;
  }

  return (
    <>
      {parse(html, {
        replace(node) {
          if (node instanceof Element && node.name === 'script') {
            const code = domToReact(node.children as DOMNode[]);
            return (
              <script
                {...attributesToProps(node.attribs)}
                dangerouslySetInnerHTML={{
                  __html: typeof code === 'string' ? code : '',
                }}
              />
            );
          }
        },
      })}
    </>
  );
}
