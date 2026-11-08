(()=>{
const $=s=>document.querySelector(s);
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
// the rules (the simulation) can be swapped while the page keeps running, so read them through Sim every time it changes
let G,JOB,EVN,ILL,SEASON,season,DEF;function bindSim(){({G,JOB,EVN,ILL,SEASON,season,DEF}=Sim)}bindSim();
const MODE_N={free:'不要钱 · 各取所需',barter:'以物易物',money:'用贝壳当钱'};
const KID=[['needFirst','代表先把东西分给最需要的人'],['honest','三位代表都清廉、慷慨、勤快'],['share','地区和邻居之间多互相送'],['elections','每四年重新选一次，不满意就换人'],['reputation','谁干了多少活大家都看得见'],['freedom','想干嘛就干嘛（有人去画画、玩）'],['migrate','不开心可以搬去别的地区'],['priceCap','规定价格不许涨']];
const PARENT=[['greed','人性：都想多拿一点'],['freeRide','拿不到好处就有人偷懒'],['corruption','代表有私心，会悄悄多留一些'],['rivalry','地区先顾自己：要价高、爱设卡'],['disasters','天灾：干旱、风暴、山火、塌方、蝗灾、寒冬'],['contagion','传染病会跟着商队传开'],['distance','路远，山区到海边要翻山过村']];
const ALLN=Object.fromEntries([...KID,...PARENT]);
const RIDS=['mountain','village','coast'];
const RC={mountain:'#6b7280',village:'#4c8a3c',coast:'#2a79a8'};
const PACK={rice:'#e2c25a',veg:'#6aa84f',tuber:'#a07a40',egg:'#f1e7c8',fish:'#7fb5d6',dfish:'#9a8f7a',meat:'#a8443a',smeat:'#8a3b2e',salt:'#f6f6f6',wood:'#8a5a35',ore:'#6f6f78',cloth:'#4a74b8',pot:'#b56a3c',med:'#e8e8ff',tool:'#4a4a52',shell:'#f3d9c7'};
const fmt=(v,d=0)=>v==null||!isFinite(v)?'—':v>=10000?Math.round(v/1000)+'千':(+v).toFixed(d);
const pct=v=>Math.round(v*100)+'%';
let S=null,running=false,speed=1,timer=null,sel=null,tab='world',selPerson=null,role='kid',sample=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tickMs=()=>1300/speed;let lastTick=performance.now();

// ================= the map: mountain on top, village in the middle, coast at the bottom =================
const cv=$('#map'),cx=cv.getContext('2d');let DPR=1,SW=600,SH=720;const cache=new Map();
function fit(){const r=cv.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);SW=r.width||600;SH=SW*1.2;cv.width=Math.round(SW*DPR);cv.height=Math.round(SH*DPR);cache.clear()}
const HALL={mountain:[0.30,0.25],village:[0.60,0.49],coast:[0.58,0.775]};
const ROADS={mv:[[0.30,0.25],[0.38,0.34],[0.50,0.41],[0.60,0.49]],vc:[[0.60,0.49],[0.64,0.60],[0.62,0.70],[0.58,0.775]]};
const RIVER=[[0.80,0.06],[0.72,0.2],[0.82,0.36],[0.74,0.52],[0.80,0.68],[0.78,0.86]];
const CLUSTER={mountain:[0.10,0.19,0.42,0.13],village:[0.55,0.39,0.38,0.2],coast:[0.30,0.69,0.6,0.08]};
const WORK={mountain:[[0.42,0.08,0.26,0.1],[0.03,0.13,0.2,0.2],[0.68,0.18,0.28,0.15]],village:[[0.04,0.38,0.46,0.26]],coast:[[0.04,0.88,0.8,0.1],[0.05,0.74,0.24,0.07],[0.1,0.82,0.7,0.035]]};
function hash(i,s){let n=(i*374761393+s*668265263)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296}
function rngFor(id,k=0){let a=[...id].reduce((s,c)=>s*31+c.charCodeAt(0),7)+k*977;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vnoise(x,y,s){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,sm=t=>t*t*(3-2*t);const a=hash(i+j*57,s),b=hash(i+1+j*57,s),c=hash(i+(j+1)*57,s),d=hash(i+1+(j+1)*57,s);const u=sm(fx),v=sm(fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y,s)=>vnoise(x,y,s)*0.6+vnoise(x*2.1,y*2.1,s+3)*0.28+vnoise(x*4.3,y*4.3,s+7)*0.12;
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const GRASS=[[128,176,90],[95,148,64],[178,160,86],[226,232,234]];
const coastY=u=>0.855+0.018*Math.sin(u*9)+0.012*Math.sin(u*17+1);
function distSeg(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t)}
const riverDist=(u,v)=>{let m=9;for(let i=1;i<RIVER.length;i++)m=Math.min(m,distSeg(u,v,RIVER[i-1],RIVER[i]));return m};
function groundImage(se){const NX=84,NY=100,c=document.createElement('canvas');c.width=NX;c.height=NY;const g=c.getContext('2d'),im=g.createImageData(NX,NY);
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const u=i/NX,v=j/NY,n=fbm(u*5,v*6,11+se);let col;
    const wM=clamp((0.38-v)/0.1,0,1),wC=clamp((v-0.66)/0.08,0,1);
    const grass=mix(GRASS[se],mix(GRASS[se],[30,50,25],0.35),clamp(n*1.3-0.25,0,1));
    const rock=se===3?mix([232,235,238],[190,196,204],n):mix([150,150,138],[104,106,98],clamp(n*1.4-0.2,0,1));
    col=mix(grass,mix(grass,rock,0.85),wM);
    if(wC>0){const sand=se===3?mix([232,228,214],[210,205,190],n):mix([230,212,164],[204,184,134],n);col=mix(col,sand,wC)}
    if(v>coastY(u)){const d=(v-coastY(u))/0.15;col=mix(se===3?[110,150,176]:[84,166,200],se===3?[58,96,128]:[30,98,150],clamp(d*1.2,0,1))}
    const rd=riverDist(u,v);if(rd<0.016&&v<coastY(u))col=mix(col,se===3?[190,214,230]:[70,150,196],clamp(1-rd/0.016,0,1)*0.95);
    const k=(j*NX+i)*4;im.data[k]=col[0];im.data[k+1]=col[1];im.data[k+2]=col[2];im.data[k+3]=255}
  g.putImageData(im,0,0);return c}
function house(g,x,y,s,wall,roof,se){g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(x-s*0.45+s*0.12,y+s*0.05,s*0.95,s*0.18);
  g.fillStyle=wall;g.fillRect(x-s*0.42,y-s*0.42,s*0.84,s*0.5);g.fillStyle='rgba(60,40,30,0.75)';g.fillRect(x-s*0.08,y-s*0.2,s*0.16,s*0.28);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-s*0.55,y-s*0.38);g.lineTo(x,y-s*0.82);g.lineTo(x+s*0.55,y-s*0.38);g.closePath();g.fill();
  if(se===3){g.fillStyle='rgba(255,255,255,0.88)';g.beginPath();g.moveTo(x-s*0.5,y-s*0.42);g.lineTo(x,y-s*0.82);g.lineTo(x+s*0.5,y-s*0.42);g.lineTo(x,y-s*0.66);g.closePath();g.fill()}}
const ROOF={mountain:'#5d5f66',village:'#8a4b2c',coast:'#3e6d8a'},WALL={mountain:'#d9d4cb',village:'#eadbc0',coast:'#f2ece0'};
function housePos(id,i,n){const c=CLUSTER[id],cols=Math.max(3,Math.ceil(Math.sqrt(n*c[2]/c[3]*1.3))),rows=Math.ceil(n/cols);const col=i%cols,row=Math.floor(i/cols);
  return[(c[0]+(col+0.5+(hash(i,3)-0.5)*0.5)/cols*c[2])*SW,(c[1]+(row+0.8+(hash(i,5)-0.5)*0.25)/rows*c[3])*SH]}
