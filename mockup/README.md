# The Healthy Hand: Kemp-theme mock-up

A static mock-up of thehealthyhand.com rebuilt on the Kemp Beauty theme. It's for Alyssa's review before anything touches Shopify.

**Preview:** https://raw.githack.com/chrisgabriel-sellready/the-healthy-hand/claude/healthy-hand-redesign-lse5gu/mockup/index.html

Pages:
- `index.html`: home
- `shop.html?c=`: collection, with filters `detox`, `tea`, `bundles`, `capsules`, `gummies`, `oils`, `accessories`
- `product.html?p=<handle>`: product page
- `about.html`
- `faq.html`
- `contact.html`
- `affiliate.html`
- `fibroids.html`

## Design

**v2 (current):** the same sections as v1, restyled in THH's own look so it no longer reads as Kemp Beauty. That look comes from their live theme:
- Bebas Neue, Oswald and Open Sans.
- Lime buy buttons with black text.
- The coral-to-orange "Our Why" gradient.
- Black and white bands, with THH grey `#f0f0f0`.

The working parts (cart drawer, hover add-to-cart cards, video players, reveal) still come from the Kemp Dawn build. Every Kemp class name and signature layout has been removed.

Homepage, top to bottom:

| Section | What it is |
|---|---|
| Hero | Full-bleed colour slides (tea on the gradient, kit on lime, Total System on grey), with product-name tabs instead of dots |
| Trust strip | Free shipping $100+, USPS 7–10 days, 25,000+ orders, 4.5★ from 239 reviews |
| Shop by category | 6 tiles |
| Shay's Picks | The real `shay-johnsons-top-picks` collection, plus a "Taking both?" strip (Belly + System $130 vs the Kit at $110) |
| Our story | Black band with press mentions and the square story video |
| Pour, shake & drink | Routine video next to the 4 FAQ steps (this replaces the separate "How it works" block) |
| Bundle deals | 2×2 cards showing what's included and the saving |
| Our customers | Loox photo wall mixed with quote tiles |
| Our Why | THH's own gradient section |
| Reviews | Rating summary with each product's rating, next to quote cards |
| Footer | Lime HealthyText signup above a black footer |

Inner pages:
- **Shop:** dark header with category tiles, plus sort.
- **Product:** thumbnails down the side, a "free from" checklist, a "Taking both?" kit upsell on Belly/System, a how-to strip, tabs, and reviews with a star filter.
- **About:** rebuilt on the "Our Why" layout.
- **FAQ:** a topic list beside grouped answers.
- **Contact:** a black info panel beside the form.
- **Affiliate:** gradient banner, black steps band, centred form.

## Data

All products, prices, compare-at prices, images, ratings, review counts and Loox reviews come read-only from THH's Shopify store. Product copy is THH's own listing text with disease and weight-loss claims removed. Stats are from Shopify analytics:
- 25,774 lifetime orders
- 1,443 TikTok orders in the last 12 months

Cart, search and forms only work in the browser. Nothing is sent anywhere.

## Needs a look before this goes further

- **Videos I couldn't watch here** (image hosts are blocked in the build environment):
  - Our Story / About uses `d2d186b3…` (2:01, 2019).
  - The reel uses `5b372a30…` (2026 loop).
  - The feature video uses `e04286ae…` (2025 loop).
  - Swap any that aren't right.
- **Loox customer photos:** check none of the 11 in the photo row, or the photos in review cards, are before/after body shots.
- **Shay's approval:** the "Meet Shay Johnson" paragraph on About is built from press facts (Hype Hair, AllHipHop, her ambassador roles).
- **Images:**
  - `files/img_model.png` (About) is unseen.
  - Sea Moss Gummies only has a WhatsApp export, so it needs a reshoot.
  - The All In / Jump Start bundle images (`IMG-211x.png`, 1536×1024) look AI-composited, so the mock-up shows a grid of the real product shots instead.
- **Bundle contents:** the All In Detox Bundle description appears to be copied from Full Body Detox Bundle B. Confirm what ships.
- **Relief products are left out.** The "Fibroid Relief" names and the "93% success rate" are disease claims.

## Conflicts in the current store

- **Refunds:** the FAQ says "no refunds unless THH is at fault", but the refund policy says 7 business days, unused, original packaging. The mock-up uses the policy.
- **P.O. box ZIP:** the FAQ says North Miami Beach FL 33164; the contact details elsewhere say Miami Beach FL 33160. The mock-up uses 33164.
- **Duplicate tea listing:** `soursop-ginger-detox-tea` ($45) duplicates `soursop-ginger-detox-tea-bags` ($45, was $65.99). Only the #1 listing is shown.
- **Claims still live in Shopify:**
  - Product descriptions and tags: cancer, diabetes, blood pressure, "BURN BELLY FAT FAST".
  - Collection descriptions.
  - The `fibroid-relief-*` handles.

## From the reviews (worth fixing in operations)

- Tea customers say the bag has no directions for use.
- One review says the tea's nutrition panel is for the gummy version.
- Several reviews mention emails with no reply, half-full bags, or wrong quantities.
