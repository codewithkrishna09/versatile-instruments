import { useEffect, useState } from "react";
import { Arrow } from "./HomePage.jsx";

const slides = [
  ["microscopy", "Microstructure & imaging"],
  ["analysis", "Analytical insight"],
  ["processing", "Process development"],
];

export default function SolutionsHero() {
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => {
    if (interacting || hidden || reduced) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [active, interacting, hidden, reduced]);
  const select = (index) => setActive((index + slides.length) % slides.length);
  return <section className="solution-photo-hero" aria-labelledby="solution-title" aria-roledescription="carousel"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <div className="solution-hero-images" aria-hidden="true">{slides.map(([image], index) => <img key={image}
      className={active === index ? "is-active" : ""} src={`/images/solutions-slide-${image}.webp`} alt="" width="1672" height="941"
      fetchPriority={index === 0 ? "high" : "low"} decoding={index === 0 ? "sync" : "async"} />)}</div>
    <div className="solution-hero-shade" />
    <div className="solution-shell solution-photo-content">
      <span className="solution-label">APPLICATION-LED / INSTRUMENT SOLUTIONS</span>
      <h1 id="solution-title">See deeper.<br />Measure better.<br /><em>Move forward.</em></h1>
      <p>Scientific instrumentation for materials, analysis and process development. Start with your application. Find the right direction.</p>
      <a className="solution-solid-link" href="#instrument-solutions">Explore solution areas <Arrow diagonal /></a>
    </div>
    <div className="solution-shell solution-photo-bottom">
      <div className="solution-photo-caption"><span>{String(active + 1).padStart(2, "0")} / 03</span><strong>{slides[active][1]}</strong><small>Illustrative laboratory environments</small></div>
      <div className="solution-slide-controls" aria-label="Hero slideshow controls">
        <button type="button" onClick={() => select(active - 1)} aria-label="Previous image">←</button>
        <div className="solution-slide-dots">{slides.map(([, name], index) => <button key={name} type="button" aria-label={`Show ${name}`} aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}</div>
        <button type="button" onClick={() => select(active + 1)} aria-label="Next image">→</button>
      </div>
    </div>
  </section>;
}
