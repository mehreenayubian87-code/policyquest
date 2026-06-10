import Link from "next/link";
import { contextPacks } from "../data";

export default function ContextPage() {
  return (
    <main>
      <header className="pageHeader">
        <Link className="backLink" href="/">
          PolicyQuest
        </Link>
        <div>
          <p className="eyebrow">Select country context</p>
          <h1>Choose the policy context for your simulation.</h1>
        </div>
      </header>

      <section className="issueGrid">
        {Object.values(contextPacks).map((context) => (
          <article className="issueCard" key={context.id}>
            <p className="eyebrow">Country context</p>
            <h2>{context.name}</h2>
            <p>{context.description}</p>
            <div className="miniList">
              {context.themes.map((theme) => (
                <span key={theme}>{theme}</span>
              ))}
            </div>
            <Link className="button primary full" href={`/select?context=${context.id}`}>
              Select {context.name}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
