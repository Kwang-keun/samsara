// ===== 업보(業報) 점수 시스템 =====
const KARMA_MIN = -100;
const KARMA_MAX = 100;

const REALMS = [
  {
    key: '천상', name: '천상 (天上)', minScore: 70,  maxScore: 100,
    emoji: '✨', glowColor: '#f0d060',
    desc: '선한 업보로 천상의 존재로 태어납니다.\n빛과 평화가 가득한 세계에서 복을 누리소서.',
  },
  {
    key: '인간', name: '인간 (人間)', minScore: 30,  maxScore: 69,
    emoji: '🌍', glowColor: '#4caf50',
    desc: '균형 잡힌 업보로 다시 인간으로 태어납니다.\n수행을 통해 더 높은 경지를 향해 나아가소서.',
  },
  {
    key: '아수라', name: '아수라 (阿修羅)', minScore: 0, maxScore: 29,
    emoji: '⚔️', glowColor: '#c0392b',
    desc: '분노와 욕망이 뒤섞인 아수라계에 태어납니다.\n싸움과 시기가 끊이지 않는 세계입니다.',
  },
  {
    key: '축생', name: '축생 (畜生)', minScore: -30, maxScore: -1,
    emoji: '🐾', glowColor: '#2d6a2d',
    desc: '어두운 업보로 짐승의 몸을 받습니다.\n본능에 따라 살아가는 고통의 세계입니다.',
  },
  {
    key: '지옥', name: '지옥 (地獄)', minScore: -100, maxScore: -31,
    emoji: '🔥', glowColor: '#8b0000',
    desc: '무거운 업보로 지옥에 떨어집니다.\n참회와 수행만이 이 고통에서 벗어나는 길입니다.',
  },
];

function getRealm(score) {
  return REALMS.find(r => score >= r.minScore && score <= r.maxScore);
}

// ===== 픽셀아트 캐릭터 (32×32, 3배 스케일 → 96px 캔버스) =====
// 각 캐릭터: 32×32 색상 인덱스 배열 + 팔레트
const PIXEL_CHARS = {

  천상: {
    palette: ['', '#f0d060', '#fff8c0', '#c8a030', '#ffe080', '#aaddff', '#ffffff', '#e8c040'],
    // 0=투명, 1=금, 2=밝은노랑, 3=진금, 4=연금, 5=하늘, 6=흰, 7=진노랑
    map: [
      '0000000000000000',
      '0000000550000000',
      '0000055555500000',
      '0000056665000000', // 광배
      '0000562265000000',
      '0005622226500000',
      '0005621126500000', // 얼굴
      '0005622226500000',
      '0000566650000000',
      '0000013100000000', // 목
      '0001134311000000', // 어깨
      '0014444444410000', // 상체(가사)
      '0014411114410000',
      '0014411114410000',
      '0001144411100000',
      '0000114411000000',
    ],
  },

  인간: {
    palette: ['', '#c8814a', '#f0c090', '#8b5c30', '#4a7a2a', '#6aaa3a', '#e8d8b0', '#ffffff'],
    map: [
      '0000000000000000',
      '0000033300000000',
      '0000322230000000',
      '0003222223000000',
      '0003272723000000', // 눈
      '0003222223000000',
      '0003222223000000',
      '0000322230000000',
      '0000033300000000',
      '0000016100000000', // 목
      '0001144411000000', // 상체
      '0014455441000000',
      '0014455441000000',
      '0001144411000000',
      '0000011100000000',
      '0000011100000000',
    ],
  },

  아수라: {
    palette: ['', '#8b0000', '#cc2020', '#ff4444', '#ff9900', '#800000', '#ffcc00', '#000000'],
    map: [
      '0000000000000000',
      '0000051500000000', // 뿔
      '0000511150000000',
      '0005122215000000',
      '0005137315000000', // 눈(분노)
      '0005133315000000',
      '0005133115000000',
      '0005133335000000', // 이빨
      '0000511150000000',
      '0000022200000000',
      '0002233220000000',
      '0022333322000000',
      '0022311322000000',
      '0002233220000000',
      '0000222200000000',
      '0000222200000000',
    ],
  },

  축생: {
    palette: ['', '#5a3a1a', '#8b6040', '#c0905a', '#2d4a1a', '#4a7030', '#000000', '#ffffff'],
    map: [
      '0000000000000000',
      '0000113100000000',
      '0001133310000000',
      '0011333311000000',
      '0013367631000000', // 눈
      '0013333331000000',
      '0013333331000000',
      '0001333310000000',
      '0000113300000000', // 코
      '0000022000000000',
      '0002244220000000',
      '0022444422000000',
      '0022444422000000',
      '0002244220000000',
      '0000044000000000',
      '0000044000000000',
    ],
  },

  지옥: {
    palette: ['', '#1a0000', '#550000', '#cc1111', '#ff6600', '#ff3300', '#000000', '#ff9900'],
    map: [
      '0000000000000000',
      '0000064600000000', // 뿔 불꽃
      '0000644460000000',
      '0006433346000000',
      '0006457546000000', // 눈(공포)
      '0006444446000000',
      '0006444446000000',
      '0006432346000000', // 이빨
      '0000644460000000',
      '0000033000000000',
      '0003355330000000',
      '0033455433000000',
      '0033455433000000',
      '0003355330000000',
      '0000455000000000',
      '0004554000000000',
    ],
  },
};

