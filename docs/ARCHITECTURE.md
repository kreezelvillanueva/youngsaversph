# Young Savers PH: Architecture

Status: spec for the rebuild. Owners: **Lead** (team lead), **A** (products), **B** (advisor + contact), **C** (blog + redirects), **QA**, **Migrator** (content migration, already running).
Stack: Astro 7.3.5 (already in `package.json`) with static output, hosted on Vercel, DNS in Cloudflare.

---

## 0. Ground rules for parallel work

1. Lead merges the foundation (sections 2, 3, 4 and 5) to `main` first. Devs branch from that commit: `git worktree add ../ysph-a -b feat/products`, then `feat/advisor-contact`, then `feat/blog-redirects`.
2. **Each dev edits only the files they own (section 2).** Shared files are Lead-only. If a shared file needs a change, ask Lead. Lead commits it to `main` and the dev rebases.
3. **No new dependencies.** Only Lead touches `package.json` and `package-lock.json`. Lead installs every dependency up front.
4. Styling: use scoped `<style>` in your own page and only `var(--…)` from `tokens.css`. Don't add global CSS, fonts or colors.
5. Write every internal link with a trailing slash (`/contact/`). The config sets `trailingSlash: 'always'`, and dev mode returns a 404 for a link without the slash.
6. Run dev servers on separate ports: `npm run dev -- --port 4321` (A), `4322` (B), `4323` (C).

---

## 1. Sitemap and URLs

```
/                               Home
/products/med-assist/           AIA Med Assist            ┐
/products/critical-protect-100/ AIA Critical Protect 100  ├ "Products" dropdown
/products/all-in-one/           AIA All-In-One            ┘
/become-an-advisor/             Become an Advisor
/blog/                          Blog index
/blog/<slug>/                   Blog post (slug = old Blogger filename without .html)
/contact/                       Contact: #book (Calendly), #message (form)
/privacy/                       Privacy Policy (text in src/legal/privacy.md; linked from footer and contact form)
/404.html                       Not found
/sitemap-index.xml              generated
/robots.txt                     static
```

| New URL | Source | Owner |
|---|---|---|
| `/` | `migration/scratch/home.html` (hometext.txt) | Lead |
| `/products/med-assist/` | `migration/products/med-assist.md` (includes the FAQ page) | A |
| `/products/critical-protect-100/` | `migration/products/critical-protect-100.md` | A |
| `/products/all-in-one/` | home.html "Get 4 protection in one plan" section only (see Risks) | A |
| `/become-an-advisor/` | `migration/pages/become-an-advisor.md` | B |
| `/contact/` | `migration/pages/contact.md` | B |
| `/blog/`, `/blog/<slug>/` | `src/content/blog/*.md` (7 posts) | C |

The 7 blog slugs are `health-link`, `aia-philam-life-first-ever-that-goes`, `importance-of-insurance`, `insurance-vs-hmo`, `do-you-know-what-protection-youre`, `3-building-blocks-to-powerful-emergency` and `blog-post`. The last one is "The 4 Financial Blind Spots"; the ugly slug comes from the fixed convention and is kept.

---

## 2. File tree and owners

