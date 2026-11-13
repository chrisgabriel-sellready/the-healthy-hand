"""Build The Healthy Hand BFCM 2026 emails.

Outputs two copies of each email:
  bfcm-2026/emails/*.html   Klaviyo-ready: CDN image URLs and Klaviyo merge tags.
  bfcm-2026/preview/*.html  Browser preview: local images, merge tags rendered with their defaults.

Run:  python3 bfcm-2026/src/build.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------- brand tokens
CREAM = "#F9F6F1"
PAPER = "#FFFFFF"
INK = "#1F1F1C"
MUTED = "#55544C"
GREEN = "#3A6B2E"   # Hand Green: buttons, links, kickers
ROOT_G = "#22351C"  # Root: utility bar, dark bands, footer
SAGE = "#E9EEDF"    # tint for soft sections
TOMATO = "#CC3523"  # offers only
SUN = "#F4B41A"     # small highlights only
LINE = "#E4DED3"

SERIF = "'Fraunces', Georgia, 'Times New Roman', serif"
SANS = "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif"
MONO = "'Courier Prime', 'Courier New', Courier, monospace"

SITE = "https://thehealthyhand.com"

IMAGES = {
    "LOGO": ("https://thehealthyhand.com/cdn/shop/files/logo_ddd1bfa6-51a0-4ab1-aa0d-af2dddcf5d20.png?v=1625909127", "img/logo.png"),
    "TEA": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/detoxteabagmockupfront.jpg?width=600", "img/tea.jpg"),
    "CAPS": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/TotalBellyCleanseCapsuleLabel-01.jpg?width=600", "img/capsules.jpg"),
    "RESET": ("https://cdn.shopify.com/s/files/1/0076/4644/5639/files/IMG-2115.png?width=600", "img/all-in-reset.png"),
}

# Klaviyo tag -> what the preview shows instead
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
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=Poppins:wght@400;500;600&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {{ margin:0; padding:0; background:{CREAM}; -webkit-text-size-adjust:100%; }}
  table {{ border-collapse:collapse; }}
  img {{ border:0; display:block; max-width:100%; height:auto; }}
  a {{ color:{GREEN}; }}
  .wrap {{ width:600px; max-width:100%; }}
  .btn a {{ display:inline-block; }}
  @media (max-width:620px) {{
    .wrap {{ width:100% !important; }}
    .px {{ padding-left:22px !important; padding-right:22px !important; }}
    .h1 {{ font-size:36px !important; line-height:40px !important; }}
    .h2 {{ font-size:27px !important; line-height:32px !important; }}
    .stack, .stack td {{ display:block !important; width:100% !important; box-sizing:border-box !important; }}
    .stack-img {{ padding:0 0 14px 0 !important; }}
    .hide-m {{ display:none !important; }}
    .tile {{ display:block !important; width:100% !important; box-sizing:border-box !important; margin-bottom:10px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:{CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">{preheader}&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;&#8202;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CREAM};">
<tr><td align="center" style="padding:0;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
<tr><td align="center" style="padding:10px 16px;font:12px/18px {SANS};color:{MUTED};">{{% web_view 'View in browser' %}}</td></tr>
"""


TAIL = """</table>
</td></tr>
</table>
</body>
</html>
"""


def utility_bar(text, bg=ROOT_G):
    return f"""<tr><td align="center" style="background:{bg};padding:11px 16px;font:600 12px/16px {SANS};letter-spacing:2px;text-transform:uppercase;color:{CREAM};">{text}</td></tr>
"""


def header_kit():
    nav = [("Detox", "/collections/detox-collection"), ("Bundles", "/collections/bundle-deals-collection"),
           ("Capsules", "/collections/capsules-collection"), ("Gummies", "/collections/gummies-collection")]
    links = ' <span style="color:#B9B3A6;">&nbsp;·&nbsp;</span> '.join(
        f'<a href="{SITE}{u}" style="color:{INK};text-decoration:none;">{n}</a>' for n, u in nav)
    return f"""<tr><td align="center" style="background:{PAPER};padding:22px 16px 10px;">
  <a href="{SITE}"><img src="%%LOGO%%" width="64" alt="The Healthy Hand" style="width:64px;"></a>
</td></tr>
<tr><td align="center" style="background:{PAPER};padding:4px 16px 18px;border-bottom:1px solid {LINE};font:500 12px/18px {SANS};letter-spacing:1.6px;text-transform:uppercase;">{links}</td></tr>
"""