function drawCharacter(canvasId, realmKey, scale) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const sc = scale || 3;
  canvas.width  = 16 * sc;
  canvas.height = 16 * sc;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const char = PIXEL_CHARS[realmKey];
  if (!char) return;

  char.map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const idx = parseInt(row[x], 10);
      if (idx === 0 || !char.palette[idx]) continue;
      ctx.fillStyle = char.palette[idx];
      ctx.fillRect(x * sc, y * sc, sc, sc);
    }
  });
}

// ===== 시나리오 52개 (살생10 · 거짓말10 · 보시10 · 빌린물건8 · 폭력7 · 수행7) =====
const scenarios = [

  // ── 살생 관련 (10개) ─────────────────────────────────────────
  {
    id: 1, category: '살생',
    text: '길을 걷다 개미집을 발견했다. 어떻게 할까?',
    choices: [
      { text: '밟고 지나간다',          karma: -15 },
      { text: '피해서 돌아간다',         karma: +15 },
      { text: '못 본 척 지나간다',       karma: 0   },
    ],
  },
  {
    id: 2, category: '살생',
    text: '낚시를 즐기고 있다. 잡은 물고기를 어떻게 할까?',
    choices: [
      { text: '잡아서 회로 먹는다',      karma: -15 },
      { text: '다시 강에 놓아준다',      karma: +15 },
      { text: '그냥 버려 둔다',          karma: -5  },
    ],
  },
  {
    id: 3, category: '살생',
    text: '모기가 팔을 물고 있다. 어떻게 할까?',
    choices: [
      { text: '손바닥으로 쳐 죽인다',    karma: -15 },
      { text: '살살 불어서 날린다',      karma: +15 },
      { text: '긁으며 참는다',           karma: 0   },
    ],
  },
  {
    id: 4, category: '살생',
    text: '거미가 방 안에 들어왔다. 어떻게 할까?',
    choices: [
      { text: '신발로 짓밟는다',         karma: -15 },
      { text: '컵으로 잡아 밖에 놓아준다', karma: +15 },
      { text: '못 본 척 한다',           karma: 0   },
    ],
  },
  {
    id: 5, category: '살생',
    text: '친구가 사냥을 같이 가자고 한다. 어떻게 할까?',
    choices: [
      { text: '신나서 같이 간다',        karma: -15 },
      { text: '단호하게 거절한다',       karma: +10 },
      { text: '핑계를 대고 피한다',      karma: 0   },
    ],
  },
  {
    id: 6, category: '살생',
    text: '길에서 다친 새를 발견했다. 어떻게 할까?',
    choices: [
      { text: '그냥 지나친다',           karma: -5  },
      { text: '동물병원에 데려간다',     karma: +15 },
      { text: '안전한 곳에 옮겨준다',    karma: +10 },
    ],
  },
  {
    id: 7, category: '살생',
    text: '식당에서 살아있는 생선을 고르라고 한다. 어떻게 할까?',
    choices: [
      { text: '맛있어 보이는 것을 고른다', karma: -15 },
      { text: '채식 메뉴로 바꾼다',      karma: +10 },
      { text: '이미 죽은 생선으로 주문한다', karma: -5 },
    ],
  },
  {
    id: 8, category: '살생',
    text: '아이들이 개구리를 잡아 놀리고 있다. 어떻게 할까?',
    choices: [
      { text: '같이 보며 웃는다',        karma: -10 },
      { text: '아이들을 타이르고 놓아준다', karma: +15 },
      { text: '못 본 척 지나친다',       karma: -3  },
    ],
  },
  {
    id: 9, category: '살생',
    text: '연못 앞에서 거북이가 팔리고 있다. 어떻게 할까?',
    choices: [
      { text: '사서 방생해준다',         karma: +15 },
      { text: '그냥 지나친다',           karma: 0   },
      { text: '집에서 키우려고 산다',    karma: -5  },
    ],
  },
  {
    id: 10, category: '살생',
    text: '길고양이가 굶주려 보인다. 어떻게 할까?',
    choices: [
      { text: '쫓아버린다',             karma: -10 },
      { text: '먹을 것을 챙겨준다',     karma: +15 },
      { text: '그냥 지나친다',          karma: 0   },
    ],
  },

  // ── 거짓말 관련 (10개) ────────────────────────────────────────
  {
    id: 11, category: '거짓말',
    text: '지각을 했다. 상사에게 뭐라고 할까?',
    choices: [
      { text: '교통체증이라고 거짓말한다',  karma: -10 },
      { text: '솔직하게 늦잠이라고 말한다', karma: +10 },
      { text: '대충 얼버무린다',            karma: +3  },
    ],
  },
  {
    id: 12, category: '거짓말',
    text: '친구의 요리가 맛없다. 뭐라고 할까?',
    choices: [
      { text: '맛있다고 크게 칭찬한다',  karma: -10 },
      { text: '솔직하지만 부드럽게 말한다', karma: +10 },
      { text: '"그럭저럭"이라고 얼버무린다', karma: +3 },
    ],
  },
  {
    id: 13, category: '거짓말',
    text: '범인을 알고 있다. 경찰이 묻는다. 어떻게 할까?',
    choices: [
      { text: '모른다고 거짓말한다',     karma: -10 },
      { text: '사실대로 말한다',         karma: +10 },
      { text: '말하기 두려워 모른 척한다', karma: -3 },
    ],
  },
  {
    id: 14, category: '거짓말',
    text: '시험 중 친구가 답을 알려달라고 한다. 어떻게 할까?',
    choices: [
      { text: '몰래 답을 알려준다',      karma: -10 },
      { text: '단호하게 거절한다',       karma: +10 },
      { text: '못 들은 척 무시한다',     karma: 0   },
    ],
  },
  {
    id: 15, category: '거짓말',
    text: '실수로 물건을 깼다. 어떻게 할까?',
    choices: [
      { text: '다른 사람이 깼다고 한다', karma: -10 },
      { text: '솔직히 인정하고 사과한다', karma: +10 },
      { text: '그냥 모른 척 자리를 피한다', karma: -3 },
    ],
  },
  {
    id: 16, category: '거짓말',
    text: '이익을 위해 과장 광고 문구를 써달라는 부탁을 받았다. 어떻게 할까?',
    choices: [
      { text: '원하는 대로 과장해서 써준다', karma: -10 },
      { text: '사실에 근거한 문구만 쓴다', karma: +10 },
      { text: '적당히 포장해서 써준다',  karma: -5  },
    ],
  },
  {
    id: 17, category: '거짓말',
    text: '나쁜 소문이 돌고 있는데 사실을 알고 있다. 어떻게 할까?',
    choices: [
      { text: '소문을 더 퍼뜨린다',      karma: -10 },
      { text: '사실을 밝혀 소문을 잡는다', karma: +10 },
      { text: '나와 상관없다며 침묵한다', karma: -3  },
    ],
  },
  {
    id: 18, category: '거짓말',
    text: '친구가 나쁜 길로 가려 한다. 거짓말로 막을 수 있다. 어떻게 할까?',
    choices: [
      { text: '거짓말로 막는다',         karma: +3  },
      { text: '진심을 담아 설득한다',    karma: +10 },
      { text: '내버려 둔다',             karma: -5  },
    ],
  },
  {
    id: 19, category: '거짓말',
    text: '연인에게 깜짝 파티를 준비 중이다. 비밀을 지키려면 거짓말이 필요하다. 어떻게 할까?',
    choices: [
      { text: '선의의 거짓말로 비밀을 지킨다', karma: +3 },
      { text: '미리 파티를 알려버린다',  karma: 0   },
      { text: '파티를 포기한다',         karma: -3  },
    ],
  },
  {
    id: 20, category: '거짓말',
    text: '모르는 것을 아는 척 해달라는 부탁을 받았다. 어떻게 할까?',
    choices: [
      { text: '기꺼이 아는 척해준다',    karma: -10 },
      { text: '모른다고 솔직히 말한다',  karma: +10 },
      { text: '애매하게 넘어간다',       karma: -3  },
    ],
  },

  // ── 빌린 물건 관련 (8개) ──────────────────────────────────────
  {
    id: 21, category: '빌린물건',
    text: '친구에게 빌린 책을 잃어버렸다. 어떻게 할까?',
    choices: [
      { text: '그냥 말 안 하고 넘어간다', karma: -10 },
      { text: '똑같은 책을 사서 돌려준다', karma: +10 },
      { text: '일부만 변상한다',          karma: -3  },
    ],
  },
  {
    id: 22, category: '빌린물건',
    text: '오래전에 빌린 돈이 생각났다. 어떻게 할까?',
    choices: [
      { text: '설마 기억하겠어 — 모른 척한다', karma: -10 },
      { text: '바로 연락해서 갚는다',     karma: +10 },
      { text: '형편 될 때 갚으려 미룬다', karma: -3  },
    ],
  },
  {
    id: 23, category: '빌린물건',
    text: '빌린 우산을 돌려줄 기회를 계속 놓쳤다. 어떻게 할까?',
    choices: [
      { text: '그냥 내 것으로 쓴다',     karma: -10 },
      { text: '일부러 시간을 내어 돌려준다', karma: +10 },
      { text: '"언제 만나면 줄게" 미룬다', karma: -3 },
    ],
  },
  {
    id: 24, category: '빌린물건',
    text: '친구에게 빌린 물건이 내 것보다 훨씬 좋다. 어떻게 할까?',
    choices: [
      { text: '계속 쓰면서 안 돌려준다', karma: -10 },
      { text: '고마워하며 제때 돌려준다', karma: +10 },
      { text: '조금 더 쓰고 나중에 준다', karma: -3  },
    ],
  },
  {
    id: 25, category: '빌린물건',
    text: '빌린 물건이 사용 중 고장났다. 어떻게 할까?',
    choices: [
      { text: '그냥 돌려주며 모른 척한다', karma: -10 },
      { text: '수리해서 돌려주거나 변상한다', karma: +10 },
      { text: '"원래 좀 그랬어" 하고 넘긴다', karma: -5 },
    ],
  },
  {
    id: 26, category: '빌린물건',
    text: '빌린 돈을 갚을 형편이 안 된다. 어떻게 할까?',
    choices: [
      { text: '연락을 끊어버린다',       karma: -10 },
      { text: '솔직히 말하고 분할 상환을 약속한다', karma: +10 },
      { text: '조금이라도 먼저 갚는다',  karma: +5  },
    ],
  },
  {
    id: 27, category: '빌린물건',
    text: '오래전 빌려준 물건을 상대방이 기억 못 하는 것 같다. 어떻게 할까?',
    choices: [
      { text: '그냥 포기한다',           karma: 0   },
      { text: '조심스럽게 상기시킨다',   karma: +10 },
      { text: '따지듯 돌려달라고 한다',  karma: -5  },
    ],
  },
  {
    id: 28, category: '빌린물건',
    text: '남이 잃어버린 귀중품을 발견했다. 어떻게 할까?',
    choices: [
      { text: '슬쩍 챙긴다',             karma: -10 },
      { text: '경찰이나 주인에게 신고한다', karma: +10 },
      { text: '잘 보이는 곳에 놓고 그냥 간다', karma: -3 },
    ],
  },

  // ── 보시 관련 (10개) ──────────────────────────────────────────
  {
    id: 29, category: '보시',
    text: '길거리 노숙자가 돈을 구걸한다. 어떻게 할까?',
    choices: [
      { text: '가진 것을 아낌없이 나눠준다', karma: +15 },
      { text: '조금만 건네준다',            karma: +5  },
      { text: '못 본 척 지나간다',          karma: -5  },
    ],
  },
  {
    id: 30, category: '보시',
    text: '절에서 시주를 권유한다. 어떻게 할까?',
    choices: [
      { text: '형편껏 정성껏 시주한다',  karma: +15 },
      { text: '조금만 넣는다',           karma: +5  },
      { text: '바쁜 척 그냥 지나친다',   karma: -5  },
    ],
  },
  {
    id: 31, category: '보시',
    text: '재난 구호 모금함이 있다. 어떻게 할까?',
    choices: [
      { text: '할 수 있는 만큼 넣는다',  karma: +15 },
      { text: '잔돈만 넣는다',           karma: +5  },
      { text: '그냥 지나친다',           karma: -5  },
    ],
  },
  {
    id: 32, category: '보시',
    text: '배고픈 아이를 보았다. 음식이 하나 남아있다. 어떻게 할까?',
    choices: [
      { text: '망설임 없이 아이에게 준다', karma: +15 },
      { text: '반만 나눠준다',            karma: +5  },
      { text: '내 배가 고파 그냥 먹는다', karma: -5  },
    ],
  },
  {
    id: 33, category: '보시',
    text: '헌혈 차량이 서 있다. 어떻게 할까?',
    choices: [
      { text: '기꺼이 헌혈한다',         karma: +15 },
      { text: '다음에 하겠다며 미룬다',  karma: 0   },
      { text: '무섭다며 지나친다',       karma: -5  },
    ],
  },
  {
    id: 34, category: '보시',
    text: '이웃이 어렵다는 것을 알았다. 어떻게 할까?',
    choices: [
      { text: '먼저 찾아가 도움을 제안한다', karma: +15 },
      { text: '음식이나 생필품을 몰래 놓아둔다', karma: +10 },
      { text: '내 일이 아니라며 외면한다', karma: -5  },
    ],
  },
  {
    id: 35, category: '보시',
    text: '친구가 급하게 돈을 빌려달라고 한다. 어떻게 할까?',
    choices: [
      { text: '선뜻 빌려준다',           karma: +15 },
      { text: '가능한 만큼만 빌려준다',  karma: +5  },
      { text: '핑계를 대며 거절한다',    karma: -5  },
    ],
  },
  {
    id: 36, category: '보시',
    text: '재능 기부 요청을 받았다. 어떻게 할까?',
    choices: [
      { text: '흔쾌히 재능을 기부한다',  karma: +15 },
      { text: '부분적으로만 돕는다',     karma: +5  },
      { text: '시간이 없다며 거절한다',  karma: -5  },
    ],
  },
  {
    id: 37, category: '보시',
    text: '지하철에서 노인이 서 계신다. 어떻게 할까?',
    choices: [
      { text: '바로 자리를 양보한다',    karma: +15 },
      { text: '잠시 망설이다 양보한다',  karma: +5  },
      { text: '못 본 척 핸드폰을 본다',  karma: -5  },
    ],
  },
  {
    id: 38, category: '보시',
    text: '길에서 넘어진 사람을 보았다. 어떻게 할까?',
    choices: [
      { text: '달려가서 일으켜 준다',    karma: +15 },
      { text: '말로만 괜찮냐고 묻는다',  karma: +5  },
      { text: '바빠서 그냥 지나친다',    karma: -5  },
    ],
  },

  // ── 폭력·갈등 관련 (7개) ──────────────────────────────────────
  {
    id: 39, category: '폭력',
    text: '누군가 나를 심하게 욕한다. 어떻게 할까?',
    choices: [
      { text: '더 심하게 맞받아친다',    karma: -15 },
      { text: '차분하게 대화로 푼다',    karma: +10 },
      { text: '그냥 자리를 피한다',      karma: 0   },
    ],
  },
  {
    id: 40, category: '폭력',
    text: '친구들이 약자를 괴롭히고 있다. 어떻게 할까?',
    choices: [
      { text: '같이 웃으며 구경한다',    karma: -15 },
      { text: '직접 나서서 말린다',      karma: +10 },
      { text: '선생님·어른에게 알린다',  karma: +10 },
    ],
  },
  {
    id: 41, category: '폭력',
    text: '온라인에서 악플을 달고 싶어진다. 어떻게 할까?',
    choices: [
      { text: '익명이니까 마음껏 단다',  karma: -15 },
      { text: '참고 창을 닫는다',        karma: +10 },
      { text: '부드러운 의견으로 바꿔 쓴다', karma: +5 },
    ],
  },
  {
    id: 42, category: '폭력',
    text: '가족과 크게 다퉜다. 어떻게 할까?',
    choices: [
      { text: '더 큰 소리로 화를 낸다',  karma: -15 },
      { text: '먼저 사과하고 대화한다',  karma: +10 },
      { text: '말없이 방에 들어간다',    karma: 0   },
    ],
  },
  {
    id: 43, category: '폭력',
    text: '길에서 싸움이 벌어지고 있다. 어떻게 할까?',
    choices: [
      { text: '구경하며 폰으로 찍는다',  karma: -10 },
      { text: '경찰에 신고한다',         karma: +10 },
      { text: '빠르게 자리를 피한다',    karma: 0   },
    ],
  },
  {
    id: 44, category: '폭력',
    text: '누군가 나를 먼저 때렸다. 어떻게 할까?',
    choices: [
      { text: '더 세게 보복한다',        karma: -15 },
      { text: '신고하고 법적으로 처리한다', karma: +10 },
      { text: '그 자리를 피한다',        karma: 0   },
    ],
  },
  {
    id: 45, category: '폭력',
    text: '화가 나서 물건을 부수고 싶다. 어떻게 할까?',
    choices: [
      { text: '주변 물건을 집어 던진다', karma: -15 },
      { text: '심호흡하고 잠시 걷는다',  karma: +10 },
      { text: '베개를 치며 푼다',        karma: 0   },
    ],
  },

  // ── 수행·명상 관련 (7개) ──────────────────────────────────────
  {
    id: 46, category: '수행',
    text: '매일 아침 명상할 시간이 있다. 어떻게 할까?',
    choices: [
      { text: '꾸준히 매일 한다',        karma: +15 },
      { text: '가끔 생각날 때만 한다',   karma: +5  },
      { text: '귀찮아서 안 한다',        karma: -3  },
    ],
  },
  {
    id: 47, category: '수행',
    text: '사찰에서 수행 프로그램을 권유한다. 어떻게 할까?',
    choices: [
      { text: '기꺼이 참가한다',         karma: +15 },
      { text: '일정 조율 후 참가한다',   karma: +5  },
      { text: '관심 없다며 거절한다',    karma: -3  },
    ],
  },
  {
    id: 48, category: '수행',
    text: '나쁜 습관을 고치려 노력 중이다. 어떻게 할까?',
    choices: [
      { text: '포기하지 않고 계속 노력한다', karma: +15 },
      { text: '가끔 노력하다 포기한다',  karma: +5  },
      { text: '어차피 안 된다며 포기한다', karma: -3 },
    ],
  },
  {
    id: 49, category: '수행',
    text: '마음이 흔들릴 때 어떻게 할까?',
    choices: [
      { text: '명상으로 마음을 다잡는다', karma: +15 },
      { text: '시간이 지나길 기다린다',  karma: +5  },
      { text: '충동적으로 행동해버린다', karma: -3  },
    ],
  },
  {
    id: 50, category: '수행',
    text: '욕심이 생길 때 어떻게 할까?',
    choices: [
      { text: '욕심임을 알아차리고 내려놓는다', karma: +15 },
      { text: '적당히 즐기고 만다',      karma: +5  },
      { text: '욕심을 채우려 무리한다',  karma: -3  },
    ],
  },
  {
    id: 51, category: '수행',
    text: '감사함을 느낄 때 어떻게 표현할까?',
    choices: [
      { text: '진심으로 감사를 전한다',  karma: +15 },
      { text: '마음속으로만 간직한다',   karma: +5  },
      { text: '당연하다고 여기며 넘긴다', karma: -3 },
    ],
  },
  {
    id: 52, category: '수행',
    text: '하루를 마치며 오늘 하루를 돌아본다. 어떻게 할까?',
    choices: [
      { text: '잘못을 반성하고 내일을 다짐한다', karma: +15 },
      { text: '좋은 일만 떠올린다',      karma: +5  },
      { text: '피곤해서 그냥 잠든다',    karma: -3  },
    ],
  },

];

