"""Add an idea from the conversation to live.json, so open games pick it up within about 10 seconds.
python3 jiugong/src/say.py '{"role":"kid","title":"...","changes":{...},"events":[...],"explain":"...","predict":"..."}'
Use "reset": true to restart the world with these rules. Then rebuild and push."""
import json, os, sys, time
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(root, 'live.json'); live = json.load(open(p, encoding='utf8'))
cmd = json.loads(sys.argv[1]); cmd['id'] = cmd.get('id') or 'c%d' % int(time.time() * 1000)
live['commands'].append(cmd); live['params'].update(cmd.get('changes') or {})
json.dump(live, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
print('added', cmd['id'], cmd.get('title'))
