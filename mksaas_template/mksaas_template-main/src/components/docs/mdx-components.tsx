import { ImageWrapper } from '@/components/docs/image-wrapper';
import { Wrapper } from '@/components/docs/wrapper';
import { YoutubeVideo } from '@/components/docs/youtube-video';
import { PremiumContent } from '@/components/premium/premium-content';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as LucideIcons from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, FC, ReactNode } from 'react';
import { Children, Fragment } from 'react';
import { XEmbedClient } from './xembed';

/**
 * Enhanced MDX Content component that includes commonly used MDX components
 * It can be used for blog posts, documentation, and custom pages
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  // Start with default components
  const baseComponents: Record<string, any> = {
    ...defaultMdxComponents,
    ...LucideIcons,
    // ...((await import('lucide-react')) as unknown as MDXComponents),
    XEmbedClient,
    YoutubeVideo,
    PremiumContent,
    Tabs,
    Tab,
    TypeTable,
    Accordion,
    Accordions,
    Steps,
    Step,
    Callout,
    Wrapper,
    File,
    Folder,
    Files,
    blockquote: Callout as unknown as FC<ComponentProps<'blockquote'>>,
    img: ImageWrapper,
  };

  // 轻量“==高亮==”内联语法支持：将文本节点中的 ==text== 转为 <mark>text</mark>
  function InlineHighlight({ children }: { children: ReactNode }) {
    const render = (node: ReactNode): ReactNode => {
      if (typeof node === 'string') {
        const parts = node.split(/(==[^=\n]+==)/g);
        return parts.map((part, i) => {
          if (part.startsWith('==') && part.endsWith('==')) {
            const content = part.slice(2, -2);
            return <mark key={i}>{content}</mark>;
          }
          return <Fragment key={i}>{part}</Fragment>;
        });
      }
      if (Array.isArray(node)) {
        return node.map((n, i) => <Fragment key={i}>{render(n)}</Fragment>);
      }
      return node;
    };
    return <>{render(children)}</>;
  }

  // 覆盖常见容器，应用内联高亮
  const P: FC<ComponentProps<'p'>> = (props) => (
    <p {...props}>
      <InlineHighlight>{props.children}</InlineHighlight>
    </p>
  );
  const LI: FC<ComponentProps<'li'>> = (props) => (
    <li {...props}>
      <InlineHighlight>{props.children}</InlineHighlight>
    </li>
  );
  const TD: FC<ComponentProps<'td'>> = (props) => (
    <td {...props}>
      <InlineHighlight>{props.children}</InlineHighlight>
    </td>
  );

  return {
    ...baseComponents,
    p: P,
    li: LI,
    td: TD,
    ...components,
  };
}
