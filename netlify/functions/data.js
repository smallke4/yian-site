// netlify/functions/data.js
// GET  /api/data          → 回傳網站資料（公開，前台用）
// POST /api/data          → 更新資料（需 JWT）

const { getStore } = require("@netlify/blobs");
const jwt = require("jsonwebtoken");

const BLOB_KEY = "site-data";

const DEFAULT_DATA = {
  profile: {
    name: "翊安",
    nameEn: "Yi An",
    tagline: "讓每一個家，都值得被記錄",
    subtitle: "帶你看盡台灣房市精華　分享真實購屋心法\n解析超級A案好物件，陪你走完每一步",
    company: "有巢氏麻吉地產",
    stats: {
      fans: "50K+",
      videos: "200+",
      deals: "300+",
      years: "5年+"
    },
    bio: "任職於有巢氏麻吉地產的房產顧問，同時也是熱衷分享台灣房市資訊的內容創作者。從台北豪宅到新興重劃區，我用鏡頭帶你第一線看見每個物件的真實樣貌。"
  },
  contact: {
    email: "yian@majirealty.com.tw",
    lineId: "@yian.house",
    hours: "週一至週六 10:00–20:00",
    youtube: "https://www.youtube.com",
    instagram: "https://www.instagram.com",
    facebook: "https://www.facebook.com",
    tiktok: "https://www.tiktok.com",
    line: "https://line.me"
  },
  videos: [
    {
      id: 1,
      title: "【物件開箱】信義區豪宅首度曝光！超大視野、無敵台北101景觀",
      category: "tour",
      emoji: "🏙️",
      views: "12.4萬",
      time: "3週前",
      duration: "18:42",
      badgeText: "物件開箱",
      gradient: "linear-gradient(135deg, #064e3b, #065f46)",
      desc: "深入帶你走進信義區精華地段，一起看看這戶無敵景觀豪宅的真實樣貌！",
      youtubeUrl: "https://www.youtube.com"
    },
    {
      id: 2,
      title: "【購屋攻略】首購族必看！貸款眉角大公開，這5件事沒做你會後悔",
      category: "tips",
      emoji: "📋",
      views: "8.7萬",
      time: "1個月前",
      duration: "24:15",
      badgeText: "購屋攻略",
      gradient: "linear-gradient(135deg, #78350f, #92400e)",
      desc: "首購族購屋貸款完整攻略，涵蓋自備款、寬限期到包銀行都不知道的眉眉角角！",
      youtubeUrl: "https://www.youtube.com"
    },
    {
      id: 3,
      title: "【市場分析】2024下半年台灣房市走勢分析，到底該買還是等？",
      category: "market",
      emoji: "📊",
      views: "15.2萬",
      time: "2個月前",
      duration: "31:08",
      badgeText: "市場分析",
      gradient: "linear-gradient(135deg, #1e3a5f, #1e40af)",
      desc: "從總體經濟到在地市場，深度解析下半年台灣房市的五大關鍵趨勢！",
      youtubeUrl: "https://www.youtube.com"
    },
    {
      id: 4,
      title: "【物件開箱】新北重劃區三房兩廳！板橋江翠北側特急帶看",
      category: "tour",
      emoji: "🏠",
      views: "6.3萬",
      time: "5週前",
      duration: "22:30",
      badgeText: "物件開箱",
      gradient: "linear-gradient(135deg, #14532d, #166534)",
      desc: "江翠北側重劃區三房物件完整開箱，格局方正、社區環境全方位紀錄！",
      youtubeUrl: "https://www.youtube.com"
    },
    {
      id: 5,
      title: "【購屋攻略】預售屋vs中古屋，到底哪個划算？翊安幫你全分析",
      category: "tips",
      emoji: "⚖️",
      views: "9.8萬",
      time: "6週前",
      duration: "19:55",
      badgeText: "購屋攻略",
      gradient: "linear-gradient(135deg, #7c2d12, #9a3412)",
      desc: "預售屋vs中古屋全面比較，從付款方式到未來增值潛力一次搞懂！",
      youtubeUrl: "https://www.youtube.com"
    },
    {
      id: 6,
      title: "【市場分析】桃園市最強區域解析！青埔vs龜山誰更有潛力？",
      category: "market",
      emoji: "🔍",
      views: "7.1萬",
      time: "2個月前",
      duration: "26:44",
      badgeText: "市場分析",
      gradient: "linear-gradient(135deg, #1e3a5f, #312e81)",
      desc: "桃園兩大熱區深度比較，搭配機能、交通與未來發展，幫你選出最適合的落腳地！",
      youtubeUrl: "https://www.youtube.com"
    }
  ],
  listings: [
    {
      id: 1,
      title: "信義計畫區景觀三房　翠綠台北，零距離101",
      area: "taipei",
      areaName: "台北信義",
      price: "5,880",
      unit: "萬",
      size: "35.5坪",
      rooms: "3房2廳2衛",
      floor: "18F/24F",
      emoji: "🌆",
      gradient: "linear-gradient(135deg, #0c4a2c, #15803d)",
      badges: [{ cls: "badge-a", text: "超級A案" }, { cls: "badge-hot", text: "熱門" }]
    },
    {
      id: 2,
      title: "板橋江翠北側全新交屋　三房方正格局無浪費",
      area: "newtaipei",
      areaName: "新北板橋",
      price: "2,380",
      unit: "萬",
      size: "30.2坪",
      rooms: "3房2廳1衛",
      floor: "7F/12F",
      emoji: "🏘️",
      gradient: "linear-gradient(135deg, #14532d, #16a34a)",
      badges: [{ cls: "badge-a", text: "超級A案" }, { cls: "badge-new", text: "新上架" }]
    },
    {
      id: 3,
      title: "內湖科學園區捷運宅　通勤族首選，增值可期",
      area: "taipei",
      areaName: "台北內湖",
      price: "3,150",
      unit: "萬",
      size: "26.8坪",
      rooms: "2房1廳1衛",
      floor: "10F/15F",
      emoji: "🚇",
      gradient: "linear-gradient(135deg, #064e3b, #0d9488)",
      badges: [{ cls: "badge-a", text: "超級A案" }]
    },
    {
      id: 4,
      title: "青埔高鐵特區預售案　桃園最強增值潛力股",
      area: "taoyuan",
      areaName: "桃園青埔",
      price: "1,580",
      unit: "萬起",
      size: "28坪起",
      rooms: "2~4房可選",
      floor: "預售/35F",
      emoji: "🚄",
      gradient: "linear-gradient(135deg, #1c4f3a, #166534)",
      badges: [{ cls: "badge-a", text: "超級A案" }, { cls: "badge-hot", text: "熱搶中" }]
    },
    {
      id: 5,
      title: "三重新莊重劃區精品宅　市中心外的CP值之王",
      area: "newtaipei",
      areaName: "新北三重",
      price: "1,980",
      unit: "萬",
      size: "27.5坪",
      rooms: "3房2廳2衛",
      floor: "5F/12F",
      emoji: "🏗️",
      gradient: "linear-gradient(135deg, #1a4731, #15803d)",
      badges: [{ cls: "badge-new", text: "新上架" }]
    },
    {
      id: 6,
      title: "大安區老屋翻新精裝兩房　文教區靜謐好眠宅",
      area: "taipei",
      areaName: "台北大安",
      price: "4,200",
      unit: "萬",
      size: "22坪",
      rooms: "2房1廳1衛",
      floor: "3F/4F",
      emoji: "🌿",
      gradient: "linear-gradient(135deg, #2d4a1e, #3a6b24)",
      badges: [{ cls: "badge-a", text: "超級A案" }]
    }
  ]
};

function verifyToken(event) {
  const auth = event.headers["authorization"] || event.headers["Authorization"] || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const store = getStore("site-content");

  // GET — public, frontend uses this
  if (event.httpMethod === "GET") {
    try {
      const raw = await store.get(BLOB_KEY);
      const data = raw ? JSON.parse(raw) : DEFAULT_DATA;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch {
      return { statusCode: 200, headers, body: JSON.stringify(DEFAULT_DATA) };
    }
  }

  // POST — requires JWT
  if (event.httpMethod === "POST") {
    if (!verifyToken(event)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    try {
      const newData = JSON.parse(event.body);
      await store.set(BLOB_KEY, JSON.stringify(newData));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: "Method Not Allowed" };
};
