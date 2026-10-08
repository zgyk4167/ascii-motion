# usage: python3 bundle.py kit.js piece.js out.html "Title"
import html,re,sys
kit,piece,out,title=sys.argv[1:5]
title=html.escape(title)
strip=lambda s:re.sub(r'^import .*?;\s*$','',re.sub(r'^export (default )?','',s,flags=re.M),flags=re.M)
k=strip(open(kit,encoding='utf-8').read())
p=open(piece,encoding='utf-8').read()
p=re.sub(r'^import .*?;\s*$','',p,flags=re.M).replace('export const meta','const meta').replace('export default function','function make')
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<!-- technique after ascii.rest (MIT, @bas3line) -->
<title>{title}</title><style>
:root{{--bg:#080b12;--ink:#cfd6e6}}@media (prefers-color-scheme:light){{:root{{--bg:#f4f1ea;--ink:#1d2230}}}}
html,body{{margin:0;min-height:100%;background:var(--bg);color:var(--ink)}}
body{{display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}}
.stage{{width:min(100%,1200px)}}pre.stage{{width:auto;font:clamp(9px,1.6vw,15px)/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;margin:0;white-space:pre}}
canvas.stage{{border-radius:6px}}</style></head><body>
<div id="host"></div>
<script type="module">
{k}
{p}
const piece={{meta,default:make}};
const el=document.createElement(meta.palette?"canvas":"pre");el.className="stage";el.setAttribute("role","img");el.setAttribute("aria-label",meta.note||meta.name);
document.getElementById("host").replaceWith(el);
mount(el,piece,Object.fromEntries(new URLSearchParams(location.search).has("motion")?[["motion",true]]:[]));
</script></body></html>'''
open(out,'w',encoding='utf-8').write(page)
