import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Arrow, Footer, Header } from "./HomePage.jsx";
import "../../styles/contact.css";

const enquiryTypes = [
  { id: "equipment", number: "01", title: "Equipment enquiry", description: "Ask about an instrument, model, specification or product category." },
  { id: "solution", number: "02", title: "Application or solution", description: "Tell us what you need to measure, test, prepare or configure." },
  { id: "general", number: "03", title: "General conversation", description: "Start with a question when you are not yet sure which route fits." },
];

const guidance = [
  { number: "01", title: "Describe the application", description: "What are you working with, and what result do you need?" },
  { number: "02", title: "Share what you know", description: "A preferred model, method, range or capacity is useful—but not essential." },
  { number: "03", title: "Add the practical context", description: "Include timing, site conditions or workflow constraints if they matter." },
];

const commonQuestions = [
  { question: "Do I need to know the exact instrument before enquiring?", answer: "No. An application, sample type and intended result are enough to begin a focused conversation." },
  { question: "What happens after I submit the form?", answer: "Your message is recorded for the Versatile Instruments team with the contact details you provide. They can use that information to follow up with you." },
  { question: "Can I ask about more than one requirement?", answer: "Yes. List the requirements separately in your message so each can be understood clearly." },
];

const officeAddress = "H. No. 2753, 3rd Floor, Street No. 13, Ranjit Nagar, Patel Nagar South, New Delhi, Central Delhi, Delhi 110008";
const addressMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`;
// Google resolves the address search; no coordinates are claimed as an exact office pin.
const addressMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(officeAddress)}&output=embed`;

function useContactReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".contact-reveal");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    // Observe each editorial block only until it has entered the viewport once.
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

function ContactForm({ topic, setTopic }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      // The existing contacts API stores free-text messages, so retain the selected topic there.
      await api("/contacts", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          message: `Enquiry type: ${enquiryTypes.find((item) => item.id === topic)?.title || "General conversation"}\n\n${form.message}`,
        }),
      });
      setStatus("sent");
      setForm({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (issue) {
      setError(issue.message);
      setStatus("idle");
    }
  }

  if (status === "sent") return <div className="contact-success" role="status"><span>MESSAGE RECEIVED / THANK YOU</span><h3>We have your enquiry.</h3><p>Your message has been recorded for our team with the contact details you provided.</p><button type="button" onClick={() => setStatus("idle")}>Send another message <Arrow /></button></div>;

  return <form className="contact-form" onSubmit={submit}>
    <div className="contact-form-intro"><span>ENQUIRY FORM / 01</span><h3>Tell us what you have in mind.</h3><p>A few useful details will help us understand your requirement.</p></div>
    <div className="contact-form-grid"><label><span className="contact-field-name">Full name <i>*</i></span><input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label><label><span className="contact-field-name">Work email <i>*</i></span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@organisation.com" /></label><label>Organisation<input autoComplete="organization" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} placeholder="Company or institution" /></label><label>Phone number<input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Optional" /></label></div>
    <label className="contact-form-full"><span className="contact-field-name">What is your enquiry about? <i>*</i></span><select required value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">Select an enquiry type</option>{enquiryTypes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <label className="contact-form-full"><span className="contact-field-name">Your message <i>*</i></span><textarea required rows="6" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us about your application, instrument or question. Include any useful specifications or timing." /></label>
    {error && <p className="contact-form-error" role="alert">{error}</p>}
    <div className="contact-form-bottom"><p>Required fields are marked *. Please avoid sharing confidential sample data in this form.</p><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send enquiry"}<Arrow diagonal /></button></div>
  </form>;
}

