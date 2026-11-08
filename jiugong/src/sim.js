/*SIM-START: three regions (mountain 6, village 7, coast 9), each governed by an elected representative*/
var Sim=(()=>{
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
function mkRng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---------- goods: unit, calories, weekly spoilage, base value (1 value = 1 shell when shells are money) ----------
const G={
 rice:{n:'稻米',u:'公斤',kcal:3500,rot:0.004,v:9,food:1},
 veg:{n:'蔬菜',u:'公斤',kcal:250,rot:0.2,v:2.5,food:1},
 tuber:{n:'山薯和栗子',u:'公斤',kcal:1000,rot:0.02,v:4.5,food:1},
 egg:{n:'鸡蛋',u:'公斤',kcal:1400,rot:0.06,v:12,food:1,prot:1},
 fish:{n:'鲜鱼',u:'公斤',kcal:1000,rot:0.5,v:6,food:1,prot:1},
 dfish:{n:'咸鱼干',u:'公斤',kcal:1400,rot:0.01,v:11,food:1,prot:1},
 meat:{n:'鲜肉',u:'公斤',kcal:2000,rot:0.45,v:18,food:1,prot:1},
 smeat:{n:'腊肉',u:'公斤',kcal:2600,rot:0.01,v:26,food:1,prot:1},
 salt:{n:'盐',u:'公斤',rot:0,v:8},
 wood:{n:'木柴',u:'公斤',rot:0,v:0.7},
 ore:{n:'铁矿石',u:'公斤',rot:0,v:40},
 cloth:{n:'布',u:'米',rot:0.002,v:100},
 pot:{n:'陶器',u:'件',rot:0.01,v:40},
 med:{n:'药品',u:'剂',rot:0.01,v:120},
 tool:{n:'铁器工具',u:'件',rot:0,v:480},
 shell:{n:'贝壳',u:'枚',rot:0,v:1},
};
const GK=Object.keys(G),FOOD=GK.filter(g=>G[g].food);
const BY_STORE=[...FOOD].sort((a,b)=>G[a].rot-G[b].rot);
const BY_FRESH=[...FOOD].sort((a,b)=>G[b].rot-G[a].rot);
const INT={tool:1,pot:1};
const SEASON=['春','夏','秋','冬'];
const season=t=>Math.floor((t%52)/13);
const when=t=>`第${Math.floor(t/52)+1}年${SEASON[season(t)]}`;

// ---------- jobs: weekly output of a healthy adult with good tools, by season (spring, summer, autumn, winter) ----------
const JOB={
 farmer:{n:'种稻农民',heavy:1},
 gardener:{n:'菜农',out:{veg:[30,60,40,15],egg:[2,3,2,1]}},
 weaver:{n:'织布工'},potter:{n:'陶匠'},
 hillfarmer:{n:'山地农民',out:{tuber:[22,50,120,55]},heavy:1},
 miner:{n:'矿工',out:{ore:[5.2,5.2,5.2,3.6]},risk:0.005,heavy:1},
 woodcutter:{n:'樵夫',out:{wood:[310,260,330,330]},res:'forest',risk:0.003,heavy:1},
 hunter:{n:'猎人',out:{meat:[9,9,13,13]},res:'game',risk:0.004,heavy:1},
 medic:{n:'采药制药人',out:{med:[3.2,3.6,3.2,1.2]}},
 fisher:{n:'渔民',out:{fish:[46,56,42,26]},res:'fish',risk:0.002},
 salter:{n:'晒盐人',out:{salt:[20,44,28,5]}},
 shell:{n:'拾贝人',out:{shell:[110,110,110,90]}},
 smith:{n:'铁匠',heavy:1,pub:1},clerk:{n:'仓库管事',pub:1},rep:{n:'地区代表',pub:1},
 artist:{n:'自由玩耍、画画'},
 homesteader:{n:'自耕农',out:{tuber:[14,30,80,36],veg:[10,20,14,5],egg:[0.8,1.2,0.8,0.4]},heavy:1},
};
// adults = how many voters live there (80 + 95 + 43 = 218, the total of the votes in the drawing)
const RG=[
 {id:'mountain',name:'山区',no:6,adults:80,jobs:{hillfarmer:.28,miner:.13,woodcutter:.18,hunter:.16,medic:.12,smith:.06,clerk:.07},land:{hillfarmer:15},ev:['collapse','fire'],desc:'矿石多、木头多，可是梯田很小，种不出多少粮食'},
 {id:'village',name:'乡村',no:7,adults:95,jobs:{farmer:.60,gardener:.14,weaver:.12,potter:.07,clerk:.07},land:{farmer:44},ev:['drought','locust','bumper'],desc:'稻田多，稻子一年只收一次，缺铁器、药和木柴'},
 {id:'coast',name:'海边',no:9,adults:43,jobs:{fisher:.62,salter:.15,shell:.17,clerk:.06},ev:['storm'],desc:'有鱼、盐和很多贝壳，缺粮食、木柴、铁器和药'},
];
// the nine candidates on the ballot; v0 = votes in the first election (the numbers in the drawing)
const CANDS=[
 {no:1,name:'王小海',home:'coast',sex:'m',age:34,v0:5,hon:.4,dil:.4,gen:.3,bar:.6,fore:.3,cha:.3,bio:'年轻渔民，爱热闹，爱说大话'},
 {no:2,name:'陈山林',home:'mountain',sex:'m',age:57,v0:20,hon:.8,dil:.5,gen:.8,bar:.3,fore:.4,cha:.5,bio:'老猎人，心软，谁来求都给'},
 {no:3,name:'刘春禾',home:'village',sex:'f',age:44,v0:23,hon:.9,dil:.8,gen:.7,bar:.4,fore:.6,cha:.4,bio:'认真的农妇，账记得最清楚'},
 {no:4,name:'周盐生',home:'coast',sex:'m',age:46,v0:6,hon:.3,dil:.6,gen:.2,bar:.9,fore:.5,cha:.3,bio:'晒盐人，精明，会算账'},
 {no:5,name:'吴药生',home:'mountain',sex:'m',age:49,v0:14,hon:.4,dil:.6,gen:.4,bar:.6,fore:.6,cha:.3,bio:'采药人，手里的药就是本钱'},
 {no:6,name:'郑铁山',home:'mountain',sex:'m',age:47,v0:46,hon:.6,dil:.7,gen:.4,bar:.8,fore:.5,cha:.8,bio:'矿工头，说话硬，砍价狠'},
 {no:7,name:'杨满仓',home:'village',sex:'m',age:58,v0:55,hon:.5,dil:.6,gen:.5,bar:.5,fore:.8,cha:.8,bio:'老农民，最会存粮，最怕挨饿'},
 {no:8,name:'林桂花',home:'village',sex:'f',age:39,v0:17,hon:.7,dil:.4,gen:.9,bar:.2,fore:.2,cha:.4,bio:'热心肠，什么都舍得给'},
 {no:9,name:'何贝娜',home:'coast',sex:'f',age:41,v0:32,hon:.7,dil:.7,gen:.6,bar:.6,fore:.4,cha:.7,bio:'渔村里最会张罗的人'},
];
const EVN={drought:'干旱',storm:'风暴',fire:'山火',collapse:'矿井塌方',locust:'蝗灾',plague:'瘟疫',bumper:'大丰收',winter:'寒冬'};
const ILL={cold:{n:'感冒',sev:0.12,wk:2,dose:1,die:0.0006},dys:{n:'痢疾',sev:0.4,wk:3,dose:3,die:0.018},inj:{n:'受伤',sev:0.35,wk:4,dose:2,die:0.008},plague:{n:'瘟疫',sev:0.6,wk:4,dose:4,die:0.03}};
const SUR=['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧'];
const MN=['石','山','海','林','磊','强','明','亮','杰','涛','刚','勇','松','柏','川','峰','军','平','安','建'];
const FN=['花','兰','梅','霞','秀','芳','燕','丽','云','月','雪','玲','慧','珍','英','琴','红','莲','春','秋'];
const MID=['小','大','阿','春','秋','冬','金','玉','德','永','文','新','长','宝'];
const BASECAP={rice:40000,veg:600,tuber:6000,egg:400,fish:600,dfish:3000,meat:300,smeat:800,salt:800,wood:12000,ore:2000,cloth:300,pot:400,med:300,tool:60,shell:20000};

let S,P,R;
const allW=()=>S.F?[...S.worlds,S.F]:S.worlds;
const DEF={mode:'free',kindness:0.6,shellShare:0.17,needFirst:false,share:false,freedom:false,migrate:false,reputation:false,priceCap:false,elections:true,honest:false,
  greed:false,freeRide:false,disasters:false,contagion:false,distance:false,corruption:false,rivalry:false};
const add=(o,g,q)=>{o[g]=(o[g]||0)+q};
function pick(o){let x=R(),s=0;for(const k in o){s+=o[k];if(x<s)return k}return Object.keys(o)[0]}
function news(type,txt,w){S.news.unshift({t:S.t,type,txt,w:w&&w.id});if(S.news.length>120)S.news.pop()}
function logP(p,txt){p.log.unshift(`${when(S.t)} ${txt}`);if(p.log.length>14)p.log.pop()}
const workers=h=>h.members.filter(p=>p.job&&p.job!=='artist');
const kcalOf=inv=>FOOD.reduce((a,g)=>a+(inv[g]||0)*G[g].kcal,0);
function personKcal(p){let k=p.age<5?0.45:p.age<14?0.7:p.age<17?0.95:p.age>=65?0.8:1;if(p.job&&JOB[p.job].heavy)k*=1.2;return 15400*k}
const hhKcal=h=>h.members.reduce((a,p)=>a+personKcal(p),0);
function takeFood(inv,k,order,to){let left=k;for(const g of order){if(left<=0)break;const have=inv[g]||0;if(have<=0)continue;const q=Math.min(have,left/G[g].kcal);inv[g]=have-q;if(to)add(to,g,q);left-=q*G[g].kcal}return k-left}

// ---------- representatives ----------
const candOf=w=>S.cands.find(c=>c.no===w.repNo);
function trait(w,k){const c=candOf(w);if(!c)return 0.5;let v=c[k];if(P.honest){if(k==='hon')v=Math.max(v,0.97);if(k==='gen')v=Math.max(v,0.75);if(k==='dil')v=Math.max(v,0.75)}return v}
const repPerson=w=>{const c=candOf(w);return c&&S.people.find(p=>p.id===c.pid)};
function kEff(p){return clamp(P.kindness+(p?((p.kind-0.5)*0.5):0),0,1)*S.sizeErode}
function greedOf(h){if(!h.members.length)return 0;const a=h.members.filter(p=>p.age>=16);const g=a.length?a.reduce((s,p)=>s+p.greed,0)/a.length:0.5;return P.greed?g*(1-0.6*P.kindness):0.05}
function kindOf(h){const a=h.members.filter(p=>p.age>=16);return a.length?a.reduce((s,p)=>s+kEff(p),0)/a.length:P.kindness}

// ---------- people and households ----------
function nameOf(sur,sex){return sur+(R()<0.5?MID[R()*MID.length|0]:'')+(sex==='m'?MN:FN)[R()*20|0]}
function mkPerson(hh,age,sex){const p={id:S.nid++,name:nameOf(hh.sur,sex),sex,age,hh,job:null,skill:0.75+R()*0.5,dil:0.3+R()*0.7,greed:R(),kind:R(),
  health:0.85+R()*0.15,sick:null,kcov:1,warm:1,variety:2,prot:0.2,comfort:0.5,saltOk:1,effort:0,hours:0,clothes:age<1?0.9:0.55+R()*0.4,happy:0.7,grief:0,log:[],alive:true,vote:0,cand:0};
  hh.members.push(p);S.people.push(p);assignJob(p);return p}
function assignJob(p){const w=p.hh.world;if(p.age<16||p.age>=72){p.job=null;return}
  if(p.hh.free){p.job='homesteader';return}
  if(p.cand&&candOf(w)&&candOf(w).no===p.cand&&w.repNo===p.cand){p.job='rep';return}
  if(P.freedom&&R()<0.12){p.job='artist';return}
  p.job=pick(w.jobs)}
function mkHH(w,sur){const h={id:S.nid++,world:w,sur:sur||SUR[R()*SUR.length|0],members:[],inv:{},money:0,crop:0,cropTotal:0,toolDur:0,distPen:0,hungry:0,staff:false};w.hhs.push(h);S.hhs.push(h);return h}
function genSpec(left){const r=R();let m=[];
  if(r<0.6&&left>=2){const a=24+R()*22;m.push({age:a,sex:'m'},{age:a-2+R()*4,sex:'f'});const k=1+(R()*4|0);for(let i=0;i<k;i++)m.push({age:Math.max(0,a-20-R()*16),sex:R()<.5?'m':'f'});if(R()<0.25)m.push({age:60+R()*14,sex:R()<.5?'m':'f'})}
  else if(r<0.75&&left>=2){const a=58+R()*16;m.push({age:a,sex:'m'},{age:a-3+R()*4,sex:'f'})}
  else m.push({age:20+R()*40,sex:R()<.5?'m':'f'});
  if(m.filter(x=>x.age>=18).length>left)return[{age:25+R()*30,sex:R()<.5?'m':'f'}];
  return m}
function populate(w){let a=0;
  while(a<w.adults){const spec=genSpec(w.adults-a),h=mkHH(w);spec.forEach(s=>mkPerson(h,s.age,s.sex));a+=spec.filter(x=>x.age>=18).length}
  w.hhs.forEach(h=>{const n=h.members.length;h.money=n*400;h.toolDur=workers(h).length*(0.4+R()*0.7);
    h.inv.wood=n*20;h.inv.salt=n*0.6;h.inv.med=1;h.inv.pot=Math.round(n*0.5);
    h.inv.rice=n*0.8*15400/3500*5;
    if(w.id==='mountain'){h.inv.tuber=n*8;h.inv.smeat=n*1.5;h.inv.wood=n*40}
    if(w.id==='coast'){h.inv.dfish=n*5}
    if(w.id==='village'){h.inv.veg=n*1;h.inv.egg=n*1}});
}
function ensureStaff(){ // the smithy and the granary need people; when some die or move away, others take over
  S.worlds.forEach(w=>{const need=[['clerk',2]];if(w.id==='mountain')need.push(['smith',2]);
    need.forEach(([j,n])=>{const have=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job===j&&p.age>=16&&p.age<72).length,0);
      for(let i=have;i<n;i++){const c=w.hhs.flatMap(h=>h.members.filter(p=>p.age>=18&&p.age<60&&p.job&&!JOB[p.job].pub&&!p.cand&&!p.hh.free));if(!c.length)return;const p=c[R()*c.length|0];p.job=j;logP(p,`成了${JOB[j].n}`)}})})}

