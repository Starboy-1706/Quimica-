"use client";

import { useEffect, useRef } from "react";

type Bubble = {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobbleAmp: number;
  wobbleFreq: number;
  phase: number;
  hue: "brand" | "brass" | "cream";
};

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const BRASS = "rgba(220, 166, 63,";
const CREAM = "rgba(242, 234, 212,";

function hexToRgba(hex: string): string {
  const normalized = hex.replace("#", "");
  const value = parseInt(
    normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized,
    16,
  );
  if (Number.isNaN(value)) return "rgba(15, 94, 91,";
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255},`;
}

/**
 * Atmósfera animada del acceso interno: burbujas ascendiendo como en un
 * matraz en ebullición y una constelación de átomos enlazados a la deriva.
 * Respeta `prefers-reduced-motion` (pinta un único fotograma estático).
 */
export function LoginAtmosphere({ brandColor }: { brandColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const brand = hexToRgba(brandColor);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const bubbles: Bubble[] = [];
    const nodes: Node[] = [];

    function seed() {
      bubbles.length = 0;
      nodes.length = 0;
      const bubbleCount = Math.round(Math.min(34, Math.max(16, width / 42)));
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.4 + Math.random() * 4.6,
          speed: 0.25 + Math.random() * 0.75,
          wobbleAmp: 4 + Math.random() * 14,
          wobbleFreq: 0.4 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          hue:
            Math.random() < 0.42 ? "brand" : Math.random() < 0.75 ? "brass" : "cream",
        });
      }
      const nodeCount = Math.round(Math.min(26, Math.max(12, width / 70)));
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
        });
      }
    }

    function resize() {
      if (!canvas) return;
      const { clientWidth, clientHeight } = canvas;
      width = clientWidth;
      height = clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (bubbles.length === 0) seed();
    }

    function bubbleColor(bubble: Bubble, alpha: number): string {
      if (bubble.hue === "brand") return `${brand} ${alpha})`;
      if (bubble.hue === "brass") return `${BRASS} ${alpha})`;
      return `${CREAM} ${alpha})`;
    }

    function paint(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Constelación de átomos (deriva lenta con enlaces de proximidad).
      const LINK_DIST = 130;
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.10;
            ctx.strokeStyle = `${CREAM} ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const node of nodes) {
        ctx.fillStyle = `${BRASS} 0.16)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Burbujas ascendentes del matraz.
      for (const bubble of bubbles) {
        bubble.y -= bubble.speed;
        if (bubble.y < -bubble.r - 8) {
          bubble.y = height + bubble.r + 8;
          bubble.x = Math.random() * width;
        }
        const wobbleX =
          bubble.x +
          Math.sin(time * 0.001 * bubble.wobbleFreq + bubble.phase) *
            bubble.wobbleAmp;
        const fadeTop = Math.min(1, bubble.y / (height * 0.18));
        const fadeBottom = Math.min(1, (height - bubble.y) / (height * 0.12));
        const alpha = 0.28 * fadeTop * fadeBottom + 0.04;

        ctx.strokeStyle = bubbleColor(bubble, alpha);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(wobbleX, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.stroke();

        // Destello interior (reflejo de la pompa).
        ctx.fillStyle = bubbleColor(bubble, alpha * 0.55);
        ctx.beginPath();
        ctx.arc(
          wobbleX - bubble.r * 0.34,
          bubble.y - bubble.r * 0.34,
          bubble.r * 0.24,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    function frame(time: number) {
      if (!running) return;
      paint(time);
      raf = requestAnimationFrame(frame);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (reduced) {
      paint(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [brandColor]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
