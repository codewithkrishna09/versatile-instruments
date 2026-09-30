import { useEffect, useState } from "react";
import { Arrow, Footer, Header } from "./HomePage.jsx";
import { organisations } from "./organisations.js";
import "../../styles/about.css";

const focusAreas = [
  {
    number: "01",
    title: "Analytical insight",
    description: "Instruments for measuring, identifying and comparing what a sample can tell you.",
  },
  {
    number: "02",
    title: "Material understanding",
    description: "Equipment for examining surfaces, properties and behaviour under real conditions.",
  },
  {
    number: "03",
    title: "Dependable workflows",
    description: "Tools that support preparation, processing and repeatable laboratory work.",
  },
];

const approach = [
  {
    number: "01",
    title: "Start with the application",
    description: "The sample, measurement and working environment come before a product name.",
  },
  {
    number: "02",
    title: "Examine the specifications",
    description: "Compare the details that affect fit, from capability to practical workflow needs.",
  },
  {
    number: "03",
    title: "Make the next step clear",
    description: "Share a focused brief so the right equipment conversation can begin.",
  },
];

const workContexts = [
  {
    number: "01",
    title: "Defence & technical programmes",
    description: "A demanding brief starts with the measurement objective, operating conditions and the technical information needed to assess a suitable system.",
    detail: "APPLICATION / CONDITIONS / DOCUMENTATION",
  },
  {
    number: "02",
    title: "Civil & site environments",
    description: "The space around an instrument matters. Layout, access, utilities and workflow need to be considered alongside the equipment itself.",
    detail: "SPACE / ACCESS / WORKFLOW",
  },
  {
    number: "03",
    title: "Research & industry",
    description: "Laboratories and production teams often approach the same technology with different samples, capacities and expectations of the result.",
    detail: "METHOD / CAPACITY / PRACTICAL FIT",
  },
];

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".about-reveal");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    // Observe once: content stays visible after entering the viewport.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

