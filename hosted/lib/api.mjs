import {player,reset,reason,resolve,view} from './game.mjs';
function fail(message){throw new Error(message);}
function startIntro(room){room.phase='intro';room.introStartedAt=Date.now();}
function advance(room){if(room.phase==='intro'&&Date.now()>=room.introStartedAt+4800)room.phase='playing';if(room.phase==='reveal'&&Date.now()>=room.revealEndsAt){room.phase=room.nextPhase;room.nextPhase=null;}}
function apply(room,endpoint,request,body,url){
if(endpoint==='join'&&request.method==='POST'){if(room.players.length===2)fail('This room already has two players.');const p=player(String(body.name||'Player').trim().slice(0,24)||'Player',body.avatar);room.players.push(p);room.phase='lobby';return {token:p.token,state:view(room,p.token)};}
const token=body.token||url.searchParams.get('token'),p=room.players.find(p=>p.token===token);if(!p)fail('Player session not found.');advance(room);
if(endpoint==='state'&&request.method==='GET')return view(room,token);
if(request.method!=='POST')fail('Unsupported request.');
if(endpoint==='avatar'){if(!['waiting','lobby'].includes(room.phase))fail('Avatars can only change in the room lobby.');if(!Number.isInteger(body.avatar)||body.avatar<0||body.avatar>4)fail('Choose one of the five avatars.');p.avatar=body.avatar;p.ready=false;}
else if(endpoint==='lobby-ready'){if(room.phase!=='lobby'||room.players.length!==2)fail('Wait for both players to join.');p.ready=body.ready!==false;if(room.players.every(p=>p.ready)){room.players.forEach(p=>p.ready=false);startIntro(room);}}
else if(endpoint==='action'){if(room.phase!=='playing')fail('The duel is not active.');if(body.duel!==room.duel||body.turn!==room.turn)fail('This turn has already changed.');if(p.choice)fail('Your action is already locked.');const error=reason(p,body.action);if(error)fail(error);p.choice=body.action;if(room.players.every(p=>p.choice))resolve(room);}
else if(endpoint==='ready'){if(!['duel-over','match-over'].includes(room.phase))fail('Finish this duel first.');if(body.duel!==room.duel)fail('The duel has already changed.');p.ready=true;if(room.players.every(p=>p.ready)){const restart=room.phase==='match-over';room.players.forEach(p=>{reset(p);if(restart)p.wins=0;});room.duel=restart?1:room.duel+1;room.turn=1;room.phase='playing';room.result='';if(restart)room.history=[];startIntro(room);}}
else fail('Unknown endpoint.');return view(room,token);
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
export async function handle(request,db){try{const url=new URL(request.url),endpoint=url.pathname.split('/').pop();let body={};if(request.method==='POST'){const raw=await request.text();if(raw.length>4096)fail('Request too large.');body=JSON.parse(raw||'{}');}
if(endpoint==='create'&&request.method==='POST'){for(let i=0;i<6;i++){const code=Array.from(crypto.getRandomValues(new Uint8Array(3)),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase(),p=player(String(body.name||'Player').trim().slice(0,24)||'Player',body.avatar),room={code,players:[p],phase:'waiting',duel:1,turn:1,history:[],result:''};const result=await db.prepare('INSERT OR IGNORE INTO rooms (code,data,version,updated) VALUES (?,?,0,?)').bind(code,JSON.stringify(room),Date.now()).run();if(result.meta.changes)return json({token:p.token,state:view(room,p.token)});}fail('Could not create a room. Please retry.');}
const code=String(body.code||url.searchParams.get('code')||'').toUpperCase();
for(let attempt=0;attempt<8;attempt++){const row=await db.prepare('SELECT data,version,updated FROM rooms WHERE code=?').bind(code).first();if(!row||Date.now()-row.updated>86400000)fail('Room not found. Create a new room or check the code.');const room=JSON.parse(row.data),result=apply(room,endpoint,request,body,url),data=JSON.stringify(room);if(data===row.data&&Date.now()-row.updated<60000)return json(result);const saved=await db.prepare('UPDATE rooms SET data=?,version=version+1,updated=? WHERE code=? AND version=?').bind(data,Date.now(),code,row.version).run();if(saved.meta.changes)return json(result);}
return json({error:'Room is busy. Please try again.'},409);
}catch(e){console.error('Game API error:',e.message);return json({error:e.message||'Server error'},400);}}
