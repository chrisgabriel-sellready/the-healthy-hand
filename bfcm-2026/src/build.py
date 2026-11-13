"""Build The Healthy Hand BFCM 2026 email mockups in THH's own branding.

Branding taken from thehealthyhand.com (theme stylesheet + computed styles, Nov 2026):
Bebas Neue caps headlines, Open Sans body, coral #F3523E / orange #F8A21A / yellow #FFE638
gradients, lime #8DC63E buttons and letter-spaced "boxed" words, black utility bar,
two-tone headlines (black + coral), grey #F0F0F0 sections.

Outputs two copies of each email:
  bfcm-2026/emails/*.html   Klaviyo-ready: CDN image URLs and Klaviyo merge tags.
  bfcm-2026/preview/*.html  Browser preview: local images, merge tags rendered with their defaults.

Run:  python3 bfcm-2026/src/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------- THH brand tokens
BLACK = "#000000"
INK = "#1A1A1A"
TEXT = "#333333"      # site body text
GREY_T = "#6B6B6B"    # footer links, small print
GREY = "#F0F0F0"      # site section background
WHITE = "#FFFFFF"
CORAL = "#F3523E"     # hero, accent word in two-tone headlines
RED = "#CC1F1E"       # deep end of the red gradient
ORANGE = "#F8A21A"    # underline bars, gradient
SUN = "#FFAE2F"       # "Total Belly" orange-yellow section
YELLOW = "#FFE638"    # swoosh
LIME = "#8DC63E"      # buttons, boxed words
LEAF = "#487830"      # logo forest green: small green text on white

HEAD = "'Bebas Neue', Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif"
SANS = "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
MONO = "'Courier Prime', 'Courier New', Courier, monospace"

SITE = "https://thehealthyhand.com"

IMAGES = {
    "LOGO": ("https://thehealthyhand.com/cdn/shop/files/logo_ddd1bfa6-51a0-4ab1-aa0d-af2dddcf5d20.png?v=1625909127", "img/logo.png"),
    "TEA": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/detoxteabagmockupfront.jpg?width=600", "img/tea.jpg"),
    "CAPS": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/TotalBellyCleanseCapsuleLabel-01.jpg?width=600", "img/capsules.jpg"),
    "RESET": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/IMG-2115.png?width=600", "img/all-in-reset.png"),
}

PREVIEW_TAGS = {
    "{{ first_name|default:'love' }}": "love",
    "{% web_view 'View in browser' %}": '<a href="#" style="color:inherit;">View in browser</a>',
    "{% unsubscribe 'Unsubscribe' %}": '<a href="#" style="color:inherit;">Unsubscribe</a>',
    "{% unsubscribe 'unsubscribe here' %}": '<a href="#" style="color:inherit;">unsubscribe here</a>',
    "{% manage_preferences 'Email preferences' %}": '<a href="#" style="color:inherit;">Email preferences</a>',
    "{{ organization.full_address }}": "P.O. Box 630002, Miami Beach, FL 33160",
}

DISCLAIMER = (
    "*These statements have not been evaluated by the Food and Drug Administration. "
    "These products are not intended to diagnose, treat, cure, or prevent any disease. "
    "Individual results vary. Talk with your doctor before starting a supplement, "
    "especially if you are pregnant, nursing, or take medication."
)

GRAD_HOT = f"background:{CORAL};background-image:linear-gradient(120deg,{RED} 0%,{CORAL} 45%,{ORANGE} 100%);"
GRAD_SUN = f"background:{SUN};background-image:linear-gradient(160deg,{SUN} 0%,{ORANGE} 100%);"


# ---------------------------------------------------------------- shared parts
def head(title, preheader):
    return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {{ margin:0; padding:0; background:{GREY}; -webkit-text-size-adjust:100%; }}
  table {{ border-collapse:collapse; }}
  img {{ border:0; display:block; max-width:100%; height:auto; }}
  a {{ color:{LEAF}; }}
  .wrap {{ width:600px; max-width:100%; }}
  @media (max-width:620px) {{
    .wrap {{ width:100% !important; }}
    .px {{ padding-left:22px !important; padding-right:22px !important; }}
    .h1 {{ font-size:58px !important; line-height:54px !important; }}
    .h2 {{ font-size:38px !important; line-height:38px !important; }}
    .box {{ font-size:30px !important; letter-spacing:7px !important; }}
    .stack, .stack td {{ display:block !important; width:100% !important; box-sizing:border-box !important; }}
    .stack-img img {{ margin:0 auto; }}
    .hide-m {{ display:none !important; }}
    .tile {{ display:block !important; width:100% !important; box-sizing:border-box !important; margin-bottom:10px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{GREY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">{preheader}&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{GREY};">
<tr><td align="center" style="padding:0;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
<tr><td align="center" style="padding:10px 16px;font:12px/18px {SANS};color:{GREY_T};">{{% web_view 'View in browser' %}}</td></tr>
"""


