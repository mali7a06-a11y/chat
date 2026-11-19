const BROWSER_ID = "42f7a5ee62c9bd699c369b970257c2c2";
const USER_KEY   = "71788c74f42100b3f411095d786c0433d911dcb5cd088c8c3828c2fb1e9963b9";
const THREAD     = "0";
const COOKIE = "_pubcid=03c36526-02f3-4d1a-897d-0a42e93eacb3; _pubcid_cst=znv0HA%3D%3D; _clck=k9ptbh%5E2%5Egaa%5E0%5E2464; _ga_YZ365BQRQ1=GS2.1.s1792006406$o4$g1$t1792006560$j59$l0$h1202376857; cto_bundle=bVEzFV9CZDVBJTJCZ0ZUU29HZXdPaGFkRFpRcjFTOWZBUXR5S3NYbElncmZNQ1ZjY285VUV4UFdVZk5oV25LODdPeldqY0xmb04xRzRtM0JzZkk2a3MlMkZwc25QQXZCYU1VJTJGMUl2RnZpYVlkSjlGSVNrOTdYbTYzdXpENEYzNE5qQWZGT2RMNHVlZXlBbjB5UTd2Um9sSWttM1pYamclM0QlM0Q; cto_bidid=RCKzUl91U1MxNkFxUEkwRXFQZ2pYMjhQdks0Y2tNJTJGZWJ2SlVUUHN3ajlBTGZxZkpEU3VwVk9tbDZrSTBWY2VKdkZsWEFjU2N4NTN5c0RWTkhFdVpmTkU5TzNteFV1Y2l5YUZLMWJMVCUyRnNSS0MlMkY4OCUzRA; _gid=GA1.2.1950413176.1795103358; cf_clearance=CnGbCdXhNKBjECnccvgA_cwkWSc5bJiA_Veeokd5aOfSCwLrxVflHWUCd6Wh85G70oC47oZTTcgGU7K1YKXR2Y88X_BTfcGbzoRZC32HL6fmd-eY27tvO3Asb4no-ZAltEvWWR_BZLTPHCKniHn4ZAP8lXg9oBwjdMJAL_DPa-yyk8b7SujMkaxKG57HTsn2Rz_BM_SAdu4At3rulOxDfLxGVGvfph7dqyNNlbeWak6H0zFBsOkHksQGmeceZHTgoAGVIVHZWwz3agq-Bg2qiqHCnzyfxpYoDfI7AKTZU4cxww; _ga_VVT019XKLH=GS2.1.s1795103356$o3$g1$t1795104572$j60$l0$h0; _ga_YJWJRNESS5=GS2.1.s1795103356$o8$g1$t1795104573$j60$l0$h0; _ga=GA1.2.2122397487.1790745580; _gat_gtag_UA_36798824_24=1";
const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36";

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname !== '/__perchance_proxy__') return;

  event.respondWith((async () => {
    try {
      const reqId = url.searchParams.get('requestId') || ('aiTextCompletion' + Date.now());
      const body = await event.request.text();
      const qs = new URLSearchParams({
        browserId: BROWSER_ID, userKey: USER_KEY, thread: THREAD,
        requestId: reqId, __cacheBust: String(Math.random()),
      });
      const upstream = await fetch(
        'https://text-generation.perchance.org/api/generate?' + qs.toString(),
        {
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'content-type': 'text/plain;charset=UTF-8',
            'origin': 'https://text-generation.perchance.org',
            'referer': 'https://text-generation.perchance.org/embed',
            'accept-language': 'ar-IQ,ar;q=0.9,en-IQ;q=0.8,en-US;q=0.7,en;q=0.6',
            'Cookie': COOKIE,
          },
          body,
        }
      );
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (e) {
      return new Response('SW upstream error: ' + e.message, {
        status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});

