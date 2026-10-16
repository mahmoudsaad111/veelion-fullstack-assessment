import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

const SECTIONS = [
  { href: "/tasks", title: "Task Dashboard", text: "Every task, with a quick way to tick it off." },
  { href: "/activity", title: "Activity Feed", text: "What happened and when. Searchable." },
  { href: "/reports", title: "Reports", text: "How many tasks there are, and how much has been going on." },
];

export default function HomePage() {
  return (
    <main className="stack stack--lg">
      <PageHeader
        title="Task Manager"
        description="Your tasks, a log of what happened to them, and a summary of both."
      />

      <ul className="nav-cards">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className="nav-card">
              <span className="nav-card__title">{section.title}</span>
              <span className="nav-card__text">{section.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
