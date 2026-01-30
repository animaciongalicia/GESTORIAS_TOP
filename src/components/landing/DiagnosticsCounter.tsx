'use client';

import { useEffect, useState } from 'react';

export function DiagnosticsCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.total_submissions !== undefined) {
          setCount(data.total_submissions);
        }
      })
      .catch(console.error);
  }, []);

  // Animate the counter
  useEffect(() => {
    if (count === null || count === 0) return;

    const duration = 1500; // 1.5 seconds
    const steps = 30;
    const increment = count / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), count);
      setDisplayCount(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayCount(count);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [count]);

  if (count === null || count === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
      <span className="text-2xl font-bold text-blue-600">
        {displayCount.toLocaleString('es-ES')}
      </span>
      <span>diagnósticos completados</span>
    </div>
  );
}
