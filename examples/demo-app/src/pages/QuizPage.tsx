import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

type Db = 'sqlite' | 'postgres' | 'redis' | 'duckdb' | 'neo4j'

interface Option {
  label: string
  detail: string
  tone: string
  scores: Partial<Record<Db, number>>
  axes: [number, number, number]
}

interface Question {
  prompt: string
  note: string
  options: Option[]
}

const dbOrder: Db[] = ['postgres', 'sqlite', 'redis', 'duckdb', 'neo4j']

const profiles: Record<Db, { name: string; role: string; blurb: string; tone: string }> = {
  postgres: {
    name: 'PostgreSQL',
    role: 'The careful generalist',
    blurb: 'You want a schema, a transaction and a plan. Correct first, then fast. You keep the receipts.',
    tone: 'cat-2',
  },
  sqlite: {
    name: 'SQLite',
    role: 'The local-first one',
    blurb: 'One file, zero ceremony, surprisingly capable. The whole thing fits in your pocket, backup included.',
    tone: 'cat-1',
  },
  redis: {
    name: 'Redis',
    role: 'The fast path',
    blurb: 'You keep the hot thing close. You know exactly what can be rebuilt, and you say so out loud.',
    tone: 'cat-4',
  },
  duckdb: {
    name: 'DuckDB',
    role: 'The analytical hermit',
    blurb: 'You want the whole dataset on one machine, columnar and quiet. A good answer, not a cluster.',
    tone: 'cat-3',
  },
  neo4j: {
    name: 'Neo4j',
    role: 'The relationship one',
    blurb: 'You see the edges before the rows. The interesting question is not what a thing is, but what it touches.',
    tone: 'cat-5',
  },
}

const axes = [
  { left: 'Ephemeral', right: 'Durable', cl: 'cat-4', cr: 'cat-2' },
  { left: 'Flexible', right: 'Structured', cl: 'cat-5', cr: 'cat-1' },
  { left: 'Single node', right: 'Distributed', cl: 'cat-3', cr: 'cat-6' },
]