function iconBadge(g,x,y,r,id){g.fillStyle='#fbfcf9';g.strokeStyle='#1d2621';g.lineWidth=Math.max(1.5,r*0.14);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke();g.strokeStyle='#1d2621';g.fillStyle='#1d2621';g.lineWidth=Math.max(1.2,r*0.1);
  if(id==='mountain'){g.beginPath();g.moveTo(x,y-r*0.55);g.lineTo(x+r*0.45,y-r*0.1);g.lineTo(x+r*0.25,y+r*0.5);g.lineTo(x-r*0.25,y+r*0.5);g.lineTo(x-r*0.45,y-r*0.1);g.closePath();g.stroke();g.beginPath();g.moveTo(x-r*0.45,y-r*0.1);g.lineTo(x+r*0.45,y-r*0.1);g.stroke()}
  else if(id==='village'){g.beginPath();g.moveTo(x-r*0.4,y+r*0.5);g.quadraticCurveTo(x,y-r*0.1,x+r*0.4,y-r*0.5);g.stroke();for(let k=0;k<4;k++){const px=x-r*0.2+k*r*0.17,py=y+r*0.3-k*r*0.22;g.beginPath();g.ellipse(px+r*0.1,py-r*0.1,r*0.12,r*0.06,-0.6,0,7);g.stroke()}}
  else{g.beginPath();g.moveTo(x,y+r*0.5);g.bezierCurveTo(x-r*0.8,y+r*0.1,x-r*0.5,y-r*0.6,x,y-r*0.3);g.bezierCurveTo(x+r*0.5,y-r*0.6,x+r*0.8,y+r*0.1,x,y+r*0.5);g.stroke();g.beginPath();g.moveTo(x,y-r*0.3);g.lineTo(x,y+r*0.45);g.stroke()}}
function terrainImage(se){const nh=S.worlds.map(w=>Math.min(24,w.hhs.length)).join(','),key=`${se}|${nh}|${Math.round(SW)}|${DPR}`;if(cache.has(key))return cache.get(key);
  const c=document.createElement('canvas');c.width=Math.round(SW*DPR);c.height=Math.round(SH*DPR);const g=c.getContext('2d');g.scale(DPR,DPR);g.imageSmoothingEnabled=true;
  g.drawImage(groundImage(se),0,0,SW,SH);const r=rngFor('t',se),X=u=>u*SW,Y=v=>v*SH;
  // peaks
  for(let i=0;i<7;i++){const cxp=X(0.06+i*0.15+(hash(i,1)-0.5)*0.05),base=Y(0.15+hash(i,2)*0.05),h=Y(0.1+hash(i,3)*0.06),wd=X(0.1+hash(i,4)*0.04);
    g.fillStyle='#8e8f96';g.beginPath();g.moveTo(cxp-wd,base);g.lineTo(cxp,base-h);g.lineTo(cxp+wd,base);g.fill();g.fillStyle='#6d6e76';g.beginPath();g.moveTo(cxp,base-h);g.lineTo(cxp+wd,base);g.lineTo(cxp+wd*0.12,base);g.fill();
    const sc=se===3?0.6:se===0?0.35:0.22;g.fillStyle='#f5f7fa';g.beginPath();g.moveTo(cxp-wd*sc,base-h+h*sc);g.lineTo(cxp,base-h);g.lineTo(cxp+wd*sc,base-h+h*sc);g.lineTo(cxp+wd*sc*0.3,base-h+h*sc*0.8);g.lineTo(cxp-wd*sc*0.2,base-h+h*sc*1.1);g.fill()}
  // forests on the mountain slopes
  const pal=[['#4f8f4a','#5fa55a','#3f7d3e'],['#2f6b36','#3c7d3d','#24592c'],['#c27a2c','#d9a336','#7d6b2b','#3c6b33'],['#2e4f38','#3a5c43','#25432f']][se];
  [[0.03,0.2,0.18,0.14],[0.66,0.22,0.3,0.12]].forEach(([a,b,w,h],k)=>{for(let t=0;t<70;t++){const x=X(a+r()*w),y=Y(b+r()*h),s=SW*(0.012+r()*0.012);
    g.fillStyle='rgba(0,0,0,0.2)';g.beginPath();g.arc(x+s*0.3,y+s*0.3,s,0,7);g.fill();g.fillStyle=pal[(r()*pal.length)|0];g.beginPath();g.arc(x,y,s,0,7);g.fill();if(se===3&&r()<0.6){g.fillStyle='rgba(255,255,255,0.85)';g.beginPath();g.arc(x-s*0.2,y-s*0.2,s*0.55,0,7);g.fill()}}});
  // mine mouth and rails
  g.fillStyle='#2a2522';g.beginPath();g.arc(X(0.52),Y(0.135),SW*0.022,Math.PI,0);g.fill();g.fillRect(X(0.52)-SW*0.022,Y(0.135),SW*0.044,SH*0.004);g.strokeStyle='#5a4a3a';g.lineWidth=1.5;g.beginPath();g.moveTo(X(0.51),Y(0.14));g.lineTo(X(0.44),Y(0.2));g.moveTo(X(0.53),Y(0.14));g.lineTo(X(0.47),Y(0.2));g.stroke();
  // rice paddies and gardens in the village
  const pw=0.46/6,ph=0.26/4,fc=['#7fb3a5','#5d9a3c','#d6b548','#cbc3ae'][se];
  for(let i=0;i<6;i++)for(let j=0;j<4;j++){const x=X(0.04+i*pw),y=Y(0.38+j*ph);g.fillStyle=fc;g.fillRect(x+2,y+2,X(pw)-4,Y(ph)-4);
    g.strokeStyle=se===2?'rgba(140,100,20,0.45)':se===3?'rgba(120,110,90,0.35)':'rgba(30,80,40,0.35)';g.lineWidth=1;for(let k=1;k<6;k++){g.beginPath();g.moveTo(x+4,y+k*Y(ph)/6);g.lineTo(x+X(pw)-4,y+k*Y(ph)/6);g.stroke()}
    if(se===3){g.fillStyle='rgba(255,255,255,0.55)';g.fillRect(x+2,y+2,X(pw)-4,Y(ph)-4)}}
  g.strokeStyle='#8a7a55';g.lineWidth=2;g.strokeRect(X(0.04),Y(0.38),X(0.46),Y(0.26));
  [[0.54,0.6],[0.58,0.62],[0.62,0.6]].forEach(([a,b])=>{g.fillStyle=se===3?'#cfd6cf':'#78a85a';g.fillRect(X(a),Y(b),X(0.035),Y(0.022));g.strokeStyle='rgba(30,70,30,0.4)';g.strokeRect(X(a),Y(b),X(0.035),Y(0.022))});
  // salt pans, drying racks and shells on the beach
  for(let i=0;i<4;i++)for(let j=0;j<2;j++){g.fillStyle=se===1?'#ffffff':'#dfe3e4';g.fillRect(X(0.05+i*0.062),Y(0.74+j*0.036),X(0.052),Y(0.028));g.strokeStyle='rgba(90,110,120,0.5)';g.strokeRect(X(0.05+i*0.062),Y(0.74+j*0.036),X(0.052),Y(0.028))}
  g.strokeStyle='#7a5530';g.lineWidth=2;for(let i=0;i<4;i++){const x=X(0.34+i*0.05),y=Y(0.815);g.beginPath();g.moveTo(x,y);g.lineTo(x,y-SH*0.03);g.moveTo(x+X(0.035),y);g.lineTo(x+X(0.035),y-SH*0.03);g.moveTo(x,y-SH*0.024);g.lineTo(x+X(0.035),y-SH*0.024);g.stroke();g.fillStyle='#b9a07a';g.fillRect(x+2,y-SH*0.022,X(0.03),SH*0.012)}
  for(let k=0;k<50;k++){const u=0.05+r()*0.85,v=0.79+r()*0.05;if(v>coastY(u)-0.004)continue;g.fillStyle=['#f6e3d3','#efc9b5','#fbf0e6'][(r()*3)|0];g.beginPath();g.ellipse(X(u),Y(v),SW*0.007,SW*0.005,r()*3,0,7);g.fill()}
  g.strokeStyle='rgba(255,255,255,0.4)';g.lineWidth=1;for(let k=0;k<40;k++){const u=r(),v=coastY(u)+0.01+r()*0.12;g.beginPath();g.arc(X(u),Y(v),SW*0.012,Math.PI*1.15,Math.PI*1.85);g.stroke()}
  // roads
  g.lineCap='round';g.lineJoin='round';[ROADS.mv,ROADS.vc].forEach(pts=>[['rgba(110,85,55,0.5)',Math.max(4,SW*0.011)],['rgba(225,205,165,0.92)',Math.max(2,SW*0.006)]].forEach(([col,lw])=>{g.strokeStyle=col;g.lineWidth=lw;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke()}));
  // houses
  S.worlds.forEach(w=>{const n=Math.min(24,w.hhs.length);for(let i=0;i<n;i++){const[x,y]=housePos(w.id,i,n);house(g,x,y,SW*0.032,WALL[w.id],ROOF[w.id],se)}});
  // the three halls, with the number of the representative on a badge
  S.worlds.forEach(w=>{const[hx,hy]=HALL[w.id].map((v,k)=>v*(k?SH:SW)),s=SW*0.05;
    g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(hx-s*0.95,hy-s*0.1,s*1.9,s*0.32);g.fillStyle='#efe7d6';g.fillRect(hx-s*0.8,hy-s*0.8,s*1.6,s*0.9);g.fillStyle=RC[w.id];g.fillRect(hx-s*0.95,hy-s*1.1,s*1.9,s*0.34);
    if(se===3){g.fillStyle='rgba(255,255,255,0.85)';g.fillRect(hx-s*0.95,hy-s*1.1,s*1.9,s*0.12)}
    g.fillStyle='#6a4a2a';g.fillRect(hx-s*0.14,hy-s*0.35,s*0.28,s*0.45);g.fillStyle='#3a2a1a';g.fillRect(hx+s*0.95,hy-s*1.9,s*0.05,s*1.5);g.fillStyle=RC[w.id];g.beginPath();g.moveTo(hx+s*1.0,hy-s*1.9);g.lineTo(hx+s*1.55,hy-s*1.72);g.lineTo(hx+s*1.0,hy-s*1.54);g.fill()});
  cache.set(key,c);return c}
