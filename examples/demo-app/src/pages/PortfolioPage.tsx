const patches = [
  {
    id: 'P-1042',
    title: 'sched/fair: skip idle balance when the LLC is already busy',
    area: 'scheduler / CFS',
    state: 'Merged / demo',
    date: '2026-08',
    changed: 'Added a per-LLC busy check before the idle-balance pass. Removes a repeated scan on a small part of the wakeup path.',
    why: 'A production trace showed the scan returning zero candidates for most wakeups. The check is cheap and was reviewed against the nohz path.',
  },
  {
    id: 'P-1038',
    title: 'tick/nohz: keep the last idle timestamp across CPU hotplug',
    area: 'timers / nohz',
    state: 'In review',
    date: '2026-07',
    changed: 'Preserves one timestamp instead of resetting it when a CPU comes back online. Three lines, one comment, one test.',
    why: 'The reset made a rare latency blip look like a new wakeup. It was not; it was bookkeeping. The fix is intentionally boring.',
  },
  {
    id: 'P-1029',
    title: 'docs: clarify isolcpus and cgroup interaction',
    area: 'documentation',
    state: 'Merged / demo',
    date: '2026-05',
    changed: 'Rewrote the paragraph that implied isolcpus excludes a CPU from cgroup accounting. It does not.',
    why: 'Two separate operators read the old text the same wrong way. Documentation is part of the interface.',
  },
  {
    id: 'P-997',
    title: 'sched: instrument migration stalls behind a static key',
    area: 'scheduler / tracing',
    state: 'Reverted / demo',
    date: '2026-03',
    changed: 'Added two tracepoints around migration stalls. Reverted after the trace buffer cost showed up on a large machine.',
    why: 'A useful experiment that did not earn its cost. Kept here because the negative result is part of the work.',
  },
]

const traceLanes = [
  { cpu: 'CPU 0', blocks: [{ start: 0, width: 7, state: 'run' }, { start: 7, width: 4, state: 'wait' }, { start: 11, width: 6, state: 'run' }, { start: 17, width: 3, state: 'idle' }] },
  { cpu: 'CPU 1', blocks: [{ start: 0, width: 3, state: 'run' }, { start: 3, width: 8, state: 'wait' }, { start: 11, width: 2, state: 'run' }, { start: 13, width: 7, state: 'idle' }] },
  { cpu: 'CPU 2', blocks: [{ start: 0, width: 5, state: 'run' }, { start: 5, width: 6, state: 'run' }, { start: 11, width: 2, state: 'wait' }, { start: 13, width: 7, state: 'run' }] },
  { cpu: 'CPU 3', blocks: [{ start: 0, width: 2, state: 'idle' }, { start: 2, width: 5, state: 'run' }, { start: 7, width: 7, state: 'wait' }, { start: 14, width: 6, state: 'run' }] },
]

const principles = [
  {
    n: '01',
    title: 'Measure the wakeup, not the average.',
    body: 'A mean hides the one request that missed its deadline. I prefer a trace with a time axis and a named event.',
  },
  {
    n: '02',
    title: 'A small patch needs a small story.',
    body: 'If I cannot explain the change in the commit message without a diagram, it is usually two changes wearing one coat.',
  },
  {
    n: '03',
    title: 'Leave the failure in the record.',
    body: 'The reverted patch is still a result. Hiding it makes the merged work look easier than it was.',
  },
]

