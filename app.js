const $=s=>document.querySelector(s),app=$('#app');
const USES=[['Escuela','🎓'],['Trabajo','💼'],['Gaming','🎮'],['Diseño o edición de video','🎬'],['Programación','⌨️'],['Uso cotidiano','🏠'],['Gaming y trabajo','⚡']];
const TYPES=[['laptop','Laptop','💻'],['desktop','Escritorio','🖥️'],['tablet','Tablet','📱'],['help','Ayúdame a elegir','✨']];
const PRIO=[['perf','Rendimiento','🚀'],['mid','Equilibrio','⚖️'],['look','Estética y portabilidad','🪶']];
const GAMES=[['light','Ligeros','Minecraft, LoL, Valorant'],['heavy','Exigentes','GTA V, Fortnite, Cyberpunk'],['any','Aún no lo sé','']];
const BUD=[5000,10000,15000,25000,40000,60000],COUNTRIES=[['MX','México'],['US','Estados Unidos'],['ES','España'],['CO','Colombia'],['AR','Argentina'],['CL','Chile'],['XX','Otro']];
const S={i:0,a:{type:null,uses:[],games:null,prio:'mid',budget:15000,country:'MX'},cmp:[],res:null};
const IC={cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',gpu:'<rect x="2" y="6" width="20" height="11" rx="2"/><circle cx="9" cy="11.5" r="3"/><circle cx="16" cy="11.5" r="2"/><path d="M5 20h6"/>',ram:'<rect x="2" y="7" width="20" height="9" rx="1.5"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3M6 10h3"/>',sto:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8" cy="16" r="1"/><path d="M12 8h5"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const steps=()=>['type','uses',...(S.a.uses.some(u=>u.startsWith('Gaming'))?['games']:[]),'prio','budget'];
// --- precios (misma API del servidor) ---
const pc={},getPrice=q=>pc[q]??=fetch('/api/price?q='+encodeURIComponent(q)).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null);
const mx=m=>(+m).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
function paint(el){const m=el.dataset.mxn;if(!m)return;el.textContent=mx(m)+' MXN';el.nextElementSibling.textContent=`Precio publicado en Mercado Libre México · consultado el ${el.dataset.date} · «${el.dataset.title}»`;}
const paintAll=()=>document.querySelectorAll('.price').forEach(paint);
const priceBox=q=>`<div class="pr"><b class="price" data-q="${q}">Consultando precio…</b><small></small><a class="lnk" target="_blank" rel="noopener" href="https://listado.mercadolibre.com.mx/${encodeURIComponent(q.replace(/ /g,'-'))}">Buscar en Mercado Libre (enlace de búsqueda, no es una publicación verificada)</a></div>`;
function hydrate(){document.querySelectorAll('.price[data-q]:not([data-done])').forEach(async el=>{el.dataset.done=1;const d=await getPrice(el.dataset.q),it=d?.items?.[0],a=el.parentElement.querySelector('.lnk');
 if(it){Object.assign(el.dataset,{mxn:it.price,date:d.fetchedAt,title:it.title.slice(0,60)});a.href=it.permalink;a.textContent='Ver publicación en Mercado Libre';paint(el);}
 else{el.textContent='Precio no confirmado';el.nextElementSibling.textContent='No se pudo consultar Mercado Libre. Recomendado por características.';}});}
// --- lógica de recomendación ---
function need(){const u=new Set(S.a.uses);if(u.has('Gaming y trabajo')){u.add('Gaming');u.add('Trabajo');}const n={g:0,e:0,w:0,p:0};
 if(u.has('Gaming'))n.g+=3;if(u.has('Diseño o edición de video'))n.e+=3;if(u.has('Trabajo'))n.w+=2;if(u.has('Programación'))n.w+=2;if(u.has('Escuela')){n.w++;n.p+=1.5}if(u.has('Uso cotidiano')){n.w++;n.p++}return n;}
function score(b,n,A){const t=n.g+n.e+n.w+n.p||1;let s=(b.s.g*n.g+b.s.e*n.e+b.s.w*n.w+b.s.p*n.p)/t;
 s+={perf:(b.s.g+b.s.e)/8,look:b.a*.3,mid:0}[A.prio];
 if(n.g&&A.games==='heavy')s+=b.gk==='ded'?10:-15;if(n.g&&A.games==='light'&&b.gk==='int')s+=6;if(n.g&&b.t==='tablet')s-=30;if(!n.g&&!n.e&&b.gk==='ded')s-=14;
 const[lo,hi]=b.b;if(A.budget<lo)s-=(lo-A.budget)/lo*90;else if(A.budget>hi*1.4)s-=8;return s;}
