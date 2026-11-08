(()=>{
const $=s=>document.querySelector(s),clamp=(x,a,b)=>x<a?a:x>b?b:x,pct=v=>Math.round(v*100)+'%';
const RIDS=['mountain','village','coast'],RC={mountain:'#6b7280',village:'#4c8a3c',coast:'#2a79a8'};
const PACK={rice:'#e2c25a',veg:'#6aa84f',tuber:'#a07a40',egg:'#f1e7c8',fish:'#7fb5d6',dfish:'#9a8f7a',meat:'#a8443a',smeat:'#8a3b2e',salt:'#f6f6f6',wood:'#8a5a35',ore:'#6f6f78',cloth:'#4a74b8',pot:'#b56a3c',med:'#e8e8ff',tool:'#4a4a52',shell:'#f3d9c7'};
const SEASON=['春','夏','秋','冬'],MODES=['free','barter','money'];
let D=null,wk=0,running=false,speed=4,timer=null,PROBS=[],sel=null,reps=[],G={},EVN={},JOB={};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches,Sim={candOf:w=>w.rep},tickMs=()=>1300/speed;let lastTick=performance.now();
const S={t:0,flow:[],worlds:[['mountain','山区',6],['village','乡村',7],['coast','海边',9]].map(([id,name,no],i)=>({id,name,no,i,hhs:{length:0},working:0,event:null,rep:{name:'—'}}))};
/*MAP*/
const when=t=>`第${Math.floor(t/52)+1}年${SEASON[Math.floor((t%52)/13)]}`;
function rulesAt(w){const o={...D.start};D.rules.forEach(r=>{if(r.week<=w)Object.assign(o,r.set)});return o}
function setFrame(i){if(!D)return;wk=clamp(Math.round(i),0,D.frames.length-1);const f=D.frames[wk];S.t=f[0];
  S.worlds.forEach((w,j)=>{const r=f[1][j];w.hhs={length:r[4]};w.working=r[5];w.hermits=r[10]||0;w.event=r[6]||null});S.flow=f[2].map(([a,b,k,v])=>[a,b,k,v/G[k].v,v/G[k].v]);
  const p=[...D.probs].reverse().find(x=>x[0]<=wk);PROBS=p?p[1]:[];const rp=[...D.reps].reverse().find(x=>x[0]<=wk);reps=rp?rp[1]:[];S.worlds.forEach((w,j)=>w.rep={name:reps[j]?reps[j].name:'—'});
  lastTick=performance.now();ui();drawFrontier();try{if(wk%10===0)localStorage.setItem('jg:wk',wk)}catch(e){}}
function ui(){const t=S.t;$('#date').textContent=`${when(t)}`;$('#dateSub').textContent=`第 ${wk+1} / ${D.frames.length} 周`;$('#pos').value=wk;
  $('#reps').innerHTML=reps.map((r,j)=>`<div class="rep ${RIDS[j]}"><span class="no">${r.no}</span><span class="rn">${r.name}</span><span class="rw">${r.w}代表${r.votes!=null?` · ${r.votes} 票`:''}</span><span class="rbio">${r.traits}</span></div>`).join('');
  const o=rulesAt(wk),L=D.labels,on=Object.entries(o).filter(([k,v])=>v===true&&L[k]).map(([k])=>L[k]);
  $('#now').innerHTML=[`<span class="chip" aria-pressed="true">${L[o.mode||'free']||o.mode}</span>`,...on.map(x=>`<span class="chip" aria-pressed="true">${x}</span>`)].join('');
  $('#rl').innerHTML=D.rules.length?D.rules.map(r=>`<li data-w="${r.week}" style="cursor:pointer${r.week<=wk?'':';opacity:.5'}"><span class="rtag ${r.role}">${r.role==='kid'?'小朋友':'爸爸妈妈'}</span><span class="t">${when(D.t0+r.week)}</span><b>${r.title}</b>${r.explain?`<span class="ex">${r.explain}</span>`:''}</li>`).join(''):'<li>还没有改过规则。</li>';
  document.querySelectorAll('#rl li[data-w]').forEach(li=>li.onclick=()=>setFrame(+li.dataset.w));
  const bad=PROBS.filter(p=>p.cls==='bad').length,lv=!PROBS.length?['good','运转得很好']:bad>=2||PROBS[0].sev>0.85?['bad','遇到大麻烦了']:bad?['bad','有严重的问题']:['warn','有些小问题'];
  $('#verdict').className='verdict '+lv[0];$('#vFace').textContent=lv[1];const pop=D.frames[wk][1].reduce((a,r)=>a+r[0],0);
  $('#vText').textContent=(PROBS.length?`最要紧的是：${PROBS[0].q}。`:'三个地区都吃得饱、有药用、冬天不冷。')+` 现在一共 ${pop} 人。`;
  $('#probs').innerHTML=PROBS.length?PROBS.map(p=>`<div class="prob ${p.cls}"><span class="k">问题</span><span class="q">${p.q}</span><span class="k">瓶颈</span><span class="v">${p.b}</span><span class="k">后果</span><span class="v">${p.c}</span></div>`).join(''):'<div class="prob good"><span class="k">现在</span><span class="q">没有发现问题</span></div>'}
function drawFrontier(){const c=$('#fr'),g=c.getContext('2d'),r=c.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);if(!r.width||!D)return;c.width=r.width*d;c.height=r.height*d;g.scale(d,d);const W=r.width,H=r.height,se=Math.floor((S.t%52)/13);
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,['#b9cf94','#9cc17a','#c9bb7d','#dfe3e0'][se]);gr.addColorStop(1,['#a3bd80','#86ab64','#b4a56a','#cfd5d3'][se]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  const claimed=new Map();D.fclaims.forEach(([w,i,q,n])=>{if(w<=wk)claimed.set(i,n)});
  D.plots.forEach((q,i)=>{const x=(0.04+0.92*hash(i,11))*W,y=(0.08+0.84*hash(i,12))*H,rad=4+q*5;
    if(claimed.has(i)){g.fillStyle='#fbfcf9';g.strokeStyle='#4a3a2a';g.lineWidth=1.5;g.beginPath();g.arc(x,y,rad+3,0,7);g.fill();g.stroke();house(g,x,y+rad*0.5,rad*1.6,'#eadbc0','#8a4b2c',0)}
    else{g.strokeStyle='rgba(60,80,40,0.45)';g.lineWidth=1;g.beginPath();g.arc(x,y,rad,0,7);g.stroke();g.fillStyle=`rgba(60,110,40,${0.12+0.25*(q-0.5)})`;g.fill()}});
  const f=D.frames[wk][3];$('#frT').textContent=`荒地：${f[1]} 户 ${f[0]} 人，已占 ${f[4]} / ${D.plots.length} 块地${f[2]?`，${f[2]} 人吃不饱`:''}`}
function load(d){const first=!D;D=d;G=d.goods;EVN=d.evn;$('#ttl').textContent=d.title;document.title=d.title;$('#pos').max=d.frames.length-1;
  if(first){addEventListener('resize',()=>drawFrontier());let s=0;try{s=+localStorage.getItem('jg:wk')||0}catch(e){}setFrame(s<d.frames.length?s:0);if(!reduceMotion)setRun(true)}else setFrame(wk)}
function tick(){if(wk>=D.frames.length-1){setRun(false);return}setFrame(wk+1)}
function loop(){if(!running)return;tick();timer=setTimeout(loop,tickMs())}
function setRun(v){running=v;$('#play').textContent=v?'⏸ 暂停':'▶ 播放';clearTimeout(timer);if(v)timer=setTimeout(loop,100)}
$('#play').onclick=()=>{if(!running&&wk>=D.frames.length-1)setFrame(0);setRun(!running)};$('#home').onclick=()=>setFrame(0);
$('#speed').onclick=e=>{speed=speed===1?2:speed===2?4:speed===4?8:speed===8?16:1;e.target.textContent=`速度 ${speed}×`};
$('#pos').oninput=e=>setFrame(+e.target.value);
async function get(){const r=await fetch('result.json?'+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json()}
async function poll(){try{const d=await get();if(!D){load(d);$('#note').textContent=''}else if(d.ver!==D.ver){load(d);$('#note').textContent='结果更新了'}}catch(e){if(!D)$('#note').textContent='还没有结果文件 result.json'}setTimeout(poll,10000)}
fit();requestAnimationFrame(frame);let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{fit();if(D)ui()},120)});
poll();
})();
