export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'videoId manquant' }), { status: 400 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(`https://youtubetranscript.com/?server_vid2=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!res.ok) throw new Error('Transcript indisponible');
    const xml = await res.text();

    if (!xml.includes('<text')) throw new Error('Pas de sous-titres pour cette vidéo');

    return new Response(JSON.stringify({ xml }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}