const folk={},fx={smoke:[],snow:[],traders:[]};
function drawFigure(x,y,s,col){cx.fillStyle=col;cx.fillRect(x-s*0.35,y-s*0.2,s*0.7,s*1.1);cx.fillStyle='#f1d3b3';cx.beginPath();cx.arc(x,y-s*0.55,s*0.38,0,7);cx.fill()}
function routePts(a,b){const A=RIDS.indexOf(a),B=RIDS.indexOf(b);const seg=(i,j)=>{if(i===0&&j===1)return ROADS.mv;if(i===1&&j===0)return[...ROADS.mv].reverse();if(i===1&&j===2)return ROADS.vc;return[...ROADS.vc].reverse()};
  let pts=[];if(Math.abs(A-B)===1)pts=seg(A,B);else pts=A<B?[...ROADS.mv,...ROADS.vc.slice(1)]:[...[...ROADS.vc].reverse(),...[...ROADS.mv].reverse().slice(1)];
  const lens=[];let L=0;for(let i=1;i<pts.length;i++){const l=Math.hypot((pts[i][0]-pts[i-1][0])*SW,(pts[i][1]-pts[i-1][1])*SH);lens.push(l);L+=l}
  return u=>{let d=u*L;for(let i=0;i<lens.length;i++){if(d<=lens[i]||i===lens.length-1){const k=lens[i]?Math.min(1,d/lens[i]):0;return[(pts[i][0]+(pts[i+1][0]-pts[i][0])*k)*SW,(pts[i][1]+(pts[i+1][1]-pts[i][1])*k)*SH]}d-=lens[i]}}}
function spawnTraders(){if(reduceMotion||speed>=8)return;const now=performance.now(),dur=tickMs()*0.95,by={};
  (S.flow||[]).forEach(([d,n,g,q,arr])=>{const k=d+'>'+n;const o=by[k]||(by[k]={d,n,v:0,top:{}});const v=q*G[g].v;o.v+=v;o.top[g]=(o.top[g]||0)+v});
  Object.values(by).forEach(o=>{const k=Math.min(5,1+Math.floor(o.v/1500));const top=Object.entries(o.top).sort((a,b)=>b[1]-a[1]);const at=routePts(RIDS[o.d],RIDS[o.n]);
    for(let i=0;i<k&&fx.traders.length<40;i++)fx.traders.push({at,t0:now+i*dur*0.08,dur:dur*0.9,col:PACK[(top[i%top.length]||['rice'])[0]],j:hash(i,o.d*3+o.n)})})}
