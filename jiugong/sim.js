/*SIM-START*/
var Sim=(()=>{
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
function mkRng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---------- goods: unit, calories, weekly spoilage, value in 块 (about 5 块 per hour of work) ----------
const G={
 rice:{n:'稻米',u:'公斤',kcal:3500,rot:0.004,v:9,food:1},
 apple:{n:'苹果',u:'公斤',kcal:520,rot:0.035,v:3.5,food:1},
 fish:{n:'鲜鱼',u:'公斤',kcal:1000,rot:0.5,v:6,food:1,prot:1},
 sfish:{n:'咸鱼',u:'公斤',kcal:1400,rot:0.01,v:11,food:1,prot:1},
 meat:{n:'鲜肉',u:'公斤',kcal:2000,rot:0.45,v:18,food:1,prot:1},
 smeat:{n:'腊肉',u:'公斤',kcal:2600,rot:0.01,v:26,food:1,prot:1},
 milk:{n:'羊奶',u:'升',kcal:650,rot:0.6,v:4.5,food:1,prot:1},
 cheese:{n:'奶酪',u:'公斤',kcal:4000,rot:0.008,v:36,food:1,prot:1},
 forage:{n:'野菜野果',u:'公斤',kcal:600,rot:0.3,v:2,food:1},
 salt:{n:'盐',u:'公斤',rot:0,v:8},
 wood:{n:'木柴',u:'公斤',rot:0,v:0.7},
 ore:{n:'铁矿石',u:'公斤',rot:0,v:40},
 wool:{n:'羊毛',u:'公斤',rot:0.002,v:30},
 herb:{n:'草药',u:'公斤',rot:0.01,v:280},
 pot:{n:'陶器',u:'件',rot:0.01,v:40},
 cloth:{n:'布',u:'米',rot:0.002,v:100},
 med:{n:'药品',u:'剂',rot:0.01,v:120},
 tool:{n:'铁器工具',u:'件',rot:0,v:480},
};
const GK=Object.keys(G),FOOD=GK.filter(g=>G[g].food);
const BY_STORE=[...FOOD].sort((a,b)=>G[a].rot-G[b].rot);   // keep the long-lasting food, eat the fresh food first
const BY_FRESH=[...FOOD].sort((a,b)=>G[b].rot-G[a].rot);
const SEASON=['春','夏','秋','冬'];
const season=t=>Math.floor((t%52)/13);

// ---------- jobs: weekly output of a healthy adult with good tools, by season (spring, summer, autumn, winter) ----------
const JOB={
 farmer:{n:'农民',heavy:1},
 orchardist:{n:'果农',out:{apple:[0,58,174,0]}},
 fisher:{n:'渔民',out:{fish:[35,42,32,19]},res:'fish'},
 salter:{n:'晒盐人',out:{salt:[20,44,28,5]}},
 hunter:{n:'猎人',out:{meat:[9,9,13,13]},res:'game',risk:0.004,heavy:1},
 woodcutter:{n:'樵夫',out:{wood:[310,260,330,330]},res:'forest',risk:0.003,heavy:1},
 herder:{n:'牧民',out:{milk:[42,45,24,9],wool:[6.5,0,0,0],meat:[0,0,5,1]}},
 miner:{n:'矿工',out:{ore:[5.2,5.2,5.2,3.6]},risk:0.005,heavy:1},
 herbalist:{n:'采药人',out:{herb:[0.8,1,0.8,0.2]}},
 potter:{n:'陶匠'},weaver:{n:'织布工'},
 smith:{n:'铁匠',heavy:1},pharm:{n:'药剂师'},clerk:{n:'仓库管理员'},
 artist:{n:'自由玩耍、画画'},
};
const WORLDS=[
 {id:'orchard',name:'苹果园',r:0,c:0,pop:40,jobs:{orchardist:1},land:{orchardist:28},desc:'种苹果，冬天修剪树枝当柴烧',ev:['drought','bumper']},
 {id:'forest',name:'猎人森林',r:0,c:1,pop:36,jobs:{hunter:0.5,woodcutter:0.5},desc:'打猎、砍柴，肉要用盐腌才能放',ev:['fire']},
 {id:'mine',name:'雪山矿场',r:0,c:2,pop:18,jobs:{miner:1},desc:'挖铁矿石，打铁器工具要用',ev:['collapse']},
 {id:'fish',name:'海边渔港',r:1,c:0,pop:46,jobs:{fisher:0.78,salter:0.22},desc:'打鱼、晒盐，鱼用盐腌成咸鱼',ev:['storm']},
 {id:'pasture',name:'草原牧场',r:1,c:2,pop:36,jobs:{herder:1},land:{herder:26},desc:'放羊、挤奶、剪羊毛，奶做成奶酪',ev:['drought']},
 {id:'herb',name:'草药谷',r:2,c:0,pop:16,jobs:{herbalist:1},desc:'采草药，补给中心用它做药',ev:['drought']},
 {id:'farm',name:'稻田村',r:2,c:1,pop:62,jobs:{farmer:1},land:{farmer:40},desc:'春夏种稻，秋天收割，一年只收一次',ev:['drought','locust','bumper']},
 {id:'craft',name:'陶土小镇',r:2,c:2,pop:30,jobs:{potter:0.18,weaver:0.82},desc:'烧陶器、用羊毛织布做衣服',ev:['storm']},
];
const HUBW={id:'hub',name:'补给中心',r:1,c:1,pop:20,jobs:{smith:0.35,pharm:0.25,clerk:0.4},desc:'仓库、铁匠铺、药房'};
const EVN={drought:'干旱',storm:'风暴',fire:'山火',collapse:'矿井塌方',locust:'蝗灾',plague:'瘟疫',bumper:'大丰收',winter:'寒冬'};
const ILL={cold:{n:'感冒',sev:0.12,wk:2,dose:1,die:0.0006},dys:{n:'痢疾',sev:0.4,wk:3,dose:3,die:0.018},inj:{n:'受伤',sev:0.35,wk:4,dose:2,die:0.008},plague:{n:'瘟疫',sev:0.6,wk:4,dose:4,die:0.03}};
const SUR=['王','李','张','刘','陈','杨','赵','黄','周','吴','徐','孙','胡','朱','高','林','何','郭','马','罗','梁','宋','郑','谢','韩','唐','冯','于','董','萧'];
const MN=['石','山','海','林','磊','强','明','亮','杰','涛','刚','勇','松','柏','川','峰','军','平','安','建'];
const FN=['花','兰','梅','霞','秀','芳','燕','丽','云','月','雪','玲','慧','珍','英','琴','红','莲','春','秋'];
const MID=['小','大','阿','春','秋','冬','金','玉','德','永','文','新','长','宝'];

let S,P,R;
const DEF={mode:'free',kindness:0.6,printRate:0.01,hubStaff:20,needFirst:false,share:false,freedom:false,migrate:false,reputation:false,priceCap:false,
  greed:false,freeRide:false,disasters:false,contagion:false,distance:false,corruption:false};

// ---------- people and households ----------
function pick(o){let x=R(),s=0;for(const k in o){s+=o[k];if(x<s)return k}return Object.keys(o)[0]}
function nameOf(sur,sex){return sur+(R()<0.5?MID[R()*MID.length|0]:'')+(sex==='m'?MN:FN)[R()*20|0]}
function mkPerson(hh,age,sex){const p={id:S.nid++,name:nameOf(hh.sur,sex),sex,age,hh,job:null,skill:0.75+R()*0.5,dil:0.3+R()*0.7,greed:R(),kind:R(),
  health:0.85+R()*0.15,sick:null,kcov:1,warm:1,variety:2,prot:0.2,comfort:0.5,saltOk:1,effort:0,hours:0,clothes:age<1?0.9:0.55+R()*0.4,happy:0.7,grief:0,log:[],alive:true,born:S.t-Math.round(age*52)};
  hh.members.push(p);S.people.push(p);assignJob(p);return p}
function assignJob(p){const w=p.hh.world;if(p.age<16||p.age>=72){p.job=null;return}
  if(P.freedom&&w.id!=='hub'&&R()<0.12){p.job='artist';return}
  p.job=pick(w.jobs)}
function mkHH(w,sur){const h={id:S.nid++,world:w,sur:sur||SUR[R()*SUR.length|0],members:[],inv:{},money:0,credits:0,crop:0,cropTotal:0,toolDur:0,distPen:0,lastNeed:0,lastGot:0};w.hhs.push(h);S.hhs.push(h);return h}
function logP(p,txt){p.log.unshift(`${when(S.t)} ${txt}`);if(p.log.length>14)p.log.pop()}
function when(t){return `第${Math.floor(t/52)+1}年${SEASON[season(t)]}`}
function news(type,txt,w){S.news.unshift({t:S.t,type,txt,w:w&&w.id});if(S.news.length>120)S.news.pop()}
const alive=h=>h.members;
const workers=h=>h.members.filter(p=>p.job&&p.job!=='artist');

function populate(w){
  while(w.members()<w.pop){
    const h=mkHH(w),x=R();
    if(x<0.6){const a=24+R()*22;mkPerson(h,a,'m');mkPerson(h,a-2+R()*4,'f');const k=1+(R()*4|0);for(let i=0;i<k;i++)mkPerson(h,Math.max(0,a-20-R()*16),R()<0.5?'m':'f');
      if(R()<0.25)mkPerson(h,60+R()*15,R()<0.5?'m':'f')}
    else if(x<0.75){const a=58+R()*16;mkPerson(h,a,'m');mkPerson(h,a-3+R()*4,'f')}
    else{mkPerson(h,17+R()*40,R()<0.5?'m':'f')}
  }
  w.hhs.forEach(h=>{const n=h.members.length;h.money=n*400;h.toolDur=workers(h).length*(0.4+R()*0.7);
    h.inv.wood=n*20;h.credits=n*80;h.inv.salt=n*0.6;h.inv.med=1;h.inv.cloth=0;h.inv.pot=Math.round(n*0.5);
    if(w.id==='farm')h.inv.rice=n*0.8*15400/3500*32;else{h.inv.rice=n*0.8*15400/3500*5}
    if(w.id==='pasture')h.inv.cheese=n*2;if(w.id==='fish')h.inv.sfish=n*3;if(w.id==='forest')h.inv.smeat=n*2;if(w.id==='orchard')h.inv.apple=n*8})
}
function newGame(params,seed){
  P=Object.assign({},DEF,params||{});R=mkRng(seed||20261108);
  S={t:0,nid:1,people:[],hhs:[],worlds:[],news:[],hist:[],log:[],
    hub:{inv:{med:60,tool:25,rice:16000,sfish:120,cheese:40,wood:1500,salt:40,herb:4,ore:40,cloth:40,pot:10},cash:30000,made:{med:0,tool:0},unmet:{},queue:0},
    res:{fish:0.72,game:0.72,forest:0.75},moneyFactor:1,events:[],prices:{},sc:{},trust:1,cpiHist:[],priceIndex:1,M:0,printed:0,
    cnt:{births:0,deaths:0,spoilK:0,lostTrade:0,barterTry:0,barterFail:0,needQ:0,unmetQ:0,overK:0,leak:0,moved:0,by:{}},
    yr:{births:0,deaths:0}};
  GK.forEach(g=>{S.prices[g]=G[g].v;S.sc[g]=1});S.demand={rice:600,sfish:60,cheese:30,smeat:20,apple:150,fish:50,meat:10,milk:20,forage:0,salt:40,wood:2000,ore:40,wool:30,herb:4,pot:4,cloth:30,med:12,tool:4};
  [...WORLDS,HUBW].forEach(d=>{const w={...d,hhs:[],ev:d.ev||[],event:null,evLeft:0,members(){return this.hhs.reduce((a,h)=>a+h.members.length,0)}};S.worlds.push(w)});
  S.hubW=S.worlds.find(w=>w.id==='hub');S.P=P;
  S.worlds.forEach(w=>{if(w.id==='hub'){w.pop=P.hubStaff}populate(w)});
  S.M=S.hhs.reduce((a,h)=>a+h.money,0);
  return S;
}

// ---------- helpers ----------
const add=(o,g,q)=>{o[g]=(o[g]||0)+q};
const kcalOf=inv=>FOOD.reduce((a,g)=>a+(inv[g]||0)*G[g].kcal,0);
function personKcal(p){let k=p.age<5?0.45:p.age<14?0.7:p.age<17?0.95:p.age>=65?0.8:1;if(p.job&&JOB[p.job].heavy)k*=1.2;return 15400*k}
const hhKcal=h=>h.members.reduce((a,p)=>a+personKcal(p),0);
function takeFood(inv,k,order,to){let left=k;for(const g of order){if(left<=0)break;const have=inv[g]||0;if(have<=0)continue;const q=Math.min(have,left/G[g].kcal);inv[g]=have-q;if(to)add(to,g,q);left-=q*G[g].kcal}return k-left}
function kEff(p){return clamp(P.kindness+(p?((p.kind-0.5)*0.5):0),0,1)*S.sizeErode}
function greedOf(h){if(!h.members.length)return 0;const a=h.members.filter(p=>p.age>=16);const g=a.length?a.reduce((s,p)=>s+p.greed,0)/a.length:0.5;return P.greed?g*(1-0.6*P.kindness):0.05}
function kindOf(h){const a=h.members.filter(p=>p.age>=16);return a.length?a.reduce((s,p)=>s+kEff(p),0)/a.length:P.kindness}
function evMult(w,job){if(!w.event)return 1;const e=w.event;
  if(e==='bumper')return 1.4;if(e==='drought')return job==='orchardist'||job==='herder'||job==='herbalist'?0.45:1;
  if(e==='storm')return job==='fisher'?0.1:job==='salter'?0.2:0.85;if(e==='fire')return job==='woodcutter'?0.3:job==='hunter'?0.5:1;
  if(e==='collapse')return job==='miner'?0.25:1;if(e==='plague')return 0.8;return 1}

// ---------- targets: what a household wants to have at home ----------
function targets(h,greedy){
  const n=h.members.length,wk=S.t%52,se=season(S.t),gx=greedy?1+1.6*greedOf(h):1;
  let cover=6;if(wk>=30&&wk<39)cover=10;if(se===3)cover=8;
  let res=cover;if(h.world.id==='farm'){const d=(26-wk+52)%52;res=Math.max(cover,Math.min(44,d+3))}
  const winterLeft=se===3?52-wk:(wk>=30?13:0);
  const heat=S.harsh?18:12;
  const sickDoses=h.members.reduce((a,p)=>a+(p.sick?ILL[p.sick.type].dose:0),0);
  const ws=workers(h).length;
  const t={foodK:hhKcal(h)*res*gx,wood:n*(3*cover+heat*Math.min(winterLeft,10))*gx,salt:n*0.08*10*gx,med:Math.ceil((1+n*0.25+sickDoses)*gx),
    tool:ws*1.0*gx,cloth:h.members.reduce((a,p)=>a+Math.max(0,0.85-p.clothes)*4,0)*gx+(wk>=30&&wk<39?n*0.3:0),pot:Math.ceil(n*0.6*gx),herb:0.5};
  if(h.world.id==='forest'||h.world.id==='fish')t.salt+=n*1.5;
  if(h.members.some(p=>p.job==='weaver'))t.wool=h.members.filter(p=>p.job==='weaver').length*12;
  if(h.members.some(p=>p.job==='potter'))t.wood+=h.members.filter(p=>p.job==='potter').length*20*4;
  return t;
}
function needs(h,t){const inv=h.inv,o={};
  o.food=Math.max(0,t.foodK-kcalOf(inv));
  ['wood','salt','med','cloth','pot','wool'].forEach(g=>{if(t[g]!=null){const q=t[g]-(inv[g]||0);if(q>0.01)o[g]=g==='med'||g==='pot'?Math.ceil(q):q}});
  if(h.toolDur<t.tool*0.7){o.tool=Math.max(1,Math.round(t.tool-h.toolDur))}
  return o}
function surplus(h,t){const inv=h.inv,o={};
  let keep=t.foodK;for(const g of BY_STORE){const have=inv[g]||0;if(!have)continue;const k=Math.min(have,keep/G[g].kcal);keep-=k*G[g].kcal;if(have-k>0.05)o[g]=have-k}
  for(const g of GK){if(G[g].food||g==='tool')continue;const have=inv[g]||0,tg=t[g]||0;if(have-tg>0.05&&(g!=='med'))o[g]=have-tg}
  return o}

// things that hurt soon if missing: two weeks of food and firewood, medicine for the sick, a broken tool
function urgent(h){const n=h.members.length,se=season(S.t),o={};const k=hhKcal(h)*2-kcalOf(h.inv);if(k>0)o.food=k;
  const wd=n*(3+(se===3?12:0))*2-(h.inv.wood||0);if(wd>0)o.wood=wd;const sd=h.members.reduce((a,p)=>a+(p.sick?ILL[p.sick.type].dose:0),0)-(h.inv.med||0);if(sd>0)o.med=sd;
  const ws=workers(h).length;if(ws&&h.toolDur<ws*0.25)o.tool=1;if(h.members.some(p=>p.clothes<0.35)&&(h.inv.cloth||0)<1)o.cloth=2;return o}
const wt=(g,q)=>g==='food'?q/15400*3:g==='med'?q*2:g==='tool'?q*2:g==='wood'?q/30:q*0.5;
// ---------- events ----------
function events(se){
  S.harsh=false;
  S.worlds.forEach(w=>{if(w.evLeft>0){w.evLeft--;if(!w.evLeft){w.event=null}}});
  if(S.winterEv>0){S.winterEv--;S.harsh=true}
  if(!P.disasters)return;
  S.worlds.forEach(w=>{if(w.event||w.id==='hub')return;
    for(const e of w.ev){const ok=(e==='drought'||e==='locust')?se===1:e==='fire'?se!==3:e==='bumper'?se===2:true;
      const p={drought:0.012,locust:0.006,fire:0.004,storm:0.006,collapse:0.004,bumper:0.004}[e];if(ok&&R()<p){trigger(w,e);break}}
    if(!w.event&&R()<0.0018)trigger(w,'plague')});
  if(se===3&&S.t%52===39&&R()<0.25){S.winterEv=13;S.harsh=true;news('bad','今年冬天特别冷，每家都要烧更多的柴。')}
}
function trigger(w,e,quiet){w.event=e;w.evLeft={drought:8,locust:1,fire:3,storm:2,collapse:3,plague:10,bumper:8,winter:13}[e]||3;
  if(e==='fire'){S.res.forest*=0.85;S.res.game*=0.85}
  if(e==='locust')w.hhs.forEach(h=>h.crop*=0.6);
  if(e==='collapse'){const ms=w.hhs.flatMap(h=>h.members.filter(p=>p.job==='miner'&&!p.sick));for(let i=0;i<Math.min(3,ms.length);i++){const p=ms[R()*ms.length|0];if(!p.sick){p.sick={type:'inj',wk:4};logP(p,'矿井塌方，受了伤')}}}
  if(e==='plague'){const ps=w.hhs.flatMap(h=>h.members);for(let i=0;i<3&&ps.length;i++){const p=ps[R()*ps.length|0];p.sick={type:'plague',wk:4};logP(p,'染上了瘟疫')}}
  if(e==='winter'){S.winterEv=13}
  if(!quiet)news(e==='bumper'?'good':'bad',`${w.name}：${EVN[e]}！`,w)}

// ---------- one week ----------
function step(){
  S.t++;const t=S.t,se=season(t),wk=t%52,mode=P.mode;
  const pop=S.people.length;S.sizeErode=Math.min(1,Math.pow(380/Math.max(pop,1),0.5));
  if(wk===0){S.yr={births:0,deaths:0}}
  events(se);
  // nature grows back slowly
  const rs=S.res;rs.fish+=0.035*rs.fish*(1-rs.fish);rs.game+=0.025*rs.game*(1-rs.game);rs.forest+=0.004*rs.forest*(1-rs.forest)+0.0004;
  illness(se);
  work(se,wk);
  craftAndPreserve();
  hubWorkshop();
  share();
  S.wk={need:0,got:0,unmet:{},barterTry:0,barterFail:0,queue:0,traded:new Set()};
  const snap=new Map(S.hhs.map(h=>[h,{...h.inv,_m:h.money,_t:h.toolDur}]));
  market(mode);
  S.worlds.forEach(w=>{w.flowIn={};w.flowOut={};w.moneyIn=0});
  S.hhs.forEach(h=>{const a=snap.get(h);if(!a)return;const w=h.world;for(const g of GK){const d=(h.inv[g]||0)-(a[g]||0);if(d>0.01)add(w.flowIn,g,d);else if(d<-0.01)add(w.flowOut,g,-d)}
    const dt=h.toolDur-a._t;if(dt>0.5)add(w.flowIn,'tool',dt);w.moneyIn+=h.money-a._m});
  consume(se,wk);
  health();
  family();
  spoil();
  money(wk);
  if(wk%4===0){flee();migrate();recruit()}
  record();
}

function illness(se){
  const plagueW=new Set(S.worlds.filter(w=>w.hhs.some(h=>h.members.some(p=>p.sick&&p.sick.type==='plague'))).map(w=>w.id));
  S.worlds.forEach(w=>{const ps=w.hhs.flatMap(h=>h.members);const inf=ps.filter(p=>p.sick&&p.sick.type==='plague').length,frac=ps.length?inf/ps.length:0;
    ps.forEach(p=>{if(p.sick)return;let r=R();
      const cold=0.006+(se===3?0.012:0)+(p.clothes<0.4?0.008:0)+(S.harsh?0.008:0);
      const dys=0.0015+(se===1?0.003:0)+(p.kcov<0.7?0.004:0);
      const inj=p.job&&JOB[p.job].risk||0.0008;
      const pl=p.immune?0:frac*0.35;
      if(r<pl){p.sick={type:'plague',wk:4};logP(p,'被传染了瘟疫')}
      else if((r-=pl)<dys){p.sick={type:'dys',wk:3};logP(p,'得了痢疾')}
      else if((r-=dys)<inj){p.sick={type:'inj',wk:4};logP(p,'干活时受了伤')}
      else if((r-=inj)<cold){p.sick={type:'cold',wk:2}}})});
  S.plagueW=plagueW;
}

function work(se,wk){
  const land={};S.worlds.forEach(w=>{if(!w.land)return;for(const j in w.land){const n=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job===j&&!p.sick&&p.age>=16).length,0);land[w.id+j]=n>w.land[j]?Math.pow(w.land[j]/n,0.6):1}});
  const resF={fish:clamp(S.res.fish/0.7,0,1.25),game:clamp(S.res.game/0.7,0,1.25),forest:clamp(S.res.forest/0.7,0,1.2)};
  const take={fish:0,game:0,forest:0};S.forF={};S.forN=S.forN||{};S.worlds.forEach(w=>{const n=S.forN[w.id]||0;S.forF[w.id]=n>12?Math.pow(12/n,0.7):1});S.forN={};
  S.worlds.forEach(w=>w.made={});
  S.hhs.forEach(h=>{const w=h.world;const ws=workers(h);const toolF=0.55+0.45*clamp(h.toolDur/Math.max(1,ws.length*0.5),0,1);
    let farmLab=0;const forage=(h.foodWeeks!=null&&h.foodWeeks<1&&h.members.some(p=>p.kcov<0.9))?0.5:0;
    h.members.forEach(p=>{p.hours=0;p.effort=0;if(!p.job||p.job==='artist')return;
      let lab=p.age<16?0:p.age<18?0.7:p.age<65?1:p.age<72?0.5:0;if(p.sick)lab=0;lab*=clamp(0.3+0.7*p.health/0.8,0,1);if(lab<=0)return;
      let m=0.92+0.08*p.dil;
      if(P.freeRide){if(P.mode==='free')m=0.35+0.65*(0.5*p.dil+0.5*kEff(p));else if(P.mode==='labor')m=0.45+0.55*p.dil;else m=0.85+0.15*p.dil;
        if(P.reputation&&(P.mode==='free'||P.mode==='labor'))m+=(1-m)*0.55}
      if(h.foodWeeks!=null&&h.foodWeeks<2)m=Math.max(m,0.88); // an empty pantry makes everyone work hard again
      if(S.famine>0.1)m+=(1-m)*Math.min(0.8,S.famine*2); // when people around you go hungry, slacking stops
      if(P.mode==='money'&&S.inflM>0.04)m*=1-Math.min(0.3,S.inflM*1.5); // prices racing up: people rush to spend instead of working
      if(P.freedom)m*=1.05;
      let eff=lab*m*p.skill*(1-h.distPen);p.effort=m;
      if(forage&&w.id!=='hub'){S.forN[w.id]=(S.forN[w.id]||0)+1;add(h.inv,'forage',22*lab*forage*(se===3?0.3:se===0?0.8:1.1)*(S.forF[w.id]||1));eff*=1-forage;p.forage=true}else p.forage=false;
      p.hours=40*lab*(P.freeRide&&P.mode==='labor'&&!P.reputation?1:m);
      const j=JOB[p.job],ev=evMult(w,p.job);
      if(p.job==='farmer'){farmLab+=eff;return}
      if(p.job==='potter'){const n=5*eff*toolF*ev,wd=Math.min(h.inv.wood||0,n*4);const pq=n*(0.3+0.7*(n>0?wd/(n*4):0));add(h.inv,'pot',pq);add(w.made,'pot',pq);h.inv.wood=(h.inv.wood||0)-wd;h.toolDur=Math.max(0,h.toolDur-0.02*lab);return}
      if(p.job==='weaver'){const n=Math.min(3*eff*toolF*ev,h.inv.wool||0);add(h.inv,'cloth',n);add(w.made,'cloth',n);h.inv.wool=(h.inv.wool||0)-n;h.toolDur=Math.max(0,h.toolDur-0.02*lab);return}
      if(!j.out)return;
      const lf=w.land&&w.land[p.job]?land[w.id+p.job]:1;
      for(const g in j.out){let q=j.out[g][se]*eff*toolF*ev*lf;if(j.res){q*=resF[j.res];take[j.res]+=q}add(h.inv,g,q);add(w.made,g,q)}
      h.toolDur=Math.max(0,h.toolDur-0.02*lab)});
    if(w.id==='farm'){
      const lf=land['farmfarmer']||1;
      if(wk<26){let g=farmLab*toolF*lf;if(w.event==='drought'){g*=0.4;h.crop*=0.985}if(w.event==='bumper')g*=1.3;h.crop+=g}
      else if(wk<39){if(wk===26){h.cropTotal=h.crop;h.crop=0}const want=h.cropTotal/13*50,can=clamp(farmLab/Math.max(0.5,workers(h).length*0.7),0,1);
        const got=want*can*(w.event==='bumper'?1.25:1);add(h.inv,'rice',got);add(w.made,'rice',got);if(can<0.6&&want>5)S.cnt.lostHarvest=(S.cnt.lostHarvest||0)+want-got}
    }
  });
  S.res.fish=Math.max(0.02,S.res.fish-take.fish/180000);S.res.game=Math.max(0.02,S.res.game-take.game/26000);S.res.forest=Math.max(0.05,S.res.forest-take.forest/4000000);
}

