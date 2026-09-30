# Blogger → Astro content migration report

Source: https://www.youngsaversph.com/ (Blogger JSON feeds for posts and pages, plus the rendered homepage). Conversion script: `migration/scratch/migrate.py` (run with `uv run --with beautifulsoup4 --with markdownify python migrate.py`; re-runnable, skips images already downloaded).

## Counts

| Item | Count |
|---|---|
| Posts in Blogger feed | 9 |
| Blog posts → `src/content/blog/` | 7 |
| Product files → `migration/products/` | 3 (med-assist, critical-protect-100 from posts; all-in-one from the homepage only) |
| Static pages in Blogger feed | 13 |
| Page files → `migration/pages/` | 13 (home, contact, become-an-advisor + 10 in `other/`); the Med Assist FAQ page is merged into `products/med-assist.md` |
| Images downloaded | 58 (25 in `public/images/blog/`, 33 in `public/images/site/`) |
| Redirects in `migration/url-map.json` | 23 |

## Old → new

| Old path | New path | File |
|---|---|---|
| `/` | `/` | `migration/pages/home.md` |
| `/2021/08/health-link.html` | `/blog/health-link/` | `src/content/blog/health-link.md` |
| `/2020/06/aia-med-assist.html` | `/products/med-assist/` | `migration/products/med-assist.md` |
| `/2021/04/aia-critical-protect-100.html` | `/products/critical-protect-100/` | `migration/products/critical-protect-100.md` |
| `/2021/03/aia-philam-life-first-ever-that-goes.html` | `/blog/aia-philam-life-first-ever-that-goes/` | `src/content/blog/aia-philam-life-first-ever-that-goes.md` |
| `/2020/07/importance-of-insurance.html` | `/blog/importance-of-insurance/` | `src/content/blog/importance-of-insurance.md` |
| `/2020/07/insurance-vs-hmo.html` | `/blog/insurance-vs-hmo/` | `src/content/blog/insurance-vs-hmo.md` |
| `/2020/07/do-you-know-what-protection-youre.html` | `/blog/do-you-know-what-protection-youre/` | `src/content/blog/do-you-know-what-protection-youre.md` |
| `/2020/07/3-building-blocks-to-powerful-emergency.html` | `/blog/3-building-blocks-to-powerful-emergency/` | `src/content/blog/3-building-blocks-to-powerful-emergency.md` |
| `/2020/07/blog-post.html` | `/blog/blog-post/` | `src/content/blog/blog-post.md` |
| `/p/quick-myaia-guide.html` | `/` | `migration/pages/other/quick-myaia-guide.md` |
| `/p/aia-med-assist-frequently-asked.html` | `/products/med-assist/` | `migration/products/med-assist.md (FAQ section)` |
| `/p/mail-signature.html` | `/` | `migration/pages/other/mail-signature.md` |
| `/p/health-questionnaire.html` | `/contact/` | `migration/pages/other/health-questionnaire.md` |
| `/p/thank-you-your-initial-application-form.html` | `/become-an-advisor/` | `migration/pages/other/thank-you-your-initial-application-form.md` |
| `/p/shop.html` | `/contact/` | `migration/pages/other/shop.md` |
| `/p/your-request-for-quote-has-been.html` | `/contact/` | `migration/pages/other/your-request-for-quote-has-been.md` |
| `/p/why-philam-vitality-is-right-for-you.html` | `/` | `migration/pages/other/why-philam-vitality-is-right-for-you.md` |
| `/p/thank-you.html` | `/` | `migration/pages/other/thank-you.md` |
| `/p/we-are-hiring-financial-advisor.html` | `/become-an-advisor/` | `migration/pages/become-an-advisor.md` |
| `/p/privacy-policy.html` | `/privacy-policy/` | `migration/pages/other/privacy-policy.md` |
| `/p/free-financial-planning-ebook.html` | `/` | `migration/pages/other/free-financial-planning-ebook.md` |
| `/p/message-me.html` | `/contact/` | `migration/pages/contact.md` |

Redirect targets for minor `/p/` pages are best guesses: thank-you and quote pages → `/contact/` or `/`, application thank-you → `/become-an-advisor/`, privacy policy → `/privacy-policy/` (no such page exists yet in the new site; create one or change the target).

## Calculator URL

- `https://www.philamlife.com/en/financial-needs-calculator.html` (homepage sidebar widget "CALCULATE YOUR FINANCIAL NEEDS"; image saved as `/images/site/financial-needs-calculator.png`). No other philamlife.com calculator URL appears anywhere on the site. The Philam brand is now AIA Philippines, so this link may redirect or be dead.

## Site images (`public/images/site/`)