TAIL = """</table>
</td></tr>
</table>
</body>
</html>
"""


def utility_bar(text):
    return f"""<tr><td align="center" style="background:{BLACK};padding:10px 16px;font:600 13px/18px {SANS};letter-spacing:1px;color:{WHITE};">{text}</td></tr>
"""


def header_kit():
    nav = [("Detox", "/collections/detox-collection"), ("Bundles", "/collections/bundle-deals-collection"),
           ("Capsules", "/collections/capsules-collection"), ("Gummies", "/collections/gummies-collection")]
    links = ' &nbsp; &nbsp; '.join(
        f'<a href="{SITE}{u}" style="color:{BLACK};text-decoration:none;">{n}</a>' for n, u in nav)
    return f"""<tr><td align="center" style="background:{WHITE};padding:20px 16px 8px;">
  <a href="{SITE}"><img src="%%LOGO%%" width="78" alt="The Healthy Hand" style="width:78px;"></a>
</td></tr>
<tr><td align="center" style="background:{WHITE};padding:4px 16px 16px;font:400 17px/22px {HEAD};letter-spacing:2px;text-transform:uppercase;">{links}</td></tr>
"""


def kicker(text, color=CORAL):
    return f'<p style="margin:0 0 8px;font:400 20px/22px {HEAD};letter-spacing:4px;text-transform:uppercase;color:{color};">{text}</p>'


def boxword(text, size=40):
    """THH signature: a wide-tracked word in a lime box (like 'D E T O X' on the site)."""
    return (f'<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:{LIME};padding:6px 18px 2px;">'
            f'<span class="box" style="font:400 {size}px/{size + 6}px {HEAD};letter-spacing:12px;color:{BLACK};text-transform:uppercase;">{text}</span>'
            f'</td></tr></table>')


def underline(align="left"):
    margin = "4px auto 18px" if align == "center" else "4px 0 18px"
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:{margin};">'
            f'<tr><td style="background:{ORANGE};width:64px;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr></table>')


def h2(black, accent="", color=INK, accent_color=CORAL, align="left"):
    acc = f' <span style="color:{accent_color};">{accent}</span>' if accent else ""
    return (f'<h2 class="h2" style="margin:0;font:400 46px/46px {HEAD};color:{color};text-transform:uppercase;text-align:{align};">{black}{acc}</h2>'
            + underline(align=align))


def button(label, href, bg=LIME, fg=BLACK):
    return f"""<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="{bg}" style="background:{bg};border-radius:6px;">
  <a href="{href}" style="display:inline-block;padding:14px 34px 11px;font:400 22px/24px {HEAD};letter-spacing:4px;text-transform:uppercase;color:{fg};text-decoration:none;border-radius:6px;">{label}</a>
</td></tr></table>"""


