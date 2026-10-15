const $=s=>document.querySelector(s),app=$('#app');
const USES=['Escuela','Trabajo','Gaming','Diseño o edición de video','Programación','Uso cotidiano','Gaming y trabajo'];
const HEAVY=/fortnite|gta|cyberpunk|warzone|call of duty|elden|red dead|starfield|hogwarts|baldur|forza|apex|valorant|rdr|witcher/i;
const S={step:0,type:null,uses:[],games:'',budget:15000,country:'MX',cmp:[],cur:'MXN',fx:null,lap:{},cfg:{cpu:'c3',gpu:'g2',mb:'m2',ram:'r2',sto:'s2',psu:'p3',case:'k2'},cfgOn:false};
const pc={},tx=(a,b)=>a.replace('{ram}',b.ram).replace('{sto}',b.sto);
const getPrice=q=>pc[q]??=fetch('/api/price?q='+encodeURIComponent(q)).then(r=>r.ok?r.json():Promise.reject()).catch(()=>null);
fetch('/api/fx').then(r=>r.ok?r.json():0).then(j=>{S.fx=j||null;paintAll()}).catch(()=>{});
const money=m=>{if(S.cur==='MXN')return m.toLocaleString('es-MX',{style:'currency',currency:'MXN'});const r=S.fx?.rates?.[S.cur];return r?(m*r).toLocaleString('es-MX',{style:'currency',currency:S.cur})+' (conversión)':'Conversión no disponible';};
function paint(el){const m=el.dataset.mxn;if(!m)return;el.textContent=money(+m);el.nextElementSibling.textContent=`Publicación en México: ${(+m).toLocaleString('es-MX',{style:'currency',currency:'MXN'})} · consultada el ${el.dataset.date}`+(S.cur!=='MXN'?` · tipo de cambio de ${S.fx?.date||'—'} (BCE vía Frankfurter)`:'')+` · «${el.dataset.title}»`;}
const paintAll=()=>document.querySelectorAll('.price').forEach(paint);
function priceBox(q){return `<div class="pr"><b class="price" data-q="${q}">Consultando precio…</b><small></small><a class="lnk" target="_blank" rel="noopener" href="https://listado.mercadolibre.com.mx/${encodeURIComponent(q.replace(/ /g,'-'))}">Buscar en Mercado Libre (enlace de búsqueda, no es una publicación verificada)</a></div>`;}
function hydrate(){document.querySelectorAll('.price[data-q]:not([data-done])').forEach(async el=>{el.dataset.done=1;const d=await getPrice(el.dataset.q),it=d?.items?.[0],a=el.parentElement.querySelector('.lnk');
 if(it){Object.assign(el.dataset,{mxn:it.price,date:d.fetchedAt,title:it.title.slice(0,70)});a.href=it.permalink;a.textContent='Ver publicación en Mercado Libre';paint(el);}
 else{el.textContent='Precio no confirmado';el.nextElementSibling.textContent='No se pudo consultar Mercado Libre (falta configurar el servidor o la fuente no respondió). Se recomienda por características.';}});}