`young-savers-ph-logo.png` (header logo), `kreezel-villanueva-hero.png` (homepage hero), `kreezel-villanueva-about.jpg` (About Me photo), `kreezel-villanueva-sidebar-bio.png` (sidebar bio photo), `top-financial-advisor-badge.jpg` (sidebar "TOP FINANCIAL ADVISOR" badge), `financial-needs-calculator.png`, `contact-section-photo.jpg`, `pillar-savings.png` / `pillar-protection.png` / `pillar-investment.png`, `process-virtual-meeting.png` / `process-online-application.png` / `process-online-payment.png`. Images from minor pages are in `public/images/site/<page-slug>/`. Homepage product-section images are in the product folders (`/images/blog/med-assist/homepage-med-assist.png`, `/images/blog/critical-protect-100/homepage-critical-illness.png`, `/images/blog/all-in-one/homepage-all-in-one.png`).

Post images keep their original Blogger file names (UUIDs), lowercased. They were all fetched at original size (`/s0/`).

## Skipped, and why

- **Two images in `do-you-know-what-protection-youre`**: the post hot-linked `philamlife.com/content/dam/ph/en/photos/content-hub/article-01/article01-banner.jpg` and `article01-doctors-consultation.jpg`. philamlife.com timed out on every attempt and the Wayback Machine has no copy, so the images were dropped from the post. The post therefore has no `heroImage`.
- **AIA/Philam icons** hot-linked from philamlife.com (decorative benefit icons, not content):
  - `terminal_illness-prime1.png` (/2021/08/health-link.html)
  - `medicalcare-prime1.png` (/2020/06/aia-med-assist.html)
  - `hospital-prime1.png` (/2020/06/aia-med-assist.html)
  - `savings_ph-prime1.png` (/2020/06/aia-med-assist.html)
  - `investment_insurance-prime1.png` (/2020/06/aia-med-assist.html)
  - `mypolicy-prime1.png` (/2020/06/aia-med-assist.html)
  - `vitality-prime1.png` (/2020/06/aia-med-assist.html)
  - `criticalillnesspro-prime2.png` (/2021/04/aia-critical-protect-100.html)
  - `vitality-prime1.png` (/2021/04/aia-critical-protect-100.html)
- Homepage/template junk: "Powered by Blogger", Pinterest hover script, Blogger share/label widgets, `YOUR-LOGO-URL-HERE` placeholders, empty base64 placeholder images, empty Blogger ContactForm widget, inline styles and fonts, Calendly/JotForm scripts. Calendly buttons became plain links; the JotForm became `[JOTFORM EMBED 210720760397455]`.
- YouTube iframes became plain "Watch on YouTube" links. The `/p/shop.html` booking iframe (LeadConnector) became a plain link.

## Things to check

- **Product classification**: `aia-med-assist` and `aia-critical-protect-100` went to `migration/products/`. Two posts were kept in the blog on purpose:
  - `do-you-know-what-protection-youre` ("Do you know what protection you’re getting…") is an educational article that ends by pitching **AIA All-In-One**. It is mostly general, so it stayed in the blog; it could also serve as All-In-One source material.
  - `health-link` describes the **Health Link** group plan, which is not one of the three product pages. It stayed in the blog.
- **Image-only posts**: `importance-of-insurance`, `insurance-vs-hmo`, `3-building-blocks-to-powerful-emergency` and `blog-post` are infographics with no body text (just the image and, for three of them, an "inquire" link). Their `description` falls back to the link text or title. Consider writing real descriptions or alt text.
- **`blog-post` slug**: the post titled "The 4 Financial Blind Spots" has the old URL `/2020/07/blog-post.html`, so its slug is `blog-post`, per the slug rule. You may want a better slug (update `url-map.json` to match).
- **`health-link` looks incomplete** in the original: it ends after the first benefit ("Doctor's Calls"). Copied as-is.
- **`aia-med-assist` date**: the URL says 2020/06, but the feed's published date is 2021-04-17. The frontmatter uses the published date.
- **`aia-philam-life-first-ever-that-goes`** has no Blogger labels (`tags: []`).
- Original typos kept as-is (e.g. "premuim", "Communicaton", "VITLITY", "woks", "to to schedule").
- `migration/pages/other/mail-signature.md` is an email-signature template, not a real page. It is kept for reference only.

## Claims to verify

### migration/products/med-assist.md (post /2020/06/aia-med-assist.html)
- "covering 90% of your in-patient expenses"
- "It is a co-pay plan that comes in four different packages to match your budget"
- "90% of the bill will automatically be charged to AIA Philippines so that you will only have to pay the remaining 10%."
- "AIA Med-Assist can shoulder up to P4,000,000 annually depending on the type of Plan you choose."
- "Get up to P3,000 worth of Daily Hospitalization Income for every day that you're confined, over the course of a year"
- "a lumpsum cash benefit to your beneficiaries, which can go as high as 90 times your basic annual premium"
- Waiver of premium "In the event of total and permanent disability"
- "Estimated Quote for age 30 Female" (the quote itself is only in an image: `/images/blog/med-assist/4ae3d9d8-...jpeg`; plan tables are images too: `535b4903-...` "4 DIFFERENT PLAN FOR MEDICAL BENEFIT RIDER", `807b8501-...` "SAMPLE SCENARIO FOR PLAN B")
- Brand: "AIA Med-Assist covers ... through **MediCard**" (HMO partner may have changed)

