const sectionBoxEl = document.querySelector("section > .section-box");
const chNameEl = document.querySelector(".chName");
const levelNumEl = document.querySelector(".levelNum");
const gaugeBoxEl = document.querySelector(".gauge-box");
const inputEl = document.querySelector(".foot-text-box input");
const sendBtnEl = document.querySelector(".foot-text-box button");
const chTextBoxEl = document.querySelector(".ch-text-box");
const mainChImgEl = document.querySelector(".main-ch img");
const pointBookBtnEl = document.querySelector(".point-book-button");
const chChangeBtnEl = document.querySelector(".ch-change-box"); // 🐹 버튼

// ====== GEMINI DIRECT API ======
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;  // ✅ 너 키로 교체
const GEMINI_MODEL = "gemini-2.5-flash-lite";

// ====== XP / LEVEL RULE ======
const XP_PER_CHAT = 20;
const XP_PER_LEVEL = 100;

// ====== CHARACTER + BACKGROUND SETS (+ personality) ======
const CHAR_SETS = [
  {
    name: "서디햄",
    emoji: "🐹",
    src: "./images/햄스터 ㅋㅋ.png",
    bg: "url('./images/찐 교실.png')",
    bgSize: "cover",
    bgPosX: "center",
    bgPosY: "-380px",
    personality: `
- 엄청 발랄하고 귀여운 햄스터
- 말 끝에 “~햄!” “~지롱!” 같이 장난스런 말투
- 칭찬/응원 자주 하고 이모티콘 많이 씀
-2줄 이상 말 안함
`
  },
  {
    name: "서디보",
    emoji: "🦥",
    src: "./images/나무늘보 ㅋㅋ.png",
    bg: "url('./images/운동장 배경.png')",
    bgSize: "cover",
    bgPosX: "center",
    bgPosY: "center",
    personality: `
- 느긋하고 다정한 나무늘보
- 천천히 말하는 느낌, “괜찮아~ 천천히 하자” 스타일
- 공감/위로 위주로 따뜻하게 말함
-2줄 이상 말 안함
`
  },
  {
    name: "서디린",
    emoji: "🦒",
    src: "./images/기린 ㅋㅋ.png",
    bg: "url('./images/체육관ㅋㅋ.png')",
    bgSize: "cover",
    bgPosX: "center",
    bgPosY: "-330px",
    personality: `
- 똑똑하고 당당한 기린 선배 느낌
- 핵심을 딱딱 말하지만 은근 츤데레
- “오케이, 그럼 이렇게 해보자.” 같은 리더 톤
-2줄 이상 말 안함
`
  },
];

// ====== 캐릭터별 스티커 지급 테이블(이모티콘) ======
const STICKERS_BY_CHAR = [
  {
    1: { title: "서디햄 첫걸음", emoji: "🌰" },
    2: { title: "서디햄 열공", emoji: "🐹" },
    3: { title: "서디햄 우수", emoji: "✨" },
    4: { title: "서디햄 천재", emoji: "💡" },
    5: { title: "서디햄 마스터", emoji: "🏅" },
  },
  {
    1: { title: "서디보 첫걸음", emoji: "🍃" },
    2: { title: "서디보 열공", emoji: "🦥" },
    3: { title: "서디보 우수", emoji: "🌙" },
    4: { title: "서디보 천재", emoji: "🔮" },
    5: { title: "서디보 마스터", emoji: "👑" },
  },
  {
    1: { title: "서디린 첫걸음", emoji: "🌼" },
    2: { title: "서디린 열공", emoji: "🦒" },
    3: { title: "서디린 우수", emoji: "🌟" },
    4: { title: "서디린 천재", emoji: "🚀" },
    5: { title: "서디린 마스터", emoji: "🏆" },
  },
];

function getStickerFor(charIndex, level) {
  const table = STICKERS_BY_CHAR[charIndex] || {};
  return table[level] || null;
}

// ====== DIALOG ======
const GREETING_MESSAGES = [
  "안녕! 오늘도 같이 대화해볼까? 😊",
  "반가워! 너랑 대화할 준비 완료!",
];
const ENCOURAGE_MESSAGES = [
  "너 진짜 잘하고 있어!",
  "조금만 더 가면 된다! 화이팅!",
  "오늘도 한 걸음씩 성장 중 👏",
  "포기하지 않는 너가 최고야!",
];

// =====================================================
let users = {};
let currentUser = "";
let userState = null;
let charState = null;