```
/
├─ AGENTS.md, CLAUDE.md, PRODUCT.md, README.md   Lead
├─ docs/ARCHITECTURE.md                          Lead
├─ package.json, package-lock.json               Lead
├─ astro.config.mjs, tsconfig.json               Lead
├─ vercel.json                                   Dev C
├─ playwright.config.ts                          QA
├─ tests/*.spec.ts                               QA
├─ migration/**                                  Migrator (read-only for everyone else)
├─ public/
│  ├─ favicon.svg, robots.txt                    Lead
│  ├─ images/site/**                             Lead (advisor photo, badge, og-default.jpg)
│  ├─ images/blog/<slug>/**                      Migrator, then Dev C
│  └─ images/products/<slug>/**                  Dev A (new images only; existing ones stay in images/blog/med-assist etc.)
└─ src/
   ├─ content.config.ts                          Lead
   ├─ data/site.ts                               Lead
   ├─ styles/tokens.css                          Lead (from the Impeccable pass)
   ├─ styles/global.css                          Lead (reset, base type, .container, .button, .prose, .visually-hidden)
   ├─ layouts/Base.astro                         Lead
   ├─ components/Header.astro                    Lead
   ├─ components/Footer.astro                    Lead
   ├─ components/BookingCTA.astro                Lead
   ├─ components/CalendlyEmbed.astro             Lead
   ├─ content/blog/*.md                          Migrator, then Dev C
   ├─ content/products/*.md                      Dev A
   └─ pages/
      ├─ index.astro                             Lead (replaces the current scaffold)
      ├─ products/[slug].astro                   Dev A
      ├─ become-an-advisor.astro                 Dev B
      ├─ contact.astro                           Dev B (form + its JS inline, no separate component)
      ├─ blog/index.astro                        Dev C
      ├─ blog/[slug].astro                       Dev C
      └─ 404.astro                               Dev C
```

`migration/url-map.json` is produced by the Migrator and consumed by Dev C and QA.

### Lead setup

- `npm i @astrojs/sitemap`
- `npm i -D @playwright/test @axe-core/playwright`
- Add the script `"test": "playwright test"`.

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.youngsaversph.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
```

There is no `@astrojs/vercel` adapter. The reason is in section 7.

---

## 3. Content collections: `src/content.config.ts` (Lead)

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),             // ≤155 chars, used as the meta description
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),    // /images/blog/<slug>/… ; used for OG + index thumbnail only
    oldUrl: z.string().optional(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),                    // "AIA Med Assist"
    description: z.string(),             // meta description, ≤155 chars
    tagline: z.string(),                 // one line under the H1
    heroImage: z.string().optional(),
    heroAlt: z.string().default(''),
    benefits: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
    forWho: z.array(z.string()).min(1),  // "Who it's for" bullets
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    oldUrl: z.string().optional(),
  }),
});

export const collections = { blog, products };
```

- **Product body (Markdown):** the "How it works / details" text, trimmed from the old post. Add no new claims.
- **Product file names:** `med-assist.md`, `critical-protect-100.md` and `all-in-one.md`. The entry `id` becomes the URL slug.
- **Blog post template:** don't render `heroImage` on the post page. The migrator made it equal to the first image in the body, so rendering it would show the image twice.

---

## 4. `src/data/site.ts` (Lead): single source of truth

```ts
export const site = {
  name: 'Young Savers PH',
  url: 'https://www.youngsaversph.com',
  advisor: 'Kreezel B. Villanueva',
  role: 'AIA Philippines Licensed Financial Advisor',
  phone: { display: '0916 535 4308', href: 'tel:+639165354308' },
  email: 'kreezel-b.villanueva@aia.com.ph',
  messenger: [
    { label: 'Message Young Savers PH', href: 'https://m.me/youngsaversph' },
    { label: 'Message Kreezel', href: 'https://m.me/kreezelvillanueva' },
  ],
  social: {
    facebook: 'https://www.facebook.com/youngsaversph',
    instagram: 'https://www.instagram.com/youngsaversph/',
  },
  calendlyUrl: 'https://calendly.com/kreezelvillanueva/online-assessment-with-kreezel-villanueva?hide_gdpr_banner=1',
  jotformId: '210720760397455',
  web3formsKey: '0f7978c6-3ba0-4802-85f6-5efd771c2922', // public by design
  calculatorUrl: 'https://www.aia.com.ph/en/financial-needs-calculator.html', // see Risks #4
  products: [
    { slug: 'med-assist', name: 'AIA Med Assist' },
    { slug: 'critical-protect-100', name: 'AIA Critical Protect 100' },
    { slug: 'all-in-one', name: 'AIA All-In-One' },
  ],
  disclaimer:
    'This is not an official website of AIA Philippines or the AIA Group. Product information here is a general overview only and is not a policy contract. Benefits, coverage and terms are governed by the policy contract and may change. For official information, visit aia.com.ph.',
  privacyLine:
    'The details you share are used only to respond to your inquiry and are never shared with third parties.',
} as const;
```

