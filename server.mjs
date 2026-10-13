import http from 'node:http';
import {readFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import os from 'node:os';
import {DatabaseSync} from 'node:sqlite';
import {handle} from './hosted/lib/api.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
export function createServer({databasePath=path.join(root,'data','standoff.sqlite')}={}){
if(databasePath!==':memory:')mkdirSync(path.dirname(databasePath),{recursive:true});
const sqlite=new DatabaseSync(databasePath);
sqlite.exec(readFileSync(path.join(root,'hosted/drizzle/0000_living_ken_ellis.sql'),'utf8').replace('CREATE TABLE `rooms`','CREATE TABLE IF NOT EXISTS `rooms`'));
const db={prepare(sql){return {bind(...args){return {async first(){return sqlite.prepare(sql).get(...args);},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:r.changes}};}};}};}};
const server=http.createServer(async(req,res)=>{try{
const url=new URL(req.url,'http://localhost');
if(url.pathname.startsWith('/api/')){let body='';for await(const part of req){body+=part;if(body.length>4096){res.writeHead(413);return res.end('Request too large');}}const request=new Request(url,{method:req.method,headers:{'Content-Type':'application/json'},...(req.method==='GET'||req.method==='HEAD'?{}:{body:body||'{}'})});const response=await handle(request,db);res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));}
const routes={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};const file=routes[url.pathname];if(!file){res.writeHead(404);return res.end('Not found');}if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed');}
const content=readFileSync(path.join(root,'hosted/public',file));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:content);
}catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local server error'}));console.error(e.message);}});
server.on('close',()=>sqlite.close());return server;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const port=Number(process.env.PORT)||3000;const server=createServer();server.listen(port,'0.0.0.0',()=>{console.log(`STANDOFF! running at http://localhost:${port}`);for(const interfaces of Object.values(os.networkInterfaces()))for(const address of interfaces||[])if(address.family==='IPv4'&&!address.internal)console.log(`Same Wi-Fi: http://${address.address}:${port}`);console.log('Keep this window open. Stop with Ctrl+C.');});process.on('SIGINT',()=>server.close(()=>process.exit(0)));}
