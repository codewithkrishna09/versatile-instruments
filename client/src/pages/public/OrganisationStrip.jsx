import { organisations } from "./organisations.js";

export default function OrganisationStrip() {
  return <section className="home-organisation-strip" aria-label="Organisations we’ve worked with">
    <div className="home-organisation-window"><div className="home-organisation-track">
      {[0, 1].map((copy) => <ul className="home-organisation-group" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>{organisations.map((organisation) => <li key={organisation.name}><span className={`home-organisation-mark ${organisation.className || ""}`}><img src={`/images/${organisation.stripLogo}`} alt="" width="56" height="56" decoding="async" /></span><strong>{organisation.name}</strong></li>)}</ul>)}
    </div></div>
  </section>;
}
