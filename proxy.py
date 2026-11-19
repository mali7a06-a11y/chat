import os, time, random, requests
from flask import Flask, request, Response, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

BROWSER_ID = "42f7a5ee62c9bd699c369b970257c2c2"
USER_KEY   = "71788c74f42100b3f411095d786c0433d911dcb5cd088c8c3828c2fb1e9963b9"
THREAD     = "0"
COOKIE = "_pubcid=03c36526-02f3-4d1a-897d-0a42e93eacb3; _pubcid_cst=znv0HA%3D%3D; _clck=k9ptbh%5E2%5Egaa%5E0%5E2464; _ga_YZ365BQRQ1=GS2.1.s1792006406$o4$g1$t1792006560$j59$l0$h1202376857; cto_bundle=bVEzFV9CZDVBJTJCZ0ZUU29HZXdPaGFkRFpRcjFTOWZBUXR5S3NYbElncmZNQ1ZjY285VUV4UFdVZk5oV25LODdPeldqY0xmb04xRzRtM0JzZkk2a3MlMkZwc25QQXZCYU1VJTJGMUl2RnZpYVlkSjlGSVNrOTdYbTYzdXpENEYzNE5qQWZGT2RMNHVlZXlBbjB5UTd2Um9sSWttM1pYamclM0QlM0Q; cto_bidid=RCKzUl91U1MxNkFxUEkwRXFQZ2pYMjhQdks0Y2tNJTJGZWJ2SlVUUHN3ajlBTGZxZkpEU3VwVk9tbDZrSTBWY2VKdkZsWEFjU2N4NTN5c0RWTkhFdVpmTkU5TzNteFV1Y2l5YUZLMWJMVCUyRnNSS0MlMkY4OCUzRA; _gid=GA1.2.1950413176.1795103358; cf_clearance=CnGbCdXhNKBjECnccvgA_cwkWSc5bJiA_Veeokd5aOfSCwLrxVflHWUCd6Wh85G70oC47oZTTcgGU7K1YKXR2Y88X_BTfcGbzoRZC32HL6fmd-eY27tvO3Asb4no-ZAltEvWWR_BZLTPHCKniHn4ZAP8lXg9oBwjdMJAL_DPa-yyk8b7SujMkaxKG57HTsn2Rz_BM_SAdu4At3rulOxDfLxGVGvfph7dqyNNlbeWak6H0zFBsOkHksQGmeceZHTgoAGVIVHZWwz3agq-Bg2qiqHCnzyfxpYoDfI7AKTZU4cxww; _ga_VVT019XKLH=GS2.1.s1795103356$o3$g1$t1795104572$j60$l0$h0; _ga_YJWJRNESS5=GS2.1.s1795103356$o8$g1$t1795104573$j60$l0$h0; _ga=GA1.2.2122397487.1790745580; _gat_gtag_UA_36798824_24=1"
UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36"

@app.route('/')
def index():
    return send_from_directory('.', 'chat.html')

@app.route('/api', methods=['POST', 'OPTIONS'])
def proxy():
    if request.method == 'OPTIONS':
        return Response(status=204, headers={'Access-Control-Allow-Origin': '*'})

    body = request.get_data(as_text=True)
    req_id = request.args.get('requestId') or f"aiTextCompletion{int(time.time()*1000)}"
    
    params = {"browserId": BROWSER_ID, "userKey": USER_KEY, "thread": THREAD,
              "requestId": req_id, "__cacheBust": str(random.random())}
    
    headers = {"User-Agent": UA, "content-type": "text/plain;charset=UTF-8",
               "origin": "https://text-generation.perchance.org",
               "referer": "https://text-generation.perchance.org/embed",
               "Cookie": COOKIE}

    try:
        up = requests.post("https://text-generation.perchance.org/api/generate",
                           params=params, data=body, headers=headers, stream=True, timeout=120)
    except Exception as e:
        return Response(f"Error: {e}", status=502)

    def generate():
        for chunk in up.iter_content(chunk_size=512):
            yield chunk

    return Response(generate(), status=up.status_code, headers={
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