export default function ContactPage() {
  const [topic, setTopic] = useState("");
  useContactReveal();

  function chooseTopic(id) {
    setTopic(id);
    document.getElementById("enquiry")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return <div className="public-site contact-page" id="top">
    <Header />
    <main>
      <section className="contact-hero" aria-labelledby="contact-title"><div className="contact-hero-content contact-reveal"><span className="contact-kicker">CONTACT / VERSATILE INSTRUMENTS</span><h1 id="contact-title">Good conversations start with the right details<span>.</span></h1><p>Tell us about the instrument, application or question on your mind. A clear brief gives the conversation a useful place to begin.</p><a href="#enquiry">Send an enquiry <Arrow diagonal /></a></div><div className="contact-hero-aside contact-hero-photo"><img src="/images/laboratory-detail.webp" alt="Laboratory sample preparation at an analytical instrument" width="1600" height="900" fetchPriority="high" /><span>01 / LET’S CONNECT</span><p>Scientific and industrial equipment, discussed with clarity.</p></div></section>

      <section className="contact-routes contact-container" aria-labelledby="contact-routes-title"><div className="contact-routes-heading contact-reveal"><span className="contact-kicker">01 / CHOOSE A STARTING POINT</span><h2 id="contact-routes-title">What can we help you explore?</h2><p>Choose the closest topic. You can describe the full requirement in the form below.</p></div><div className="contact-route-grid">{enquiryTypes.map((item) => <button className={`contact-route-card contact-reveal ${topic === item.id ? "is-selected" : ""}`} type="button" key={item.id} aria-pressed={topic === item.id} onClick={() => chooseTopic(item.id)}><span>{item.number} / ENQUIRY</span><h3>{item.title}</h3><p>{item.description}</p><span className="contact-route-arrow"><Arrow diagonal /></span></button>)}</div></section>

      <section className="contact-feature" aria-labelledby="contact-feature-title"><div className="contact-feature-map"><iframe title="Google Maps search for the Versatile Instruments address in New Delhi" src={addressMapEmbedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><div className="contact-map-caption"><div><span>NEW DELHI / VISIT US</span><strong>Find us in Ranjit Nagar.</strong><small>Address-based map search; confirm your route before visiting.</small></div><a href={addressMapUrl} target="_blank" rel="noopener noreferrer" aria-label="Search the full Versatile Instruments address in Google Maps">Open in Google Maps <Arrow diagonal /></a></div></div><div className="contact-feature-copy contact-reveal"><span className="contact-kicker">02 / DIRECT CONTACT</span><h2 id="contact-feature-title">Reach us directly.</h2><p>Prefer a call or email? Use the details below, or send the technical brief through the enquiry form.</p><address className="contact-direct-details"><div><span>PHONE</span><a href="tel:+919559454555">+91 95594 54555 <Arrow diagonal /></a></div><div><span>EMAIL</span><a href="mailto:versatileinstru@gmail.com">versatileinstru@gmail.com <Arrow diagonal /></a></div><div><span>LOCATION</span><p>{officeAddress}</p></div></address></div></section>

      <section className="contact-guidance contact-container" id="what-to-include" aria-labelledby="contact-guidance-title"><div className="contact-guidance-heading contact-reveal"><span className="contact-kicker">03 / A USEFUL BRIEF</span><h2 id="contact-guidance-title">Three details worth sharing.</h2></div><div className="contact-guidance-list">{guidance.map((item) => <article className="contact-guidance-item contact-reveal" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>

      <section className="contact-enquiry" id="enquiry" aria-labelledby="contact-enquiry-title"><div className="contact-container contact-enquiry-inner"><div className="contact-enquiry-copy contact-reveal"><span className="contact-kicker">04 / YOUR ENQUIRY</span><h2 id="contact-enquiry-title">Let’s put the requirement into words.</h2><p>Send your application, preferred instrument or question to the Versatile Instruments team. We’ll record it with your contact details for review.</p></div><ContactForm topic={topic} setTopic={setTopic} /></div></section>

      <section className="contact-faq contact-container" aria-labelledby="contact-faq-title"><div className="contact-faq-heading contact-reveal"><span className="contact-kicker">05 / GOOD TO KNOW</span><h2 id="contact-faq-title">Before you send.</h2></div><div className="contact-faq-list">{commonQuestions.map((item, index) => <details className="contact-faq-item contact-reveal" key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>

    </main>
    <Footer />
  </div>;
}
