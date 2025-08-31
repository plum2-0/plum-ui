import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import { getPostBySlug, posts } from "../posts";
import styles from "../post.module.css";

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
# Validating Product–Market Fit on Reddit: A Field Guide for Builders

Most products fail because we validate *solutions* instead of validating *problems*. Reddit flips that dynamic. It’s where people confess frustrations in plain language, compare tools, and ask for help—at scale. Treat it like a living focus group and you can de-risk your roadmap *before* you write code.

This guide gives you a practical system to use Reddit for product validation: where to look, what to listen for, how to run lightweight experiments, and how to decide—persevere, pivot, or pause.

---

## 1) Build Your Validation Foundation

Think of your market in three layers:

- **Primary problem communities** — where your exact users hang out (e.g., r/freelance for a time-tracking tool).
- **Workflow neighbors** — adjacent spaces that reveal upstream/downstream pains (e.g., r/smallbusiness, r/consulting).
- **Outcome communities** — where users talk about the *result* they want (e.g., r/personalfinance for cash-flow tools).

Your goal: map problems → jobs-to-be-done → early hypotheses.

**Problem → JTBD → Hypothesis mapping**

| What you hear on Reddit | Underlying job | Testable hypothesis | What to build next |
|---|---|---|---|
| “I forget to log billable hours.” | *Capture work without thinking.* | Users will adopt passive time capture if they can edit later. | Prototype passive tracker + edit flow; measure edit completion & exports. |
| “Telehealth wait times are brutal.” | *Get care quickly when it matters.* | Users will pay for guaranteed 15-min slots at off-peak times. | Landing page + waitlist for “fast lane” scheduling; measure opt-in rate. |
| “Spreadsheet CRM is chaos.” | *Keep deals organized with minimal setup.* | Users will switch if onboarding stays under 10 minutes. | 3-step import wizard demo; time-to-first-value as key metric. |

---

## 2) Find the Right Conversations (Without Boiling the Ocean)

Prioritize communities by **volume × specificity × mod friendliness**.

| Community type | What it tells you | Examples | Priority |
|---|---|---|---|
| Problem-centric subs | Raw pain points & workaround hacks | r/freelance, r/startups, r/EntrepreneurRideAlong | ★★★★ |
| Tool/vendor subs | Feature gaps & migration moments | r/nocode, r/Notion, r/ObsidianMD | ★★★ |
| Role-based subs | Buying committee dynamics | r/sales, r/ops, r/ITManagers | ★★☆ |
| Outcome subs | Value language & success metrics | r/personalfinance, r/careerguidance | ★★☆ |

**Quick triage:** open top posts (last 30–90 days), sort by “Top” and “New,” scan for: “wish,” “struggle,” “workaround,” “alternatives,” “moved from X to Y,” “is there a tool that…”.

---

## 3) Turn Noise Into Signals (What to Actually Log)

Don’t collect *everything*. Code the conversation.

**Qualitative coding schema (simple, powerful):**

- **Problem theme:** onboarding friction, data import, pricing confusion, speed, reliability.
- **Trigger:** new job, new client, month-end, crisis, policy change.
- **Workaround:** spreadsheets, Zapier, manual scripts, “ask a friend.”
- **Switch moment:** vendor fail, price hike, team growth, new integration need.
- **Outcome language:** “faster,” “less stress,” “billable accuracy,” “fewer steps.”

**Capture structure (use a sheet or Notion):**

| URL | Subreddit | Quote (verbatim) | Code(s) | My interpretation | Hypothesis | Next action |
|---|---|---|---|---|---|---|

Two hours of disciplined coding beats ten hours of doom-scrolling.

---

## 4) Engage the Right Way (Earn Trust, Don’t Get Banned)

**Do**
- Ask clarifying questions: “What did you try? Where did it break?”
- Share neutral comparisons or decision frameworks.
- Offer a *no-link* summary of how you’d solve it and ask if helpful.
- When appropriate, invite opt-in: “Happy to DM a quick mockup if you’d like.”

**Don’t**
- Drop links without context (fastest path to removal).
- Astroturf or misrepresent affiliation.
- Debate moderators. If unsure, message mods and ask for guidelines.

**Comment patterns that work**
- *Diagnostic follow-up:* “If you had a magic button here, what would it do?”
- *Trade-off framing:* “Speed vs. accuracy—what matters more for you?”
- *Mini-prototype in text:* “Imagine a button that auto-captures time when VS Code is active; you can edit before invoice—helpful or annoying?”

---

## 5) Run Lightweight Experiments (The Validation Ladder)

Move up the ladder only when the prior rung shows signal.

1) **Concept comment** (zero build)  
   - *Goal:* Gauge resonance.  
   - *Signal:* Replies asking for specifics; users volunteering use cases.

2) **Screenshot/micro-prototype** (Figma or text mock)  
   - *Goal:* Validate *how* it should work.  
   - *Signal:* Users debating details; “When can I try this?”

3) **One-screen landing page**  
   - *Goal:* Measure intent.  
   - *Signal:* Email opt-ins ≥ 15–25% from relevant traffic.

4) **Concierge test** (manual service behind the scenes)  
   - *Goal:* Validate willingness to *depend* on you.  
   - *Signal:* 2–5 users ask you to run it again next week.

5) **Wizard-of-Oz MVP** (fake the hard part)  
   - *Goal:* Validate repeatable usage.  
   - *Signal:* 3+ consecutive weeks of usage by the same user(s).

---

## 6) Measure Intent, Not Vanity

**Signal > Metric > Thresholds**

