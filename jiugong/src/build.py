"""Build the game: python3 jiugong/src/build.py [artifact_out.html]
Reads src/shell.html, src/sim.js, src/ui.js and jiugong/live.json; writes jiugong/game.html and jiugong/index.html."""
import json, os, sys
src = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(src)
rd = lambda p: open(p, encoding='utf8').read()
live = json.load(open(os.path.join(root, 'live.json'), encoding='utf8'))
# version numbers follow the files: rules = sim.js, build = page and interface
import hashlib
hs = lambda t: hashlib.sha1(t.encode('utf8')).hexdigest()[:12]
h_sim = hs(rd(os.path.join(src, 'sim.js'))); h_ui = hs(rd(os.path.join(src, 'shell.html')) + rd(os.path.join(src, 'ui.js')))
if live.get('simHash') != h_sim:
    live['rules'] = live.get('rules', 1) + (1 if 'simHash' in live else 0); live['simHash'] = h_sim
if live.get('uiHash') != h_ui:
    live['build'] = live['build'] + (1 if 'uiHash' in live else 0); live['uiHash'] = h_ui
json.dump(live, open(os.path.join(root, 'live.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=2)
open(os.path.join(root, 'sim.js'), 'w', encoding='utf8').write(rd(os.path.join(src, 'sim.js')))
ui = rd(os.path.join(src, 'ui.js')).replace('__BUILD__', str(int(live['build']))).replace('__LIVE__', json.dumps(live, ensure_ascii=False))
frag = rd(os.path.join(src, 'shell.html')) + '\n<script>\n' + rd(os.path.join(src, 'sim.js')) + '\n' + ui + '\n</script>\n'
open(os.path.join(root, 'game.html'), 'w', encoding='utf8').write(frag)
if len(sys.argv) > 1: open(sys.argv[1], 'w', encoding='utf8').write(frag)
embed = json.dumps({'build': live['build'], 'html': frag}, ensure_ascii=False).replace('</', '<\\/')
loader = '''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
<title>我的九宫世界</title></head><body>
<script>
// The game is kept inside this page. When the page has fetched a newer version from GitHub, it uses that one instead.
const EMBED=''' + embed + ''';
(function(){let code=EMBED;try{const c=JSON.parse(sessionStorage.getItem('jiugong:code')||'null');if(c&&c.build>code.build)code=c}catch(e){}
  const doc=new DOMParser().parseFromString('<body>'+code.html+'</body>','text/html');
  const t=doc.querySelector('title');if(t)document.title=t.textContent;
  doc.querySelectorAll('meta,link,style').forEach(n=>document.head.appendChild(document.importNode(n,true)));
  const scripts=[...doc.querySelectorAll('script')];scripts.forEach(s=>s.remove());doc.querySelectorAll('title,meta,link,style').forEach(n=>n.remove());
  [...doc.body.childNodes].forEach(n=>document.body.appendChild(document.importNode(n,true)));
  scripts.forEach(s=>{const e=document.createElement('script');e.textContent=s.textContent;document.body.appendChild(e)});
})();
</script>
</body></html>
'''
open(os.path.join(root, 'index.html'), 'w', encoding='utf8').write(loader)
print('build', live['build'], 'rules', live['rules'], 'frag', len(frag), 'commands', len(live['commands']))
