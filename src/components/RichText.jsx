import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const URL_RE = /(^|[\s(])((?:https?:\/\/|www\.)[^\s<>]*[^\s<>.,;:!?)])/g;

// Transforma links soltos em links clicáveis e preserva as quebras de linha
const prepare = (text = '') => text
  .replace(URL_RE, (_, pre, url) => url.startsWith('www.') ? `${pre}[${url}](https://${url})` : `${pre}<${url}>`)
  .replace(/\n/g, '  \n');

const Big = ({ node, ...props }) => <p {...props} className="text-lg font-bold leading-snug" />;
const components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all" />,
  h1: Big, h2: Big, h3: Big,
};

export default function RichText({ text, className }) {
  return (
    <div className={cn('text-sm leading-relaxed break-words [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5', className)}>
      <ReactMarkdown components={components}>{prepare(text)}</ReactMarkdown>
    </div>
  );
}