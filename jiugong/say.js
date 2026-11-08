// node jiugong/say.js '{"week":150,"role":"parent","title":"..","set":{"corruption":true},"events":[{"type":"plague","world":"coast"}]}'
const fs=require('fs'),p=__dirname+'/rules.json',r=JSON.parse(fs.readFileSync(p,'utf8'));r.changes=r.changes||[];r.changes.push(JSON.parse(process.argv[2]));r.changes.sort((a,b)=>a.week-b.week);
fs.writeFileSync(p,JSON.stringify(r,null,1));console.log('rules:',r.changes.length,'changes')
