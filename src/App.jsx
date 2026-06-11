
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

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m}min`;
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${d}j`;
}
function parseXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const nodes = doc.querySelectorAll("text");
  const lines = [];
  nodes.forEach(node => {
    const start = Math.floor(parseFloat(node.getAttribute("start") || "0"));
    const text = node.textContent.replace(/&#39;/g,"'").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/\n/g," ").trim();
    if (text) lines.push({ start, text });
  });
  return lines;
}
function buildTranscript(lines) {
  let out = "", last = -30;
  lines.forEach(({ start, text }) => {
    if (start - last >= 30) { out += `\n[${formatTime(start)}] `; last = start; }
    out += text + " ";
  });
  return out.slice(0, 8000);
}
function TensionMeter({ score }) {
  const color = score >= 8 ? "#ff2d55" : score >= 6 ? "#ff9500" : "#ffcc00";
  return (
    <div style={{ display:"flex", gap:3, alignItems:"flex-end" }}>
      {Array.from({length:10}).map((_,i) => (
        <div key={i} style={{ width:12, height: i<score ? 10+i*1.5 : 5, borderRadius:2, background: i<score ? color : "rgba(255,255,255,0.08)" }} />
      ))}
      <span style={{ marginLeft:5, fontWeight:800, fontSize:12, color }}>{score}/10</span>
    </div>
  );
}
function ClipCard({ clip, videoId }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const tc = clip.tension_score >= 8 ? "#ff2d55" : clip.tension_score >= 6 ? "#ff9500" : "#ffcc00";
  return (
    <div style={{ borderRadius:16, marginBottom:10, overflow:"hidden", border:`1px solid ${open ? tc+"44":"rgba(255,255,255,0.07)"}`, background:"rgba(255,255,255,0.04)" }}>
      <div onClick={() => setOpen(!open)} style={{ padding:"14px", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:`2.5px solid ${tc}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:tc, flexShrink:0 }}>{clip.tension_score}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{clip.title}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2, fontFamily:"monospace" }}>{formatTime(clip.start)} → {formatTime(clip.end)} · {clip.end-clip.start}s</div>
          </div>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px" }}>
          <div style={{ background:"rgba(255,45,85,0.08)", borderRadius:10, padding:"9px 12px", marginBottom:8 }}>
            <div style={{ fontSize:9, color:"#ff2d55", fontWeight:700, letterSpacing:1, marginBottom:3 }}>🎣 HOOK</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", fontStyle:"italic" }}>"{clip.hook}"</div>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontStyle:"italic", marginBottom:10, lineHeight:1.5 }}>💥 {clip.drama}</div>
          <TensionMeter score={clip.tension_score} />
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)", fontStyle:"italic", margin:"8px 0", lineHeight:1.5 }}>💡 {clip.why}</div>
          <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"10px 12px", fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:10 }}>{clip.caption}</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { navigator.clipboard.writeText(clip.caption); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:copied?"#34c759":"rgba(255,255,255,0.08)", color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>{copied?"✓ Copié":"📋 Légende"}</button>
            <a href={`https://youtu.be/${videoId}?t=${clip.start}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:"11px 0", borderRadius:10, background:"rgba(255,45,85,0.12)", border:"1px solid rgba(255,45,85,0.25)", color:"#ff2d55", fontWeight:600, fontSize:12, textDecoration:"none", textAlign:"center", display:"block" }}>▶ Début</a>
            <a href={`https://youtu.be/${videoId}?t=${clip.reaction_start}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:"11px 0", borderRadius:10, background:"rgba(191,90,242,0.12)", border:"1px solid rgba(191,90,242,0.25)", color:"#bf5af2", fontWeight:600, fontSize:12, textDecoration:"none", textAlign:"center", display:"block" }}>😱 Réaction</a>
          </div>
        </div>
      )}
    </div>
  );
}
function Loader({ step }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      <div style={{ fontSize:36, animation:"spin 1s linear infinite", display:"inline-block", marginBottom:14 }}>⚡</div>
      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>{step}</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
function AddScreen({ onBack, onDone }) {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async () => {
    const vid = extractVideoId(url);
    if (!vid) { setError("URL invalide"); return; }
    setLoading(true); setError("");
    try {
      setStep("Récupération des infos…");
      const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vid}`);
      const noembedData = await noembedRes.json();
      setStep("Récupération du transcript…");
      const tRes = await fetch(`/api/transcript?videoId=${vid}`);
      const tData = await tRes.json();
      if (tData.error) throw new Error(tData.error);
      const lines = parseXml(tData.xml);
      if (!lines.length) throw new Error("Pas de sous-titres disponibles");
      const transcript = buildTranscript(lines);
      setStep("Détection des moments viraux…");
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:SYSTEM_PROMPT,
          messages:[{ role:"user", content:`Titre : "${noembedData.title}"\n\nTranscript :\n${transcript}` }]
        })
      });
      const aiData = await aiRes.json();
      const raw = aiData.content?.map(b => b.text||"").join("") || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const entry = { id: Date.now().toString(), videoId:vid, title: noembedData.title||"Vidéo YouTube", clips: parsed.clips, savedAt: Date.now() };
      localStorage.setItem(`video:${entry.id}`, JSON.stringify(entry));
      onDone(entry);
    } catch(e) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false); setStep("");
    }
  };
  return (
    <div style={{ padding:"20px 16px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", padding:0, marginBottom:20 }}>← Retour</button>
      <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:4 }}>Nouvelle vidéo</div>
      <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginBottom:24 }}>Colle une URL YouTube et l'IA trouve les moments viraux</div>
      <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, padding:"14px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <span>🎥</span>
        <input value={url} onChange={e=>{setUrl(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&!loading&&run()} placeholder="Lien YouTube…" style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14 }} />
        {url&&!loading&&<button onClick={()=>{setUrl("");setError("");}} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:14, cursor:"pointer", padding:0 }}>✕</button>}
      </div>
      {error && (
        <div style={{ background:"rgba(255,45,85,0.08)", border:"1px solid rgba(255,45,85,0.2)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ color:"#ff6b81", fontSize:13, marginBottom:6 }}>⚠️ {error}</div>
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, lineHeight:1.6 }}>• Vérifie que la vidéo a des sous-titres automatiques<br/>• Essaie une autre vidéo populaire</div>
        </div>
      )}
      {loading ? <Loader step={step}/> : (
        <button onClick={run} disabled={!url.trim()} style={{ width:"100%", padding:"15px 0", borderRadius:16, border:"none", background:!url.trim()?"rgba(255,45,85,0.2)":"linear-gradient(135deg,#ff2d55,#ff9500)", color:"#fff", fontWeight:700, fontSize:15, cursor:!url.trim()?"default":"pointer" }}>⚡ Analyser</button>
      )}
    </div>
  );
}
function DetailScreen({ entry, onBack }) {
  return (
    <div style={{ padding:"20px 16px 80px" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", padding:0, marginBottom:20 }}>← Retour</button>
      <div style={{ display:"flex", gap:12, alignItems:"center", background:"rgba(255,255,255,0.04)", borderRadius:16, padding:"14px", marginBottom:20 }}>
        <img src={`https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`} style={{ width:72, height:48, borderRadius:10, objectFit:"cover", flexShrink:0 }} alt="" />
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:4, lineHeight:1.3 }}>{entry.title}</div>
          <div style={{ fontSize:11, color:"#34c759" }}>✓ {entry.clips.length} clips · {timeAgo(entry.savedAt)}</div>
        </div>
      </div>
      {entry.clips.map(clip => <ClipCard key={clip.id} clip={clip} videoId={entry.videoId} />)}
    </div>
  );
}
export default function App() {
  const [screen, setScreen] = useState("list");
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { loadVideos(); }, []);
  const loadVideos = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("video:")) {
        try { items.push(JSON.parse(localStorage.getItem(key))); } catch {}
      }
    }
    setVideos(items.sort((a,b) => b.savedAt - a.savedAt));
  };
  const deleteVideo = (id, e) => {
    e.stopPropagation();
    localStorage.removeItem(`video:${id}`);
    setVideos(v => v.filter(x => x.id !== id));
  };
  if (screen==="add") return <Wrapper><AddScreen onBack={()=>setScreen("list")} onDone={entry=>{loadVideos();setSelected(entry);setScreen("detail");}}/></Wrapper>;
  if (screen==="detail"&&selected) return <Wrapper><DetailScreen entry={selected} onBack={()=>setScreen("list")}/></Wrapper>;
  return (
    <Wrapper>
      <div style={{ padding:"16px 16px 80px" }}>
        <button onClick={()=>setScreen("add")} style={{ width:"100%", padding:"15px 0", borderRadius:16, border:"none", background:"linear-gradient(135deg,#ff2d55,#ff9500)", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", marginBottom:24 }}>+ Analyser une vidéo</button>
        {videos.length===0 && (
          <div style={{ textAlign:"center", padding:"50px 16px", color:"rgba(255,255,255,0.2)", lineHeight:2 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📂</div>
            <div style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.3)", marginBottom:8 }}>Aucune vidéo analysée</div>
            <div style={{ fontSize:13 }}>Ajoute une URL YouTube<br/>et retrouve tes clips ici</div>
          </div>
        )}
        {videos.map(v => (
          <div key={v.id} onClick={()=>{setSelected(v);setScreen("detail");}} style={{ display:"flex", gap:12, alignItems:"center", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"12px 14px", marginBottom:10, cursor:"pointer" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <img src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} style={{ width:64, height:44, borderRadius:8, objectFit:"cover" }} alt="" />
              <div style={{ position:"absolute", top:-5, right:-5, background:"#34c759", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>{v.clips.length}</div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.title}</div>
              <div style={{ fontSize:11, color:"#34c759" }}>✓ {v.clips.length} clips · {timeAgo(v.savedAt)}</div>
            </div>
            <button onClick={e=>deleteVideo(v.id,e)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:16, cursor:"pointer", padding:"4px", flexShrink:0 }}>🗑</button>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
function Wrapper({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a14", color:"#fff", fontFamily:"'Inter',system-ui,sans-serif", maxWidth:430, margin:"0 auto" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900, letterSpacing:-1, background:"linear-gradient(135deg,#ff2d55,#ff9500)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>DramaClip</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:1 }}>Bibliothèque de clips viraux</div>
        </div>
        <div style={{ fontSize:24 }}>⚡</div>
      </div>
      {children}
    </div>
  );
}