// ---------- targets: what a household wants to have at home ----------
function targets(h,greedy){
  const n=h.members.length,wk=S.t%52,se=season(S.t),gx=greedy?1+1.6*greedOf(h):1,gf=greedy?1+0.6*greedOf(h):1;
  let cover=6;if(wk>=30&&wk<39)cover=10;if(se===3)cover=8;
  let res=cover;if(h.world.id==='village'&&h.members.some(p=>p.job==='farmer')){const d=(26-wk+52)%52;res=Math.max(cover,Math.min(44,d+3))}
  const winterLeft=se===3?52-wk:(wk>=30?13:0),heat=S.harsh?18:12;
  const sickDoses=h.members.reduce((a,p)=>a+(p.sick?ILL[p.sick.type].dose:0),0),ws=workers(h).length;
  const t={foodK:hhKcal(h)*res*gf,wood:n*(3*cover+heat*Math.min(winterLeft,10))*gx,salt:n*0.08*10*gx,med:Math.ceil((1+n*0.25+sickDoses)*gx),
    tool:ws*1.0*gx,cloth:h.members.reduce((a,p)=>a+Math.max(0,0.85-p.clothes)*4,0)*gx+(wk>=30&&wk<39?n*0.3:0),pot:Math.ceil(n*0.6*gx)};
  if(h.world.id==='coast')t.salt+=n*1.5;
  const pt=h.members.filter(p=>p.job==='potter').length;if(pt)t.wood+=pt*20*4;
  const fm=h.members.filter(p=>p.job==='farmer').length;if(fm&&P.mode!=='money'&&wk<14)t.shell=fm*200;
  return t}
function needs(h,t){const inv=h.inv,o={};
  o.food=Math.max(0,t.foodK-kcalOf(inv));
  for(const g of ['wood','salt','med','cloth','pot','shell']){if(t[g]!=null){const q=t[g]-(inv[g]||0);if(q>0.01)o[g]=g==='med'||g==='pot'?Math.ceil(q):q}}
  if(h.toolDur<t.tool*0.7)o.tool=Math.max(1,Math.round(t.tool-h.toolDur));
  return o}
function surplus(h,t){const inv=h.inv,o={};
  let keep=t.foodK;for(const g of BY_STORE){const have=inv[g]||0;if(!have)continue;const k=Math.min(have,keep/G[g].kcal);keep-=k*G[g].kcal;if(have-k>0.05)o[g]=have-k}
  for(const g of GK){if(G[g].food||g==='tool')continue;const have=inv[g]||0,tg=t[g]||0;if(have-tg>0.05)o[g]=have-tg}
  return o}
const foodPref=h=>{const mine=new Set(Object.keys(JOB).filter(j=>h.members.some(p=>p.job===j)).flatMap(j=>JOB[j].out?Object.keys(JOB[j].out):[]));return[...BY_FRESH].sort((a,b)=>(mine.has(a)?1:0)-(mine.has(b)?1:0))};
const urgScore=h=>h.members.reduce((a,p)=>a+(p.sick?2:0)+(p.kcov<0.8?2:0),0);
function capOf(w,g){return Math.max(10*(w.dem[g]||0),BASECAP[g]||150)}

// ---------- events ----------
function events(se){
  S.harsh=false;
  S.worlds.forEach(w=>{if(w.evLeft>0){w.evLeft--;if(!w.evLeft)w.event=null}});
  if(S.winterEv>0){S.winterEv--;S.harsh=true}
  if(!P.disasters)return;
  S.worlds.forEach(w=>{if(w.event)return;
    for(const e of w.ev){const ok=(e==='drought'||e==='locust')?se===1:e==='fire'?se!==3:e==='bumper'?se===2:true;
      const p={drought:0.014,locust:0.007,fire:0.005,storm:0.008,collapse:0.005,bumper:0.005}[e];if(ok&&R()<p){trigger(w,e);break}}
    if(!w.event&&R()<0.0022)trigger(w,'plague')});
  if(se===3&&S.t%52===39&&R()<0.25){S.winterEv=13;S.harsh=true;news('bad','今年冬天特别冷，每家都要烧更多的柴。')}
}
function trigger(w,e,quiet){w.event=e;w.evLeft={drought:8,locust:1,fire:3,storm:2,collapse:3,plague:10,bumper:8,winter:13}[e]||3;
  if(e==='fire'){S.res.forest*=0.85;S.res.game*=0.85}
  if(e==='locust')w.hhs.forEach(h=>h.crop*=0.6);
  if(e==='collapse'){const ms=w.hhs.flatMap(h=>h.members.filter(p=>p.job==='miner'&&!p.sick));for(let i=0;i<Math.min(3,ms.length);i++){const p=ms[R()*ms.length|0];if(!p.sick){p.sick={type:'inj',wk:4};logP(p,'矿井塌方，受了伤')}}}
  if(e==='plague'){const ps=w.hhs.flatMap(h=>h.members);for(let i=0;i<3&&ps.length;i++){const p=ps[R()*ps.length|0];p.sick={type:'plague',wk:4};logP(p,'染上了瘟疫')}}
  if(e==='winter')S.winterEv=13;
  if(!quiet)news(e==='bumper'?'good':'bad',`${w.name}：${EVN[e]}！`,w)}
function evMult(w,job){if(!w.event)return 1;const e=w.event;
  if(e==='bumper')return 1.4;
  if(e==='drought')return job==='farmer'||job==='gardener'?0.45:job==='hillfarmer'?0.6:1;
  if(e==='storm')return job==='fisher'?0.1:job==='salter'||job==='shell'?0.25:0.85;
  if(e==='fire')return job==='woodcutter'?0.3:job==='hunter'?0.5:1;
  if(e==='collapse')return job==='miner'?0.25:1;if(e==='plague')return 0.8;return 1}

// ---------- one week ----------
function step(){
  S.t++;const t=S.t,se=season(t),wk=t%52;
  const pop=S.people.length;S.sizeErode=Math.min(1,Math.pow(380/Math.max(pop,1),0.5));
  if(wk===0)S.yr={births:0,deaths:0};
  events(se);
  const rs=S.res;rs.fish+=0.035*rs.fish*(1-rs.fish);rs.game+=0.025*rs.game*(1-rs.game);rs.forest+=0.004*rs.forest*(1-rs.forest)+0.0004;
  illness(se);
  work(se,wk);
  craftAndPreserve();
  S.worlds.forEach(w=>{w.inflow={};w.short={};w.skimmed=0;w.tradeIn={};w.tradeOut={};w.why={};w.queue=0});
  share();
  publicWork();
  S.flow=[];S.dem={};S.sup={};
  S.worlds.forEach(w=>deposit(w,plan(w)));
  trade();
  S.worlds.forEach(w=>distribute(w,plan(w)));
  priceUpdate();
  consume(se,wk);health();family();spoil();money(wk);relations();
  if(wk%4===0){flee();migrate();ensureStaff();leave();peddle()}
  if(P.elections&&t>=S.nextElection)holdElection(false);
  record();
}