Nobody hard-codes any of these values anywhere else. QA greps for the phone number, email, key and Calendly URL outside `site.ts`.

The Header uses `site.products`, not the collection. That way the nav works before Dev A merges, and the Header doesn't depend on Dev A's files.

---

## 5. Components (all Lead-owned)

| Component | Props | Notes |
|---|---|---|
| `layouts/Base.astro` | `title: string`, `description: string`, `image?: string` (default `/images/site/og-default.jpg`), `noindex?: boolean` | Renders `<html lang="en">` and a head with the title `"{title} \| Young Savers PH"`, meta description, canonical, OG/Twitter tags and viewport. Imports tokens and global CSS. Body order: skip link to `#main`, `<Header/>`, `<main id="main"><slot/></main>`, `<Footer/>`. |
| `Header.astro` | none | Contains the wordmark link to `/` and `<nav aria-label="Main">` holding Products (dropdown), Become an Advisor, Blog and Contact. Sets `aria-current="page"` from `Astro.url.pathname`. No hamburger: the nav wraps on small screens. |
| `Footer.astro` | none | Phone, email, Messenger x2, FB, IG, the calculator link ("Calculate your financial needs", opens aia.com.ph), `<p data-testid="disclaimer">{site.disclaimer}</p>`, and © year. |
| `BookingCTA.astro` | `heading?` (default "Book a free online assessment"), `href?` (default `/contact/#book`) | A short line, a primary button linking to `href`, and a secondary "Message me on Messenger" link. Wrapper: `<section data-testid="booking-cta">`. |
| `CalendlyEmbed.astro` | none | The Calendly inline widget and its script, plus a fallback link that is always visible. Used on Home and Contact. |

That is the complete list. Product cards, post lists, FAQ and forms are markup inside the owning page, not components.

**Products dropdown.** It uses native `<details>`/`<summary>`, which is sound for accessibility:
- It works with the keyboard (Enter/Space).
- It announces expanded/collapsed.
- It works without JS.
- It is a navigation disclosure, not an ARIA `menu`, so don't add `role="menu"`.

What `<details>` doesn't do on its own is close on Escape, outside click or focus leaving. These few lines add that:

```astro
<details class="nav-products">
  <summary>Products</summary>
  <ul>{site.products.map(p => <li><a href={`/products/${p.slug}/`}
        aria-current={path === `/products/${p.slug}/` ? 'page' : undefined}>{p.name}</a></li>)}</ul>
</details>
<script>
  const d = document.querySelector('details.nav-products')!;
  document.addEventListener('click', (e) => { if (d.open && !d.contains(e.target as Node)) d.open = false; });
  d.addEventListener('focusout', (e) => { if (!d.contains(e.relatedTarget as Node)) d.open = false; });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary')!.focus(); } });
</script>
```

On small screens the panel should sit in the page flow rather than overlap content (styling is up to the design pass).

**CalendlyEmbed:**

```astro
<div class="calendly-inline-widget" data-url={site.calendlyUrl}
     style="min-width:320px;height:700px" data-testid="calendly"></div>
<script is:inline src="https://assets.calendly.com/assets/external/widget.js" async></script>
<p><a href={site.calendlyUrl} target="_blank" rel="noopener">Open the booking calendar in a new tab</a></p>
```

---

## 6. Page outlines

Every page has exactly one `<h1>` and ends with a booking path. The disclaimer is in the footer on every page.

**Home** (Lead; source `hometext.txt`)
1. Hero: "Your guide" pill (photo, name, role), H1 "Insurance, made simple.", lede. Primary button "Book a free online assessment" links to `#book`; secondary is Messenger.
2. "Start planning for your financial goals": Savings, Protection and Investment, 3 items using the old one-line copy.
3. "Get your policy fully online, no face-to-face meeting": Virtual meeting, Online application, Online payment.
4. Featured products: 3 cards linking to the product pages.
   - Critical Protect 100: "cover for up to 100 critical illnesses incl. cancer, stroke, heart disease".
   - Med Assist: hospital bills.
   - All-In-One: "4 protections in one plan".
