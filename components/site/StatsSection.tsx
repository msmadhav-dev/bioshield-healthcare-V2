"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

const stats = [
  { value: 1000, suffix: "+", label: "Customer Reach"          },
  { value: 100,  suffix: "+", label: "Products"                },
  { value: 99.9, suffix: "%", label: "Quality Assured",         decimals: 1 },
  { value: 100,  suffix: "+", label: "Doctor's Recommendation" },
];

function Counter({
  value, suffix, decimals = 0, inView,
}: {
  value: number; suffix: string; decimals?: number; inView: boolean;
}) {
  const motionVal = useMotionValue(0);
  const rounded   = useTransform(motionVal, (l) => l.toFixed(decimals));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    if (inView) {
      motionVal.set(0);
      const controls = animate(motionVal, value, {
        duration: 2.4,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => { controls.stop(); unsub(); };
    } else {
      motionVal.set(0);
      setDisplay((0).toFixed(decimals));
      return () => unsub();
    }
  }, [inView, motionVal, rounded, value, decimals]);

  return (
    <span className="brand-gradient">
      {display}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <section ref={ref} className="w-full bg-white py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 md:mb-20"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-[44px] font-medium text-brand-purple-deep"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              letterSpacing: "-0.01em",
            }}
          >
            Bioshield at a Glance
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-x-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.15 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center"
            >
              <div
                className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-none mb-4"
                style={{ letterSpacing: "-0.02em" }}
              >
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                  inView={inView}
                />
              </div>

              <div className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-brand-purple-deep">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}