function illness(se){
  S.plagueW=new Set(allW().filter(w=>w.hhs.some(h=>h.members.some(p=>p.sick&&p.sick.type==='plague'))).map(w=>w.id));
  allW().forEach(w=>{const ps=w.hhs.flatMap(h=>h.members);const inf=ps.filter(p=>p.sick&&p.sick.type==='plague').length,frac=ps.length?inf/ps.length:0;
    ps.forEach(p=>{if(p.sick)return;let r=R();
      const cold=0.006+(se===3?0.012:0)+(p.clothes<0.4?0.008:0)+(S.harsh?0.008:0);
      const dys=0.0015+(se===1?0.003:0)+(p.kcov<0.7?0.004:0);
      const inj=p.job&&JOB[p.job].risk||0.0008;
      const pl=p.immune?0:frac*0.35;
      if(r<pl){p.sick={type:'plague',wk:4};logP(p,'被传染了瘟疫')}
      else if((r-=pl)<dys){p.sick={type:'dys',wk:3};logP(p,'得了痢疾')}
      else if((r-=dys)<inj){p.sick={type:'inj',wk:4};logP(p,'干活时受了伤')}
      else if((r-=inj)<cold){p.sick={type:'cold',wk:2}}})})}

function work(se,wk){
  allW().forEach(w=>w.made={});
  const land={};S.worlds.forEach(w=>{if(!w.land)return;for(const j in w.land){const n=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job===j&&!p.sick&&p.age>=16).length,0);land[w.id+j]=n>w.land[j]?Math.pow(w.land[j]/n,0.6):1}});
  const resF={fish:clamp(S.res.fish/0.7,0,1.25),game:clamp(S.res.game/0.7,0,1.25),forest:clamp(S.res.forest/0.7,0,1.2)};
  const take={fish:0,game:0,forest:0};S.forF={};S.forN=S.forN||{};S.worlds.forEach(w=>{const n=S.forN[w.id]||0;S.forF[w.id]=n>30?Math.pow(30/n,0.7):1});S.forN={};
  S.hhs.forEach(h=>{const w=h.world,ws=workers(h),toolF=0.55+0.45*clamp(h.toolDur/Math.max(1,ws.length*0.5),0,1);
    let farmLab=0;const forage=(h.foodWeeks!=null&&h.foodWeeks<1&&h.members.some(p=>p.kcov<0.9))?0.5:0;
    const rice=h.members.length;
    h.members.forEach(p=>{p.hours=0;p.effort=0;if(!p.job||p.job==='artist'||JOB[p.job].pub)return;
      let lab=p.age<16?0:p.age<18?0.7:p.age<65?1:p.age<72?0.5:0;if(p.sick)lab=0;lab*=clamp(0.3+0.7*p.health/0.8,0,1);if(lab<=0)return;
      let m=0.92+0.08*p.dil;
      if(P.freeRide){if(P.mode==='free')m=0.35+0.65*(0.5*p.dil+0.5*kEff(p));else m=0.85+0.15*p.dil;if(P.reputation&&P.mode==='free')m+=(1-m)*0.55}
      if(h.foodWeeks!=null&&h.foodWeeks<2)m=Math.max(m,0.88);
      if(S.famine>0.1)m+=(1-m)*Math.min(0.8,S.famine*2);
      if(P.mode==='money'&&S.inflM>0.04)m*=1-Math.min(0.3,S.inflM*1.5);
      if(P.freedom)m*=1.05;
      let eff=lab*m*p.skill*(1-h.distPen);p.effort=m;
      if(forage){S.forN[w.id]=(S.forN[w.id]||0)+1;add(h.inv,'tuber',22*lab*forage*(se===3?0.3:se===0?0.8:1.1)*(S.forF[w.id]||1)*1.6);eff*=1-forage;p.forage=true}else p.forage=false;
      p.hours=40*lab*m;
      const j=JOB[p.job],ev=evMult(w,p.job);
      if(p.job==='farmer'){farmLab+=eff;return}
      if(p.job==='potter'){const n=5*eff*toolF*ev,wd=Math.min(h.inv.wood||0,n*4),pq=n*(0.3+0.7*(n>0?wd/(n*4):0));add(h.inv,'pot',pq);add(w.made,'pot',pq);h.inv.wood=(h.inv.wood||0)-wd;h.toolDur=Math.max(0,h.toolDur-0.02*lab);return}
      if(p.job==='weaver'){const n=3*eff*toolF*ev;add(h.inv,'cloth',n);add(w.made,'cloth',n);h.toolDur=Math.max(0,h.toolDur-0.02*lab);return}
      if(!j.out)return;
      const lf=w.land&&w.land[p.job]?land[w.id+p.job]:1;
      for(const g in j.out){let q=j.out[g][se]*eff*toolF*ev*lf*(h.plotQ||1);if(j.res){q*=resF[j.res];take[j.res]+=q}
        if(g==='shell'&&P.mode==='money')h.money+=q;else add(h.inv,g,q);add(w.made,g,q)}
      h.toolDur=Math.max(0,h.toolDur-0.02*lab)});
    // gathering brush and driftwood for the fire
    if(w.id==='village')add(h.inv,'wood',h.members.length*3.5);if(w.id==='coast')add(h.inv,'wood',h.members.length*2.5);
    if(w.id==='village'){
      const lf=land['villagefarmer']||1,nf=h.members.filter(p=>p.job==='farmer').length;
      let lime=1;if(nf&&wk<14){if(P.mode==='money')lime=1;else{const need=nf*200/14;const have=h.inv.shell||0;lime=clamp(have/Math.max(1,need*14),0,1);h.inv.shell=Math.max(0,have-need)}}
      else lime=h.limeKeep||1;h.limeKeep=lime;
      if(wk<26){let g=farmLab*toolF*lf*(1+0.15*lime);if(w.event==='drought'){g*=0.4;h.crop*=0.985}if(w.event==='bumper')g*=1.3;h.crop+=g}
      else if(wk<39){if(wk===26){h.cropTotal=h.crop;h.crop=0}const want=h.cropTotal/13*55,can=clamp(farmLab/Math.max(0.5,workers(h).length*0.7),0,1);
        const got=want*can*(w.event==='bumper'?1.25:1);add(h.inv,'rice',got);add(w.made,'rice',got)}
    }
  });
  S.res.fish=Math.max(0.02,S.res.fish-take.fish/180000);S.res.game=Math.max(0.02,S.res.game-take.game/26000);S.res.forest=Math.max(0.05,S.res.forest-take.forest/4000000);
}

function craftAndPreserve(){
  S.hhs.forEach(h=>{const inv=h.inv,kw=hhKcal(h);
    for(const[f,s]of[['fish','dfish'],['meat','smeat']]){const keep=kw*0.3/G[f].kcal,ex=(inv[f]||0)-keep;if(ex>0){const q=Math.min(ex,(inv.salt||0)/0.15);if(q>0){inv[f]-=q;inv.salt-=q*0.15;add(inv,s,q*0.6)}}}})}

// the smithy (in the mountain) turns ore and wood into tools; the clerks decide how many families the granary can serve in a week
function publicWork(){
  const m=S.worlds[0],H=m.store;
  const smiths=m.hhs.flatMap(h=>h.members.filter(p=>p.job==='smith'&&!p.sick&&p.age>=16&&p.age<72));
  const cnt=smiths.reduce((a,p)=>a+clamp(p.health/0.8,0.3,1)*(0.6+0.4*clamp(p.skill,0.6,1.3)),0);
  const tq=Math.max(0,Math.min(cnt*2.5,(H.ore||0)/10,(H.wood||0)/15,40-(H.tool||0)));H.ore=(H.ore||0)-tq*10;H.wood=(H.wood||0)-tq*15;add(H,'tool',tq);add(m.made,'tool',tq);
  S.worlds.forEach(w=>{const cl=w.hhs.flatMap(h=>h.members.filter(p=>p.job==='clerk'&&!p.sick&&p.age>=16&&p.age<72)).reduce((a,p)=>a+clamp(p.health/0.8,0.3,1),0);
    w.cap=Math.max(6,cl*14*(0.7+0.6*trait(w,'dil')));w.cl=cl;
    w.hhs.forEach(h=>{h.staff=h.members.some(p=>p.job&&JOB[p.job].pub&&p.age>=16)})})}

function share(){ // neighbours inside one region help families that have nothing
  const rate=P.share?0.6:0.25,wkf=h=>kcalOf(h.inv)/Math.max(1,hhKcal(h));
  S.worlds.forEach(w=>{const hs=w.hhs.filter(h=>h.members.length&&!h.free),donors=hs.filter(h=>wkf(h)>8),needy=hs.filter(h=>wkf(h)<1);
    needy.forEach(r=>{const want=hhKcal(r)*1.5-kcalOf(r.inv);for(const d of donors){if(want<=0)break;const ex=(wkf(d)-8)*hhKcal(d)*rate*kindOf(d);if(ex>0)takeFood(d.inv,Math.min(ex,want),BY_FRESH,r.inv)}});
    if(P.mode==='money'){const cost=h=>hhKcal(h)/15400*45*S.moneyFactor,poor=hs.filter(h=>kcalOf(h.inv)<hhKcal(h)*1.5&&h.money<cost(h)*2),rich=hs.filter(h=>h.money>cost(h)*10);
      poor.forEach(r=>{for(const d of rich){const g=Math.min((d.money-cost(d)*10)*rate*kindOf(d),cost(r)*3-r.money);if(g>0){d.money-=g;r.money+=g;break}}})}})}

// ---------- the commons of each region: deposit, trade between regions, distribute ----------
function plan(w){const hs=w.hhs.filter(h=>h.members.length&&!h.free).map(h=>{const tg=targets(h,true),tn=targets(h,false);return{h,need:needs(h,tg),real:needs(h,tn),sur:surplus(h,tg)}});
  for(let i=hs.length-1;i>0;i--){const j=R()*(i+1)|0;[hs[i],hs[j]]=[hs[j],hs[i]]}
  return hs.sort((a,b)=>(b.h.staff?1:0)-(a.h.staff?1:0))}
