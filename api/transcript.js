
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'videoId manquant' }), { 
      status: 400, 
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } 
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // Récupère les infos des sous-titres via l'API officielle
    const listRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
    );
    const listData = await listRes.json();
    
    if (!listData.items || listData.items.length === 0) {
      throw new Error('Pas de sous-titres disponibles pour cette vidéo');
    }

    // Prend le premier transcript (fr ou en)
    const caption = listData.items.find(c => 
      c.snippet.language === 'fr' || c.snippet.language === 'en'
    ) || listData.items[0];

    // Télécharge le transcript
    const transcriptRes = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${caption.snippet.language}&fmt=srv3`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!transcriptRes.ok) throw new Error('Impossible de télécharger le transcript');
    const xml = await transcriptRes.text();

    if (!xml.includes('<p ') && !xml.includes('<text')) {
      throw new Error('Transcript vide');
    }

    return new Response(JSON.stringify({ xml }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}
