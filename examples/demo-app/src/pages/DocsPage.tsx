import { useState } from 'react'
import type { ReactNode } from 'react'

const quickStart = `tidal init --repo ~/dotfiles
tidal link ~/.config/nvim --as nvim
tidal link ~/.zshrc
tidal pull`

const statusOutput = `$ tidal status
repo      ~/dotfiles
commit    4a91c2e
links     2 clean, 1 drifted
queue     0

drifted   ~/.config/nvim/init.lua
  local +18  remote +0`

const config = `# ~/.config/tidal/config.toml
repo = "~/dotfiles"
strategy = "link"
backup = true

[ignore]
paths = [".DS_Store", "*.swp"]

[hooks]
after_pull = ["tidal doctor --quiet"]`

type CopyState = 'idle' | 'copied' | 'failed'

function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<CopyState>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('failed')
    }
  }

  return (
    <>
      <button type="button" className="code-copy" onClick={copy}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : `Copy ${label}`}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === 'copied' ? 'Copied to clipboard.' : state === 'failed' ? 'Copy failed. Select the text instead.' : ''}
      </span>
    </>
  )
}

function CodeBlock({ label, code, children }: { label: string; code: string; children?: ReactNode }) {
  return (
    <div className="code-block">
      <div className="code-block__head">
        <span>{label}</span>
        <CopyButton text={code} label={label.toLowerCase()} />
      </div>
      <pre tabIndex={0} aria-label={`${label} code`}><code>{children ?? code}</code></pre>
    </div>
  )
}

type LabResult = 'idle' | 'clean' | 'conflict'