// ===== 게임 상태 =====
const state = {
  karma: 0,
  current: 0,
  queue: [],
  finished: false,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== 업보 바 업데이트 =====
function updateKarmaBar(score) {
  const val = document.getElementById('karma-value');
  val.textContent = (score > 0 ? '+' : '') + score;
  val.style.color = score > 0 ? '#f0d060' : score < 0 ? '#ff6666' : '#aaaaaa';

  const posBar = document.getElementById('karma-bar-pos');
  const negBar = document.getElementById('karma-bar-neg');
  if (score >= 0) {
    posBar.style.width = (score / 100 * 50) + '%';
    negBar.style.width = '0%';
  } else {
    negBar.style.width = (Math.abs(score) / 100 * 50) + '%';
    posBar.style.width = '0%';
  }
}

// ===== 현재 세계 캐릭터 표시 =====
function updateCharacter(score) {
  const realm = getRealm(score);
  drawCharacter('char-canvas', realm.key, 6);
  document.getElementById('realm-label').textContent = realm.name;
  document.body.setAttribute('data-realm', realm.key);
  document.getElementById('char-canvas').style.filter =
    `drop-shadow(0 0 10px ${realm.glowColor})`;
}

// ===== 시작 =====
function startGame() {
  state.karma = 0;
  state.current = 0;
  state.queue = shuffle(scenarios);
  state.finished = false;
  document.body.removeAttribute('data-realm');
  updateKarmaBar(0);
  updateCharacter(0);
  renderScenario();
}

function choose(karmaChange) {
  // 이중 클릭 방지: 선택 즉시 모든 버튼 비활성화
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  state.karma = Math.max(KARMA_MIN, Math.min(KARMA_MAX, state.karma + karmaChange));
  state.current++;
  updateKarmaBar(state.karma);
  updateCharacter(state.karma);
  if (state.current >= state.queue.length) {
    state.finished = true;
    renderResult();
  } else {
    renderScenario();
  }
}

// ===== 렌더링: 시나리오 =====
function renderScenario() {
  const s = state.queue[state.current];
  document.getElementById('screen-scenario').style.display = 'block';
  document.getElementById('screen-result').style.display   = 'none';

  // 진행도
  const total = state.queue.length;
  const pct   = ((state.current) / total * 100).toFixed(1);
  document.getElementById('progress-text').textContent = `${state.current + 1} / ${total}`;
  document.getElementById('progress-bar').style.width = pct + '%';

  // 시나리오
  document.getElementById('category').textContent = `◈  ${s.category}`;
  document.getElementById('scenario-text').textContent = s.text;

  // 선택지
  const choiceBox = document.getElementById('choices');
  choiceBox.innerHTML = '';
  s.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.text;
    btn.onclick = () => choose(c.karma);
    choiceBox.appendChild(btn);
  });
}

// ===== 렌더링: 결과 =====
function renderResult() {
  document.getElementById('screen-scenario').style.display = 'none';
  const resultEl = document.getElementById('screen-result');
  // 애니메이션 재실행: 클래스 제거 후 reflow → 재추가
  resultEl.style.animation = 'none';
  resultEl.offsetHeight; // reflow 강제
  resultEl.style.animation = '';
  resultEl.style.display = 'block';

  const realm = getRealm(state.karma);
  drawCharacter('result-canvas', realm.key, 8);
  document.getElementById('result-canvas').style.filter =
    `drop-shadow(0 0 24px ${realm.glowColor})`;

  document.getElementById('result-realm-emoji').textContent = realm.emoji;
  document.getElementById('result-realm-name').textContent  = realm.name;
  document.getElementById('result-karma-text').textContent  =
    `최종 업보: ${state.karma > 0 ? '+' : ''}${state.karma}점`;
  document.getElementById('result-desc').textContent = realm.desc;
  document.body.setAttribute('data-realm', realm.key);
}

document.getElementById('btn-restart').onclick = () => startGame();

// 시작
startGame();
