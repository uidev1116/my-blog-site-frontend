import type { Unit, RichEditorUnit } from '@/app/types';

export default function RichEditorUnit({ html }: Unit<RichEditorUnit>) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