def date_tiles(second_bg=GREY):
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td class="tile" width="49%" valign="top" style="background:{LIME};padding:14px 18px 10px;">
      <p style="margin:0;font:400 16px/18px {HEAD};letter-spacing:3px;color:{BLACK};">EARLY LIST</p>
      <p style="margin:0;font:400 30px/32px {HEAD};color:{BLACK};">WED 11/25 · 6PM ET</p></td>
    <td class="hide-m" width="2%">&nbsp;</td>
    <td class="tile" width="49%" valign="top" style="background:{second_bg};padding:14px 18px 10px;">
      <p style="margin:0;font:400 16px/18px {HEAD};letter-spacing:3px;color:{GREY_T};">EVERYONE ELSE</p>
      <p style="margin:0;font:400 30px/32px {HEAD};color:{INK};">FRI 11/27 · 6AM ET</p></td>
  </tr></table>"""


def footer():
    nav = [("Detox", "/collections/detox-collection"), ("Bundles", "/collections/bundle-deals-collection"),
           ("Capsules", "/collections/capsules-collection"), ("Gummies", "/collections/gummies-collection"),
           ("FAQ", "/pages/faq")]
    links = ' &nbsp; &nbsp; '.join(
        f'<a href="{SITE}{u}" style="color:{GREY_T};text-decoration:none;">{n}</a>' for n, u in nav)
    social = ' &nbsp; · &nbsp; '.join([
        f'<a href="https://www.instagram.com/thehealthyhand_/" style="color:{BLACK};text-decoration:none;">Instagram</a>',
        f'<a href="https://www.facebook.com/TheHealthyHand" style="color:{BLACK};text-decoration:none;">Facebook</a>',
        f'<a href="https://www.youtube.com/@thehealthyhand" style="color:{BLACK};text-decoration:none;">YouTube</a>',
    ])
    return f"""<tr><td align="center" style="background:{WHITE};padding:40px 28px 6px;" class="px">
  <a href="{SITE}"><img src="%%LOGO%%" width="70" alt="The Healthy Hand" style="width:70px;"></a>
</td></tr>
<tr><td align="center" style="background:{WHITE};padding:14px 28px 4px;font:400 26px/28px {HEAD};letter-spacing:1px;color:{BLACK};text-transform:uppercase;" class="px">Allow us to be your <span style="color:{CORAL};">helping hand</span></td></tr>
<tr><td align="center" style="background:{WHITE};padding:12px 28px 6px;font:400 18px/22px {HEAD};letter-spacing:2px;text-transform:uppercase;" class="px">{social}</td></tr>
<tr><td align="center" style="background:{WHITE};padding:8px 28px 18px;font:600 12px/20px {SANS};letter-spacing:1.5px;text-transform:uppercase;" class="px">{links}</td></tr>
<tr><td align="center" style="background:{WHITE};padding:0 40px 26px;font:11px/17px {SANS};color:{GREY_T};" class="px">{DISCLAIMER}</td></tr>
<tr><td align="center" style="background:{BLACK};padding:16px 28px;font:12px/19px {SANS};color:{WHITE};" class="px">
  &copy; 2026 The Healthy Hand · {{{{ organization.full_address }}}}<br>
  {{% unsubscribe 'Unsubscribe' %}} &nbsp;·&nbsp; {{% manage_preferences 'Email preferences' %}}
</td></tr>
"""


# ---------------------------------------------------------------- email 1
def email_shay():
    early = f"{SITE}/?early=bfcm26&utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e1_note"
    body = utility_bar("Free Shipping On All Orders $100+") + f"""<tr><td align="center" style="background:{WHITE};padding:22px 16px 18px;border-bottom:6px solid {CORAL};">
  <a href="{SITE}"><img src="%%LOGO%%" width="78" alt="The Healthy Hand" style="width:78px;"></a>
</td></tr>
<tr><td style="background:{WHITE};padding:40px 48px 10px;" class="px">
  {kicker("A note from Shay")}
  <h1 class="h1" style="margin:0 0 6px;font:400 70px/64px {HEAD};color:{INK};text-transform:uppercase;">It's been</h1>
  {boxword("a while")}
  <div style="height:26px;line-height:26px;font-size:0;">&nbsp;</div>
  <!--SHAY_PHOTO-->
  <div style="font:400 17px/28px {SANS};color:{TEXT};">
    <p style="margin:0 0 18px;">Hey {{{{ first_name|default:'love' }}}},</p>
    <p style="margin:0 0 18px;">It's Shay, from The Healthy Hand. I haven't written to you since June, and that's on me.</p>
    <p style="margin:0 0 18px;">I started this company to make the herbal staples I grew up with easy to keep on a kitchen shelf: soursop and ginger for the evening cup, sea moss, black seed oil. My daughter is the reason the kids' elderberry gummies exist. She still asks for them by name.</p>
    <p style="margin:0 0 18px;">There's no sale in this email. Just a heads-up.</p>
    <p style="margin:0 0 26px;">Black Friday is the biggest sale I run all year. Before it opens to everyone, I'm letting a small list in early: <strong>Wednesday 11/25 at 6pm ET</strong>, the night before Thanksgiving. If you'd like in, tap below. That's all it takes.</p>
  </div>
  {button("Put me on the early list", early)}
