const http=require('http'),fs=require('fs'),path=require('path');
const DIST=path.join(__dirname,'public');
const UPDIR=path.join(__dirname,'uploads');
if(!fs.existsSync(UPDIR))fs.mkdirSync(UPDIR,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp','.gif':'image/gif'};
const MAXB=5*1024*1024; // 5 MB
function body(req,cb){let d=[];let n=0;req.on('data',c=>{n+=c.length;if(n>MAXB+10000){req.destroy();return}d.push(c)});req.on('end',()=>cb(Buffer.concat(d)));}
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
const server=http.createServer((req,res)=>{
  const u=req.url.split('?')[0].toLowerCase();
// === DATA STORE (produksi sederhana: data.json) ===
const DATAF=path.join(__dirname,'data','store.json');
if(!fs.existsSync(path.join(__dirname,'data')))fs.mkdirSync(path.join(__dirname,'data'));
if(!fs.existsSync(DATAF))fs.writeFileSync(DATAF,JSON.stringify({orders:[],products:[],content:{ann:'Gratis ongkir setiap pembelian minimal Rp 500.000',annOn:true,coupons:[],heroImg:'',bannerImg:'',qrisImg:''},settings:{waOwner:'6285165859837',waAdmin:'6285165859837',payment:{gateway:'midtrans',mode:'sandbox',qris:null,clientKey:'',merchantId:'',clientFallback:true,bank:{nama:'BCA',no:'1234567890',an:'TEDUH STORE'}}}}));
function readData(){return JSON.parse(fs.readFileSync(DATAF,'utf8'))}
function writeData(d){fs.writeFileSync(DATAF,JSON.stringify(d,null,1))}
if(req.method==='POST'&&u==='/api/order'){
  body(req,buf=>{
    try{
      const o=JSON.parse(buf.toString());
      if(!o.nama||!o.wa||!o.item)return json(res,400,{ok:false,err:'Data tidak lengkap'});
      const d=readData();
      o.id='EXT-'+(1000+d.orders.length+1);
      o.tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short'});
      o.st='Baru';
      o.paySt=(o.bayar==='COD')?'COD (bayar di tempat)':'Belum Bayar';
      o.paidAt=null;
      d.orders.unshift(o);
      writeData(d);
      json(res,200,{ok:true,id:o.id});
    }catch(e){json(res,400,{ok:false,err:'Payload invalid'})}
  });
  return;
}
if(req.method==='POST'&&u==='/api/pay/verify'){
  body(req,buf=>{
    try{
      const {id,st}=JSON.parse(buf.toString());
      const d=readData();
      const o=d.orders.find(x=>x.id===id);
      if(!o)return json(res,404,{ok:false,err:'Order tidak ditemukan'});
      o.paySt=st;
      if(st==='Lunas')o.paidAt=new Date().toISOString();
      writeData(d);
      json(res,200,{ok:true});
    }catch(e){json(res,400,{ok:false,err:'Payload invalid'})}
  });
  return;
}
if(req.method==='GET'&&u==='/api/data'){
  const d=readData();
  return json(res,200,{ok:true,orders:d.orders,products:d.products,content:d.content,settings:{waOwner:d.settings.waOwner,waAdmin:d.settings.waAdmin,payment:{gateway:d.settings.payment.gateway,mode:d.settings.payment.mode,clientFallback:d.settings.payment.clientFallback,bank:d.settings.payment.bank}}});
}
if(req.method==='POST'&&u==='/api/data'){
  body(req,buf=>{
    try{
      const patch=JSON.parse(buf.toString());
      const d=readData();
      if(patch.orders)d.orders=patch.orders;
      if(patch.products)d.products=patch.products;
      if(patch.settings)Object.assign(d.settings,patch.settings);
      if(patch.content)Object.assign(d.content,patch.content);
      writeData(d);
      json(res,200,{ok:true});
    }catch(e){json(res,400,{ok:false,err:'Payload invalid'})}
  });
  return;
}
// Midtrans Snap token (sandbox) — server-side
if(req.method==='POST'&&u==='/api/pay/token'){
  body(req,buf=>{
    try{
      const {amount,orderId}=JSON.parse(buf.toString());
      const d=readData();
      const d0=readData();
      const key=d0.settings.payment.midtransServerKey||'';
      if(!key){
        const fb={mode:'fallback',reason:'server_key_kosong'};
        if(d0.content&&d0.content.qrisImg)fb.qris=d0.content.qrisImg;
        if(d0.settings.payment.bank)fb.bank=d0.settings.payment.bank;
        fb.msg='Midtrans belum aktif — fallback: '+(fb.qris?'QRIS':'Transfer Bank')+' / COD';
        return json(res,200,{ok:false,...fb});
      }
      const auth=Buffer.from(key+':').toString('base64');
      const opt={method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Authorization':'Basic '+auth},
        body:JSON.stringify({transaction_details:{order_id:orderId||('EXT-'+Date.now()),gross_amount:Math.max(1,Math.round(amount))}})};
      fetch('https://app.sandbox.midtrans.com/snap/v1/transactions',opt)
        .then(r=>r.json()).then(j=>json(res,200,{ok:true,...j}))
        .catch(e=>json(res,502,{ok:false,err:String(e)}));
    }catch(e){json(res,400,{ok:false,err:'Payload invalid'})}
  });
  return;
}

  const ext=path.extname(u);
  // === UPLOAD endpoint (POST /api/upload) ===
  if(req.method==='POST'&&u==='/api/upload'){
    body(req,buf=>{
      if(!buf.length||buf.length>MAXB)return json(res,413,{ok:false,err:'Ukuran maksimal 5 MB'});
      // sniff tipe dari magic bytes
      let e=null;
      if(buf.slice(0,8).toString('hex')==='89504e470d0a1a0a')e='.png';
      else if(buf[0]===0xFF&&buf[1]===0xD8)e='.jpg';
      else if(buf.slice(0,4).toString()==='RIFF'&&buf.slice(8,12).toString()==='WEBP')e='.webp';
      else if(buf.slice(0,6).toString().toUpperCase().startsWith('GIF8'))e='.gif';
      else if(buf.slice(0,4).toString().trim().toLowerCase()==='<svg')e='.svg';
      if(!e)return json(res,415,{ok:false,err:'Hanya gambar: PNG, JPG, WEBP, GIF, SVG'});
      const name='up_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)+e;
      fs.writeFileSync(path.join(UPDIR,name),buf);
      const meta=JSON.parse(fs.readFileSync(path.join(UPDIR,'_meta.json'),'utf8'));
      meta.uploads.unshift({file:name,size:buf.length,at:new Date().toISOString(),where:decodeURIComponent((req.url.split('where=')[1]||'').split('&')[0])||'lainnya'});
      if(meta.uploads.length>200)meta.uploads.length=200;
      fs.writeFileSync(path.join(UPDIR,'_meta.json'),JSON.stringify(meta));
      json(res,200,{ok:true,file:'/uploads/'+name});
    });
    return;
  }
  // === List uploads (GET /api/uploads) ===
  if(u==='/api/uploads'){
    const meta=JSON.parse(fs.readFileSync(path.join(UPDIR,'_meta.json'),'utf8'));
    return json(res,200,{ok:true,list:meta.uploads});
  }
  // === Delete upload (POST /api/uploads/delete?file=) ===
  if(req.method==='POST'&&u==='/api/uploads/delete'){
    body(req,()=>{
      const q=new URL(req.url,'http://x');
      const f=path.basename(q.searchParams.get('file')||'');
      if(!f.startsWith('up_'))return json(res,400,{ok:false,err:'Nama file invalid'});
      try{fs.unlinkSync(path.join(UPDIR,f))}catch(e){}
      const meta=JSON.parse(fs.readFileSync(path.join(UPDIR,'_meta.json'),'utf8'));
      meta.uploads=meta.uploads.filter(x=>x.file!==f);
      fs.writeFileSync(path.join(UPDIR,'_meta.json'),JSON.stringify(meta));
      json(res,200,{ok:true});
    });
    return;
  }
  // serve static
  let uu=req.url.split('?')[0];
  if(uu==='/admin')uu='/admin.html';
  let f=path.join(DIST,uu==='/'?'index.html':uu);
  if(u==='/admin.html')f=path.join(DIST,'admin.html');
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(DIST,'index.html');
  // uploads dir serve
  if(u.startsWith('/uploads/')){
    const g=path.join(UPDIR,path.basename(u));
    if(!fs.existsSync(g)){res.writeHead(404);return res.end('not found')}
    res.writeHead(200,{'Content-Type':MIME[path.extname(g).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    return fs.createReadStream(g).pipe(res);
  }
  res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
}).listen(8100,()=>console.log('extrime-store on :8100'));
// seed meta
if(!fs.existsSync(path.join(UPDIR,'_meta.json')))fs.writeFileSync(path.join(UPDIR,'_meta.json'),JSON.stringify({uploads:[]}));
