import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="heroMedia" aria-hidden="true">
          <img src="/images/policyquest-hero.jpg" alt="" />
        </div>
        <nav className="nav">
          <div className="brand">PolicyQuest</div>
          <Link className="navLink" href="/context">
            Start a Session
          </Link>
        </nav>
        <div className="heroGrid">
          <div className="heroCopy">
            <div className="heroBadge">
              <span>POLICYQUEST</span>
              <strong>Collaborative Policy Simulation</strong>
            </div>
            <h1>Build Solutions to Real Policy Challenges</h1>
            <p className="heroSubtitle">
              Evidence. Negotiation. Action.
            </p>
            <p className="lead">
              🎯 From challenge to policy solution.
            </p>
            <div className="heroActions">
              <Link className="button primary" href="/context">
                <span className="launchIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h12M13 6l6 6-6 6" />
                  </svg>
                </span>
                Start Policy Mission
              </Link>
            </div>
            <p className="ctaSupport">Collaborative simulation for classrooms and workshops.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