</td></tr>
<tr><td style="background:{WHITE};padding:28px 48px 6px;" class="px">{date_tiles()}</td></tr>
<tr><td style="background:{WHITE};padding:26px 48px 44px;" class="px">
  <div style="font:400 17px/28px {SANS};color:{TEXT};">
    <p style="margin:0 0 18px;">And if we're not your thing anymore, no hard feelings. You can {{% unsubscribe 'unsubscribe here' %}} and I'll still be rooting for you.</p>
    <p style="margin:0 0 2px;">With love,</p>
  </div>
  <p style="margin:0;font:400 42px/44px {HEAD};letter-spacing:3px;color:{CORAL};">SHAY</p>
  <p style="margin:0;font:400 13px/20px {SANS};color:{GREY_T};">Shay Johnson, founder, The Healthy Hand</p>
</td></tr>
<tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>
"""
    return (head("A note from Shay", "No sale in this one. Just me, and a heads-up about Black Friday.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- email 2
def benefit_row(label, title, text):
    return f"""<tr><td style="padding:0 0 24px;">
  <p style="margin:0 0 2px;font:400 16px/18px {HEAD};letter-spacing:3px;color:{LEAF};">{label}</p>
  <p style="margin:0 0 4px;font:400 34px/34px {HEAD};color:{INK};text-transform:uppercase;">{title}</p>
  <p style="margin:0;font:400 16px/25px {SANS};color:{TEXT};">{text}</p>
</td></tr>"""


def step_row(num, when, text):
    return f"""<tr>
  <td width="64" valign="top" style="padding:0 0 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:{CORAL};width:46px;height:46px;border-radius:23px;font:400 30px/48px {HEAD};color:{WHITE};">{num}</td></tr></table></td>
  <td valign="top" style="padding:2px 0 20px;">
    <p style="margin:0 0 2px;font:400 24px/26px {HEAD};letter-spacing:1px;color:{INK};text-transform:uppercase;">{when}</p>
    <p style="margin:0;font:400 16px/25px {SANS};color:{TEXT};">{text}</p>
  </td>
</tr>"""


def ingredient(name, text, bar):
    return f"""<td width="33%" valign="top" style="padding:8px;"><div style="background:{WHITE};padding:16px;border-top:5px solid {bar};">
      <p style="margin:0 0 4px;font:400 24px/26px {HEAD};color:{INK};">{name}</p>
      <p style="margin:0;font:400 14px/22px {SANS};color:{TEXT};">{text}</p></div></td>"""


def email_detox():
    early = f"{SITE}/?early=bfcm26&utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e2_detox"
    tea = f"{SITE}/products/soursop-ginger-detox-tea-bags?utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e2_detox"
    body = utility_bar("Free Shipping On All Orders $100+") + header_kit() + f"""<tr><td style="{GRAD_SUN}padding:50px 48px 46px;" class="px">
  {kicker("From Shay's kitchen", color=BLACK)}
  <h1 class="h1" style="margin:0 0 6px;font:400 82px/74px {HEAD};color:{BLACK};text-transform:uppercase;">Detox,</h1>
  {boxword("honestly", 44)}
  <p style="margin:22px 0 0;font:600 18px/28px {SANS};color:{BLACK};">The word gets thrown around a lot. Here's what a reset can do for how you feel, what it can't, and how I do mine the week after Thanksgiving.</p>