const pace=(w,x)=>{if(x.h.staff)return true;const k=x.h.id;if(w.seen.has(k))return !w.blocked.has(k);w.seen.add(k);w.served++;if(w.served>w.cap){w.queue++;w.blocked.add(k);return false}return true};
// what passes through the hands of the representative: a dishonest one keeps a share
function commonsIn(w,g,q){let s=0;if(P.corruption){s=Math.pow(1-trait(w,'hon'),1.3)*0.15*(1+0.5*(P.greed?1:0));
    const rp=repPerson(w);if(s>0&&rp){const k=q*s;add(rp.hh.inv,g,k);w.skimmed+=k*(G[g].v);w.skimTot=(w.skimTot||0)+k*G[g].v;S.cnt.leak+=k*G[g].v;q-=k}}
  add(w.inflow,g,q);return q}
function deposit(w,pl){if(P.mode==='free')depositFree(w,pl);else if(P.mode==='money')sellMoney(w,pl);else depositTax(w,pl)}
// with swapping, the commons still lives on a tribute in kind: a share of each family's surplus, set by the representative
function depositTax(w,pl){const H=w.store,tax=(0.18+0.2*(1-trait(w,'gen')))*(0.5+0.5*w.trust);
  pl.forEach(x=>{for(const g in x.sur){if(g==='shell'&&false)continue;const q=x.sur[g]*tax;if(q<=0)continue;x.h.inv[g]-=q;add(H,g,commonsIn(w,g,q))}})}
function distribute(w,pl){w.seen=new Set();w.served=0;w.blocked=new Set();
  if(P.mode==='free'){staffSupply(w);distFree(w,pl)}else if(P.mode==='barter'){staffSupply(w);barterLocal(w,pl)}else buyMoney(w,pl)}
function staffSupply(w){const H=w.store;w.hhs.forEach(h=>{if(!h.staff)return;const t=targets(h,false),nd=needs(h,t);
  if(nd.food)takeFood(H,nd.food,foodPref(h),h.inv);
  for(const g of ['wood','salt','cloth','pot','med']){if(nd[g]){const q=Math.min(H[g]||0,nd[g]);H[g]=(H[g]||0)-q;add(h.inv,g,q)}}})}

function depositFree(w,pl){const H=w.store,tr=0.5+0.5*w.trust;
  pl.forEach(x=>{const kd=kindOf(x.h),gr=greedOf(x.h);
    for(const g in x.sur){let f=P.greed?clamp(0.2+0.8*kd-0.3*gr,0.05,1):0.95;if(G[g].food)f+=(1-f)*Math.min(1,(S.famine||0)*3)*kd;f*=tr;
      const q=x.sur[g]*f;if(q<=0)continue;x.h.inv[g]-=q;add(H,g,commonsIn(w,g,q))}})}
function distFree(w,pl){const H=w.store;let list=pl;if(P.needFirst)list=[...pl].sort((a,b)=>(b.h.staff?1:0)-(a.h.staff?1:0)||urgScore(b.h)-urgScore(a.h));
  list.forEach(x=>{const want=P.needFirst?x.real:x.need;
    if(want.food>0){if(!pace(w,x)){add(w.short,'food',want.food);return}const got=takeFood(H,want.food,foodPref(x.h),x.h.inv);add(w.short,'food',want.food-got)}
    for(const g of ['med','tool','wood','salt','cloth','pot','shell']){const q=want[g];if(!q)continue;if(!pace(w,x)){add(w.short,g,q);continue}
      let got=Math.min(H[g]||0,q);if(INT[g])got=Math.floor(got);if(got<=0){add(w.short,g,q);continue}
      H[g]-=got;if(g==='tool')x.h.toolDur+=got;else add(x.h.inv,g,got);add(w.short,g,q-got)}})}

function barterLocal(w,pl){const H=w.store,val=g=>G[g].v*S.sc[g];
  const parts=pl.map(x=>({x,h:x.h,haves:{...x.sur},wants:{...x.need},foodK:x.need.food||0}));parts.forEach(p=>delete p.wants.food);
  const give=(from,to,g,q)=>{from.h.inv[g]-=q;if(g==='tool')to.h.toolDur+=q;else add(to.h.inv,g,q);from.haves[g]-=q};
  const wantsOf=(b,g)=>G[g].food?(b.foodK>0?b.foodK/G[g].kcal:0):(b.wants[g]||0);
  const reduceWant=(b,g,q)=>{if(G[g].food)b.foodK-=q*G[g].kcal;else b.wants[g]-=q};
  const peer=(a,g,qWant)=>{let got=0;
    for(const b of parts){if(b===a||got>=qWant-1e-6)continue;const bh=b.haves[g]||0;if(bh<=1e-6)continue;
      for(const h2 in a.haves){if(got>=qWant-1e-6)break;const ah=a.haves[h2]||0;if(ah<=1e-6||h2===g)continue;const bw=wantsOf(b,h2);if(bw<=1e-6)continue;
        let q=Math.min(qWant-got,bh,ah*val(h2)/val(g),bw*val(h2)/val(g));if(INT[g]){q=Math.floor(q+1e-9);if(q<1)continue}if(q<=1e-6)continue;
        const back=q*val(g)/val(h2);give(b,a,g,q);give(a,b,h2,back);reduceWant(b,h2,back);got+=q}}
    return got};
  const post=(a,g,qWant)=>{let got=0;const avail=Math.max(0,(H[g]||0)-(g==='med'?4:0));if(avail<=1e-6)return 0;
    for(const h2 in a.haves){if(got>=qWant-1e-6)break;const ah=a.haves[h2]||0;if(ah<=1e-6||h2===g)continue;const room=capOf(w,h2)*2-(H[h2]||0);if(room<=0)continue;
      let q=Math.min(qWant-got,avail-got,ah*val(h2)/val(g),room*val(h2)/val(g));if(INT[g]){q=Math.floor(q+1e-9);if(q<1)continue}if(q<=1e-6)continue;
      const back=q*val(g)/val(h2);H[g]-=q;if(g==='tool')a.h.toolDur+=q;else add(a.h.inv,g,q);a.h.inv[h2]-=back;a.haves[h2]-=back;add(H,h2,commonsIn(w,h2,back));got+=q}
    return got};
  const tryGet=(a,g,q)=>{let got=peer(a,g,q);if(got<q-1e-6)got+=post(a,g,q-got);return got};
  parts.forEach(a=>{
    if(a.h.staff)return;
    const ask=Object.entries(a.wants).filter(([,q])=>q>0);if(a.foodK>0)ask.unshift(['food',a.foodK]);
    ask.forEach(([g,q])=>{if(!pace(w,a.x)){add(w.short,g,q);return}
      let got=0;
      if(g==='food'){for(const f of BY_STORE){if(got>=q)break;const k=tryGet(a,f,(q-got)/G[f].kcal);got+=k*G[f].kcal}}else got=tryGet(a,g,q);
      if(got<q*0.5){S.barterFail=(S.barterFail||0)+1}S.barterTry=(S.barterTry||0)+1;add(w.short,g,q-got)})});
  GK.forEach(g=>{const u=w.short[g]||0;S.sc[g]=clamp(S.sc[g]*(u>(H[g]||0)?1.012:0.996),0.5,3)})}

// shells as money
function sellMoney(w,pl){const p=S.prices,H=w.store;
  const limit=150000*S.moneyFactor;w.limit=limit;
  w.hhs.forEach(h=>{const n=h.members.filter(p2=>p2.job&&JOB[p2.job].pub&&p2.age>=16).length;if(!n)return;const wg=n*150*S.moneyFactor;h.money+=wg;w.cash-=wg});
  const bidF=clamp(0.7+0.3*(w.cash+limit)/(limit+25000*S.moneyFactor),0.6,0.97);
  pl.forEach(x=>{const gr=greedOf(x.h),hold=P.greed&&S.inflM>0.03?0.5*gr:0;
    for(const g in x.sur){if(g==='shell')continue;const room=capOf(w,g)-(H[g]||0);if(room<=0)continue;const bid=p[g]*bidF;
      const q=Math.min(room,x.sur[g]*S.trust*(1-hold),Math.max(0,w.cash+limit)/bid);if(q<=1e-6)continue;
      x.h.inv[g]-=q;add(H,g,commonsIn(w,g,q));x.h.money+=q*bid;w.cash-=q*bid}})}
function buyMoney(w,pl){const p=S.prices,H=w.store;
  const credit=x=>hhKcal(x.h)/15400*45*S.moneyFactor*8;
  const pay=(x,g,q,pr)=>{H[g]-=q;if(g==='tool')x.h.toolDur+=q;else add(x.h.inv,g,q);x.h.money-=q*pr;w.cash+=q*pr};
  const buy=(x,g,q)=>{const pr=p[g];let can=Math.min(q,Math.max(0,x.h.money+(g==='med'||g==='wood'?credit(x):0))/pr);if(INT[g])can=Math.floor(can);add(S.dem,g,can);
    const got=Math.min(can,H[g]||0);if(can-got>0.01)add(S.shortAll,g,can-got);if(got<=0){add(w.short,g,q);return}pay(x,g,got,pr);add(w.short,g,q-got)};
  pl.forEach(x=>{
    for(const g of ['med','food','wood','salt','tool','cloth','pot']){const q=x.need[g];if(!q)continue;if(!pace(w,x)){add(w.short,g,q);continue}
      if(g==='food'){let left=q;const fl=foodPref(x.h).sort((a,b)=>p[a]/G[a].kcal-p[b]/G[b].kcal);
        for(const f of fl){if(left<=0)break;const pr=p[f],k=Math.min(left/G[f].kcal,Math.max(0,x.h.money+credit(x))/pr);if(k<=0)break;const got=Math.min(k,H[f]||0);add(S.dem,f,got);
          if(got<=0){add(S.shortAll,f,k);continue}pay(x,f,got,pr);left-=got*G[f].kcal}
        add(w.short,'food',left);continue}
      buy(x,g,q)}
    const reserve=hhKcal(x.h)/15400*45*S.moneyFactor*16,spare=x.h.money-reserve;
    if(spare>0){const gr=greedOf(x.h),budget=spare*(P.greed?0.3+0.5*gr:0.25);const lux=['egg','smeat','pot','cloth','dfish','rice','salt'].filter(g=>(H[g]||0)>0.5);
      lux.forEach(g=>{const pr=p[g],q=budget/lux.length/pr;add(S.dem,g,q);const got=Math.min(q,H[g]||0);if(q-got>0.01)add(S.shortAll,g,q-got);if(got>0)pay(x,g,got,pr)})}});
  const m=S.worlds.indexOf(w);void m;
  if(S.t%4===0){const tgt=25000*S.moneyFactor;if(w.cash>tgt){const d=(w.cash-tgt)*0.6,n=Math.max(1,S.people.filter(q=>q.hh.world===w).length);w.cash-=d;w.hhs.forEach(h=>h.money+=d*h.members.length/n)}}}