function frame(){
  if(!S){requestAnimationFrame(frame);return}
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,SW,SH);const now=performance.now();
  const tp=running&&!reduceMotion?clamp((now-lastTick)/tickMs(),0,1):0,f=((S.t%52)+tp)/13,s0=Math.floor(f)%4,s1=(s0+1)%4,fa=f-Math.floor(f),k0=clamp((fa-0.4)/0.6,0,1),wn=k0*k0*(3-2*k0);
  const winterW=(s0===3?1-wn:0)+(s1===3?wn:0);
  cx.drawImage(terrainImage(s0),0,0,SW,SH);if(wn>0.01){cx.globalAlpha=wn;cx.drawImage(terrainImage(s1),0,0,SW,SH);cx.globalAlpha=1}
  S.worlds.forEach(w=>{if(!w.event)return;const col={drought:'rgba(230,160,40,0.2)',fire:'rgba(220,80,20,0.22)',plague:'rgba(120,40,140,0.2)',storm:'rgba(40,60,90,0.28)',locust:'rgba(80,70,20,0.22)',collapse:'rgba(60,50,40,0.22)',bumper:'rgba(255,230,120,0.16)'}[w.event];if(!col)return;
    const y0=w.i===0?0:w.i===1?0.36:0.7,y1=w.i===0?0.36:w.i===1?0.7:1;cx.fillStyle=col;cx.fillRect(0,y0*SH,SW,(y1-y0)*SH)});
  // people at work
  S.worlds.forEach(w=>{const working=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job&&p.job!=='artist'&&!p.sick&&p.age>=16&&!JOB[p.job].pub).length,0),n=Math.min(22,Math.ceil(working/3));
    const f2=folk[w.id]||(folk[w.id]=[]);while(f2.length<n)f2.push({x:Math.random(),y:Math.random(),vx:0,vy:0,k:(Math.random()*WORK[w.id].length)|0,c:['#7a3b2e','#2f5d8a','#5a6b2e','#8a6a2e','#4a4a6a'][f2.length%5]});f2.length=n;
    f2.forEach(p=>{if(running&&!reduceMotion){p.vx=clamp(p.vx+(Math.random()-0.5)*0.0016,-0.003,0.003);p.vy=clamp(p.vy+(Math.random()-0.5)*0.0016,-0.003,0.003);p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;p.x=clamp(p.x,0,1);p.y=clamp(p.y,0,1)}
      const r=WORK[w.id][p.k],px=(r[0]+p.x*r[2])*SW,py=(r[1]+p.y*r[3])*SH;
      if(w.id==='coast'&&p.k===0){cx.fillStyle='#7a5530';cx.beginPath();cx.moveTo(px-SW*0.016,py);cx.lineTo(px+SW*0.016,py);cx.lineTo(px+SW*0.01,py+SW*0.008);cx.lineTo(px-SW*0.01,py+SW*0.008);cx.fill();cx.fillStyle='#f4efe4';cx.beginPath();cx.moveTo(px,py-SW*0.022);cx.lineTo(px,py);cx.lineTo(px+SW*0.011,py);cx.fill()}
      else drawFigure(px,py,Math.max(3,SW*0.011),p.c)})});
  const sheep=folk.__s||(folk.__s=[]);void sheep;
  // smoke
  if(!reduceMotion&&running&&Math.random()<0.6){S.worlds.forEach(w=>{const n=Math.min(24,w.hhs.length);
    if(Math.random()<winterW&&n){const i=(Math.random()*n)|0,[hx,hy]=housePos(w.id,i,n);fx.smoke.push({x:hx,y:hy-SW*0.03,a:0.5,r:SW*0.006})}
    if(w.id==='mountain'&&Math.random()<0.5)fx.smoke.push({x:HALL.mountain[0]*SW+SW*0.07,y:HALL.mountain[1]*SH-SW*0.04,a:0.55,r:SW*0.008});
    if(w.event==='fire')fx.smoke.push({x:(0.05+Math.random()*0.9)*SW,y:(0.15+Math.random()*0.15)*SH,a:0.6,r:SW*0.02,fire:1})})}
  fx.smoke=fx.smoke.filter(p=>p.a>0.02).slice(-200);fx.smoke.forEach(p=>{if(running){p.y-=0.35;p.x+=0.12;p.r*=1.012;p.a*=0.975}cx.fillStyle=p.fire?`rgba(90,60,50,${p.a})`:`rgba(235,235,235,${p.a})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  // carriers on the roads
  fx.traders=fx.traders.filter(k=>now<k.t0+k.dur);fx.traders.forEach(k=>{const q=(now-k.t0)/k.dur;if(q<0)return;const[px0,py0]=k.at(q),px=px0+(k.j-0.5)*SW*0.015,py=py0;
    drawFigure(px,py,Math.max(3,SW*0.011),'#3a3a3a');cx.fillStyle=k.col;cx.strokeStyle='rgba(0,0,0,0.45)';cx.lineWidth=0.8;const s=Math.max(3,SW*0.011);cx.fillRect(px+s*0.2,py-s*0.95,s*0.95,s*0.8);cx.strokeRect(px+s*0.2,py-s*0.95,s*0.95,s*0.8)});
  // weather
  if(!reduceMotion&&(winterW>0.02||fx.snow.length)){const want=Math.round(200*winterW);if(fx.snow.length<want&&Math.random()<0.5)fx.snow.push({x:Math.random()*SW,y:-5,v:0.3+Math.random()*0.6,r:1+Math.random()*1.6});
    fx.snow=fx.snow.filter(p=>!(p.y>SH&&fx.snow.length>want));fx.snow.forEach(p=>{if(running){p.y+=p.v;p.x+=Math.sin(p.y/30)*0.3}if(p.y>SH){p.y=-5;p.x=Math.random()*SW}cx.fillStyle='rgba(255,255,255,0.85)';cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()})}
  // storms at sea
  S.worlds.filter(w=>w.event==='storm').forEach(()=>{cx.strokeStyle='rgba(200,220,240,0.55)';cx.lineWidth=1;for(let i=0;i<50;i++){const rx=Math.random()*SW,ry=(0.68+Math.random()*0.32)*SH;cx.beginPath();cx.moveTo(rx,ry);cx.lineTo(rx-3,ry+9);cx.stroke()}});
  // badges and labels
  const fs=Math.max(11,SW*0.024);
  S.worlds.forEach(w=>{const[hx,hy]=HALL[w.id],c=Sim.candOf(w),r=SW*0.03;iconBadge(cx,hx*SW-SW*0.075,hy*SH-SW*0.09,r,w.id);
    cx.fillStyle='#1d2621';cx.font=`900 ${fs*0.95}px ${getComputedStyle(document.body).getPropertyValue('--f-display')}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(String(w.no),hx*SW-SW*0.075,hy*SH-SW*0.09+r+fs*0.7);cx.textAlign='left';
    const y0=w.i===0?0.012:w.i===1?0.37:0.705,tags=[...new Set(PROBS.filter(p=>p.worlds.includes(w.id)).map(p=>p.tag))].slice(0,3),l1=`${w.name} · ${c?c.name:'—'}`,l2=tags.join(' · ');
    cx.font=`700 ${fs}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;const w1=cx.measureText(l1).width;cx.font=`500 ${fs*0.8}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;const w2=l2?cx.measureText(l2).width:0;
    const bw=Math.max(w1,w2)+fs*0.9,bh=l2?fs*2.35:fs*1.5;cx.fillStyle='rgba(250,250,246,0.92)';cx.beginPath();cx.roundRect?cx.roundRect(8,y0*SH,bw,bh,6):cx.rect(8,y0*SH,bw,bh);cx.fill();
    cx.fillStyle=RC[w.id];cx.fillRect(8,y0*SH,4,bh);cx.fillStyle='#1d2621';cx.textBaseline='top';cx.font=`700 ${fs}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;cx.fillText(l1,8+fs*0.55,y0*SH+fs*0.25);
    if(l2){cx.font=`500 ${fs*0.8}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;cx.fillStyle='#b03a2a';cx.fillText(l2,8+fs*0.55,y0*SH+fs*1.4)}
    if(w.event){const lbl=EVN[w.event]+'！';cx.font=`700 ${fs*0.85}px sans-serif`;const tw=cx.measureText(lbl).width+fs*0.8;cx.fillStyle=w.event==='bumper'?'#2e8a4e':'#c2412f';cx.beginPath();cx.roundRect?cx.roundRect(SW-tw-8,y0*SH,tw,fs*1.4,5):cx.rect(SW-tw-8,y0*SH,tw,fs*1.4);cx.fill();cx.fillStyle='#fff';cx.fillText(lbl,SW-tw-8+fs*0.4,y0*SH+fs*0.25)}
    if(sel===w.id){const yy0=w.i===0?0:w.i===1?0.36:0.7,yy1=w.i===0?0.36:w.i===1?0.7:1;cx.strokeStyle='#f6d34a';cx.lineWidth=3;cx.strokeRect(2,yy0*SH+2,SW-4,(yy1-yy0)*SH-4)}});
  requestAnimationFrame(frame)}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),v=(e.clientY-r.top)/r.height;sel=v<0.36?'mountain':v<0.7?'village':'coast';selPerson=null;$('#detailPanel').hidden=false;setTab('world')});
$('#closeDetail').onclick=()=>{$('#detailPanel').hidden=true;sel=null};

