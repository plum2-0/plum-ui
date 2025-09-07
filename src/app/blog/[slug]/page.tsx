import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import { getPostBySlug, posts } from "../posts";
import styles from "../post.module.css";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Plum Blog",
      description: "The requested blog post could not be found.",
    };
  }

  const baseUrl = "https://plumsprout.com";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | Plum - Reddit Marketing Intelligence`,
    description: post.seoDescription || post.excerpt || post.title,
    keywords: post.keywords?.join(", "),
    authors: post.author
      ? [{ name: post.author.name }]
      : [{ name: "Plum Team" }],
    creator: "Plum",
    publisher: "Plum",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.seoDescription || post.excerpt || post.title,
      url: canonicalUrl,
      siteName: "Plum",
      images: [
        {
          url: post.ogImage || `${baseUrl}${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      authors: post.author ? [post.author.name] : ["Plum Team"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDescription || post.excerpt || post.title,
      site: "@plum_hq",
      creator: "@plum_hq",
      images: [post.ogImage || `${baseUrl}${post.image}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema?.tagNames || []),
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
};

const PMF_CONTENT = `
## The D.E.C. Framework: Discover → Engage → Convert

A senior-level, field-tested guide to landing your first 100 customers from Reddit

Reddit isn’t a billboard—it’s a dense grid of micro-communities where people solve specific problems in public. Treat it like a live, searchable customer-interview pipeline and it becomes the highest-leverage engine for early customers you’ll run. The D.E.C. framework—Discover, Engage, Convert—is a tight, three-step operating model I use with founders and small teams to turn threads into trials and trials into paying users without spam or gray-hat tricks.

---

## 1) DISCOVER — Locate high-intent conversations, not just high-traffic subreddits

Discovery starts by translating your product’s value into the language your prospects already use when they complain, compare tools, and ask for workarounds. Write 3–5 problem statements as direct user quotes (e.g., “Zapier is getting too expensive for basic automations,” “Clients ghost invoices; I need a polite nudge that actually works”). Build keyword clusters around those quotes (synonyms, adjacent tools, failure modes) and run them daily through Reddit’s native search plus site:reddit.com on Google. Prioritize threads that score on recency (last 3–30 days), specificity (clear context), and stakes (time, money, reputation).

### 1.1 Problem Space → Keyword Taxonomy (5 Categories)

Think of a prospect’s situation as five parts you can mix into precise queries: Symptoms, Situations, Stack, Attempts, Decisions. Combine 2–3 per search to collapse noise and surface high intent.

| Category | What to capture | Examples (copy into a “phrase bank”) | Query stems (mix & match) |
|---|---|---|---|
| Symptoms | Raw pain language | “too expensive”, “keeps breaking”, “manual”, “rate limited”, “ghosting invoices”, “SPF failing” | "too expensive" OR "pricing is insane"; "manual" OR "copy paste" |
| Situations | Persona, scale, timing, industry | freelancer, agency, nonprofit, seed stage, Q4, renewal, HIPAA, EU VAT | freelance OR "solo founder"; "renewal" OR "license expiring" |
| Stack | Named tools, APIs, features | Zapier, Make, n8n, Shopify, Stripe, GA4, Webhooks, UTM, CSV, Pixel | "zapier" AND (pricing OR alternative); "shopify" AND ("csv export" OR bulk) |
| Attempts | Workarounds tried | script, cron, csv export, regex, apps script, “Make scenario”, “n8n flow” | "workaround" OR "script"; "retry logic" OR "rate limit" |
| Decisions | Comparison / constraints | alternative, vs, switch, migrate, self-hosted, open source, GDPR, SOC2, SLA, seat pricing | title:(alternative OR "vs"); "self-hosted" OR "open source" |

Operator toolkit: exact phrase "...", native subreddit:, title:"..."; OR groups (a OR b); exclusions -hiring -homework; add time filters (“past month”) in Reddit UI; on Google stick to site:reddit.com.

Composite examples to save:

- Symptom + Stack + Decision: title:"too expensive" (zapier OR "zap") (alternative OR switch) site:reddit.com
- Symptom + Situation + Attempt: "late invoices" (freelance OR solo) ("email template" OR "polite nudge" OR script) site:reddit.com
- Stack + Attempt + Constraint: ("shopify" AND "csv export") (bulk OR inventory) (GDPR OR "data retention") site:reddit.com

### 1.2 Score Subreddits by Fit (keep 6–10 “home” subs)

Don’t chase size. Score by Lead Density × Rules Leniency × Relevance (1–5 each). A 200k-member, rule-friendly niche sub with weekly, high-signal threads beats a 5M-member generalist sub that bans practical links.

| Subreddit | Lead Density | Rules Leniency | Relevance | Fit |
|---|---:|---:|---:|---:|
| r/freelance | 5 | 4 | 5 | 14 |
| r/smallbusiness | 4 | 4 | 5 | 13 |
| r/marketing | 3 | 2 | 4 | 9 |
| r/zapier | 4 | 3 | 4 | 11 |
| r/Shopify | 3 | 3 | 4 | 10 |

Lead Density signals: recurring “how do I…” posts, pain rants, “is there a tool for…”, comparisons, workaround threads.

### 1.3 Qualify Threads Fast (the Q-P-C pass)

Open a candidate thread and scan for: Quote (copy-able pain line), Pain (stakes are real), Context (enough stack/situation to prescribe steps). If 2 of 3 are present, engage. Otherwise skip.

### 1.4 Lightweight Signals Sheet (your discovery CRM)

Track: Date • Subreddit • Link • Pain Quote • Persona • Stack • Fit (1–5) • Status (Ignore / Engage / Follow-Up). Patterns you see after a week become your standard prospecting routes and later your onboarding presets.

---

## 2) ENGAGE — Be the most useful person in the room, with transparent intent

Your job is to be unreasonably helpful in public. Reply like a practitioner who happens to build a tool—not a vendor hunting clicks. Lead with the user’s language and offer a fix that works even without your product; then disclose affiliation plainly.

### 2.1 Comment Anatomy (the 2–2–1 rule)

- 2 lines of empathy that mirror the poster’s words
- 2 concrete steps they can do today with their current stack
- 1 optional tool note + disclosure (plain, non-pushy)

Drop-in template:

You’re not overreacting—late invoices wreck runway.

What works today:
- Send a “polite nudge” 3 days before due + 3 days after (I can share my copy).
- Add a “paid” label so replies don’t get buried.

FWIW I built a lightweight nudge tool that automates those two steps. Happy to share a 60s walkthrough if useful. Want the templates?

### 2.2 Five Engagement Patterns that Win

- Recipe — 3–5 steps + expected result.
- Trade-off Table — pros/cons of options already mentioned.
- Tiny Script/Template — copy-paste value in-thread.
- Decision Tree — “If solo → A; 5–20 team → B.”
- Mini Case — “After X we saw 37% faster replies (n=14).”

### 2.3 DM Etiquette & Cadence

DM only when invited (or rules permit). First DM delivers the promised asset—no pitch. Follow up once at 48–72h with a concise nudge anchored to their goal (“Did the nudge copy speed up payments? If not, send a screenshot—I’ll record a 1-min fix.”). This cadence respects norms and builds reputation.

### 2.4 Tone, Ethics, and Reuse

Disclose every time you reference your product; never astroturf; don’t carpet-paste the same reply. Turn winning replies into reusable patterns (trade-off, decision tree, post-mortem). Over time you’ll build a library mapped to problem archetypes.

---

## 3) CONVERT — Remove friction, prove value fast, follow up like a human

Reddit conversion is won in the first 60 seconds after the click. Your landing must feel like a continuation of the help you gave, not a trap.

### 3.1 “Reddit Mode” Landing Page (10-point checklist)

- Loads in <2s on mobile
- One-sentence promise in user words
- Transparent pricing (or “free forever / paid for teams”)
- No forced signup to watch demo/read docs
- 60-sec demo; time-to-value < 60s post-signup
- Pre-filled example tailored to the thread’s context (e.g., “Freelance invoice nudge”)
- Clear refund/guarantee line
- UTM on all Reddit links
- Optional: “Found us via r/freelance?” preset
- Email-less trial if possible

### 3.2 Offer Ladder (ethical & effective)

- Free helper (template/checklist) → immediate win
- Interactive help (10-min teardown; office hours)
- Trial with preset that mirrors their thread (one click to value)

### 3.3 Minimal Metrics to Hit 100 Customers

| Stage | Target (solo founder pace) | What to adjust if low |
|---|---|---|
| Helpful comments posted | 200–300 in 4 weeks (10–15/day) | Specificity, pattern match |
| Comment → Click/DM | 10–20% | Offer clarity, asset relevance |
| Click/DM → Trial | 40–60% | Landing friction, preset fit |
| Trial → Paid | 40–60% | Time-to-value, follow-up quality |

Fix in order: comment specificity → onboarding friction → time-to-value → follow-up.

### 3.4 Follow-Up Playbook (copy this)

- T+5 min: Deliver asset promised in-thread + 60s setup.
- T+48–72h: 1-min Loom addressing their likely snag; one micro-CTA.
- T+7 days: Outcome check (“Did invoices clear faster?”) → offer help or bow out.

---

## A 21-Day D.E.C. Sprint (summary)

| Phase | Focus | Daily/Weekly Actions |
|---|---|---|
| Days 1–3 | Discover | Build taxonomy; pick 6–10 home subs; seed 8–10 non-promo helpful comments |
| Days 4–10 | Engage | 10 helpful comments/day using 2–2–1; publish 3 micro-assets; log everything |
| Days 11–17 | Engage → Convert | Host office hours (if allowed); add Reddit presets to onboarding; invited DMs only |
| Days 18–21 | Convert → Scale | Double down on top 3 keyword × 2 sub pairs; compile “Best of Reddit” guide; optional tiny ad on that guide |

---

## Working Examples & Ready-to-Use Blocks

Trade-off table (paste into a comment):

Quick compare from what folks mentioned:

- Zapier — easiest to start; gets pricey at scale.
- Make — flexible scenarios; learning curve.
- n8n — cheapest/self-hosted; needs ops time.

If you’re <5 zaps/day → Zapier free is fine.
Weekly reports → Make shines.
Budget tight + dev handy → n8n wins.

FWIW, I built a prebuilt “invoice chaser” flow. Happy to share a 60s walkthrough if helpful.

Mod outreach (when rules are unclear):

Hi mods — OPs often ask about late invoice nudges. I have a 1-page checklist (no signup) that directly answers this. OK to share if I disclose I built a related tool?

First DM (after invite):

Here’s the invoice nudge template (copy → tweak names → done).
If you try it, this 60s walkthrough shows a one-click “auto-remind” version.
No pressure—curious if it helps by tomorrow; happy to adjust tone.

---

## Appendix: One-Page Discovery Worksheet

Use this once per sprint; it becomes your prospecting engine.

| Section | Target Count | Your Entries |
|---|---:|---|
| Symptoms (direct quotes) | 10–20 |  |
| Situations (persona, scale, timing, industry) | 8–12 |  |
| Stack (tools, APIs, features) | 15–30 |  |
| Attempts (workarounds) | 8–15 |  |
| Decisions (compares/constraints) | 10–15 |  |
| Saved searches (mix 2–3 categories each) | 15–25 |  |

---

## Closing Thought

Reddit rewards practitioners. If you run this D.E.C. loop with crisp discovery, generous public help, and a first-minute product experience that delivers value, you won’t need gimmicks to reach your first 100 customers—you’ll earn them thread by thread, with a reputation that compounds long after this sprint ends.
`;

const PCV_CONTENT = `
# What Is Product Concept Validation—and How to Do It Right?

A friendly, no-fluff playbook with a real brand example and a week-by-week plan.

---

## The one-line answer

Product concept validation is how you prove a specific idea (your concept) is desirable, clear, and valuable for a defined audience—before you invest months of design and engineering. In research circles it’s often called concept testing, and it’s used to assess viability ahead of launch.

> What you typically measure: interest/appeal, purchase or usage intent, clarity & believability, and how the concept stacks up against alternatives.

---

## The I.D.E.A.L. framework (insight → action)

A simple loop you can run in 2–3 weeks:

- **Insight** — Gather real, recent evidence of the problem in the wild.
- **Define** — Tighten your ICP, the Job-to-be-Done, and your riskiest assumptions.
- **Experiment** — Run tiny tests (fake door, mock, concierge/WoZ).
- **Assess** — Use behavioral metrics, not vibes.
- **Loop** — Decide: persevere, pivot, or pause; then run the next bet.

---

## A tangible example (with a real brand)

- **Brand**: Duolingo (illustrative only; hypothetical concept)
- **Concept**: Duo Interview Coach — guided, job-specific practice interviews for non-native English speakers inside Duolingo, with instant feedback on answers, tone, and fluency.

We’ll walk the concept through I.D.E.A.L. from insight to action. Numbers below are example thresholds and sample outcomes for illustration.

### 1) INSIGHT — Find the problem heat

**Where to look (fast):**

- Reddit communities (e.g., r/LearnEnglish, r/cscareerquestions, r/AskHR)
- App store reviews & support tickets (themes: confidence, speaking anxiety)
- LinkedIn/Discord groups for jobseekers and international students

**What to capture (verbatim > summary):**

- Triggers (“interview next week”, “visa timeline”, “accent confidence”)
- Workarounds (YouTube scripts, mirror practice, language partners)
- Outcome language (“sound natural”, “stop freezing”, “structure answers”)

Artifact: a lightweight “evidence board” that clusters quotes and counts repeats.

### 2) DEFINE — Sharpen the bet

**JTBD statement**

When international candidates have upcoming interviews (trigger), they want to practice realistic answers and get actionable feedback (job/outcome) without scheduling a tutor or guessing alone (constraints).

**ICP v1:** Students & early-career professionals in EN-as-L2 markets (e.g., India/SEA), interviewing for tech and service roles, 2–6 weeks pre-interview.

**Riskiest assumptions (top 3):**

1. Users prefer guided interview drills over generic speaking practice.
2. On-device feedback (no human tutor) feels accurate and encouraging.
3. Candidates will book sessions weekly in the run-up to an interview.

### 3) EXPERIMENT — Tiny tests, big learning

We’ll stack three lightweight tests over ~14 days.

| Test | What it is | Traffic source | Pass metric (behavioral) | Why it matters |
|---|---|---|---|---|
| Fake door LP | 1-screen page: “Interview Coach” | Reddit threads (mod-approved), email list, LI | ≥ 18–25% qualified opt-in | Validates desirability & message |
| Clickable mock | 2–3 Figma screens (STAR prompts, feedback view) | 5–8 target users (recorded calls) | ≥ 4/5 complete a drill in < 2 min | Validates flow & clarity |
| Concierge pilot (WoZ) | Manual feedback: users send answers; you annotate | 5–7 early users | ≥ 3 return for ≥ 2 weeks | Validates habit & repeat value |

Note: We’re testing behavior: clicks, callbacks, repeat usage. Not “sounds cool.”

### 4) ASSESS — Score like a scientist (not a fan)

**Scoring table**

| Signal | Metric | Green | Yellow | Red |
|---|---|---:|---:|---:|
| Desirability | LP opt-in (qualified) | ≥ 20% | 10–19% | < 10% |
| Clarity | Mock task completion | ≥ 80% | 60–79% | < 60% |
| Repeat value | Weekly sessions (pilot) | ≥ 3 users | 1–2 | 0 |
| Willingness to pay | Paid pilot acceptance | ≥ 5–10% | 2–4% | < 2% |

**Example results (hypothetical):**

- LP opt-in: 22% (n=210) → Green
- Mock completion: 6/7 users in < 2 min → Green
- Concierge: 4 users returned 2+ weeks → Green
- Pilot price test ($9/mo add-on): 8% acceptance → Green

Decision: Persevere. Build a Wizard-of-Oz MVP with automated prompts, manual feedback behind the scenes, and a weekly “coach plan” reminder.

### 5) LOOP — From insight to action in 14 days

- **Day 1–2: Insight**
  - Mine 40–60 recent posts/comments; extract 25–40 verbatims.
  - Cluster triggers, workarounds, outcome language.
- **Day 3–4: Define**
  - Lock ICP + JTBD + 3 riskiest assumptions.
  - Draft LP copy (headlines from verbatims).
- **Day 5–7: Experiment (v1)**
  - Launch LP (UTMs for source), invite small, relevant traffic.
  - Run 5 think-aloud mock tests; fix clarity issues same-day.
- **Day 8–10: Experiment (v2)**
  - Start concierge pilot with 5–7 users.
  - Track weekly sessions, qualitative feedback, objections.
- **Day 11–14: Assess & Decide**
  - Compare against thresholds, pick 1 next bet.
  - If green: WoZ MVP; if yellow: refine JTBD/audience; if red: pivot.

---

## The Concept Validation Toolkit (steal these)

### Riskiest Assumption Canvas

| Assumption | Why risky | Evidence so far | Test | Pass/Fail | Next |
|---|---|---|---|---|---|
| Users want guided drills | Might prefer tutors | 17 threads ask “how to practice answers” | LP + mock | ≥ 20% opt-in & 4/5 mock | Build WoZ |

### Experiment brief template

- **Objective:** Validate [assumption].
- **Audience:** [ICP]
- **Method:** [LP + mock / concierge]
- **Source:** [Reddit thread (mod OK) / email / LI]
- **Success:** [exact threshold]
- **If pass:** [next step]. **If fail:** [pivot action].

### 1-screen landing page outline

- [H1] Ace your next interview — practice real answers with instant feedback
- [Subhead] 10-minute drills. No tutor needed. Feel natural, not robotic.
- [Bullets] Structure answers (STAR), reduce filler, get clarity + tone hints
- [CTA] Get early access (email)
- [FAQ] “How accurate is feedback?” “Will it work offline?” “Pricing?”

### Outreach scripts (ethical & mod-friendly)

- **Public comment (no link unless allowed):**
  - “If it helps, I’m prototyping quick interview drills with instant feedback. Happy to share a 1-pager mock—no links unless ok with mods.”
- **DM (only after opt-in):**
  - “As promised—here’s a 90-second walkthrough. If you’ve got an interview this month, I can run a free practice and send feedback. Want to try it this week?”

---

## Common pitfalls (and fixes)

- **Collecting opinions, not behavior.**
  - Fix: Always pair interviews with a behavioral test (LP click, booking, repeat use).
- **Too-broad ICP.**
  - Fix: Pick one role + one trigger moment; expand after you find signal.
- **Overbuilding early.**
  - Fix: Concierge/WoZ the hard part; automate later.
- **Unclear concept copy.**
  - Fix: Borrow users’ words from your verbatims for headlines and benefits.
- **Ignoring non-buyers.**
  - Fix: Ask “What would make this a no-brainer?” and log objections for roadmap.
`;

const AGENCY_CONTENT = `
   # Why to Run Your Agency Marketing Strategy on Reddit

Reddit has quietly become one of the most durable places on the internet where real buyers narrate their problems, compare options, and report back on what actually worked. For agencies, that makes Reddit less of a “social channel” and more of a market sensor plus an earned‑media engine. This piece lays out why Reddit matters now, how it complements your current services, and practical ways to package it inside your offering.

---

## Why Reddit, and why now

- **Search is changing**: more queries start with “reddit” appended, and Google surfaces Reddit threads directly. Winning conversations on Reddit increasingly shows up in search, long after the thread cools.
- **Trust tax on ads**: audiences discount polished ads but reward specific, peer‑level answers. Reddit is built around that expectation of specificity.
- **Community as distribution**: category communities (and micro‑niches) form the closest thing to “owned attention” that brands don’t own. Agencies can broker access ethically.
- **Signal density**: comments reveal the language, objections, and alternatives people actually use—gold for creative, SEO, and positioning.

---

## What makes Reddit different from social and search

- **Intent without keywords**: people narrate situations (“migrating from X,” “stuck at Y”), not just type queries. This exposes problems earlier in the funnel.
- **Long half‑life**: valuable answers are upvoted and rediscovered for months. A single authoritative comment can return compounding brand impressions.
- **Opinionated governance**: moderators enforce norms. Done right, this becomes a moat—competitors who spam will get removed; helpful contributors are welcomed.

---

## Where Reddit fits inside an agency offering

Think of Reddit as a horizontal capability that powers existing service lines:

- **Strategy and research**: capture the client’s category language, objections, and comparison sets directly from threads. Feed this into positioning, SEO, CRO, and creative briefs.
- **Thought leadership and brand voice**: turn SMEs into credible contributors. Helpful, specifics‑first participation builds authority faster than polished blog posts.
- **Influencer and partner discovery**: identify super‑contributors and adjacent product advocates; collaborate on AMAs or co‑created guides.
- **Crisis and reputation**: monitor sentiment around launches, pricing, or outages; respond with context not corporate boilerplate.
- **SEO assist**: comments and guides that win upvotes become durable search artifacts; mine threads for long‑tail content and FAQs.

---

## Packaging and pricing (examples)

- **Listening & Insights Retainer** (lightweight): weekly digest of top threads, emerging pains, language to steal, and competitor mentions. Feeds the content calendar and ad testing.
- **Community Thought‑Leadership** (executional): represent the brand (or ghostwrite for SMEs) in priority subs; publish 2–4 authoritative comments and 1 mini‑guide per week; coordinate mod‑approved AMAs.
- **Launch Companion** (campaign): 4‑week spike during product/feature launch—pre‑brief mods, seed comparison checklists, staff office‑hours thread, capture objections into landing pages.

Deliverables map naturally to existing artifacts: research memos, creative briefs, SEO clusters, and case‑study fodder.

---

## How to talk outcomes (executive‑friendly)

- **Category share of voice on Reddit** (mentions, upvotes, comment velocity)
- **Qualified conversation capture** (threads where the brand gave/received a credible answer)
- **Language lift‑through** (terms from Reddit reused in ads/LPs that improve CTR or CVR)
- **Search echo** (threads ranking for target queries; referral traffic from Reddit to owned assets)
- **Pipeline assists** (sales anecdotes and attribution notes tied to threads)

These aren’t vanity metrics; they are leading indicators for lower CAC and faster creative iteration.

---

## Guardrails and ethics (your brand moat)

- Get mod guidance first; show you’ve read the sidebar.
- Lead with specifics; avoid “DM me” as a first move.
- Disclose affiliations; offer summaries before links.
- Treat sub rules as creative constraints, not obstacles.

Agencies that operate this way quickly become “the trusted helper,” not a vendor.

---

## What “good” looks like

- A CMO comment that becomes the canonical answer linked by others.
- An AMA that surfaces three killer objections you turn into a high‑performing FAQ page.
- A contributor partnership that yields a co‑authored rubric shared across the sub every time newcomers ask the same question.

---

## TL;DR

Reddit is where unfiltered demand, objections, and success stories live in public. Agencies can turn that into research, creative, authority, search lift, and lower CAC—without acting like advertisers. Package it as listening + thought leadership + launch support, measure share‑of‑voice and language lift‑through, and you’ve added a durable new lever to your client growth stack.
`;

function IdealFlowDiagram() {
  return (
    <div className="chart-card">
      <div className="label-muted mb-2">I.D.E.A.L. flow</div>
      <svg
        viewBox="0 0 880 160"
        width="100%"
        height="auto"
        role="img"
        aria-label="IDEAL framework flow"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(168,85,247,0.9)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.9)" />
          </linearGradient>
        </defs>
        {["Insight", "Define", "Experiment", "Assess", "Loop"].map(
          (label, i) => {
            const x = 20 + i * 170;
            return (
              <g key={label} transform={`translate(${x}, 30)`}>
                <rect
                  rx="12"
                  ry="12"
                  width="150"
                  height="60"
                  fill="url(#g1)"
                  opacity="0.9"
                />
                <rect
                  rx="12"
                  ry="12"
                  width="150"
                  height="60"
                  fill="#000"
                  opacity="0.15"
                />
                <text
                  x="75"
                  y="38"
                  textAnchor="middle"
                  fill="#fff"
                  fontWeight="700"
                  fontSize="14"
                >
                  {label}
                </text>
              </g>
            );
          }
        )}
        {[0, 1, 2, 3].map((i) => {
          const x = 20 + i * 170 + 150;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={60}
                x2={x + 20}
                y2={60}
                stroke="#fff"
                strokeOpacity="0.7"
                strokeWidth="2"
              />
              <polygon
                points={`${x + 20},60 ${x + 12},56 ${x + 12},64`}
                fill="#fff"
                fillOpacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PcvResultsChart() {
  // Values from the example results
  const data = [
    { label: "LP opt-in", value: 22, threshold: 20 },
    { label: "Mock completion", value: 86, threshold: 80 },
    { label: "WTP", value: 8, threshold: 5 },
  ];
  const width = 880;
  const height = 190;
  const left = 120;
  const right = 30;
  const chartWidth = width - left - right;
  const rowH = 40;
  return (
    <div className="chart-card">
      <div className="label-muted mb-2">
        Example results vs green thresholds
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        role="img"
        aria-label="Results vs thresholds"
      >
        {data.map((d, i) => {
          const y = 20 + i * rowH;
          const barW = (d.value / 100) * chartWidth;
          const thrX = left + (d.threshold / 100) * chartWidth;
          return (
            <g key={d.label}>
              <text x={10} y={y + 14} fill="#fff" opacity="0.9" fontSize="12">
                {d.label}
              </text>
              <rect
                x={left}
                y={y}
                width={chartWidth}
                height={12}
                fill="#000"
                opacity="0.18"
                rx={6}
              />
              <rect
                x={left}
                y={y}
                width={barW}
                height={12}
                fill="rgba(34,197,94,0.9)"
                rx={6}
              />
              <line
                x1={thrX}
                y1={y - 4}
                x2={thrX}
                y2={y + 16}
                stroke="#fff"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <text x={left + barW + 8} y={y + 11} fill="#fff" fontSize="11">
                {d.value}%
              </text>
              <text
                x={thrX + 6}
                y={y - 6}
                fill="#fff"
                fontSize="10"
                opacity="0.8"
              >
                {d.threshold}%
              </text>
            </g>
          );
        })}
        <g>
          <text
            x={10}
            y={20 + 3 * rowH + 22}
            fill="#fff"
            opacity="0.9"
            fontSize="12"
          >
            Repeat users
          </text>
          <rect
            x={left}
            y={20 + 3 * rowH}
            width={chartWidth}
            height={12}
            fill="#000"
            opacity="0.18"
            rx={6}
          />
          <rect
            x={left}
            y={20 + 3 * rowH}
            width={(3 / 6) * chartWidth}
            height={12}
            fill="rgba(168,85,247,0.9)"
            rx={6}
          />
          <text
            x={left + (3 / 6) * chartWidth + 8}
            y={20 + 3 * rowH + 11}
            fill="#fff"
            fontSize="11"
          >
            4 users (≥ 3 green)
          </text>
        </g>
      </svg>
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getPostBySlug(slug);
  if (!meta) return notFound();

  const isPMF = meta.slug === "validating-product-market-fit-on-reddit";
  const isPCV = meta.slug === "what-is-product-concept-validation";
  const isAgency = meta.slug === "agency-marketing-on-reddit";
  const content = isPMF
    ? PMF_CONTENT
    : isPCV
    ? PCV_CONTENT
    : isAgency
    ? AGENCY_CONTENT
    : "Coming soon.";

  const baseUrl = "https://plumsprout.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.seoDescription || meta.excerpt || meta.title,
    image: meta.ogImage || `${baseUrl}${meta.image}`,
    datePublished: meta.date,
    dateModified: meta.updatedAt || meta.date,
    author: {
      "@type": "Organization",
      name: meta.author?.name || "Plum",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Plum",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${meta.slug}`,
    },
    keywords: meta.keywords?.join(", "),
    articleSection: "Blog",
    wordCount: isPMF ? 2500 : isPCV ? 2000 : isAgency ? 1500 : 500,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".prose"],
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
        `,
        }}
      />

      <main className="relative z-10 mx-6 my-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="text-white/70 hover:text-white">
            ← Back to blog
          </Link>

          <article className="glass-card rounded-3xl overflow-hidden mt-4">
            <div className="relative w-full h-56 sm:h-64 md:h-80">
              <Image
                src={meta.image}
                alt={meta.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                {meta.title}
              </h1>
              <div className="text-white/60 text-sm mb-6">
                {new Date(meta.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className={`${styles.post} prose prose-invert max-w-none`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[[rehypeSanitize, SANITIZE_SCHEMA]]}
                >
                  {content}
                </ReactMarkdown>
                {isPCV && (
                  <div>
                    <IdealFlowDiagram />
                    <PcvResultsChart />
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}