const questions: Question[] = [
  {
    prompt: 'A new dataset lands on your desk. What happens first?',
    note: 'There is no right answer. There are only consequences.',
    options: [
      {
        label: 'Open it beside the app and query it in place.',
        detail: 'No import. A file, a query, a look.',
        tone: 'cat-3',
        scores: { duckdb: 2, sqlite: 1 },
        axes: [-1, 1, -1],
      },
      {
        label: 'Give it a schema, then load it properly.',
        detail: 'Types, constraints, a migration.',
        tone: 'cat-2',
        scores: { postgres: 2 },
        axes: [1, 2, 0],
      },
      {
        label: 'Drop it in a key and move on.',
        detail: 'It can be a job for later.',
        tone: 'cat-4',
        scores: { redis: 2 },
        axes: [-2, -1, 0],
      },
    ],
  },
  {
    prompt: 'How do you feel about a schema?',
    note: 'A schema is either a promise or a constraint. Sometimes both.',
    options: [
      {
        label: 'A schema is a contract I want in writing.',
        detail: 'Change it on purpose, with a rollback.',
        tone: 'cat-2',
        scores: { postgres: 2, sqlite: 1 },
        axes: [1, 2, 0],
      },
      {
        label: 'I add one once the shape stops moving.',
        detail: 'Start loose, tighten when it earns it.',
        tone: 'cat-3',
        scores: { duckdb: 1, sqlite: 2 },
        axes: [-1, 1, -1],
      },
      {
        label: 'The relationships are the schema.',
        detail: 'Nodes and edges, no fixed rows.',
        tone: 'cat-5',
        scores: { neo4j: 2 },
        axes: [-1, -1, 1],
      },
    ],
  },
  {
    prompt: 'A query gets slow at 3am. What do you reach for?',
    note: 'The clock is real. The answer does not have to be dramatic.',
    options: [
      {
        label: 'The query plan, then an index.',
        detail: 'Measure first. Add the smallest fix.',
        tone: 'cat-2',
        scores: { postgres: 2, sqlite: 1 },
        axes: [0, 2, 0],
      },
      {
        label: 'The hot key. Cache it.',
        detail: 'Make the next request cheap.',
        tone: 'cat-4',
        scores: { redis: 2 },
        axes: [-2, -1, 0],
      },
      {
        label: 'A graph traversal that should not be a join.',
        detail: 'Rewrite the question, not the hardware.',
        tone: 'cat-5',
        scores: { neo4j: 2 },
        axes: [-1, -2, 0],
      },
    ],
  },
  {
    prompt: 'Where should the data actually live?',
    note: 'Pick the place, not the logo on the slide.',
    options: [
      {
        label: 'Next to the app, in one file.',
        detail: 'A copy is a backup if you test it.',
        tone: 'cat-1',
        scores: { sqlite: 2, duckdb: 1 },
        axes: [0, 1, -2],
      },
      {
        label: 'Behind a managed primary with backups.',
        detail: 'Boring, observable, recoverable.',
        tone: 'cat-2',
        scores: { postgres: 2 },
        axes: [1, 2, 1],
      },
      {
        label: 'Across nodes, with a plan for loss.',
        detail: 'One machine is not a strategy.',
        tone: 'cat-6',
        scores: { redis: 2, postgres: 1 },
        axes: [1, 1, 2],
      },
    ],
  },
  {
    prompt: 'Your ideal weekend project is...',
    note: 'The thing you build when nobody asks for it.',
    options: [
      {
        label: 'A small local tool with a searchable index.',
        detail: 'Offline, instant, one binary.',
        tone: 'cat-1',
        scores: { sqlite: 2, duckdb: 1 },
        axes: [0, 1, -2],
      },
      {
        label: 'A dashboard over a pile of Parquet.',
        detail: 'No server, just columns.',
        tone: 'cat-3',
        scores: { duckdb: 2 },
        axes: [0, 2, -1],
      },
      {
        label: 'A map of who knows whom.',
        detail: 'The edges are the product.',
        tone: 'cat-5',
        scores: { neo4j: 2 },
        axes: [-1, -2, 0],
      },
    ],
  },
  {
    prompt: 'A migration fails halfway. Your move?',
    note: 'This is where the personality shows.',
    options: [
      {
        label: 'Roll forward in a transaction.',
        detail: 'Keep the old version reachable.',
        tone: 'cat-2',
        scores: { postgres: 2, sqlite: 1 },
        axes: [2, 2, 0],
      },
      {
        label: 'Flush and rebuild from the source.',
        detail: 'If it is reproducible, it is disposable.',
        tone: 'cat-4',
        scores: { redis: 2, duckdb: 1 },
        axes: [-2, -1, -1],
      },
      {
        label: 'Version the nodes and edges.',
        detail: 'Keep both histories in the graph.',
        tone: 'cat-5',
        scores: { neo4j: 2 },
        axes: [0, 1, 1],
      },
    ],
  },
  {
    prompt: 'What does “durable” mean to you?',
    note: 'The word is doing a lot of work in this quiz.',
    options: [
      {
        label: 'It survives a power cut and a tested restore.',
        detail: 'Both halves matter.',
        tone: 'cat-2',
        scores: { postgres: 2, sqlite: 2 },
        axes: [2, 1, 0],
      },
      {
        label: 'It can be rebuilt from the source of truth.',
        detail: 'The cache is not the truth.',
        tone: 'cat-4',
        scores: { redis: 1, duckdb: 1 },
        axes: [-2, -1, -1],
      },
      {
        label: 'It keeps every relationship intact.',
        detail: 'A delete should not orphan the story.',
        tone: 'cat-5',
        scores: { neo4j: 2 },
        axes: [1, 1, 1],
      },
    ],
  },
  {
    prompt: 'Pick a deployment you could actually defend.',
    note: 'The last one. Then the reading.',
    options: [
      {
        label: 'One binary, one file, zero ops.',
        detail: 'Small enough to understand.',
        tone: 'cat-1',
        scores: { sqlite: 2, duckdb: 1 },
        axes: [0, 1, -2],
      },
      {
        label: 'Primary plus replica, with a migration path.',
        detail: 'Enough structure to sleep.',
        tone: 'cat-2',
        scores: { postgres: 2 },
        axes: [2, 2, 1],
      },
      {
        label: 'A cluster that loses a node without drama.',
        detail: 'Redundancy, not heroics.',
        tone: 'cat-6',
        scores: { redis: 2 },
        axes: [1, 1, 2],
      },
    ],
  },
]