// ====== UTIL ======
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ====== 유저이름 가져오기 ======
function getCurrentUserName() {
  const fromLS = localStorage.getItem("userName");
  if (fromLS && fromLS.trim()) return fromLS.trim();

  const fromEl = document.querySelector("#userName");
  if (fromEl && fromEl.textContent.trim()) return fromEl.textContent.trim();

  const cuRaw = localStorage.getItem("currentUser");
  if (cuRaw) {
    try {
      const cu = JSON.parse(cuRaw);
      if (cu?.name) return cu.name;
    } catch {}
  }

  return "guest";
}

// ====== SAVE / LOAD ======
function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
function loadUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try { users = JSON.parse(raw); }
  catch (e) { console.warn("users parse fail", e); }
}

// ====== 유저 없으면 생성 ======
function ensureUser(username) {
  if (!users[username]) {
    users[username] = {
      charIndex: 0,
      characters: CHAR_SETS.map(() => ({
        level: 0,
        xp: 0,
        stickers: [],
        history: [],
      })),
    };
    saveUsers();
  } else {
    const need = CHAR_SETS.length - users[username].characters.length;
    if (need > 0) {
      for (let i = 0; i < need; i++) {
        users[username].characters.push({
          level: 0,
          xp: 0,
          stickers: [],
          history: [],
        });
      }
    }
    users[username].characters.forEach((c) => {
      if (!c.history) c.history = [];
      if (!c.stickers) c.stickers = [];
    });
    saveUsers();
  }
}

// ====== 현재 유저/캐릭터 참조 갱신 ======
function syncRefs() {
  userState = users[currentUser];
  const idx = userState.charIndex;
  charState = userState.characters[idx];
}

// ====== CSS INJECT (bubble auto size + padding 10 + click + fade) ======
(function injectCSS() {
  const style = document.createElement("style");
  style.textContent = `
    .ch-text-box{
      display:inline-flex;
      width: fit-content;
      max-width: 420px;
      min-width: 120px;
      padding: 10px;
      line-height: 1.35;
      word-break: break-word;
      text-align:center;
      box-sizing:border-box;
      font-size: 20px;
      background:#fff;
      border-radius: 30px;
      border: 2px solid rgb(165, 185, 207);
      position:absolute;
      top:20px;
      left:50%;
      transform-origin: bottom center;
      opacity: 0;
      transform: translateX(-50%) translateY(10px) scale(0.95);
      transition: opacity .25s ease, transform .25s ease;
      white-space: pre-line;
    }
    .ch-text-box.bubble-show{
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
      animation: bubblePop .5s ease;
    }
    .ch-text-box.bubble-hide{
      opacity: 0;
      transform: translateX(-50%) translateY(8px) scale(0.96);
    }
    @keyframes bubblePop{
      0%{ transform: translateX(-50%) translateY(12px) scale(0.9); }
      60%{ transform: translateX(-50%) translateY(-2px) scale(1.06); }
      100%{ transform: translateX(-50%) translateY(0) scale(1); }
    }

    .main-ch img.click-pop{ animation: clickPop .5s ease; }
    @keyframes clickPop{
      0%{ transform: scale(1); }
      40%{ transform: scale(1.08) rotate(-2deg); }
      70%{ transform: scale(0.98) rotate(2deg); }
      100%{ transform: scale(1); }
    }

    .main-ch img.fade-out{
      opacity:0; transform: translateY(6px) scale(.98);
      transition:.25s;
    }
    .main-ch img.fade-in{
      opacity:1; transform: translateY(0) scale(1);
      transition:.25s;
    }
    section > .section-box.bg-fade{
      transition: background-image .35s ease, background-position .35s ease;
    }
  `;
  document.head.appendChild(style);
})();

// ====== BUBBLE ======
let bubbleTimer = null;
function showBubble(text, duration = 2500) {
  chTextBoxEl.textContent = text;

  const len = text.length;
  if (len <= 20) chTextBoxEl.style.fontSize = "22px";
  else if (len <= 50) chTextBoxEl.style.fontSize = "20px";
  else chTextBoxEl.style.fontSize = "18px";

  chTextBoxEl.style.padding = "10px";

  chTextBoxEl.classList.remove("hidden", "bubble-hide");
  void chTextBoxEl.offsetWidth;
  chTextBoxEl.classList.add("bubble-show");

  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    chTextBoxEl.classList.remove("bubble-show");
    chTextBoxEl.classList.add("bubble-hide");
    setTimeout(() => chTextBoxEl.classList.add("hidden"), 250);
  }, duration);
}

