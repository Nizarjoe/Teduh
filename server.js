const http=require('http'),fs=require('fs'),path=require('path');
const DIST=path.join(__dirname,'public');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp'};
http.createServer((req,res)=>{
  let f=path.join(DIST,req.url==='/'?'index.html':req.url);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(DIST,'index.html');
  res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
}).listen(8100,()=>console.log('extrime-store on :8100'));
