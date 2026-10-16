// Motor de recomendación (funciones puras sobre BUILDS). Presupuestos como enteros MXN orientativos.
window.PCR=window.PCR||{};
PCR.engine=(()=>{
 const PRES={eco:10000,mid:22000,alto:45000},
  USOS={jugar:{g:3,e:0,w:0,p:0},trabajar:{g:0,e:0,w:3,p:1},basico:{g:0,e:0,w:1,p:1.5}};
 function score(b,n,bud,gaming){const t=n.g+n.e+n.w+n.p||1;let s=(b.s.g*n.g+b.s.e*n.e+b.s.w*n.w+b.s.p*n.p)/t;
  if(gaming&&b.gk==='ded')s+=8;if(gaming&&b.t==='tablet')s-=30;if(!gaming&&b.gk==='ded')s-=14;
  const lo=b.b[0],hi=b.b[1];if(bud<lo)s-=(lo-bud)/lo*90;else if(bud>hi*1.4)s-=8;return s;}
 // type: ''(auto: laptop o escritorio) | laptop | desktop | tablet. Devuelve [[build,etiqueta],...]
 function pick(uso,pres,type){
  const n=USOS[uso]||USOS.basico,bud=Number.isInteger(PRES[pres])?PRES[pres]:PRES.mid,list=Array.isArray(window.BUILDS)?window.BUILDS:[];
  const l=list.filter(b=>type?b.t===type:b.t!=='tablet').map(b=>({b,s:score(b,n,bud,n.g>0)+Math.random()*7})).sort((x,y)=>y.s-x.s);
  if(!l.length)return[];const r=l[0],alt=l.slice(1).find(x=>x.b.v!==r.b.v)||l[1];
  return[[r.b,'Recomendado'],...(alt?[[alt.b,'Alternativa']]:[])];}
 return{pick,PRES,USOS,budget:p=>PRES[p]};})();