def button(label, href, bg=GREEN, fg="#FFFFFF"):
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" class="btn"><tr><td align="center" bgcolor="{bg}" style="background:{bg};border-radius:6px;">
  <a href="{href}" style="display:inline-block;padding:15px 34px;font:600 15px/18px {SANS};letter-spacing:0.6px;color:{fg};text-decoration:none;border-radius:6px;">{label}</a>
</td></tr></table>"""


def footer():
    nav = [("Detox", "/collections/detox-collection"), ("Bundles", "/collections/bundle-deals-collection"),
           ("Capsules", "/collections/capsules-collection"), ("Gummies", "/collections/gummies-collection")]
    links = ' &nbsp; '.join(
        f'<a href="{SITE}{u}" style="color:{CREAM};text-decoration:none;">{n}</a>' for n, u in nav)
    social = ' &nbsp;·&nbsp; '.join([
        f'<a href="https://www.instagram.com/thehealthyhand_/" style="color:{CREAM};">Instagram @thehealthyhand_</a>',
        f'<a href="https://www.facebook.com/TheHealthyHand" style="color:{CREAM};">Facebook</a>',
    ])
    return f"""<tr><td align="center" style="background:{ROOT_G};padding:40px 28px 14px;" class="px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:{CREAM};border-radius:14px;padding:10px 12px;">
    <a href="{SITE}"><img src="%%LOGO%%" width="52" alt="The Healthy Hand" style="width:52px;"></a>
  </td></tr></table>
</td></tr>
<tr><td align="center" style="background:{ROOT_G};padding:10px 28px 6px;font:italic 400 17px/24px {SERIF};color:{CREAM};" class="px">Herbal staples from Shay Johnson's family to yours.</td></tr>
<tr><td align="center" style="background:{ROOT_G};padding:14px 28px;font:600 12px/18px {SANS};letter-spacing:1.6px;text-transform:uppercase;" class="px">{links}</td></tr>
<tr><td align="center" style="background:{ROOT_G};padding:0 28px 22px;font:13px/20px {SANS};color:{CREAM};" class="px">{social}</td></tr>
<tr><td style="background:{ROOT_G};padding:0 28px;" class="px"><div style="border-top:1px solid #3C5234;font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr><td align="center" style="background:{ROOT_G};padding:20px 36px 10px;font:11px/17px {SANS};color:#C9D2BE;" class="px">{DISCLAIMER}</td></tr>
<tr><td align="center" style="background:{ROOT_G};padding:6px 28px 40px;font:11px/17px {SANS};color:#C9D2BE;" class="px">
  The Healthy Hand · {{{{ organization.full_address }}}}<br>
  {{% unsubscribe 'Unsubscribe' %}} &nbsp;·&nbsp; {{% manage_preferences 'Email preferences' %}}
</td></tr>
"""


# ---------------------------------------------------------------- email 1
def email_shay():
    early = f"{SITE}/?early=bfcm26&utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e1_note"
    body = f"""<tr><td align="center" style="padding:26px 16px 22px;">
  <a href="{SITE}"><img src="%%LOGO%%" width="58" alt="The Healthy Hand" style="width:58px;"></a>
</td></tr>
<tr><td style="background:{PAPER};border-radius:4px;padding:46px 48px 18px;border-top:4px solid {GREEN};" class="px">
  <p style="margin:0 0 14px;font:600 12px/16px {SANS};letter-spacing:2.4px;text-transform:uppercase;color:{GREEN};">A note from Shay</p>
  <h1 class="h1" style="margin:0 0 26px;font:400 42px/46px {SERIF};color:{INK};">It's been a <em style="font-style:italic;">while.</em></h1>
  <!--SHAY_PHOTO-->
  <div style="font:400 17px/28px {SANS};color:{INK};">
    <p style="margin:0 0 18px;">Hi {{{{ first_name|default:'love' }}}},</p>
    <p style="margin:0 0 18px;">It's Shay, from The Healthy Hand. I haven't written to you since June, and that's on me.</p>
    <p style="margin:0 0 18px;">I started this company to make the herbal staples I grew up with easy to keep on a kitchen shelf: soursop and ginger for the evening cup, sea moss, black seed oil. My daughter is the reason the kids' elderberry gummies exist. She still asks for them by name.</p>
    <p style="margin:0 0 18px;">There's no sale in this email. Just a heads-up.</p>
    <p style="margin:0 0 26px;">Black Friday is the biggest sale I run all year. Before it opens to everyone, I'm letting a small list in early: <strong>Wednesday 11/25 at 6pm ET</strong>, the night before Thanksgiving. If you'd like in, tap below. That's all it takes.</p>
  </div>
  {button("Put me on the early list", early)}
