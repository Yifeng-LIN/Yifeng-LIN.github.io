(()=>{
const $=s=>document.querySelector(s);
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
// the rules (the simulation) can be swapped while the page keeps running, so read them through Sim every time it changes
let G,JOB,EVN,ILL,SEASON,season,DEF;function bindSim(){({G,JOB,EVN,ILL,SEASON,season,DEF}=Sim)}bindSim();
const MODE_N={free:'不要钱 · 想要就拿',barter:'以物易物',labor:'劳动积分',money:'用钱买卖'};
const KID=[['needFirst','中心先给最需要的人'],['share','邻居和隔壁世界互相帮忙'],['freedom','想干嘛就干嘛（有人去画画、玩）'],['migrate','不开心可以搬家'],['reputation','谁干了多少活大家都看得见'],['priceCap','规定价格不许涨']];
const PARENT=[['greed','人性：都想多拿一点'],['freeRide','拿不到好处就有人偷懒'],['disasters','天灾：干旱、风暴、山火、塌方、蝗灾、寒冬'],['contagion','传染病会在集市上传开'],['distance','角落的世界离中心远，赶集要走半天'],['corruption','补给中心的人也有私心']];
const ALLN=Object.fromEntries([...KID,...PARENT]);
const PACK={rice:'#e2c25a',apple:'#d94a3a',fish:'#7fb5d6',sfish:'#9a8f7a',meat:'#a8443a',smeat:'#8a3b2e',milk:'#f4f1e6',cheese:'#efc65a',salt:'#f6f6f6',wood:'#8a5a35',ore:'#6f6f78',wool:'#ece6d6',herb:'#7a5aa8',pot:'#b56a3c',cloth:'#4a74b8',med:'#e8e8ff',tool:'#4a4a52',forage:'#6a8f3a'};
const fmt=(v,d=0)=>v==null||!isFinite(v)?'—':v>=10000?Math.round(v/1000)+'千':(+v).toFixed(d);
const pct=v=>Math.round(v*100)+'%';
let S=null,running=false,speed=1,timer=null,sel='farm',tab='world',selPerson=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tickMs=()=>900/speed;

// ================= map =================
const cv=$('#map'),cx=cv.getContext('2d');let DPR=1,SZ=0;const cache=new Map();
function fit(){const r=cv.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);SZ=r.width||600;cv.width=Math.round(SZ*DPR);cv.height=Math.round(SZ*DPR);cache.clear()}
function geo(){const g=SZ*0.012,t=(SZ-g*4)/3;return{g,t}}
function rectOf(r,c){const {g,t}=geo();return[g+c*(t+g),g+r*(t+g),t]}
const LAY={orchard:{vil:[0.56,0.12,0.4,0.26],work:[0.08,0.44,0.84,0.5]},forest:{vil:[0.52,0.62,0.44,0.3],work:[0.08,0.24,0.84,0.36]},
 mine:{vil:[0.06,0.7,0.6,0.24],work:[0.25,0.5,0.6,0.2]},fish:{vil:[0.6,0.14,0.36,0.62],work:[0.04,0.12,0.38,0.78]},
 pasture:{vil:[0.06,0.12,0.36,0.28],work:[0.08,0.48,0.84,0.46]},herb:{vil:[0.56,0.12,0.4,0.28],work:[0.08,0.46,0.84,0.46]},
 farm:{vil:[0.58,0.1,0.38,0.24],work:[0.05,0.4,0.9,0.55]},craft:{vil:[0.06,0.2,0.88,0.6],work:[0.2,0.3,0.6,0.4]},hub:{vil:[0.3,0.3,0.4,0.4],work:[0.25,0.25,0.5,0.5]}};
function hash(i,s){let n=(i*374761393+s*668265263)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296}
function rngFor(id,k=0){let a=[...id].reduce((s,c)=>s*31+c.charCodeAt(0),7)+k*977;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vnoise(x,y,s){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,sm=t=>t*t*(3-2*t);const a=hash(i+j*57,s),b=hash(i+1+j*57,s),c=hash(i+(j+1)*57,s),d=hash(i+1+(j+1)*57,s);
  const u=sm(fx),v=sm(fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const fbm=(x,y,s)=>vnoise(x,y,s)*0.6+vnoise(x*2.1,y*2.1,s+3)*0.28+vnoise(x*4.3,y*4.3,s+7)*0.12;
const GRASS=[[128,176,90],[95,148,64],[178,160,86],[226,232,234]];
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const rgb=a=>`rgb(${a[0]},${a[1]},${a[2]})`;
function ground(g,t,id,se,seed){const N=56,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N);
  let base=GRASS[se],dark=mix(base,[30,50,25],0.35);
  if(id==='hub'){base=[200,190,170];dark=[170,158,138]}if(id==='mine'){base=se===3?[220,224,228]:[150,152,140];dark=se===3?[180,186,192]:[110,112,102]}
  if(id==='pasture'&&se<3){base=mix(base,[190,200,110],0.25)}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const n=fbm(i/N*4,j/N*4,seed),k=(j*N+i)*4,col=mix(base,dark,clamp(n*1.3-0.25,0,1));im.data[k]=col[0];im.data[k+1]=col[1];im.data[k+2]=col[2];im.data[k+3]=255}
  x.putImageData(im,0,0);g.imageSmoothingEnabled=true;g.drawImage(c,0,0,t,t)}
function house(g,x,y,s,wall,roof,se,round){
  g.fillStyle='rgba(0,0,0,0.18)';g.fillRect(x-s*0.45+s*0.12,y+s*0.05,s*0.95,s*0.18);
  if(round){g.fillStyle=wall;g.beginPath();g.arc(x,y-s*0.15,s*0.45,0,7);g.fill();g.fillStyle=roof;g.beginPath();g.arc(x,y-s*0.2,s*0.2,0,7);g.fill();if(se===3){g.fillStyle='rgba(255,255,255,0.8)';g.beginPath();g.arc(x,y-s*0.3,s*0.32,Math.PI,0);g.fill()}return}
  g.fillStyle=wall;g.fillRect(x-s*0.42,y-s*0.42,s*0.84,s*0.5);g.fillStyle='rgba(60,40,30,0.75)';g.fillRect(x-s*0.08,y-s*0.2,s*0.16,s*0.28);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-s*0.55,y-s*0.38);g.lineTo(x,y-s*0.82);g.lineTo(x+s*0.55,y-s*0.38);g.closePath();g.fill();
  if(se===3){g.fillStyle='rgba(255,255,255,0.88)';g.beginPath();g.moveTo(x-s*0.5,y-s*0.42);g.lineTo(x,y-s*0.82);g.lineTo(x+s*0.5,y-s*0.42);g.lineTo(x,y-s*0.66);g.closePath();g.fill()}}
const ROOF={orchard:'#a5512f',forest:'#5a3d26',mine:'#5d5f66',fish:'#3e6d8a',pasture:'#8a6a4a',herb:'#7a5b8c',farm:'#8a4b2c',craft:'#a0522d',hub:'#3f4fa8'};
const WALL={orchard:'#efe3cf',forest:'#c9a77c',mine:'#d9d4cb',fish:'#f2ece0',pasture:'#f4efe4',herb:'#efe7dc',farm:'#eadbc0',craft:'#e8d2b8',hub:'#efe9dd'};
function housePos(id,i,t){const v=LAY[id].vil,cols=Math.max(3,Math.round(Math.sqrt(24*v[2]/v[3]))),rows=Math.ceil(24/cols);
  const c=i%cols,r=Math.floor(i/cols)%rows;return[t*(v[0]+(c+0.5+(hash(i,3)-0.5)*0.5)/cols*v[2]),t*(v[1]+(r+0.75+(hash(i,5)-0.5)*0.3)/rows*v[3])]}
const PAINT={
 farm(g,t,se,r){const w=LAY.farm.work,cols=4,rows=3,pw=w[2]*t/cols,ph=w[3]*t/rows;const fc=['#7fb3a5','#5d9a3c','#d6b548','#cbc3ae'][se];
   for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=w[0]*t+i*pw,y=w[1]*t+j*ph;g.fillStyle=fc;g.fillRect(x+2,y+2,pw-4,ph-4);
     g.strokeStyle=se===2?'rgba(140,100,20,0.45)':se===3?'rgba(120,110,90,0.35)':'rgba(30,80,40,0.35)';g.lineWidth=1;for(let k=1;k<6;k++){g.beginPath();g.moveTo(x+4,y+k*ph/6);g.lineTo(x+pw-4,y+k*ph/6);g.stroke()}
     if(se===3){g.fillStyle='rgba(255,255,255,0.55)';g.fillRect(x+2,y+2,pw-4,ph-4)}}
   g.strokeStyle='#8a7a55';g.lineWidth=2;g.strokeRect(w[0]*t,w[1]*t,w[2]*t,w[3]*t)},
 orchard(g,t,se,r){const w=LAY.orchard.work;for(let j=0;j<4;j++)for(let i=0;i<7;i++){const x=t*(w[0]+(i+0.5)/7*w[2]),y=t*(w[1]+(j+0.5)/4*w[3]),s=t*0.045;
   g.fillStyle='rgba(0,0,0,0.18)';g.beginPath();g.ellipse(x+s*0.3,y+s*0.9,s*0.9,s*0.35,0,0,7);g.fill();g.fillStyle='#6b4a2a';g.fillRect(x-1,y,2,s*0.9);
   if(se===3){g.strokeStyle='#6b4a2a';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x,y);g.lineTo(x+(k-1.5)*s*0.5,y-s*0.8);g.stroke()}continue}
   g.fillStyle=['#8fbf6a','#4f8a3a','#5a8a34'][se];g.beginPath();g.arc(x,y-s*0.3,s,0,7);g.fill();
   const dots=se===0?6:se===1?3:8,dc=se===0?'#f6d3de':'#d33d2f';g.fillStyle=dc;for(let k=0;k<dots;k++){g.beginPath();g.arc(x+(r()-0.5)*s*1.4,y-s*0.3+(r()-0.5)*s*1.3,s*0.16,0,7);g.fill()}}},
 forest(g,t,se,r){const pal=[['#4f8f4a','#5fa55a','#3f7d3e'],['#2f6b36','#3c7d3d','#24592c'],['#c27a2c','#d9a336','#7d6b2b','#3c6b33'],['#2e4f38','#3a5c43','#25432f']][se];
   for(let k=0;k<150;k++){const x=r()*t,y=r()*t;const v=LAY.forest.vil;if(x>v[0]*t-6&&y>v[1]*t-6)continue;const s=t*(0.03+r()*0.03);
     g.fillStyle='rgba(0,0,0,0.2)';g.beginPath();g.arc(x+s*0.3,y+s*0.3,s,0,7);g.fill();g.fillStyle=pal[(r()*pal.length)|0];g.beginPath();g.arc(x,y,s,0,7);g.fill();
     if(se===3&&r()<0.6){g.fillStyle='rgba(255,255,255,0.85)';g.beginPath();g.arc(x-s*0.2,y-s*0.2,s*0.55,0,7);g.fill()}}
   g.strokeStyle='#b9a07a';g.lineWidth=t*0.02;g.beginPath();g.moveTo(t*0.7,t*0.62);g.quadraticCurveTo(t*0.45,t*0.4,t*0.3,t*0.1);g.stroke()},
 mine(g,t,se,r){for(let i=0;i<4;i++){const cx0=t*(0.12+i*0.27+r()*0.05),base=t*0.62,h=t*(0.34+r()*0.18),wd=t*0.24;
   g.fillStyle='#8e8f96';g.beginPath();g.moveTo(cx0-wd,base);g.lineTo(cx0,base-h);g.lineTo(cx0+wd,base);g.fill();g.fillStyle='#6d6e76';g.beginPath();g.moveTo(cx0,base-h);g.lineTo(cx0+wd,base);g.lineTo(cx0+wd*0.15,base);g.fill();
   const sc=se===3?0.55:se===0?0.35:0.22;g.fillStyle='#f5f7fa';g.beginPath();g.moveTo(cx0-wd*sc,base-h+h*sc);g.lineTo(cx0,base-h);g.lineTo(cx0+wd*sc,base-h+h*sc);g.lineTo(cx0+wd*sc*0.3,base-h+h*sc*0.8);g.lineTo(cx0-wd*sc*0.2,base-h+h*sc*1.1);g.fill()}
   g.fillStyle='#2a2522';g.beginPath();g.arc(t*0.52,t*0.62,t*0.05,Math.PI,0);g.fill();g.fillRect(t*0.47,t*0.62,t*0.1,t*0.015);
   g.strokeStyle='#5a4a3a';g.lineWidth=1.5;g.beginPath();g.moveTo(t*0.5,t*0.64);g.lineTo(t*0.36,t*0.78);g.moveTo(t*0.55,t*0.64);g.lineTo(t*0.41,t*0.78);g.stroke()},
 fish(g,t,se,r){const grd=g.createLinearGradient(0,0,t*0.5,0);grd.addColorStop(0,se===3?'#3c5f78':'#2a6f96');grd.addColorStop(1,se===3?'#6f93a8':'#4fa3c4');g.fillStyle=grd;
   g.beginPath();g.moveTo(0,0);g.lineTo(t*0.42,0);for(let y=0;y<=t;y+=t/12)g.lineTo(t*(0.42+Math.sin(y/t*7)*0.04),y);g.lineTo(0,t);g.closePath();g.fill();
   g.fillStyle='#e9d9a6';g.beginPath();for(let y=0;y<=t;y+=t/12)g.lineTo(t*(0.42+Math.sin(y/t*7)*0.04),y);for(let y=t;y>=0;y-=t/12)g.lineTo(t*(0.5+Math.sin(y/t*7)*0.04),y);g.fill();
   g.strokeStyle='rgba(255,255,255,0.45)';g.lineWidth=1;for(let k=0;k<26;k++){const x=r()*t*0.36,y=r()*t;g.beginPath();g.arc(x,y,t*0.02,Math.PI*1.15,Math.PI*1.85);g.stroke()}
   for(let i=0;i<3;i++)for(let j=0;j<2;j++){g.fillStyle=se===1?'#ffffff':'#d8dde0';g.fillRect(t*(0.55+i*0.08),t*(0.82+j*0.07),t*0.065,t*0.05)}
   g.strokeStyle='#7a5530';g.lineWidth=3;g.beginPath();g.moveTo(t*0.48,t*0.45);g.lineTo(t*0.3,t*0.45);g.stroke()},
 pasture(g,t,se,r){g.strokeStyle='#8a6a45';g.lineWidth=1.2;const w=LAY.pasture.work;g.strokeRect(w[0]*t,w[1]*t,w[2]*t,w[3]*t);
   for(let i=0;i<=10;i++){g.fillStyle='#6a4a2a';g.fillRect(w[0]*t+i*w[2]*t/10-1,w[1]*t-2,2,4);g.fillRect(w[0]*t+i*w[2]*t/10-1,(w[1]+w[3])*t-2,2,4)}
   if(se<3){g.fillStyle='rgba(255,255,255,0.12)';for(let k=0;k<30;k++){g.beginPath();g.arc(r()*t,r()*t,t*0.03,0,7);g.fill()}}},
 herb(g,t,se,r){g.strokeStyle=se===3?'#c9dce6':'#4a90c0';g.lineWidth=t*0.025;g.beginPath();g.moveTo(t*0.45,0);g.bezierCurveTo(t*0.2,t*0.35,t*0.6,t*0.6,t*0.35,t);g.stroke();
   for(let j=0;j<5;j++){g.fillStyle='rgba(60,80,40,0.12)';g.fillRect(0,t*(0.46+j*0.1),t,t*0.035)}
   if(se<3){const cols=se===2?['#a07a40','#8a6a3a']:['#8a5cc2','#f2d24a','#ffffff','#c25c9a'];for(let k=0;k<70;k++){const x=t*(0.08+r()*0.84),y=t*(0.46+r()*0.48);g.fillStyle=cols[(r()*cols.length)|0];g.beginPath();g.arc(x,y,t*0.009,0,7);g.fill()}}
   g.strokeStyle='#7a5530';g.lineWidth=1.5;for(let i=0;i<3;i++){const x=t*(0.62+i*0.1);g.beginPath();g.moveTo(x,t*0.42);g.lineTo(x,t*0.36);g.lineTo(x+t*0.07,t*0.36);g.lineTo(x+t*0.07,t*0.42);g.stroke()}},
 craft(g,t,se,r){for(let i=0;i<2;i++){const x=t*(0.25+i*0.5),y=t*0.9;g.fillStyle='#8a5236';g.beginPath();g.arc(x,y,t*0.06,Math.PI,0);g.fill();g.fillStyle='#2a1a12';g.beginPath();g.arc(x,y,t*0.022,Math.PI,0);g.fill()}
   const cl=['#4a74b8','#c2412f','#e3b54a','#3f8f6a'];for(let i=0;i<4;i++){const x=t*(0.42+i*0.05);g.fillStyle=cl[i];g.fillRect(x,t*0.84,t*0.035,t*0.06)}g.strokeStyle='#6a4a2a';g.beginPath();g.moveTo(t*0.4,t*0.84);g.lineTo(t*0.64,t*0.84);g.stroke()},
 hub(g,t,se,r){g.fillStyle='#d9cfba';g.beginPath();g.arc(t*0.5,t*0.52,t*0.3,0,7);g.fill();g.strokeStyle='rgba(120,100,70,0.25)';g.lineWidth=1;for(let k=0;k<5;k++){g.beginPath();g.arc(t*0.5,t*0.52,t*0.06*k+t*0.04,0,7);g.stroke()}
   const B=(x,y,w,h,wall,roof)=>{g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(x+3,y+3,w,h);g.fillStyle=wall;g.fillRect(x,y,w,h);g.fillStyle=roof;g.fillRect(x-2,y-h*0.22,w+4,h*0.28);if(se===3){g.fillStyle='rgba(255,255,255,0.8)';g.fillRect(x-2,y-h*0.22,w+4,h*0.12)}};
   B(t*0.1,t*0.16,t*0.34,t*0.2,'#e8dfcc','#3f4fa8');B(t*0.56,t*0.18,t*0.3,t*0.16,'#f6f6f2','#6b7a8a');B(t*0.58,t*0.66,t*0.28,t*0.16,'#5a5452','#2e2a28');B(t*0.12,t*0.66,t*0.28,t*0.16,'#efe5d0','#8a4b2c');
   g.fillStyle='#d23b2f';g.fillRect(t*0.69,t*0.22,t*0.04,t*0.1);g.fillRect(t*0.66,t*0.25,t*0.1,t*0.04);
   g.fillStyle='#2e2a28';g.fillRect(t*0.8,t*0.58,t*0.04,t*0.1);
   const aw=['#c2412f','#e3b54a','#3f8f6a','#4a74b8'];for(let i=0;i<4;i++){g.fillStyle=aw[i];g.fillRect(t*(0.3+i*0.1),t*0.48,t*0.08,t*0.05);g.fillStyle='#6a4a2a';g.fillRect(t*(0.3+i*0.1),t*0.53,t*0.08,t*0.03)}}
};
function tileImage(w,se){const {t}=geo();const nh=Math.min(24,w.hhs.length),key=`${w.id}|${se}|${nh}|${Math.round(t)}|${DPR}`;if(cache.has(key))return cache.get(key);
  const c=document.createElement('canvas');c.width=c.height=Math.max(8,Math.round(t*DPR));const g=c.getContext('2d');g.scale(DPR,DPR);const r=rngFor(w.id,se);
  ground(g,t,w.id,se,w.id.length*13+se);PAINT[w.id](g,t,se,r);
  if(w.id!=='hub'){for(let i=0;i<nh;i++){const[x,y]=housePos(w.id,i,t);house(g,x,y,t*0.075,WALL[w.id],ROOF[w.id],se,w.id==='pasture')}}
  for(const k of [...cache.keys()])if(k.startsWith(w.id+'|'))cache.delete(k);cache.set(key,c);return c}
