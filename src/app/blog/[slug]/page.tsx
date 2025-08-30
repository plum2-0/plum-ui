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

## 7) A 14-Day Operating Cadence (Minimal but Powerful)

**Days 1–2: Discover**
- Select 6–10 target subs and log 40–60 recent posts/comments.

**Days 3–4: Synthesize**
- Code themes, draft 3–5 crisp hypotheses.

**Days 5–7: Engage**
- Post 6–10 thoughtful comments across threads.
- Offer one mini-prototype (screenshot or text mock).

**Days 8–10: Experiment**
- Ship a one-screen landing page for your top hypothesis.
- Invite opt-ins only when contextually relevant.

**Days 11–14: Decide**
- Review signals vs. thresholds.
- Double down on 1 hypothesis, pivot, or pause.

Repeat the cycle weekly until a single hypothesis clearly outperforms.

---

## 8) Example Walkthrough: “Passive Time Tracking for Freelancers”

**Discovery:** In r/freelance and r/consulting, 17 threads in 90 days mention “forgetting to log hours” and “manual time sheets.”  
**Hypothesis:** If time is captured passively and is easy to edit, freelancers will export invoices weekly.

**Experiments & signals**
- Concept comment reply rate: **26%** (green).  
- Figma mock posted with mod permission: **14 comments**, 6 specific UX requests.  
- Landing page: 22% opt-in from Reddit traffic (n=213).  
- Concierge test: 4 users emailed CSV exports two weeks in a row.

**Decision:** Build Wizard-of-Oz MVP; focus on the edit flow (users feared “false positives” in tracking).

---

## 9) Tooling That Works in the Real World

- **Listening:** Saved searches, subreddit filters, keyword variants, flair patterns.
- **Coding & synthesis:** Spreadsheet/Notion with the schema above.
- **Lightweight experiments:** Figma/Canva for mocks; simple landing page (one headline, one benefit, one CTA).
- **Automation (when ready):** Use a Reddit listening tool to centralize keywords, surface high-intent threads, and track outcomes (comments, replies, waitlist sign-ups).  
  *If you’d rather not stitch this by hand, our platform bundles listening + outreach workflows built for exactly this use case.*

---

## 10) Comment & DM Scripts (Ethical, High-Signal)

**Clarifier (public):**  
> Thanks for sharing this—what breaks first for you: capturing time, editing, or invoicing? If a tool auto-captured and let you bulk-edit in 2 minutes, helpful or risky?

**Opt-in (public):**  
> I’m prototyping a simple version of this. Happy to share a 1-pager mock if mods/users are interested—no links unless ok with mods.

**DM (only after explicit opt-in):**  
> As promised—here’s the 1-pager with 3 screenshots. If any of this feels useful, I can set up a manual export for your next invoice to see if it saves time.

---

## 11) The 5-Slide Validation Brief (for your team or investors)

1. **Users & moments:** who they are, when the pain spikes.  
2. **Top 3 problems (verbatim):** quotes from Reddit.  
3. **What they hire a tool to do:** the job, not features.  
4. **Experiments & signals:** what we tested, what we saw.  
5. **Decision & next bet:** what we’ll build/measure next 14 days.

If a stakeholder can’t understand your case in five slides, your evidence isn’t tight enough yet.

---

## 12) Decision Tree (Persevere / Pivot / Pause)

- **Persevere** if two or more green signals show up within 14–28 days.  
- **Pivot** if resonance is high but intent is low → refine job or audience.  
- **Pause** if after two cycles you only see red/yellow—ship a different hypothesis.

---

## TL;DR

Use Reddit to validate *problems*, not just *solutions*. Code conversations, climb the validation ladder with tiny experiments, measure intent over vanity, and operate in 14-day loops. When the same users keep coming back—even to a concierge workflow—you’ve got a live signal worth building around.

---

*Want to automate the listening, shortlist high-intent threads, and run ethical outreach from one place? That’s exactly what our platform does—purpose-built for product validation on Reddit.*
---
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const meta = getPostBySlug(params.slug);
  if (!meta) return notFound();

  const isPMF = meta.slug === "validating-product-market-fit-on-reddit";
  const isPCV = meta.slug === "what-is-product-concept-validation";
  const content = isPMF ? PMF_CONTENT : isPCV ? PCV_CONTENT : "Coming soon.";

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