</td></tr>
<tr><td style="background:{PAPER};padding:26px 48px 8px;" class="px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:{SAGE};border-radius:8px;padding:18px 22px;font:400 15px/23px {SANS};color:{INK};">
    <strong style="font-weight:600;">Early list</strong> &nbsp;Shop Wed 11/25, 6pm ET<br>
    <strong style="font-weight:600;">Everyone else</strong> &nbsp;Fri 11/27, 6am ET
  </td></tr></table>
</td></tr>
<tr><td style="background:{PAPER};padding:26px 48px 46px;" class="px">
  <div style="font:400 17px/28px {SANS};color:{INK};">
    <p style="margin:0 0 18px;">And if we're not your thing anymore, no hard feelings. You can {{% unsubscribe 'unsubscribe here' %}} and I'll still be rooting for you.</p>
    <p style="margin:0 0 4px;">With love,</p>
  </div>
  <p style="margin:0;font:italic 400 34px/40px {SERIF};color:{GREEN};">Shay</p>
  <p style="margin:2px 0 0;font:400 13px/20px {SANS};color:{MUTED};">Shay Johnson, founder, The Healthy Hand</p>
</td></tr>
<tr><td style="height:28px;line-height:28px;font-size:0;">&nbsp;</td></tr>
"""
    return (head("A note from Shay", "No sale in this one. Just me, and a heads-up about Black Friday.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- email 2
def benefit_row(label, title, text):
    return f"""<tr><td style="padding:0 0 26px;">
  <p style="margin:0 0 6px;font:600 11px/14px {SANS};letter-spacing:2.2px;text-transform:uppercase;color:{GREEN};">{label}</p>
  <p style="margin:0 0 6px;font:600 24px/30px {SERIF};color:{INK};">{title}</p>
  <p style="margin:0;font:400 16px/25px {SANS};color:{MUTED};">{text}</p>
</td></tr>"""


def step_row(num, when, text):
    return f"""<tr>
  <td width="58" valign="top" style="padding:0 0 22px;font:400 44px/44px {SERIF};color:{GREEN};">{num}</td>
  <td valign="top" style="padding:4px 0 22px;">
    <p style="margin:0 0 4px;font:600 16px/22px {SANS};color:{INK};">{when}</p>
    <p style="margin:0;font:400 16px/25px {SANS};color:{MUTED};">{text}</p>
  </td>
</tr>"""


def email_detox():
    early = f"{SITE}/?early=bfcm26&utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e2_detox"
    tea = f"{SITE}/products/soursop-ginger-detox-tea-bags?utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e2_detox"
    body = utility_bar("Free shipping on orders $100+") + header_kit() + f"""<tr><td style="background:{SAGE};padding:54px 48px 50px;" class="px">
  <p style="margin:0 0 14px;font:600 12px/16px {SANS};letter-spacing:2.4px;text-transform:uppercase;color:{GREEN};">From Shay's kitchen</p>
  <h1 class="h1" style="margin:0 0 18px;font:400 50px/54px {SERIF};color:{INK};">Detox, <em style="font-style:italic;">honestly.</em></h1>
  <p style="margin:0;font:400 18px/28px {SANS};color:{INK};">The word gets thrown around a lot. Here's what a reset can do for how you feel, what it can't, and how I do mine the week after Thanksgiving.</p>
</td></tr>
<tr><td style="background:{PAPER};padding:46px 48px 20px;" class="px">
  <h2 class="h2" style="margin:0 0 28px;font:400 32px/38px {SERIF};color:{INK};">What a reset can do</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {benefit_row("Digestion", "Feel lighter.", "Big meals sit heavy. Fiber like psyllium husk and apple fiber supports regularity, so things keep moving.*")}
    {benefit_row("Stomach", "Feel settled.", "Ginger has been a go-to for an unsettled stomach for generations. It's in every cup of our tea.*")}
    {benefit_row("Routine", "Feel on track.", "One cup at night, two capsules in the morning. A small ritual makes a healthier week easier to keep.")}
  </table>
