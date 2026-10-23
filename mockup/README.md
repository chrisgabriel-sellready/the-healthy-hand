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

## How it maps to Kemp

Structure, spacing and section CSS come from `chrisgabriel-sellready/kb_global_updates` (Dawn 7.0.1), which was read-only and not changed. That includes `kb-refresh.css`, `kb-collection-cards.css`, the kb-* sections, and the slideshow, header and footer settings.

Homepage order follows Kemp's `templates/index.json`:

| Kemp section | THH version |
|---|---|
| `slideshow-new` | Tea / Kit / Total System slides |
| `kb-film-player` | Our Story |
| Dana's Edit | Shay's Picks (the real `shay-johnsons-top-picks` collection) |
| `kb-game-day` row | Loox customer photos |
| `kb-home-reel` | Pour, shake & drink |
| Lash Essentials | Bundle Deals |
| Two-panel banner | Detox / Capsules |
| `kb-performance-video` | All natural health & wellness |
| `multicolumn` How it works | THH's FAQ steps |
| `testimonial` | Verified reviews, without before/after tags |

Only the brand tokens change, at the top of `assets/thh-theme.css`:
- **Fonts:** THH's live Bebas Neue, Oswald and Open Sans.
- **Lime buttons:** `#8dc63f` with black text. White on lime fails contrast.
- **Coral accent:** `#f2613d`, deepened to `#e2502c` for text.
- **Sale badge:** `#c73a22`.

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
