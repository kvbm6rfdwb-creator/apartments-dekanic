"use client";
import { useEffect } from 'react';
export default function ScrollReveal() {
  useEffect(() => {
    const revealAll = () => {
      document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale')
        .forEach(el => el.classList.add('revealed'));
    };

    const targets = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale');
    if (!targets.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

    targets.forEach(t => io.observe(t));

    // Fallback: reveal everything after 2s in case IO doesn't fire
    const fallback = setTimeout(revealAll, 2000);

    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  return null;
}
