            
import { useState, useEffect } from "react";

const SYSTEM_PROMPT = `Tu es un expert en montage vidéo viral pour TikTok et YouTube Shorts.

Ta mission : identifier les moments qui vont accrocher les spectateurs en utilisant une structure narrative précise.

RÈGLE DE DÉCOUPE OBLIGATOIRE pour chaque clip :
1. DÉBUT : commence AU CŒUR du drama/tension — jamais d'intro, jamais de contexte.
2. MILIEU : on remonte à la CAUSE du drama
3. FIN : on termine sur les RÉACTIONS émotionnelles

Types de moments à cibler : confrontations, révélations choquantes, honte, retournements, réactions extrêmes.
IGNORE : intros, transitions calmes, explications sans émotion.

Réponds UNIQUEMENT en JSON valide, sans backticks ni markdown :
{
  "clips": [
    {
      "id": 1,
      "start": 142,
      "end": 198,
      "hook": "La phrase d'accroche des 3 premières secondes",
      "drama": "Description du drama central en 1 phrase",
      "reaction_start": 180,
      "title": "Titre TikTok ultra accrocheur",
      "caption": "Légende avec emojis 😱🔥 #drama #viral",
      "tension_score": 9,
      "why": "Pourquoi ce clip va retenir l'attention"
    }
  ]
}
Identifie 3 à 6 clips. Durée idéale : 20 à 60 secondes.`;

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (m<1) return "À l'instant";
  if (m<60) return `Il y a ${m}min`;
  if (h<24) return `Il y a ${h}h`;
  return `Il y a ${d}j`;
}
function formatTime(s) {
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

function TensionMeter({ score }) {
  const color = score>=8?"#ff2d55":score>=6?"#ff9500":"#ffcc00";
  return (
    <div style={{display:"flex",gap:3,alignItems:"flex-end"}}>
      {Array.from({length:10}).map((_,i)=>(
        <div key={i} style={{width:12,height:i<score?10+i*1.5:5,borderRadius:2,background:i<score?color:"rgba(255,255,255,0.08)"}}/>
      ))}
      <span style={{marginLeft:5,fontWeight:800,fontSize:12,color}}>{score}/10</span>
    </div>
  );
}

function ClipCard({ clip, videoId }) {
  const [copied,setCopied]=useState(false);
  const [open,setOpen]=useState(false);
  const tc=clip.tension_score>=8?"#ff2d55":clip.tension_score>=6?"#ff9500":"#ffcc00";
  return (
    <div style={{borderRadius:16,marginBottom:10,overflow:"hidden",border:`1px solid ${open?tc+"44":"rgba(255,255,255,0.07)"}`,background:"rgba(255,255,255,0.04)"}}>
      <div onClick={()=>setOpen(!open)} style={{padding:"14px",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",border:`2.5px solid ${tc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:tc,flexShrink:0}}>{clip.tension