### migration/products/med-assist.md, FAQ section (page /p/aia-med-assist-frequently-asked.html)
- Q1: "premium increases every year more or less P500 to 1k per year due to the Medical Benefit"
- Q2: "This is pay upto age 65"
- Q3: "This is applicable for ages 0 - 55 yrs old."
- Q5: "Life insurance coverage is until age 80 then HMO Card coverage is until age 65 only"
- Q6: maturity benefit when you "outlive po natin ang age 80"
- Q7: "ang minimum coverage na inooffer ng plan is 500k per year upto 4Million per year to cover upto 90% of hospital expense. When it comes to the traditional HMO usually P200K per year na po ang maximum annual limit"
- Q8: "This plan can still cover upto 90% of hospital bills (subject to inner limits)"
- Q10: pregnancy-related confinements not covered
- Q11: "you will have an upfront additional coverage of 20% for both Life insurance and Daily Hospital Income. You can boost this coverage upto maximum of 50% by increasing your vitality status."

### migration/products/med-assist.md + migration/pages/home.md (homepage "Hospital Bills?" section)
- "No worries, save 90% of hospital bills"
- "Medical Benefit - save 90% of your hospital bills"

### migration/products/critical-protect-100.md (post /2021/04/aia-critical-protect-100.html)
- "a plan that protects you against 100 critical illnesses, from age 0 to 100"
- "protects you against 100 illnesses, starting from age 0 until 100"
- "Receive cash benefit once diagnosed with 57 Major Critical Illness"
- "they can get 25% (up to a maximum of PHP 1,000,000) of their critical illness coverage in advance. This benefit can only be claimed onc" (sentence is cut off in the original post)
- "The benefit under Juvenile CI list will no longer be claimable once the insured has reached the age of 22 years old."
- "receive an additional 50% benefit when you are diagnosed with gender-specific cancer"
- "you can receive 5 yearly recovery cash benefits – each amounting to 10% of your main coverage. You may claim the first payout one year after the major claim."
- "all future premium payments for juvenile* policies will be waived. *insured = ages 0 to 17 years old"
- "Because your benefits are not affected by market risks" / "powered by Philam Vitality" (now AIA Vitality)

### migration/products/critical-protect-100.md + migration/pages/home.md (homepage section)
- "Get health coverage for any of the 100 critical illnesses including the top 3 illnesses such as Cancer, Stroke and Heart diseases."
- "With AIA Critical Protect 100 you get a coverage up to 100 different types of Critical Illnesses"

### migration/products/all-in-one.md + migration/pages/home.md (homepage section)
- "get protected against 4 major risks in life: untimely death, accidents, disability, and critical illnesses"
- "Your benefits are not affected by market risks"

### src/content/blog/do-you-know-what-protection-youre.md
- "Setting aside less than P100 a day for 20 years"
- "With AIA Philam Life’s AIA All-In-One, your P100 can indeed go a long way: a cash payout ... in case of an untimely death, and cash support in case of accidents, disabilities, and critical illnesses.*"
- Statistics: "road accidents ... killing 1.93 million annually"; "some 12% of the Filipinos age 15 and older experienced severe disability, with that figure rising to 32% for Filipinos aged 60 and above"; "Between 2000 and 2016, over 23,000 Filipinos were killed by natural disasters ... affected some 125 million people ... $20 billion"

### src/content/blog/health-link.md
- "offers medical and life insurance benefits to business owners with at least 5 regular employees"

### migration/pages/become-an-advisor.md (recruitment terms)
- "20 to 35 years old"; "Graduate of any 4-year Course"
- "25K to 75K Monthly Allowance for Full-Timers"
- "25% Performance Based Commissions (Earn 20K to 50K On Top of Allowance & Bonuses)"
- "FINISH YOUR ONLINE TRAINING MODULES IN 10 DAYS AND WE WILL SHOULDER THE COST OF YOUR EXAM FEE!! JUST PAY FOR THE LICENSE FEE"

### Contact details that may be outdated
- migration/pages/contact.md: "KREEZEL-B.VILLANUEVA@AIA.COM.PH", "09165354308", CV link "bit.ly/BeAPhilamLifeFinancialAdvisor"
- migration/pages/other/mail-signature.md: "kreezel-b.villanueva@philamlife.com.ph / +639165354308", "code: 007624420", address "GF, Philam Salcedo Bldg. 126 L.P. Leviste Street, Salcedo Village, Makati, 1227 Metro Manila"
- migration/pages/home.md About Me: "PHILAM LIFE LICENSED FINANCIAL ADVISOR" vs hero "AIA Philippines Licensed Financial Advisor" (old brand name)