function priceUpdate(){if(P.mode!=='money')return;const p=S.prices;
  const sup={};S.worlds.forEach(w=>{for(const g of GK)add(sup,g,(w.store[g]||0)/4+(w.inflow[g]||0))});
  GK.forEach(g=>{S.demand[g]=(S.demand[g]||0)*0.9+0.1*(S.dem[g]||0);S.supply[g]=(S.supply[g]||sup[g]||1)*0.85+0.15*(sup[g]||0)});
  const mf=S.moneyFactor;
  GK.forEach(g=>{if(g==='shell')return;const d=Math.max(0.1,S.demand[g]+(S.shortAll&&S.shortAll[g]||0)),sp=Math.max(0.1,S.supply[g]),sc=clamp(Math.pow(d/sp,0.35),0.6,2.2);
    const tgt=G[g].v*mf*sc;p[g]+=(tgt-p[g])*0.2;if(P.priceCap)p[g]=Math.min(p[g],G[g].v)});
  S.shortAll={}}

// ---------- trade between the three regions: done by the representatives ----------
function balance(w){const H=w.store,hs=w.hhs.filter(h=>h.members.length&&!h.free),N={};let Fk=0,pk=0;
  hs.forEach(h=>{const nd=needs(h,targets(h,false));Fk+=nd.food||0;pk+=hhKcal(h);for(const g in nd)if(g!=='food')N[g]=(N[g]||0)+nd[g]});
  GK.forEach(g=>{if(!G[g].food)w.dem[g]=(w.dem[g]||0)*0.85+(N[g]||0)*0.15});
  // households keep their own food for the year; the commons keeps a small reserve, and a region that depends on imports also stocks up at harvest for the months ahead
  const wk=S.t%52,f=trait(w,'fore'),dep={mountain:0.5,village:0,coast:0.45}[w.id],toH=Math.min(46,(26-wk+52)%52);
  let weeks=2+4*f+dep*toH*(0.4+0.6*f);if(P.rivalry)weeks*=1.35;
  const resK=pk*weeks,info={food:Math.max(0,Fk+resK*0.6-kcalOf(H)),imp:{},off:{},Fk,resK};w.reserveK=resK;
  const WK={wood:3,salt:8,med:4,tool:5,cloth:6,pot:6,shell:2};
  for(const g in WK){if(g==='shell'&&P.mode==='money')continue;const d=(w.dem[g]||0)*WK[g],need=N[g]||0,have=H[g]||0;
    info.imp[g]=Math.max(0,need+d-have);let keepExtra=0;if(w.id==='mountain'&&g==='wood')keepExtra=500;
    info.off[g]=Math.max(0,have-need-d*(P.rivalry?2:1.4)-keepExtra)}
  let offK=Math.max(0,kcalOf(H)-Fk-resK*(P.rivalry?1.2:1));
  for(const f2 of BY_FRESH){const q=Math.min(H[f2]||0,offK/G[f2].kcal);if(q>0.01){info.off[f2]=q;offK-=q*G[f2].kcal}}
  return info}
const needOf=(info,g)=>G[g].food?info.food/G[g].kcal:(info.imp[g]||0);
const cutNeed=(info,g,q)=>{if(G[g].food)info.food=Math.max(0,info.food-q*G[g].kcal);else info.imp[g]=Math.max(0,(info.imp[g]||0)-q)};
function ship(D,N,g,q){const hops=Math.abs(D.i-N.i);let loss=P.distance?0.035*hops:0,toll=0;if(P.distance&&hops===2)loss+=0.01;if(P.rivalry&&hops===2)toll=0.08;
  const arrive=q*(1-loss-toll);D.store[g]=Math.max(0,(D.store[g]||0)-q);add(N.store,g,arrive);if(toll>0)add(S.worlds[1].store,g,q*toll);
  S.flow.push([D.i,N.i,g,q,arrive]);add(D.tradeOut,g,q);add(N.tradeIn,g,arrive);return arrive}
// move goods of kind g (or any food, when g is 'food') from D to N; hooks decide how much and what is paid
function moveGoods(D,N,g,need,gf,info,lim,after){const iD=info[D.i],iN=info[N.i];
  for(const f of (g==='food'?BY_FRESH:[g])){if(need<=0.01)break;const av=(iD.off[f]||0)*gf;if(av<=0.001)continue;
    let q=Math.min(av,g==='food'?need/G[f].kcal:need);if(lim)q=lim(f,q);if(INT[f])q=Math.floor(q+1e-9);if(q<=0.001)continue;
    const arrive=ship(D,N,f,q);iD.off[f]=(iD.off[f]||0)-q;need-=g==='food'?arrive*G[f].kcal:arrive;cutNeed(iN,f,arrive);if(after)after(f,q)}
  return need}
function trade(){
  const info=S.worlds.map(w=>balance(w));S.info=info;
  const hungerOf=w=>w.hungryN||0,order=[...S.worlds].sort((a,b)=>hungerOf(b)-hungerOf(a));
  const goods=['food','med','tool','salt','wood','cloth','pot','shell'];
  for(const g of goods)for(const N of order){
    if(g==='shell'&&P.mode==='money')continue;
    const iN=info[N.i];let need=g==='food'?iN.food:(iN.imp[g]||0);if(!(need>(g==='food'?1000:0.01)))continue;
    const donors=S.worlds.filter(D=>D!==N&&(g==='food'?BY_FRESH.some(f=>(info[D.i].off[f]||0)>0.01):(info[D.i].off[g]||0)>0.01));
    if(!donors.length){N.why[g]={code:'none',need};continue}
    donors.sort((a,b)=>S.rel[b.i][N.i]-S.rel[a.i][N.i]);
    let blocked=null,poor=null,stingy=null;
    for(const D of donors){if(need<=(g==='food'?1000:0.01))break;const before=need;
      if(P.mode==='free'){const rel=S.rel[D.i][N.i];if(rel<-0.1){blocked=D;continue}
        let gf=0.4+0.6*trait(D,'gen');if(P.rivalry)gf*=0.65;if(P.share)gf=Math.min(1,gf*1.25+0.1);gf*=clamp(0.55+0.55*rel,0.3,1);if(P.greed)gf*=1-0.3*(1-trait(D,'hon'));
        need=moveGoods(D,N,g,need,gf,info);if(need>before*0.15&&gf<0.85)stingy=D}
      else if(P.mode==='money'){const iDn=info[D.i];void iDn;
        const pr=f=>S.prices[f]*(1+0.2*(trait(D,'bar')-trait(N,'bar')));
        need=moveGoods(D,N,g,need,1,info,(f,q)=>Math.min(q,Math.max(0,N.cash+(N.limit||0)*0.5)/pr(f)),(f,q)=>{const c=q*pr(f);N.cash-=c;D.cash+=c;add(S.dem,f,q)});
        if(need>before*0.1&&N.cash+(N.limit||0)*0.5<S.prices[g==='food'?'rice':g]*20)poor=D}
      else{ // barter: N pays with goods that D wants
        const edge=1+0.35*(trait(D,'bar')-trait(N,'bar')),val=x=>G[x].v*S.sc[x];
        const payCap=()=>{let v=0;for(const y of GK){if(y===g||G[y].food&&g==='food')continue;const o=info[N.i].off[y]||0;if(o<=0)continue;const nd=needOf(info[D.i],y);if(nd>0)v+=Math.min(o,nd)*val(y)}return v};
        need=moveGoods(D,N,g,need,1,info,(f,q)=>Math.min(q,payCap()/(val(f)*edge)),(f,q)=>{let owe=q*val(f)*edge;
          for(const y of GK){if(owe<=1e-6)break;if(y===f||(G[y].food&&G[f].food&&y===f))continue;const o=info[N.i].off[y]||0,nd=needOf(info[D.i],y);if(o<=0||nd<=0)continue;
            let qy=Math.min(o,nd,owe/val(y));if(INT[y])qy=Math.floor(qy+1e-9);if(qy<=0)continue;const arr=ship(N,D,y,qy);info[N.i].off[y]-=qy;cutNeed(info[D.i],y,arr);owe-=qy*val(y)}});
        if(need>before*0.1)poor=D}
    }
    if(need>(g==='food'?1000:0.01))N.why[g]={code:blocked?'blocked':poor?'poor':stingy?'stingy':'short',by:(blocked||poor||stingy||donors[0]).id,need};
  }
  // plague travels with the people who carry the goods
  if(P.contagion&&S.plagueW.size)S.flow.forEach(([d,n])=>{const D=S.worlds[d],N=S.worlds[n];if(S.plagueW.has(D.id)&&!S.plagueW.has(N.id)&&R()<0.12){const ps=N.hhs.flatMap(h=>h.members);const q=ps[R()*ps.length|0];
    if(q&&!q.sick&&!q.immune){q.sick={type:'plague',wk:4};logP(q,'和从外地来的商队接触，染上了瘟疫');N.event='plague';N.evLeft=10;news('bad',`瘟疫从${D.name}传到了${N.name}。`,N)}}});
}
function relations(){const rv=S.rv;for(let i=0;i<3;i++)for(let j=0;j<3;j++)rv[i][j]*=0.94;
  S.flow.forEach(([d,n,g,q])=>{rv[d][n]+=q*G[g].v*(g==='food'?1:1)});
  for(let d=0;d<3;d++)for(let n=0;n<3;n++){if(d===n)continue;const ratio=(rv[n][d]+300)/(rv[d][n]+300);let des=0.4+0.6*clamp(Math.log(ratio)/1.5,-1,1);
    const D=S.worlds[d];if(P.rivalry)des-=0.2;des+=0.2*(trait(D,'gen')-0.5);if(!P.rivalry&&!P.greed)des=Math.max(des,0.3); // among people who give freely and honestly, nobody keeps score
    if(P.greed&&!P.rivalry)des=Math.max(des,-0.3+0.5*trait(D,'gen'));const was=S.rel[d][n];S.rel[d][n]+=(des-was)*0.06;
    if(P.mode==='free'){const isB=S.rel[d][n]<-0.1,wasB=!!S.block[d][n];if(isB&&!wasB){S.block[d][n]=1;const rp=S.worlds[d];news('bad',`${rp.name}的代表${candOf(rp)?candOf(rp).name:''}不再向${S.worlds[n].name}送东西了：他们从${S.worlds[n].name}得到的回报太少。`,rp)}
      if(!isB&&wasB&&S.rel[d][n]>0.05){S.block[d][n]=0;news('good',`${S.worlds[d].name}和${S.worlds[n].name}和好了，又开始送东西。`,S.worlds[d])}}}}

