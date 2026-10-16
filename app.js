(()=>{const $=s=>document.querySelector(s),E=PCR.engine,P=PCR.precios;
const UN={jugar:'jugar',trabajar:'trabajar o estudiar',basico:'uso básico'},PN={eco:'Económico',mid:'Intermedio',alto:'Alto'};
const IC={cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',gpu:'<rect x="2" y="6" width="20" height="11" rx="2"/><circle cx="9" cy="11.5" r="3"/><circle cx="16" cy="11.5" r="2"/><path d="M5 20h6"/>',ram:'<rect x="2" y="7" width="20" height="9" rx="1.5"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3M6 10h3"/>',sto:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8" cy="16" r="1"/><path d="M12 8h5"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const SC=['home','uso','pres','load','res','err'],PG={home:0,uso:33,pres:66,load:90,res:100,err:0};
const st={uso:null,pres:null,type:'',res:[],busy:false,t:0};
function show(n){if(!(n in PG))n='home';SC.forEach(s=>{$('#s-'+s).hidden=s!==n});$('#pg').style.width=PG[n]+'%';window.scrollTo(0,0);const h=$('#s-'+n).querySelector('h1,h2');if(h&&h.focus)h.focus();}
function reset(){clearTimeout(st.t);Object.assign(st,{uso:null,pres:null,type:'',res:[],busy:false});show('home');}
function compute(){const r=E.pick(st.uso,st.pres,st.type);if(!r.length)throw new Error('sin resultados');st.res=r;}
function run(){if(st.busy)return;st.busy=true;show('load');const bar=$('#bar');bar.style.width='0';requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.width='100%'}));
 st.t=setTimeout(()=>{try{compute();renderRes();show('res')}catch(e){show('err')}st.busy=false},2000);}
const cb=c=>/Ryzen/.test(c)?'AMD':/Core/.test(c)?'Intel':'Procesador',gb=g=>/RTX|GeForce/.test(g)?'Nvidia':/Radeon|RX/.test(g)?'AMD':'Gráficos';
function card([b,lab],i){const sto=String(b.sto).split(' '),bud=E.budget(st.pres);
 return `<article class="card ${i?'':'main'}"><span class="badge">${lab}</span><h3>${b.n}</h3><div class="parts">
 <div class="pt">${ico('cpu')}<small>${cb(b.cpu)}</small><b>${b.cpu}</b></div>
 <div class="pt">${ico('gpu')}<small>${gb(b.gpu)}</small><b>${b.gpu}</b></div>
 <div class="pt">${ico('ram')}<small>Memoria</small><b>${String(b.ram).replace(' ','')}</b></div>
 <div class="pt">${ico('sto')}<small>${sto.slice(2).join(' ')||'Almacenamiento'}</small><b>${sto.slice(0,2).join('')}</b></div></div>
 <p class="line">👍 ${b.pr[0]}</p><p class="line">⚠️ ${b.co[0]}</p>${bud<b.b[0]?'<p class="line">💸 Puede costar más de lo que elegiste.</p>':''}
 <div class="pr" data-q="${b.q}"><b>Consultando precio…</b><small></small><a target="_blank" rel="noopener" href="${P.search(b.q)}">Buscar en Mercado Libre (enlace de búsqueda, no una publicación verificada)</a></div></article>`;}
const CH=[['','Automático'],['laptop','Laptop'],['desktop','Escritorio'],['tablet','Tablet']];
function renderRes(){const g=$('#s-res');
 g.innerHTML=`<h2 tabindex="-1">Tu PC ideal</h2><p class="sub">Para ${UN[st.uso]||''} · presupuesto ${PN[st.pres]||''}</p>
 <div class="chips" role="group" aria-label="Tipo de equipo">${CH.map(([v,t])=>`<button type="button" class="chip" data-act="type" data-v="${v}" aria-pressed="${st.type===v}">${t}</button>`).join('')}</div>
 ${st.type==='tablet'?'<div class="note">Una tablet tiene límites: pocos juegos y programas de PC, y sus piezas no se actualizan.</div>':''}
 <div class="res">${st.res.map(card).join('')}</div>
 <div class="row"><button type="button" class="btn" data-act="again">🔀 Otra opción</button><button type="button" class="btn" data-act="home">Volver a empezar</button></div>`;
 g.querySelectorAll('.pr').forEach(async el=>{try{const it=await P.get(el.dataset.q);if(!el.isConnected)return;const b=el.querySelector('b'),s=el.querySelector('small'),a=el.querySelector('a');
  if(it){b.textContent=P.fmt(it.mxn);s.textContent=`Precio publicado en México · consultado el ${it.date} · «${it.title}»`;a.href=it.url;a.textContent='Ver publicación en Mercado Libre';}
  else{b.textContent='Precio no confirmado';s.textContent='No se pudo consultar Mercado Libre. Recomendado por características.';}}catch(e){}});}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-act]');if(!b)return;e.preventDefault();const a=b.dataset.act,v=b.dataset.v||'';
 try{if(a==='home')reset();else if(a==='start')show('uso');else if(a==='goto')show(v);
  else if(a==='uso'){if(!(v in E.USOS))return;st.uso=v;show('pres');}
  else if(a==='pres'){if(!(v in E.PRES)||!st.uso){show('uso');return;}st.pres=v;run();}
  else if(a==='type'||a==='again'){if(a==='type')st.type=v;compute();renderRes();}
  else if(a==='retry'){st.uso&&st.pres?run():reset();}}
 catch(err){show('err');}});
show('home');})();