export function PortfolioPage() {
  return (
    <main id="main" className="portfolio">
      <div className="portfolio-frame">
        <header className="portfolio-top">
          <a className="portfolio-brand" href="#top">
            <span className="portfolio-brand__mark" aria-hidden="true">MV</span>
            <span>
              Mara Voss
              <small>Kernel engineer / placeholder CV</small>
            </span>
          </a>
          <nav className="portfolio-nav" aria-label="Portfolio sections">
            <a href="#maintained">Maintained</a>
            <a href="#patches">Patches</a>
            <a href="#trace">Trace</a>
            <a href="#principles">Review</a>
            <a href="#contact">Contact</a>
          </nav>
          <span className="portfolio-status"><i aria-hidden="true" /> Open to review work / demo</span>
        </header>

        <section className="portfolio-hero" id="top" aria-labelledby="portfolio-title">
          <div>
            <p className="kicker">Mara Voss / scheduler, timers, docs</p>
            <h1 id="portfolio-title" className="display">
              Make the scheduler boring.
            </h1>
            <p className="portfolio-lede">
              I work on the parts of Linux that decide when a task runs and what happens when
              it does not. Mostly C, occasionally documentation, always a trace.
            </p>
            <ul className="rule-labels kicker">
              <li>Scheduler / CFS</li>
              <li>NOHZ / timers</li>
              <li>Patch review</li>
            </ul>
          </div>
          <aside className="portfolio-now" aria-labelledby="now-title">
            <p className="kicker">Now / placeholder</p>
            <h2 id="now-title">What I am on</h2>
            <ul className="terminal-list">
              <li>One scheduler review queue, deliberately short.</li>
              <li>An idle-balance trace that keeps disagreeing with the benchmark.</li>
              <li>Office hours on Thursday afternoons, UTC+1.</li>
            </ul>
            <p className="meta">
              This is a fictional portfolio. Names, patch IDs, dates and measurements are
              invented for the demo.
            </p>
          </aside>
        </section>

        <pre className="portfolio-ascii ascii-divider" aria-hidden="true">
{String.raw`+-- maintain -----------------------------------------------------------+
|  CFS . NOHZ . timers . docs . review                                  |
+-----------------------------------------------------------------------+`}
        </pre>

        <section id="maintained" className="portfolio-section" aria-labelledby="maintained-title">
          <div className="portfolio-section__head">
            <p className="kicker">01 / Maintained</p>
            <h2 id="maintained-title" className="section-title">The surfaces I keep.</h2>
          </div>
          <div className="portfolio-maintained">
            <div>
              <h3>sched/fair</h3>
              <p>Load balance, wakeup placement and the idle path. The work is mostly subtraction: remove a scan, keep the invariant.</p>
            </div>
            <div>
              <h3>tick/nohz</h3>
              <p>Low-resolution bookkeeping around an idle CPU. I care about the edge cases that only appear when a machine is quiet.</p>
            </div>
            <div>
              <h3>Documentation</h3>
              <p>Interface text for tunables that people actually change. If a paragraph needs a second reader, it gets rewritten.</p>
            </div>
            <div>
              <h3>Review</h3>
              <p>Small patches from other people. I try to review the change, not the person, and to say which risk I am weighing.</p>
            </div>
          </div>
        </section>

        <section id="patches" className="portfolio-section" aria-labelledby="patches-title">
          <div className="portfolio-section__head">
            <p className="kicker">02 / Selected patches</p>
            <h2 id="patches-title" className="section-title">A short patch ledger.</h2>
          </div>
          <ol className="portfolio-timeline" aria-label="Selected patches, newest first">
            {patches.map((patch) => (
              <li key={patch.id} className="patch">
                <span className="patch__date">{patch.date}</span>
                <details className="patch__entry">
                  <summary>
                    <span className="patch__id">{patch.id}</span>
                    <span className="patch__title">{patch.title}</span>
                    <span className={`patch__state patch__state--${patch.state.toLowerCase().split(' ')[0]}`}>{patch.state}</span>
                    <span className="patch__sign" aria-hidden="true">+</span>
                  </summary>
                  <div className="patch__body">
                    <p><strong>Change.</strong> {patch.changed}</p>
                    <p><strong>Why.</strong> {patch.why}</p>
                    <p className="meta">{patch.area} / placeholder entry</p>
                  </div>
                </details>
              </li>
            ))}
          </ol>
          <p className="portfolio-note">
            Patch titles and outcomes are invented. The ledger includes a reverted change on
            purpose; a portfolio without one is a highlight reel.
          </p>
        </section>

        <section id="trace" className="portfolio-section portfolio-section--trace" aria-labelledby="trace-title">
          <div className="portfolio-section__head">
            <p className="kicker">03 / A trace</p>
            <h2 id="trace-title" className="section-title">One 20 ms window, four CPUs.</h2>
          </div>
          <div className="portfolio-trace">
            <figure>
              <div className="portfolio-trace__scroll" role="region" aria-label="Scheduler trace chart, scrollable" tabIndex={0}>
                <svg viewBox="0 0 760 240" role="img" aria-label="Placeholder scheduler trace. Four CPU lanes over a 20 millisecond window. CPU 1 spends 8 milliseconds waiting. CPU 3 spends 7 milliseconds waiting.">
                  <line x1="58" y1="26" x2="58" y2="210" stroke="currentColor" strokeWidth="1" />
                  <line x1="58" y1="210" x2="734" y2="210" stroke="currentColor" strokeWidth="1" />
                  {[0, 5, 10, 15, 20].map((tick) => (
                    <g key={tick}>
                      <line x1={58 + (tick / 20) * 676} y1="210" x2={58 + (tick / 20) * 676} y2="216" stroke="currentColor" strokeWidth="1" />
                      <text x={58 + (tick / 20) * 676} y="230" className="trace-tick" textAnchor="middle">{tick} ms</text>
                    </g>
                  ))}
                  {traceLanes.map((lane, laneIndex) => {
                    const y = 34 + laneIndex * 43
                    return (
                      <g key={lane.cpu}>
                        <text x="0" y={y + 15} className="trace-label">{lane.cpu}</text>
                        <line x1="58" y1={y + 18} x2="734" y2={y + 18} stroke="currentColor" strokeOpacity=".18" />
                        {lane.blocks.map((block, blockIndex) => (
                          <rect
                            key={blockIndex}
                            className={`trace-block trace-block--${block.state}`}
                            x={58 + (block.start / 20) * 676}
                            y={y}
                            width={(block.width / 20) * 676}
                            height="24"
                            style={{ animationDelay: `${(laneIndex * 4 + blockIndex) * 45}ms` }}
                          />
                        ))}
                      </g>
                    )
                  })}
                  <rect x="58" y="24" width="676" height="186" fill="none" stroke="currentColor" strokeOpacity=".2" />
                </svg>
              </div>
              <figcaption>
                <span className="trace-key trace-key--run" aria-hidden="true" /> runnable
                <span className="trace-key trace-key--wait" aria-hidden="true" /> waiting
                <span className="trace-key trace-key--idle" aria-hidden="true" /> idle
                <span className="portfolio-trace__caption">Placeholder trace, not a measurement.</span>
              </figcaption>
            </figure>
            <div className="portfolio-trace__notes">
              <p className="kicker">What I see</p>
              <p>
                CPU 1 waits for most of the window while CPU 2 keeps working. That is not
                automatically a bug; it is the question I would ask next.
              </p>
              <dl>
                <div><dt>Window</dt><dd>20 ms / demo</dd></div>
                <div><dt>Runnable</dt><dd>8.5 ms avg / demo</dd></div>
                <div><dt>Longest wait</dt><dd>8 ms / CPU 1</dd></div>
                <div><dt>Source</dt><dd>invented trace</dd></div>
              </dl>
              <p className="meta">
                The chart is a deliberate placeholder. Its numbers exist so the visual has a
                text equivalent, not to claim a benchmark.
              </p>
            </div>
          </div>
        </section>

        <section id="principles" className="portfolio-section" aria-labelledby="principles-title">
          <div className="portfolio-section__head">
            <p className="kicker">04 / Review</p>
            <h2 id="principles-title" className="section-title">What I look for.</h2>
          </div>
          <ol className="portfolio-principles">
            {principles.map((principle) => (
              <li key={principle.n}>
                <span aria-hidden="true">{principle.n}</span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="portfolio-contact" aria-labelledby="contact-title">
          <div>
            <p className="kicker">05 / Contact</p>
            <h2 id="contact-title" className="title-xl">Send a patch, not a pitch.</h2>
            <p className="portfolio-contact__copy">
              For review requests, include the subsystem, the risk and the trace that made you
              look. A small reproduction beats a long introduction.
            </p>
          </div>
          <div className="portfolio-contact__details">
            <p><span className="kicker">Email</span> <a href="mailto:mara@example.invalid">mara@example.invalid</a></p>
            <p><span className="kicker">Office hours</span> Thursday / 15:00–17:00 UTC+1</p>
            <p><span className="kicker">Location</span> Berlin / placeholder</p>
            <p className="meta">All contact details are fictional. Do not send real patches here.</p>
          </div>
        </section>

        <footer className="portfolio-footer">
          <span>Mara Voss / fictional kernel engineer / all work invented</span>
          <span>Portfolio 06 / 2026</span>
        </footer>
      </div>
    </main>
  )
}