// ====== GAUGE / STATUS ======
function renderGauge() {
  let fill = gaugeBoxEl.querySelector(".gauge-fill");
  if (!fill) {
    fill = document.createElement("div");
    fill.className = "gauge-fill";
    fill.style.cssText = `
      height:100%; border-radius:15px;
      background:linear-gradient(90deg,#5cc8ff,#4a7dff);
      width:0%; transition:width .3s;
    `;
    gaugeBoxEl.appendChild(fill);
  }
  const percent = Math.min(100, (charState.xp / XP_PER_LEVEL) * 100);
  fill.style.width = percent + "%";
}
function renderStatus() {
  levelNumEl.textContent = `Lv.${charState.level}`;
  renderGauge();
}

// ====== STICKER GIVE ======
function giveSticker(level) {
  const idx = userState.charIndex;
  const sticker = getStickerFor(idx, level);
  if (!sticker) return;
  if (charState.stickers.some((s) => s.level === level)) return;

  charState.stickers.push({
    level,
    title: sticker.title,
    emoji: sticker.emoji,
    obtainedAt: new Date().toISOString(),
  });

  saveUsers();
  showBubble(`레벨업! 🎉\n${sticker.emoji} "${sticker.title}" 획득!`, 3000);
}

// ====== LEVEL UP CHECK ======
function checkLevelUp() {
  while (charState.xp >= XP_PER_LEVEL) {
    charState.xp -= XP_PER_LEVEL;
    charState.level += 1;
    renderStatus();
    giveSticker(charState.level);
  }
  saveUsers();
}

// ====== BOOK MODAL ======
let bookModalEl = null;

