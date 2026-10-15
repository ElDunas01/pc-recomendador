// Servidor sin dependencias (Node 18+). Uso: ML_ACCESS_TOKEN=xxx node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const TOKEN=process.env.ML_ACCESS_TOKEN, PORT=process.env.PORT||3000, cache=new Map();
const TYPES={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
async function cached(key,ttl,fn){const c=cache.get(key);if(c&&Date.now()-c.t<ttl)return c.v;const v=await fn();cache.set(key,{t:Date.now(),v});return v;}
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x'),send=(c,b,t='application/json')=>{res.writeHead(c,{'Content-Type':t});res.end(typeof b==='string'||Buffer.isBuffer(b)?b:JSON.stringify(b));};
 try{
  if(u.pathname==='/api/fx'){ // Frankfurter (BCE): tipos de cambio de referencia, sin clave
   return send(200,await cached('fx',36e5,async()=>{const r=await fetch('https://api.frankfurter.dev/v1/latest?base=MXN&symbols=USD,EUR');if(!r.ok)throw 0;return r.json();}));}
  if(u.pathname==='/api/price'){ // API oficial de Mercado Libre; requiere token OAuth (el token nunca llega al navegador)
   if(!TOKEN)return send(503,{error:'ML_ACCESS_TOKEN no configurado'});
   const q=(u.searchParams.get('q')||'').slice(0,120);
   return send(200,await cached('p:'+q,18e5,async()=>{const r=await fetch('https://api.mercadolibre.com/sites/MLM/search?limit=5&q='+encodeURIComponent(q),{headers:{Authorization:'Bearer '+TOKEN}});if(!r.ok)throw 0;const j=await r.json();
    return{fetchedAt:new Date().toISOString().slice(0,10),items:(j.results||[]).filter(i=>i.price&&i.permalink).map(i=>({title:i.title,price:i.price,currency:i.currency_id,permalink:i.permalink}))};}));}
  const f=path.join(__dirname,path.normalize(u.pathname==='/'?'/index.html':u.pathname).replace(/^(\.\.[/\\])+/,''));
  if(!f.startsWith(__dirname)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return send(404,'No encontrado','text/plain');
  send(200,fs.readFileSync(f),TYPES[path.extname(f)]||'text/plain');
 }catch(e){send(502,{error:'Fuente no disponible'});}
}).listen(PORT,()=>console.log('http://localhost:'+PORT+(TOKEN?'':'  (sin ML_ACCESS_TOKEN: precios no confirmados)')));
