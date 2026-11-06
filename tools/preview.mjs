import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const port=Number(process.env.PORT||8780);
const mimes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon'};
const deny=['/tools/','/tests/','/node_modules/','/package.json','/vercel.json','/README.md','/.git'];
createServer(async (req,res)=>{
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if (pathname.includes('\\')||pathname.includes('\0')||deny.some(v=>pathname.startsWith(v))){res.writeHead(404).end();return;}
  const filename=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(filename!==root&&!filename.startsWith(root+sep)){res.writeHead(404).end();return;}
  try {
    const fileStat=await stat(filename);
    if(!fileStat.isFile()){res.writeHead(404).end();return;}
    const data=await readFile(filename);
    res.writeHead(200,{'Content-Type':mimes[extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`GIEO PRISM: http://127.0.0.1:${port}`));