const anchor=(w)=>{const[x,y,t]=rectOf(w.r,w.c);const v=LAY[w.id].vil;return[x+t*(v[0]+v[2]/2),y+t*(v[1]+v[3]/2)]};
const hubC=()=>{const[x,y,t]=rectOf(1,1);return[x+t*0.5,y+t*0.52]};
// a road leaves the village, crosses the tile edge that faces the hub, and ends at the plaza
function road(w){const[x,y,t]=rectOf(w.r,w.c),{g}=geo(),a=anchor(w),dr=1-w.r,dc=1-w.c,[hx,hy]=hubC();
  const ex=x+t/2+dc*t/2+dc*g/2,ey=y+t/2+dr*t/2+dr*g/2;const len=Math.hypot(hx-ex,hy-ey),px=hx-(hx-ex)/len*t*0.3,py=hy-(hy-ey)/len*t*0.3;
  const pts=[a,[ex,ey],[px,py]];let L=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);L+=l}
  return{pts,at(u){let d=u*L;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const k=seg[i]?Math.min(1,d/seg[i]):0;return[pts[i][0]+(pts[i+1][0]-pts[i][0])*k,pts[i][1]+(pts[i+1][1]-pts[i][1])*k]}d-=seg[i]}}}}
// moving things
const folk={},fx={smoke:[],snow:[],traders:[]};
function spawnTraders(){if(reduceMotion||speed>=4)return;const now=performance.now(),dur=tickMs()*0.92;let n=0;
  S.worlds.forEach(w=>{if(w.id==='hub')return;const out=Object.entries(w.flowOut||{}).sort((a,b)=>b[1]*G[b[0]].v-a[1]*G[a[0]].v);const inn=Object.entries(w.flowIn||{}).sort((a,b)=>b[1]*G[b[0]].v-a[1]*G[a[0]].v);
    const k=Math.min(4,Math.ceil(w.hhs.filter(h=>S.wk&&S.wk.traded&&S.wk.traded.has(h)).length/3));
    for(let i=0;i<k&&n<34;i++,n++){fx.traders.push({w,t0:now+i*dur*0.06,dur,go:PACK[(out[i%Math.max(1,out.length)]||['rice'])[0]],back:PACK[(inn[i%Math.max(1,inn.length)]||['rice'])[0]],j:hash(i,w.r*3+w.c)})}})}