function createBookModal() {
  if (bookModalEl) return bookModalEl;

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0;
    background:rgba(0,0,0,.45);
    display:flex; justify-content:center; align-items:center;
    z-index:9999;
  `;

  const book = document.createElement("div");
  book.style.cssText = `
    width:800px; height:520px;
    background:#f7f1e3; border-radius:14px;
    position:relative; display:grid;
    grid-template-columns:1fr 1fr;
    box-shadow:0 20px 60px rgba(0,0,0,.35);
    overflow:hidden;
  `;

  const spine = document.createElement("div");
  spine.style.cssText = `
    position:absolute; top:0; bottom:0; left:50%;
    width:6px; background:#d8c7a6; transform:translateX(-50%);
  `;

  const left = document.createElement("div");
  const right = document.createElement("div");
  left.style.cssText = `padding:26px; background:#fbf6ea;`;
  right.style.cssText = `padding:26px; background:#fbf6ea;`;

  left.innerHTML = `
    <h2 style="font-size:26px;margin-bottom:10px;">🎖️ 도감</h2>
    <p style="color:#555;margin-bottom:14px;">
      이름: <b class="book-char-name"></b>
    </p>
  `;

  right.innerHTML = `
    <h2 style="font-size:26px;margin-bottom:10px;">모은 스티커</h2>
    <div class="right-grid"
         style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;"></div>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "X";
  closeBtn.style.cssText = `
    position:absolute; top:14px; right:14px;
    width:40px; height:36px; border:0; border-radius:8px;
    background:rgb(92,156,224); color:#fff; cursor:pointer;
  `;

  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  book.append(spine, left, right, closeBtn);
  overlay.appendChild(book);
  bookModalEl = overlay;
  return overlay;
}

function renderBookModal() {
  const modal = createBookModal();
  const rightGrid = modal.querySelector(".right-grid");
  rightGrid.innerHTML = "";

  const leftName = modal.querySelector(".book-char-name");
  leftName.textContent = CHAR_SETS[userState.charIndex].name;

  const stickers = charState.stickers;
  if (stickers.length === 0) {
    rightGrid.innerHTML = `<div style="color:#777;">스티커가 없어요</div>`;
    return;
  }

  stickers.forEach((s) => {
    const card = document.createElement("div");
    card.style.cssText = `
      background:white; border:2px dashed #b9a681; border-radius:10px;
      padding:10px; display:flex; flex-direction:column;
      justify-content:center; align-items:center;
      min-height:110px; font-size:40px; gap:6px;
    `;
    card.innerHTML = `
      <div>${s.emoji}</div>
      <div style="font-size:14px;font-weight:700;">${s.title}</div>
      <div style="font-size:12px;color:#666;">Lv.${s.level}</div>
    `;
    rightGrid.appendChild(card);
  });
}

// ====== APPLY CHARACTER + BG + NAME + 버튼 이모지 ======
function applyCharSet() {
  const set = CHAR_SETS[userState.charIndex] || CHAR_SETS[0];

  chNameEl.textContent = set.name;

  mainChImgEl.classList.add("fade-out");
  setTimeout(() => {
    mainChImgEl.src = set.src;
    mainChImgEl.classList.remove("fade-out");
    mainChImgEl.classList.add("fade-in");
    setTimeout(() => mainChImgEl.classList.remove("fade-in"), 250);
  }, 200);

  if (sectionBoxEl) {
    sectionBoxEl.classList.add("bg-fade");
    sectionBoxEl.style.setProperty("background-image", set.bg, "important");
    sectionBoxEl.style.setProperty("background-size", set.bgSize || "cover", "important");
    const posX = set.bgPosX || "center";
    const posY = set.bgPosY || "center";
    sectionBoxEl.style.setProperty("background-position", `${posX} ${posY}`, "important");
    sectionBoxEl.style.setProperty("background-repeat", "no-repeat", "important");
  }

  const changeIconEl = chChangeBtnEl.querySelector(".change");
  if (changeIconEl) changeIconEl.textContent = set.emoji || "🐹";
}

// ====== CHANGE CHARACTER ======
chChangeBtnEl.addEventListener("click", () => {
  userState.charIndex = (userState.charIndex + 1) % CHAR_SETS.length;
  syncRefs();
  applyCharSet();
  renderStatus();
  saveUsers();

  const set = CHAR_SETS[userState.charIndex];
  showBubble(`짜잔! ${set.name} 등장 ✨`, 1500);
});

// =====================================================
// ✅✅✅ 2번 해결: 호출 쿨타임
// =====================================================
let lastCallTime = 0;
const CALL_COOLDOWN = 3000; // 3초에 1번만 호출

// ====== CHAT ======
async function handleSendChat() {
  const now = Date.now();
  if (now - lastCallTime < CALL_COOLDOWN) {
    showBubble("조금만 천천히 말해줘~ 😅", 1500);
    return;
  }
  lastCallTime = now;

  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";

  charState.history.push({ role: "user", content: text });
  saveUsers();

  try {
    const set = CHAR_SETS[userState.charIndex];

    const historyText = charState.history
      .slice(-6)
      .map(m => (m.role === "user" ? `학생: ${m.content}` : `펫: ${m.content}`))
      .join("\n");

    const prompt = `
너는 서울디지텍 마스코트 펫 캐릭터 "${set.name}"야.
학생 "${currentUser}"랑 대화 중이야.

[캐릭터 성격/말투]
${set.personality}

[이전 대화]
${historyText}

[캐릭터 규칙]
1. 위 성격을 100% 반영해서 말해.
2. 답은 너무 길지 않게 1~2문장.
3. 중간중간 이모티콘 사용 😊
4. 학생 이름("${currentUser}")을 가끔 불러줘.

학생의 새 말: ${text}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg = data?.error?.message || `Gemini 오류 (${response.status})`;
      showBubble(`AI 오류😵\n${msg}`, 3000);
      return;
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      showBubble("AI가 답을 못 만들었어 😭\n다시 말해줘!", 2500);
      return;
    }

    charState.history.push({ role: "assistant", content: reply });
    saveUsers();

    showBubble(reply, 2500);

    charState.xp += XP_PER_CHAT;
    checkLevelUp();
    renderStatus();

  } catch (err) {
    console.error(err);
    showBubble("네트워크/키 문제로 AI 연결 실패 😭", 3000);
  }
}

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSendChat();
});
sendBtnEl.addEventListener("click", handleSendChat);

// ====== CHARACTER CLICK ======
mainChImgEl.addEventListener("click", () => {
  mainChImgEl.classList.remove("click-pop");
  void mainChImgEl.offsetWidth;
  mainChImgEl.classList.add("click-pop");
  showBubble(pickRandom(ENCOURAGE_MESSAGES), 2500);
});

// ====== BOOK BUTTON ======
pointBookBtnEl.addEventListener("click", () => {
  renderBookModal();
  document.body.appendChild(bookModalEl);
});

// ====== GREET ON LOAD ======
function greetOnLoad() {
  showBubble(pickRandom(GREETING_MESSAGES), 2500);
}

// ====== INIT ======
(function init() {
  loadUsers();
  currentUser = getCurrentUserName();
  ensureUser(currentUser);
  syncRefs();

  renderStatus();
  applyCharSet();
  greetOnLoad();
})();