</td></tr>
<tr><td style="background:{WHITE};padding:44px 48px 20px;" class="px">
  {h2("What a reset", "can do")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {benefit_row("Digestion", "Feel lighter", "Big meals sit heavy. Fiber like psyllium husk and apple fiber supports regularity, so things keep moving.*")}
    {benefit_row("Stomach", "Feel settled", "Ginger has been a go-to for an unsettled stomach for generations. It's in every cup of our tea.*")}
    {benefit_row("Routine", "Feel on track", "One cup at night, two capsules in the morning. A small ritual makes a healthier week easier to keep.")}
  </table>
</td></tr>
<tr><td style="background:{BLACK};padding:44px 48px;" class="px">
  {h2("What it", "can't do", color=WHITE)}
  <p style="margin:0 0 14px;font:400 17px/27px {SANS};color:{WHITE};">It won't undo a whole holiday overnight, and it doesn't replace water, sleep, vegetables, or your doctor.</p>
  <p style="margin:0;font:400 17px/27px {SANS};color:{WHITE};">Anyone promising you a miracle in a bottle isn't being straight with you. I'd rather you trust me.</p>
</td></tr>
<tr><td style="background:{GREY};padding:44px 48px 6px;" class="px">
  {h2("What's in", "my cup", align="center")}
  <p style="margin:0 0 18px;font:400 16px/25px {SANS};color:{TEXT};text-align:center;">Our #1 Soursop &amp; Ginger Detox Tea. Three ingredients, 30 bags.</p>
</td></tr>
<tr><td align="center" style="background:{GREY};padding:0 48px 6px;" class="px">
  <a href="{tea}"><img src="%%TEA%%" width="290" alt="The Healthy Hand Soursop &amp; Ginger Detox Tea pouch, 30 tea bags" style="width:290px;"></a>
</td></tr>
<tr><td style="background:{GREY};padding:12px 36px 40px;" class="px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>
    {ingredient("SOURSOP LEAF", "A tropical leaf steeped across the Caribbean for generations.", LIME)}
    {ingredient("GINGER ROOT", "Warming, and a classic for a settled stomach.*", ORANGE)}
    {ingredient("CINNAMON", "Warmth and a little natural sweetness. No sugar added.", CORAL)}
  </tr></table>
</td></tr>
<tr><td style="background:{WHITE};padding:44px 48px 22px;" class="px">
  {h2("My week after", "Thanksgiving")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {step_row("1", "Friday morning", "A big glass of water before coffee. Start there.")}
    {step_row("2", "Every night", "One cup of soursop and ginger tea after dinner, steeped 5 minutes.")}
    {step_row("3", "Every morning", "2 Total Belly Cleanse capsules with breakfast and a full glass of water.")}
  </table>
</td></tr>
<tr><td style="{GRAD_HOT}padding:46px 48px 48px;" class="px">
  {h2("Black Friday is", "a week away", color=WHITE, accent_color=YELLOW)}
  <p style="margin:0 0 20px;font:600 16px/25px {SANS};color:{WHITE};">The early list shops a day and a half before everyone else.</p>
  {date_tiles(second_bg=WHITE)}
  <div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>
  {button("Join the early list", early)}
</td></tr>
"""
    return (head("Detox, honestly", "What a reset can do, what it can't, and how I do mine after Thanksgiving.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- email 4
RECEIPT_ITEMS = [
    ("Turkey, dark meat", "1"),
    ("Mac &amp; cheese (corner piece)", "2"),
    ("Candied yams", "2"),
    ("Collard greens", "1"),
    ("Dressing", "1"),
    ("Dinner rolls", "3"),
    ("Sweet potato pie", "1"),
    ("&ldquo;Just a sliver&rdquo; more pie", "1"),
    ("Nap, couch, 4:40pm", "1"),
]


def receipt():
    rows = "".join(
        f'<tr><td style="padding:3px 0;font:400 15px/22px {MONO};color:{INK};text-transform:uppercase;">{i}</td>'
        f'<td align="right" style="padding:3px 0;font:700 15px/22px {MONO};color:{INK};">{q}</td></tr>'
        for i, q in RECEIPT_ITEMS)
    total = sum(int(q) for _, q in RECEIPT_ITEMS)
    dash = '<tr><td colspan="2" style="padding:10px 0;"><div style="border-top:2px dashed #BDBDBD;font-size:0;line-height:0;">&nbsp;</div></td></tr>'
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{WHITE};box-shadow:0 14px 30px rgba(0,0,0,0.22);">
<tr><td style="padding:26px 28px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td colspan="2" align="center" style="font:700 16px/22px {MONO};letter-spacing:2px;color:{INK};">THE KITCHEN TABLE</td></tr>
    <tr><td colspan="2" align="center" style="padding:2px 0 0;font:400 13px/20px {MONO};color:{GREY_T};">THU 11/26/2026 &nbsp;·&nbsp; PARTY OF: EVERYBODY</td></tr>
    {dash}
    {rows}
    {dash}
    <tr><td style="font:400 15px/22px {MONO};color:{INK};">ITEMS</td><td align="right" style="font:700 15px/22px {MONO};color:{INK};">{total}</td></tr>
    <tr><td style="padding:6px 0 0;font:700 17px/24px {MONO};color:{RED};">BALANCE DUE</td><td align="right" style="padding:6px 0 0;font:700 17px/24px {MONO};color:{RED};">1 GOOD RESET</td></tr>
    {dash}
    <tr><td colspan="2" align="center" style="font:400 13px/20px {MONO};color:{GREY_T};">THANK YOU FOR EATING WITH US<br>NO RETURNS ON PIE</td></tr>
  </table>
</td></tr></table>"""


def product_row(img_key, alt, kicker_text, name, text, label, href):
    return f"""<tr><td style="padding:0 0 18px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack" style="background:{WHITE};"><tr>
    <td class="stack-img" width="210" valign="middle" style="padding:0;">
      <a href="{href}"><img src="%%{img_key}%%" width="210" alt="{alt}" style="width:210px;"></a></td>
    <td valign="middle" style="padding:18px 22px;">
      <p style="margin:0 0 2px;font:400 16px/18px {HEAD};letter-spacing:3px;color:{CORAL};">{kicker_text}</p>
      <p style="margin:0 0 6px;font:400 30px/30px {HEAD};color:{INK};text-transform:uppercase;">{name}</p>
      <p style="margin:0 0 14px;font:400 15px/23px {SANS};color:{TEXT};">{text}</p>
      {button(label, href)}
    </td>
  </tr></table>
</td></tr>"""


def email_plate():
    utm = "utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e4_plate"
    sale = f"{SITE}/collections/detox-collection?{utm}"
    body = utility_bar("Black Friday: 40% Off Everything · No Code Needed") + header_kit() + f"""<tr><td style="{GRAD_HOT}padding:46px 48px 18px;" class="px">
  {kicker("Black Friday", color=YELLOW)}
  <h1 class="h1" style="margin:0 0 6px;font:400 84px/76px {HEAD};color:{WHITE};text-transform:uppercase;">The plate</h1>
  {boxword("report", 46)}
  <p style="margin:20px 0 28px;font:600 18px/28px {SANS};color:{WHITE};">Yesterday, itemized. No judgment. We were at the table too.</p>
</td></tr>
<tr><td style="{GRAD_HOT}padding:0 64px 30px;" class="px">{receipt()}</td></tr>
<tr><td style="background:{YELLOW};padding:22px 64px 24px;" class="px">
  <p style="margin:0;font:italic 400 18px/27px {SANS};color:{BLACK};">&ldquo;I went back for the yams twice. Nobody's judging anybody here.&rdquo;</p>
  <p style="margin:4px 0 0;font:400 18px/20px {HEAD};letter-spacing:2px;color:{BLACK};">SHAY, FOUNDER</p>
</td></tr>
<tr><td style="background:{WHITE};padding:46px 48px 8px;" class="px">
  {h2("Friday's for", "the reset")}
  <p style="margin:0 0 14px;font:400 17px/27px {SANS};color:{TEXT};">After a plate like that, most of us wake up feeling it: heavy, sluggish, a little off.</p>
  <p style="margin:0 0 28px;font:400 17px/27px {SANS};color:{TEXT};">A few days of fiber, warm tea and plenty of water helps you feel like yourself again. And this weekend, everything that helps is 40% off.</p>
</td></tr>
<tr><td style="background:{WHITE};padding:0 48px 46px;" class="px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:3px dashed {CORAL};"><tr><td align="center" style="padding:26px 22px 30px;">
    <p style="margin:0;font:400 20px/22px {HEAD};letter-spacing:4px;color:{INK};">FRI 11/27 TO MON 11/30</p>
    <p style="margin:4px 0 2px;font:400 80px/74px {HEAD};color:{CORAL};">40% OFF</p>
    <p style="margin:0 0 10px;font:400 34px/34px {HEAD};letter-spacing:8px;color:{INK};">EVERYTHING</p>
    <p style="margin:0 0 22px;font:400 16px/24px {SANS};color:{TEXT};">No code needed. Prices drop at checkout.<br>Ends Monday 11/30 at 11:59pm ET.</p>
    {button("Shop the sale", sale)}
  </td></tr></table>
</td></tr>
<tr><td style="background:{GREY};padding:46px 40px 22px;" class="px">
  {h2("Your reset,", "three ways", align="center")}
  <p style="margin:0 0 26px;font:400 16px/25px {SANS};color:{TEXT};text-align:center;">Start small or go all in. All 40% off through Monday.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {product_row("TEA", "Soursop &amp; Ginger Detox Tea pouch, 30 tea bags", "The nightly cup", "Soursop &amp; Ginger Detox Tea", "30 bags of organic soursop, ginger and cinnamon. Steep 5 minutes after dinner.", "Shop the tea", f"{SITE}/products/soursop-ginger-detox-tea-bags?{utm}")}
    {product_row("CAPS", "Total Belly Cleanse Capsules bottle, 60 capsules", "The morning two", "Total Belly Cleanse Capsules", "Psyllium husk, apple fiber and senna leaf to support regularity.* 2 capsules with breakfast.", "Shop capsules", f"{SITE}/products/total-belly-cleanse-capsules?{utm}")}
    {product_row("RESET", "All In Reset Bundle: detox powders, tea and capsules", "The full reset", "All In Reset Bundle", "Seven of our staples in one box, kids' elderberry gummies included. Already our best value.", "Shop the bundle", f"{SITE}/products/all-in-detox-bundle-deal?{utm}")}
  </table>
</td></tr>
<tr><td align="center" style="{GRAD_HOT}padding:50px 40px 52px;" class="px">
  <h2 class="h2" style="margin:0;font:400 54px/52px {HEAD};color:{WHITE};text-transform:uppercase;">Leftovers keep.</h2>
  <h2 class="h2" style="margin:0 0 12px;font:400 54px/52px {HEAD};color:{YELLOW};text-transform:uppercase;">This price doesn't.</h2>
  <p style="margin:0 0 24px;font:600 16px/25px {SANS};color:{WHITE};">40% off everything ends Monday 11/30 at 11:59pm ET.</p>
  {button("Shop the sale", sale)}
</td></tr>
"""
    return (head("The plate report", "Mac and cheese x2. Pie, technically twice. Friday's for the reset: 40% off, no code.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- write
PHOTO_PREVIEW = f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;"><tr><td align="center" style="background:{GREY};border:2px dashed #BDBDBD;padding:56px 20px;font:400 24px/28px {HEAD};letter-spacing:2px;color:{CORAL};">PHOTO NEEDED<br><span style="font:400 14px/22px {SANS};letter-spacing:0;color:{GREY_T};">Shay in her kitchen, mug of tea in hand, bright natural light. 1200&times;800, alt: &ldquo;Shay Johnson, founder of The Healthy Hand&rdquo;</span></td></tr></table>"""
PHOTO_KLAVIYO = """<!-- PHOTO NEEDED: Shay in her kitchen with a mug of tea (1200x800). Upload to Klaviyo and replace this comment with:
<img src="SHAY_PHOTO_URL" width="504" alt="Shay Johnson, founder of The Healthy Hand" style="width:100%;margin:0 0 26px;"> -->"""

EMAILS = {
    "01-note-from-shay.html": email_shay,
    "02-detox-honestly.html": email_detox,
    "04-the-plate-report.html": email_plate,
}


def render(html, preview):
    for key, (cdn, local) in IMAGES.items():
        html = html.replace(f"%%{key}%%", local if preview else cdn)
    html = html.replace("<!--SHAY_PHOTO-->", PHOTO_PREVIEW if preview else PHOTO_KLAVIYO)
    if preview:
        for tag, shown in PREVIEW_TAGS.items():
            html = html.replace(tag, shown)
        leftover = re.findall(r"\{[{%][^}]*[}%]\}", html)
        assert not leftover, f"unrendered Klaviyo tags in preview: {leftover}"
    return html


def main():
    for name, fn in EMAILS.items():
        html = fn()
        (ROOT / "emails" / name).write_text(render(html, preview=False))
        (ROOT / "preview" / name).write_text(render(html, preview=True))
        print("built", name)


if __name__ == "__main__":
    main()
