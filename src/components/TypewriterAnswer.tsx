import { useEffect, useState } from "react";

/** Reveals FAQ copy at a brisk reading pace while keeping its full text available to assistive tech. */
export default function TypewriterAnswer({ text }: { text: string }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleText(text);
      return;
    }
    setVisibleText("");
    let startedAt = 0;
    let frame = 0;
    const reveal = (now: number) => {
      if (!startedAt) startedAt = now;
      const count = Math.min(text.length, Math.floor((now - startedAt) / 7) + 1);
      setVisibleText(text.slice(0, count));
      if (count < text.length) frame = window.requestAnimationFrame(reveal);
    };
    frame = window.requestAnimationFrame(reveal);
    return () => window.cancelAnimationFrame(frame);
  }, [text]);

  return <><span className="faq-answer-typewriter" aria-hidden="true">{visibleText}</span><span className="sr-only">{text}</span></>;
}