</td></tr>
<tr><td style="background:{ROOT_G};padding:46px 48px;" class="px">
  <h2 class="h2" style="margin:0 0 16px;font:400 32px/38px {SERIF};color:{CREAM};">What it <em style="font-style:italic;">can't</em> do</h2>
  <p style="margin:0 0 14px;font:400 17px/27px {SANS};color:{CREAM};">It won't undo a whole holiday overnight, and it doesn't replace water, sleep, vegetables, or your doctor.</p>
  <p style="margin:0;font:400 17px/27px {SANS};color:{CREAM};">Anyone promising you a miracle in a bottle isn't being straight with you. I'd rather you trust me.</p>
</td></tr>
<tr><td style="background:{PAPER};padding:46px 48px 10px;" class="px">
  <h2 class="h2" style="margin:0 0 6px;font:400 32px/38px {SERIF};color:{INK};">What's in my cup</h2>
  <p style="margin:0 0 20px;font:400 16px/25px {SANS};color:{MUTED};">Our #1 Soursop &amp; Ginger Detox Tea. Three ingredients, 30 bags.</p>
</td></tr>
<tr><td align="center" style="background:{PAPER};padding:0 48px 8px;" class="px">
  <a href="{tea}"><img src="%%TEA%%" width="300" alt="The Healthy Hand Soursop &amp; Ginger Detox Tea pouch, 30 tea bags" style="width:300px;"></a>
</td></tr>
<tr><td style="background:{PAPER};padding:10px 36px 40px;" class="px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>
    <td width="33%" valign="top" style="padding:12px;border-top:2px solid {GREEN};">
      <p style="margin:0 0 6px;font:600 18px/24px {SERIF};color:{INK};">Soursop leaf</p>
      <p style="margin:0;font:400 14px/22px {SANS};color:{MUTED};">A tropical leaf steeped across the Caribbean for generations.</p></td>
    <td width="33%" valign="top" style="padding:12px;border-top:2px solid {GREEN};">
      <p style="margin:0 0 6px;font:600 18px/24px {SERIF};color:{INK};">Ginger root</p>
      <p style="margin:0;font:400 14px/22px {SANS};color:{MUTED};">Warming, and a classic for a settled stomach.*</p></td>
    <td width="33%" valign="top" style="padding:12px;border-top:2px solid {GREEN};">
      <p style="margin:0 0 6px;font:600 18px/24px {SERIF};color:{INK};">Cinnamon</p>
      <p style="margin:0;font:400 14px/22px {SANS};color:{MUTED};">Warmth and a little natural sweetness. No sugar added.</p></td>
  </tr></table>
</td></tr>
<tr><td style="background:{CREAM};padding:46px 48px 24px;" class="px">
  <h2 class="h2" style="margin:0 0 24px;font:400 32px/38px {SERIF};color:{INK};">My week after Thanksgiving</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {step_row("1", "Friday morning", "A big glass of water before coffee. Start there.")}
    {step_row("2", "Every night", "One cup of soursop and ginger tea after dinner, steeped 5 minutes.")}
    {step_row("3", "Every morning", "2 Total Belly Cleanse capsules with breakfast and a full glass of water.")}
  </table>
</td></tr>
<tr><td style="background:{PAPER};padding:46px 48px 48px;border-top:1px solid {LINE};" class="px">
  <h2 class="h2" style="margin:0 0 8px;font:400 32px/38px {SERIF};color:{INK};">Black Friday is a week away</h2>
  <p style="margin:0 0 22px;font:400 16px/25px {SANS};color:{MUTED};">The early list shops a day and a half before everyone else.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td class="tile" width="49%" valign="top" style="background:{SAGE};border-radius:8px;padding:18px 20px;">
      <p style="margin:0 0 4px;font:600 11px/14px {SANS};letter-spacing:2px;text-transform:uppercase;color:{GREEN};">Early list</p>
      <p style="margin:0;font:600 20px/26px {SERIF};color:{INK};">Wed 11/25 · 6pm ET</p></td>
    <td class="hide-m" width="2%">&nbsp;</td>
    <td class="tile" width="49%" valign="top" style="background:{CREAM};border-radius:8px;padding:18px 20px;border:1px solid {LINE};">
      <p style="margin:0 0 4px;font:600 11px/14px {SANS};letter-spacing:2px;text-transform:uppercase;color:{MUTED};">Everyone</p>
      <p style="margin:0;font:600 20px/26px {SERIF};color:{INK};">Fri 11/27 · 6am ET</p></td>
  </tr></table>
  <div style="height:26px;line-height:26px;font-size:0;">&nbsp;</div>
  {button("Join the early list", early)}