const card=h=>`<section class="card">${h}</section>`;
const btn=(a,t,c='',x='')=>`<button class="btn ${c}" data-a="${a}" ${x}>${t}</button>`;
const types=[['laptop','💻 Laptop'],['desktop','🖥️ Computadora de escritorio'],['tablet','📱 Tablet'],['help','🤔 Ayúdame a elegir']];
function view(){
 if(S.step===0)app.innerHTML=card(`<p class="steps">Paso 1 de 3</p><h2>¿Qué equipo buscas?</h2><div class="grid">${types.map(([k,t])=>btn('type',t,'alt opt',`data-v="${k}"`)).join('')}</div>`);
 else if(S.step===1)app.innerHTML=card(`<p class="steps">Paso 2 de 3</p><h2>¿Para qué lo vas a usar?</h2><p>Puedes elegir varios.</p><div class="grid">${USES.map(u=>btn('use',u,S.uses.includes(u)?'on opt':'alt opt',`data-v="${u}" aria-pressed="${S.uses.includes(u)}"`)).join('')}</div>
  ${S.uses.some(u=>u.startsWith('Gaming'))?`<label for="gm">¿Qué juegos quieres usar?</label><input type="text" id="gm" value="${S.games}" placeholder="Ej. Minecraft, Fortnite, GTA V">`:''}
  <p>${btn('back','Atrás','alt')} ${btn('next1','Continuar','',S.uses.length?'':'disabled')}</p>`);
 else if(S.step===2)app.innerHTML=card(`<p class="steps">Paso 3 de 3</p><h2>Presupuesto y país</h2>
  <label for="bd">Presupuesto aproximado (MXN)</label><input type="number" id="bd" min="2000" step="500" value="${S.budget}">
  <label for="ct">País o mercado de compra</label><select id="ct">${[['MX','México'],['US','Estados Unidos'],['ES','España'],['CO','Colombia'],['AR','Argentina'],['CL','Chile'],['XX','Otro']].map(([c,n])=>`<option value="${c}" ${S.country===c?'selected':''}>${n}</option>`).join('')}</select>
  <div class="note"><b>¿Gráficos integrados o tarjeta dedicada?</b> Los <b>integrados</b> vienen dentro del procesador: ahorran dinero y energía y bastan para estudiar, trabajar y juegos ligeros. Una <b>tarjeta dedicada</b> es una pieza aparte, mucho más potente: sirve para juegos exigentes y edición de video, pero cuesta más y consume más. Te diremos cuál conviene según tus respuestas.</div>
  <p>${btn('back','Atrás','alt')} ${btn('go','Ver recomendaciones')}</p>`);
 else results();
 hydrate();paintAll();}
const uses=()=>{const u=new Set(S.uses);if(u.has('Gaming y trabajo')){u.add('Gaming');u.add('Trabajo');}return[...u];};
function recs(){const u=uses(),heavy=u.includes('Gaming')&&(!S.games||HEAVY.test(S.games)),light=u.includes('Gaming')&&S.games&&!HEAVY.test(S.games);
 let l=PROFILES.filter(p=>S.type==='help'||p.type===S.type);
 l=l.map(p=>{let s=p.tags.filter(t=>u.includes(t)).length*2;if(heavy&&p.gpu==='dedicada')s+=3;if(heavy&&p.gpu==='integrada'&&p.type!=='tablet')s-=3;if(p.type==='tablet'&&u.includes('Gaming'))s-=4;
  if(S.budget>=p.budget[0]&&S.budget<=p.budget[1]*1.15)s+=2;else if(S.budget<p.budget[0])s-=3;return{p,s};}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,S.type==='help'?4:3);
 return{l,heavy,light};}
function why(p,heavy,light){const r=[`Encaja con tu uso: ${p.tags.filter(t=>uses().includes(t)).join(', ')||'uso general'}.`];
 if(p.gpu==='dedicada')r.push(heavy?'Tus juegos son exigentes (o no indicaste cuáles), por eso conviene tarjeta dedicada.':'Aporta potencia extra para video o juegos; si no la necesitas, una integrada ahorra dinero.');
 else if(p.type!=='tablet')r.push(light?'Tus juegos son ligeros: los gráficos integrados bastan y ahorras presupuesto.':'Los gráficos integrados cubren tu uso y cuestan menos.');
 r.push(S.budget>=p.budget[0]?`Tu presupuesto (${S.budget.toLocaleString('es-MX')} MXN) alcanza para esta categoría; confirma con el precio publicado.`:'Tu presupuesto queda por debajo del rango habitual: revisa el precio real o considera algo más básico.');return r.join(' ');}