// ================= detail panel =================
const units=(o,max=8)=>Object.entries(o||{}).filter(([g,v])=>G[g]&&v>=0.05).sort((a,b)=>b[1]*G[b[0]].v-a[1]*G[a[0]].v).slice(0,max).map(([g,v])=>`${G[g].n} ${v<10?v.toFixed(1):Math.round(v)}${G[g].u}`).join('、')||'没有';
const wname=id=>(S.worlds.find(w=>w.id===id)||{}).name||id;
function setTab(t){tab=t;['World','Rep','People','Person'].forEach(k=>{$('#tab'+k).setAttribute('aria-selected',String(t===k.toLowerCase()))});$('#tabPerson').hidden=!selPerson;renderDetail()}
['World','Rep','People','Person'].forEach(k=>{$('#tab'+k).onclick=()=>setTab(k.toLowerCase())});
const word=(v,a,b,c)=>v>0.7?a:v>0.4?b:c;
function traitWords(c){const o=[];if(c.hon>=0.7)o.push('清廉');else if(c.hon<=0.4)o.push('有私心');if(c.dil>=0.7)o.push('勤政');else if(c.dil<=0.4)o.push('懒散');if(c.gen>=0.7)o.push('慷慨');else if(c.gen<=0.35)o.push('小气');if(c.bar>=0.7)o.push('会砍价');else if(c.bar<=0.3)o.push('不会讲价');if(c.fore>=0.7)o.push('爱存粮');else if(c.fore<=0.3)o.push('不爱存粮');return o.join('、')||'普普通通'}
function relWord(d,n){const r=S.rel[d][n];return S.block[d][n]?'已断供':r>0.55?'很友好':r>0.2?'友好':r>-0.05?'冷淡':'很差'}
function renderDetail(){const el=$('#detail');const w=S.worlds.find(o=>o.id===sel);if(!w)return;const m=w.hhs.flatMap(h=>h.members),st=S.wstat[w.i]||{},c=Sim.candOf(w);
  if(tab==='world'){const jobs={};m.forEach(p=>{const k=p.job?JOB[p.job].n:p.age<16?'孩子':'老人';jobs[k]=(jobs[k]||0)+1});
    const sh={};(S.flow||[]).forEach(([d,n,g,q,arr])=>{if(S.worlds[n]===w){(sh['in'+d]=sh['in'+d]||{});add2(sh['in'+d],g,arr)}if(S.worlds[d]===w){(sh['out'+n]=sh['out'+n]||{});add2(sh['out'+n],g,q)}});
    const parts=RIDS.map((id,k)=>k===w.i?'':[sh['in'+k]?`<span>从${wname(id)}运来：</span>${units(sh['in'+k])}`:'',sh['out'+k]?`<span>运去${wname(id)}：</span>${units(sh['out'+k])}`:''].join('')).join('');
    el.innerHTML=`<div><h2>${w.name}${w.event?` <span class="tag bad">${EVN[w.event]}</span>`:''}</h2><p class="note" style="margin:4px 0 0">${w.desc}</p></div>
    <div class="kv"><span>人口 <b>${m.length}</b>（${w.hhs.length} 户）</span><span>吃得饱 <b>${pct(st.kcov||0)}</b></span><span>平均健康 <b>${pct(st.health||0)}</b></span><span>平均开心 <b>${Math.round((st.happy||0)*100)}</b></span>
      <span>正在生病 <b>${st.sick||0}</b> 人</span><span>冬天冷 <b>${st.cold||0}</b> 人</span><span>公共仓库存粮 <b>${(st.foodWeeks||0).toFixed(1)}</b> 周</span><span>铁器工具 <b>${pct(st.tool==null?1:st.tool)}</b></span>${S.P.mode==='money'?`<span>平均每人有 <b>${fmt(w.hhs.reduce((a,h)=>a+h.money,0)/Math.max(1,m.length))}</b> 枚贝壳</span>`:''}</div>
    <div class="note">${Object.entries(jobs).map(([k,v])=>`${k} ${v}`).join(' · ')}</div>
    <div class="flow"><span>这周生产：</span>${units(w.made)}<span>公共仓库里有：</span>${units(w.store,10)}${parts}</div>
    <p class="note">点“代表”看这个地区的代表和他的决定；点“居民”看每个人的故事。</p>`;return}
  if(tab==='rep'){if(!c){el.innerHTML='<p class="note">现在没有代表。</p>';return}
    const rp=Sim.repPerson(w),el2=S.elec.at(-1),row=el2&&el2.rows.find(r=>r.no===c.no);
    const tax=S.P.mode==='free'?'人们自己把多余的东西送来（'+(S.P.greed?'有人会少送':'大多愿意送')+'）':S.P.mode==='barter'?`每家的多余东西收走 ${Math.round((0.18+0.2*(1-Sim.trait(w,'gen')))*100)}% 当公粮`:'用贝壳向大家收购多余的东西';
    const dist=S.P.needFirst?'先分给病人和饿的人':S.P.mode==='free'?'先到先拿，管事的人家先拿':S.P.mode==='barter'?'拿多余的东西来换':'拿贝壳来买';
    const others=RIDS.map((id,k)=>k===w.i?'':`对${wname(id)}：${S.P.mode==='free'?relWord(w.i,k):'按价钱做买卖'}`).filter(Boolean).join('；');
    el.innerHTML=`<div class="person"><h4>${c.name}（${c.no} 号）</h4><p class="note" style="margin:2px 0 8px">${w.name}代表 · ${Math.floor(c.age)}岁 · ${c.bio}${row?` · 上次选举得 ${row.votes} 票`:''}</p>
    <div class="kv"><span>清廉 <b>${pct(Sim.trait(w,'hon'))}</b></span><span>勤政 <b>${pct(Sim.trait(w,'dil'))}</b></span><span>慷慨 <b>${pct(Sim.trait(w,'gen'))}</b></span><span>会砍价 <b>${pct(Sim.trait(w,'bar'))}</b></span><span>爱存粮 <b>${pct(Sim.trait(w,'fore'))}</b></span><span>大家信他 <b>${pct(w.trust)}</b></span><span>大家满意 <b>${pct(w.approval)}</b></span></div>
    <p style="margin:8px 0 4px">${traitWords(c)}。</p><p class="note" style="margin:0 0 6px">收东西：${tax}<br>分东西：${dist}<br>${others}${S.P.corruption&&S.cnt.leak>0?`<br>他经手的东西里，悄悄留下了价值 ${fmt(w.skimTot||0)} 的一部分`:''}</p>
    ${rp?`<h3>他的经历</h3><ul>${rp.log.map(x=>`<li>${x}</li>`).join('')||'<li>每天在仓库和田间走动。</li>'}</ul>`:''}</div>`;return}
  if(tab==='people'){const cls=v=>v>=0.85?'good':v>=0.6?'warn':'bad';
    const rows=m.slice().sort((a,b)=>b.age-a.age).map(p=>{const tags=(p.cand&&p.job==='rep'?'<span class="tag good">代表</span>':p.cand?'<span class="tag info">候选</span>':'')+(p.sick?`<span class="tag bad">${ILL[p.sick.type].n}</span>`:'')+(p.kcov<0.8?'<span class="tag warn">饿</span>':'')+(p.warm<0.6?'<span class="tag info">冷</span>':'');
      return `<tr data-id="${p.id}"><td>${p.name}${tags}</td><td>${Math.floor(p.age)}</td><td>${p.job?JOB[p.job].n:p.age<16?'孩子':'老人'}</td><td><span class="pill ${cls(p.health)}">${pct(p.health)}</span></td><td><span class="pill ${cls(p.kcov)}">${pct(p.kcov)}</span></td><td>${Math.round(p.happy*100)}</td></tr>`}).join('');
    el.innerHTML=`<p class="note" style="margin:0">${w.name}现在住着 ${m.length} 个人。点一个人看他的故事。</p><div class="table-wrap"><table><thead><tr><th>名字</th><th>年龄</th><th>做什么</th><th>健康</th><th>吃饱</th><th>开心</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    el.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>{selPerson=+tr.dataset.id;setTab('person')});return}
  const p=S.people.find(q=>q.id===selPerson);if(!p){el.innerHTML='<p class="note">这个人已经不在了。</p>';return}
  const fam=p.hh.members.filter(q=>q!==p).map(q=>`${q.name}（${Math.floor(q.age)}岁）`).join('、')||'一个人住';const vc=S.cands.find(x=>x.no===p.vote);
  el.innerHTML=`<div class="person"><h4>${p.name}</h4><p class="note" style="margin:2px 0 8px">${p.sex==='m'?'男':'女'} · ${Math.floor(p.age)}岁 · ${p.job?JOB[p.job].n:p.age<16?'孩子':'老人'} · 住在${p.hh.world.name}</p>
   <div class="kv"><span>健康 <b>${pct(p.health)}</b></span><span>吃饱 <b>${pct(p.kcov)}</b></span><span>暖和 <b>${pct(p.warm)}</b></span><span>衣服 <b>${pct(p.clothes)}</b></span><span>开心 <b>${Math.round(p.happy*100)}</b></span><span>${p.sick?'正在生病：<b>'+ILL[p.sick.type].n+'</b>'+(p.sick.treated?'（吃了药）':''):'没有生病'}</span></div>
   <p style="margin:8px 0 4px">性格：${word(p.dil,'很勤快','还算勤快','有点懒')}，${word(p.greed,'比较贪心','一般','不贪心')}，${word(p.kind,'很善良','还算善良','不太愿意帮别人')}。${vc?`上次投票给了${vc.name}（${vc.no} 号）。`:''}</p>
   <p class="note" style="margin:0 0 6px">家人：${fam}<br>家里有：${units(p.hh.inv,6)}${S.P.mode==='money'?`；贝壳 ${fmt(p.hh.money)} 枚`:''}</p>
   <h3>经历</h3><ul>${p.log.map(x=>`<li>${x}</li>`).join('')||'<li>平平静静地过日子。</li>'}</ul></div>`}
function add2(o,g,q){o[g]=(o[g]||0)+q}

// ================= the three representatives and the election =================
function renderReps(){const last=S.elec.at(-1);
  $('#reps').innerHTML=S.worlds.map(w=>{const c=Sim.candOf(w);if(!c)return '';const row=last&&last.rows.find(r=>r.no===c.no);
    return `<button class="rep ${w.id}" data-w="${w.id}"><span class="no">${c.no}</span><span class="rn">${c.name}</span><span class="rw">${w.name}代表${row?` · ${row.votes} 票`:''}</span><span class="rbio">${traitWords(c)}</span></button>`}).join('');
  document.querySelectorAll('#reps .rep').forEach(b=>b.onclick=()=>{sel=b.dataset.w;selPerson=null;$('#detailPanel').hidden=false;setTab('rep');$('#detailPanel').scrollIntoView({block:'nearest',behavior:'smooth'})});
  const left=S.nextElection-S.t;$('#elecNote').textContent=S.P.elections?`第 ${last?last.n:1} 次选举 · 下次还有 ${Math.max(0,left)} 周`:'没有定期选举，代表一直做下去';
  if(!$('#votes').hidden)renderVotes()}
function renderVotes(){const last=S.elec.at(-1);if(!last)return;const mx=Math.max(1,...last.rows.map(r=>r.votes));
  const rows=[...last.rows].sort((a,b)=>RIDS.indexOf(a.home)-RIDS.indexOf(b.home)||b.votes-a.votes);
  $('#votes').innerHTML=`<p class="note" style="margin:4px 0 6px">第 ${last.n} 次选举：每个地区的成年人，在自己地区的三位候选人里投一票，票最多的当代表。${last.n===1?'（第一次选举的票数是你画的那张表。）':''}</p><div class="vbars">${rows.map(r=>`<div class="vbar ${r.won?'won':''}"><b>${r.no}</b><span>${r.name}</span><i style="width:${Math.max(2,r.votes/mx*100)}%"></i><span>${r.votes}</span></div>`).join('')}</div>`}
$('#votesBtn').onclick=()=>{const v=$('#votes');v.hidden=!v.hidden;$('#votesBtn').textContent=v.hidden?'看全部候选人的票':'收起候选人的票';if(!v.hidden)renderVotes()};
$('#reelect').onclick=()=>{Sim.holdElection(false);addLog('kid','重新选了一次代表','各地区的人重新投票。');render()};

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
      out.push({sev:0.3+Math.min(0.5,(r-1)*0.15),cls:r>2?'bad':'warn',tag:'涨价',worlds:['coast'],q:`物价在涨：一公斤稻米 ${a0.toFixed(1)} → ${a1.toFixed(1)} 枚贝壳`,b:bn.slice(0,2).join('；'),c:S.trust<0.8?'大家不再相信贝壳，不愿意把东西卖出来，市场上东西更少。':'攒下的贝壳越来越不值钱，大家急着花掉。'})}}
    if(L.gini>0.45)out.push({sev:0.25+(L.gini-0.45),cls:'warn',tag:'穷富',worlds:[],q:'有的人家贝壳越攒越多，有的人家欠着账',b:'没贝壳的人家买不起粮食和药',c:'最穷的地区最先吃不饱、看不起病。'})}
  if(P.mode==='barter'){const bf=(S.barterFail||0)/Math.max(1,S.barterTry||1);if(bf>0.5)out.push({sev:0.4,cls:'warn',tag:'难换',worlds:[],q:`想换的东西有 ${pct(bf)} 没换成`,b:'你有的东西对方不一定要，一件铁器工具又没法拆开来换',c:'有粮的人家换不出布，没有铁器的人家换不到工具。这就是人们后来发明钱的原因。'})}
  // nature
  [['fish','海里的鱼','coast','打鱼的比鱼长得快'],['game','森林里的猎物','mountain','打猎的比猎物长得快'],['forest','山上的树','mountain','砍树比树长得快']].forEach(([k,n,w,b])=>{if(L[k]<0.45)out.push({sev:0.3+(0.45-L[k]),cls:'warn',tag:'资源少',worlds:[w],q:`${n}只剩 ${pct(L[k])}`,b,c:'能打到、砍到的越来越少，以后会更难。'})});
  return out.sort((a,b)=>b.sev-a.sev).slice(0,6)}
let PROBS=[];
function render(){
  const se=season(S.t),yr=Math.floor(S.t/52)+1,wk=S.t%52;$('#date').textContent=`第 ${yr} 年 · ${SEASON[se]}`;$('#dateSub').textContent=`第 ${wk%13+1} 周 · ${MODE_N[S.P.mode]}`;
  const L=S.hist[S.hist.length-1];if(!L)return;PROBS=diagnose();
  const bad=PROBS.filter(p=>p.cls==='bad').length,lv=!PROBS.length?['good','运转得很好']:bad>=2||PROBS[0].sev>0.85?['bad','遇到大麻烦了']:bad?['bad','有严重的问题']:['warn','有些小问题'];
  $('#verdict').className='verdict '+lv[0];$('#vFace').textContent=lv[1];const dPop=L.pop-(ago(52).pop||L.pop);
  $('#vText').textContent=(PROBS.length?`最要紧的是：${PROBS[0].q}。`:'三个地区都吃得饱、有药用、冬天不冷。')+(Math.abs(dPop)>=5?` 一年里人口${dPop>0?'多了':'少了'} ${Math.abs(dPop)} 人。`:'');
  $('#probs').innerHTML=PROBS.length?PROBS.map(p=>`<div class="prob ${p.cls}"><span class="k">问题</span><span class="q">${p.q}</span><span class="k">瓶颈</span><span class="v">${p.b}</span><span class="k">后果</span><span class="v">${p.c}</span></div>`).join('')
    :`<div class="prob good"><span class="k">现在</span><span class="q">没有发现问题</span><span class="k">留意</span><span class="v">${se===2?'秋收：山区和海边要趁现在从乡村换够明年的粮。':se===3?'冬天：木柴和衣服要够，木柴只有山区砍得多。':'试着打开右边一条现实制约，看看会出什么问题。'}</span></div>`;
  renderReps();renderLog();if(!$('#detailPanel').hidden)renderDetail()}
function addLog(role,title,ex,pred){S.log.unshift({t:S.t,role,title,ex:ex||'',pred:pred||''});renderLog()}
function renderLog(){const el=$('#log');el.innerHTML='';S.log.forEach(e=>{const li=document.createElement('li');li.innerHTML=`<span class="rtag ${e.role}">${e.role==='kid'?'小朋友':e.role==='parent'?'爸爸妈妈':'世界'}</span><span class="t">${Sim.when(e.t)}</span>`;
  const b=document.createElement('b');b.textContent=e.title;li.append(b);if(e.ex){const x=document.createElement('span');x.className='ex';x.textContent=e.ex;li.append(x)}if(e.pred){const x=document.createElement('span');x.className='ex';x.textContent='预测：'+e.pred;li.append(x)}el.append(li)})}

// ================= controls =================
function tick(){Sim.step();lastTick=performance.now();if(S.t%52===0)S.byYrAgo=S.cnt.by['饥饿']||0;spawnTraders();render()}
function loop(){if(!running)return;tick();timer=setTimeout(loop,tickMs())}
function setRun(v){running=v;$('#play').textContent=v?'⏸ 暂停':'▶ 开始';clearTimeout(timer);if(v)timer=setTimeout(loop,150)}
$('#play').onclick=()=>setRun(!running);$('#stepBtn').onclick=()=>tick();
$('#speed').onclick=e=>{speed=speed===1?2:speed===2?4:speed===4?8:1;e.target.textContent=`速度 ${speed}×`};
$('#reset').onclick=()=>{const p={...S.P};start(p);addLog('sys','从头开始','用现在的规则重新开始。');render()};
function syncUI(){const P=S.P;document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===P.mode)));
  $('#kind').value=Math.round(P.kindness*100);$('#kindOut').textContent=Math.round(P.kindness*100)+'%';$('#shell').value=Math.round(P.shellShare*100);$('#shellOut').textContent=Math.round(P.shellShare*100)+'%';
  document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',String(!!P[b.dataset.k])))}
function mkChips(id,list,role2){const el=$('#'+id);list.forEach(([k,n])=>{const b=document.createElement('button');b.className='chip';b.dataset.k=k;b.textContent=n;b.onclick=()=>{const v=!S.P[k];Sim.setP({[k]:v});syncUI();addLog(role2,(v?'打开：':'关掉：')+n);render()};el.append(b)})}
mkChips('kidChips',KID,'kid');mkChips('parentChips',PARENT,'parent');
document.querySelectorAll('#modes button').forEach(b=>b.onclick=()=>{if(S.P.mode===b.dataset.mode)return;Sim.setP({mode:b.dataset.mode});syncUI();addLog(b.dataset.mode==='free'?'kid':'parent','交换方式改成：'+MODE_N[b.dataset.mode]);render()});
const sl=(id,k,div,role2,label,unit)=>{const el=$('#'+id);el.oninput=()=>{Sim.setP({[k]:el.value/div});syncUI()};el.onchange=()=>{addLog(role2,`${label}：${el.value}${unit}`);render()}};
sl('kind','kindness',100,'kid','自觉程度','%');sl('shell','shellShare',100,'parent','海边拾贝的人','%');

// ================= ideas: Claude, or keywords =================
document.querySelectorAll('.who-toggle button').forEach(b=>b.onclick=()=>{role=b.dataset.r;document.querySelectorAll('.who-toggle button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
const KEYS={mode:'"free"(不要钱各取所需)|"barter"(以物易物)|"money"(用贝壳当钱)',kindness:'0到1，大家有多自觉',shellShare:'0到0.6，海边拾贝壳的人占海边干活的人的比例',
  needFirst:'布尔，代表先把东西分给最需要的人',honest:'布尔，三位代表都清廉、慷慨、勤快',share:'布尔，地区和邻居之间多互相送',elections:'布尔，每四年重新选一次代表',reputation:'布尔，谁干了多少活大家都看得见',freedom:'布尔，想干嘛就干嘛（12%的人不干活去玩）',migrate:'布尔，不开心可以搬家',priceCap:'布尔，规定价格不许涨',
  greed:'布尔，人性：都想多拿一点',freeRide:'布尔，拿不到好处就有人偷懒',corruption:'布尔，代表有私心会悄悄多留',rivalry:'布尔，地区先顾自己要价高爱设卡',disasters:'布尔，随机天灾',contagion:'布尔，传染病随商队传开',distance:'布尔，路远'};
function applyIdea(o,r,fromChat){const ch=o&&o.changes||{},done=[],patch={};
  for(const k in ch){if(!(k in KEYS))continue;let v=ch[k];
    if(k==='mode'){if(MODE_N[v]){patch.mode=v;done.push('交换方式→'+MODE_N[v])}}
    else if(typeof DEF[k]==='boolean'){patch[k]=!!v;done.push((ALLN[k]||k)+(v?' 开':' 关'))}
    else{v=Number(v);if(!isFinite(v))continue;if(k==='kindness'){if(v>1)v/=100;patch[k]=clamp(v,0,1);done.push('自觉程度→'+pct(patch[k]))}if(k==='shellShare'){if(v>1)v/=100;patch[k]=clamp(v,0,0.6);done.push('拾贝的人→'+pct(patch[k]))}}}
  Sim.setP(patch);
  const evs=Array.isArray(o&&o.events)?o.events:o&&o.event?[o.event]:[];evs.forEach(ev=>{if(!ev||!EVN[ev.type])return;const ws=ev.world==='all'?S.worlds:S.worlds.filter(w=>w.id===ev.world);(ws.length?ws:[S.worlds[(Math.random()*3)|0]]).forEach(w=>Sim.trigger2(w,ev.type));done.push(`${ev.world==='all'?'三个地区':(ws[0]||{}).name||'一个地区'}：${EVN[ev.type]}`)});
  syncUI();addLog(r,(fromChat?'（对话里提出）':'')+(o&&o.title||'新的想法'),((o&&o.explain)||'')+(done.length?`（改动：${done.join('，')}）`:'（游戏里还没有能对应的规则）'),o&&o.predict||'');render()}
function keywordIdea(t){const ch={},events=[];const has=(...a)=>a.some(x=>t.includes(x));const wid=['mountain','village','coast'].find(id=>t.includes(wname(id))||(id==='mountain'&&t.includes('山'))||(id==='village'&&t.includes('村'))||(id==='coast'&&(t.includes('海')||t.includes('贝'))));
  if(has('贝壳当钱','用钱','货币','买卖','印钱','多拾','多捡'))Object.assign(ch,{mode:'money'});else if(has('以物易物','物物交换','换东西'))ch.mode='barter';else if(has('不要钱','免费','想要就拿','随便拿','各取所需'))ch.mode='free';
  if(has('多拾贝','多捡贝','贝壳很多','印很多'))ch.shellShare=0.5;if(has('善良','自觉','好心','只拿需要'))ch.kindness=0.9;if(has('自私','多拿','贪','抢'))ch.greed=true;if(has('偷懒','不干活','懒','磨洋工'))ch.freeRide=true;
  if(has('清廉','公正','廉洁','好代表'))ch.honest=true;if(has('私心','贪污','腐败','偏心','多留'))ch.corruption=true;if(has('先顾自己','设卡','要价高','各顾各','封锁'))ch.rivalry=true;
  if(has('不选举','终身','一直当'))ch.elections=false;if(has('重新选','选举','换人'))ch.elections=true;
  if(has('看得见','公开','记录','监督'))ch.reputation=true;if(has('互相帮','分享','帮忙'))ch.share=true;if(has('搬家','迁徙','移民'))ch.migrate=true;if(has('想干嘛','自由','玩','画画'))ch.freedom=true;if(has('最需要','按需','先给'))ch.needFirst=true;
  if(has('不许涨','限价','不准涨','规定价格'))ch.priceCap=true;if(has('传染','疫情'))ch.contagion=true;if(has('路远','运输','距离','翻山'))ch.distance=true;if(has('天灾'))ch.disasters=true;
  for(const[k,v]of[['干旱','drought'],['旱','drought'],['山火','fire'],['火灾','fire'],['风暴','storm'],['台风','storm'],['塌方','collapse'],['蝗','locust'],['瘟疫','plague'],['生病','plague'],['丰收','bumper'],['寒冬','winter'],['特别冷','winter']])if(t.includes(k)){events.push({type:v,world:v==='winter'?'all':wid||'all'});break}
  return{title:t.slice(0,16),changes:ch,events,explain:'按关键词理解了你的想法。',predict:''}}
(async()=>{try{if(window.claude&&window.claude.use)sample=await window.claude.use('sample')}catch(e){sample=null}
  $('#aiBar').hidden=!sample;$('#ideaNote').textContent=sample?'Claude 会把你的想法变成世界里的规则':'按关键词理解（在 Claude 里打开时，Claude 能理解任何想法）'})();
$('#ideaGo').onclick=async()=>{const ta=$('#ideaText'),t=ta.value.trim(),note=$('#ideaNote'),btn=$('#ideaGo');if(!t){note.textContent='先写下一个想法。';return}
  if(!sample){applyIdea(keywordIdea(t),role);ta.value='';return}
  btn.disabled=true;note.textContent='Claude 正在想…';
  const prompt=`你在帮忙运行一个给小朋友的社会模拟游戏“我的三地世界”：只有三个地区，上面是山区（6号代表，有矿、木头、药，缺粮食和盐，是唯一能做铁器工具和药品的地方），中间是乡村（7号代表，种稻谷，缺铁器、药和木柴），下面是海边（9号代表，有鱼、盐和很多贝壳，缺粮食、木柴、铁器和药；贝壳可以当钱，也是稻田的肥料）。三位代表是选出来的，各管一个地区，每个人都有名字、年龄、家庭、工作，有四季、生老病死。
小朋友提出理想的假设，爸爸妈妈提出现实世界的制约。现在提想法的人是：${role==='kid'?'小朋友':'爸爸妈妈'}。
当前参数：${JSON.stringify(S.P)}
可以改的参数：${JSON.stringify(KEYS)}
可以触发的事件 type：drought 干旱 / storm 风暴 / fire 山火 / collapse 矿井塌方 / locust 蝗灾 / plague 瘟疫 / bumper 大丰收 / winter 寒冬；world 为 mountain、village、coast 或 "all"。
想法：“${t}”
把这个想法翻译成参数改动和事件。只改和想法有关的。只回复一个 JSON 对象：
{"title":"不超过12个字的短标题","changes":{"参数名":新值},"events":[],"explain":"用小朋友听得懂的话，1到2句说明你怎么理解这个想法、改了什么","predict":"1句话预测接下来可能发生什么，以及为什么"}
如果现有参数表达不了，就选最接近的，并在 explain 里说清楚游戏里还做不到哪部分。`;
  try{const o=await sample.json(prompt,{modelTier:'quick'});applyIdea(o&&typeof o==='object'?o:keywordIdea(t),role);ta.value='';note.textContent='已经放进世界里了。'}
  catch(e){if(e&&(e.code==='not_granted'||e.code==='sampling_disabled')){sample=null;$('#aiBar').hidden=true}applyIdea(keywordIdea(t),role);ta.value='';note.textContent=e&&e.code==='rate_limited'?'Claude 有点忙，先按关键词理解了。':'先按关键词理解了。'}
  finally{btn.disabled=false}};
$('#aiBtn').onclick=async()=>{if(!sample)return;const out=$('#aiOut'),btn=$('#aiBtn');out.hidden=false;out.textContent='Claude 正在看这个世界…';btn.disabled=true;
  const h=S.hist.filter((x,i)=>i%8===7||i===S.hist.length-1).slice(-30).map(x=>({周:x.t,模式:x.mode,人口:x.pop,吃饱:Math.round(x.kcov*100),健康:Math.round(x.health*100),开心:Math.round(x.happy*100),贫富:+x.gini.toFixed(2),米价:x.apple&&+x.apple.toFixed(1),鱼:Math.round(x.fish*100)}));
  const ws=S.wstat.map(w=>({地区:wname(w.id),代表:repN(S.worlds.find(o=>o.id===w.id)),人口:w.pop,吃饱:Math.round(w.kcov*100),健康:Math.round(w.health*100),开心:Math.round(w.happy*100),缺药:w.noMed,吃不饱:w.hungry}));
  const lg=S.log.slice(0,12).reverse().map(e=>`${Sim.when(e.t)} ${e.role==='kid'?'小朋友':e.role==='parent'?'家长':'世界'}：${e.title}`);
  try{await sample(`你在给一个小朋友和家长解读社会模拟游戏“我的三地世界”的结果。山区（6号郑铁山等）、乡村（7号）、海边（9号）三个地区各由选出来的代表管着，互相交换东西：山区出铁器、药和木柴，缺粮；乡村出粮食，缺铁器、药和木柴；海边出鱼、盐、贝壳，缺粮和木柴。
当前规则：${JSON.stringify(S.P)}
规则变化：${lg.join('；')}
现在最要紧的问题：${JSON.stringify(PROBS.map(p=>({问题:p.q,瓶颈:p.b,后果:p.c})))}
每两个月的数据：${JSON.stringify(h)}
现在各地区：${JSON.stringify(ws)}
死亡原因统计：${JSON.stringify(S.cnt.by)}
请用小朋友能听懂的中文写 5 到 7 句话：发生了什么、为什么（指出是哪条规则、哪位代表的性格或哪种人性造成的），现实世界历史上有没有类似的事。最后提一个让小朋友想一想的问题。不要用标题和列表符号。`,{onText:({text})=>{out.textContent=text},cache:false})}
  catch(e){out.textContent=e&&e.code==='not_granted'?'没有允许 Claude 使用，所以讲不了。':'这次没讲成，过一会儿再试。'}finally{btn.disabled=false}};

// ================= live updates from GitHub =================
const BUILD=__BUILD__,LIVE=__LIVE__;let RULES=LIVE.rules||1;
const REPO='Yifeng-LIN/Yifeng-LIN.github.io',BRANCH='claude/ecstatic-faraday-e7tjvq';
const liveNote=t=>{$('#tickNote').textContent=t};
function applyLive(L){if(!L)return 0;S.liveSeen=S.liveSeen||[];let n=0;
  (L.commands||[]).forEach(c=>{if(!c||S.liveSeen.includes(c.id))return;S.liveSeen.push(c.id);n++;
    if(c.reset){const keep=S.liveSeen.slice(),lg=S.log.slice();start({...S.P,...(c.changes||{})});S.liveSeen=keep;S.log=lg;addLog(c.role||'sys','（对话里提出）'+(c.title||'从头再来'),c.explain||'用新的规则重新开始。',c.predict||'')}
    else applyIdea(c,c.role||'parent',true)});
  if(n)render();return n}
let lastSha=null,fails=0,pollTimer=null;
async function swapRules(sha,v){let code;try{code=await (await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/jiugong/sim.js`)).text()}catch(e){liveNote('新规则下载失败，下次再试');lastSha=null;return}
  let NS;try{NS=new Function(code+'\n;return Sim')()}catch(e){liveNote('新规则的代码有错，先不换');return}
  try{NS.load(Sim.save())}catch(e){liveNote('新规则和现在的世界对不上，先不换（点“从头再来”可以用新规则）');return}
  Sim=NS;bindSim();S=Sim.S;fx.traders.length=0;RULES=v;
  addLog('sys',`换上了第 ${v} 版规则`,'只换了规则：世界、播放速度、正在看的地方都没变。');render()}
