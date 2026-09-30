import { useEffect, useState } from "react";
import { Arrow, Footer, Header } from "./HomePage.jsx";
import SolutionsHero from "./SolutionsHero.jsx";
import "../../styles/solution-showcase.css";

// Application names explain the purpose; instrument names remain explicit.
// Category links show the published catalogue, not an invented stock claim.
const solutions = [
  { slug: "microscopy", field: "Materials", title: "Microstructure & Imaging", instrument: "Electron microscopy", image: "microscopy", description: "Explore the structure behind a material’s behaviour. Electron microscopy provides a route to examining fine surface detail and morphology, helping teams frame questions about particles, coatings and material interfaces.", applications: ["Surface morphology", "Materials research", "Microstructure studies"] },
  { slug: "spectroscopy", field: "Analysis", title: "Chemical & Optical Insight", instrument: "Spectroscopy systems", image: "spectroscopy", description: "Connect a sample with its optical response. Spectroscopic methods support questions about composition and material identity; the appropriate technique depends on the sample, preparation method and result required.", applications: ["Chemical characterisation", "Optical measurements", "Method-based quality control"] },
  { slug: "surface-particle-analysis", field: "Materials", title: "Surface & Particle Intelligence", instrument: "Surface area and particle analysers", image: "surface-particle-analysis", description: "Understand how surface properties influence material performance. Discuss surface area, particle behaviour, charge or wettability requirements so the measurement route can be matched to the sample rather than chosen by instrument name alone.", applications: ["Powders and porous materials", "Dispersions and colloids", "Surface characterisation"] },
  { slug: "x-ray-analysis", field: "Analysis", title: "Structure Through Diffraction", instrument: "X-ray analysis systems", image: "x-ray-analysis", description: "Investigate material structure through X-ray-based methods. For diffraction applications, phase and crystallographic questions guide the discussion, alongside sample form, preparation and the analysis workflow.", applications: ["Phase investigation", "Crystalline materials", "Structural characterisation"] },
  { slug: "thermal-analysis", field: "Materials", title: "Temperature & Material Behaviour", instrument: "Thermal analysis instruments", image: "thermal-analysis", description: "Study how a material responds as temperature changes. Define whether the application concerns thermal transitions, mass change or stability, then discuss the technique and operating conditions appropriate to that question.", applications: ["Thermal transitions", "Material stability", "Temperature-dependent studies"] },
  { slug: "rheology-processing", field: "Processing", title: "Flow & Formulation Performance", instrument: "Rheometers and processing equipment", image: "rheology-processing", description: "Bring flow behaviour into the formulation discussion. Sample consistency, temperature, deformation conditions and the intended process help define how viscosity and rheological measurements should be approached.", applications: ["Viscosity and flow", "Formulation development", "Processing behaviour"] },
  { slug: "chromatography", field: "Analysis", title: "Separation & Sample Insight", instrument: "Chromatography systems", image: "chromatography", description: "Separate complex samples into a more useful analytical picture. The sample matrix, target components, detection needs and established method should be considered together when discussing a chromatography configuration.", applications: ["Mixture separation", "Sample composition", "Analytical workflows"] },
  { slug: "material-testing", field: "Materials", title: "Mechanical Performance & Testing", instrument: "Material testing equipment", image: "material-testing", description: "Evaluate materials against the forces and conditions that matter to the work. Define the test objective, specimen geometry and applicable method before reviewing equipment capacity and the surrounding workflow.", applications: ["Mechanical behaviour", "Specimen-based testing", "Material development"] },
  { slug: "reactor-system", field: "Processing", title: "Controlled Reaction Environments", instrument: "Reactor systems", image: "reactor-system", description: "Build the equipment discussion around the reaction, not just the vessel. Chemistry, working volume, temperature, illumination where relevant and safety constraints inform the configuration and project scope.", applications: ["Reaction studies", "Photochemical applications", "Process development"] },
  { slug: "advanced-manufacturing", field: "Processing", title: "Advanced Fabrication & Development", instrument: "Advanced manufacturing equipment", image: "advanced-manufacturing", description: "Explore equipment for specialised material fabrication. Begin with the intended material, fabrication route and research or production objective, then review the configuration and facility requirements relevant to the process.", applications: ["Specialised fabrication", "Material processing", "Process exploration"] },
  { slug: "laboratory-equipment", field: "Laboratory", title: "Sample Preparation & Lab Workflow", instrument: "Laboratory equipment", image: "laboratory-equipment", description: "Support the steps around an analytical measurement. Preparation, evaporation, handling and routine laboratory work need equipment that fits the sample, available space and the sequence in which the team operates.", applications: ["Sample preparation", "Evaporation workflows", "Routine laboratory work"] },
];
const scopes = [
  { name: "Defence & technical programmes", number: "01", text: "Discuss instruments against the actual measurement objective, operating environment and technical documentation required by the programme. The scope starts with the application; it does not imply defence certification or institutional endorsement.", points: ["Measurement and testing objectives", "Operating conditions and constraints", "Project documentation requirements"] },
  { name: "Civil & site-related work", number: "02", text: "Consider the space around the equipment as part of the project. Civil or site-related work is discussed against the facility’s layout, access, utilities and agreed requirements—not presented as a one-size-fits-all installation package.", points: ["Layout and equipment access", "Utility and facility context", "Agreed site-specific work scope"] },
  { name: "Customised configurations", number: "03", text: "When a standard configuration does not fit, describe what needs to change and why. Sample type, capacity, workflow and essential performance requirements help shape a practical discussion about available configuration options.", points: ["Application-specific requirements", "Capacity and workflow considerations", "Configuration and technical fit"] },
];
const steps = [
  ["Define the question", "Share the sample, material or process and the result you need. A clear objective is more useful than a model number alone."],
  ["Map the requirements", "Include measurement range, throughput, preferred methods, space and operating conditions. Identify what is essential and what is flexible."],
  ["Review the technical route", "Compare suitable instrument families and discuss the configuration, documentation and site context before narrowing the options."],
  ["Clarify the scope", "Agree what needs further review: equipment, customisation, site work or a product-specific quotation. Keep the next step explicit."],
];
const questions = [
  ["Are these product listings or solution areas?", "These are application-led starting points. Each links to a category in the published product catalogue. Exact models, capabilities and availability should be reviewed on the product page or discussed with the team."],
  ["Can I ask for a specific instrument or manufacturer?", "Yes. Include the make, model or measurement method together with your application. A preferred brand is useful context, but technical fit and operating requirements still need review."],
  ["What if the category does not contain my instrument?", "Share your requirement directly. Only published products appear in the catalogue; a category overview is not a claim that every configuration is currently stocked."],
  ["Can a requirement include equipment and site work?", "Yes. Describe the instrument objective and the facility conditions together. The team can discuss the equipment and any civil, site or custom configuration scope against the actual project."],
];