function results(){const{l,heavy,light}=recs(),other=S.type==='laptop'?'desktop':S.type==='desktop'?'laptop':null;
 app.innerHTML=card(`<h2>Tus recomendaciones</h2><p>${uses().join(' · ')} · presupuesto ${S.budget.toLocaleString('es-MX')} MXN${S.games?' · juegos: '+S.games:''}</p>
 ${S.country!=='MX'?'<div class="note">Los precios son de publicaciones de <b>Mercado Libre México</b>. En USD o EUR son conversiones del precio original en México; la disponibilidad y el envío a tu país pueden variar.</div>':''}
 ${(S.type==='tablet'||S.type==='help')?'<div class="note">Una tablet tiene límites: no ejecuta muchos juegos ni programas de PC y sus piezas no se actualizan.</div>':''}
 <p>${btn('edit','Editar respuestas','alt')} ${btn('reset','Reiniciar','alt')} ${other?btn('swap','Cambiar a '+(other==='desktop'?'computadora de escritorio':'laptop')):''}</p>`)+
 (l.length?l.map(({p})=>{const o=S.lap[p.id]??={ram:16,sto:'512gb'};const q=tx(p.query,o);return card(`<span class="tag">${p.type==='laptop'?'Laptop':p.type==='desktop'?'Escritorio':'Tablet'} · ${p.gpu==='dedicada'?'Gráfica dedicada':'Gráficos integrados'}</span><h3>${p.name}</h3>
 <p><b>Características:</b> ${tx(p.specs,o)}</p>${priceBox(q)}<p><b>Por qué:</b> ${why(p,heavy,light)}</p>
 <div class="pc"><div class="pro"><b>Ventajas</b><ul>${p.pros.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="con"><b>Desventajas</b><ul>${p.cons.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>
 <p><b>Actualización:</b> ${p.upg}</p>
 ${p.type==='laptop'?`<div class="grid"><div><label>RAM</label><select data-lap="${p.id}" data-k="ram">${[16,32].map(v=>`<option ${o.ram===v?'selected':''}>${v}</option>`).join('')}</select></div><div><label>Almacenamiento</label><select data-lap="${p.id}" data-k="sto">${['512gb','1tb'].map(v=>`<option ${o.sto===v?'selected':''}>${v}</option>`).join('')}</select></div></div><div class="note">Cambiar RAM o almacenamiento solo es posible si el modelo lo permite: muchas laptops delgadas traen la RAM soldada. Verifícalo en la ficha antes de comprar.</div>`:''}
 ${btn('cmp',S.cmp.includes(p.id)?'Quitar de la comparación':'Comparar',S.cmp.includes(p.id)?'on':'alt',`data-v="${p.id}"`)}`)}).join(''):card('<p>No encontramos una categoría que encaje con ese presupuesto y uso. Prueba subir el presupuesto o cambiar el tipo de equipo.</p>'))
 +compare()+(S.type==='desktop'||S.type==='help'?config():'')+ramInfo();}
function compare(){if(!S.cmp.length)return'';const l=S.cmp.map(id=>PROFILES.find(p=>p.id===id)),r=(t,f)=>`<tr><th>${t}</th>${l.map(p=>`<td>${f(p)}</td>`).join('')}</tr>`;
 return card(`<h2>Comparación (máx. 3)</h2><div class="scroll"><table>${r('Equipo',p=>p.name)}${r('Tipo',p=>p.type)}${r('Gráficos',p=>p.gpu)}${r('Características',p=>tx(p.specs,S.lap[p.id]||{ram:16,sto:'512gb'}))}${r('Precio',p=>priceBox(tx(p.query,S.lap[p.id]||{ram:16,sto:'512gb'})))}${r('Ventajas',p=>p.pros.join('; '))}${r('Desventajas',p=>p.cons.join('; '))}${r('Actualización',p=>p.upg)}</table></div>`);}
function check(){const g=k=>PARTS[k].find(x=>x.id===S.cfg[k]),c=g('cpu'),gp=g('gpu'),m=g('mb'),r=g('ram'),ps=g('psu'),k=g('case'),e=[],w=[];
 if(c.sock!==m.sock)e.push(`El procesador (${c.sock}) no encaja en la placa (${m.sock}).`);
 if(r.ram!==m.ram)e.push(`La RAM ${r.ram} no es compatible con la placa (${m.ram}).`);
 if(!k.fits.includes(m.ff))e.push(`La placa ${m.ff} no cabe en ${k.n}.`);
 if(!c.igpu&&gp.id==='g0')e.push('Este procesador no tiene gráficos integrados: necesitas tarjeta dedicada para tener imagen.');
 const need=c.w+gp.w+150;if(ps.w<need)e.push(`La fuente de ${ps.w} W es insuficiente; se sugiere al menos ${need} W (estimación orientativa).`);else if(ps.w<need+80)w.push('La fuente alcanza, pero queda justa para futuras mejoras.');
 return{e,w};}