async function poll(){clearTimeout(pollTimer);
  try{const r=await fetch(`https://api.github.com/repos/${REPO}/commits/${BRANCH}`,{cache:'no-cache'});
    if(r.status===403||r.status===429){liveNote('GitHub 暂时不让查了，1 分钟后再试');pollTimer=setTimeout(poll,60000);return}
    if(!r.ok)throw new Error(r.status);const j=await r.json(),sha=j.sha;fails=0;
    if(sha&&sha!==lastSha){const L=await (await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/jiugong/live.json`)).json();lastSha=sha;
      if(L.build>BUILD){liveNote('界面有新版本，正在换上（世界接着跑）…');
        try{const html=await (await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/jiugong/game.html`)).text();
          sessionStorage.setItem('jiugong:code',JSON.stringify({build:L.build,html}));sessionStorage.setItem('jiugong:state',Sim.save());sessionStorage.setItem('jiugong:run',running?'1':'0');
          sessionStorage.setItem('jiugong:ui',JSON.stringify({speed,sel,tab,selPerson,y:scrollY,idea:$('#ideaText').value,role}));location.reload();return}
        catch(e){liveNote('界面有新版本，请手动刷新页面')}}
      else if((L.rules||1)>RULES)await swapRules(sha,L.rules);
      const n=applyLive(L);if(n)addLog('sys',`从 GitHub 收到 ${n} 个新想法`,(j.commit&&j.commit.message||'').split('\n')[0])}
    const tm=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    liveNote(`已连接 GitHub，每 10 秒检查一次 · 界面第 ${BUILD} 版 · 规则第 ${RULES} 版 · ${tm}`);pollTimer=setTimeout(poll,10000)}
  catch(e){fails++;liveNote(fails>2?'连不上 GitHub，1 分钟后再试':'正在连接 GitHub…');pollTimer=setTimeout(poll,fails>2?60000:10000)}}

