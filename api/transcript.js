export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'videoId manquant' }), { status: 400, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const urls = [
    `https://youtubetranscript.com/?server_vid2=${videoId}`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=fr&fmt=srv3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=srv3`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml.includes('<text') || xml.includes('<p ')) {
        return new Response(JSON.stringify({ xml }), { headers: corsHeaders });
      }
    } catch (e) {
      continue;
    }
  }

  return new Response(JSON.stringify({ error: 'Transcript indisponible pour cette vidéo' }), { status: 500, headers: corsHeaders });
}
