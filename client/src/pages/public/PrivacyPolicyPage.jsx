import { Footer, Header } from "./HomePage.jsx";
import "../../styles/privacy.css";

const sections = [
  [
    "Information you share with us",
    "When you send an enquiry or request a quotation, we collect the details you provide: your name, work email address, organisation, phone number and your requirement. This may include the instrument, application, sample type, specifications, quantity or timeline you share with us.",
  ],
  [
    "Why we use this information",
    "Versatile Instruments uses these details to understand your equipment requirement, respond to your message, discuss a suitable product or solution, prepare a quotation and provide follow up support. We do not sell your personal information or use it for unrelated marketing.",
  ],
  [
    "Enquiries and quotations",
    "Contact, solution and product quotation forms are sent to the Versatile Instruments team for review. The details are used only by authorised team members who need them to respond to the request and continue the business discussion.",
  ],
  [
    "Website services",
    "The Contact page includes Google Maps to help visitors locate our New Delhi office. When the map is loaded or opened, Google may process information according to its own privacy policy. If you use an email link on this website, your email provider handles the message you send.",
  ],
  [
    "Service providers and security",
    "We use website hosting, email delivery and related technical services to operate this website and respond to enquiries. Information is shared with these providers only where necessary for those services. We take reasonable administrative and technical steps to protect enquiry information.",
  ],
  [
    "Keeping and updating your information",
    "We retain enquiry and quotation details for as long as needed to manage the requirement, provide support or meet legal and operational obligations. You may ask us to update, correct or delete the information you have provided by writing to contact@versatileinstruments.com.",
  ],
];

export default function PrivacyPolicyPage() {
  return (
    <div className="public-site privacy-page" id="top">
      <Header />
      <main>
        <section className="privacy-hero">
          <div className="privacy-wrap">
            <span>VERSATILE INSTRUMENTS / PRIVACY</span>
            <h1>Privacy Policy</h1>
            <p>
              How we use the details you share while enquiring about laboratory
              and industrial instruments.
            </p>
            <small>Last updated: 6 October 2026</small>
          </div>
        </section>
        <section
          className="privacy-content privacy-wrap"
          aria-label="Privacy policy details"
        >
          <div className="privacy-intro">
            <span>OUR COMMITMENT</span>
            <p>
              Versatile Instruments handles enquiry information carefully so we
              can have a useful, relevant equipment conversation with you.
            </p>
          </div>
          <div className="privacy-sections">
            {sections.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="privacy-contact">
            <span>PRIVACY CONTACT</span>
            <p>
              For any question about this policy or your information, please
              write to:
            </p>
            <a href="mailto:contact@versatileinstruments.com">
              contact@versatileinstruments.com
            </a>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
