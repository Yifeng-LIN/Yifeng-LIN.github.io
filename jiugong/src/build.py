"""python3 jiugong/src/build.py  ->  jiugong/index.html (page for GitHub) and jiugong/page.html (fragment for the Artifact). Only needed when the look changes."""
import os
d=os.path.dirname(os.path.abspath(__file__));root=os.path.dirname(d)
rd=lambda n:open(os.path.join(d,n),encoding='utf8').read()
js=rd('view.js').replace('/*MAP*/',rd('map.js'))
head='<title>我的三地世界</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;900&display=swap">\n'
frag=head+'<style>'+rd('style.css')+'</style>\n'+rd('body.html')+'\n<script>\n'+js+'\n</script>\n'
open(os.path.join(root,'page.html'),'w',encoding='utf8').write(frag)
wrap='<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}[hidden]{display:none!important}</style></head><body>\n'
open(os.path.join(root,'index.html'),'w',encoding='utf8').write(wrap+frag+'</body></html>\n')
print('built',len(frag))
