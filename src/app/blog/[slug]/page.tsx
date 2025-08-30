import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
// @ts-ignore - defaultSchema is provided by rehype-sanitize deps
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
# What is Product Concept Validation (and how to do it right)?

Great teams don’t “ship and hope.” They validate concepts quickly with real users, real problems, and real signals—before committing months of build time.

This guide breaks down what concept validation is, when to use it, which signals matter, and a step‑by‑step playbook you can reuse.

---

## What is concept validation?

A lightweight process to test whether a proposed solution (the “concept”) solves a real problem for a real audience—in a way they understand and want.

- **Goal:** reduce uncertainty before build
- **Output:** a clear go / refine / no‑go decision
- **Scope:** problems, audience, value props, core workflow—not full features

---

## When should you validate?

Validate concepts when any of these are true:

- New product or 0→1 feature
- New audience or use case
- Core workflow change that affects activation or retention

If you already have strong usage/retention on the job-to-be-done, you’re beyond concept validation—measure impact instead.

---

## Signals that matter (and what to ignore)

| Signal | Why it matters | Green | Yellow | Red |
|---|---|---:|---:|---:|
| Clarity of problem | Users articulate pains without prompting | Specific and repeated | Vague or scattered | No consistent pain |
| Resonance | Users respond to the concept and ask “how would it work?” | Frequent follow‑ups | Occasional interest | Crickets |
| Intent | Users join a waitlist, book a call, or share data | ≥ 20% from qualified traffic | 10–19% | < 10% |
| Dependence | Users request to use it again (concierge) | 3+ repeat users | 1–2 | 0 |

Ignore vanity signals like likes or generic “cool idea” comments—they rarely translate to adoption.

---

## The 6‑step concept validation playbook

1. **Define the job-to-be-done**  
   - Who is the user? When does the pain spike? What outcome do they want?
2. **Draft 2–3 sharp value props**  
   - Write one‑line promises that anchor the concept.
3. **Create a micro‑prototype**  
   - One screen (Figma or text mock) showing how it works.
4. **Run the concept test**  
   - Share in relevant communities or interviews; collect objections and must‑haves.
5. **Measure intent**  
   - Simple landing page or Calendly; capture waitlist/booking rate.
6. **Decide and next step**  
   - If signals are green on problem + intent, scope a Wizard‑of‑Oz MVP.

---

## Lightweight experiments you can run this week

- Concept post with decision framework (no links; ask for feedback)
- 1‑pager mock with three screens; ask users to narrate usage
- Concierge offer for a single workflow (you do it manually)
- “Swap test” landing page with two value props; measure which wins

---

## Common pitfalls

- Validating the solution name or UI, not the underlying job
- Over‑collecting feedback; under‑measuring intent
- Asking leading questions; not logging quotes verbatim
- Ignoring moderator guidelines in communities (and getting banned)

---

## A reusable checklist

- Target audience and job-to-be-done written clearly
- 2–3 value props mapped to pains
- One micro‑prototype ready
- Channel list (where the audience hangs out)
- Success thresholds defined up‑front (intent, dependence)
- A decision date on the calendar

---

## TL;DR

Concept validation = fast learning about real problems and real intent. Keep it lightweight, measure signals, and only graduate to build when users vote with time or access—not just opinions.
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const meta = getPostBySlug(params.slug);
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