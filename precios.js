// Precios: siempre enteros en MXN en la lógica; el formato de moneda solo se aplica al mostrar.
window.PCR=window.PCR||{};
PCR.precios=(()=>{const c={};
 const fmt=n=>Number.isFinite(n)?n.toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}):'';
 const search=q=>'https://listado.mercadolibre.com.mx/'+encodeURIComponent(String(q).replace(/ /g,'-'));
 const get=q=>c[q]??=fetch('/api/price?q='+encodeURIComponent(q)).then(r=>r.ok?r.json():null).catch(()=>null).then(d=>{
  const it=(d&&d.items||[]).find(i=>Number.isFinite(+i.price)&&+i.price>0&&i.permalink);
  return it?{mxn:Math.round(+it.price),date:d.fetchedAt,title:String(it.title||'').slice(0,60),url:it.permalink}:null;});
 return{get,fmt,search};})();