const emptyScores: Record<Db, number> = { sqlite: 0, postgres: 0, redis: 0, duckdb: 0, neo4j: 0 }

function readSavedAnswers(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem('textured-minimal-quiz') || '[]') as unknown
    if (!Array.isArray(raw) || raw.length > questions.length) return []
    if (!raw.every((value, index) => typeof value === 'number' && value >= 0 && value < questions[index].options.length)) {
      return []
    }
    return raw
  } catch {
    return []
  }
}

function scoreAnswers(answers: number[]) {
  const scores = { ...emptyScores }
  const axisTotals: [number, number, number] = [0, 0, 0]
  answers.forEach((optionIndex, questionIndex) => {
    const option = questions[questionIndex]?.options[optionIndex]
    if (!option) return
    for (const [db, points] of Object.entries(option.scores) as [Db, number][]) {
      scores[db] += points
    }
    option.axes.forEach((value, axisIndex) => {
      axisTotals[axisIndex] += value
    })
  })
  return { scores, axisTotals }
}

function stripCells(answers: number[], current: number, result: boolean) {
  return questions.map((question, index) => {
    const answered = index < answers.length || result
    const option = answered ? question.options[answers[index]] : undefined
    return {
      filled: Boolean(option),
      neutral: answered && !option,
      current: !result && index === current,
      cat: option?.tone || 'cat-6',
      label: option ? option.label : 'Not answered',
    }
  })
}

function ProgressStrip({ answers, current, result }: { answers: number[]; current: number; result: boolean }) {
  const cells = stripCells(answers, current, result)
  const done = result ? 8 : answers.length
  return (
    <div className="quiz-progress-wrap">
      <div className="quiz-progress-head">
        <span className="kicker">Progress / {done} of 8</span>
        <span className="meta">{result ? 'Reading complete' : current < 8 ? `Question ${current + 1} of 8` : 'Reading complete'}</span>
      </div>
      <ol
        className="strip quiz-strip"
        style={{ '--n': 8 } as CSSProperties}
        role="img"
        aria-label={`Progress: ${done} of 8 questions answered${result ? '' : `, question ${current + 1} is current`}`}
      >
        {cells.map((cell, index) => (
          <li
            key={index}
            className={`${cell.filled ? 'is-filled' : ''} ${cell.neutral ? 'is-neutral' : ''}`}
            style={{ '--cat': `var(--${cell.cat})` } as CSSProperties}
            aria-current={cell.current ? 'step' : undefined}
            title={`Question ${index + 1}: ${cell.label}`}
          />
        ))}
      </ol>
    </div>
  )
}

