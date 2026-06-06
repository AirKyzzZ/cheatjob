import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-14 font-serif text-[28px] leading-tight tracking-[-0.01em] text-ink md:text-[34px]"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-10 font-serif text-[20px] leading-snug text-ink" {...props} />
  ),
  p: (props) => (
    <p className="mt-6 font-sans text-[17px] leading-relaxed text-ink/85" {...props} />
  ),
  a: ({ href, ...rest }) => (
    <Link
      href={href ?? "#"}
      className="font-medium text-burgundy underline decoration-burgundy/30 underline-offset-2 transition-colors hover:decoration-burgundy"
      {...rest}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-6 list-disc space-y-2 pl-6 font-sans text-[17px] leading-relaxed text-ink/85"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-6 list-decimal space-y-2 pl-6 font-sans text-[17px] leading-relaxed text-ink/85"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-8 border-l-2 border-burgundy pl-5 font-serif text-[22px] italic leading-snug text-ink"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  hr: () => <hr className="my-12 border-border-subtle" />,
};