// ---------- living ----------
function consume(se,wk){
  const over=P.mode==='free'&&P.greed;
  S.hhs.forEach(h=>{if(!h.members.length)return;const inv=h.inv,n=h.members.length;
    const K=hhKcal(h),greedy=over?1+0.35*greedOf(h)*(1-kindOf(h)):1;
    const before={};FOOD.forEach(g=>before[g]=inv[g]||0);
    const ate=takeFood(inv,K*greedy,BY_FRESH,null);S.cnt.overK+=Math.max(0,ate-K);
    const cov=Math.min(1,ate/K);let kinds=0,prot=0;FOOD.forEach(g=>{const e=(before[g]-(inv[g]||0))*G[g].kcal;if(e>ate*0.08)kinds++;if(G[g].prot)prot+=e});
    const heat=se===3?(S.harsh?18:12):(wk>=34&&wk<39?3:0),woodNeed=n*(3+heat),wood=Math.min(inv.wood||0,woodNeed);inv.wood=(inv.wood||0)-wood;const woodCov=woodNeed?wood/woodNeed:1;
    const saltNeed=n*0.08,salt=Math.min(inv.salt||0,saltNeed);inv.salt=(inv.salt||0)-salt;const pots=inv.pot||0;
    h.members.forEach(p=>{p.kcov=p.age<14?Math.min(1,cov*1.1):cov;p.variety=kinds;p.prot=ate?prot/ate:0;
      p.clothes=Math.max(0,p.clothes-(se===3?0.02:0.011));if(p.clothes<0.75&&(inv.cloth||0)>=0.5){const c=Math.min(inv.cloth,2);inv.cloth-=c;p.clothes=Math.min(1,p.clothes+c*0.25)}
      p.warm=se===3?woodCov*(0.45+0.55*Math.min(1,p.clothes/0.6)):(heat?0.5+0.5*woodCov:1);p.saltOk=saltNeed?salt/saltNeed:1;p.comfort=Math.min(1,pots/(n*0.6))});
    h.foodWeeks=kcalOf(inv)/K})}

function health(){
  const dead=[];
  S.people.forEach(p=>{const h=p.hh,inv=h.inv;
    let tgt=1-(1-p.kcov)*0.95-(p.variety<2?0.05:0)-(p.prot<0.08?0.05:0)-(1-p.warm)*0.4-(p.saltOk<0.5?0.05:0)-(p.age>65?(p.age-65)*0.012:0);
    let die=0.000008*Math.exp(0.09*p.age)+(p.age<1?0.0015:0);
    if(p.sick){const il=ILL[p.sick.type];tgt-=il.sev;let risk=il.die*(p.age<5||p.age>65?2.5:1);
      if(!p.sick.treated){if((inv.med||0)>=il.dose){inv.med-=il.dose;p.sick.treated=true;p.sick.wk=Math.max(1,p.sick.wk-1)}}
      if(p.sick.treated)risk*=0.1;else if(il.dose>1&&!p.sick.noted){p.sick.noted=1;logP(p,`${il.n}，可是家里没有药`)}
      die+=risk;p.sick.wk--;if(p.sick.wk<=0){if(p.sick.type==='plague')p.immune=true;if(p.sick.type!=='cold')logP(p,`${il.n}好了`);p.sick=null}}
    if(p.health<0.35)die+=(0.35-p.health)*0.2;
    if(p.kcov<0.5)die+=(0.5-p.kcov)*0.04;
    p.health+=(clamp(tgt,0.02,1)-p.health)*0.25;
    if(R()<die)dead.push(p)});
  dead.forEach(p=>{const cause=p.sick?ILL[p.sick.type].n+(p.sick.treated?'':'（没有药）'):p.kcov<0.6?'饥饿':p.warm<0.5?'寒冷':p.age>60?'年老':'体弱';die(p,cause)})}
function die(p,cause){p.alive=false;const h=p.hh;h.members=h.members.filter(q=>q!==p);S.people=S.people.filter(q=>q!==p);S.cnt.deaths++;S.yr.deaths++;add(S.cnt.by,cause,1);
  h.members.forEach(q=>{q.grief=1;logP(q,`家人${p.name}去世了（${cause}）`)});
  if(p.age<60||/没有药|饥饿|寒冷/.test(cause))news('bad',`${h.world.name}的${p.name}（${Math.floor(p.age)}岁）去世了，原因：${cause}。`,h.world);
  if(p.cand){const c=S.cands.find(x=>x.no===p.cand);if(c){c.alive=false;if(h.world.repNo===c.no){news('bad',`${h.world.name}的代表${c.name}去世了。`,h.world);replaceRep(h.world)}}}
  if(!h.members.length){const heirs=h.world.hhs.filter(x=>x!==h&&x.members.length);if(heirs.length){const x=heirs[R()*heirs.length|0];for(const g in h.inv)add(x.inv,g,h.inv[g]);x.money+=h.money;x.toolDur+=h.toolDur}
    h.world.hhs=h.world.hhs.filter(x=>x!==h);S.hhs=S.hhs.filter(x=>x!==h)}}

function family(){
  S.people.forEach(p=>{const was=Math.floor(p.age);p.age+=1/52;p.grief=Math.max(0,p.grief-0.03);
    if(Math.floor(p.age)!==was){if(was+1===16||was+1===72){assignJob(p);if(was+1===16&&p.job)logP(p,`长大了，开始当${JOB[p.job].n}`)}}});
  S.hhs.slice().forEach(h=>{const w=h.world,m=h.members;
    const mom=m.find(p=>p.sex==='f'&&p.age>=18&&p.age<=42),dad=m.find(p=>p.sex==='m'&&p.age>=18&&p.age<=60),kids=m.filter(p=>p.age<12).length;
    if(mom&&dad){const pr=0.006*clamp(mom.health,0,1)*Math.pow(mom.kcov,3)*(kids<3?1:0.35);
      if(R()<pr){const b=mkPerson(h,0,R()<0.5?'m':'f');logP(b,'出生了');logP(mom,`生了孩子${b.name}`);S.cnt.births++;S.yr.births++;
        if(S.yr.births%6===1)news('good',`${w.name}的${mom.name}家添了孩子${b.name}。`,w)}}
    m.filter(p=>p.age>=20&&p.age<=32&&p!==mom&&p!==dad&&m.length>=4&&!p.cand).forEach(p=>{if(R()<0.012){
      const mate=S.hhs.filter(x=>x.world===w&&x!==h).flatMap(x=>x.members).find(q=>q.sex!==p.sex&&q.age>=20&&q.age<=34&&q.hh.members.length>=3&&!q.cand&&!q.hh.members.some(z=>z!==q&&z.sex!==q.sex&&z.age>=18&&z.age<=60&&Math.abs(z.age-q.age)<8));
      const nh=mkHH(w,p.hh.sur);if(w===S.F){nh.free=true;claimPlot(nh)}[p,mate].filter(Boolean).forEach(q=>{q.hh.members=q.hh.members.filter(z=>z!==q);q.hh=nh;nh.members.push(q)});
      const sh=0.15;for(const g in h.inv){const q=(h.inv[g]||0)*sh;h.inv[g]-=q;add(nh.inv,g,q)}nh.money=h.money*sh;h.money-=nh.money;nh.toolDur=Math.min(h.toolDur,1);h.toolDur-=nh.toolDur;
      if(mate)logP(p,`和${mate.name}结婚，成了新的一家`);else logP(p,'搬出来自己住了')}})});
  S.hhs=S.hhs.filter(h=>h.members.length);allW().forEach(w=>w.hhs=w.hhs.filter(h=>h.members.length))}
function spoil(){
  const lose=inv=>{for(const g in inv){const r=G[g]&&G[g].rot;if(!r)continue;const l=inv[g]*r;if(G[g].food)S.cnt.spoilK+=l*G[g].kcal;inv[g]-=l}};
  S.hhs.forEach(h=>lose(h.inv));S.worlds.forEach(w=>lose(w.store));
  S.hhs.forEach(h=>{if((h.inv.pot||0)>0)h.inv.pot*=0.996})}
function money(wk){
  const p=S.prices,base=['rice','dfish','wood','salt','cloth','med','tool','egg'];
  const idx=base.reduce((a,g)=>a+p[g]/G[g].v,0)/base.length;S.priceIndex=P.mode==='money'?idx:1;
  S.cpiHist.push(idx);const m4=S.cpiHist.length>4?S.cpiHist[S.cpiHist.length-5]:idx;S.inflM=idx/m4-1;
  if(P.mode==='money'){
    const Mn=S.hhs.reduce((a,h)=>a+Math.max(0,h.money),0)+S.worlds.reduce((a,w)=>a+Math.max(0,w.cash),0);S.M0=S.M0||Mn;
    const out=S.people.filter(q=>q.job&&q.job!=='artist'&&!q.sick).length;S.out0=S.out0||out;
    S.moneyFactor+=(Math.pow(Mn/S.M0,P.greed?1:0.6)/clamp(out/S.out0,0.5,1.5)-S.moneyFactor)*0.25;
    if(S.inflM>0.1)S.trust=Math.max(0.3,S.trust-0.06*S.inflM/0.1);else S.trust=Math.min(1,S.trust+0.01);
    S.M=Mn;
  }else S.trust=Math.min(1,S.trust+0.02)}
function flee(){const food=w=>{const m=w.hhs.flatMap(h=>h.members);return m.length?m.reduce((a,p)=>a+p.kcov,0)/m.length:0};
  S.hhs.forEach(h=>{h.hungry=(h.hungry||0)*0.5+(h.members.reduce((a,p)=>a+p.kcov,0)/Math.max(1,h.members.length)<0.8?2:0)});
  S.worlds.forEach(w=>{w.hhs.slice().forEach(h=>{if(h.free||h.hungry<3||R()>0.15||h.members.some(p=>p.cand))return;const to=S.worlds.filter(o=>o!==w&&o.hhs.length).sort((a,b)=>food(b)-food(a))[0];if(!to||food(to)<0.9)return;
    w.hhs=w.hhs.filter(x=>x!==h);h.world=to;to.hhs.push(h);h.hungry=0;h.members.forEach(p=>{if(p.job){assignJob(p);p.skill*=0.85}logP(p,`吃不饱，全家从${w.name}逃荒到了${to.name}`)});
    S.cnt.fled=(S.cnt.fled||0)+h.members.length;news('bad',`${h.sur}家在${w.name}吃不饱，逃荒去了${to.name}。`,to)})})}
function migrate(){
  if(!P.migrate)return;const ws=S.worlds.filter(w=>w.hhs.length),hap=w=>{const ps=w.hhs.flatMap(h=>h.members);return ps.reduce((a,p)=>a+p.happy,0)/Math.max(1,ps.length)};
  const best=[...ws].sort((a,b)=>hap(b)-hap(a))[0];
  ws.forEach(w=>{if(w===best||hap(best)-hap(w)<0.12)return;w.hhs.slice().forEach(h=>{const hp=h.members.reduce((a,p)=>a+p.happy,0)/h.members.length;
    if(hp<0.5&&R()<0.08&&!h.free&&!h.members.some(p=>p.cand)){w.hhs=w.hhs.filter(x=>x!==h);h.world=best;best.hhs.push(h);h.members.forEach(p=>{if(p.job){assignJob(p);p.skill*=0.8}logP(p,`全家从${w.name}搬到了${best.name}`)});
      S.cnt.moved+=h.members.length;news('info',`${h.sur}家从${w.name}搬去了${best.name}。`,best)}})})}

