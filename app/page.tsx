import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="heroMedia" aria-hidden="true">
          <Image
            src="/images/mainpage.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <nav className="nav">
          <div className="brand">
            <Image
              className="brandLogo"
              src="/images/logo.png"
              alt=""
              width={38}
              height={38}
              priority
            />
            <span>PolicyQuest</span>
          </div>
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
              🎯 Turn evidence into policy solutions.
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
