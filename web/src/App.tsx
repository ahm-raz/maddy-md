import { Mark } from './components/Mark.tsx'
import { Scene } from './components/Scene.tsx'
import { Themes } from './components/Themes.tsx'
import { DOWNLOADS, RELEASES, REPO, VERSION } from './config.ts'

const FEATURES = [
  {
    title: 'Read, split or write',
    body: 'Three modes on one page. Read the rendered sheet, write beside it, or write alone. Changes save as you type.',
    keys: ['Ctrl', '1 2 3'],
  },
  {
    title: 'Paste from ChatGPT or Claude',
    body: 'Rich text copied from an AI assistant becomes clean Markdown. Ctrl+Shift+V turns the clipboard into a new page.',
    keys: ['Ctrl', 'Shift', 'V'],
  },
  {
    title: 'Mermaid you can explore',
    body: 'Diagrams render inline. Click one to open a canvas you can pan, zoom and export as SVG or PNG.',
  },
  {
    title: 'Links, backlinks and a graph',
    body: 'Type [[ to link a page. Every page shows what links to it, and the graph view shows how the folder connects.',
    keys: ['Ctrl', 'G'],
  },
  {
    title: 'Tabs and split panes',
    body: 'Browser-style tabs, a quick switcher and a command palette that holds every action. Split right, left or down.',
    keys: ['Ctrl', 'P'],
  },
  {
    title: 'A study list that keeps you honest',
    body: 'Queue pages you must not skip and track them from queued to studied. Add to-dos and sticky notes to any page.',
    keys: ['Alt', 'S'],
  },
]

const SHORTCUTS: [string, string][] = [
  ['Ctrl+O', 'Find or create a page'],
  ['Ctrl+P', 'Command palette'],
  ['Ctrl+T / Ctrl+W', 'New tab / close tab'],
  ['Ctrl+Alt+→', 'Split the view right'],
  ['Ctrl+G', 'Graph of linked pages'],
  ['F11', 'Zen mode'],
  ['Alt+N', 'Sticky note on this page'],
  ['Ctrl+,', 'Customize: themes, fonts, width'],
]