// ---------- people who leave: to a lonely corner of their own country, or out to the empty land ----------
function claimPlot(h){const free=S.plots.map((p,i)=>[p,i]).filter(([p])=>!p.own);if(!free.length){h.plotQ=0.5;return}
  let best=null;for(let k=0;k<40;k++){const c=free[R()*free.length|0];if(!best||c[0].q>best[0].q)best=c}
  best[0].own=h.id;h.plot=best[1];h.plotQ=best[0].q;S.fclaims.push([S.t,best[1],best[0].q,h.sur+'家'])}
function settle(h,w,hermit){h.free=true;h.members.forEach(p=>{if(p.age>=16&&p.age<72)p.job='homesteader'});
  if(hermit){h.hermit=true;h.plotQ=0.75+R()*0.3;S.cnt.hermit+=h.members.length;h.members.forEach(p=>logP(p,`对${w.name}的代表不满，全家搬到${w.name}偏远的角落独自住`));news('info',`${h.sur}家对${w.name}的代表不满，搬到角落独自住了。`,w)}
  else{w.hhs=w.hhs.filter(x=>x!==h);h.world=S.F;S.F.hhs.push(h);claimPlot(h);for(const g in h.inv)h.inv[g]*=0.75;h.toolDur*=0.7;S.cnt.front+=h.members.length;
    h.members.forEach(p=>logP(p,`对${w.name}的代表不满，全家搬去荒地，占了一块地`));news('info',`${h.sur}家离开${w.name}，去荒地占了一块地（地力 ${h.plotQ.toFixed(2)}）。`,w)}
  S.cnt.left+=h.members.length}
function leave(){S.worlds.forEach(w=>w.hhs.slice().forEach(h=>{if(h.free||h.members.some(p=>p.cand))return;const ad=h.members.filter(p=>p.age>=18);if(!ad.length)return;
  if(ad.filter(p=>p.vote&&p.vote!==w.repNo).length/ad.length<0.5)return;const hap=h.members.reduce((a,p)=>a+p.happy,0)/h.members.length;
  const pr=0.004+0.05*clamp((0.8-hap)/0.2,0,1)+(P.corruption?0.004:0);if(R()<pr)settle(h,w,R()<(w.id==='mountain'?0.55:0.15))}))}
// out there nobody runs a granary; a travelling pedlar sells salt, cloth, pots, medicine and tools at 1.8 times their value, paid in the family's surplus
function peddle(){S.hhs.forEach(h=>{if(!h.free||!h.members.length)return;const t=targets(h,false),nd=needs(h,t),sur=surplus(h,t);let avail=0;for(const g in sur)avail+=sur[g]*G[g].v;
  for(const g of ['med','salt','tool','cloth','pot']){let q=nd[g];if(!q||avail<=0)continue;const unit=G[g].v*1.8;q=Math.min(q,avail/unit);if(INT[g]||g==='med')q=Math.floor(q);if(q<=0)continue;
    let owe=q*unit;for(const k in sur){if(owe<=0)break;const pay=Math.min(sur[k]*G[k].v,owe),amt=pay/G[k].v;h.inv[k]=Math.max(0,(h.inv[k]||0)-amt);sur[k]-=amt;owe-=pay;avail-=pay}
    if(g==='tool')h.toolDur+=q;else add(h.inv,g,q)}})}
// ---------- elections ----------
function giniOf(a){if(a.length<2)return 0;a=[...a].sort((x,y)=>x-y);const n=a.length,s=a.reduce((x,y)=>x+y,0);if(s<=0)return 0;let c=0;a.forEach((x,i)=>c+=(2*(i+1)-n-1)*x);return c/(n*s)}
function setRep(w,c){const old=repPerson(w);if(old){old.job=null;assignJob(old)}w.repNo=c.no;const p=S.people.find(q=>q.id===c.pid);if(p){p.job='rep';logP(p,`当选${w.name}的代表`)}}
function replaceRep(w){const cs=S.cands.filter(c=>c.home===w.id&&c.alive);
  if(cs.length){const c=cs.sort((a,b)=>b.votes-a.votes)[0];setRep(w,c);news('info',`${c.name}接任${w.name}的代表。`,w);return}
  const ad=w.hhs.flatMap(h=>h.members.filter(p=>p.age>=30&&p.age<62));if(!ad.length)return;const p=ad[R()*ad.length|0];
  const c={no:S.nextNo++,name:p.name,home:w.id,sex:p.sex,age:Math.floor(p.age),v0:0,votes:0,alive:true,pid:p.id,hon:R(),dil:R(),gen:R(),bar:R(),fore:R(),cha:0.5,bio:'大家推出来的新代表'};
  p.cand=c.no;S.cands.push(c);setRep(w,c);news('info',`${c.name}被大家推成了${w.name}的代表。`,w)}
function voteFor(p,cs,w){let best=null,bs=-99;cs.forEach(c=>{let u=1.0*c.cha+R()*0.8;
  if(c.no===w.repNo)u+=(w.approval-0.62)*5;
  if(p.kcov<0.9)u+=1.3*c.gen;if(p.sick&&!p.sick.treated)u+=0.6*c.dil;
  u+=(P.corruption?1.4:0.4)*c.hon;if(p.age>50)u+=0.4*c.fore;if(p.hh.world.skimmedSeen>0)u+=c.hon*1.5;
  if(u>bs){bs=u;best=c}});return best}
// before each election, every region is topped up to three candidates (people who step forward)
function nominate(){S.worlds.forEach(w=>{let cs=S.cands.filter(c=>c.home===w.id&&c.alive);
  const pool=w.hhs.flatMap(h=>h.members.filter(p=>p.age>=30&&p.age<=64&&!p.cand&&p.health>0.5));
  while(cs.length<3&&pool.length){const p=pool.splice(R()*pool.length|0,1)[0];
    const c={no:S.nextNo++,name:p.name,home:w.id,sex:p.sex,age:Math.floor(p.age),v0:0,votes:0,alive:true,pid:p.id,hon:clamp(0.15+R()*0.8,0,1),dil:clamp(0.2+R()*0.7+(p.dil-0.6)*0.3,0,1),gen:clamp(R(),0,1),bar:clamp(R(),0,1),fore:clamp(R(),0,1),cha:clamp(0.2+R()*0.7,0,1),
      bio:['热心的邻居','做事认真的人','精打细算的人','爱说话的人','老实巴交的人','见过世面的人'][R()*6|0]};
    p.cand=c.no;S.cands.push(c);cs.push(c)}})}
function holdElection(initial){
  if(!initial)nominate();
  const rows=[],won={};S.cands.forEach(c=>c.votes=0);
  S.worlds.forEach(w=>{const cs=S.cands.filter(c=>c.home===w.id&&c.alive),ad=w.hhs.filter(h=>!h.free).flatMap(h=>h.members.filter(p=>p.age>=18));if(!cs.length)return;
    if(initial){const pool=[];cs.forEach(c=>{for(let i=0;i<c.v0;i++)pool.push(c.no)});while(pool.length<ad.length)pool.push(cs[0].no);
      for(let i=pool.length-1;i>0;i--){const j=R()*(i+1)|0;[pool[i],pool[j]]=[pool[j],pool[i]]}ad.forEach((p,i)=>{p.vote=pool[i];const c=cs.find(x=>x.no===p.vote);if(c)c.votes++})}
    else ad.forEach(p=>{const c=voteFor(p,cs,w);p.vote=c.no;c.votes++});
    const win=[...cs].sort((a,b)=>b.votes-a.votes)[0];won[w.id]=win;
    if(win.no!==w.repNo||initial){const prev=candOf(w);setRep(w,win);if(!initial)news('bad',`选举：${w.name}换了代表，${win.name}当选${prev?'，'+prev.name+'落选':''}。`,w);}
    else news('good',`选举：${w.name}的${win.name}连任（${win.votes} 票）。`,w)});
  S.nextElection=S.t+208;
  const res={t:S.t,n:S.elec.length+1,rows:S.cands.filter(c=>c.alive||c.votes>0).map(c=>({no:c.no,name:c.name,home:c.home,votes:c.votes,won:!!won[c.home]&&won[c.home].no===c.no}))};S.elec.push(res);
  if(initial)news('info','第一次选举：山区的郑铁山（6 号）、乡村的杨满仓（7 号）、海边的何贝娜（9 号）当选各自地区的代表。')}

// ---------- the scoreboard ----------
function hhWealth(h){let v=0;for(const g in h.inv)v+=(h.inv[g]||0)*G[g].v;return v+h.toolDur*G.tool.v+(P.mode==='money'?Math.max(0,h.money)/Math.max(0.2,S.priceIndex):0)}
function happiness(){
  const autonomy={free:0.85,barter:0.65,money:0.65}[P.mode]+(P.freedom?0.15:0);
  const gini=giniOf(S.hhs.flatMap(h=>h.members.map(()=>hhWealth(h)/h.members.length)));S.gini=gini;
  S.people.forEach(p=>{let x=0.28*p.kcov+0.16*p.health+0.08*Math.min(1,p.variety/3)+0.1*p.warm+0.07*(p.comfort||0)+0.1*Math.min(1,autonomy)+0.09*(1-gini)+0.08*Math.min(1,(p.hh.foodWeeks||0)/6)+0.04;
    if(p.job==='artist')x+=0.08;if(P.mode==='money'&&S.inflM>0.04)x-=Math.min(0.2,S.inflM*1.2);if(p.sick)x-=0.1;x-=p.grief*0.25;x-=(1-p.hh.world.trust)*0.12;
    if(P.mode==='free'&&P.freeRide&&p.effort>0.85)x-=0.05;
    const hw=p.hh.world;if(p.hh.free)x+=0.03;else if(p.age>=18&&p.vote&&hw.repNo&&p.vote!==hw.repNo)x-=0.15; // people who voted for someone else are unhappy under the winners
    p.happy+=(clamp(x,0,1)-p.happy)*0.3})}