function craftAndPreserve(){
  S.hhs.forEach(h=>{const inv=h.inv,kw=hhKcal(h);
    // sheep milk beyond this week turns into cheese, fresh fish and meat get salted if there is salt
    const milkKeep=kw*0.25/650;if((inv.milk||0)>milkKeep){const m=inv.milk-milkKeep;inv.milk=milkKeep;add(inv,'cheese',m/8)}
    for(const[f,s]of[['fish','sfish'],['meat','smeat']]){const keep=kw*0.3/G[f].kcal,ex=(inv[f]||0)-keep;if(ex>0){const q=Math.min(ex,(inv.salt||0)/0.15);if(q>0){inv[f]-=q;inv.salt-=q*0.15;add(inv,s,q*0.6)}}}
  })}

function hubWorkshop(){
  const H=S.hub.inv,staff=S.hubW.hhs.flatMap(h=>h.members);
  const cnt=j=>staff.filter(p=>p.job===j&&!p.sick&&p.age>=16&&p.age<72).reduce((a,p)=>a+clamp(p.health/0.8,0.3,1),0);
  const tq=Math.max(0,Math.min(cnt('smith')*2.5,(H.ore||0)/10,(H.wood||0)/15,40-(H.tool||0)));H.ore-=tq*10;H.wood-=tq*15;add(H,'tool',tq);
  const mq=Math.max(0,Math.min(cnt('pharm')*40,(H.herb||0)/0.4,Math.max(60,S.people.length*0.25)-(H.med||0)));H.herb-=mq*0.4;add(H,'med',mq);
  S.hub.made={tool:tq,med:mq};S.hubUse=S.hubUse||{ore:40,wood:60,herb:4};const use={ore:tq*10,wood:tq*15,herb:mq*0.4};for(const g in use)S.hubUse[g]=S.hubUse[g]*0.9+0.1*Math.max(use[g],g==='ore'?35:g==='herb'?4:0);S.hub.cap=cnt('clerk')*30;
  if(P.corruption){['med','tool','cheese','smeat','cloth'].forEach(g=>{const l=(H[g]||0)*0.06;H[g]-=l;S.cnt.leak+=l*G[g].v})}
}