function pick(){const n=need(),A=S.a;
 const l=BUILDS.filter(b=>A.type==='help'||b.t===A.type).map(b=>({b,s:score(b,n,A)+Math.random()*7})).sort((x,y)=>y.s-x.s);
 const r=l[0],alt=l.slice(1).find(x=>x.b.v!==r.b.v)||l[1],th=l.find(x=>x!==r&&x!==alt);
 S.res=[[r,'Recomendado'],[alt,'Alternativo'],[th,'Otra opción']].filter(x=>x[0]).map(([x,t])=>[x.b,t]);}
function why(b){const A=S.a,u=A.uses.filter(x=>x!=='Gaming y trabajo').join(', ')||A.uses.join(', '),r=[];
 r.push(b.gk==='ded'?'Gráfica dedicada: más potencia para juegos y video, pero cuesta más.':b.t==='tablet'?'Tablet: portátil, con límites en juegos y programas.':'Gráficos integrados: ahorras y bastan para estudio, trabajo y juegos ligeros.');
 if(A.budget<b.b[0])r.push('⚠️ Suele costar más que tu presupuesto.');return `<p class="why"><b>Encaja con:</b> ${u}</p><p class="why">${r.join(' ')}</p>`;}
// --- vistas ---
const tile=(a,v,t,on,x='')=>`<button class="t ${on?'on':''}" data-a="${a}" data-v="${v}" aria-pressed="${!!on}">${x?`<span>${x}</span>`:''}${t}</button>`;
function view(){const st=steps(),id=st[S.i];$('#pg').style.width=(id?(S.i/st.length*100):100)+'%';const A=S.a,back=S.i?`<button class="btn" data-a="back">Atrás</button>`:'';let h='';
 if(id==='type')h=`<h2>¿Qué equipo buscas?</h2><div class="tiles">${TYPES.map(([k,t,e])=>tile('type',k,t,A.type===k,e)).join('')}</div>`;
 if(id==='uses')h=`<h2>¿Para qué lo vas a usar?</h2><p class="sub">Elige uno o varios.</p><div class="tiles">${USES.map(([k,e])=>tile('use',k,k,A.uses.includes(k),e)).join('')}</div><div class="row">${back}<button class="btn p" data-a="next" ${A.uses.length?'':'disabled'}>Continuar</button></div>`;
 if(id==='games')h=`<h2>¿Qué tipo de juegos?</h2><div class="tiles">${GAMES.map(([k,t,d])=>tile('games',k,`<b>${t}</b><br><small>${d}</small>`,A.games===k)).join('')}</div><div class="row">${back}</div>`;
 if(id==='prio')h=`<h2>¿Rendimiento o estética?</h2><div class="tiles">${PRIO.map(([k,t,e])=>tile('prio',k,t,A.prio===k,e)).join('')}</div><div class="row">${back}</div>`;
 if(id==='budget')h=`<h2>¿Cuál es tu presupuesto?</h2><p class="sub">En pesos mexicanos (MXN).</p><div class="tiles">${BUD.map(b=>tile('bud',b,mx(b).replace('.00',''),A.budget===b)).join('')}</div>
  <div class="row"><label>Otro monto <input type="number" id="bd" min="2000" step="500" value="${A.budget}" style="width:130px"></label><label>País <select id="ct">${COUNTRIES.map(([c,n])=>`<option value="${c}" ${A.country===c?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="row">${back}<button class="btn p" data-a="go">Ver recomendaciones</button></div>`;
 if(!id)return results();app.innerHTML=`<div class="fx">${h}</div>`;}
function card([b,lab],i){const n=S.cmp.includes(b.id),bars=[['Juegos','g'],['Edición','e'],['Trabajo','w'],['Portátil','p']];
 return `<article class="rc ${i?'':'best'}"><span class="badge">${lab}</span><span class="tg">${{laptop:'Laptop',desktop:'Escritorio',tablet:'Tablet'}[b.t]} · ${b.v}</span><h3>${b.n}</h3>
 <ul class="parts"><li>${ico('cpu')}${b.cpu}</li><li>${ico('gpu')}${b.gpu}</li><li>${ico('ram')}${b.ram}</li><li>${ico('sto')}${b.sto}</li></ul>
 <div class="bars">${bars.map(([t,k])=>`<div>${t}<i><b data-w="${b.s[k]}"></b></i></div>`).join('')}</div>${priceBox(b.q)}${why(b)}
 <div class="pc"><div class="pro"><b>Ventajas</b><ul>${b.pr.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="con"><b>Desventajas</b><ul>${b.co.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
 <p class="why"><b>Mejoras:</b> ${b.up}</p><button class="t" data-a="cmp" data-v="${b.id}" aria-pressed="${n}" style="padding:.5rem .8rem;${n?'border-color:var(--a2)':''}">${n?'✓ En comparación':'Comparar'}</button></article>`;}
function compare(){if(!S.cmp.length)return'';const l=S.cmp.map(id=>BUILDS.find(b=>b.id===id)),r=(t,f)=>`<tr><th>${t}</th>${l.map(b=>`<td>${f(b)}</td>`).join('')}</tr>`;
 return `<h2 style="font-size:1.3rem;margin-top:1.5rem">Comparación (máx. 3)</h2><div class="sc"><table>${r('Equipo',b=>b.n)}${r('Procesador',b=>b.cpu)}${r('Gráficos',b=>b.gpu)}${r('RAM / Disco',b=>b.ram+' · '+b.sto)}${r('Juegos / Edición',b=>b.s.g+' / '+b.s.e)}${r('Precio',b=>priceBox(b.q))}${r('Ventajas',b=>b.pr.join('; '))}${r('Desventajas',b=>b.co.join('; '))}${r('Mejoras',b=>b.up)}</table></div>`;}
function results(){if(!S.res)pick();const A=S.a,o=A.type==='laptop'?'desktop':A.type==='desktop'?'laptop':null;
 app.innerHTML=`<div class="fx"><h2>Tus recomendaciones</h2><p class="sub">${A.uses.join(' · ')} · ${mx(A.budget).replace('.00','')}</p>
 ${A.country!=='MX'?'<div class="note">Todos los precios son en pesos mexicanos de Mercado Libre México. La disponibilidad y el envío a tu país pueden variar.</div>':''}
 ${(A.type==='tablet'||A.type==='help')?'<div class="note">Una tablet tiene límites: pocos juegos y programas de PC, y sus piezas no se actualizan.</div>':''}
 <div class="row"><button class="btn" data-a="edit">Editar respuestas</button><button class="btn" data-a="reset">Reiniciar</button><button class="btn" data-a="again">🔀 Otras variaciones</button>${o?`<button class="btn p" data-a="swap">Cambiar a ${o==='desktop'?'escritorio':'laptop'}</button>`:''}</div>
 <div class="res">${S.res.map(card).join('')}</div>${compare()}
 <div class="note">Esta página no guarda historial de precios, así que no afirma que la RAM u otro componente haya subido. Solo muestra el precio publicado hoy.</div></div>`;
 requestAnimationFrame(()=>document.querySelectorAll('.bars b').forEach(e=>e.style.width=e.dataset.w+'%'));}
const render=()=>{view();hydrate();paintAll();};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v,A=S.a,adv=()=>{S.i++};
 if(a==='type'){A.type=v;adv();}
 else if(a==='use'){A.uses=A.uses.includes(v)?A.uses.filter(x=>x!==v):[...A.uses,v];render();return;}
 else if(a==='next')adv();
 else if(a==='games'){A.games=v;adv();}
 else if(a==='prio'){A.prio=v;adv();}
 else if(a==='bud'){A.budget=+v;A.country=$('#ct').value;S.res=null;adv();}
 else if(a==='go'){A.budget=Math.max(2000,+$('#bd').value||15000);A.country=$('#ct').value;S.res=null;adv();}
 else if(a==='back')S.i--;
 else if(a==='edit'){S.i=0;S.cmp=[];S.res=null;}
 else if(a==='reset'){Object.assign(S,{i:0,cmp:[],res:null});Object.assign(A,{type:null,uses:[],games:null,prio:'mid'});}
 else if(a==='again'){pick();}
 else if(a==='swap'){A.type=A.type==='laptop'?'desktop':'laptop';S.cmp=[];pick();}
 else if(a==='cmp'){if(S.cmp.includes(v))S.cmp=S.cmp.filter(x=>x!==v);else if(S.cmp.length<3)S.cmp.push(v);else alert('Puedes comparar hasta 3 equipos.');render();return;}
 render();window.scrollTo({top:0,behavior:'smooth'});});
render();