function drawFigure(x,y,s,col){cx.fillStyle=col;cx.fillRect(x-s*0.35,y-s*0.2,s*0.7,s*1.1);cx.fillStyle='#f1d3b3';cx.beginPath();cx.arc(x,y-s*0.55,s*0.38,0,7);cx.fill()}
function frame(){
  if(!S){requestAnimationFrame(frame);return}
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,SZ,SZ);const se=season(S.t),{t}=geo(),now=performance.now();
  cx.fillStyle=se===3?'#c9d0cf':'#4f5e45';cx.fillRect(0,0,SZ,SZ);
  S.worlds.forEach(w=>{const[x,y]=rectOf(w.r,w.c);cx.drawImage(tileImage(w,se),x,y,t,t);
    if(w.event){const col={drought:'rgba(230,160,40,0.22)',fire:'rgba(220,80,20,0.25)',plague:'rgba(120,40,140,0.22)',storm:'rgba(40,60,90,0.3)',locust:'rgba(80,70,20,0.25)',collapse:'rgba(60,50,40,0.25)',bumper:'rgba(255,230,120,0.18)'}[w.event];if(col){cx.fillStyle=col;cx.fillRect(x,y,t,t)}}});
  // roads
  const[hx,hy]=hubC();cx.lineCap='round';
  S.worlds.forEach(w=>{if(w.id==='hub')return;const rd=road(w);cx.lineJoin='round';[['rgba(110,85,55,0.5)',Math.max(3,SZ*0.008)],['rgba(225,205,165,0.9)',Math.max(1.5,SZ*0.0045)]].forEach(([c,lw])=>{cx.strokeStyle=c;cx.lineWidth=lw;cx.beginPath();rd.pts.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.stroke()})});
  // villagers at work
  S.worlds.forEach(w=>{const[x,y]=rectOf(w.r,w.c),wk=LAY[w.id].work;const working=w.hhs.reduce((a,h)=>a+h.members.filter(p=>p.job&&p.job!=='artist'&&!p.sick&&p.age>=16).length,0);
    const n=Math.min(16,Math.ceil(working/3));const f=folk[w.id]||(folk[w.id]=[]);while(f.length<n)f.push({x:Math.random(),y:Math.random(),vx:0,vy:0,c:['#7a3b2e','#2f5d8a','#5a6b2e','#8a6a2e','#4a4a6a'][f.length%5]});f.length=n;
    f.forEach(p=>{if(running&&!reduceMotion){p.vx=clamp(p.vx+(Math.random()-0.5)*0.0016,-0.003,0.003);p.vy=clamp(p.vy+(Math.random()-0.5)*0.0016,-0.003,0.003);p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;p.x=clamp(p.x,0,1);p.y=clamp(p.y,0,1)}
      const px=x+t*(wk[0]+p.x*wk[2]),py=y+t*(wk[1]+p.y*wk[3]);
      if(w.id==='fish'){cx.fillStyle='#7a5530';cx.beginPath();cx.moveTo(px-t*0.03,py);cx.lineTo(px+t*0.03,py);cx.lineTo(px+t*0.02,py+t*0.015);cx.lineTo(px-t*0.02,py+t*0.015);cx.fill();cx.fillStyle='#f4efe4';cx.beginPath();cx.moveTo(px,py-t*0.04);cx.lineTo(px,py);cx.lineTo(px+t*0.02,py);cx.fill()}
      else drawFigure(px,py,Math.max(3,t*0.022),p.c)});
    if(w.id==='pasture'){const sh=folk.sheep||(folk.sheep=Array.from({length:16},()=>({x:Math.random(),y:Math.random()})));sh.forEach((p,i)=>{if(running&&!reduceMotion){p.x=clamp(p.x+(Math.random()-0.5)*0.004,0,1);p.y=clamp(p.y+(Math.random()-0.5)*0.004,0,1)}
      const px=x+t*(wk[0]+p.x*wk[2]),py=y+t*(wk[1]+p.y*wk[3]);cx.fillStyle=se===3?'#d8d4c8':'#fbfaf5';cx.beginPath();cx.ellipse(px,py,t*0.024,t*0.016,0,0,7);cx.fill();cx.fillStyle='#333';cx.beginPath();cx.arc(px+t*0.022,py-t*0.004,t*0.008,0,7);cx.fill()})}
  });
  // chimney smoke in winter, kilns all year, fire smoke
  if(!reduceMotion&&running&&Math.random()<0.6){S.worlds.forEach(w=>{if(w.id==='hub')return;const[x,y]=rectOf(w.r,w.c);
    if(se===3&&w.hhs.length){const i=(Math.random()*Math.min(24,w.hhs.length))|0,[hx2,hy2]=housePos(w.id,i,t);fx.smoke.push({x:x+hx2,y:y+hy2-t*0.06,a:0.5,r:t*0.012})}
    if(w.id==='craft'&&Math.random()<0.5)fx.smoke.push({x:x+t*(Math.random()<0.5?0.25:0.75),y:y+t*0.84,a:0.55,r:t*0.014});
    if(w.event==='fire')fx.smoke.push({x:x+Math.random()*t,y:y+Math.random()*t*0.6,a:0.6,r:t*0.03,fire:1})});
    const[sx,sy]=hubC();if(Math.random()<0.4)fx.smoke.push({x:sx+t*0.32,y:sy+t*0.06,a:0.5,r:t*0.012})}
  fx.smoke=fx.smoke.filter(p=>p.a>0.02).slice(-220);fx.smoke.forEach(p=>{if(running){p.y-=0.35;p.x+=0.12;p.r*=1.012;p.a*=0.975}cx.fillStyle=p.fire?`rgba(90,60,50,${p.a})`:`rgba(235,235,235,${p.a})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
  // traders on the roads
  fx.traders=fx.traders.filter(k=>now<k.t0+k.dur);fx.traders.forEach(k=>{const q=(now-k.t0)/k.dur;if(q<0)return;const there=q<0.5,u=there?q*2:2-q*2;const[rx,ry]=road(k.w).at(u);
    const ox=(k.j-0.5)*t*0.03,px=rx+ox,py=ry+ox*0.4;drawFigure(px,py,Math.max(3,t*0.024),'#3a3a3a');cx.fillStyle=there?k.go:k.back;cx.strokeStyle='rgba(0,0,0,0.4)';cx.lineWidth=0.8;
    const s=Math.max(3,t*0.022);cx.fillRect(px+s*0.2,py-s*0.9,s*0.9,s*0.8);cx.strokeRect(px+s*0.2,py-s*0.9,s*0.9,s*0.8)});
  // weather
  if(!reduceMotion&&(se===3||S.worlds.some(w=>w.event==='storm'))){if(fx.snow.length<(se===3?180:0))fx.snow.push({x:Math.random()*SZ,y:-5,v:0.4+Math.random()*0.8,r:1+Math.random()*1.6});
    fx.snow.forEach(p=>{if(running){p.y+=p.v;p.x+=Math.sin(p.y/30)*0.3}if(p.y>SZ){p.y=-5;p.x=Math.random()*SZ}cx.fillStyle='rgba(255,255,255,0.85)';cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.fill()});
    S.worlds.filter(w=>w.event==='storm').forEach(w=>{const[x,y]=rectOf(w.r,w.c);cx.strokeStyle='rgba(200,220,240,0.55)';cx.lineWidth=1;for(let i=0;i<40;i++){const rx=x+Math.random()*t,ry=y+Math.random()*t;cx.beginPath();cx.moveTo(rx,ry);cx.lineTo(rx-3,ry+9);cx.stroke()}})}
  else fx.snow.length=0;
  // labels
  const fs=Math.max(10.5,SZ*0.024);
  S.worlds.forEach(w=>{const[x,y]=rectOf(w.r,w.c);const st=S.wstat&&S.wstat.find(o=>o.id===w.id)||{pop:0,sick:0,hungry:0};
    cx.font=`700 ${fs}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;const name=w.name,line2=`${st.pop}人`+(st.sick?` · 病${st.sick}`:'')+(st.hungry?` · 饿${st.hungry}`:'');
    const w1=cx.measureText(name).width;cx.font=`500 ${fs*0.78}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;const w2=cx.measureText(line2).width;const bw=Math.max(w1,w2)+fs*0.9,bh=fs*2.35;
    cx.fillStyle='rgba(250,250,246,0.9)';cx.beginPath();cx.roundRect?cx.roundRect(x+6,y+6,bw,bh,6):cx.rect(x+6,y+6,bw,bh);cx.fill();
    cx.fillStyle='#1d2621';cx.textBaseline='top';cx.font=`700 ${fs}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;cx.fillText(name,x+6+fs*0.45,y+6+fs*0.25);
    cx.font=`500 ${fs*0.78}px ${getComputedStyle(document.body).getPropertyValue('--f-body')}`;cx.fillStyle=st.hungry||st.sick>2?'#b03a2a':'#4a554e';cx.fillText(line2,x+6+fs*0.45,y+6+fs*1.35);
    if(w.event){const lbl=EVN[w.event]||w.event;cx.font=`700 ${fs*0.8}px sans-serif`;const tw=cx.measureText(lbl).width+fs*0.8;cx.fillStyle=w.event==='bumper'?'#2e8a4e':'#c2412f';
      cx.beginPath();cx.roundRect?cx.roundRect(x+t-tw-6,y+6,tw,fs*1.35,5):cx.rect(x+t-tw-6,y+6,tw,fs*1.35);cx.fill();cx.fillStyle='#fff';cx.fillText(lbl,x+t-tw-6+fs*0.4,y+6+fs*0.25)}
    if(sel===w.id){cx.strokeStyle='#f6d34a';cx.lineWidth=3;cx.strokeRect(x+1.5,y+1.5,t-3,t-3)}});
  requestAnimationFrame(frame)}
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  for(const w of S.worlds){const[tx,ty,t]=rectOf(w.r,w.c);if(x>=tx&&x<=tx+t&&y>=ty&&y<=ty+t){sel=w.id;selPerson=null;setTab('world');return}}});