5. About me: photo, the old bio (change "Philam Life" to "AIA Philippines"), and the "Top Financial Advisor" badge.
6. Needs calculator: one line plus an external link to `site.calculatorUrl`.
7. Latest from the blog: 3 newest posts as a plain list (title, date) and a "All posts" link to `/blog/`.
8. `<section id="book">`: `<CalendlyEmbed/>` plus Messenger and phone.

**Product page** (A; `src/pages/products/[slug].astro`, `getStaticPaths` from `getCollection('products')`, `render(entry)`)
1. Hero: H1 `name`, `tagline`, `heroImage`, and a primary `BookingCTA`-style button linking to `/contact/#book`.
2. Key benefits (`benefits`), in `<section data-testid="product-benefits">`.
3. Who it's for (`forWho`).
4. Details: the Markdown body inside `<div class="prose">`.
5. FAQ, only if `faqs.length`: `<section id="faq">` with one `<details><summary>` per question. Med Assist's 11 FAQs come from the old FAQ page.
6. `<BookingCTA/>`.

**Become an Advisor** (B; source `migration/pages/become-an-advisor.md`)
1. Hero: H1 "Become a financial advisor", full-time or part-time, one line from the old intro. Button "Apply now" links to `#apply`.
2. What you get: allowance, commissions, bonuses, travel incentives, flexible hours. **The owner must verify these figures** (Risks #2).
3. Minimum requirements (list).
4. How it works: training and licensure exams can be done online or face to face. The exam-fee offer stays (owner confirmed 2026-10-01).
5. `<section id="apply">` with the JotForm:
   ```astro
   <div data-testid="jotform"><script is:inline src={`https://form.jotform.com/jsform/${site.jotformId}`}></script></div>
   <p><a href={`https://form.jotform.com/${site.jotformId}`}>Open the application form</a></p>
   ```
   The script must be `is:inline` with no `async`. It uses `document.write`.
6. Questions? Messenger link.

**Contact** (B)
1. H1 "Contact me" and a list of direct channels: Messenger x2, `tel:`, `mailto:`, FB, IG.
2. `<section id="book">`: "Book a free online assessment" and `<CalendlyEmbed/>`.
3. `<section id="message">`: the Web3Forms form.

```astro
<form id="contact-form" action="https://api.web3forms.com/submit" method="POST" data-testid="contact-form">
  <input type="hidden" name="access_key" value={site.web3formsKey} />
  <input type="hidden" name="subject" value="New inquiry from youngsaversph.com" />
  <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" />
  <!-- labelled fields: name (required, autocomplete=name), email (type=email, required),
       phone (type=tel, optional), message (textarea, required) -->
  <p>{site.privacyLine}</p>
  <button type="submit">Send message</button>
  <p id="form-status" role="status" data-testid="form-status"></p>
</form>
<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const status = document.getElementById('form-status')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button')!; btn.disabled = true; status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!(await res.json()).success) throw 0;
      form.reset(); status.textContent = 'Thank you! Your message was sent. I will get back to you soon.';
    } catch { status.textContent = 'Sorry, sending failed. Please message me on Messenger or email me instead.'; }
    btn.disabled = false;
  });
