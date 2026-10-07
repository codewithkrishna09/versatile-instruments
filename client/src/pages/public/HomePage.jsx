import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/home.css";
import OrganisationStrip from "./OrganisationStrip.jsx";

const briefDetails = [
  {
    number: "01",
    title: "The sample or material",
    description: "What will be measured, tested, prepared or processed?",
  },
  {
    number: "02",
    title: "The result you need",
    description:
      "Share the method, output, range or decision the result must support.",
  },
  {
    number: "03",
    title: "How the work runs",
    description:
      "Note throughput, repeatability and any important workflow constraints.",
  },
  {
    number: "04",
    title: "The practical setting",
    description:
      "Include space, utilities, access or a preferred model if these are known.",
  },
];

const applications = [
  {
    number: "01",
    title: "Analytical measurement",
    description:
      "Explore instruments for observing, measuring and comparing samples.",
    detail: "ANALYSIS / MEASUREMENT",
  },
  {
    number: "02",
    title: "Materials & surfaces",
    description:
      "Review equipment for physical characterisation and material behaviour.",
    detail: "CHARACTERISATION / TESTING",
  },
  {
    number: "03",
    title: "Laboratory workflow",
    description:
      "Find systems for preparation, processing and repeatable laboratory work.",
    detail: "PREPARATION / PROCESSING",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Instrument selection",
    description:
      "Compare the method, performance range and practical specifications against the work you need to do.",
  },
  {
    number: "02",
    title: "Site & workflow context",
    description:
      "Bring space, access, utilities and the surrounding process into the equipment conversation early.",
  },
  {
    number: "03",
    title: "Custom requirements",
    description:
      "Describe the sample, capacity or operating conditions when a standard specification is not enough.",
  },
  {
    number: "04",
    title: "Specific equipment",
    description:
      "Already have a preferred make or model? Start from it and clarify the technical requirements around it.",
  },
];

const useCases = [
  {
    number: "A",
    title: "Research laboratories",
    description:
      "Explore methods and instrument capabilities around the question your team is investigating.",
  },
  {
    number: "B",
    title: "Materials & surfaces",
    description:
      "Connect characterisation and testing needs to the material, sample and measurement range.",
  },
  {
    number: "C",
    title: "Industrial workflows",
    description:
      "Consider throughput, repeatability and the way an instrument fits an existing process.",
  },
  {
    number: "D",
    title: "Quality & analysis",
    description:
      "Identify the measurements, outputs and operating conditions that make a useful technical brief.",
  },
];

const homeQuestions = [
  {
    question: "Can I ask about a specific instrument?",
    answer:
      "Yes. Share the make or model, the intended application and any required specifications so the enquiry starts with useful context.",
  },
  {
    question: "What if I do not know which instrument I need?",
    answer:
      "Start with the sample or material, the result you need, expected range and approximate throughput. Those details help frame the discussion.",
  },
  {
    question: "Can site constraints be part of the brief?",
    answer:
      "Yes. Mention available space, access, utilities and workflow constraints. The scope of any site-related work can then be discussed directly.",
  },
  {
    question: "Where can I see available products?",
    answer:
      "The Products page shows instruments published through the catalogue. If a product is not listed, you can still send a specific enquiry.",
  },
];

