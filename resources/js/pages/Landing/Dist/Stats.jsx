import { motion } from "motion/react"
import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 250, suffix: '+', label: 'Projects Completed' },
  { value: 15, suffix: ' Years', label: 'Industry Experience' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
  { value: 500, suffix: '+', label: 'Team Members' },
];

function Counter({ value, suffix, textColor }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="text-5xl font-bold"
      style={{ color: textColor }}
    >
      {count}
      {suffix}
    </div>
  );
}

export function Stats() {
  const isLight =
    typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('data-mantine-color-scheme') ?? 'light') === 'light'
      : true;

  const titleColor = isLight ? '#0f172a' : '#ffffff';
  const subtitleColor = isLight ? '#1e293b' : '#bfdbfe';
  const labelColor = isLight ? '#0f172a' : '#bfdbfe';
  const numberColor = isLight ? '#0f172a' : '#ffffff';

  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDEyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMTIgMjRjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02eiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-5xl font-bold mb-4"
            style={{ color: titleColor }}
          >
            Our Impact
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: subtitleColor }}
          >
            Numbers that speak to our commitment and excellence
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                textColor={numberColor}
              />
              <p
                className="mt-3 text-lg"
                style={{ color: labelColor }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