// ================= detail panel =================
const units=(o,max=8)=>Object.entries(o||{}).filter(([g,v])=>G[g]&&v>=0.05).sort((a,b)=>b[1]*G[b[0]].v-a[1]*G[a[0]].v).slice(0,max).map(([g,v])=>`${G[g].n} ${v<10?v.toFixed(1):Math.round(v)}${G[g].u}`).join('、')||'没有';
function setTab(t){tab=t;['World','People','Person'].forEach(k=>{const b=$('#tab'+k);b.setAttribute('aria-selected',String(t===k.toLowerCase()))});$('#tabPerson').hidden=!selPerson;renderDetail()}
$('#tabWorld').onclick=()=>setTab('world');$('#tabPeople').onclick=()=>setTab('people');$('#tabPerson').onclick=()=>setTab('person');
const word=(v,a,b,c)=>v>0.7?a:v>0.4?b:c;
function renderDetail(){const el=$('#detail');const w=S.worlds.find(o=>o.id===sel);if(!w)return;const m=w.hhs.flatMap(h=>h.members);const st=S.wstat.find(o=>o.id===w.id)||{};
  if(tab==='world'){
    const jobs={};m.forEach(p=>{const k=p.job?JOB[p.job].n:p.age<16?'孩子':'老人';jobs[k]=(jobs[k]||0)+1});
    const fw=w.hhs.length?w.hhs.reduce((a,h)=>a+Sim.kcalOf(h.inv),0)/Math.max(1,w.hhs.reduce((a,h)=>a+Sim.hhKcal(h),0)):0;
    const ws=m.filter(p=>p.job&&p.job!=='artist').length,td=w.hhs.reduce((a,h)=>a+h.toolDur,0);
    let extra='';if(S.P.mode==='money')extra=`<span>平均每人有钱 <b>${fmt(w.hhs.reduce((a,h)=>a+h.money,0)/Math.max(1,m.length))}</b> 块</span>`;if(S.P.mode==='labor')extra=`<span>平均每人积分 <b>${fmt(w.hhs.reduce((a,h)=>a+h.credits,0)/Math.max(1,m.length))}</b></span>`;
    let hub='';if(w.id==='hub'){const H=S.hub.inv;hub=`<div class="flow"><span>仓库里有：</span>${units(H,12)}<span>这周做了：</span>药品 ${fmt(S.hub.made.med)} 剂、铁器工具 ${fmt(S.hub.made.tool,1)} 件${S.P.mode==='money'?`<span>中心的钱：</span>${fmt(S.hub.cash)} 块${S.deficitPrint?`（为了发工资和收购，一共额外印了 ${fmt(S.deficitPrint)} 块）`:''}`:''}</div>`}
    el.innerHTML=`<div><h2>${w.name}${w.event?` <span class="tag bad">${EVN[w.event]}</span>`:''}</h2><p class="note" style="margin:4px 0 0">${w.desc||''}</p></div>
    <div class="kv"><span>人口 <b>${m.length}</b>（${w.hhs.length} 户）</span><span>吃得饱 <b>${pct(st.kcov||0)}</b></span><span>平均健康 <b>${pct(st.health||0)}</b></span><span>平均开心 <b>${pct(st.happy||0)}</b></span>
      <span>正在生病 <b>${st.sick||0}</b> 人</span><span>冬天冷 <b>${st.cold||0}</b> 人</span><span>家里存粮够吃 <b>${fw.toFixed(1)}</b> 周</span><span>铁器工具 <b>${ws?pct(Math.min(1,td/ws)):'—'}</b></span>${extra}</div>
    <div class="note">${Object.entries(jobs).map(([k,v])=>`${k} ${v}`).join(' · ')}</div>
    ${w.id==='hub'?hub:`<div class="flow"><span>这周生产：</span>${units(w.made)}${w.id==='farm'&&S.t%52<26?`<span>地里的稻子：</span>正在长，秋天大约能收 ${fmt(w.hhs.reduce((a,h)=>a+h.crop,0)*50)} 公斤（越到夏天越多）`:''}<span>这周交出去 / 卖出去：</span>${units(w.flowOut)}<span>这周换回来 / 买回来：</span>${units(w.flowIn)}${S.P.mode==='money'?`<span>钱：</span>${w.moneyIn>=0?'多了':'少了'} ${fmt(Math.abs(w.moneyIn))} 块`:''}</div>`}
    <p class="note">点“住在这里的人”，看每个人的名字、年龄和他们的故事。</p>`;return}
  if(tab==='people'){const cls=v=>v>=0.85?'good':v>=0.6?'warn':'bad';
    const rows=m.slice().sort((a,b)=>b.age-a.age).map(p=>{const tags=(p.sick?`<span class="tag bad">${ILL[p.sick.type].n}</span>`:'')+(p.kcov<0.8?'<span class="tag warn">饿</span>':'')+(p.warm<0.6?'<span class="tag info">冷</span>':'')+(p.grief>0.3?'<span class="tag info">难过</span>':'');
      return `<tr data-id="${p.id}"><td>${p.name}${tags}</td><td>${Math.floor(p.age)}</td><td>${p.job?JOB[p.job].n:p.age<16?'孩子':'老人'}</td><td><span class="pill ${cls(p.health)}">${pct(p.health)}</span></td><td><span class="pill ${cls(p.kcov)}">${pct(p.kcov)}</span></td><td>${Math.round(p.happy*100)}</td></tr>`}).join('');
    el.innerHTML=`<p class="note" style="margin:0">${w.name}现在住着 ${m.length} 个人。点一个人看他的故事。</p><div class="table-wrap"><table><thead><tr><th>名字</th><th>年龄</th><th>做什么</th><th>健康</th><th>吃饱</th><th>开心</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    el.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>{selPerson=+tr.dataset.id;setTab('person')});return}
  const p=S.people.find(q=>q.id===selPerson);if(!p){el.innerHTML='<p class="note">这个人已经不在了。</p>';return}
  const fam=p.hh.members.filter(q=>q!==p).map(q=>`${q.name}（${Math.floor(q.age)}岁）`).join('、')||'一个人住';
  el.innerHTML=`<div class="person"><h4>${p.name}</h4><p class="note" style="margin:2px 0 8px">${p.sex==='m'?'男':'女'} · ${Math.floor(p.age)}岁 · ${p.job?JOB[p.job].n:p.age<16?'孩子':'老人'} · 住在${p.hh.world.name}</p>
   <div class="kv"><span>健康 <b>${pct(p.health)}</b></span><span>吃饱 <b>${pct(p.kcov)}</b></span><span>暖和 <b>${pct(p.warm)}</b></span><span>衣服 <b>${pct(p.clothes)}</b></span><span>开心 <b>${Math.round(p.happy*100)}</b></span><span>${p.sick?'正在生病：<b>'+ILL[p.sick.type].n+'</b>'+(p.sick.treated?'（吃了药）':''):'没有生病'}</span></div>
   <p style="margin:8px 0 4px">性格：${word(p.dil,'很勤快','还算勤快','有点懒')}，${word(p.greed,'比较贪心','一般','不贪心')}，${word(p.kind,'很善良','还算善良','不太愿意帮别人')}；手艺${word((p.skill-0.75)*2,'很好','一般','还在学')}。</p>
   <p class="note" style="margin:0 0 6px">家人：${fam}<br>家里有：${units(p.hh.inv,6)}${S.P.mode==='money'?`；钱 ${fmt(p.hh.money)} 块`:''}${S.P.mode==='labor'?`；积分 ${fmt(p.hh.credits)}`:''}</p>
   <h3>经历</h3><ul>${p.log.map(x=>`<li>${x}</li>`).join('')||'<li>平平静静地过日子。</li>'}</ul></div>`}

// ================= charts =================
const CH=[
 {id:'cPop',t:'人口',s:[{k:'pop',c:'--accent',n:'总人口'}]},
 {id:'cWell',t:'吃饱、健康、开心（%）',max:100,s:[{k:'kcov',c:'--warn',n:'吃饱',m:100},{k:'health',c:'--good',n:'健康',m:100},{k:'happy',c:'--kid',n:'开心',m:100}]},
 {id:'cPrice',t:'',s:[]},
 {id:'cFair',t:'贫富差距和最不开心的世界',max:100,s:[{k:'gini',c:'--bad',n:'贫富差距（基尼系数×100）',m:100},{k:'minHappy',c:'--parent',n:'最不开心的世界的开心度',m:100}]},
 {id:'cHub',t:'补给中心的库存够用几周',s:[{k:'medWk',c:'--bad',n:'药品'},{k:'toolWk',c:'--hubc',n:'铁器工具'},{k:'foodWk',c:'--warn',n:'粮食（全体）'}],cap:40},
 {id:'cNat',t:'大自然还剩多少（%）',max:100,s:[{k:'fish',c:'--parent',n:'海里的鱼',m:100},{k:'game',c:'--kid',n:'森林里的猎物',m:100},{k:'forest',c:'--good',n:'树木',m:100}]},
];
function buildCharts(){$('#charts').innerHTML=CH.map(c=>`<div class="chart"><h3 id="${c.id}T">${c.t}</h3><canvas id="${c.id}"></canvas><div class="legend" id="${c.id}L"></div></div>`).join('')}
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function drawChart(spec){const c=document.getElementById(spec.id);if(!c)return;const r=c.getBoundingClientRect();if(!r.width)return;const d=Math.min(2,devicePixelRatio||1);c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);
  const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);const W=r.width,H=r.height,L=36,R=8,T=8,B=18;g.clearRect(0,0,W,H);
  const hist=S.hist,step=Math.max(1,Math.ceil(hist.length/300)),pts=hist.filter((x,i)=>i%step===0||i===hist.length-1);
  const n=Math.max(52,hist.length);const val=(x,s)=>{let v=x[s.k];if(v==null)return null;v*=s.m||1;if(spec.cap)v=Math.min(v,spec.cap);return v};
  let mx=spec.max;if(mx==null){mx=0;spec.s.forEach(s=>pts.forEach(x=>{const v=val(x,s);if(v!=null)mx=Math.max(mx,v)}));mx=niceMax(mx*1.05||1)}
  const X=tt=>L+(W-L-R)*(tt/(n||1)),Y=v=>T+(H-T-B)*(1-v/mx);
  g.font='11px '+tok('--f-body');g.strokeStyle=tok('--line');g.fillStyle=tok('--muted');g.lineWidth=1;
  for(let k=0;k<=4;k++){const v=mx*k/4,y=Y(v);g.beginPath();g.moveTo(L,y);g.lineTo(W-R,y);g.stroke();g.textAlign='right';g.textBaseline='middle';g.fillText(v>=1000?Math.round(v/100)/10+'千':v<10&&mx<=10?v.toFixed(1):Math.round(v),L-5,y)}
  g.textAlign='center';g.textBaseline='top';const yrs=Math.floor(n/52);for(let y=1;y<=yrs;y++){const x=X(y*52);if(x<W-R-6)g.fillText(`${y}年`,x,H-B+4)}
  // seasons: shade winters
  g.fillStyle=tok('--soft');for(let y=0;y<=yrs;y++){const a=X(y*52+39),b=X(Math.min(n,y*52+52));if(a<W-R){g.globalAlpha=0.6;g.fillRect(a,T,Math.min(b,W-R)-a,H-T-B);g.globalAlpha=1}}
  g.setLineDash([3,3]);g.strokeStyle=tok('--muted');(S.log||[]).forEach(e=>{if(e.role==='sys'||e.t<1)return;const x=X(e.t);g.beginPath();g.moveTo(x,T);g.lineTo(x,H-B);g.stroke()});g.setLineDash([]);
  spec.s.forEach(s=>{g.strokeStyle=tok(s.c);g.lineWidth=2;g.beginPath();let on=false,lx=0,ly=0;pts.forEach(x=>{const v=val(x,s);if(v==null){on=false;return}const px=X(x.t),py=Y(Math.min(v,mx));if(!on){g.moveTo(px,py);on=true}else g.lineTo(px,py);lx=px;ly=py});g.stroke();
    if(on){g.fillStyle=tok(s.c);g.beginPath();g.arc(lx,ly,3,0,7);g.fill()}});
  $('#'+spec.id+'L').innerHTML=spec.s.map(s=>`<span><i style="background:var(${s.c})"></i>${s.n}</span>`).join('')+((S.log||[]).some(e=>e.role!=='sys')?'<span>竖线：改了规则</span>':'')+'<span>浅色：冬天</span>'}
function priceSpec(){const pr=CH[2];const money=S.hist.some(x=>x.apple!=null),barter=S.hist.some(x=>x.barterFail!=null);
  if(money){pr.t='价格：一个苹果、一公斤米（块）';pr.s=[{k:'apple',c:'--bad',n:'一个苹果'},{k:'rice',c:'--warn',n:'一公斤米'}];pr.max=null}
  else{pr.t='需要的东西有多少没拿到（%）';pr.s=[{k:'unmet',c:'--bad',n:'没拿到的比例',m:100}];if(barter)pr.s.push({k:'barterFail',c:'--parent',n:'以物易物失败的比例',m:100});pr.max=100}
  $('#cPriceT').textContent=pr.t}

// ================= results =================
function avgLast(k,n=13){const h=S.hist.slice(-n);return h.length?h.reduce((a,x)=>a+(x[k]||0),0)/h.length:0}
function render(){
  const se=season(S.t),yr=Math.floor(S.t/52)+1,wk=S.t%52;$('#date').textContent=`第 ${yr} 年 · ${SEASON[se]}`;$('#dateSub').textContent=`第 ${wk%13+1} 周 · ${MODE_N[S.P.mode]}`;
  const L=S.hist[S.hist.length-1];if(!L)return;const ps=S.people;
  // verdict
  const yrAgo=S.hist[Math.max(0,S.hist.length-53)],trend=L.pop/Math.max(1,yrAgo.pop);
  const starvedYr=(S.cnt.by['饥饿']||0)-(S.byYrAgo||0);const ap=S.hist.filter(x=>x.apple!=null),infl=ap.length>13?ap[ap.length-1].apple/ap[Math.max(0,ap.length-53)].apple:1;
  let score=0.3*avgLast('kcov')+0.3*avgLast('health')+0.25*avgLast('happy')+0.15*clamp((trend-0.85)/0.15,0,1);score-=Math.min(0.12,starvedYr*0.012);if(infl>1.5)score-=Math.min(0.12,(infl-1.5)*0.03);
  const v=$('#verdict');const lv=score>0.86?['good','运转得很好']:score>0.76?['warn','勉强能运转']:score>0.62?['bad','遇到大麻烦了']:['bad','快撑不下去了'];v.className='verdict '+lv[0];$('#vFace').textContent=lv[1];
  $('#vText').textContent=`规则：${MODE_N[S.P.mode]}，自觉程度 ${Math.round(S.P.kindness*100)}%${S.P.mode==='money'?`，每月印钱 ${Math.round(S.P.printRate*100)}%`:''}。最近三个月：吃饱 ${pct(avgLast('kcov'))}，健康 ${pct(avgLast('health'))}，开心 ${Math.round(avgLast('happy')*100)}；一年里人口${trend>1.02?'在增加':trend<0.98?'在减少':'差不多'}（${yrAgo.pop} → ${L.pop}）`+(starvedYr>0?`，最近一年有 ${starvedYr} 人饿死`:'')+(infl>1.5?`，一年里物价涨了 ${infl.toFixed(1)} 倍`:'')+'。';
  // tiles
  const worst=[...S.wstat].filter(w=>w.id!=='hub'&&w.pop).sort((a,b)=>a.happy-b.happy)[0];const wn=id=>S.worlds.find(w=>w.id===id).name;
  const mode=S.P.mode,apYr=S.hist.find(x=>x.t===Math.max(1,S.t-52));
  const t6=mode==='money'?['一个苹果',`${fmt(L.apple,2)} 块`,apYr&&apYr.apple?`一年前 ${fmt(apYr.apple,2)} 块`:'刚开始用钱']:mode==='barter'?['以物易物失败',pct(avgLast('barterFail')),'想换的东西没换到']:['需要没拿到',pct(avgLast('unmet',4)),'最近一个月'];
  const tiles=[['人口',L.pop,`今年出生 ${S.yr.births} · 去世 ${S.yr.deaths}`],['吃得饱',pct(ps.filter(p=>p.kcov>=0.9).length/Math.max(1,ps.length)),`吃不饱 ${L.hungry} 人`],['平均健康',pct(L.health),`正在生病 ${L.sick} 人`],
    ['平均开心',Math.round(L.happy*100),worst?`最不开心：${wn(worst.id)}`:''],['贫富差距',L.gini.toFixed(2),'0 是一样多，越大越不平均'],t6,
    ['补给中心的药',`够 ${fmt(Math.min(L.medWk,99))} 周`,`铁器工具够 ${fmt(Math.min(L.toolWk,99))} 周`],['大自然',`鱼 ${pct(L.fish)}`,`猎物 ${pct(L.game)} · 树木 ${pct(L.forest)}`]];
  $('#stats').innerHTML=tiles.map(([l,v,d])=>`<div class="stat"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('');
  priceSpec();CH.forEach(drawChart);
  renderFinds();renderNews();renderLog();renderDetail();
}
function renderFinds(){const out=[],h=S.hist,L=h[h.length-1],c=S.cnt,P=S.P,yr=h.slice(-52),wn=id=>S.worlds.find(w=>w.id===id).name;
  const by=c.by,starve=by['饥饿']||0,nomed=Object.entries(by).filter(([k])=>k.includes('没有药')).reduce((a,[,v])=>a+v,0);
  const hungryW=S.wstat.filter(w=>w.id!=='hub'&&w.pop&&w.kcov<0.85).map(w=>wn(w.id));
  if(hungryW.length)out.push(['bad',`现在${hungryW.join('、')}吃不饱。`+(P.mode==='free'&&P.greed?'东西不要钱时，大家交得少、拿得多，种粮食的世界先把自己家的粮仓装满，不种粮食的世界就分不到。':P.mode==='barter'?'以物易物时，他们手里的东西别人不一定要，就换不到吃的。':P.mode==='money'?'用钱时，没钱的人家买不起粮食。':'补给中心的粮仓不够分。')]);
  if(starve>0)out.push(['bad',`到现在一共有 ${starve} 个人饿死，${nomed} 个人生病时没有药。`+(c.fled?` ${c.fled} 个人逃荒搬去了有吃的地方。`:'')]);
  if(P.mode==='free'&&P.greed&&c.overK>15400*20)out.push(['warn',`“都想多拿一点”：东西不要钱，大家多吃多用，平均每周多用掉大约 ${Math.round(c.overK/15400/Math.max(1,S.t))} 个人一周的口粮。${P.needFirst?'中心按需要分，好了一些。':'把“自觉程度”调高，或者让中心“先给最需要的人”试试。'}`]);
  if(P.freeRide&&(P.mode==='free'||P.mode==='labor')){const ws=S.people.filter(p=>p.effort>0),e=ws.reduce((a,p)=>a+p.effort,0)/Math.max(1,ws.length);
    out.push([e<0.8?'bad':'warn',`拿不到好处，有人就偷懒：大家干活的劲头平均只有 ${pct(e)}。${P.mode==='labor'?'劳动积分按小时算，不按做出来多少算，混时间的人也拿一样的分。':''}${P.reputation?'“大家都看得见”让偷懒的人少了一些。':'试试“谁干了多少活大家都看得见”。'}`])}
  if(P.mode==='barter')out.push(['warn',`以物易物：最近三个月 ${pct(avgLast('barterFail'))} 的交换没成功。矿工的矿石、采药人的草药，除了补给中心没人要；一件铁器工具值好几十公斤鱼，没法切开来换。这就是人们后来发明钱的原因。`]);
  if(P.mode==='labor')out.push(['warn',`劳动积分：价格是按“做它要花几个小时”定的，东西少了也不涨价，所以缺的东西总是被先来的人换光，后来的人排不到。`]);
  if(P.mode==='money'){const ap=h.filter(x=>x.apple!=null);if(ap.length>4){const a0=ap[0].apple,a1=L.apple;const r=a1/a0;
    if(r>1.6)out.push(['bad',`通货膨胀：一个苹果从 ${a0.toFixed(2)} 块涨到了 ${a1.toFixed(2)} 块。苹果并没有变多，可是大家手里的钱变多了${P.greed?'，人人都想用多出来的钱多买一点，卖苹果的人就卖给出价高的人':''}。${S.trust<0.7?'物价涨得太快，大家开始不相信钱，不愿意把东西卖给中心。':''}`]);
    else out.push(['good',`苹果价格比较稳定：${a0.toFixed(2)} → ${a1.toFixed(2)} 块。`]);
    if(S.deficitPrint>0)out.push(['warn',`补给中心的钱不够发工资和收购东西，自己又印了 ${fmt(S.deficitPrint)} 块钱。这些新钱也会让东西变贵。`]);
    if(L.gini>0.42)out.push(['warn',`用钱以后，有的人家钱越攒越多，有的人家欠着账。贫富差距是 ${L.gini.toFixed(2)}。`])}
    if(P.priceCap)out.push(['warn','规定价格不许涨：东西便宜了，可是太便宜就没人愿意多卖，货架很快被先来的人买空，后来的人有钱也买不到。'])}
  if(L.fish<0.45)out.push(['bad',`海里的鱼只剩 ${pct(L.fish)} 了：人多了、打得多了，鱼来不及长大。`]);if(L.game<0.45)out.push(['bad',`森林里的猎物只剩 ${pct(L.game)}。`]);
  if(P.distance)out.push(['warn','角落里的四个世界离中心远，赶集要走半天，排队也排在后面，东西常常被先到的人拿完。']);
  if(P.corruption&&c.leak>0)out.push(['warn',`补给中心的人有私心：一共大约有价值 ${fmt(c.leak)} 块的药品、工具和好吃的被他们偷偷留下了。`]);
  if(c.moved)out.push(['good',`有 ${c.moved} 个人因为不开心搬去了别的世界。`]);
  if(P.freedom)out.push(['good','“想干嘛就干嘛”：有些人去画画、玩，大家更开心，可干活的人少了，东西也少了。']);
  if(!out.length)out.push(['good',`每个世界都吃得饱、有药用。最近一年出生 ${S.yr.births} 人，去世 ${S.yr.deaths} 人（大多是年纪大了）。`]);
  $('#finds').innerHTML='';out.slice(0,7).forEach(([t,x])=>{const li=document.createElement('li');li.className=t;li.textContent=x;$('#finds').append(li)})}
function renderNews(){$('#news').innerHTML=S.news.slice(0,60).map(n=>`<li class="${n.type}"><span class="t">${Sim.when(n.t)}</span>${n.txt}</li>`).join('')||'<li>还没有新闻。</li>'}
function addLog(role,title,ex,pred){S.log.unshift({t:S.t,role,title,ex:ex||'',pred:pred||''});renderLog()}
function renderLog(){const el=$('#log');el.innerHTML='';S.log.forEach(e=>{const li=document.createElement('li');li.innerHTML=`<span class="rtag ${e.role}">${e.role==='kid'?'小朋友':e.role==='parent'?'爸爸妈妈':'世界'}</span><span class="t">${Sim.when(e.t)}</span>`;
  const b=document.createElement('b');b.textContent=e.title;li.append(b);if(e.ex){const x=document.createElement('span');x.className='ex';x.textContent=e.ex;li.append(x)}if(e.pred){const x=document.createElement('span');x.className='ex';x.textContent='预测：'+e.pred;li.append(x)}el.append(li)})}

// ================= controls =================
function tick(){Sim.step();if(S.t%52===0)S.byYrAgo=S.cnt.by['饥饿']||0;spawnTraders();render()}
function loop(){if(!running)return;tick();timer=setTimeout(loop,tickMs())}
function setRun(v){running=v;$('#play').textContent=v?'⏸ 暂停':'▶ 开始';clearTimeout(timer);if(v)timer=setTimeout(loop,150)}
$('#play').onclick=()=>setRun(!running);$('#stepBtn').onclick=()=>tick();
$('#speed').onclick=e=>{speed=speed===1?2:speed===2?4:speed===4?8:1;e.target.textContent=`速度 ${speed}×`};
$('#reset').onclick=()=>{const p={...S.P};start(p);addLog('sys','从头开始','用现在的规则重新开始。');render()};
function syncUI(){const P=S.P;document.querySelectorAll('#modes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===P.mode)));
  $('#kind').value=Math.round(P.kindness*100);$('#kindOut').textContent=Math.round(P.kindness*100)+'%';$('#print').value=Math.round(P.printRate*100);$('#printOut').textContent=Math.round(P.printRate*100)+'%';$('#printRow').hidden=P.mode!=='money';
  $('#staff').value=P.hubStaff;$('#staffOut').textContent=P.hubStaff+'人';document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',String(!!P[b.dataset.k])))}
function mkChips(id,list,role){const el=$('#'+id);list.forEach(([k,n])=>{const b=document.createElement('button');b.className='chip';b.dataset.k=k;b.textContent=n;b.onclick=()=>{const v=!S.P[k];Sim.setP({[k]:v});syncUI();addLog(role,(v?'打开：':'关掉：')+n);render()};el.append(b)})}
mkChips('kidChips',KID,'kid');mkChips('parentChips',PARENT,'parent');
document.querySelectorAll('#modes button').forEach(b=>b.onclick=()=>{if(S.P.mode===b.dataset.mode)return;Sim.setP({mode:b.dataset.mode});syncUI();addLog(b.dataset.mode==='free'?'kid':'parent','交换方式改成：'+MODE_N[b.dataset.mode]);render()});
const sl=(id,k,div,role,label,unit)=>{const el=$('#'+id);el.oninput=()=>{Sim.setP({[k]:el.value/div});syncUI()};el.onchange=()=>{addLog(role,`${label}：${el.value}${unit}`);render()}};
sl('kind','kindness',100,'kid','自觉程度','%');sl('print','printRate',100,'parent','每月印钱','%');sl('staff','hubStaff',1,'parent','补给中心人手','人');

// ================= ideas: Claude, or keywords =================
let role='kid',sample=null;
document.querySelectorAll('.who-toggle button').forEach(b=>b.onclick=()=>{role=b.dataset.r;document.querySelectorAll('.who-toggle button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});
const KEYS={mode:'"free"(不要钱想要就拿)|"barter"(以物易物)|"labor"(劳动积分)|"money"(用钱买卖)',kindness:'0到1，大家有多自觉',printRate:'0到0.3，用钱时每月新印钱占总钱数的比例',hubStaff:'8到40，补给中心人数',
  needFirst:'布尔，中心先给最需要的人',share:'布尔，邻居和隔壁世界互相帮忙',freedom:'布尔，想干嘛就干嘛（12%的人不干活去玩，更开心）',migrate:'布尔，不开心可以搬家',reputation:'布尔，谁干了多少活大家都看得见（减少偷懒）',priceCap:'布尔，规定价格不许涨（用钱/积分时）',
  greed:'布尔，人性：都想多拿一点',freeRide:'布尔，拿不到好处就有人偷懒',disasters:'布尔，随机天灾',contagion:'布尔，传染病会在集市上传开',distance:'布尔，角落世界路远',corruption:'布尔，补给中心的人有私心'};
function applyIdea(o,r,fromChat){const ch=o&&o.changes||{},done=[],patch={};
  for(const k in ch){if(!(k in KEYS))continue;let v=ch[k];
    if(k==='mode'){if(MODE_N[v]){patch.mode=v;done.push('交换方式→'+MODE_N[v])}}
    else if(typeof DEF[k]==='boolean'){patch[k]=!!v;done.push((ALLN[k]||k)+(v?' 开':' 关'))}
    else{v=Number(v);if(!isFinite(v))continue;if(k==='kindness'){if(v>1)v/=100;patch[k]=clamp(v,0,1);done.push('自觉程度→'+pct(patch[k]))}
      if(k==='printRate'){if(v>1)v/=100;patch[k]=clamp(v,0,0.3);done.push('每月印钱→'+pct(patch[k]))}if(k==='hubStaff'){patch[k]=Math.round(clamp(v,8,40));done.push('中心人手→'+patch[k])}}}
  Sim.setP(patch);
  const evs=Array.isArray(o&&o.events)?o.events:o&&o.event?[o.event]:[];evs.forEach(ev=>{if(!ev||!EVN[ev.type])return;const ws=ev.world==='all'?S.worlds.filter(w=>w.id!=='hub'):S.worlds.filter(w=>w.id===ev.world);
    (ws.length?ws:[S.worlds[(Math.random()*8)|0]]).forEach(w=>Sim.trigger2(w,ev.type));done.push(`${ev.world==='all'?'所有世界':(ws[0]||{}).name||'一个世界'}：${EVN[ev.type]}`)});
  syncUI();addLog(r,(fromChat?'（对话里提出）':'')+(o&&o.title||'新的想法'),((o&&o.explain)||'')+(done.length?`（改动：${done.join('，')}）`:'（游戏里还没有能对应的规则）'),o&&o.predict||'');render()}
function keywordIdea(t){const ch={},events=[];const has=(...a)=>a.some(x=>t.includes(x));const wid=Sim.WORLDS.find(w=>t.includes(w.name)||t.includes(w.name.slice(-2)));
  if(has('印钱','印钞','印很多','发钱'))Object.assign(ch,{mode:'money',printRate:has('很多','大量','好多','拼命')?0.2:0.05});
  else if(has('以物易物','物物交换','换东西'))ch.mode='barter';else if(has('积分','工分','按劳','时间银行'))ch.mode='labor';else if(has('用钱','货币','买卖'))ch.mode='money';else if(has('不要钱','免费','想要就拿','随便拿'))ch.mode='free';
  if(has('善良','自觉','好心','只拿需要'))ch.kindness=0.9;if(has('自私','多拿','贪','抢'))ch.greed=true;if(has('偷懒','不干活','懒','磨洋工'))ch.freeRide=true;
  if(has('看得见','公开','记录','监督'))ch.reputation=true;if(has('邻居','互相帮','分享','帮忙'))ch.share=true;if(has('搬家','迁徙','搬去','移民'))ch.migrate=true;
  if(has('想干嘛','自由','玩','画画'))ch.freedom=true;if(has('最需要','按需','先给'))ch.needFirst=true;if(has('不许涨','限价','不准涨','规定价格'))ch.priceCap=true;
  if(has('传染','集市传','疫情'))ch.contagion=true;if(has('路远','运输','距离','走路'))ch.distance=true;if(has('私心','贪污','腐败','偏心'))ch.corruption=true;
  if(has('人手','工人','加人','扩大'))ch.hubStaff=30;if(has('天灾'))ch.disasters=true;
  for(const[k,v]of[['干旱','drought'],['旱','drought'],['山火','fire'],['火灾','fire'],['风暴','storm'],['台风','storm'],['塌方','collapse'],['蝗','locust'],['瘟疫','plague'],['生病','plague'],['丰收','bumper'],['寒冬','winter'],['特别冷','winter']])
    if(t.includes(k)){events.push({type:v,world:v==='winter'?'all':wid?wid.id:'all'});break}
  return{title:t.slice(0,16),changes:ch,events,explain:'按关键词理解了你的想法。',predict:''}}
(async()=>{try{if(window.claude&&window.claude.use)sample=await window.claude.use('sample')}catch(e){sample=null}
  $('#aiBar').hidden=!sample;$('#ideaNote').textContent=sample?'Claude 会把你的想法变成世界里的规则':'按关键词理解（在 Claude 里打开时，Claude 能理解任何想法）'})();
$('#ideaGo').onclick=async()=>{const ta=$('#ideaText'),t=ta.value.trim(),note=$('#ideaNote'),btn=$('#ideaGo');if(!t){note.textContent='先写下一个想法。';return}
  if(!sample){applyIdea(keywordIdea(t),role);ta.value='';return}
  btn.disabled=true;note.textContent='Claude 正在想…';
  const prompt=`你在帮忙运行一个给小朋友的社会模拟游戏“我的九宫世界”：3x3 九个格子，中间是补给中心（用草药做药、用矿石和木柴打铁器工具，也是粮仓和集市），周围八个世界：${Sim.WORLDS.map(w=>`${w.id}=${w.name}（${w.desc}）`).join('；')}。每个人都有名字、年龄、家庭、工作和性格，有四季、生老病死。
小朋友提出理想的假设，爸爸妈妈提出现实世界的制约。现在提想法的人是：${role==='kid'?'小朋友':'爸爸妈妈'}。
当前参数：${JSON.stringify(S.P)}
可以改的参数：${JSON.stringify(KEYS)}
可以触发的事件 type：drought 干旱 / storm 风暴 / fire 山火 / collapse 矿井塌方 / locust 蝗灾 / plague 瘟疫 / bumper 大丰收 / winter 寒冬；world 为上面的 id 或 "all"。
想法：“${t}”
把这个想法翻译成参数改动和事件。只改和想法有关的。只回复一个 JSON 对象：
{"title":"不超过12个字的短标题","changes":{"参数名":新值},"events":[],"explain":"用小朋友听得懂的话，1到2句说明你怎么理解这个想法、改了什么","predict":"1句话预测接下来可能发生什么，以及为什么"}
如果现有参数表达不了，就选最接近的，并在 explain 里说清楚游戏里还做不到哪部分。`;
  try{const o=await sample.json(prompt,{modelTier:'quick'});applyIdea(o&&typeof o==='object'?o:keywordIdea(t),role);ta.value='';note.textContent='已经放进世界里了。'}
  catch(e){if(e&&(e.code==='not_granted'||e.code==='sampling_disabled')){sample=null;$('#aiBar').hidden=true}applyIdea(keywordIdea(t),role);ta.value='';note.textContent=e&&e.code==='rate_limited'?'Claude 有点忙，先按关键词理解了。':'先按关键词理解了。'}
  finally{btn.disabled=false}};
$('#aiBtn').onclick=async()=>{if(!sample)return;const out=$('#aiOut'),btn=$('#aiBtn');out.hidden=false;out.textContent='Claude 正在看这个世界…';btn.disabled=true;
  const h=S.hist.filter((x,i)=>i%8===7||i===S.hist.length-1).slice(-30).map(x=>({周:x.t,模式:x.mode,人口:x.pop,吃饱:Math.round(x.kcov*100),健康:Math.round(x.health*100),开心:Math.round(x.happy*100),贫富:+x.gini.toFixed(2),苹果价:x.apple&&+x.apple.toFixed(2),没拿到:Math.round(x.unmet*100),鱼:Math.round(x.fish*100)}));
  const ws=S.wstat.map(w=>({名:S.worlds.find(o=>o.id===w.id).name,人口:w.pop,吃饱:Math.round(w.kcov*100),健康:Math.round(w.health*100),开心:Math.round(w.happy*100)}));
  const lg=S.log.slice(0,12).reverse().map(e=>`${Sim.when(e.t)} ${e.role==='kid'?'小朋友':e.role==='parent'?'家长':'世界'}：${e.title}`);
  const nw=S.news.slice(0,12).map(n=>n.txt);
  try{await sample(`你在给一个小朋友和家长解读社会模拟游戏“我的九宫世界”的结果。八个世界不用现代社会的钱、自给自足，中间补给中心提供药品和铁器工具；每个人有名字、年龄、性格，有四季和生老病死。
当前规则：${JSON.stringify(S.P)}
规则变化：${lg.join('；')}
最近的新闻：${nw.join('；')}
每两个月的数据：${JSON.stringify(h)}
现在各世界：${JSON.stringify(ws)}
死亡原因统计：${JSON.stringify(S.cnt.by)}
请用小朋友能听懂的中文写 5 到 7 句话：发生了什么、为什么（指出是哪条规则或哪种人性造成的），现实世界历史上有没有类似的事。最后提一个让小朋友想一想的问题。不要用标题和列表符号。`,{onText:({text})=>{out.textContent=text},cache:false})}
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
// swap only the rules: load the new simulation code, move the running world into it, keep everything else on screen as it is
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
function start(p){Sim.newGame(p||{},Math.floor(Math.random()*1e9));S=Sim.S;for(const k in folk)delete folk[k];fx.traders.length=0;cache.clear();for(let i=0;i<4;i++)Sim.step();syncUI()}
const ss=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},ssDel=k=>{try{sessionStorage.removeItem(k)}catch(e){}};
function boot(d){d=d||{};buildCharts();fit();let restored=false,wasRunning=null;
  try{const st=d.state||ss('jiugong:state');if(st){Sim.load(st);S=Sim.S;restored=true;wasRunning=d.state?d.running:ss('jiugong:run')!=='0'}}catch(e){restored=false}
  ssDel('jiugong:state');ssDel('jiugong:run');
  if(restored){syncUI();addLog('sys',`换上了第 ${BUILD} 版`,'代码更新了，世界接着跑，没有重来。')}
  else{start(LIVE.params||{});S.liveSeen=(LIVE.commands||[]).map(c=>c.id);
    addLog('sys','世界开始了',Object.keys(LIVE.params||{}).length?'按对话里最新的规则开始。':'小朋友的理想：不要钱，东西都交到补给中心，谁需要谁去拿。现在没有打开任何现实制约。');
    S.news.unshift({t:S.t,type:'info',txt:'春天到了，稻田村开始插秧，渔港的船出海了。'})}
  applyLive(LIVE);render();requestAnimationFrame(frame);
  let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{fit();render()},120)});
  const rethemes=()=>render();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',rethemes);new MutationObserver(rethemes).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  try{const ui=JSON.parse(ss('jiugong:ui')||'null');ssDel('jiugong:ui');if(ui&&restored){speed=ui.speed||1;$('#speed').textContent=`速度 ${speed}×`;sel=ui.sel||sel;selPerson=ui.selPerson||null;role=ui.role||role;
    document.querySelectorAll('.who-toggle button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.r===role)));if(ui.idea)$('#ideaText').value=ui.idea;setTab(ui.tab||'world');requestAnimationFrame(()=>scrollTo(0,ui.y||0))}}catch(e){}
  if(wasRunning!=null?wasRunning:!reduceMotion)setRun(true);
  // outside Claude the page watches GitHub; inside Claude the artifact is updated directly
  if(!window.claude)poll();else liveNote(`界面第 ${BUILD} 版 · 规则第 ${RULES} 版`)}
const hot=window.claude&&window.claude.hot;
try{if(hot&&hot.snapshot)hot.snapshot(()=>({state:Sim.save(),running}))}catch(e){}
if(hot&&hot.ready)hot.ready(boot);else boot(hot&&hot.data||{});
})();