export function Arrow({ diagonal = false }) {
  return diagonal ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export function Brand({ light = false }) {
  return (
    <a
      className={`public-brand ${light ? "public-brand-light" : ""}`}
      href="/"
      aria-label="Versatile Instruments home"
    >
      <span className="public-brand-mark" aria-hidden="true">
        <img
          src="/images/versatile-mark.webp"
          alt=""
          width="240"
          height="240"
        />
      </span>
      <span className="public-brand-type">
        VERSATILE<small>INSTRUMENTS</small>
      </span>
    </a>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const links = [
    ["Home", "/"],
    ["About", "/about"],
    ["Solutions", "/solutions"],
    ["Products", "/products"],
    ["Contact", "/contact"],
    ["Privacy", "/privacy-policy"],
  ];
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Brand />
        <nav
          className={menuOpen ? "public-nav public-nav-open" : "public-nav"}
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a
            className="public-nav-mobile-cta"
            href="/contact#enquiry"
            onClick={() => setMenuOpen(false)}
          >
            Send an enquiry <Arrow />
          </a>
        </nav>
        <a className="public-header-cta" href="/contact#enquiry">
          Send an enquiry <Arrow diagonal />
        </a>
        <button
          className="public-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function SectionHeading({ index, kicker, title, description }) {
  return (
    <div className="public-section-heading">
      <div className="public-section-index">
        {index} / {kicker}
      </div>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

// Keep the public navigation and footer identical across standalone pages.
export function Footer() {
  return (
    <footer className="public-footer">
      <div className="public-footer-lead">
        <span>HAVE A REQUIREMENT IN MIND?</span>
        <a href="/contact#enquiry">
          Let’s start with the details <Arrow diagonal />
        </a>
      </div>
      <div className="public-footer-top">
        <div>
          <Brand light />
          <p>
            Scientific and industrial instrumentation, explored through
            application, specification and practical fit.
          </p>
        </div>
        <div className="public-footer-links">
          <div>
            <span>EXPLORE</span>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/solutions">Solutions</a>
            <a href="/products">Products</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>
          <div>
            <span>DISCOVER</span>
            <a href="/solutions#solution-areas">Solution areas</a>
            <a href="/products">Instrument catalogue</a>
            <a href="/about">Our approach</a>
          </div>
          <div>
            <span>CONNECT</span>
            <address className="public-footer-contact">
              <span>
                H. No. 2753, 3rd Floor, Street No. 13
                <br />
                Ranjit Nagar, Patel Nagar South
                <br />
                New Delhi, Central Delhi, Delhi 110008
              </span>
              <a href="tel:+919559454555">+91 95594 54555</a>
              <a href="mailto:contact@versatileinsturments.com">
                contact@versatileinsturments.com
              </a>
              <a href="mailto:sales@versatileinsturments.com">
                sales@versatileinsturments.com
              </a>
            </address>
            <a className="public-footer-enquiry" href="/contact#enquiry">
              Send an enquiry <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>© {new Date().getFullYear()} Versatile Instruments</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}

function EnquiryForm({ selectedProduct }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const message = selectedProduct
        ? `Product enquiry: ${selectedProduct.name}\n\n${form.message}`
        : form.message;
      await api("/contacts", {
        method: "POST",
        body: JSON.stringify({ ...form, message }),
      });
      setStatus("sent");
      setForm({ name: "", email: "", company: "", message: "" });
    } catch (issue) {
      setError(issue.message);
      setStatus("idle");
    }
  }
  if (status === "sent")
    return (
      <div className="public-form-success" role="status">
        <span>01 / MESSAGE RECEIVED</span>
        <h3>Thank you for getting in touch.</h3>
        <p>
          Your enquiry has been sent. The team can respond using the details you
          provided.
        </p>
        <button type="button" onClick={() => setStatus("idle")}>
          Send another enquiry <Arrow />
        </button>
      </div>
    );
  return (
    <form className="public-enquiry-form" onSubmit={submit}>
      <div className="public-form-pair">
        <label>
          Your name <span>*</span>
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Full name"
          />
        </label>
        <label>
          Work email <span>*</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="name@company.com"
          />
        </label>
      </div>
      <label>
        Organisation
        <input
          autoComplete="organization"
          value={form.company}
          onChange={(event) =>
            setForm({ ...form, company: event.target.value })
          }
          placeholder="Company or institution"
        />
      </label>
      {selectedProduct && (
        <div className="public-selected-product">
          <span>ENQUIRY FOR</span>
          <strong>{selectedProduct.name}</strong>
        </div>
      )}
      <label>
        Tell us what you need <span>*</span>
        <textarea
          required
          rows="4"
          value={form.message}
          onChange={(event) =>
            setForm({ ...form, message: event.target.value })
          }
          placeholder="Describe your application or the equipment you are looking for"
        />
      </label>
      {error && (
        <p className="public-form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="public-submit"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send enquiry"} <Arrow diagonal />
      </button>
    </form>
  );
}

export default function HomePage() {
  const [catalogue, setCatalogue] = useState({ categories: [], products: [] });
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    let active = true;
    api("/public/home")
      .then((result) => {
        if (active) setCatalogue(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  function enquireAbout(product) {
    setSelectedProduct(product);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div className="public-site" id="top">
      <Header />
      <main>
        <section className="public-hero" aria-labelledby="hero-title">
          <div className="public-hero-copy">
            <div className="public-eyebrow">
              <span className="public-eyebrow-line" /> SCIENTIFIC & INDUSTRIAL
              INSTRUMENTS
            </div>
            <h1 id="hero-title">
              Precision starts with the right instrument<span>.</span>
            </h1>
            <p>
              Explore equipment for analysis, material testing and laboratory
              workflows—with the detail you need to make an informed choice.
            </p>
            <div className="public-hero-actions">
              <a className="public-button public-button-dark" href="/solutions">
                Explore solutions <Arrow diagonal />
              </a>
              <a className="public-text-link" href="#contact">
                Discuss your requirement <Arrow />
              </a>
            </div>
            <div className="public-hero-note">
              <span>APPLICATION FIRST</span>
              <span>VERSATILE INSTRUMENTS</span>
            </div>
          </div>
          <div className="public-hero-media">
            <img
              src="/images/laboratory-hero.webp"
              alt="Scientist preparing a sample beside a laboratory analysis instrument"
              fetchPriority="high"
            />
          </div>
        </section>

        <OrganisationStrip />

        <section className="public-section public-intro" id="about">
          <div className="public-intro-left">
            <span className="public-section-index">01 / INTRODUCTION</span>
            <h2>Better decisions begin with clearer specifications.</h2>
          </div>
          <div className="public-intro-right">
            <p>
              Scientific equipment is a considered purchase. Versatile
              Instruments brings applications, product information and technical
              details into one clear place, so your team can explore what fits
              the work at hand.
            </p>
            <a className="public-inline-link" href="/about">
              More about our approach <Arrow diagonal />
            </a>
          </div>
        </section>

        <section
          className="public-capabilities"
          aria-labelledby="home-capabilities-title"
        >
          <div className="public-section public-capabilities-inner">
            <div className="public-capabilities-heading">
              <span className="public-section-index">
                02 / WHAT WE CONSIDER
              </span>
              <h2 id="home-capabilities-title">
                The instrument is one part of the solution.
              </h2>
              <p>
                A useful recommendation begins with the application, then looks
                at the equipment, the site and the way both need to work
                together.
              </p>
              <a className="public-inline-link" href="/solutions">
                Explore our solutions <Arrow diagonal />
              </a>
            </div>
            <div className="public-capabilities-list">
              {capabilities.map((item) => (
                <article key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <Arrow diagonal />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-solutions" id="solutions">
          <SectionHeading
            index="03"
            kicker="SOLUTIONS"
            title="Explore by application"
            description="A focused starting point for finding equipment that matches your work."
          />
          <div className="public-solution-grid">
            {applications.map((application) => (
              <article
                className="public-solution-card"
                key={application.number}
              >
                <div className="public-solution-top">
                  <span>{application.number}</span>
                  <span className="public-solution-symbol" aria-hidden="true">
                    <span />
                  </span>
                </div>
                <div>
                  <small>{application.detail}</small>
                  <h3>{application.title}</h3>
                  <p>{application.description}</p>
                </div>
                <a
                  href="/solutions"
                  aria-label={`Enquire about ${application.title}`}
                >
                  <Arrow diagonal />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="public-image-story">
          <div className="public-story-image">
            <img
              src="/images/laboratory-detail.webp"
              alt="Laboratory sample being prepared next to a benchtop instrument"
              loading="lazy"
            />
          </div>
          <div className="public-story-copy">
            <span className="public-section-index">04 / THE APPROACH</span>
            <h2>Technical detail, made useful.</h2>
            <p>
              Explore the information behind each instrument, from its core
              application to the specifications that shape a decision.
            </p>
            <div className="public-story-points">
              <div>
                <span>01</span>
                <strong>Understand the application</strong>
              </div>
              <div>
                <span>02</span>
                <strong>Review the technical fit</strong>
              </div>
              <div>
                <span>03</span>
                <strong>Start a focused conversation</strong>
              </div>
            </div>
            <a className="public-inline-link" href="#contact">
              Talk through your requirements <Arrow diagonal />
            </a>
          </div>
        </section>

        <section
          className="public-section public-use-cases"
          aria-labelledby="home-use-cases-title"
        >
          <SectionHeading
            index="05"
            kicker="WHERE IT FITS"
            title="Built around the work, not a one-size-fits-all list."
            description="Different teams approach instrumentation from different starting points. These contexts help turn a broad search into a clearer brief."
          />
          <div className="public-use-cases-layout">
            <div className="public-use-cases-media">
              <img
                src="/images/about-laboratory.webp"
                alt="Analytical instrument and samples in a laboratory setting"
                loading="lazy"
              />
            </div>
            <div className="public-use-cases-list">
              {useCases.map((item) => (
                <article key={item.number}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-products" id="products">
          <SectionHeading
            index="06"
            kicker="EQUIPMENT"
            title={
              catalogue.products.length
                ? "Selected instruments"
                : "Equipment enquiries"
            }
            description={
              catalogue.products.length
                ? "A closer look at equipment available in the catalogue."
                : "Have a specific instrument or application in mind? Start with a focused brief."
            }
          />
          {catalogue.products.length ? (
            <>
              <div className="public-product-grid">
                {catalogue.products.map((product) => (
                  <article className="public-product-card" key={product.id}>
                    <a
                      className="public-product-image"
                      href={`/products/${product.slug}`}
                      aria-label={`View ${product.name}`}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <span className="public-product-no-image">
                          VI / INSTRUMENT
                        </span>
                      )}
                    </a>
                    <div className="public-product-meta">
                      <span>
                        {catalogue.categories.find(
                          (category) => category.id === product.categoryId,
                        )?.name || "INSTRUMENT"}
                      </span>
                      <span>{product.sku || "VI"}</span>
                    </div>
                    <h3>
                      <a href={`/products/${product.slug}`}>{product.name}</a>
                    </h3>
                    <button type="button" onClick={() => enquireAbout(product)}>
                      Enquire about this instrument <Arrow diagonal />
                    </button>
                  </article>
                ))}
              </div>
              <a className="public-product-view-all" href="/products">
                View all instruments <Arrow diagonal />
              </a>
            </>
          ) : (
            <div className="public-product-intro">
              <div>
                <span className="public-section-index">FIND YOUR FIT</span>
                <h3>Looking for a particular instrument?</h3>
                <p>
                  Tell us about your application and the specifications that
                  matter to your team.
                </p>
              </div>
              <a
                className="public-button public-button-outline"
                href="#contact"
              >
                Start an enquiry <Arrow diagonal />
              </a>
            </div>
          )}
        </section>

        <section
          className="public-manufacturer"
          aria-labelledby="home-manufacturer-title"
        >
          <div className="public-section public-manufacturer-inner">
            <div>
              <span className="public-section-index">
                07 / MANUFACTURER CONTEXT
              </span>
              <h2 id="home-manufacturer-title">
                Technology matters. The right fit matters more.
              </h2>
            </div>
            <div>
              <p>
                If you are considering a particular manufacturer, method or
                model, include it in your brief. That gives the technical
                conversation a concrete starting point while keeping the
                application at the centre.
              </p>
              <p>
                The most useful comparison includes the result you need, the
                conditions around the work and the capabilities that matter
                most.
              </p>
              <a className="public-inline-link" href="/contact#enquiry">
                Discuss a preferred model <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>

        <section className="home-brief" aria-labelledby="home-brief-title">
          <div className="public-section home-brief-inner">
            <div className="home-brief-lead">
              <span className="public-section-index">
                08 / A USEFUL STARTING POINT
              </span>
              <h2 id="home-brief-title">
                A better enquiry starts with a better brief.
              </h2>
              <p>
                You do not need a finished specification to get started. These
                four details make it easier to discuss equipment in the context
                of your actual work.
              </p>
              <a className="public-inline-link" href="#contact">
                Share your requirement <Arrow diagonal />
              </a>
            </div>
            <div className="home-brief-grid">
              {briefDetails.map((detail) => (
                <article key={detail.number}>
                  <span>{detail.number} / BRIEF</span>
                  <h3>{detail.title}</h3>
                  <p>{detail.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-process" id="process">
          <div className="public-process-inner">
            <div className="public-process-heading">
              <span className="public-section-index">09 / PROCESS</span>
              <h2>From requirement to conversation.</h2>
              <p>
                A simple way to turn your technical brief into a more useful
                enquiry.
              </p>
            </div>
            <div className="public-process-steps">
              <div>
                <span>01</span>
                <h3>Define the work</h3>
                <p>
                  Describe the material, measurement or workflow you need to
                  address.
                </p>
              </div>
              <div>
                <span>02</span>
                <h3>Review the details</h3>
                <p>
                  Explore relevant equipment and the specifications that affect
                  your choice.
                </p>
              </div>
              <div>
                <span>03</span>
                <h3>Get in touch</h3>
                <p>
                  Share your requirements through a focused enquiry with the
                  team.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="public-section public-home-faq"
          aria-labelledby="home-faq-title"
        >
          <div className="public-home-faq-heading">
            <span className="public-section-index">
              10 / BEFORE YOU ENQUIRE
            </span>
            <h2 id="home-faq-title">A few useful answers.</h2>
            <p>
              The more context you can share, the more focused the next
              conversation can be.
            </p>
          </div>
          <div className="public-home-faq-list">
            {homeQuestions.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.question}
                  <span className="public-home-faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="public-section public-contact" id="contact">
          <div className="public-contact-copy">
            <span className="public-section-index">11 / CONTACT</span>
            <h2>Let’s talk about your application.</h2>
            <p>
              Send a short brief about the equipment or measurement you have in
              mind. Include your requirements and we’ll have the context needed
              to respond.
            </p>
            <div className="public-contact-aside">
              <span>ENQUIRY FORM</span>
              <strong>Start with the details that matter.</strong>
            </div>
          </div>
          <EnquiryForm selectedProduct={selectedProduct} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
