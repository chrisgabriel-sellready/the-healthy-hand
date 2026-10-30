# The Healthy Hand: Shopify theme

This is THH's live theme export ("master – new with installments message", 30 Oct 2026), redesigned to match the approved mock-up. The mock-up is kept in git history at commit `d589729`, under `mockup/`.

## How it's built

- **New layout:** `layout/thh.liquid` holds the mock-up's header, footer, drawers and sign-up band. It carries over all of THH's tracking and app code from `layout/theme.liquid`:
  - Triple Whale, gtag, both GTM containers, simpli.fi and Klaviyo onsite.
  - Google remarketing.
  - Bold, Sezzle, Loox, Yotpo, Stamped, QuadPay and Affirm hooks, behind the same theme settings as before.
- **Dropped from the new layout:**
  - Google Optimize. Google shut it down in 2023 and the script only slowed the page.
  - The old jQuery Mobile, Foundation and Revolution slider stack.
  - The obfuscated `keypass` script. It's a licence check for the old theme's JavaScript, which the new layout doesn't load.
- **Old layout:** `layout/theme.liquid` and the old sections and snippets are untouched. Customer account, blog, gift card, booking and HealthyText subscribe pages still use it.
- **New code:** every new file starts with `thh-`:
  - `sections/thh-*.liquid`
  - `snippets/thh-*.liquid`
  - `assets/thh-theme.css`, the mock-up's stylesheet unchanged
  - `assets/thh-theme.js`, the mock-up's script, now on Shopify's AJAX cart and predictive search
  - `assets/thh-detox-kit.webp`, the retouched kit photo
- **Templates (JSON):** these replace the `.liquid` templates of the same name, and each sets `"layout": "thh"`.

| Template | Page |
|---|---|
| `index.json` | Home |
| `collection.json` | Every collection |
| `product.json` | Every product |
| `page.Our-Why.json` | About Us (already assigned) |
| `page.FAQ.json` | FAQ (already assigned) |
| `page.collabs.json` | Become an Affiliate (already assigned; the Shopify Collabs form sits inside the new section) |
| `page.contact.json` | Contact |
| `page.fibroids.json` | What are fibroids? |
| `page.json` | Any other page |
| `cart.json` | Cart page |
| `search.json` | Search |
| `404.json` | Page not found |

- **Content and media:**
  - Products, prices, images, Loox ratings and reviews come from the store.
  - Theme images point at files already in Settings → Files: `img_model.png`, `detoxteabagmockupfront.jpg`, the five `Screen_Shot_2021-08-15…` video thumbnails and the backgrounds.
  - Videos use THH's Shopify-hosted MP4s.
  - Everything is editable in the theme editor.

## Before publishing (in Shopify admin)

1. **Connect or upload the theme.** In Online Store → Themes, choose Add theme → Connect from GitHub → this branch. It's added as an unpublished theme, so preview it before publishing.
2. **Main menu: done.** The header uses a new menu, `thh-main-menu` ("THH main menu (redesign)"). It has Home, All Products (with Detox, Detox Tea, Bundle Deals, Capsules, Gummies and Black Seed Oil under it), Bundle Deals, About Us, FAQ, Become an Affiliate and Contact Us. The live site's menus (`main-menu-new`, `main-menu`) were not changed. Any link with child links becomes a dropdown.
3. **Footer menu: done.** The footer uses the existing `footer-menu-new` (Reviews, Privacy Policy, Shipping & Returns, FAQ, Help, What are fibroids?).
4. **Contact and Fibroids pages: done, without changing page templates.** Both pages use the default template. The new `page.json` shows the mock-up's contact layout and form on `contact-us`, and the "not medical advice" notice on `what-are-fibroids`. The handles are set in the page sections in the theme editor. Changing the pages' templates in admin would also change the live site, so they were left alone. (`page.contact.json` and `page.fibroids.json` still exist if you'd rather assign templates after publishing.)
5. **Sign-up band: done.** Above the footer is THH's "Join our Mailing List and stay updated" email sign-up, in the live site's style (Work Sans heading, lime Sign Up button). It uses Shopify's newsletter form, so sign-ups are saved as customers with email marketing consent, and Klaviyo's Shopify integration picks them up. The live site's own Klaviyo footer form has an empty list ID (`g=""`), so its sign-ups probably aren't reaching a list. The band can be switched back to the HealthyText text sign-up in the theme editor: VIA keyword `6123f00bd49731000806fd85`, or a Klaviyo SMS list.
6. **Optional product metafields** (Settings → Custom data → Products):

| Metafield | Type | Shows as |
|---|---|---|
| `custom.subtitle` | single line text | Line under the product title |
| `custom.ingredients` | multi-line text | "What's inside" accordion |
| `custom.how_to_use` | list of single line text | "How to use" accordion |
| `custom.free_from` | list of single line text | "Free from" pills |
| `custom.badge` | single line text | e.g. "BOGO" on cards |
| `custom.collage_products` | list of products | Bundle contents: a 2×2 collage instead of the AI-looking bundle images, plus a "What's included" list |

## Flags

- **Product descriptions** come straight from Shopify, and several still make disease and weight-loss claims (cancer, diabetes, "BURN BELLY FAT FAST"). The mock-up showed cleaned-up copy. Edit the descriptions in Shopify before launch.
- **About page captions:** 3 of the 5 customer video captions make weight or immune claims. They're kept as on the live site.
- **Reviews:** product-page reviews containing weight, fat or disease words are hidden. The word list is in the reviews section settings.
- **Our Story video:** the file in Shopify is named `y2mate.com_-_facing_my_fibroids_…mp4`, which looks like a YouTube download. Confirm it's THH's own video.
- **Packaging:** the Detox Kit pouches say "Flush Belly Fat Fast" and "LOSE WEIGHT".
- **Store conflicts:**
  - The FAQ refund text doesn't match the refund policy.
  - Two different P.O. box ZIP codes are listed: 33164 and 33160.
  - There's a duplicate tea listing.

## Checks run

- **Theme Check** (`@shopify/theme-check-node`): no errors in the new files.
  - The only reports are image width/height hints, which the mock-up's own markup also lacks.
  - It also reports parser warnings on THH's existing tracking scripts, which show up the same way on the current `theme.liquid`.
- **Structure and pixel comparison:** every template was rendered locally (liquidjs, with the mock-up's catalog as data) and compared with the mock-up page by page.
  - Home, About, FAQ, Contact and Collection match the mock-up's structure and are pixel-identical at 390px and 1280px.
  - The product page matches except for the mock-up's sample-reviews note.
  - Affiliate shows the real Collabs form in place of the mock form.
- **Browser checks:**
  - Dropdown, mobile menu, slideshow, cart drawer (add, quantity, remove, free-shipping bar), predictive search, product gallery, "Show more reviews" and YouTube click-to-play all work.
  - No script errors and no sideways scroll at 390px or 1280px.