export default function SolutionsPage() {
  const [filter, setFilter] = useState("All solutions");
  useEffect(() => {
    const nodes = document.querySelectorAll(".solution-enter");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [filter]);
  const shown = solutions.filter((item) => filter === "All solutions" || item.field === filter);
  return <div className="public-site solution-studio" id="top">
    <Header />
    <main>
      <SolutionsHero />

      <section className="solution-intro solution-shell" aria-labelledby="solution-intro-title"><span className="solution-label">THE RIGHT STARTING POINT</span><div><h2 id="solution-intro-title">Start with what you need to understand.</h2><p>A scientific instrument is valuable when it fits the sample, the method and the decisions you need to make. Our solution areas connect those questions with instrument families, giving you a clearer route from an application to a product discussion.</p><p>Explore the measurement or workflow below, then review published equipment or share the specific requirements of your project.</p></div></section>

      <section className="solution-library" id="instrument-solutions" aria-labelledby="solution-library-title"><div className="solution-shell">
        <div className="solution-section-head"><div><span className="solution-label">THE SOLUTION LIBRARY</span><h2 id="solution-library-title">Different questions.<br />Purposeful instrumentation.</h2></div><p>Application names explain the purpose. Instrument names and category links keep the technical route clear.</p></div>
        <div className="solution-library-toolbar"><div className="solution-filters" role="group" aria-label="Filter solution areas">{["All solutions", "Analysis", "Materials", "Processing", "Laboratory"].map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}</div><span aria-live="polite">{shown.length} solution areas</span></div>
        <div className="solution-card-grid">{shown.map((item) => <article className="solution-instrument-card solution-enter" key={item.slug}>
          <a className="solution-instrument-image" href={`/products?category=${item.slug}`} aria-label={`Explore ${item.instrument}`}><span>{item.field}</span><img src={`/images/category-${item.image}.webp`} alt={item.instrument} width="640" height="500" loading="lazy" decoding="async" /><i aria-hidden="true"><Arrow diagonal /></i></a>
          <div className="solution-instrument-copy"><small>{item.instrument}</small><h3>{item.title}</h3><p>{item.description}</p><ul aria-label="Application examples">{item.applications.map((application) => <li key={application}>{application}</li>)}</ul><a href={`/products?category=${item.slug}`}>Explore instruments <Arrow diagonal /></a></div>
        </article>)}</div>
        <p className="solution-library-note">Illustrative instrument families. Exact capabilities, configurations and availability depend on the specific product and your application.</p>
      </div></section>

      <section className="solution-surface-feature" aria-labelledby="solution-surface-title"><div className="solution-shell solution-feature-layout"><div className="solution-feature-copy solution-enter"><span className="solution-label">A CLOSER LOOK / SURFACES & DISPERSIONS</span><h2 id="solution-surface-title">The interface can change the whole picture.</h2><p>Some questions begin at a surface rather than inside a bulk material. Wettability, particle charge and dispersion behaviour call for a more specific measurement conversation.</p><div className="solution-feature-points"><div><strong>Wettability & interfaces</strong><p>Contact angle measurements support discussions around coatings, adhesion and surface treatments.</p></div><div><strong>Charge & dispersion</strong><p>Zeta potential measurements provide a route to studying particle surface charge and colloidal behaviour.</p></div></div><a href="/products?category=surface-particle-analysis" className="solution-outline-link">Explore surface & particle instruments <Arrow diagonal /></a></div><div className="solution-feature-image"><img src="/images/category-surface-particle-analysis.webp" alt="Surface area analysis instrument with sample stations" loading="lazy" decoding="async" width="640" height="630" /><span>SURFACE & PARTICLE ANALYSIS</span></div></div></section>

      <section className="solution-projects solution-shell" aria-labelledby="solution-projects-title"><div className="solution-section-head"><div><span className="solution-label">BEYOND THE INSTRUMENT</span><h2 id="solution-projects-title">Equipment is one part.<br />The project is the whole.</h2></div><p>Defence requirements, civil or site work and customised configurations add practical context to the instrument choice.</p></div><div className="solution-scope-grid">{scopes.map((scope) => <article className="solution-scope solution-enter" key={scope.number}><span>{scope.number} / PROJECT SCOPE</span><h3>{scope.name}</h3><p>{scope.text}</p><ul>{scope.points.map((point) => <li key={point}>{point}</li>)}</ul><a href="/contact#enquiry">Discuss the scope <Arrow diagonal /></a></article>)}</div></section>

      <section className="solution-method" id="our-process" aria-labelledby="solution-method-title"><div className="solution-shell"><div className="solution-section-head"><div><span className="solution-label">FROM QUESTION TO TECHNICAL BRIEF</span><h2 id="solution-method-title">A clear process.<br />A considered next step.</h2></div><p>No unnecessary complexity. Just the details that help make an equipment discussion useful.</p></div><ol className="solution-method-grid">{steps.map(([title, text], index) => <li className="solution-enter" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>

      <section className="solution-faq-section solution-shell" aria-labelledby="solution-questions-title"><div><span className="solution-label">BEFORE YOU ENQUIRE</span><h2 id="solution-questions-title">Useful answers.<br />Better questions.</h2></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

      <section className="solution-next"><div className="solution-shell"><div><span className="solution-label">YOUR APPLICATION / OUR STARTING POINT</span><h2>Tell us what the work needs.</h2><p>Share the sample, intended measurement, preferred instrument and any site constraints. We’ll start with the requirement.</p></div><a className="solution-solid-link" href="/contact#enquiry">Discuss your requirement <Arrow diagonal /></a></div></section>
    </main><Footer />
  </div>;
}
