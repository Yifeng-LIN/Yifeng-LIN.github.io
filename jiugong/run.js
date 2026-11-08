// node jiugong/run.js  ->  reads rules.json, runs the simulation, writes result.json (the only thing the viewer needs)
const fs=require('fs'),crypto=require('crypto'),d=__dirname;
const Sim=new Function(fs.readFileSync(d+'/src/sim.js','utf8')+';return Sim')();
const rules=JSON.parse(fs.readFileSync(d+'/rules.json','utf8'));
Sim.newGame(rules.start||{},rules.seed||20261108);const S=Sim.S,diagnose=require('./src/analyze.js')(Sim,S);
const W=Math.round((rules.years||10)*52),RID=['mountain','village','coast'],chg=rules.changes||[];
const traits=c=>{const o=[];if(c.hon>=.7)o.push('清廉');else if(c.hon<=.4)o.push('有私心');if(c.dil>=.7)o.push('勤政');else if(c.dil<=.4)o.push('懒散');if(c.gen>=.7)o.push('慷慨');else if(c.gen<=.35)o.push('小气');if(c.bar>=.7)o.push('会砍价');if(c.fore>=.7)o.push('爱存粮');return o.join('、')||'普普通通'};
const repsNow=()=>S.worlds.map(w=>{const c=Sim.candOf(w),e=S.elec.at(-1),r=e&&e.rows.find(x=>x.no===c.no);return{no:c.no,name:c.name,w:w.name,votes:r?r.votes:null,traits:traits(c),bio:c.bio,trust:+w.trust.toFixed(2)}});
const frames=[],probs=[],repsLog=[];let lastP='',lastR='';
for(let i=0;i<W;i++){
  chg.filter(c=>c.week===i).forEach(c=>{if(c.set)Sim.setP(c.set);(c.events||[]).forEach(e=>S.worlds.filter(w=>e.world==='all'||w.id===e.world).forEach(w=>Sim.trigger2(w,e.type)));if(c.reelect)Sim.holdElection(false)});
  Sim.step();
  const g={};S.flow.forEach(([a,b,k,q])=>{const o=g[a+'>'+b]||(g[a+'>'+b]={a,b,v:0,top:{}});const v=q*Sim.G[k].v;o.v+=v;o.top[k]=(o.top[k]||0)+v});
  frames.push([S.t,S.worlds.map((w,j)=>{const s=S.wstat[j];let work=0;w.hhs.forEach(h=>h.members.forEach(p=>{if(p.job&&p.job!=='artist'&&!p.sick&&p.age>=16&&!Sim.JOB[p.job].pub)work++}));
    return[s.pop,s.hungry,s.sick,s.cold,w.hhs.length,work,w.event||'',Math.round(s.kcov*100),Math.round(s.health*100),Math.round(s.happy*100),s.hermits]}),
    Object.values(g).map(o=>[o.a,o.b,Object.entries(o.top).sort((x,y)=>y[1]-x[1])[0][0],Math.round(o.v)]),[S.fstat.pop,S.fstat.hh,S.fstat.hungry,S.fstat.sick,S.fstat.claimed]]);
  if(i%8===0||i===W-1){const p=JSON.stringify(diagnose());if(p!==lastP){lastP=p;probs.push([i,JSON.parse(p)])}}
  const r=JSON.stringify(repsNow().map(x=>[x.no,x.votes]));if(r!==lastR){lastR=r;repsLog.push([i,repsNow()])}
}
const L=S.hist.at(-1),out={v:1,title:rules.title||'我的三地世界',t0:frames[0][0],weeks:W,rules:chg.map(c=>({week:c.week,role:c.role||'parent',title:c.title||'改了规则',set:c.set||{},events:c.events||[],explain:c.explain||''})),start:rules.start||{},
  goods:Object.fromEntries(Object.entries(Sim.G).map(([k,g])=>[k,{n:g.n,v:g.v}])),evn:Sim.EVN,plots:S.plots.map(p=>p.q),fclaims:S.fclaims.map(c=>[c[0]-frames[0][0],c[1],c[2],c[3]]),labels:rules.labels||{},reps:repsLog,probs,frames};
const txt=JSON.stringify(out);out.ver=crypto.createHash('md5').update(txt).digest('hex').slice(0,10);fs.writeFileSync(d+'/result.json',JSON.stringify(out));
console.log(`${W} 周 · 人口 ${L.pop} · 吃饱 ${Math.round(L.kcov*100)}% · ${(fs.statSync(d+'/result.json').size/1024).toFixed(0)}KB`);
console.log(probs.at(-1)[1].map(p=>'  - '+p.q).join('\n')||'  （没有问题）');
