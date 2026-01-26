"use client";

import { useEffect, useRef } from "react";

interface GameIframeProps {
  html: string;
  title: string;
  className?: string;
  minHeight?: number;
  fixedHeight?: number;
  fixedWidth?: number;
  scale?: number;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export default function GameIframe({
  html,
  title,
  className,
  minHeight = 360,
  fixedHeight,
  fixedWidth,
  scale,
  onSizeChange,
}: GameIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (fixedHeight) {
      iframe.style.height = `${fixedHeight}px`;
    }

    if (fixedWidth) {
      iframe.style.width = `${fixedWidth}px`;
    }

    if (fixedHeight) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const body = doc.body;
        const htmlEl = doc.documentElement;
        const nextHeight = Math.max(
          body?.scrollHeight || 0,
          htmlEl?.scrollHeight || 0,
          minHeight
        );
        const nextWidth = Math.max(body?.scrollWidth || 0, htmlEl?.scrollWidth || 0);
        iframe.style.height = `${nextHeight}px`;
        if (onSizeChange) {
          onSizeChange({ width: nextWidth, height: nextHeight });
        }
      } catch {
        // ignore cross-origin or access issues
      }
    };

    const onLoad = () => {
      updateHeight();
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        resizeObserver = new ResizeObserver(() => updateHeight());
        resizeObserver.observe(doc.documentElement);
        if (doc.body) resizeObserver.observe(doc.body);
      } catch {
        // ignore
      }
    };

    iframe.addEventListener("load", onLoad);

    const interval = window.setInterval(updateHeight, 500);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (resizeObserver) resizeObserver.disconnect();
      window.clearInterval(interval);
    };
  }, [html, minHeight, fixedHeight, fixedWidth]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      title={title}
      className={`w-full border-0 ${className || ""}`}
      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-popups-to-escape-sandbox"
      allow="gamepad; fullscreen; microphone; camera; autoplay; clipboard-write; encrypted-media; picture-in-picture"
      style={{
        minHeight,
        height: fixedHeight ? `${fixedHeight}px` : undefined,
        width: fixedWidth ? `${fixedWidth}px` : undefined,
        transform: scale ? `scale(${scale})` : undefined,
        transformOrigin: scale ? "top left" : undefined,
      }}
    />
  );
}