function BipolarBars({ totals, compact = false }: { totals: [number, number, number]; compact?: boolean }) {
  return (
    <div className={`quiz-axes ${compact ? 'quiz-axes--compact' : ''}`}>
      {axes.map((axis, index) => {
        const total = totals[index]
        const right = ((total + 16) / 32) * 100
        const left = 100 - right
        const leansRight = right >= left
        const lean = Math.round(Math.abs(right - left))
        const rightValue = Math.round(right)
        const leftValue = 100 - rightValue
        return (
          <div className="bipolar quiz-axis" key={axis.left}>
            <div className="bipolar__head">
              <b>{axis.left} <span className="meta">{leftValue}</span></b>
              <span className="kicker">{compact ? 'demo axis' : `${axis.left} / ${axis.right}`}</span>
              <b><span className="meta">{rightValue}</span> {axis.right}</b>
            </div>
            <div
              className="bipolar__track"
              style={{
                '--l': `${left}%`,
                '--r': `${right}%`,
                '--cl': `var(--${axis.cl})`,
                '--cr': `var(--${axis.cr})`,
              } as CSSProperties}
              aria-hidden="true"
            />
            <p className="bipolar__foot">
              {lean === 0 ? 'Dead centre.' : `Leans ${leansRight ? axis.right : axis.left} by ${lean} points.`}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function ShareCard({
  profile,
  totals,
  answers,
  tie,
}: {
  profile: { name: string; role: string; blurb: string }
  totals: [number, number, number]
  answers: number[]
  tie: Db | null
}) {
  const current = 8
  return (
    <div className="share-card" id="share-card">
      <div className="share-card__top">
        <span className="share-card__brand">DATA TYPE / RESULT</span>
        <span>DT-08</span>
      </div>
      <p className="kicker">Eight answers / three axes / placeholder quiz</p>
      <h3>{profile.name}</h3>
      <p className="share-card__role">{profile.role}{tie ? ` (tied with ${profiles[tie].name})` : ''}</p>
      <BipolarBars totals={totals} compact />
      <ProgressStrip answers={answers} current={current} result />
      <div className="share-card__foot">
        <span>textured-minimal / quiz</span>
        <span>8 / 8 answered</span>
      </div>
    </div>
  )
}

export function QuizPage() {
  const saved = useMemo(readSavedAnswers, [])
  const [answers, setAnswers] = useState<number[]>(saved)
  const [index, setIndex] = useState(saved.length)
  const [phase, setPhase] = useState<'intro' | 'question' | 'result'>(
    saved.length === 0 ? 'intro' : saved.length === 8 ? 'result' : 'question',
  )
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [resetArmed, setResetArmed] = useState(false)
  const [resumed] = useState(saved.length > 0 && saved.length < 8)

  useEffect(() => {
    try {
      if (answers.length === 0) localStorage.removeItem('textured-minimal-quiz')
      else localStorage.setItem('textured-minimal-quiz', JSON.stringify(answers))
    } catch {
      /* Progress persistence is optional. */
    }
  }, [answers])

  useEffect(() => {
    if (!resetArmed) return
    const timer = window.setTimeout(() => setResetArmed(false), 4000)
    return () => window.clearTimeout(timer)
  }, [resetArmed])

  const totalAnswered = answers.length
  const currentQuestion = questions[index]

  const choose = (optionIndex: number) => {
    setAnswers((current) => {
      const next = current.slice(0, index)
      next[index] = optionIndex
      return next
    })
    setCopyState('idle')
    setDirection('forward')
    if (index === questions.length - 1) {
      setPhase('result')
    } else {
      setIndex(index + 1)
    }
  }

  const back = () => {
    if (index <= 0) return
    setDirection('back')
    setIndex(index - 1)
    setPhase('question')
  }

  const start = () => {
    setAnswers([])
    setIndex(0)
    setDirection('forward')
    setPhase('question')
  }

  const reset = () => {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }
    setAnswers([])
    setIndex(0)
    setPhase('intro')
    setResetArmed(false)
    setCopyState('idle')
  }

  useEffect(() => {
    if (phase !== 'question') return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        const optionIndex = Number(event.key) - 1
        if (currentQuestion.options[optionIndex]) {
          event.preventDefault()
          choose(optionIndex)
        }
      }
      if (event.key === 'Escape') {
        /* Nothing to dismiss on the question view. */
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const scored = scoreAnswers(answers)
  const ranked = dbOrder
    .map((db) => ({ db, score: scored.scores[db] }))
    .sort((a, b) => b.score - a.score)
  const leader = ranked[0]
  const tie = ranked[0].score === ranked[1].score ? ranked[1].db : null
  const profile = profiles[leader.db]
  const enough = totalAnswered >= 4

  const shareText = `Which database are you? — ${profile.name}${tie ? ` (tied with ${profiles[tie].name})` : ''}\n${profile.role}\n${profile.blurb}\n\nAxes (demo model):\n${axes.map((axis, i) => {
    const right = Math.round(((scored.axisTotals[i] + 16) / 32) * 100)
    return `${axis.left} ${100 - right} / ${axis.right} ${right}`
  }).join('\n')}\n\n8 of 8 answered. Fictional quiz at ${window.location.origin}/quiz`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('failed')
    }
  }

  const review = () => {
    setIndex(7)
    setDirection('back')
    setPhase('question')
  }

  const ghostCells = stripCells(answers, index, phase === 'result')

  return (
    <main id="main" className="quiz">
      <div className="quiz-margin" aria-hidden="true">
        <ol className="quiz-ghost-ribbon">
          {ghostCells.map((cell, cellIndex) => (
            <li
              key={cellIndex}
              className={`${cell.filled ? 'is-filled' : ''} ${phase === 'question' && cell.current ? 'is-current' : ''}`}
              style={{ '--cat': `var(--${cell.cat})` } as CSSProperties}
            />
          ))}
        </ol>
      </div>
      <div className="quiz-shell">
        <header className="quiz-top">
          <a className="quiz-brand" href="#top">
            <span className="quiz-brand__mark" aria-hidden="true">DT</span>
            <span>Data Type<small>A small quiz / fictional</small></span>
          </a>
          <nav className="quiz-nav" aria-label="Quiz navigation">
            {phase !== 'intro' && (
              <button className="quiz-nav__link" type="button" onClick={reset}>
                {resetArmed ? 'Press again to clear' : 'Clear answers'}
              </button>
            )}
            <a href="#how-it-works">How it works</a>
          </nav>
        </header>

        {phase === 'intro' && (
          <section className="quiz-intro rise" id="top" aria-labelledby="quiz-title">
            <div className="quiz-intro__copy">
              <p className="kicker">Eight questions / one data store</p>
              <h1 id="quiz-title" className="display">Which database are <em>you</em>?</h1>
              <p className="quiz-lede">
                A blunt, made-up personality test. Answer eight questions about how you
                handle data, failure and scale; get a data store, three axis readings and a
                share card. No sign-up.
              </p>
              <ul className="rule-labels kicker">
                <li>8 questions</li>
                <li>~2 minutes</li>
                <li>Saved in this browser</li>
              </ul>
              <div className="quiz-actions">
                <button className="button button--primary" type="button" onClick={start}>
                  Start the eight
                </button>
                <a className="button button--quiet" href="#how-it-works">How scoring works</a>
              </div>
              <p className="quiz-fine">
                This is not a recommendation tool. Results are a placeholder model built for
                the demo; no database was consulted.
              </p>
            </div>
            <div className="quiz-intro__specimen" aria-hidden="true">
              <span className="quiz-ghost">08</span>
              <div className="quiz-specimen">
                <p className="kicker">Specimen / result cards</p>
                <div className="quiz-specimen__bars">
                  {axes.map((axis) => (
                    <div key={axis.left}>
                      <span>{axis.left}</span><span>{axis.right}</span>
                      <i />
                    </div>
                  ))}
                </div>
                <div className="strip" style={{ '--n': 8 } as CSSProperties}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <i key={i} className={i < 5 ? 'is-filled' : ''} style={{ '--cat': `var(--${Object.values(profiles)[i % 5].tone})` } as CSSProperties} />
                  ))}
                </div>
                <p className="quiz-specimen__foot">A result card is part of the design, not an afterthought.</p>
              </div>
            </div>
          </section>
        )}

        {phase === 'question' && currentQuestion && (
          <section className="quiz-play rise" aria-labelledby="quiz-question-title">
            <ProgressStrip answers={answers} current={index} result={false} />
            <div className="quiz-play__layout">
              <div className={`quiz-question quiz-question--${direction}`} key={index}>
                <div className="quiz-question__head">
                  <p className="kicker">Question {String(index + 1).padStart(2, '0')} / 08</p>
                  <p className="meta">{currentQuestion.note}</p>
                </div>
                <h1 id="quiz-question-title" className="quiz-prompt">{currentQuestion.prompt}</h1>
                <div className="quiz-options" role="group" aria-labelledby="quiz-question-title">
                  {currentQuestion.options.map((option, optionIndex) => (
                    <button
                      key={option.label}
                      className="choice quiz-choice"
                      type="button"
                      style={{ '--cat': `var(--${option.tone})` } as CSSProperties}
                      onClick={() => choose(optionIndex)}
                    >
                      <span className="keycap">{optionIndex + 1}</span>
                      <span>
                        <span className="quiz-option__label">{option.label}</span>
                        <span className="quiz-option__detail">{option.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="quiz-question__foot">
                  <button className="button button--quiet button--sm" type="button" onClick={back} disabled={index === 0}>
                    ← Back
                  </button>
                  <span className="quiz-keyhint">Keys 1–3 choose. No answer is sent anywhere.</span>
                </div>
                {resumed && index === saved.length && (
                  <p className="quiz-resume">Picked up where you left off. Your previous answers are intact.</p>
                )}
              </div>

              <aside className="quiz-preview" aria-labelledby="preview-title">
                <div className="quiz-preview__head">
                  <p className="kicker">Live read / provisional</p>
                  <span className="tag">{totalAnswered} / 8</span>
                </div>
                <h2 id="preview-title" className="quiz-preview__title">
                  {enough ? profile.name : 'Not enough answers yet.'}
                </h2>
                <p className="quiz-preview__body" aria-live="polite">
                  {enough
                    ? `${profile.role}. Leading with ${leader.score} points from ${totalAnswered} answers. Provisional until all eight.`
                    : `${Math.max(0, 4 - totalAnswered)} more ${4 - totalAnswered === 1 ? 'answer' : 'answers'} to get a reading.`}
                </p>
                <ol className="quiz-mini-scores">
                  {ranked.slice(0, 3).map((entry) => (
                    <li key={entry.db}>
                      <span>{profiles[entry.db].name}</span>
                      <span className="quiz-mini-scores__meter" aria-hidden="true"><i style={{ width: `${(entry.score / Math.max(1, leader.score)) * 100}%` }} /></span>
                      <b>{entry.score}</b>
                    </li>
                  ))}
                </ol>
                <p className="quiz-preview__note">
                  Scores are sums of option weights. They are not a real assessment. Your
                  answers stay in this browser.
                </p>
              </aside>
            </div>
          </section>
        )}

        {phase === 'result' && (
          <section className="quiz-result rise" aria-labelledby="result-title">
            <div className="quiz-result__main">
              <div className="quiz-result__head">
                <p className="kicker">Result / eight answers</p>
                <span className="stamp">Queried</span>
              </div>
              <h1 id="result-title" className="display quiz-result__title">
                You are <span className="nowrap"><em>{profile.name}</em>.</span>
              </h1>
              <p className="quiz-result__role">
                {profile.role}{tie ? `, tied with ${profiles[tie].name}` : ''}.
              </p>
              <p className="quiz-result__blurb">{profile.blurb}</p>
              <div className="quiz-result__meta">
                <span><b>{leader.score}</b> / 16 demo points</span>
                <span><b>8</b> / 8 answered</span>
                <span><b>{tie ? 'Tie' : 'Clear'}</b> reading</span>
              </div>

              <div className="quiz-result__axes">
                <div className="quiz-result__axes-head">
                  <h2 className="section-title">The three axes</h2>
                  <p className="meta">Bars are built from the same answers as the result.</p>
                </div>
                <BipolarBars totals={scored.axisTotals} />
              </div>

              <div className="quiz-result__actions">
                <button className="button button--primary" type="button" onClick={copy}>
                  {copyState === 'copied' ? 'Copied result text' : copyState === 'failed' ? 'Copy failed — select the card' : 'Copy result text'}
                </button>
                <button className="button" type="button" onClick={review}>Review answers</button>
                <button className="button button--quiet" type="button" onClick={reset}>
                  {resetArmed ? 'Press again to clear' : 'Start over'}
                </button>
              </div>
              <p className="quiz-fine">
                Fictional quiz. The result is a blunt scoring model, not advice. Nothing was
                sent or saved outside this browser.
              </p>
            </div>

            <aside className="quiz-share" aria-labelledby="share-title">
              <div className="quiz-share__head">
                <h2 id="share-title" className="section-title">Share card</h2>
                <span className="tag">real values / demo model</span>
              </div>
              <ShareCard profile={profile} totals={scored.axisTotals} answers={answers} tie={tie} />
              <p className="quiz-share__note">
                This card contains only the result you just earned. The URL below is local to
                this demo.
              </p>
            </aside>
          </section>
        )}

        <section id="how-it-works" className="quiz-how" aria-labelledby="how-title">
          <div>
            <p className="kicker">Method / no theatre</p>
            <h2 id="how-title" className="section-title">How scoring works</h2>
          </div>
          <p>
            Each option adds points to one or more data stores and nudges three axes. The
            store with the most points is the result; a tie is reported as a tie. The share
            card repeats the same numbers. There is no hidden second analysis pass.
          </p>
        </section>

        <footer className="quiz-footer">
          <span>Data Type / fictional quiz / eight questions</span>
          <span>No database was consulted</span>
        </footer>
      </div>
    </main>
  )
}