| Signal | Metric | Green | Yellow | Red |
|---|---|---:|---:|---:|
| Resonance | Comment reply rate to your concept | ≥ 20% | 10–19% | < 10% |
| Problem intensity | “I’ve tried 3+ tools” mentions | Frequent | Occasional | Rare |
| Willingness to switch | Waitlist opt-in (qualified traffic) | ≥ 20% | 10–19% | < 10% |
| Dependence | Repeat concierge usage (3 wks) | 3+ users | 1–2 users | 0 |
| Value clarity | “When can I pay/try?” DMs | Weekly | Monthly | Never |

Numbers are heuristics—direction matters more than precision.

---

## 7) A 14-Day Operating Cadence for Agencies

- **Days 1–2: Discover** → shortlist 8–12 subreddits by ICP and service line
- **Days 3–4: Synthesize** → create 3 value props per service (copy + proof)
- **Days 5–7: Engage** → 10 thoughtful comments; 2 case‑study teardowns
- **Days 8–10: Experiment** → one‑screen CTA per service; book calls
- **Days 11–14: Decide** → double‑down on the highest‑intent thread styles

---

## Proven playbooks that win on Reddit (for agencies)

- **Problem teardown**: deconstruct a post and share the 3‑step fix (no links)
- **Side‑by‑side comparison**: neutral rubric for tools/approaches, invite DMs
- **Before/after audit**: show 3 screenshots of a micro‑improvement (on request)
- **Office hours**: offer 20‑min async advice in a thread, gather patterns

---

## Example calendar (B2B lead‑gen agency)

| Day | Thread type | Goal |
|---|---|---|
| Tue | Problem teardown | Earn trust; get specifics |
| Thu | Comparison rubric | Identify high‑intent buyers |
| Sat | Audit preview | Book 2 intro calls |

---

## TL;DR

Reddit can be your highest‑signal channel if you play long‑game trust: log problems, respond with useful specifics, and test tiny offers that lead to booked calls.
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
      <svg viewBox="0 0 880 160" width="100%" height="auto" role="img" aria-label="IDEAL framework flow">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(168,85,247,0.9)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.9)" />
          </linearGradient>
        </defs>
        {["Insight","Define","Experiment","Assess","Loop"].map((label, i) => {
          const x = 20 + i * 170;
          return (
            <g key={label} transform={`translate(${x}, 30)`}>
              <rect rx="12" ry="12" width="150" height="60" fill="url(#g1)" opacity="0.9" />
              <rect rx="12" ry="12" width="150" height="60" fill="#000" opacity="0.15" />
              <text x="75" y="38" textAnchor="middle" fill="#fff" fontWeight="700" fontSize="14">{label}</text>
            </g>
          );
        })}
        {[0,1,2,3].map((i) => {
          const x = 20 + i * 170 + 150;
          return (
            <g key={i}>
              <line x1={x} y1={60} x2={x+20} y2={60} stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
              <polygon points={`${x+20},60 ${x+12},56 ${x+12},64`} fill="#fff" fillOpacity="0.8" />
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
      <div className="label-muted mb-2">Example results vs green thresholds</div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" role="img" aria-label="Results vs thresholds">
        {data.map((d, i) => {
          const y = 20 + i * rowH;
          const barW = (d.value / 100) * chartWidth;
          const thrX = left + (d.threshold / 100) * chartWidth;
          return (
            <g key={d.label}>
              <text x={10} y={y + 14} fill="#fff" opacity="0.9" fontSize="12">{d.label}</text>
              <rect x={left} y={y} width={chartWidth} height={12} fill="#000" opacity="0.18" rx={6} />
              <rect x={left} y={y} width={barW} height={12} fill="rgba(34,197,94,0.9)" rx={6} />
              <line x1={thrX} y1={y-4} x2={thrX} y2={y+16} stroke="#fff" strokeDasharray="4 3" opacity="0.8" />
              <text x={left + barW + 8} y={y + 11} fill="#fff" fontSize="11">{d.value}%</text>
              <text x={thrX + 6} y={y - 6} fill="#fff" fontSize="10" opacity="0.8">{d.threshold}%</text>
            </g>
          );
        })}
        <g>
          <text x={10} y={20 + 3 * rowH + 22} fill="#fff" opacity="0.9" fontSize="12">Repeat users</text>
          <rect x={left} y={20 + 3 * rowH} width={chartWidth} height={12} fill="#000" opacity="0.18" rx={6} />
          <rect x={left} y={20 + 3 * rowH} width={(3 / 6) * chartWidth} height={12} fill="rgba(168,85,247,0.9)" rx={6} />
          <text x={left + (3 / 6) * chartWidth + 8} y={20 + 3 * rowH + 11} fill="#fff" fontSize="11">4 users (≥ 3 green)</text>
        </g>
      </svg>
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getPostBySlug(slug);
  if (!meta) return notFound();

  const isPMF = meta.slug === "validating-product-market-fit-on-reddit";
  const isPCV = meta.slug === "what-is-product-concept-validation";
  const isAgency = meta.slug === "agency-marketing-on-reddit";
  const content = isPMF ? PMF_CONTENT : isPCV ? PCV_CONTENT : isAgency ? AGENCY_CONTENT : "Coming soon.";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.3), transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.2), transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A0B2E 25%, #2D1B3D 50%, #1E293B 75%, #0F172A 100%)
        `,
      }} />

      <main className="relative z-10 mx-6 my-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="text-white/70 hover:text-white">← Back to blog</Link>

          <article className="glass-card rounded-3xl overflow-hidden mt-4">
            <div className="relative w-full h-56 sm:h-64 md:h-80">
              <Image src={meta.image} alt={meta.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              <h1 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                {meta.title}
              </h1>
              <div className="text-white/60 text-sm mb-6">
                {new Date(meta.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </div>
              <div className={`${styles.post} prose prose-invert max-w-none`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, SANITIZE_SCHEMA]]}>
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