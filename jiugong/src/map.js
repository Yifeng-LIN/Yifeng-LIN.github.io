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
  S.worlds.forEach(w=>{const working=w.working,n=Math.min(22,Math.ceil(working/3));
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
  // lone houses of the people who moved to a quiet corner of their own country
  S.worlds.forEach(w=>{const b={mountain:[0.9,0.1],village:[0.9,0.63],coast:[0.9,0.72]}[w.id];for(let k=0;k<(w.hermits||0);k++)house(cx,(b[0]-(k%3)*0.04)*SW,(b[1]+Math.floor(k/3)*0.025)*SH,SW*0.03,'#e9e0d0','#6b4a35',0)});
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