function Kbd({ k }: { k: string }) {
  const parts = k.split(/(\s\/\s|\+)/)
  return (
    <span className="keys">
      {parts.map((p, i) =>
        p === '+' ? null : p === ' / ' ? (
          <span key={i} className="sep">/</span>
        ) : (
          <kbd key={i}>{p}</kbd>
        ),
      )}
    </span>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="#top" aria-label="Maddy MD home">
            <Mark size={30} />
            <span>Maddy MD</span>
          </a>
          <nav aria-label="Sections">
            <a href="#features">Features</a>
            <a href="#themes">Themes</a>
            <a href="#download">Download</a>
            <a className="nav-gh" href={REPO} aria-label="Maddy MD on GitHub">
              <GitHubIcon />
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <Scene />
          <div className="wrap hero-in">
            <p className="eyebrow">Free Markdown reader for Windows</p>
            <h1>
              A reading room for your <span className="hl">Markdown</span>.
            </h1>
            <p className="lede">
              Maddy MD opens any folder of <code>.md</code> and <code>.txt</code> files and makes them a pleasure to read, study and
              write. Your files stay plain. Everything else stays out of them.
            </p>
            <div className="cta">
              <a className="btn primary" href={DOWNLOADS.setup}>
                <DownloadIcon /> Download for Windows
              </a>
              <a className="btn" href={REPO}>
                <GitHubIcon /> View source
              </a>
            </div>
            <p className="meta">
              Version {VERSION} · Windows 10 and 11, 64-bit · or get the{' '}
              <a href={DOWNLOADS.portable}>portable .exe</a>
            </p>
          </div>
          <div className="wrap">
            <figure className="frame hero-shot">
              <img
                src="/shots/orbit.webp"
                width={1366}
                height={768}
                fetchPriority="high"
                alt="Maddy MD showing a project page on the Orbit theme, with the page tree on the left and an outline on the right."
              />
            </figure>
          </div>
        </section>

        <section className="band">
          <div className="wrap band-in">
            <div>
              <b>0</b>
              <span>accounts to make</span>
            </div>
            <div>
              <b>0</b>
              <span>analytics or tracking</span>
            </div>
            <div>
              <b>15</b>
              <span>built-in themes</span>
            </div>
            <div>
              <b>100%</b>
              <span>plain files you own</span>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="wrap">
            <h2>Built for long reading sessions.</h2>
            <p className="sub">
              Roadmaps, specs, notes pasted from an AI assistant. Maddy MD renders GitHub-flavoured Markdown, Mermaid, callouts,
              tables, task lists and sanitized HTML, and keeps every frequent action one shortcut away.
            </p>
            <div className="grid">
              {FEATURES.map((f) => (
                <article className="card" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  {f.keys && (
                    <span className="keys">
                      {f.keys.map((k) => (
                        <kbd key={k}>{k}</kbd>
                      ))}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt" id="themes">
          <div className="wrap">
            <h2>Pick the room. The page stays readable.</h2>
            <p className="sub">
              Fifteen cut-paper scenes, from deep space to a quiet sheet of paper. A theme changes the room around the text, never
              its contrast. Turn the scene down to calm, or off.
            </p>
            <Themes />
          </div>
        </section>

        <section className="section" id="files">
          <div className="wrap split">
            <div>
              <h2>Plain files stay plain.</h2>
              <p className="sub">
                Maddy MD reads and writes only <code>.md</code>, <code>.markdown</code> and <code>.txt</code>. It never touches anything else in
                the folder, and your notes work in any other editor.
              </p>
              <ul className="ticks">
                <li>
                  <b>Your notes</b> live in the folder you opened.
                </li>
                <li>
                  <b>To-dos, the study list, sticky notes and settings</b> are kept on this PC in <code>%APPDATA%\Maddy MD</code>, outside your
                  files.
                </li>
                <li>
                  <b>Optional sync</b> backs a folder up to a private GitHub Gist with your own token. Nothing is uploaded unless you press Push.
                </li>
              </ul>
            </div>
            <div className="shortcuts" aria-label="Keyboard shortcuts">
              <h3>Shortcuts worth knowing</h3>
              <dl>
                {SHORTCUTS.map(([k, v]) => (
                  <div key={k}>
                    <dt>
                      <Kbd k={k} />
                    </dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="section alt" id="download">
          <div className="wrap">
            <h2>Install in a minute.</h2>
            <div className="dl">
              <a className="dl-card" href={DOWNLOADS.setup}>
                <span className="tag">Recommended</span>
                <h3>Installer</h3>
                <p>Adds desktop and Start menu shortcuts and opens .md files on double-click.</p>
                <span className="file">
                  <DownloadIcon /> Maddy-MD-Setup-{VERSION}.exe
                </span>
              </a>
              <a className="dl-card" href={DOWNLOADS.portable}>
                <h3>Portable</h3>
                <p>No install. Run it from anywhere, including a USB stick. Starts a few seconds slower.</p>
                <span className="file">
                  <DownloadIcon /> Maddy-MD-Portable-{VERSION}.exe
                </span>
              </a>
            </div>
            <ol className="steps">
              <li>
                <b>Run the file.</b> If Windows shows “Windows protected your PC”, choose <i>More info</i>, then <i>Run anyway</i>. The app
                is not code-signed yet; the source is public on GitHub.
              </li>
              <li>
                <b>Look around.</b> The first launch creates a sample folder, <code>Documents\Maddy MD Vault</code>, so there is something to
                read.
              </li>
              <li>
                <b>Open your notes.</b> Press <Kbd k="Ctrl+Shift+O" /> and choose any folder with Markdown or text files.
              </li>
            </ol>
            <p className="meta center">
              All versions and release notes are on <a href={RELEASES}>GitHub Releases</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <span className="brand small">
            <Mark size={22} /> Maddy MD
          </span>
          <span>Free, with the source on GitHub. Made by ahm-raz.</span>
          <a href={REPO}>GitHub</a>
        </div>
      </footer>
    </>
  )
}
