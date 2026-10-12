"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { BLOGS, type BlogMeta } from "@/content/blogs";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function BlogsPage() {
  const { locale, messages } = useLocale();
  const [active, setActive] = useState<BlogMeta | null>(null);

  const posts = useMemo(
    () => BLOGS.map((post) => ({ ...post, ...messages.blog.posts[post.id] })).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [messages],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <PageLayout page="blogs">
      <motion.ul
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-4xl flex-col divide-y divide-[var(--ink-rule)] border-y border-[var(--ink-rule)]"
      >
        {posts.map((post) => (
          <motion.li key={post.id} variants={item}>
            <button
              type="button"
              data-blog-id={post.id}
              onClick={() => setActive(post)}
              className="group flex w-full flex-col items-start gap-2 py-5 text-left transition-colors hover:bg-white/40 sm:gap-3 sm:py-6"
            >
              <h3 className="font-serif text-lg leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--sky-deep)] lg:text-xl">
                {post.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="mono text-[11px] tracking-[0.18em] text-[var(--foreground-faint)]">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${post.date}T00:00:00Z`))}
                </span>
                {post.tags.length > 0 && (
                  <span className="text-[var(--foreground-faint)]">·</span>
                )}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono rounded-full border border-[var(--ink-rule)] px-2.5 py-[2px] text-[10px] tracking-[0.14em] text-[var(--foreground-soft)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {post.summary && (
                <p className="font-serif text-[14px] leading-6 text-[var(--foreground-soft)] lg:text-[15px]">
                  {post.summary}
                </p>
              )}
            </button>
          </motion.li>
        ))}
      </motion.ul>

      <AnimatePresence mode="wait">
        {active && <BlogModal key={`${active.id}:${locale}`} post={{ ...active, ...messages.blog.posts[active.id] }} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </PageLayout>
  );
}

function BlogModal({ post, onClose }: { post: BlogMeta; onClose: () => void }) {
  const { locale, messages } = useLocale();
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.body.dataset.modalOpen = "true";
    return () => {
      delete document.body.dataset.modalOpen;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    post
      .loadBody(locale)
      .then((text) => {
        if (!cancelled) {
          setBody(text);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post, locale, attempt]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,30,50,0.55)] px-[4vw] pb-6 pt-24 backdrop-blur-md sm:px-[6vw] sm:pb-10 lg:px-[8vw]"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`blog-${post.id}-title`}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.92 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative flex h-[calc(100dvh-8rem)] max-h-[88vh] w-full flex-col overflow-hidden rounded-lg bg-[var(--background)] shadow-[0_30px_80px_-30px_rgba(15,30,50,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-24 lg:py-40">
         <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5 px-6 sm:px-10 lg:px-12">
          <div>
            <h3
              id={`blog-${post.id}-title`}
              className="font-serif text-3xl font-semibold leading-tight tracking-tight lg:text-4xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #2563eb 0%, #7ab8e0 60%, #b8d6ec 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {post.title}
            </h3>
          </div>

          <div className="mono flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-[var(--foreground-faint)]">
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${post.date}T00:00:00Z`))}</span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="mono rounded-full border border-[var(--ink-rule)] px-3 py-[3px] text-[11px] text-[var(--foreground-soft)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="min-h-0">
            {loading && (
              <div className="mono py-8 text-center text-[11px] tracking-[0.2em] text-[var(--foreground-faint)]">
                {messages.common.loading}
              </div>
            )}
            {body && <MarkdownBody source={body} />}
            {!loading && !body && (
              <div role="alert" className="flex flex-col items-start gap-3 py-8">
                <p>{messages.blog.loadError}</p>
                <button type="button" onClick={() => { setLoading(true); setAttempt((value) => value + 1); }} className="rounded-full border border-[var(--rule)] px-4 py-2 text-[var(--sky-deep)]">{messages.common.retry}</button>
              </div>
            )}
          </div>
         </div>
        </div>

        <button
          type="button"
          aria-label={messages.common.close}
          onClick={onClose}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--background)]/80 text-[var(--foreground-soft)] backdrop-blur transition-colors hover:bg-[var(--sky-soft)] hover:text-[var(--foreground)]"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}

function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="blog-prose font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (props) => <h1 className="mt-8 mb-4 font-serif text-2xl font-semibold text-[var(--foreground)] lg:text-3xl" {...props} />,
          h2: (props) => <h2 className="mt-20 mb-4 border-t border-[var(--ink-rule)] pt-10 font-serif text-xl font-semibold text-[var(--foreground)] first:mt-4 first:border-t-0 first:pt-0 lg:text-2xl" {...props} />,
          h3: (props) => <h3 className="mt-10 mb-2 font-serif text-lg font-semibold text-[var(--foreground)] lg:text-xl" {...props} />,
          h4: (props) => <h4 className="mt-4 mb-2 font-serif text-base font-semibold text-[var(--foreground)]" {...props} />,
          p: ({ className, ...props }) => (
            <p className={className ? className : "my-3"} {...props} />
          ),
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--sky-deep)] underline decoration-[var(--rule)] underline-offset-4 transition-colors hover:decoration-[var(--sky-deep)]"
            />
          ),
          ul: (props) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
          ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote className="my-4 border-l-2 border-[var(--sky)] pl-4 italic text-[var(--foreground)]" {...props} />
          ),
          code: ({ className, children, ...rest }: ComponentPropsWithoutRef<"code">) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className={`${className ?? ""} block`} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code className="mono rounded bg-[var(--sky-soft)]/60 px-1.5 py-0.5 text-[13px] text-[var(--foreground)]" {...rest}>
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre
              className="mono my-4 overflow-x-auto rounded-md border border-[var(--ink-rule)] bg-[var(--sky-soft)]/40 p-4 text-[13px] leading-6 text-[var(--foreground)]"
              {...props}
            />
          ),
          hr: () => <hr className="my-8 border-[var(--ink-rule)]" />,
          strong: (props) => <strong className="font-semibold text-[var(--foreground)]" {...props} />,
          table: (props) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-[var(--sky-soft)]/40" {...props} />,
          th: (props) => (
            <th
              className="border border-[var(--ink-rule)] px-3 py-2 text-left font-semibold text-[var(--foreground)]"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-[var(--ink-rule)] px-3 py-2 align-top text-[var(--foreground-soft)]"
              {...props}
            />
          ),
          audio: ({ src, className, ...rest }) => (
            <audio
              controls
              preload="none"
              src={typeof src === "string" ? src : undefined}
              className={className ? className : "my-1 h-8 w-full max-w-[360px] align-middle"}
              {...rest}
            />
          ),
          img: ({ src, alt }) => {
            if (typeof src !== "string") return null;
            const [path, query = ""] = src.split("?");
            const params = new URLSearchParams(query);
            const notionWidth = params.get("w");
            const fullWidth = params.get("full") === "1";
            const style = fullWidth
              ? { maxWidth: "720px" }
              : notionWidth
                ? { maxWidth: `${Math.min(Number(notionWidth), 720)}px` }
                : { maxWidth: "480px" };
            return (
              <span className="my-4 block">
                <span className="block" style={style}>
                  <Image
                    src={path}
                    alt={alt ?? ""}
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 900px, 90vw"
                    className="h-auto w-full rounded-md border border-[var(--ink-rule)]"
                    loading="lazy"
                  />
                </span>
              </span>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