</td></tr>
"""
    return (head("Detox, honestly", "What a reset can do, what it can't, and how I do mine after Thanksgiving.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- email 3
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
    dash = f'<tr><td colspan="2" style="padding:10px 0;"><div style="border-top:2px dashed #BDB6A8;font-size:0;line-height:0;">&nbsp;</div></td></tr>'
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{PAPER};border:1px solid {LINE};box-shadow:0 10px 24px rgba(31,31,28,0.08);">
<tr><td style="padding:26px 28px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td colspan="2" align="center" style="font:700 16px/22px {MONO};letter-spacing:2px;color:{INK};">THE KITCHEN TABLE</td></tr>
    <tr><td colspan="2" align="center" style="padding:2px 0 0;font:400 13px/20px {MONO};color:{MUTED};">THU 11/26/2026 &nbsp;·&nbsp; PARTY OF: EVERYBODY</td></tr>
    {dash}
    {rows}
    {dash}
    <tr><td style="font:400 15px/22px {MONO};color:{INK};">ITEMS</td><td align="right" style="font:700 15px/22px {MONO};color:{INK};">{total}</td></tr>
    <tr><td style="padding:6px 0 0;font:700 17px/24px {MONO};color:{TOMATO};">BALANCE DUE</td><td align="right" style="padding:6px 0 0;font:700 17px/24px {MONO};color:{TOMATO};">1 GOOD RESET</td></tr>
    {dash}
    <tr><td colspan="2" align="center" style="font:400 13px/20px {MONO};color:{MUTED};">THANK YOU FOR EATING WITH US<br>NO RETURNS ON PIE</td></tr>
  </table>
</td></tr></table>"""


def product_row(img_key, alt, kicker, name, text, label, href):
    return f"""<tr><td style="padding:0 0 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>
    <td class="stack-img" width="200" valign="middle" style="padding:0 24px 0 0;">
      <a href="{href}"><img src="%%{img_key}%%" width="200" alt="{alt}" style="width:200px;border-radius:8px;border:1px solid {LINE};"></a></td>
    <td valign="middle">
      <p style="margin:0 0 6px;font:600 11px/14px {SANS};letter-spacing:2.2px;text-transform:uppercase;color:{GREEN};">{kicker}</p>
      <p style="margin:0 0 8px;font:600 23px/28px {SERIF};color:{INK};">{name}</p>
      <p style="margin:0 0 14px;font:400 15px/24px {SANS};color:{MUTED};">{text}</p>
      <a href="{href}" style="font:600 14px/20px {SANS};color:{GREEN};text-decoration:underline;text-underline-offset:3px;">{label} &rarr;</a>
    </td>
  </tr></table>
</td></tr>"""


