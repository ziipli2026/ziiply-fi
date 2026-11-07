'use client';
import {useEffect,useState} from 'react';
function guidePath(){
 return new URLSearchParams(window.location.search).get('versio')==='desktop'
  ? '/ohje/sisalto?versio=desktop'
  : '/ohje/sisalto';
}
export default function Login(){
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/session',{cache:'no-store'}).then(r=>r.ok&&r.json()).then(data=>{if(data?.authenticated) location.replace(guidePath());}).catch(()=>{});},[]);
 async function submit(e){e.preventDefault();setError('');try{const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});if(!r.ok){setError('Kirjautuminen epäonnistui');return;}location.replace(guidePath());}catch{setError('Yhteysvirhe');}}
 return <main style={{maxWidth:380,margin:'12vh auto',fontFamily:'system-ui',padding:24}}><h1>Ziiply – käyttöohje</h1><p>Kirjaudu omilla tunnuksillasi.</p><form onSubmit={submit}><label>Käyttäjätunnus<input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'8px 0 20px'}}/></label><label>Salasana<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'8px 0 20px'}}/></label><button style={{padding:12,width:'100%'}}>Kirjaudu</button></form><p role="alert">{error}</p></main>;
}