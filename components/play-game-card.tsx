"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GameIframe from "@/components/game-iframe";

interface PlayGameCardProps {
  htmlValid: boolean;
  htmlContent: string;
  title: string;
}

interface ViewportSize {
  width: number;
  height: number;
}

export default function PlayGameCard({
  htmlValid,
  htmlContent,
  title,
}: PlayGameCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen]);

  const fittedSize = useMemo(() => {
    if (!isFullscreen || !viewport.width || !viewport.height) {
      return null;
    }
    const screenRatio = viewport.width / viewport.height;
    if (screenRatio > aspectRatio) {
      return {
        width: Math.round(viewport.height * aspectRatio),
        height: viewport.height,
      };
    }
    return {
      width: viewport.width,
      height: Math.round(viewport.width / aspectRatio),
    };
  }, [aspectRatio, isFullscreen, viewport.height, viewport.width]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      const rect = container.getBoundingClientRect();
      if (rect.width && rect.height) {
        setAspectRatio(rect.width / rect.height);
      }
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Play Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative border rounded-lg overflow-hidden"
          style={
            isFullscreen
              ? { width: "100%", height: "100vh", background: "black" }
              : undefined
          }
        >
          {isFullscreen ? (
            <div className="flex items-center justify-center w-full h-full bg-black">
              {htmlValid && fittedSize ? (
                <div
                  className="relative"
                  style={{ width: fittedSize.width, height: fittedSize.height }}
                >
                  <GameIframe
                    html={htmlContent}
                    title={title}
                    fixedWidth={fittedSize.width}
                    fixedHeight={fittedSize.height}
                    minHeight={360}
                  />
                </div>
              ) : (
                <div className="p-6 text-sm text-destructive">
                  当前版本的HTML不完整，无法渲染游戏。请点击右侧“Edit This Game”重新生成。
                </div>
              )}
            </div>
          ) : htmlValid ? (
            <GameIframe html={htmlContent} title={title} minHeight={360} />
          ) : (
            <div className="p-6 text-sm text-destructive">
              当前版本的HTML不完整，无法渲染游戏。请点击右侧“Edit This Game”重新生成。
            </div>
          )}
          <div className="absolute bottom-3 right-3">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            The game runs in an iframe with sandboxed security. If you encounter
            issues, try refreshing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
