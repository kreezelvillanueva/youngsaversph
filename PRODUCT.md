# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static output), hosted on Vercel. DNS in Cloudflare. No UI framework, no CMS. Blog and product content as Markdown content collections.

## Users

Two audiences, roughly equal:
- **Young earners** (20s–30s, starting to earn, often first insurance plan, unsure where to begin).
- **Young families / parents** protecting the household: health, critical illness, kids' future.

Secondary: people considering becoming a financial advisor (recruitment page).

Visitors mostly arrive from Facebook/Instagram/Messenger on a phone, often in Filipino social-media context, and decide whether to book a free online assessment.

## Product Purpose

Personal website of a licensed AIA Philippines financial advisor (brand: Young Savers PH). It explains savings, protection and investment plans in plain language and turns visitors into booked online assessments (Calendly) or messages. It also recruits new advisors.

Success = booked Calendly assessments, contact-form messages, Messenger chats, advisor applications (JotForm).

## Positioning

- **Fully online:** virtual meeting, online application, online payment. No face-to-face meeting needed.
- **Assessment first, then a tailored plan:** a free online assessment comes before any recommendation; the plan fits the person's needs and budget.

## Operating Context

- Booking: Calendly "Online Assessment" event.
- Contact: Web3Forms email form, Messenger (m.me/youngsaversph, m.me/kreezelvillanueva), mobile 0916 535 4308, email kreezel-b.villanueva@aia.com.ph.
- Advisor applications: existing JotForm with CV upload.
- Needs calculator: external link to the philamlife.com calculator (a custom calculator is a future separate project).

## Capabilities and Constraints

- Products featured with their own pages: AIA Med Assist, AIA Critical Protect 100, AIA All-In-One.
- Product claims come from old posts and may be outdated; they must be verified by the owner before launch. Don't add new claims.
- **Not an official AIA website.** Footer disclaimer (exact): "This is not an official website of AIA Philippines or the AIA Group. Product information here is a general overview only and is not a policy contract. Benefits, coverage and terms are governed by the policy contract and may change. For official information, visit aia.com.ph."
- Must not look like an official AIA page: no AIA logo as site branding, no copying of AIA's site layout.
- Primary brand color is a deep maroon (like aia.com.ph), chosen by the owner 2026-09-30. The "not official AIA" disclaimer must stay prominent.
- Copy in English. No ads.

## Brand Commitments

- Name: **Young Savers PH**. No existing logo (a simple wordmark is allowed).
- Personal brand: the advisor's name leads; the advisor's photo appears small (a "Your guide" pill), not as the hero image (owner's choice 2026-09-30). Tone: friendly, reassuring, plain-spoken, no hard sell.

## Evidence on Hand

- Advisor photo(s) and a "Top Financial Advisor" badge image from the old site (`public/images/site/`, after migration).
- Existing blog posts explaining products (migrated to `src/content/blog/`).
- **No testimonials, client counts, years-of-service numbers or other awards.** Don't invent any.

## Product Principles

1. Clarity over salesmanship: explain plainly, then invite a free assessment.
2. One obvious next step on every page: book the online assessment (or message).
3. Trust through honesty: real photo, real contact details, clear "not official AIA" disclaimer, no invented proof.
4. Mobile first: most visitors come from social media on phones.

## Accessibility & Inclusion

WCAG 2.2 AA baseline. Must work well on low-to-mid-range Android phones and slower mobile data.
