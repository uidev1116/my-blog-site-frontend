import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element,
  attributesToProps,
  DOMNode,
} from 'html-react-parser';
import type { Unit, TableUnit } from '@/app/types';

const options: HTMLReactParserOptions = {
  replace(domNode) {
    if (domNode instanceof Element && domNode.attribs) {
      if (domNode.tagName === 'table') {
        return (
          <table {...attributesToProps(domNode.attribs)}>
            <tbody>{domToReact(domNode.children as DOMNode[], options)}</tbody>
          </table>
        );
      }
    }
  },
};

export default function TableUnit({ table }: Unit<TableUnit>) {
  return (
    <div>
      <div className="my-[1.5em] overflow-x-auto sm:my-[2em] lg:my-[1.7777778em]">
        {parse(table, options)}
      </div>
    </div>
  );
}