function record(){
  happiness();
  const ps=S.people,n=ps.length||1,avg=f=>ps.reduce((a,p)=>a+f(p),0)/n;
  S.wstat=S.worlds.map(w=>{const m=w.hhs.flatMap(h=>h.members),k=m.length||1;
    const ws=m.filter(p=>p.job&&p.job!=='artist'&&!JOB[p.job].pub).length,td=w.hhs.reduce((a,h)=>a+Math.min(h.toolDur,workers(h).length),0);
    const o={id:w.id,pop:m.length,kcov:m.reduce((a,p)=>a+p.kcov,0)/k,health:m.reduce((a,p)=>a+p.health,0)/k,happy:m.reduce((a,p)=>a+p.happy,0)/k,sick:m.filter(p=>p.sick).length,
      hungry:m.filter(p=>p.kcov<0.85).length,cold:m.filter(p=>p.warm<0.6).length,noMed:m.filter(p=>p.sick&&!p.sick.treated&&ILL[p.sick.type].dose>1).length,tool:ws?clamp(td/ws,0,1):1,
      foodWeeks:kcalOf(w.store)/Math.max(1,w.hhs.reduce((a,h)=>a+hhKcal(h),0)),queue:w.queue||0,adults:m.filter(p=>p.age>=18).length,hermits:w.hhs.filter(h=>h.hermit).length};
    w.hungryN=o.hungry;w.approval+=((0.5*o.happy+0.5*o.kcov)-w.approval)*0.04;
    const infl=w.inflow&&Object.keys(w.inflow).reduce((a,g)=>a+w.inflow[g]*G[g].v,0)||0;
    const seen=infl>0?w.skimmed/(infl+w.skimmed):0;w.skimmedSeen=(w.skimmedSeen||0)*0.97+seen*0.2;
    if(w.skimmed>0)w.trust=Math.max(0.25,w.trust-Math.min(0.03,seen*0.3));else w.trust=Math.min(1,w.trust+0.004);
    return o});
  S.famine=ps.filter(p=>p.kcov<0.7).length/n;
  {const fm=S.F.hhs.flatMap(h=>h.members),fr=S.plots.filter(p=>!p.own);S.fstat={pop:fm.length,hh:S.F.hhs.length,hungry:fm.filter(p=>p.kcov<0.85).length,sick:fm.filter(p=>p.sick).length,noMed:fm.filter(p=>p.sick&&!p.sick.treated&&ILL[p.sick.type].dose>1).length,claimed:S.plots.length-fr.length,freeQ:+(fr.reduce((a,p)=>a+p.q,0)/Math.max(1,fr.length)).toFixed(2)}}
  const c=S.cnt,by=c.by;
  S.hist.push({t:S.t,pop:ps.length,kcov:avg(p=>p.kcov),health:avg(p=>p.health),happy:avg(p=>p.happy),gini:S.gini,hungry:ps.filter(p=>p.kcov<0.85).length,sick:ps.filter(p=>p.sick).length,
    apple:P.mode==='money'?S.prices.rice:null,trust:S.trust,mode:P.mode,fish:S.res.fish,game:S.res.game,forest:S.res.forest,effort:(()=>{const w=ps.filter(p=>p.effort>0);return w.length?w.reduce((a,p)=>a+p.effort,0)/w.length:1})(),
    cStarve:by['饥饿']||0,cNoMed:Object.keys(by).filter(k=>k.includes('没有药')).reduce((a,k)=>a+by[k],0),cCold:by['寒冷']||0,cFled:c.fled||0,cLeft:c.left,cHermit:c.hermit,cFront:c.front,cBirths:c.births,births:S.yr.births,deaths:S.yr.deaths,
    ws:S.wstat.map(o=>({kcov:o.kcov,hungry:o.hungry,noMed:o.noMed,cold:o.cold,tool:o.tool}))});
  if(S.hist.length>800)S.hist.shift()}

// ---------- start, save, load ----------
function newGame(params,seed){
  P=Object.assign({},DEF,params||{});R=mkRng(seed||20261108);
  S={t:0,nid:1,people:[],hhs:[],worlds:[],news:[],hist:[],log:[],res:{fish:0.72,game:0.72,forest:0.75},prices:{},sc:{},demand:{},supply:{},dem:{},sup:{},shortAll:{},moneyFactor:1,trust:1,cpiHist:[],priceIndex:1,inflM:0,M:0,printed:0,
    cands:CANDS.map(c=>({...c,alive:true,votes:c.v0,pid:0})),nextNo:10,elec:[],rel:[[0,.4,.4],[.4,0,.4],[.4,.4,0]],rv:[[0,0,0],[0,0,0],[0,0,0]],block:[[0,0,0],[0,0,0],[0,0,0]],flow:[],
    cnt:{births:0,deaths:0,spoilK:0,leak:0,overK:0,by:{},moved:0,fled:0,left:0,hermit:0,front:0},yr:{births:0,deaths:0},famine:0,P,sizeErode:1,wk:{}};
  GK.forEach(g=>{S.prices[g]=G[g].v;S.sc[g]=1;S.demand[g]=0;S.supply[g]=0});
  S.demand.rice=600;S.demand.dfish=60;S.demand.egg=20;S.demand.wood=2000;S.demand.salt=40;S.demand.cloth=30;S.demand.med=12;S.demand.tool=4;S.demand.pot=4;
  RG.forEach((d,i)=>{const w={...d,i,hhs:[],ev:d.ev||[],event:null,evLeft:0,dem:{},why:{},tradeIn:{},tradeOut:{},made:{},inflow:{},short:{},trust:1,approval:0.7,repNo:null,cash:30000,cap:30,cl:2,queue:0,skimmed:0,skimmedSeen:0,reserveK:0,hungryN:0,
    store:i===0?{tool:12,med:30,wood:800,ore:100,tuber:200,smeat:50}:i===1?{rice:6000,cloth:12,pot:20,egg:20}:{salt:60,dfish:200,shell:300,wood:200},
    members(){return this.hhs.reduce((a,h)=>a+h.members.length,0)}};S.worlds.push(w)});
  S.F={id:'frontier',name:'荒地',i:3,hhs:[],ev:[],event:null,store:{},made:{},dem:{},why:{},trust:1,approval:0.7,repNo:null,jobs:{homesteader:1},members(){return this.hhs.reduce((a,h)=>a+h.members.length,0)}};
  S.plots=Array.from({length:200},()=>({q:+(0.55+0.95*Math.pow(R(),1.3)).toFixed(2),own:0}));S.fclaims=[];
  S.worlds.forEach(populate);
  // the nine candidates are real people living in their home regions
  S.cands.forEach(c=>{const w=S.worlds.find(x=>x.id===c.home);const pool=w.hhs.flatMap(h=>h.members.filter(p=>p.age>=28&&p.age<=62&&!p.cand&&(!c.sexStrict||p.sex===c.sex)&&p.hh.members.filter(q=>q.cand).length===0));
    const pref=pool.filter(p=>p.sex===c.sex);const p=(pref.length?pref:pool)[R()*(pref.length?pref.length:pool.length)|0];
    p.name=c.name;p.sex=c.sex;p.age=c.age;p.cand=c.no;p.skill=1;p.dil=0.5+c.dil*0.5;c.pid=p.id;logP(p,`参加了第一次选举`)});
  S.worlds[1].hhs.forEach(h=>{const nf=h.members.filter(p=>p.job==='farmer').length;h.crop=nf*26*0.85;h.inv.rice=h.members.length*0.8*4.4*4});
  S.worlds[1].store.rice=2500;
  S.t=25;
  holdElection(true);
  S.worlds.forEach(w=>{w.hhs.forEach(h=>{h.staff=false})});
  ensureStaff();
  setShell();
  S.P=P;return S}
function setShell(){const w=S.worlds[2],ws=w.hhs.flatMap(h=>h.members.filter(p=>p.age>=16&&p.age<72&&(p.job==='fisher'||p.job==='shell')&&!p.cand));
  const want=Math.round(P.shellShare*(ws.length+2)),have=ws.filter(p=>p.job==='shell');
  if(have.length<want){ws.filter(p=>p.job==='fisher').slice(0,want-have.length).forEach(p=>p.job='shell')}
  else if(have.length>want){have.slice(0,have.length-want).forEach(p=>p.job='fisher')}}
function save(){const wI=new Map(S.worlds.map((w,i)=>[w,i])),hI=new Map(S.hhs.map((h,i)=>[h,i]));
  const worlds=S.worlds.map(w=>{const o={};for(const k in w){if(k==='hhs'||typeof w[k]==='function'||k==='seen'||k==='blocked')continue;o[k]=w[k]}o.hhs=w.hhs.map(h=>hI.get(h)).filter(x=>x!=null);return o});
  const hhs=S.hhs.map(h=>{const o={};for(const k in h){if(k==='world'||k==='members')continue;o[k]=h[k]}o.world=wI.get(h.world);o.members=h.members.map(p=>p.id);return o});
  const people=S.people.map(p=>{const o={};for(const k in p){if(k==='hh')continue;o[k]=p[k]}return o});
  const rest={};for(const k in S){if(['worlds','hhs','people','plagueW','P','info','wstat'].includes(k))continue;rest[k]=S[k]}
  return JSON.stringify({v:2,P,worlds,hhs,people,rest})}
function load(str){const d=typeof str==='string'?JSON.parse(str):str;if(!d||d.v!==2)throw new Error('bad save');
  P=Object.assign({},DEF,d.P);R=mkRng((Date.now()^0x5bd1e995)>>>0);
  S=Object.assign({},d.rest);S.P=P;
  const worlds=d.worlds.map(o=>({...o,hhs:[],members(){return this.hhs.reduce((a,h)=>a+h.members.length,0)}}));
  const people=new Map(d.people.map(o=>[o.id,{...o}]));
  const hhs=d.hhs.map(o=>{const h={...o,world:worlds[o.world],members:o.members.map(id=>people.get(id)).filter(Boolean)};h.members.forEach(p=>p.hh=h);return h});
  worlds.forEach((w,i)=>w.hhs=d.worlds[i].hhs.map(j=>hhs[j]).filter(Boolean));
  S.worlds=worlds;S.hhs=hhs;S.people=[...people.values()].filter(p=>p.hh);S.plagueW=new Set();S.wstat=[];S.info=[];return S}
function setP(o){Object.assign(P,o);
  if('freedom'in o)S.people.forEach(p=>{if(p.cand&&p.job==='rep')return;if(o.freedom&&p.job&&!JOB[p.job].pub&&R()<0.12)p.job='artist';else if(!o.freedom&&p.job==='artist')assignJob(p)});
  if('shellShare'in o)setShell()}
return{save,load,GK,FOOD,G,JOB,RG,CANDS,EVN,ILL,SEASON,season,DEF,newGame,step,setP,trait,candOf,repPerson,when,kcalOf,hhKcal,workers,giniOf,holdElection,
  trigger2:(w,e)=>trigger(w,e,false),get S(){return S},get P(){return P}};
})();
/*SIM-END*/
