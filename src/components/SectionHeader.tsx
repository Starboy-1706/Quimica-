import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  eyebrow: string;
  title: string;
  highlight: string;
  description?: string;
  icon: LucideIcon;
}

export default function SectionHeader({ eyebrow, title, highlight, description, icon: Icon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
    >
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full glass-chip px-4 py-1.5">
        <Icon className="h-3.5 w-3.5 text-cyan-300" strokeWidth={1.8} />
        <span className="label-eyebrow">{eyebrow}</span>
      </div>
      <h2 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl">
        {title}{" "}
        <span className="text-iridescent">{highlight}</span>
      </h2>
      {description && (
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}
