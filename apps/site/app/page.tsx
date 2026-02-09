import Image from "next/image";
import QuickStart from "../components/QuickStart";

const examples = `wilma summary --student \"Kiia\" --json\nwilma schedule list --when tomorrow --json\nwilma homework list --all-students --json\nwilma exams list --student \"Kiia\" --json\nwilma grades list --all-students --json`;

export default function HomePage() {
  return (
    <main>
      <header>
        <div className="brand">
          <Image
            src="/wilmai-logo.png"
            alt="WilmAI"
            width={1024}
            height={1024}
            className="logo"
            priority
          />
        </div>
        <div className="nav-links">
          <a
            className="github-btn"
            href="https://github.com/aikarjal/wilmai"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              viewBox="0 0 16 16"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <iframe
            className="github-stars"
            title="GitHub stars"
            src="https://ghbtns.com/github-btn.html?user=aikarjal&repo=wilmai&type=star&count=true&size=large"
            frameBorder="0"
            scrolling="0"
            width="130"
            height="30"
          />
        </div>
      </header>

      <section className="hero">
        <h1>Wilma access for <span className="gradient-text">AI agents</span>.</h1>
        <p className="hero-sub">
          Schedules, homework, exams, grades, messages, and news from Wilma.
          One command gives your agent a full daily briefing.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#quickstart">
            Add Skill to Agent
          </a>
          <a className="button secondary" href="#quickstart">
            Install CLI
          </a>
        </div>
        <div className="terminal">
          <div className="terminal-chrome">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="terminal-title">wilma-cli</span>
          </div>
          <pre className="terminal-body">
{`$ wilma summary --student "Kiia"

Summary for Kiia (2025-03-10)

TODAY (2025-03-10)
  08:30-09:15  Liikunta
  10:30-11:15  Matematiikka
  11:15-12:15  Suomen kieli ja kirjallisuus

TOMORROW (2025-03-11)
  08:30-09:15  Matematiikka
  09:15-10:00  Musiikki
  10:30-11:15  Englanti, A1

UPCOMING EXAMS
  2025-03-18  Englanti, A1: Unit 3 koe — Kpl 7, 8 ja 9

RECENT HOMEWORK
  2025-03-10  Englanti, A1: Opettele kpl 8 sanat
  2025-03-09  Matematiikka: s. 117 teht. 2-4

NEWS (last 7 days)
  2025-03-08  Luistelupäivä tiistaina 11.3. (id:4501)

MESSAGES (last 7 days)
  2025-03-09  Retken tiedot ja luvat (id:12345)
  2025-03-07  Uimahallikäynti pe 14.3. (id:12300)`}
          </pre>
        </div>
      </section>

      <section className="section" id="quickstart">
        <h2>Quick Start</h2>
        <p className="lead">
          Choose your setup and copy the commands directly into your terminal.
        </p>
        <QuickStart />
      </section>

      <section className="section">
        <h2>How It Works</h2>
        <div className="step-list">
          <div className="step">
            <strong>1. Pick your tenant (city)</strong>
            <span>WilmAI ships with a list of all Wilma tenants.</span>
          </div>
          <div className="step">
            <strong>2. Authenticate once</strong>
            <span>Your credentials are stored locally for fast re-use.</span>
          </div>
          <div className="step">
            <strong>3. Query any child</strong>
            <span>Use JSON output or let your agent do the filtering.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Highlights</h2>
        <div className="cards">
          <div className="card">
            <h3>Daily briefing</h3>
            <p>One command surfaces schedule, homework, exams, news, and messages.</p>
          </div>
          <div className="card">
            <h3>Schedule & homework</h3>
            <p>What classes are tomorrow? What homework is due? Answered instantly.</p>
          </div>
          <div className="card">
            <h3>Exams & grades</h3>
            <p>Upcoming exams with study topics. Past results with grades.</p>
          </div>
          <div className="card">
            <h3>Messages & news</h3>
            <p>Field trips, swim classes, schedule changes — buried info surfaced automatically.</p>
          </div>
          <div className="card">
            <h3>Multi-kid profiles</h3>
            <p>All your children in one command with --all-students.</p>
          </div>
          <div className="card">
            <h3>Agent-ready JSON</h3>
            <p>Every command returns clean structured data with --json.</p>
          </div>
          <div className="card">
            <h3>Local only</h3>
            <p>No backend server, no data sync, no vendor lock-in.</p>
          </div>
        </div>
      </section>

      <section className="section examples">
        <h2>Examples</h2>
        <div className="code-block">
          <pre>{examples}</pre>
        </div>
        <p className="lead" style={{ marginTop: "16px" }}>
          Agent prompt: &quot;What do my kids have going on at school this week?&quot;
        </p>
      </section>

      <section className="section">
        <h2>FAQ</h2>
        <div className="faq">
          <div className="card">
            <h3>Where do my credentials live?</h3>
            <p>Locally on your machine. Nothing is stored on a server.</p>
          </div>
          <div className="card">
            <h3>Do I need a backend?</h3>
            <p>No. WilmAI is a CLI and skill you run on your own machine.</p>
          </div>
          <div className="card">
            <h3>What if my tenant changes?</h3>
            <p>Run login again and select a different tenant.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <Image
          src="/wilmai-logo.png"
          alt="WilmAI"
          width={1024}
          height={1024}
          className="footer-logo"
        />
        <div className="footer-links">
          <a href="https://github.com/aikarjal/wilmai" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://github.com/aikarjal/wilmai#readme" target="_blank" rel="noreferrer">
            Docs
          </a>
          <a href="https://github.com/aikarjal/wilmai/issues" target="_blank" rel="noreferrer">
            Issues
          </a>
        </div>
        <span>MIT Licensed</span>
      </footer>
    </main>
  );
}