// ================= boot =================
function start(p){Sim.newGame(p||{},Math.floor(Math.random()*1e9));S=Sim.S;for(const k in folk)delete folk[k];fx.traders.length=0;cache.clear();for(let i=0;i<3;i++)Sim.step();syncUI()}
const ss=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},ssDel=k=>{try{sessionStorage.removeItem(k)}catch(e){}};
function boot(d){d=d||{};fit();let restored=false,wasRunning=null;
  try{const st=d.state||ss('jiugong:state');if(st){Sim.load(st);S=Sim.S;restored=true;wasRunning=d.state?d.running:ss('jiugong:run')!=='0'}}catch(e){restored=false}
  ssDel('jiugong:state');ssDel('jiugong:run');
  if(restored){syncUI();addLog('sys',`换上了第 ${BUILD} 版`,'代码更新了，世界接着跑，没有重来。')}
  else{start(LIVE.params||{});S.liveSeen=(LIVE.commands||[]).map(c=>c.id);
    addLog('sys','第一次选举',`山区的郑铁山（6 号，46 票）、乡村的杨满仓（7 号，55 票）、海边的何贝娜（9 号，32 票）当选各自地区的代表。${Object.keys(LIVE.params||{}).length?'按对话里最新的规则开始。':'现在没有打开任何现实制约。'}`)}
  applyLive(LIVE);
  try{const ui=JSON.parse(ss('jiugong:ui')||'null');ssDel('jiugong:ui');if(ui&&restored){speed=ui.speed||1;$('#speed').textContent=`速度 ${speed}×`;sel=ui.sel||null;selPerson=ui.selPerson||null;role=ui.role||role;if(sel)$('#detailPanel').hidden=false;
    document.querySelectorAll('.who-toggle button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.r===role)));if(ui.idea)$('#ideaText').value=ui.idea;setTab(ui.tab||'world');requestAnimationFrame(()=>scrollTo(0,ui.y||0))}}catch(e){}
  render();requestAnimationFrame(frame);
  let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{fit();render()},120)});
  const rethemes=()=>render();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',rethemes);new MutationObserver(rethemes).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(wasRunning!=null?wasRunning:!reduceMotion)setRun(true);
  if(!window.claude)poll();else liveNote(`界面第 ${BUILD} 版 · 规则第 ${RULES} 版`)}
const hot=window.claude&&window.claude.hot;
try{if(hot&&hot.snapshot)hot.snapshot(()=>({state:Sim.save(),running}))}catch(e){}
if(hot&&hot.ready)hot.ready(boot);else boot(hot&&hot.data||{});
})();