function share(){
  const rate=P.share?0.6:0.25;
  const wk=h=>kcalOf(h.inv)/Math.max(1,hhKcal(h));
  const give=(d,r,k)=>{const moved=takeFood(d.inv,k,BY_FRESH,r.inv);return moved};
  S.worlds.forEach(w=>{const hs=w.hhs.filter(h=>h.members.length);const donors=hs.filter(h=>wk(h)>8),needy=hs.filter(h=>wk(h)<1);
    needy.forEach(r=>{const want=hhKcal(r)*1.5-kcalOf(r.inv);for(const d of donors){if(want<=0)break;const ex=(wk(d)-8)*hhKcal(d)*rate*kindOf(d);if(ex>0)give(d,r,Math.min(ex,want))}})});
  // with money, neighbours help hungry families pay for food
  if(P.mode==='money')S.worlds.forEach(w=>{const cost=h=>hhKcal(h)/15400*45*S.moneyFactor;const poor=w.hhs.filter(h=>h.members.length&&kcalOf(h.inv)<hhKcal(h)*1.5&&h.money<cost(h)*2);
    if(!poor.length)return;const rich=w.hhs.filter(h=>h.money>cost(h)*10);
    poor.forEach(r=>{for(const d of rich){const g=Math.min((d.money-cost(d)*10)*rate*kindOf(d),cost(r)*3-r.money);if(g>0){d.money-=g;r.money+=g;break}}})});
  if(P.share){S.worlds.forEach(w=>{if(w.id==='hub')return;const nb=S.worlds.filter(o=>o.id!=='hub'&&Math.abs(o.r-w.r)+Math.abs(o.c-w.c)===1);
    const needy=w.hhs.filter(h=>wk(h)<0.7);if(!needy.length)return;
    nb.forEach(o=>{const donors=o.hhs.filter(h=>wk(h)>10);needy.forEach(r=>{for(const d of donors){const ex=(wk(d)-10)*hhKcal(d)*0.3*kindOf(d);if(ex>0){give(d,r,Math.min(ex,hhKcal(r)));break}}})})})}
}

