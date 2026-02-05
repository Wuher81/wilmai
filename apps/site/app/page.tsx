import Image from "next/image";
import QuickStart from "../components/QuickStart";

const examples = `wilma kids list --json\nwilma messages list --student \"Kiia\" --json\nwilma exams list --all-students --json`;

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
          <a href="https://github.com/aikarjal/wilmai" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <iframe
            title="GitHub stars"
            src="https://ghbtns.com/github-btn.html?user=aikarjal&repo=wilmai&type=star&count=true"
            frameBorder="0"
            scrolling="0"
            width="120"
            height="20"
          />
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>Wilma access for AI agents.</h1>
          <p>
            Run Wilma from the CLI and wire it into agents like OpenAI, Claude Code, and
            OpenClaw.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#quickstart">
              Add Skill to Agent
            </a>
            <a className="button secondary" href="#quickstart">
              Install CLI
            </a>
          </div>
        </div>
        <div className="card">
          <h3>WilmAI helps parents stay ahead.</h3>
          <p>
            Pull messages, news, and exam schedules straight from Wilma, then let your
            agent summarize what matters.
          </p>
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
            <h3>Multi-tenant by city</h3>
            <p>Connect to the correct Wilma instance every time.</p>
          </div>
          <div className="card">
            <h3>Multi-kid profiles</h3>
            <p>Cycle through siblings quickly without re-auth.</p>
          </div>
          <div className="card">
            <h3>Agent-ready JSON</h3>
            <p>Non-interactive commands return clean structured data.</p>
          </div>
          <div className="card">
            <h3>Local only</h3>
            <p>No backend server, no data sync, no vendor lock-in.</p>
          </div>
          <div className="card">
            <h3>MIT licensed</h3>
            <p>Fork it, extend it, and ship it however you want.</p>
          </div>
        </div>
      </section>

      <section className="section examples">
        <h2>Examples</h2>
        <div className="code-block">
          <pre>{examples}</pre>
        </div>
        <p className="lead" style={{ marginTop: "16px" }}>
          Agent prompt: “Fetch all Wilma messages for my kids and summarize what needs
          action.”
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
        <span>WilmAI • wilm.ai</span>
        <span>
          <a href="https://github.com/aikarjal/wilmai" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </span>
      </footer>
    </main>
  );
}