def email_plate():
    utm = "utm_source=klaviyo&utm_medium=email&utm_campaign=bfcm26_e4_plate"
    sale = f"{SITE}/collections/detox-collection?{utm}"
    body = utility_bar("Black Friday · 40% off everything · No code needed") + header_kit() + f"""<tr><td style="background:{CREAM};padding:50px 48px 14px;" class="px">
  <p style="margin:0 0 14px;font:600 12px/16px {SANS};letter-spacing:2.4px;text-transform:uppercase;color:{TOMATO};">Black Friday</p>
  <h1 class="h1" style="margin:0 0 14px;font:400 50px/54px {SERIF};color:{INK};">The plate <em style="font-style:italic;">report.</em></h1>
  <p style="margin:0 0 30px;font:400 18px/28px {SANS};color:{INK};">Yesterday, itemized. No judgment. We were at the table too.</p>
</td></tr>
<tr><td style="background:{CREAM};padding:0 64px 26px;" class="px">{receipt()}</td></tr>
<tr><td style="background:{CREAM};padding:6px 64px 46px;" class="px">
  <p style="margin:0;font:italic 400 19px/29px {SERIF};color:{INK};">&ldquo;I went back for the yams twice. Nobody's judging anybody here.&rdquo;</p>
  <p style="margin:6px 0 0;font:500 13px/20px {SANS};color:{MUTED};">Shay, founder</p>
</td></tr>
<tr><td style="background:{PAPER};padding:48px 48px 10px;" class="px">
  <h2 class="h2" style="margin:0 0 14px;font:400 34px/40px {SERIF};color:{INK};">Friday's for the reset.</h2>
  <p style="margin:0 0 14px;font:400 17px/27px {SANS};color:{INK};">After a plate like that, most of us wake up feeling it: heavy, sluggish, a little off.</p>
  <p style="margin:0 0 30px;font:400 17px/27px {SANS};color:{INK};">A few days of fiber, warm tea and plenty of water helps you feel like yourself again. And this weekend, everything that helps is 40% off.</p>
</td></tr>
<tr><td style="background:{PAPER};padding:0 48px 48px;" class="px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed {TOMATO};border-radius:10px;"><tr><td align="center" style="padding:30px 22px 32px;">
    <p style="margin:0 0 4px;font:600 12px/16px {SANS};letter-spacing:2.4px;text-transform:uppercase;color:{TOMATO};">Fri 11/27 to Mon 11/30</p>
    <p style="margin:0 0 6px;font:600 46px/52px {SERIF};color:{TOMATO};">40% off everything</p>
    <p style="margin:0 0 22px;font:400 16px/24px {SANS};color:{INK};">No code needed. Prices drop at checkout.<br>Ends Monday 11/30 at 11:59pm ET.</p>
    {button("Shop the sale", sale)}
  </td></tr></table>
</td></tr>
<tr><td style="background:{CREAM};padding:48px 48px 18px;" class="px">
  <h2 class="h2" style="margin:0 0 6px;font:400 32px/38px {SERIF};color:{INK};">Your reset, three ways</h2>
  <p style="margin:0 0 30px;font:400 16px/25px {SANS};color:{MUTED};">Start small or go all in. All 40% off through Monday.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    {product_row("TEA", "Soursop &amp; Ginger Detox Tea pouch, 30 tea bags", "The nightly cup", "Soursop &amp; Ginger Detox Tea", "30 bags of organic soursop, ginger and cinnamon. Steep 5 minutes after dinner.", "Shop the tea", f"{SITE}/products/soursop-ginger-detox-tea-bags?{utm}")}
    {product_row("CAPS", "Total Belly Cleanse Capsules bottle, 60 capsules", "The morning two", "Total Belly Cleanse Capsules", "Psyllium husk, apple fiber and senna leaf to support regularity.* 2 capsules with breakfast.", "Shop the capsules", f"{SITE}/products/total-belly-cleanse-capsules?{utm}")}
    {product_row("RESET", "All In Reset Bundle: detox powders, tea and capsules", "The full reset", "All In Reset Bundle", "Seven of our staples in one box, kids' elderberry gummies included. Already our best value.", "Shop the bundle", f"{SITE}/products/all-in-detox-bundle-deal?{utm}")}
  </table>
</td></tr>
<tr><td align="center" style="background:{GREEN};padding:50px 40px 52px;" class="px">
  <h2 class="h2" style="margin:0 0 10px;font:400 34px/40px {SERIF};color:#FFFFFF;">Leftovers keep. <em style="font-style:italic;">This price doesn't.</em></h2>
  <p style="margin:0 0 26px;font:400 16px/25px {SANS};color:#FFFFFF;">40% off everything ends Monday 11/30 at 11:59pm ET.</p>
  {button("Shop the sale", sale, bg=CREAM, fg=ROOT_G)}
</td></tr>
"""
    return (head("The plate report", "Mac and cheese x2. Pie, technically twice. Friday's for the reset: 40% off, no code.")
            + body + footer() + TAIL)


# ---------------------------------------------------------------- write
PHOTO_PREVIEW = f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;"><tr><td align="center" style="background:{SAGE};border:2px dashed #A9B79A;border-radius:8px;padding:56px 20px;font:500 14px/22px {SANS};color:{GREEN};">PHOTO NEEDED<br><span style="font-weight:400;color:{MUTED};">Shay in her kitchen, mug of tea in hand, natural light. 1200&times;800, alt: &ldquo;Shay Johnson, founder of The Healthy Hand&rdquo;</span></td></tr></table>"""
PHOTO_KLAVIYO = """<!-- PHOTO NEEDED: Shay in her kitchen with a mug of tea (1200x800). Upload to Klaviyo and replace this comment with:
<img src="SHAY_PHOTO_URL" width="504" alt="Shay Johnson, founder of The Healthy Hand" style="width:100%;border-radius:8px;margin:0 0 26px;"> -->"""

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