export default function AboutPage() {
  useReveal();
  const [showAllOrganisations, setShowAllOrganisations] = useState(false);

  return (
    <div className="public-site about-page" id="top">
      <Header />
      <main>
        <section className="about-hero" aria-labelledby="about-title">
          <div className="about-hero-inner">
            <div className="about-hero-copy about-reveal">
              <span className="about-kicker">ABOUT / VERSATILE INSTRUMENTS</span>
              <h1 id="about-title">The right instrument changes what’s possible<span>.</span></h1>
              <p>Versatile Instruments connects scientific and industrial requirements with equipment and solutions considered for the application, the site and the people using them.</p>
              <a className="about-underlined-link" href="#our-approach">Explore our approach <Arrow diagonal /></a>
            </div>
            <div className="about-hero-image">
              <picture>
                <source srcSet="/images/about-laboratory.webp" type="image/webp" />
                <img src="/images/about-laboratory.png" alt="Illustrative laboratory scene showing sample preparation beside an analytical instrument" fetchPriority="high" />
              </picture>
            </div>
          </div>
          <div className="about-hero-bottom"><span>SCIENCE / INDUSTRY / RESEARCH</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="about-introduction about-container" aria-labelledby="about-intro-title">
          <div className="about-reveal"><span className="about-kicker">01 / WHO WE ARE</span><h2 id="about-intro-title">Clarity in a field full of complexity.</h2></div>
          <div className="about-introduction-copy about-reveal">
            <p>Choosing scientific equipment involves more than finding a specification sheet. The intended application, the way a team works and the details of each instrument all matter.</p>
            <p>Versatile Instruments brings those considerations into one place. We work from the requirement outward—looking at the application, the available options and the practical context around a system. Our catalogue gives teams a clear place to explore equipment and begin a more informed conversation.</p>
            <a className="about-underlined-link" href="/products">Explore equipment <Arrow diagonal /></a>
          </div>
        </section>

        <section className="about-organisations" aria-labelledby="about-organisations-title">
          <div className="about-container">
            <div className="about-organisations-heading"><div><span className="about-kicker">OUR WORK / ORGANISATIONS</span><h2 id="about-organisations-title">Organisations we’ve worked with.</h2></div><p>Across defence research, quality assurance and higher education.</p></div>
            <ul className="about-organisations-grid">
              {(showAllOrganisations ? organisations : organisations.slice(0, 8)).map((organisation) => <li className="about-organisation" key={organisation.name}>
                <div className={`about-organisation-logo ${organisation.className || ""}`}><img src={`/images/${organisation.logo}`} alt="" loading="lazy" decoding="async" width="96" height="96" /></div>
                <h3>{organisation.name}</h3><p>{organisation.detail}</p>
              </li>)}
            </ul>
            <button
              className="about-organisations-toggle"
              type="button"
              aria-expanded={showAllOrganisations}
              onClick={() => setShowAllOrganisations((current) => !current)}
            >
              {showAllOrganisations ? "View less" : `View more (${organisations.length - 8})`}
              <span aria-hidden="true">{showAllOrganisations ? "−" : "+"}</span>
            </button>
            <p className="about-organisations-note">Organisation names and marks identify the respective institutions; they do not imply official endorsement.</p>
          </div>
        </section>

        <section className="about-statement" aria-labelledby="about-purpose-title">
          <div className="about-statement-inner about-reveal">
            <span className="about-kicker">02 / OUR PURPOSE</span>
            <h2 id="about-purpose-title">Make technical choices <em>more considered.</em></h2>
            <p>Our focus is straightforward: help people connect the work they need to do with the equipment designed to do it. Clear information and a useful conversation are where better decisions begin.</p>
          </div>
          <span className="about-statement-watermark" aria-hidden="true">VI</span>
        </section>

        <section className="about-direction about-container" aria-labelledby="about-direction-title">
          <div className="about-direction-heading about-reveal"><span className="about-kicker">03 / MISSION & VISION</span><h2 id="about-direction-title">A clearer path from question to capability.</h2><p>Our direction is practical: keep the work itself at the centre of every equipment decision.</p></div>
          <div className="about-direction-grid">
            <article className="about-direction-card about-reveal"><span>01 / OUR MISSION</span><div className="about-direction-mark" aria-hidden="true" /><h3>Make the right discussion possible.</h3><p>Bring together application context, instrument information and technical questions so teams can consider equipment with greater clarity. A useful solution begins with understanding what the work demands—not simply choosing a name from a list.</p></article>
            <article className="about-direction-card about-reveal"><span>02 / OUR VISION</span><div className="about-direction-mark" aria-hidden="true" /><h3>Better tools for better work.</h3><p>We want laboratories, technical facilities and industry teams to approach instrumentation with confidence: able to explore the possibilities, understand the trade-offs and move toward a solution that fits their real environment.</p></article>
          </div>
        </section>

        <section className="about-focus about-container" aria-labelledby="about-focus-title">
          <div className="about-section-heading about-reveal"><span className="about-kicker">04 / WHERE WE FOCUS</span><h2 id="about-focus-title">Built around the work, not just the product.</h2><p>Different disciplines ask different things of an instrument. These areas offer a useful starting point.</p></div>
          <div className="about-focus-grid">
            {focusAreas.map((area) => <article className="about-focus-card about-reveal" key={area.number}><span className="about-focus-number">{area.number} / FIELD</span><div className="about-focus-rule" /><h3>{area.title}</h3><p>{area.description}</p><a href="/solutions" aria-label={`Explore ${area.title} solutions`}><Arrow diagonal /></a></article>)}
          </div>
        </section>

        <section className="about-image-band" aria-label="Laboratory perspective">
          <img src="/images/laboratory-detail.webp" alt="Illustrative close-up of laboratory sample preparation" loading="lazy" decoding="async" />
        </section>

        <div className="about-image-bridge about-container about-reveal"><span className="about-kicker">THE PRACTICAL CONTEXT</span><p>What happens around the instrument is part of the instrument decision.</p><span>01 / 03</span></div>

        <section className="about-approach about-container" id="our-approach" aria-labelledby="about-approach-title">
          <div className="about-approach-heading about-reveal"><span className="about-kicker">05 / OUR APPROACH</span><h2 id="about-approach-title">A more useful way to begin.</h2><p>Start with the work, then examine the instrument. A clear brief helps distinguish essential performance from preferences and practical constraints.</p></div>
          <div className="about-approach-list">
            {approach.map((step) => <article className="about-approach-step about-reveal" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}
          </div>
        </section>

        <section className="about-contexts" aria-labelledby="about-contexts-title"><div className="about-container"><div className="about-contexts-heading about-reveal"><span className="about-kicker">06 / WHERE REQUIREMENTS BEGIN</span><h2 id="about-contexts-title">Different environments. One disciplined starting point.</h2><p>Defence, civil, research and industrial projects can each bring different constraints. The first step is understanding the work before defining the route.</p></div><div className="about-contexts-grid">{workContexts.map((context) => <article className="about-context-card about-reveal" key={context.number}><span className="about-context-number">{context.number}</span><div><small>{context.detail}</small><h3>{context.title}</h3><p>{context.description}</p></div><Arrow diagonal /></article>)}</div><a className="about-contexts-link" href="/solutions">Explore our solution areas <Arrow diagonal /></a></div></section>

        <section className="about-principles" aria-labelledby="about-principles-title">
          <div className="about-principles-inner about-container">
            <div className="about-reveal"><span className="about-kicker">07 / WHAT GUIDES US</span><h2 id="about-principles-title">Precision in the details. Perspective on the whole.</h2></div>
            <div className="about-principles-copy about-reveal"><p><strong>Useful information.</strong> An instrument should be understood in the context of its application—not reduced to a headline feature.</p><p><strong>Considered selection.</strong> Comparing capabilities and constraints helps narrow the field before making a decision.</p><p><strong>Clear communication.</strong> A good enquiry gives both sides the context needed to discuss a suitable next step.</p></div>
          </div>
        </section>

        <section className="about-next about-container" aria-labelledby="about-next-title"><div className="about-reveal"><span className="about-kicker">08 / THE NEXT CONVERSATION</span><h2 id="about-next-title">Tell us what you’re working on.</h2><p>Whether you have an instrument in mind or are still defining the requirement, share the application and the details that matter to your team.</p></div><a className="about-next-link" href="/contact#enquiry">Start an enquiry <Arrow diagonal /></a></section>
      </main>
      <Footer />
    </div>
  );
}
