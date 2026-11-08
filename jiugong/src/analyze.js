module.exports=function(Sim,S){const {season,EVN}=Sim;const pct=v=>Math.round(v*100)+'%',fmt=(v,d=0)=>v==null||!isFinite(v)?'—':v>=10000?Math.round(v/1000)+'千':(+v).toFixed(d);
// ================= problems, bottlenecks, consequences =================
const ago=n=>S.hist[Math.max(0,S.hist.length-1-n)]||{};
const since=(k,n=13)=>{const L=S.hist[S.hist.length-1]||{},A=ago(n);return Math.max(0,(L[k]||0)-(A[k]||0))};
const listN=a=>a.length>3?a.slice(0,3).join('、')+'等':a.join('、');
const GN={food:'粮食',med:'药',tool:'铁器工具',salt:'盐',wood:'木柴',cloth:'布',pot:'陶器',shell:'贝壳'};
const repN=w=>{const c=Sim.candOf(w);return c?c.name:'代表'};
function whyText(w,g){const y=w.why&&w.why[g];if(!y)return'';const by=S.worlds.find(o=>o.id===y.by),mode=S.P.mode,gn=GN[g]||g;
  if(y.code==='none')return`别的地区也没有多余的${gn}`;
  if(!by)return'';
  if(y.code==='blocked')return`${by.name}的代表${repN(by)}不再送${gn}来了：他觉得${w.name}给的回报太少`;
  if(y.code==='poor')return mode==='money'?`${w.name}的贝壳不够，买不起${by.name}的${gn}`:`${w.name}拿不出${by.name}想要的东西来换${gn}`;
  if(y.code==='stingy')return`${by.name}的代表${repN(by)}只肯给一部分${gn}${S.P.rivalry?'，他想先顾自己的地区':'，他不够慷慨'}`;
  return`${by.name}的${gn}不够分`}
function diagnose(){const P=S.P,L=S.hist[S.hist.length-1];if(!L)return[];const out=[],se=season(S.t);
  const M=S.worlds[0],V=S.worlds[1],C=S.worlds[2];
  S.worlds.forEach((w,i)=>{const st=S.wstat[i];if(!st||!st.pop)return;
    // hunger
    if(st.hungry>=3){const bn=[];
      if(w.event&&['drought','locust','storm','fire'].includes(w.event))bn.push(`${w.name}正在闹${EVN[w.event]}，今年收成少`);
      const wt=whyText(w,'food');if(wt)bn.push(wt);
      if(w.id==='mountain'&&!wt)bn.push('山上的梯田很小，山薯和打猎只够一半人吃');
      if(w.id==='coast'&&S.res.fish<0.5)bn.push(`海里的鱼只剩 ${pct(S.res.fish)}，打不到多少`);
      if(w.id==='village'){const fm=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job==='farmer').length,0);if(fm>48)bn.push(`稻田就那么大，种田的人多到 ${fm} 人也种不出更多`);if(P.freeRide&&L.effort<0.85)bn.push(`有人偷懒，干活劲头只有 ${pct(L.effort)}`)}
      if(P.mode==='free'&&P.greed&&w.id!=='village')bn.push('人人都想多拿一点，交到仓库的东西变少了');
      if(w.queue>2)bn.push(`仓库管事太少，每周有 ${w.queue} 户排不上队`);
      if(!bn.length)bn.push('粮食不够分');
      const sv=since('cStarve'),fl=since('cFled'),cons=[];if(sv)cons.push(`最近三个月三个地区一共饿死 ${sv} 人`);if(fl)cons.push(`${fl} 人逃荒去了别的地区`);if(!cons.length)cons.push('吃不饱的人身体变差，生病的人变多；再这样下去会有人饿死');
      out.push({sev:0.5+Math.min(0.5,sv*0.05+st.hungry/Math.max(1,st.pop)),cls:'bad',tag:'缺粮',worlds:[w.id],q:`${w.name}有 ${st.hungry} 人吃不饱`,b:bn.slice(0,2).join('；'),c:cons.join('，')+'。'})}
    // medicine
    if(st.noMed>0||(w.why&&w.why.med&&st.sick>2)){const bn=[];if(w.id==='mountain'){const md=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job==='medic').length,0);bn.push(`山区采药制药的只有 ${md} 人，药不够用`)}else{const t=whyText(w,'med');bn.push(t||'药只有山区才做，要从山上运来')}
      out.push({sev:0.4+Math.min(0.5,st.noMed*0.1),cls:'bad',tag:'缺药',worlds:[w.id],q:`${w.name}有 ${st.noMed} 个病人拿不到药`,b:bn.join('；'),c:(since('cNoMed')?`最近三个月有 ${since('cNoMed')} 人生病没药去世`:'病好得慢，生病的人干不了活，重病的人会去世')+'。'})}
    // tools
    if((st.tool||1)<0.5){const bn=[];if(w.id==='mountain'){const sm=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job==='smith'&&!p.sick).length,0);bn.push(sm<2?`铁匠只有 ${sm} 人`:'铁匠打工具的速度赶不上坏的速度')}else{const t=whyText(w,'tool');bn.push(t||'铁器工具只有山区的铁匠铺打得出来')}
      out.push({sev:0.35+(0.5-st.tool),cls:'warn',tag:'缺工具',worlds:[w.id],q:`${w.name}的铁器工具坏了没得换（只剩 ${pct(st.tool)}）`,b:bn.join('；'),c:`没有好工具，干活效率降了大约 ${pct((1-st.tool)*0.45)}，种出来的、打来的都少了。`})}
    // cold
    if(st.cold>Math.max(3,st.pop*0.06)){const t=whyText(w,'wood')||whyText(w,'cloth');out.push({sev:0.3+Math.min(0.4,st.cold/st.pop),cls:'warn',tag:'冷',worlds:[w.id],q:`${w.name}有 ${st.cold} 个人冬天挨冻`,b:t||(w.id==='mountain'?'木柴有，可是布不够，衣服穿旧了换不上':'没有足够的木柴和衣服，木柴要从山区运来'),c:(since('cCold')?`最近三个月冻死 ${since('cCold')} 人；`:'')+'挨冻的人容易感冒、身体变差。'})}
    if(w.queue>3&&st.hungry<3)out.push({sev:0.28,cls:'warn',tag:'排队',worlds:[w.id],q:`${w.name}每周有 ${w.queue} 户人家在公共仓库排不上队`,b:`仓库管事只有 ${Math.round(w.cl||0)} 个人，忙不过来`,c:'没轮到的人家这周什么也拿不到。'})});
  // representatives who keep things for themselves
  if(P.corruption){S.worlds.forEach(w=>{if((w.trust||1)<0.85){const c=Sim.candOf(w);out.push({sev:0.3+(1-w.trust)*0.5,cls:'warn',tag:'代表私心',worlds:[w.id],q:`${w.name}的代表${c?c.name:''}悄悄多留东西，大家不太信他了（信任 ${pct(w.trust)}）`,b:P.elections?'下一次选举才能换人，到那时才能把他选下去':'没有选举，没人能把他换掉',c:'大家交到仓库的东西变少，满意度下降；换了人以后才会好。'})}})}
  // quarrels between the regions
  if(P.mode==='free')for(let d=0;d<3;d++)for(let n=0;n<3;n++)if(S.block[d][n]){const D=S.worlds[d],N=S.worlds[n];
    out.push({sev:0.55,cls:'bad',tag:'断供',worlds:[D.id,N.id],q:`${D.name}的代表${repN(D)}不再向${N.name}送东西了`,b:`${N.name}送去的东西太少，${D.name}觉得吃亏${P.rivalry?'；两个地区本来就各顾各的':''}`,c:`${N.name}缺的${d===0?'药、铁器和木柴':d===1?'粮食和布':'盐和鱼'}送不来。`})}
  // laziness
  if(P.freeRide&&P.mode==='free'&&L.effort<0.88)out.push({sev:0.3+(0.88-L.effort),cls:'warn',tag:'偷懒',worlds:[],q:`有人偷懒（干活劲头 ${pct(L.effort)}）`,b:'东西不要钱，干多干少拿的一样',c:'生产的东西变少，勤快的人也不高兴。'+(P.reputation?'“大家都看得见”已经让偷懒少了一些。':'')});
  // shells and prices
  if(P.mode==='money'){const ap=S.hist.filter(x=>x.apple!=null);if(ap.length>8){const a0=ap[Math.max(0,ap.length-53)].apple,a1=L.apple,r=a1/a0;
    if(r>1.3){const gat=C.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job==='shell').length,0),bn=[`海边有 ${gat} 人天天去拾贝壳，每周新增大约 ${gat*110} 枚，东西却没变多`];if(P.greed)bn.push('人人都想用多出来的钱多买一点，卖东西的人就卖给出价高的');
      out.push({sev:0.45+Math.min(0.5,(r-1)*0.12),cls:r>2?'bad':'warn',tag:'涨价',worlds:['coast'],q:`物价在涨：一公斤稻米 ${a0.toFixed(1)} → ${a1.toFixed(1)} 枚贝壳`,b:bn.slice(0,2).join('；'),c:S.trust<0.8?'大家不再相信贝壳，不愿意把东西卖出来，市场上东西更少。':'攒下的贝壳越来越不值钱，大家急着花掉。'})}}
    if(L.gini>0.45)out.push({sev:0.25+(L.gini-0.45),cls:'warn',tag:'穷富',worlds:[],q:'有的人家贝壳越攒越多，有的人家欠着账',b:'没贝壳的人家买不起粮食和药',c:'最穷的地区最先吃不饱、看不起病。'})}
  if(P.mode==='barter'){const bf=(S.barterFail||0)/Math.max(1,S.barterTry||1);if(bf>0.5)out.push({sev:0.4,cls:'warn',tag:'难换',worlds:[],q:`想换的东西有 ${pct(bf)} 没换成`,b:'你有的东西对方不一定要，一件铁器工具又没法拆开来换',c:'有粮的人家换不出布，没有铁器的人家换不到工具。这就是人们后来发明钱的原因。'})}
  // nature
  [['fish','海里的鱼','coast','打鱼的比鱼长得快'],['game','森林里的猎物','mountain','打猎的比猎物长得快'],['forest','山上的树','mountain','砍树比树长得快']].forEach(([k,n,w,b])=>{if(L[k]<0.45)out.push({sev:0.3+(0.45-L[k]),cls:'warn',tag:'资源少',worlds:[w],q:`${n}只剩 ${pct(L[k])}`,b,c:'能打到、砍到的越来越少，以后会更难。'})});
  const lf=since('cLeft',26);
  if(lf>=3){const ad=S.people.filter(p=>p.age>=18&&!p.hh.free),mi=ad.filter(p=>p.vote&&p.vote!==p.hh.world.repNo).length;
    out.push({sev:0.42+Math.min(0.3,lf*0.02),cls:'warn',tag:'有人离开',worlds:[],q:`最近半年有 ${lf} 个人离开了三个国家的管理（去荒地 ${since('cFront',26)} 人，在国内角落独自住 ${since('cHermit',26)} 人）`,b:`他们当初没投给当选的代表（现在三个国家里还有 ${pct(mi/Math.max(1,ad.length))} 的成年人当初投了别人），在自己的国家过得不开心`,c:'三个国家少了干活的人；离开的人没有公共仓库和代表，只能靠行商高价买盐、药和铁器，坏年景没人救。'})}
  const F=S.fstat;
  if(F&&F.pop>0&&(F.hungry>=3||F.noMed>=1))out.push({sev:0.45+Math.min(0.3,F.hungry*0.03),cls:'bad',tag:'荒地',worlds:[],q:`荒地上有 ${F.hungry} 人吃不饱，${F.noMed} 个病人没有药`,b:`那里没有代表和公共仓库，坏年景没人救；好地被先来的人占了，空着的地平均地力只有 ${F.freeQ}（先占先得）`,c:'生病的人更危险，吃不饱的人只能挨饿或再搬走。'});
  return out.sort((a,b)=>b.sev-a.sev).slice(0,6)}
return diagnose}