</script>
```

Without JS, the plain POST still works and Web3Forms shows its own success page.

**Blog index** (C)
- H1 "Blog".
- `<ul data-testid="post-list">`: all posts sorted by `date` descending. Each item has the title link, `<time>`, description and an optional `heroImage` thumbnail (`loading="lazy"`, `alt=""`).
- No pagination and no tag pages (there are 7 posts).

**Post** (C; `[slug].astro`, `getStaticPaths` from `getCollection('blog')`)
- `<article>` containing H1 `title`, `<time>`, tags as plain text, and the body in `.prose`.
- Then `<BookingCTA/>` and a "Back to blog" link.

**404** (C)
- `Base` with `noindex`.
- Short message and links to Home, Blog and Contact.

---

## 7. Redirects (C): `vercel.json`, no adapter

**Decision.** With static output and no adapter, Astro's `redirects` config emits meta-refresh HTML pages that return **200**, not a real 301. Adding `@astrojs/vercel` would fix that, but it costs a dependency. `vercel.json` gives real 301s with zero dependencies, and it supports patterns that Astro's config can't express well, like `/search/label/*` and `/feeds/*`.

- Use `"statusCode": 301`. Don't use `"permanent": true`, which sends a 308.
- `migration/url-map.json` is the source of truth. `vercel.json` must contain every key in it (a QA test enforces this).

```json
{
  "trailingSlash": true,
  "redirects": [
    { "source": "/2020/06/aia-med-assist.html", "destination": "/products/med-assist/", "statusCode": 301 },
    { "source": "/2021/04/aia-critical-protect-100.html", "destination": "/products/critical-protect-100/", "statusCode": 301 },
    { "source": "/2021/08/health-link.html", "destination": "/blog/health-link/", "statusCode": 301 },
    { "source": "/2021/03/aia-philam-life-first-ever-that-goes.html", "destination": "/blog/aia-philam-life-first-ever-that-goes/", "statusCode": 301 },
    { "source": "/2020/07/importance-of-insurance.html", "destination": "/blog/importance-of-insurance/", "statusCode": 301 },
    { "source": "/2020/07/insurance-vs-hmo.html", "destination": "/blog/insurance-vs-hmo/", "statusCode": 301 },
    { "source": "/2020/07/do-you-know-what-protection-youre.html", "destination": "/blog/do-you-know-what-protection-youre/", "statusCode": 301 },
    { "source": "/2020/07/3-building-blocks-to-powerful-emergency.html", "destination": "/blog/3-building-blocks-to-powerful-emergency/", "statusCode": 301 },
    { "source": "/2020/07/blog-post.html", "destination": "/blog/blog-post/", "statusCode": 301 },

    { "source": "/p/message-me.html", "destination": "/contact/", "statusCode": 301 },
    { "source": "/p/we-are-hiring-financial-advisor.html", "destination": "/become-an-advisor/", "statusCode": 301 },
    { "source": "/p/aia-med-assist-frequently-asked.html", "destination": "/products/med-assist/#faq", "statusCode": 301 },
    { "source": "/p/thank-you-your-initial-application-form.html", "destination": "/become-an-advisor/", "statusCode": 301 },
    { "source": "/p/health-questionnaire.html", "destination": "/contact/", "statusCode": 301 },
    { "source": "/p/shop.html", "destination": "/contact/", "statusCode": 301 },
    { "source": "/p/your-request-for-quote-has-been.html", "destination": "/contact/", "statusCode": 301 },
    { "source": "/p/privacy-policy.html", "destination": "/privacy/", "statusCode": 301 },
    { "source": "/p/why-philam-vitality-is-right-for-you.html", "destination": "/", "statusCode": 301 },
    { "source": "/p/free-financial-planning-ebook.html", "destination": "/", "statusCode": 301 },
    { "source": "/p/quick-myaia-guide.html", "destination": "/", "statusCode": 301 },
    { "source": "/p/thank-you.html", "destination": "/", "statusCode": 301 },
    { "source": "/p/mail-signature.html", "destination": "/", "statusCode": 301 },

    { "source": "/search/label/:label", "destination": "/blog/", "statusCode": 301 },
    { "source": "/search", "destination": "/blog/", "statusCode": 301 },
    { "source": "/feeds/:path*", "destination": "/blog/", "statusCode": 301 },
    { "source": "/:year(\\d{4})/:month(\\d{2})", "destination": "/blog/", "statusCode": 301 },
    { "source": "/:year(\\d{4})", "destination": "/blog/", "statusCode": 301 }
  ]
}
```

- **`?m=1` and other query strings (`?m=0`, `?updated-max=…`).** Vercel ignores the query when matching a source and passes it through to the destination. So `/2021/08/health-link.html?m=1` gets one 301 to `/blog/health-link/?m=1`. The static page ignores the query, and its canonical tag (no query) consolidates SEO. `/?m=1` simply serves Home. No extra rule is needed, and a "strip m=1" rule on `/` would loop.
- **Trailing slashes.** `trailingSlash: true` sends a 308 from `/blog` to `/blog/`. Paths with a file extension (`.html`) are excluded, and every destination already ends in `/`, so each old URL takes a single hop.
- **Unknown old URLs.** They fall through to `404.astro` (a real 404). That is correct.
- **Testing.** `astro preview` does **not** apply `vercel.json`. Redirects must be tested against a Vercel preview deployment (`BASE_URL`).
- **Privacy policy.** The Migrator's script mapped `/p/privacy-policy.html` to `/privacy-policy/`, a page that isn't in the sitemap. The config above sends it to `/contact/`, so `url-map.json` must be changed to match, or Lead adds a privacy page (Risks #3).

---

## 8. SEO basics

- **Titles:** `"{page} | Young Savers PH"`.

  | Page | `{page}` |
  |---|---|
  | Home | "Kreezel Villanueva, AIA Philippines Financial Advisor" |
  | Product | `name` |
  | Post | `title` (Dev C converts the ALL-CAPS old titles to title case) |
  | Advisor | "Become a Financial Advisor" |
  | Contact | "Contact and Book a Free Assessment" |
  | Blog | "Blog" |

- **Descriptions:** frontmatter `description` for posts and products. Pages hand-write one of 155 characters or fewer.
- **Canonical:** `new URL(Astro.url.pathname, Astro.site)`: absolute, `www`, trailing slash, no query.
- **Open Graph:** `og:title`, `og:description`, `og:url` = canonical, `og:image` absolute (post/product `heroImage`, otherwise `/images/site/og-default.jpg` at 1200×630, made by Lead from the advisor photo), `og:type=website`, `twitter:card=summary_large_image`.
- **Sitemap:** `@astrojs/sitemap` produces `/sitemap-index.xml`.
- **robots.txt:** `User-agent: *`, `Allow: /`, and `Sitemap: https://www.youngsaversph.com/sitemap-index.xml`.
- **RSS/Atom:** skipped. It isn't free (it needs `@astrojs/rss` or a hand-written endpoint) and there are no real subscribers. `/feeds/*` goes to `/blog/`. Add it if the blog becomes active.
- **Domain:** `www` is canonical, as on the old site. Redirect the apex to `www` in the Vercel domain settings. In Cloudflare, set the Vercel records to **DNS only (grey cloud)**.

---

## 9. QA hooks

**Selectors** (use roles first; the ids and test ids below are stable):
- Landmarks: `banner`, `navigation[name=Main]`, `main#main`, `contentinfo`, and the skip link `a[href="#main"]`.
- Dropdown: `details.nav-products > summary` with the text "Products".
- Anchors: `#book`, `#message`, `#apply` and `#faq` (Med Assist).
- Test ids: `disclaimer`, `booking-cta`, `calendly`, `jotform`, `contact-form`, `form-status`, `post-list` and `product-benefits`.

**Pages list:**
- `/`
- `/products/med-assist/`, `/products/critical-protect-100/`, `/products/all-in-one/`
- `/become-an-advisor/`, `/contact/`, `/blog/`
- every `/blog/<slug>/` (read from `src/content/blog`)
- a missing path, to get the 404

**Checks:**
1. Every page returns 200, has one `h1`, a `<title>`, an absolute canonical with a trailing slash, and an `og:image`.
2. The disclaimer text matches `site.disclaimer` exactly.
3. The HTML contains none of `adsbygoogle`, `blogger.com` or `blogspot.com/`.
4. axe (WCAG 2.2 AA tags) passes, excluding `.calendly-inline-widget` and `[data-testid=jotform]` because they are third-party iframes.
5. Dropdown: opens with the keyboard, Escape closes it and returns focus to the summary, Tab past the last link closes it.
6. Contact form: stub the POST with `page.route('https://api.web3forms.com/submit', …)` so there's no real email. Check that success and failure messages appear in `form-status`, and that the honeypot `botcheck` is present and hidden.
7. At a 360px viewport there is no horizontal scroll.
8. Redirects run only when `BASE_URL` is a Vercel preview. Use `request.get(old, { maxRedirects: 0 })` and expect 301 and `location` equal to `url-map[old]` for every key, plus `?m=1` variants, `/search/label/Health` and `/feeds/posts/default`.
9. `url-map.json` keys and the exact (non-pattern) `vercel.json` sources are the same set; the 5 §7 pattern rules (`/search`, `/search/label/:label`, `/feeds/:path*`, `/:year/:month`, `/:year`) are extra.

`playwright.config.ts`: `webServer: npm run build && npm run preview`, and `baseURL` from `BASE_URL`, defaulting to `http://localhost:4321`.

---

## 10. Risks and open questions for Lead

1. **All-In-One has almost no source content**: one paragraph on the old home page and no post. The owner must supply benefits and "who it's for", or the page ships thin. Don't invent claims.
2. **Claims need the owner's sign-off before launch**:
   - "save 90% of hospital bills" (Med Assist)
   - "100 critical illnesses" (Critical Protect 100)
   - the advisor allowances and commissions: "25K–75K monthly", "25% commissions", the exam-fee offer (all from 2021). Confirmed by the owner 2026-10-01, keep as is.
3. **Privacy policy.** The old privacy page was a Blogger/AdSense template. The default above redirects it to `/contact/`. Given that the form collects personal data (Philippine Data Privacy Act), consider a short `/privacy-policy/` page linked from the footer. Decide before C finalizes `vercel.json`.
4. **Calculator URL.** The old site used `https://www.philamlife.com/en/financial-needs-calculator.html` (confirmed in `home.html`). Today that URL returns a 301 to `https://www.aia.com.ph/en/financial-needs-calculator.html`. That target returned 503 to curl, which is probably the Akamai CDN blocking bots. `site.ts` uses the `aia.com.ph` URL to skip the hop; confirm it opens in a real browser, and fall back to the philamlife URL if not.
5. **Web3Forms.** Confirm which inbox the access key delivers to, and restrict the key to the domain in the Web3Forms dashboard if the plan allows.
6. **Images.** Some migrated images are 600–900 KB PNGs; Astro doesn't optimize images in `public/`. Do a one-time recompress before launch (max 1600px wide, JPEG/WebP around 200 KB; macOS `sips` is enough). Markdown images don't get `loading="lazy"`; accept that.
7. **Missing assets.** `public/images/site/` doesn't exist yet (advisor photo, badge, OG image), and the scaffold references `favicon.svg`/`favicon.ico`, which don't exist. Lead must add them.
8. **Migration is partial.** 4 of 7 posts are in `src/content/blog`, and `migration/products`, `migration/pages` and `url-map.json` are empty or missing. Dev A, Dev B and Dev C are blocked on their inputs until the Migrator finishes.
9. **Calendly weight.** The widget is heavy on slow mobile data. It's embedded on Home and Contact only; other pages link to `/contact/#book`. If Home is too slow, replace the Home embed with a link.
10. **Blogger cutover.** Don't delete the Blogger blog. Keep its custom-domain setting so old `youngsaversph.blogspot.com` links still forward to `www`, which then hits the Vercel 301s.
11. **Dropped pages.** Removed content (Philam Vitality, free ebook, MyAIA guide, mail signature, shop) now redirects to Home or Contact. Confirm with the owner that nothing there is still needed.

### Critical files for implementation
- /Users/kreezelvillanueva/Projects/youngsaversph/src/content.config.ts
- /Users/kreezelvillanueva/Projects/youngsaversph/src/data/site.ts
- /Users/kreezelvillanueva/Projects/youngsaversph/src/layouts/Base.astro
- /Users/kreezelvillanueva/Projects/youngsaversph/vercel.json
- /Users/kreezelvillanueva/Projects/youngsaversph/astro.config.mjs