// ---------- market at the supply hub ----------
function order(){const hs=S.hhs.filter(h=>h.members.length&&h.world.id!=='hub');
  const edge=hs.filter(h=>h.world.r===1||h.world.c===1),corner=hs.filter(h=>!(h.world.r===1||h.world.c===1));
  const sh=a=>{for(let i=a.length-1;i>0;i--){const j=R()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
  return P.distance?[...sh(edge),...sh(corner)]:sh([...edge,...corner])}
function staffSupply(){ // hub staff live from the warehouse (they get their share first)
  if(P.mode==='money')return;const H=S.hub.inv,k=P.corruption?1.6:1;
  S.hubW.hhs.forEach(h=>{const t=targets(h,false);t.foodK=hhKcal(h)*3*k;const nd=needs(h,t);
    if(nd.food)takeFood(H,nd.food,['rice','cheese','sfish','smeat','apple','fish','meat','milk'],h.inv);
    ['wood','salt','cloth','pot','med'].forEach(g=>{if(nd[g]){const q=Math.min(H[g]||0,nd[g]*k);H[g]-=q;add(h.inv,g,q)}})})}
function market(mode){
  const H=S.hub.inv;staffSupply();
  const hs=order(),urg=h=>h.members.reduce((a,p)=>a+(p.sick?2:0)+(p.kcov<0.8?2:0),0);
  let cap=S.hub.cap,served=0;
  const plan=hs.map(h=>{const tg=targets(h,true),tn=targets(h,false);return{h,tg,tn,need:needs(h,tg),real:needs(h,tn),urgent:urgent(h),sur:surplus(h,tg)}});
  // contagion travels with the people who come to the market
  if(P.contagion&&S.plagueW.size){const vis=hs.length,sickV=hs.filter(h=>S.plagueW.has(h.world.id)).length;const p=0.03*sickV/Math.max(1,vis);
    hs.forEach(h=>{if(R()<p){const q=h.members[R()*h.members.length|0];if(q&&!q.sick){q.sick={type:'plague',wk:4};logP(q,'在集市上被传染了瘟疫');if(!h.world.event){h.world.event='plague';h.world.evLeft=10;news('bad',`瘟疫从集市传到了${h.world.name}。`,h.world)}}}})}
  plan.forEach(x=>{const r=x.urgent;x.left={...r};S.wk.need+=Object.keys(r).reduce((a,g)=>a+wt(g,r[g]),0)});
  const gotV=(x,g,q)=>{if(q<=0)return;S.wk.traded.add(x.h);if(!x.left||!x.left[g])return;const u=Math.min(q,x.left[g]);x.left[g]-=u;S.wk.got+=wt(g,u)};
  const unmet=(x,g,q)=>{if(x.left&&x.left[g]>0.01)add(S.wk.unmet,g,x.left[g])};
  const foodPref=h=>{const mine=new Set(Object.keys(JOB).filter(j=>h.members.some(p=>p.job===j)).flatMap(j=>JOB[j].out?Object.keys(JOB[j].out):[]));
    return [...BY_FRESH].sort((a,b)=>(mine.has(a)?1:0)-(mine.has(b)?1:0))};
  const seen=new Set();const pace=(x)=>{const k=x&&x.h?x.h.id:0;if(seen.has(k))return !blocked.has(k);seen.add(k);served++;if(served>cap){S.wk.queue++;blocked.add(k);return false}return true};const blocked=new Set();
  const pace2=pace;

  if(mode==='free'||mode==='labor'){
    // 1 hand in what is left over
    plan.forEach(x=>{const kd=kindOf(x.h),gr=greedOf(x.h);
      for(const g in x.sur){let f=mode==='labor'?1-0.4*gr:(P.greed?clamp(0.2+0.8*kd-0.3*gr,0.05,1):0.95);if(G[g].food)f+=(1-f)*Math.min(1,(S.famine||0)*3)*kd;
        const q=x.sur[g]*f;x.h.inv[g]-=q;add(H,g,q);S.wk.traded.add(x.h)}});
    // 2 take what you need, in the order people arrive (or by urgency, if the hub decides)
    let list=plan;if(P.needFirst)list=[...plan].sort((a,b)=>urg(b.h)-urg(a.h));
    const price=g=>mode==='labor'?(P.priceCap?G[g].v:S.prices[g])/5:0;
    list.forEach(x=>{const want=P.needFirst?x.real:x.need;
      if(want.food>0){if(!pace(x)){unmet(x,'food',want.food);return}
        let k=want.food;if(mode==='labor'){const per=price('rice')/3500;k=Math.min(k,x.h.credits/Math.max(per,1e-6))}
        const got=takeFood(H,k,foodPref(x.h),x.h.inv);if(mode==='labor')x.h.credits-=got*price('rice')/3500;gotV(x,'food',got);unmet(x,'food',want.food-got)}
      ['med','tool','wood','salt','cloth','wool','pot'].forEach(g=>{let q=want[g];if(!q)return;if(!pace(x)){unmet(x,g,q);return}
        if(mode==='labor')q=Math.min(q,x.h.credits/Math.max(price(g),1e-6));
        let got=Math.min(H[g]||0,q);if(g==='tool'||g==='pot')got=Math.floor(got);if(got<=0){unmet(x,g,want[g]);return}
        H[g]-=got;if(g==='tool')x.h.toolDur+=got;else add(x.h.inv,g,got);if(mode==='labor')x.h.credits-=got*price(g);gotV(x,g,got);unmet(x,g,want[g]-got)})});
    if(mode==='labor'){S.hhs.forEach(h=>h.credits+=h.members.reduce((a,p)=>a+p.hours,0))}
  }
  else if(mode==='barter')barter(plan,H,gotV,unmet,pace);
  else buySell(plan,H,gotV,unmet,pace,foodPref);
  // a long walk to the hub costs work time next week
  S.hhs.forEach(h=>{h.distPen=P.distance&&S.wk.traded.has(h)?((h.world.r===1||h.world.c===1)?1/24:1/10):0});
}

function capOf(g){if(g==='rice')return Math.max(45*(S.demand.rice||0),S.people.length*4.4*0.6*30);return Math.max((G[g].food&&G[g].rot<0.012?30:8)*((S.demand[g]||0)+(S.hubUse&&S.hubUse[g]||0)),g==='ore'?60:g==='herb'?10:g==='wood'?800:0)}
function barter(plan,H,gotV,unmet,pace){
  const val=g=>G[g].v*S.sc[g];
  const parts=plan.map(x=>({x,h:x.h,haves:{...x.sur},wants:{...x.need},foodK:x.need.food||0}));parts.forEach(p=>delete p.wants.food);
  const give=(from,to,g,q)=>{from.h.inv[g]-=q;if(g==='tool')to.h.toolDur+=q;else add(to.h.inv,g,q);from.haves[g]-=q};
  const wantsOf=(b,g)=>G[g].food?(b.foodK>0?b.foodK/G[g].kcal:0):(b.wants[g]||0);
  const reduceWant=(b,g,q)=>{if(G[g].food)b.foodK-=q*G[g].kcal;else b.wants[g]-=q};
  const dem={};
  // 1 people swap directly: only works if each one wants what the other has
  const peer=(a,g,qWant)=>{let got=0;
    for(const b of parts){if(b===a||got>=qWant-1e-6)continue;const bh=b.haves[g]||0;if(bh<=1e-6)continue;
      for(const h2 in a.haves){if(got>=qWant-1e-6)break;const ah=a.haves[h2]||0;if(ah<=1e-6||h2===g)continue;const bw=wantsOf(b,h2);if(bw<=1e-6)continue;
        let q=Math.min(qWant-got,bh,ah*val(h2)/val(g),bw*val(h2)/val(g));if(g==='tool'){q=Math.floor(q+1e-9);if(q<1)continue}if(q<=1e-6)continue;
        const back=q*val(g)/val(h2);give(b,a,g,q);give(a,b,h2,back);reduceWant(b,h2,back);got+=q}}
    return got};
  // 2 then the hub trading post: it swaps anything it has for things it can pass on later, until its shelves are full
  const post=(a,g,qWant)=>{let got=0;const avail=Math.max(0,(H[g]||0)-(g==='med'?8:0));if(avail<=1e-6)return 0;
    for(const h2 in a.haves){if(got>=qWant-1e-6)break;const ah=a.haves[h2]||0;if(ah<=1e-6||h2===g)continue;const room=capOf(h2)*2-(H[h2]||0);if(room<=0)continue;
      let q=Math.min(qWant-got,avail-got,ah*val(h2)/val(g),room*val(h2)/val(g));if(g==='tool'){q=Math.floor(q+1e-9);if(q<1)continue}if(q<=1e-6)continue;
      const back=q*val(g)/val(h2);H[g]-=q;if(g==='tool')a.h.toolDur+=q;else add(a.h.inv,g,q);a.h.inv[h2]-=back;a.haves[h2]-=back;add(H,h2,back);got+=q}
    return got};
  const tryGet=(a,g,q)=>{let got=peer(a,g,q);if(got<q-1e-6)got+=post(a,g,q-got);return got};
  parts.forEach(a=>{
    const ask=Object.entries(a.wants).filter(([,q])=>q>0);if(a.foodK>0)ask.unshift(['food',a.foodK]);
    ask.forEach(([g,q])=>{if(!pace(a.x)){unmet(a.x,g,q);return}S.wk.barterTry++;add(dem,g,q);
      let got=0;
      if(g==='food'){for(const f of BY_STORE){if(got>=q)break;const k=tryGet(a,f,(q-got)/G[f].kcal);got+=k*G[f].kcal}}
      else got=tryGet(a,g,q);
      if(got<q*0.5){S.wk.barterFail++;add(S.bf=S.bf||{},g,1)}gotV(a.x,g,got);unmet(a.x,g,q-got)})});
  // what is hard to get is worth more next time
  GK.forEach(g=>{const u=S.wk.unmet[g]||0;S.sc[g]=clamp(S.sc[g]*(u>(H[g]||0)?1.03:0.99),0.5,3)});
  smoothDemand(dem);
}
function smoothDemand(dem){GK.forEach(g=>{const d=g==='food'?0:(dem[g]||0);S.demand[g]=(S.demand[g]||0)*0.9+d*0.1});
  if(dem.food){const k=dem.food;BY_STORE.forEach(f=>S.demand[f]=(S.demand[f]||0)*0.9+0.1*k/G[f].kcal/4)}}
function buySell(plan,H,gotV,unmet,pace,foodPref){
  const p=S.prices,trust=S.trust,dem={},short={};
  // the hub pays wages first, then buys what people bring with the money it has; it cannot pay with money it does not have
  // when its cash runs low the hub prints what it needs to keep paying and buying (that also makes money worth less)
  const floor=12000*Math.sqrt(S.moneyFactor);if(S.hub.cash<floor){const nm=floor-S.hub.cash;S.hub.cash+=nm;S.printed+=nm;S.deficitPrint=(S.deficitPrint||0)+nm}
  S.hubW.hhs.forEach(h=>{const w=Math.min(Math.max(0,S.hub.cash),workers(h).length*150*S.moneyFactor);h.money+=w;S.hub.cash-=w});
  S.inflow={};const bidF=clamp(0.6+0.35*Math.max(0,S.hub.cash)/(30000*S.moneyFactor),0.6,0.97);
  plan.forEach(x=>{const gr=greedOf(x.h);const hold=P.greed&&S.inflM>0.03?0.5*gr:0;
    for(const g in x.sur){const room=capOf(g)-(H[g]||0);if(room<=0)continue;const bid=p[g]*bidF;
      const q=Math.min(room,x.sur[g]*trust*(1-hold),Math.max(0,S.hub.cash)/bid);if(q<=1e-6)continue;
      x.h.inv[g]-=q;add(H,g,q);add(S.inflow,g,q);x.h.money+=q*bid;S.hub.cash-=q*bid;S.wk.traded.add(x.h)}});
  const pay=(x,g,q,pr)=>{H[g]-=q;if(g==='tool')x.h.toolDur+=q;else add(x.h.inv,g,q);x.h.money-=q*pr;S.hub.cash+=q*pr};
  // the shop lets families buy what they need on credit (赊账), up to about eight weeks of food
  const credit=x=>hhKcal(x.h)/15400*45*S.moneyFactor*8;
  const buy=(x,g,q)=>{const pr=p[g];let can=Math.min(q,Math.max(0,x.h.money+(g==='med'||g==='wood'?credit(x):0))/pr);if(g==='tool'||g==='pot')can=Math.floor(can);add(dem,g,can);
    const got=Math.min(can,H[g]||0);if(can-got>0.01)add(short,g,can-got);if(got<=0){unmet(x,g,q);return 0}pay(x,g,got,pr);gotV(x,g,got);unmet(x,g,q-got);return got};
  const staffPlan=S.hubW.hhs.map(h=>{const tg=targets(h,true);return{h,tg,need:needs(h,tg),urgent:{},sur:{}}});
  [...staffPlan,...plan].forEach(x=>{
    ['med','food','wood','salt','tool','cloth','wool','pot'].forEach(g=>{const q=x.need[g];if(!q)return;if(x.h.world.id!=='hub'&&!pace(x)){unmet(x,g,q);return}
      if(g==='food'){let left=q;const fl=foodPref(x.h).sort((a,b)=>p[a]/G[a].kcal-p[b]/G[b].kcal);
        for(const f of fl){if(left<=0)break;const pr=p[f],k=Math.min(left/G[f].kcal,Math.max(0,x.h.money+(left>hhKcal(x.h)*2?0:credit(x)))/pr);if(k<=0)break;const got=Math.min(k,H[f]||0);add(dem,f,got);
          if(got<=0){add(short,f,k);continue}pay(x,f,got,pr);left-=got*G[f].kcal}
        gotV(x,'food',q-left);unmet(x,'food',left);return}
      buy(x,g,q)});
    // spare money buys nicer things: more money in pockets means more people chasing the same apples
    const reserve=hhKcal(x.h)/15400*45*S.moneyFactor*16,spare=x.h.money-reserve;
    if(spare>0){const gr=greedOf(x.h);const budget=spare*(P.greed?0.3+0.5*gr:0.25);const lux=['apple','cheese','smeat','pot','cloth','sfish','rice','salt'].filter(g=>(H[g]||0)>0.5||g==='apple'||g==='cheese');
      lux.forEach(g=>{const pr=p[g],q=budget/lux.length/pr;add(dem,g,q);const got=Math.min(q,H[g]||0);if(q-got>0.01)add(short,g,q-got);if(got>0)pay(x,g,got,pr)})}
  });
  smoothDemand(dem);
  // prices aim at: base value x (how much money there is, compared with the start) x (how scarce the thing is)
  S.supply=S.supply||{};GK.forEach(g=>{S.supply[g]=(S.supply[g]||S.demand[g]||1)*0.85+0.15*((H[g]||0)/4+(S.inflow&&S.inflow[g]||0))});
  const mf=S.moneyFactor;
  GK.forEach(g=>{const d=Math.max(0.1,S.demand[g]+(S.hubUse&&S.hubUse[g]||0)+(short[g]||0)),sp=Math.max(0.1,S.supply[g]);const sc=clamp(Math.pow(d/sp,0.5),0.5,3);
    let tgt=G[g].v*mf*sc;p[g]+=(tgt-p[g])*0.2;if(P.priceCap)p[g]=Math.min(p[g],G[g].v)});
}

// ---------- living ----------
function consume(se,wk){
  const over=P.mode==='free'&&P.greed;
  S.hhs.forEach(h=>{if(!h.members.length)return;const inv=h.inv,n=h.members.length;
    const K=hhKcal(h),greedy=over?1+0.35*greedOf(h)*(1-kindOf(h)):1;
    const before={};FOOD.forEach(g=>before[g]=inv[g]||0);
    const ate=takeFood(inv,K*greedy,BY_FRESH,null);S.cnt.overK+=Math.max(0,ate-K);
    const cov=Math.min(1,ate/K);let kinds=0,prot=0;FOOD.forEach(g=>{const e=(before[g]-(inv[g]||0))*G[g].kcal;if(e>ate*0.08)kinds++;if(G[g].prot)prot+=e});
    const heat=se===3?(S.harsh?18:12):(wk>=34&&wk<39?3:0),woodNeed=n*(3+heat),wood=Math.min(inv.wood||0,woodNeed);inv.wood=(inv.wood||0)-wood;const woodCov=woodNeed?wood/woodNeed:1;
    const saltNeed=n*0.08,salt=Math.min(inv.salt||0,saltNeed);inv.salt=(inv.salt||0)-salt;
    const pots=inv.pot||0;
    h.members.forEach(p=>{p.kcov=p.age<14?Math.min(1,cov*1.1):cov;p.variety=kinds;p.prot=ate?prot/ate:0;
      p.clothes=Math.max(0,p.clothes-(se===3?0.02:0.011));if(p.clothes<0.75&&(inv.cloth||0)>=0.5){const c=Math.min(inv.cloth,2);inv.cloth-=c;p.clothes=Math.min(1,p.clothes+c*0.25)}
      p.warm=se===3?woodCov*(0.45+0.55*Math.min(1,p.clothes/0.6)):(heat?0.5+0.5*woodCov:1);p.saltOk=saltNeed?salt/saltNeed:1;p.comfort=Math.min(1,pots/(n*0.6))});
    h.foodWeeks=kcalOf(inv)/K;
  })}

function health(){
  const dead=[];
  S.people.forEach(p=>{const h=p.hh,inv=h.inv;
    let tgt=1-(1-p.kcov)*0.95-(p.variety<2?0.05:0)-(p.prot<0.08?0.05:0)-(1-p.warm)*0.4-(p.saltOk<0.5?0.05:0)-(p.age>65?(p.age-65)*0.012:0);
    let die=0.000008*Math.exp(0.09*p.age)+(p.age<1?0.0015:0);
    if(p.sick){const il=ILL[p.sick.type];tgt-=il.sev;let risk=il.die*(p.age<5||p.age>65?2.5:1);
      if(!p.sick.treated){if((inv.med||0)>=il.dose){inv.med-=il.dose;p.sick.treated=true;p.sick.wk=Math.max(1,p.sick.wk-1)}
        else if((inv.herb||0)>=0.3&&!p.sick.herbal){inv.herb-=0.3;p.sick.herbal=true}}
      if(p.sick.treated)risk*=0.1;else if(p.sick.herbal)risk*=0.55;else if(il.dose>1&&!p.sick.noted){p.sick.noted=1;logP(p,`${il.n}，可是家里没有药`)}
      die+=risk;p.sick.wk--;if(p.sick.wk<=0){if(p.sick.type==='plague')p.immune=true;if(p.sick.type!=='cold')logP(p,`${il.n}好了`);p.sick=null}}
    if(p.health<0.35)die+=(0.35-p.health)*0.2;
    if(p.kcov<0.5)die+=(0.5-p.kcov)*0.04;
    p.health+=(clamp(tgt,0.02,1)-p.health)*0.25;
    if(R()<die)dead.push(p)});
  dead.forEach(p=>{const cause=p.sick?ILL[p.sick.type].n+(p.sick.treated?'':'（没有药）'):p.kcov<0.6?'饥饿':p.warm<0.5?'寒冷':p.age>60?'年老':'体弱';
    die(p,cause)});
}
function die(p,cause){p.alive=false;const h=p.hh;h.members=h.members.filter(q=>q!==p);S.people=S.people.filter(q=>q!==p);S.cnt.deaths++;S.yr.deaths++;add(S.cnt.by,cause,1);
  h.members.forEach(q=>{q.grief=1;logP(q,`家人${p.name}去世了（${cause}）`)});
  if(p.age<60||/没有药|饥饿|寒冷/.test(cause))news('bad',`${p.hh.world.name}的${p.name}（${Math.floor(p.age)}岁）去世了，原因：${cause}。`,p.hh.world);
  if(p.job==='artist'||p.age>=16){}
  if(!h.members.length){const heirs=h.world.hhs.filter(x=>x!==h&&x.members.length);if(heirs.length){const x=heirs[R()*heirs.length|0];for(const g in h.inv)add(x.inv,g,h.inv[g]);x.money+=h.money;x.toolDur+=h.toolDur}
    h.world.hhs=h.world.hhs.filter(x=>x!==h);S.hhs=S.hhs.filter(x=>x!==h)}}

function family(){
  S.people.forEach(p=>{const was=Math.floor(p.age);p.age+=1/52;p.grief=Math.max(0,p.grief-0.03);
    if(Math.floor(p.age)!==was){if(was+1===16||was+1===72){assignJob(p);if(was+1===16&&p.job)logP(p,`长大了，开始当${JOB[p.job].n}`)}}});
  S.hhs.slice().forEach(h=>{const w=h.world;if(w.id==='hub')return;const m=h.members;
    const mom=m.find(p=>p.sex==='f'&&p.age>=18&&p.age<=42),dad=m.find(p=>p.sex==='m'&&p.age>=18&&p.age<=60);
    const kids=m.filter(p=>p.age<12).length;
    if(mom&&dad){const pr=0.006*clamp(mom.health,0,1)*Math.pow(mom.kcov,3)*(kids<3?1:0.35);
      if(R()<pr){const b=mkPerson(h,0,R()<0.5?'m':'f');logP(b,'出生了');logP(mom,`生了孩子${b.name}`);S.cnt.births++;S.yr.births++;
        if(S.yr.births%6===1)news('good',`${w.name}的${mom.name}家添了孩子${b.name}。`,w)}}
    // grown-up children marry and start their own household
    m.filter(p=>p.age>=20&&p.age<=32&&p!==mom&&p!==dad&&m.length>=4).forEach(p=>{if(R()<0.012){
      const mate=S.hhs.filter(x=>x.world===w&&x!==h).flatMap(x=>x.members).find(q=>q.sex!==p.sex&&q.age>=20&&q.age<=34&&q.hh.members.length>=3&&!q.hh.members.some(z=>z!==q&&z.sex!==q.sex&&z.age>=18&&z.age<=60&&Math.abs(z.age-q.age)<8));
      const nh=mkHH(w,p.hh.sur);[p,mate].filter(Boolean).forEach(q=>{q.hh.members=q.hh.members.filter(z=>z!==q);q.hh=nh;nh.members.push(q)});
      const share=0.15;for(const g in h.inv){const q=(h.inv[g]||0)*share;h.inv[g]-=q;add(nh.inv,g,q)}nh.money=h.money*share;h.money-=nh.money;nh.toolDur=Math.min(h.toolDur,1);h.toolDur-=nh.toolDur;
      if(mate)logP(p,`和${mate.name}结婚，成了新的一家`);else logP(p,'搬出来自己住了')}})});
  S.hhs=S.hhs.filter(h=>h.members.length);S.worlds.forEach(w=>w.hhs=w.hhs.filter(h=>h.members.length));
}

function spoil(){
  const lose=(inv)=>{for(const g in inv){const r=G[g]&&G[g].rot;if(!r)continue;const l=inv[g]*r;if(G[g].food)S.cnt.spoilK+=l*G[g].kcal;inv[g]-=l}};
  S.hhs.forEach(h=>lose(h.inv));lose(S.hub.inv);
  S.hhs.forEach(h=>{if((h.inv.pot||0)>0)h.inv.pot*=0.996})}

function money(wk){
  const p=S.prices,base=['rice','apple','sfish','wood','salt','cloth','med','tool'];
  const idx=base.reduce((a,g)=>a+p[g]/G[g].v,0)/base.length;S.priceIndex=P.mode==='money'?idx:1;
  S.cpiHist.push(idx);const m4=S.cpiHist.length>4?S.cpiHist[S.cpiHist.length-5]:idx;S.inflM=idx/m4-1;
  if(P.mode==='money'){
    const Mn=S.hhs.reduce((a,h)=>a+Math.max(0,h.money),0)+Math.max(0,S.hub.cash);S.M0=S.M0||Mn;
    // greedy sellers pass all the extra money on to prices; otherwise only part of it shows up
    const out=S.people.filter(p=>p.job&&p.job!=='artist'&&!p.sick).length;S.out0=S.out0||out;
    S.moneyFactor+=(Math.pow(Mn/S.M0,P.greed?1:0.6)/clamp(out/S.out0,0.5,1.5)-S.moneyFactor)*0.25;
    if(wk%4===0){const tgt=25000*S.moneyFactor;if(S.hub.cash>tgt){const d=(S.hub.cash-tgt)*0.6,n=S.people.length;S.hub.cash-=d;S.hhs.forEach(h=>h.money+=d*h.members.length/n);S.dividend=d}else S.dividend=0}
    if(wk%4===0&&P.printRate>0){const M=S.hhs.reduce((a,h)=>a+Math.max(0,h.money),0)+Math.max(0,S.hub.cash),nm=M*P.printRate,n=S.people.length;S.hhs.forEach(h=>h.money+=nm*0.6*h.members.length/n);S.hub.cash+=nm*0.4;S.printed+=nm;
      if(nm>0&&wk%12===0)news('info',`补给中心印了 ${Math.round(nm)} 块新钱，一部分发给每个人，一部分自己用来收购东西。`)}
    if(S.inflM>0.1)S.trust=Math.max(0.3,S.trust-0.06*S.inflM/0.1);else S.trust=Math.min(1,S.trust+0.01);
  }else S.trust=Math.min(1,S.trust+0.02);
  S.M=S.hhs.reduce((a,h)=>a+Math.max(0,h.money),0)+Math.max(0,S.hub.cash);
}

// families who go hungry for weeks leave for a place with food (this always happens, rule or no rule)
function flee(){const ws=S.worlds.filter(w=>w.id!=='hub');const food=w=>{const m=w.hhs.flatMap(h=>h.members);return m.length?m.reduce((a,p)=>a+p.kcov,0)/m.length:0};
  S.hhs.forEach(h=>{h.hungry=(h.hungry||0)*0.5+(h.members.reduce((a,p)=>a+p.kcov,0)/Math.max(1,h.members.length)<0.8?2:0)});
  ws.forEach(w=>{w.hhs.slice().forEach(h=>{if(h.hungry<3||R()>0.35)return;const to=ws.filter(o=>o!==w&&o.hhs.length).sort((a,b)=>food(b)-food(a))[0];if(!to||food(to)<0.9)return;
    w.hhs=w.hhs.filter(x=>x!==h);h.world=to;to.hhs.push(h);h.hungry=0;h.members.forEach(p=>{if(p.job){assignJob(p);p.skill*=0.85}logP(p,`吃不饱，全家从${w.name}逃荒到了${to.name}`)});
    S.cnt.fled=(S.cnt.fled||0)+h.members.length;news('bad',`${h.sur}家在${w.name}吃不饱，逃荒去了${to.name}。`,to)})})}
// the hub hires new staff from the villages when people leave or die
function recruit(){const w=S.hubW,n=w.hhs.reduce((a,h)=>a+h.members.length,0);if(n>=P.hubStaff)return;
  for(let i=0;i<Math.min(3,P.hubStaff-n);i++){const src=S.worlds.filter(o=>o.id!=='hub').sort((a,b)=>b.members()-a.members())[0];
    const cands=src.hhs.flatMap(h=>h.members.filter(p=>p.age>=18&&p.age<45&&!p.sick&&h.members.length>=3));if(!cands.length)return;const p=cands[R()*cands.length|0];
    const old=p.hh;old.members=old.members.filter(q=>q!==p);const h=mkHH(w,p.hh.sur);h.members.push(p);p.hh=h;assignJob(p);
    for(const g of ['rice','wood','salt'])if(old.inv[g]){const q=old.inv[g]/(old.members.length+1);old.inv[g]-=q;add(h.inv,g,q)}
    logP(p,`去补给中心当了${JOB[p.job].n}`);if(R()<0.4)news('info',`${src.name}的${p.name}去补给中心当了${JOB[p.job].n}。`,w)}}
function migrate(){
  if(!P.migrate)return;const ws=S.worlds.filter(w=>w.id!=='hub'&&w.hhs.length);const hap=w=>{const ps=w.hhs.flatMap(h=>h.members);return ps.reduce((a,p)=>a+p.happy,0)/Math.max(1,ps.length)};
  const sorted=[...ws].sort((a,b)=>hap(b)-hap(a)),best=sorted[0];
  ws.forEach(w=>{if(w===best||hap(best)-hap(w)<0.12)return;w.hhs.slice().forEach(h=>{const hp=h.members.reduce((a,p)=>a+p.happy,0)/h.members.length;
    if(hp<0.5&&R()<0.08){w.hhs=w.hhs.filter(x=>x!==h);h.world=best;best.hhs.push(h);h.members.forEach(p=>{if(p.job){assignJob(p);p.skill*=0.8}logP(p,`全家从${w.name}搬到了${best.name}`)});
      S.cnt.moved+=h.members.length;news('info',`${h.sur}家从${w.name}搬去了${best.name}。`,best)}})})}

function happiness(){
  const autonomy={free:0.85,barter:0.65,labor:0.5,money:0.65}[P.mode]+(P.freedom?0.15:0);
  const wealth=S.hhs.map(h=>({h,w:hhWealth(h)/h.members.length}));const gini=giniOf(S.hhs.flatMap(h=>h.members.map(()=>hhWealth(h)/h.members.length)));S.gini=gini;
  S.people.forEach(p=>{let x=0.28*p.kcov+0.16*p.health+0.08*Math.min(1,p.variety/3)+0.1*p.warm+0.07*(p.comfort||0)+0.1*Math.min(1,autonomy)+0.09*(1-gini)+0.08*Math.min(1,(p.hh.foodWeeks||0)/6)+0.04;
    if(p.job==='artist')x+=0.08;if(P.mode==='money'&&S.inflM>0.04)x-=Math.min(0.2,S.inflM*1.2);if(p.sick)x-=0.1;x-=p.grief*0.25;
    if(P.mode==='free'&&P.freeRide&&p.effort>0.85)x-=0.05; // the hard workers resent the lazy ones
    p.happy+=(clamp(x,0,1)-p.happy)*0.3})}
function hhWealth(h){let v=0;for(const g in h.inv)v+=(h.inv[g]||0)*G[g].v;return v+h.toolDur*G.tool.v+(P.mode==='money'?Math.max(0,h.money)/Math.max(0.2,S.priceIndex):0)+(P.mode==='labor'?h.credits*5:0)}
function giniOf(a){if(a.length<2)return 0;a=[...a].sort((x,y)=>x-y);const n=a.length,s=a.reduce((x,y)=>x+y,0);if(s<=0)return 0;let c=0;a.forEach((x,i)=>c+=(2*(i+1)-n-1)*x);return c/(n*s)}

function record(){
  happiness();
  const ps=S.people,n=ps.length||1,avg=f=>ps.reduce((a,p)=>a+f(p),0)/n;
  const wstat=S.worlds.map(w=>{const m=w.hhs.flatMap(h=>h.members),k=m.length||1;
    return{id:w.id,pop:m.length,kcov:m.reduce((a,p)=>a+p.kcov,0)/k,health:m.reduce((a,p)=>a+p.health,0)/k,happy:m.reduce((a,p)=>a+p.happy,0)/k,sick:m.filter(p=>p.sick).length,hungry:m.filter(p=>p.kcov<0.8).length,cold:m.filter(p=>p.warm<0.6).length}});
  S.wstat=wstat;S.famine=ps.filter(p=>p.kcov<0.7).length/n;
  const H=S.hub.inv,staffK=Math.max(1,S.people.length*15400);
  const medNeedWk=Math.max(4,n*0.02);
  S.needAcc=(S.needAcc||0)*0.75+S.wk.need;S.gotAcc=(S.gotAcc||0)*0.75+S.wk.got;const unmet=S.needAcc>1?clamp(1-S.gotAcc/S.needAcc,0,1):0;
  S.unmetLog=S.wk.unmet;const row={t:S.t,pop:ps.length,kcov:avg(p=>p.kcov),health:avg(p=>p.health),happy:avg(p=>p.happy),minHappy:Math.min(...wstat.filter(w=>w.id!=='hub'&&w.pop).map(w=>w.happy)),
    gini:S.gini,sick:ps.filter(p=>p.sick).length,hungry:ps.filter(p=>p.kcov<0.8).length,
    apple:P.mode==='money'?S.prices.apple/5:null,rice:P.mode==='money'?S.prices.rice:null,trust:S.trust,mode:P.mode,M:S.M,
    medWk:(H.med||0)/medNeedWk,toolWk:(H.tool||0)/Math.max(1,ps.filter(p=>p.job&&p.job!=='artist').length*0.02),foodWk:kcalOf(H)/staffK,
    unmet,barterFail:S.wk.barterTry?S.wk.barterFail/S.wk.barterTry:null,queue:S.wk.queue,fish:S.res.fish,game:S.res.game,forest:S.res.forest,
    births:S.yr.births,deaths:S.yr.deaths};
  S.hist.push(row);
}

// ---------- reading the state ----------
function idealRice(){return null}
return{save,load,GK,FOOD,trigger2:(w,e)=>trigger(w,e,false),G2:null,JOB2:null,G,JOB,WORLDS,HUBW,EVN,ILL,SEASON,season,DEF,newGame,step,trigger:(w,e)=>trigger(w,e,true),get S(){return S},get P(){return P},setP(o){Object.assign(P,o);if('freedom'in o)S.people.forEach(p=>{if(p.hh.world.id==='hub')return;if(o.freedom&&p.job&&R()<0.12)p.job='artist';else if(!o.freedom&&p.job==='artist')assignJob(p)});if('hubStaff'in o)resizeHub()},capOf,targets,kcalOf,hhKcal,giniOf,when,workers};
// save the whole world as text, and bring it back (used when the page updates itself)
function save(){const wI=new Map(S.worlds.map((w,i)=>[w,i])),hI=new Map(S.hhs.map((h,i)=>[h,i]));
  const worlds=S.worlds.map(w=>{const o={};for(const k in w){if(k==='hhs'||typeof w[k]==='function')continue;o[k]=w[k]}o.hhs=w.hhs.map(h=>hI.get(h)).filter(x=>x!=null);return o});
  const hhs=S.hhs.map(h=>{const o={};for(const k in h){if(k==='world'||k==='members')continue;o[k]=h[k]}o.world=wI.get(h.world);o.members=h.members.map(p=>p.id);return o});
  const people=S.people.map(p=>{const o={};for(const k in p){if(k==='hh')continue;o[k]=p[k]}return o});
  const rest={};for(const k in S){if(['worlds','hhs','people','hubW','wk','plagueW','P'].includes(k))continue;rest[k]=S[k]}
  return JSON.stringify({v:1,P,worlds,hhs,people,rest})}
function load(str){const d=typeof str==='string'?JSON.parse(str):str;if(!d||d.v!==1)throw new Error('bad save');
  P=Object.assign({},DEF,d.P);R=mkRng((Date.now()^0x5bd1e995)>>>0);
  S=Object.assign({},d.rest);S.P=P;
  const worlds=d.worlds.map(o=>({...o,hhs:[],members(){return this.hhs.reduce((a,h)=>a+h.members.length,0)}}));
  const people=new Map(d.people.map(o=>[o.id,{...o}]));
  const hhs=d.hhs.map(o=>{const h={...o,world:worlds[o.world],members:o.members.map(id=>people.get(id)).filter(Boolean)};h.members.forEach(p=>p.hh=h);return h});
  worlds.forEach((w,i)=>w.hhs=d.worlds[i].hhs.map(j=>hhs[j]).filter(Boolean));
  S.worlds=worlds;S.hhs=hhs;S.people=[...people.values()].filter(p=>p.hh);S.hubW=worlds.find(w=>w.id==='hub');
  S.wk={need:0,got:0,unmet:{},barterTry:0,barterFail:0,queue:0,traded:new Set()};S.plagueW=new Set();return S}
function resizeHub(){const w=S.hubW,n=w.hhs.reduce((a,h)=>a+h.members.length,0);w.pop=P.hubStaff;
  if(n<P.hubStaff){while(w.hhs.reduce((a,h)=>a+h.members.length,0)<P.hubStaff){const h=mkHH(w);mkPerson(h,22+R()*30,R()<0.5?'m':'f');h.inv.rice=20;h.inv.wood=20}}
  else{let extra=n-P.hubStaff;for(const h of [...w.hhs].reverse()){if(extra<=0)break;for(const p of [...h.members]){if(extra<=0)break;h.members=h.members.filter(q=>q!==p);S.people=S.people.filter(q=>q!==p);extra--}}
    S.hhs=S.hhs.filter(h=>h.members.length);w.hhs=w.hhs.filter(h=>h.members.length)}}
})();
/*SIM-END*/
