import { useEffect, useRef } from "react";

/**
 * Fondo inmersivo: auroras de gradiente + red molecular en canvas.
 * Las partículas se unen con "enlaces" cuando están cerca, como un diagrama de Lewis vivo.
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    interface Node {
      x: number; y: number; vx: number; vy: number; r: number; hue: number;
    }
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.6 + 0.8,
        hue: [186, 258, 158][Math.floor(Math.random() * 3)],
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const linkDist = Math.min(150, w * 0.11);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;

        // atracción suave al cursor
        const dxm = mouse.x - n.x;
        const dym = mouse.y - n.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 180 && dm > 0.001) {
          n.x += (dxm / dm) * 0.28;
          n.y += (dym / dm) * 0.28;
        }
      }

      // enlaces
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.16;
            ctx.strokeStyle = `hsla(${a.hue}, 85%, 70%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // átomos
      for (const n of nodes) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        g.addColorStop(0, `hsla(${n.hue}, 90%, 75%, 0.55)`);
        g.addColorStop(1, `hsla(${n.hue}, 90%, 75%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${n.hue}, 95%, 82%, 0.9)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    step();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* base profunda */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#0a1428_0%,#04070f_55%,#020408_100%)]" />

      {/* auroras */}
      <div className="absolute -top-[20%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_62%)] blur-3xl animate-aurora" />
      <div className="absolute top-[10%] -right-[15%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_62%)] blur-3xl animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-[-25%] left-[20%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.1),transparent_62%)] blur-3xl animate-aurora [animation-delay:-12s]" />

      {/* red molecular */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />

      {/* viñeta */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,transparent_60%,rgba(2,4,8,0.75)_100%)]" />
    </div>
  );
}
