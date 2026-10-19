# The Healthy Hand — brand reference

Read this before concepting, writing, or building anything for The Healthy Hand (THH). Source: audit of the THH Klaviyo account (`SUJAkf`) on 2026-10-19 — 8 full templates (Father's Day 2026, Friday Flash Sale 2026, Xmas 2025, BOGO Gummies, Bye-bye bloating, Elderberry launch, Meet THH, Customer Stories), the live welcome flow (Email #1), 100+ campaign subject lines from Apr 2024 to Jun 2026, brand email defaults, and the image library names. The hero images themselves could not be opened (CDN blocked from the sandbox), so visual notes on heroes come from file names, alt text and surrounding layout, not from looking at them.

## The business

- DTC natural wellness and supplements, Miami Beach FL (P.O. Box 630002, 33160). Site: thehealthyhand.com. Also sold on Amazon (announced Mar 2025).
- **Founder: Shay Johnson.** She is the sender name on most 2025–26 campaigns. Customers address her personally in reviews and call the brand "gorgeous". She created the kids' elderberry gummies for her own daughter. She is the brand's strongest asset — use her.
- Brand idea already in their copy: herbal heritage meets everyday life ("ancient healing for modern living", "the power of natural healing", "allow us to be your helping hand"). Footer tagline: "All-Natural Health & Wellness Solutions".
- Collections (the nav): **Detox · Bundle · Capsules · Gummies**. Shop links: `/collections/detox-collection`, `/collections/bundle-deals-collection`, `/collections/capsules-collection`, `/collections/gummies-collection`.
- Products seen in emails:
  - Total Belly Detox Capsules (vegan, gluten-free, "take 2 daily") — `/products/total-belly-detox-capsules`
  - Detox kits / Detox Combo Package, Total Belly Cleanse powder
  - Soursop & Ginger Detox Tea Bags (their "#1" tea, launched Sep 2024)
  - Sea Moss Gummies (they claim "92 essential nutrients")
  - Kids Multivitamin Elderberry Gummies — real elderberry, sweetened with real honey, vitamins A, C, D & E; $35.99 (compare at $44.99) — `/products/kids-multivitamin-elderberry-gummys`
  - Black Seed Oil, Probiotics, Anti-Aging capsules, Joint Health supplements
- Offers they run: sitewide 20–40% off with **no code needed** (applied at checkout), BOGO / Buy 2 Get 1 on gummies and detox, free gift with $150+ orders, holiday sales (Valentine's, Easter, Mother's Day, Memorial Day, Juneteenth, 4th of July, Labor Day, Halloween, Black Friday, Cyber Monday, Christmas, New Year's). Welcome code: SAVE10 (10% off).
- Free shipping threshold shown in the top bar: **$100+** (one 2024 email says $150 — confirm before using).
- Social proof they use: "21,478 Verified Customers ⭐⭐⭐⭐⭐", named customer testimonials, a "top reviews" GIF and a "why buy from us" graphic.
- Socials: Instagram @thehealthyhand_, Facebook /TheHealthyHand, YouTube.

## Audience (inferred from copy and products)

Women, mostly moms, who buy for themselves and their kids. Motivated by bloating, energy, weight, immunity and "feeling lighter". Trust the founder as a person more than the brand as a company. Respond to deals — almost every send is a sale.

## What their emails look like now

**Fixed skeleton (nearly every campaign since 2024):**
1. "Open in your browser" line on light grey `#F7F7F7`
2. Thin full-width utility bar: black `#000000` (sometimes forest green `#4A7A5E` or coral `#F3523E`), white Poppins 15px caps: "FREE SHIPPING ON US ON ORDER +$100"
3. Header link bar: logo (90px) + nav DETOX · BUNDLE · CAPSULES · GUMMIES in Poppins 12px black caps
4. 600px designed hero image (Canva; text baked into the image, usually no alt text)
5. Centered text block on a cream background (`#F9F0D2`, `#F9F6F1` or `#FFF6E7`): bold 18–21px heading line, then "Hey {{ first_name }}," and 3–6 short paragraphs, **line-height 250%**, everything centered
6. One CTA button, 5px radius, usually lime green `#8DC640` with white text (sometimes red `#E23E30`), often a long ALL CAPS label
7. ✔️ checklist of benefits, then one urgency line
8. Second full-width image (a reused best-seller graphic)
9. Coral `#F3523E` band, Georgia bold caps: "DISCOVER OUR BEST SELLER(S)"
10. 3-up dynamic product feed (`SHOP_POPULAR_ALL_CATEGORIES`) on coral or black, white Arial Black titles, white "Shop now" buttons
11. Black footer: small logo (75px), tagline, "📍 Based in the USA", "📱 Follow us on Social Media Pages:", grey Klaviyo social icons, unsubscribe line and address

**Fonts in use:** Arial Black (template default for headings and text blocks), Poppins (body, nav, buttons — loaded as a custom font in the account), Georgia (rare section labels), Kanit (footer in some sends), Helvetica Neue/Arial in the old welcome flow.

**Colors in use:** black `#000000`, cream `#F9F0D2` / `#F9F6F1` / `#FFF6E7`, lime green `#8DC640` / `#8DC63E`, coral red `#F3523E` / `#FF4945`, button red `#E23E30`, forest green `#4A7A5E`, heading orange-red `#D84C1F`, link green `#418D27`. No brand colors, logos or buttons are saved in the Klaviyo brand library; brand email defaults are still Klaviyo's out-of-the-box Helvetica.

**Copy patterns now:**
- Subjects: emoji first (🔥 🎉 🚨 ⏳ 🌿 💥), Title Case, "% OFF" in caps, often "Don't Miss Out", "Hurry", "Last Chance", "Limited Stock", "Act Fast". Preview text often repeats the subject or says "Very Limited Quantity, Shop Now".
- Body: "Hey {{ first_name }}," / "Hey love," / "Hey, fam!", exclamation marks, emoji bullets, ✔️ benefit lists, "No code needed", "this deal disappears at midnight".
- Klaviyo's auto-detected brand voice: approachable, encouraging, urgent, positive; lots of emojis and exclamation points; testimonials with star ratings.
- Sender name inconsistent: "Shay Johnson", "Shay Johnson From The Healthy Hand", "THE HEALTHY HAND", and a typo "The Health Hand".

## What already works (keep it)

- **Shay as a real, named founder** who made products for her own family. Personal, specific, impossible for a competitor to copy.
- **Warm, familiar address** ("love", "fam") — the audience responds to a friend, not a lab.
- **"No code needed" auto-discounts** — low friction, clear.
- **Concrete deal mechanics** (Buy 2 Get 1, free gummies over $150, BOGO) beat vague "save big".
- **Real customer results in their own words** — specific numbers ("217 lb → 207 lb") feel human.
- **Collection nav** in the header gives non-buyers somewhere to go.
- Herbal ingredients with character: soursop, ginger, sea moss, elderberry, black seed, real honey.

## What makes it look cheap or "AI-ish" (fix it)

Design:
- Key messages baked into Canva banner images with no alt text — invisible with images off, unreadable on small screens.
- Everything centered with 250% line height — reads like a flyer, not a brand.
- Arial Black as a default font; four or five fonts in one email.
- Two competing CTA colors (lime green and red) plus coral bands, orange-red headings and cream — no single accent.
- Same skeleton every send, so nothing feels like an event.
- WhatsApp photos and stock-style images; bottle shots floating on flat colors.
- The welcome flow is an unbranded template copied from another account (its images load from a different Klaviyo company, and the copy greets "Finlay" by mistake). The Customer Stories email greets readers as "Hi {{ organization.name }}" (it says "Hi The Healthy Hand").

Copy:
- Emoji on almost every subject line, exclamation marks on every line, "Don't Miss Out", "Hurry!", "Unlock", "Discover", "Treat Yourself", "Indulge", "Glow-up", "Your Wellness Journey" — generic and on the banned list.
- Urgency every send ("Limited Stock", "Last Chance") with the same deal re-run weekly — readers stop believing it.
- Long, emoji-loaded button labels ("🔥 Start Your Detox Today", "Explore Detox - Start Your Journey Today", "Grab a bottle for your kid!").
- Almost every campaign is a sale. Content sends ("How to use detox capsules", "Fall health tips", "Customer spotlight") existed in Aug 2024 and stopped.

Compliance (must fix — supplements are regulated by the FDA and FTC):
- Disease and drug-like claims appear: "Cure For Many Health Issues", "Calm anxiety & stress", "Helps eliminate parasites + toxins", "flush toxins, reduce belly fat", "BURN BELLY FAT FAST", "Prepare your skin… anti-aging".
- Weight-loss testimonials ("lost 8 pounds in 2 weeks") shown with no "results not typical" note.
- No FDA disclaimer in the footer.

## How to design for THH (default direction — confirm with Gab before the first build)

**Positioning line:** "Shay's kitchen-shelf remedies, made for real families." Warm and personal, rooted in herbs, honest about what the products do. Premium means *calm and trustworthy*, not cold or clinical.

**Voice: warm, plain-spoken, rooted. We are a friend who knows herbs, not a pharmacy or a hype account.**
- Shay writes in first person for welcome, launches, founder notes and the kids' line. Sign off "— Shay".
- Keep "love" sparingly as the greeting; drop "fam", "gorgeous" in headlines and "glow-up".
- One exclamation mark per email at most. Emoji: zero or one per subject line, none in buttons or body bullets.
- Name the ingredient and the ritual: "soursop and ginger, steeped 5 minutes", "2 capsules with breakfast", "real honey, no dyes". Specific beats "natural wellness".
- Urgency only with a real end date or time, stated once ("ends Sunday 11:59pm ET").
- Claims stay structure/function: "supports digestion", "supports immune health", "helps you feel less bloated". Never: cure, treat, prevent, burn fat, eliminate parasites, calm anxiety, detox your organs. Testimonials with weight numbers need "Individual results vary."

**Palette (built from what they already use, cut down to one accent):**
- Base: warm cream `#F9F6F1` (keep — it's theirs and it reads natural)
- Text: near-black `#1F1F1C`
- Brand green: deep herbal green `#2F5A43` (a darker, richer take on their `#4A7A5E`) — utility bar, footer, buttons
- Accent: their coral red `#E23E30` — offer badges, prices, the code ticket only
- Retire lime `#8DC640` and orange-red `#D84C1F` as primary colors; lime may stay as a tiny highlight if Gab wants a link to the old look.
- Per-product color worlds: elderberry → deep plum/berry, sea moss → ocean green, soursop & ginger tea → warm ginger/amber, black seed oil → charcoal and gold, belly detox → sage.

**Type:** an editorial serif for headlines (Georgia as the email-safe fallback; they already use it) with one italic word for warmth, Poppins for body (already loaded in the account), 16–18px body, line height 1.5, left-aligned body copy. Two fonts max.

**Layout kit:**
- Keep the header kit (utility bar + logo + Detox · Bundle · Capsules · Gummies nav) but restyle it: green bar, smaller logo, letter-spaced nav.
- Hero = real product in use: tea steeping in a mug, a hand holding gummies over a kid's lunchbox, capsules next to breakfast, raw ingredients (soursop, ginger root, sea moss, elderberries) as floating props. The headline is live text, not baked into the image.
- Offers: the deal as large live text in a ticket box or a coral band ("Buy 2 Detox, get 1 free — no code"), one short button ("Shop the sale").
- One CTA color (green), short labels: "Shop now", "Shop detox", "Get the gummies", "Build your bundle".
- Swap the coral "Discover our best seller" band + feed for a calm 2–3 column product grid on cream with name, one-line benefit and price.
- Testimonials as a clean review card (stars, a short quote, first name + city, product) instead of grey boxes with caps and emoji.
- Footer: green, small logo, nav repeat, one line on Shay ("Made by Shay in Miami"), socials, FDA disclaimer, unsubscribe + address.

**Calendar balance:** for every 2 sales, send 1 non-sale: Shay's story, "how to use" rituals (tea steeping, capsule timing), ingredient spotlights (soursop, sea moss, elderberry), customer stories, back-to-school immunity for kids, reorder reminders for consumables.

**Flows to rebuild first:** the welcome series (Shay's hello + SAVE10 as live text; then her daughter and the elderberry story; then bestsellers and reviews), abandoned checkout, browse abandonment, post-purchase with how-to-use and a reorder reminder at ~25 days for a 30-day supply.

## Checklist before shipping a THH email

1. Would this still work with a competitor's logo? If yes, add Shay, an ingredient, or a family moment.
2. Headline, offer and deadline are live text; every image has alt text.
3. One accent color, two fonts, left-aligned body, one CTA color.
4. No banned words, no disease or weight-loss claims, FDA disclaimer in the footer.
5. `{{ first_name|default:'love' }}` — never `{{ organization.name }}` in a greeting.
6. Sender name: "Shay from The Healthy Hand" (confirm with Gab) — the same every send.
