"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categories, contextPacks, policyIssues, type CategoryId, type ContextId } from "../data";

export default function SelectClient() {
  const searchParams = useSearchParams();
  const contextId = (searchParams.get("context") ?? "qatar") as ContextId;
  const context = contextPacks[contextId] ?? contextPacks.qatar;
  const [category, setCategory] = useState<CategoryId | "all">("all");

  const visibleIssues = useMemo(() => {
    if (category === "all") {
      return policyIssues;
    }
    return policyIssues.filter((issue) => issue.category === category);
  }, [category]);

  return (
    <main>
      <header className="pageHeader">
        <Link className="backLink" href="/context">
          Change context
        </Link>
        <div>
          <p className="eyebrow">{context.name} context</p>
          <h1>Choose the policy issue for your co-design session.</h1>
          <p>{context.description}</p>
        </div>
      </header>

      <section className="toolbar">
        <button
          className={category === "all" ? "filter active" : "filter"}
          onClick={() => setCategory("all")}
        >
          All
        </button>
        {categories.map((item) => (
          <button
            className={category === item.id ? "filter active" : "filter"}
            key={item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </section>

      <section className="issueGrid">
        {visibleIssues.map((issue) => {
          const categoryName = categories.find((item) => item.id === issue.category)?.name;

          return (
            <article className="issueCard" key={issue.id}>
              <p className="eyebrow">{categoryName}</p>
              <h2>{issue.title}</h2>
              <p>{issue.brief}</p>
              <div className="miniList">
                {issue.lessHeardGroups.slice(0, 3).map((group) => (
                  <span key={group}>{group}</span>
                ))}
              </div>
              <Link className="button primary full" href={`/roles?issue=${issue.id}&context=${context.id}`}>
                Assign stakeholder roles
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