function config(){const lb={cpu:'Procesador',gpu:'Tarjeta gráfica',mb:'Tarjeta madre',ram:'RAM',sto:'Almacenamiento',psu:'Fuente de poder',case:'Gabinete'};
 if(!S.cfgOn)return card(`<h2>Personaliza tu PC de escritorio</h2><p>Elige cada pieza y comprobaremos la compatibilidad.</p>${btn('cfg','Personalizar piezas')}`);
 const{e,w}=check();return card(`<h2>Tu PC de escritorio</h2><div class="grid">${Object.keys(lb).map(k=>`<div><label>${lb[k]}</label><select data-cfg="${k}">${PARTS[k].map(x=>`<option value="${x.id}" ${S.cfg[k]===x.id?'selected':''}>${x.n}</option>`).join('')}</select></div>`).join('')}</div>
 ${e.map(x=>`<div class="note err">❌ ${x}</div>`).join('')}${w.map(x=>`<div class="note">⚠️ ${x}</div>`).join('')}${e.length?'':'<div class="note okk">✅ Las piezas elegidas son compatibles.</div>'}
 <div class="grid">${Object.keys(lb).map(k=>{const x=PARTS[k].find(y=>y.id===S.cfg[k]);return `<div><b>${x.n}</b>${priceBox(x.n.replace(/\(.*\)/,'').replace('Sin tarjeta','').trim()||'tarjeta madre')}</div>`}).join('')}</div>`);}
const ramInfo=()=>card(`<h2>Precios de RAM y componentes</h2><p>Aquí solo se muestran precios actuales publicados en Mercado Libre México (cuando el servidor está configurado). Esta página <b>no guarda historial de precios</b>, por lo que no afirma que la RAM u otro componente haya subido o bajado. Si quieres esa comparación, necesitas una fuente con historial documentado.</p><div class="grid"><div><b>RAM 16 GB DDR4</b>${priceBox('memoria ram 16gb ddr4')}</div><div><b>RAM 16 GB DDR5</b>${priceBox('memoria ram 16gb ddr5')}</div></div>`);
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v;
 if(a==='type'){S.type=v;S.step=1;}
 else if(a==='use'){S.uses=S.uses.includes(v)?S.uses.filter(x=>x!==v):[...S.uses,v];view();$(`[data-v="${v}"]`)?.focus();return;}
 else if(a==='next1'){S.games=$('#gm')?.value||'';S.step=2;}
 else if(a==='back')S.step--;
 else if(a==='go'){S.budget=+$('#bd').value||15000;S.country=$('#ct').value;S.step=3;}
 else if(a==='edit'){S.step=1;S.cmp=[];}
 else if(a==='reset'){Object.assign(S,{step:0,type:null,uses:[],games:'',cmp:[],cfgOn:false});}
 else if(a==='swap'){S.type=S.type==='laptop'?'desktop':'laptop';S.cmp=[];}
 else if(a==='cmp'){if(S.cmp.includes(v))S.cmp=S.cmp.filter(x=>x!==v);else if(S.cmp.length<3)S.cmp.push(v);else alert('Puedes comparar hasta 3 recomendaciones.');}
 else if(a==='cfg')S.cfgOn=true;
 view();window.scrollTo({top:0,behavior:'smooth'});});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.cfg){S.cfg[t.dataset.cfg]=t.value;view();}
 else if(t.dataset.lap){S.lap[t.dataset.lap][t.dataset.k]=t.dataset.k==='ram'?+t.value:t.value;view();}
 else if(t.id==='cur'){S.cur=t.value;paintAll();}});
view();