function DriftLab() {
  const [local, setLocal] = useState(true)
  const [remote, setRemote] = useState(true)
  const [result, setResult] = useState<LabResult>('idle')
  const conflict = local && remote

  const toggle = (side: 'local' | 'remote') => {
    if (side === 'local') setLocal((current) => !current)
    else setRemote((current) => !current)
    setResult('idle')
  }

  const pull = () => {
    setResult(conflict ? 'conflict' : 'clean')
  }

  const reset = () => {
    setLocal(false)
    setRemote(false)
    setResult('idle')
  }

  const output = result === 'conflict'
    ? `$ tidal pull
conflict  ~/.config/nvim/init.lua
  local  - your_colorscheme = "gruvbox"
  remote + your_colorscheme = "catppuccin"

refused; working tree preserved
exit 3`
    : result === 'clean' && local
      ? `$ tidal pull
already up to date
local edit left uncommitted
exit 0`
      : result === 'clean' && remote
        ? `$ tidal pull
fast-forward 4a91c2e..7d2e1b0
1 file changed
exit 0`
        : result === 'clean'
          ? `$ tidal pull
already up to date
exit 0`
          : ''

  return (
    <div className="docs-lab">
      <div className="docs-lab__head">
        <p className="kicker">Drift lab / local simulation</p>
        <span className={`docs-lab__exit ${result === 'conflict' ? 'is-conflict' : ''}`}>
          exit {result === 'conflict' ? '3' : result === 'clean' ? '0' : '—'}
        </span>
      </div>

      <div className="docs-lab__grid">
        <div className="docs-lab__file">
          <div className="docs-lab__file-head">
            <span>~/.config/nvim/init.lua</span>
            <span>{conflict ? 'both sides changed' : local ? 'local edit only' : remote ? 'remote commit only' : 'no local changes'}</span>
          </div>
          <ol aria-label="Placeholder init.lua contents">
            <li><span className="docs-lab__ln" aria-hidden="true">1</span><code>vim.opt.number = true</code></li>
            {conflict ? (
              <>
                <li className="is-local"><span className="docs-lab__ln" aria-hidden="true">2a</span><code>your_colorscheme = "gruvbox"</code><span className="docs-lab__flag">local</span></li>
                <li className="is-remote"><span className="docs-lab__ln" aria-hidden="true">2b</span><code>your_colorscheme = "catppuccin"</code><span className="docs-lab__flag">remote</span></li>
              </>
            ) : (
              <li className={local ? 'is-local' : remote ? 'is-remote' : undefined}>
                <span className="docs-lab__ln" aria-hidden="true">2</span>
                <code>your_colorscheme = "{remote ? 'catppuccin' : 'gruvbox'}"</code>
                {local && <span className="docs-lab__flag">local</span>}
                {remote && <span className="docs-lab__flag">remote</span>}
              </li>
            )}
            <li><span className="docs-lab__ln" aria-hidden="true">3</span><code>local map = vim.keymap.set</code></li>
          </ol>
          <p className="docs-lab__note">
            The local edit and the fetched commit both touch line 2. This snapshot is
            illustrative; the lab never reads or writes a real file.
          </p>
        </div>

        <div className="docs-lab__controls">
          <p className="kicker">Stage the disagreement</p>
          <button
            type="button"
            className="chip docs-lab__toggle"
            aria-pressed={local}
            onClick={() => toggle('local')}
          >
            <i aria-hidden="true" /> Local edit
          </button>
          <button
            type="button"
            className="chip docs-lab__toggle"
            aria-pressed={remote}
            onClick={() => toggle('remote')}
          >
            <i aria-hidden="true" /> Remote commit
          </button>
          <button className="button button--primary" type="button" onClick={pull}>
            Run tidal pull
          </button>
          <button className="button button--quiet button--sm" type="button" onClick={reset}>
            Reset lab
          </button>
          <p className="docs-lab__hint">
            Both sides changed: tidal refuses and leaves the working tree intact. Only one
            side changed: the pull completes.
          </p>
        </div>
      </div>

      <div className={`docs-lab__output ${result === 'conflict' ? 'is-conflict' : ''}`} role="status" aria-live="polite">
        <p className="kicker">Output / {result === 'idle' ? 'not run' : result === 'conflict' ? 'refusal' : 'success'}</p>
        {result === 'idle' ? (
          <p className="docs-lab__idle">Set the two sides, then run the pull. The output will appear here.</p>
        ) : (
          <>
            <pre>{output}</pre>
            <p>
              {result === 'conflict'
                ? 'Exit 3. Both values remain visible until a person chooses. No file was written.'
                : 'Exit 0. This is the calm path; the lab does not claim to have written anything.'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const toc = [
  { href: '#quick-start', label: 'Quick start' },
  { href: '#cycle', label: 'The sync cycle' },
  { href: '#commands', label: 'Command reference' },
  { href: '#configuration', label: 'Configuration' },
  { href: '#conflicts', label: 'When files disagree' },
  { href: '#exit-codes', label: 'Exit codes' },
]

function Contents() {
  return (
    <ul>
      {toc.map((item, index) => (
        <li key={item.href}>
          <a href={item.href}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function DocsPage() {
  return (
    <main id="main" className="docs">
      <header className="docs-top">
        <a className="docs-brand" href="#top" aria-label="tidal docs home">
          <span className="docs-brand__wave" aria-hidden="true">~</span>
          <span>tidal</span>
          <span className="docs-version">0.8.2 / placeholder</span>
        </a>
        <nav className="docs-topnav" aria-label="Documentation">
          <a href="#quick-start" aria-current="page">Guide</a>
          <a href="#commands">Commands</a>
          <a href="#configuration">Config</a>
          <a href="#exit-codes">Reference</a>
        </nav>
      </header>

      <div className="docs-layout" id="top">
        <aside className="docs-side">
          <div className="docs-side__block">
            <p className="kicker">Guide</p>
            <nav className="docs-nav" aria-label="Guide contents">
              <Contents />
            </nav>
            <details className="docs-mobile-toc">
              <summary>Contents / {toc.length} sections</summary>
              <Contents />
            </details>
          </div>
          <div className="docs-side__note">
            <p className="kicker">Demo note</p>
            <p>tidal is fictional. Commands, versions and outputs are illustrative placeholders.</p>
          </div>
        </aside>

        <article className="docs-article" aria-labelledby="docs-title">
          <header className="docs-article__head">
            <p className="kicker">Guide / first run</p>
            <h1 id="docs-title" className="display docs-title">Keep dotfiles in step.</h1>
            <p className="docs-lede">
              tidal links the files you already edit to one git repository, then gives you a
              status you can read. No daemon, no hidden branch, no surprise overwrite.
            </p>
            <ul className="rule-labels kicker">
              <li>Single binary</li>
              <li>Git-native</li>
              <li>macOS / Linux</li>
            </ul>
          </header>

          <section id="quick-start" className="docs-section" aria-labelledby="quick-title">
            <h2 id="quick-title" className="section-title">Quick start</h2>
            <p>
              Install the placeholder binary, point tidal at a repository, then link the paths
              you want it to own.
            </p>
            <CodeBlock label="Shell" code={quickStart} />
            <p className="docs-caption">
              Placeholder command output is omitted. The install command is not published.
            </p>
            <div className="callout docs-callout">
              <strong>Ownership is explicit.</strong> tidal only writes files it has linked.
              An unlinked path is left alone, even if it exists inside the repository.
            </div>
          </section>

          <section id="cycle" className="docs-section" aria-labelledby="cycle-title">
            <h2 id="cycle-title" className="section-title">The sync cycle</h2>
            <ol className="docs-cycle">
              <li>
                <span aria-hidden="true">01</span>
                <div><strong>init</strong><p>Creates a repository and a small manifest. It does not copy anything yet.</p></div>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <div><strong>link</strong><p>Records a path and replaces it with a symlink by default. <code>--copy</code> is available.</p></div>
              </li>
              <li>
                <span aria-hidden="true">03</span>
                <div><strong>pull / push</strong><p>Fast-forwards the repository. Conflicts stop the operation and print the affected paths.</p></div>
              </li>
            </ol>
            <CodeBlock label="Status / example" code={statusOutput} />
            <p className="docs-caption">
              The <code>local +18 / remote +0</code> line is placeholder output, not a real diff.
            </p>
          </section>

          <section id="commands" className="docs-section" aria-labelledby="commands-title">
            <h2 id="commands-title" className="section-title">Command reference</h2>
            <div className="table-scroll docs-table" role="region" aria-label="tidal command reference" tabIndex={0}>
              <table>
                <thead>
                  <tr><th scope="col">Command</th><th scope="col">What it does</th><th scope="col">Changes files</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row"><code>tidal init</code></th><td>Create a repository and manifest.</td><td>No</td></tr>
                  <tr><th scope="row"><code>tidal link</code></th><td>Link or copy a path into the repo.</td><td>Yes</td></tr>
                  <tr><th scope="row"><code>tidal status</code></th><td>Show links, drift and pending commits.</td><td>No</td></tr>
                  <tr><th scope="row"><code>tidal pull</code></th><td>Fetch and fast-forward.</td><td>Yes</td></tr>
                  <tr><th scope="row"><code>tidal push</code></th><td>Commit linked changes and push.</td><td>Yes</td></tr>
                  <tr><th scope="row"><code>tidal doctor</code></th><td>Check broken links and missing paths.</td><td>No</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="configuration" className="docs-section" aria-labelledby="config-title">
            <h2 id="config-title" className="section-title">Configuration</h2>
            <p>
              A single TOML file owns the repository path, default strategy and optional hooks.
              Machine-specific values belong in an ignored local file.
            </p>
            <CodeBlock label="config.toml" code={config} />
            <dl className="docs-terms">
              <dt><code>strategy</code></dt><dd><code>link</code> or <code>copy</code>. Applies to newly linked paths only.</dd>
              <dt><code>backup</code></dt><dd>Writes a timestamped copy before replacing an existing file.</dd>
              <dt><code>hooks</code></dt><dd>Runs after the named operation. A failing hook stops the command.</dd>
            </dl>
          </section>

          <section id="conflicts" className="docs-section" aria-labelledby="conflicts-title">
            <h2 id="conflicts-title" className="section-title">When files disagree</h2>
            <p>
              A local edit and a remote commit can both win. tidal refuses to guess. It stops,
              prints both sides, and keeps the working tree intact until you choose.
            </p>
            <DriftLab />
            <div className="callout callout--danger docs-callout">
              <strong>Do not run <code>push --force</code> to make a conflict disappear.</strong>{' '}
              It discards the remote side and is never the documented fix. Resolve the file or
              run <code>tidal pull --abort</code>.
            </div>
          </section>

          <section id="exit-codes" className="docs-section" aria-labelledby="exit-title">
            <h2 id="exit-title" className="section-title">Exit codes</h2>
            <div className="docs-codes">
              <p><code>0</code><span>Success.</span></p>
              <p><code>1</code><span>Generic failure; read stderr.</span></p>
              <p><code>2</code><span>Usage error.</span></p>
              <p><code>3</code><span>Conflict or drift; nothing was overwritten.</span></p>
              <p><code>4</code><span>Repository missing or unreachable.</span></p>
            </div>
          </section>

          <nav className="docs-pager" aria-label="Guide pagination">
            <a href="#quick-start" className="docs-pager__prev">
              <span className="kicker">Previous</span>
              Install and first link
            </a>
            <a href="#configuration" className="docs-pager__next">
              <span className="kicker">Next</span>
              Config reference
            </a>
          </nav>
        </article>

        <aside className="docs-rail" aria-label="On this page">
          <p className="kicker">On this page</p>
          <Contents />
          <div className="docs-rail__note">
            <p className="kicker">Last edit</p>
            <p>2026-09-18 / placeholder</p>
          </div>
        </aside>
      </div>

      <footer className="docs-footer">
        <span>tidal / fictional documentation / no published package</span>
        <span>Guide 01 / v0.8.2 placeholder</span>
      </footer>
    </main>
  )
}
