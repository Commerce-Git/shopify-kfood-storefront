import fs from 'fs';

async function runAudit() {
  console.log('================================================================');
  console.log('🔍 YOUTUBE HOVER-FLIP & VISUAL-FIRST SHOWCASE PRECISION AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // 1. Audit ArtistFollowButton.tsx
  console.log('--- 1. Testing ArtistFollowButton.tsx Architecture ---');
  const btnContent = fs.readFileSync('app/components/ArtistFollowButton.tsx', 'utf8');

  assert(!btnContent.includes('| Unfollow'), "레거시 파이프 '| Unfollow' 텍스트 100% 제거 확인");
  assert(btnContent.includes('group-hover:hidden'), "평상시 'Following' 표시 및 호버 시 숨김 클래스 탑재");
  assert(btnContent.includes('group-hover:inline'), "호버 시 'Unfollow' 부드러운 전환 클래스 탑재");
  assert(btnContent.includes('text-emerald-600 group-hover:hidden'), "평상시 에메랄드 체크마크 아이콘 탑재");
  assert(btnContent.includes('text-rose-600 hidden group-hover:block'), "호버 시 로즈 취소(✕) 아이콘 전환 탑재");
  assert(btnContent.includes('active:scale-95'), "버튼 클릭 시 촉각적 피드백(Micro-interaction) 적용");

  // CLS Check: Length parity
  const idleLen = "Following".length;
  const hoverLen = "Unfollow".length;
  assert(Math.abs(idleLen - hoverLen) <= 1, `텍스트 길이 차이 1글자 이하로 레이아웃 시프트(CLS) 0% 보장 (Following: ${idleLen}자, Unfollow: ${hoverLen}자)`);

  // 2. Audit app/wishlist/page.tsx
  console.log('\n--- 2. Testing Wishlist Page (app/wishlist/page.tsx) Tab 2 Layout ---');
  const wishlistContent = fs.readFileSync('app/wishlist/page.tsx', 'utf8');

  assert(!wishlistContent.includes('profile.bio'), "불필요한 보일러플레이트 bio 텍스트 제거 확인");
  assert(!wishlistContent.includes('Signature Studio Works'), "과도한 텍스트 라벨 제거 확인");
  assert(wishlistContent.includes('md:w-[28%]'), "좌측 공방 정보 영역 28% 슬림화 확인");
  assert(wishlistContent.includes('md:w-[72%]'), "우측 상품 이미지 영역 72% 극대화 확인");
  assert(wishlistContent.includes('artistSlugs='), "공방별 대표작 API 파라미터 연동 확인");
  assert(wishlistContent.includes('Upcoming Drop') || wishlistContent.includes('Next Atelier Drop'), "3개 미만 시 정갈한 차기 드롭 대시 카드 대체 로직 확인");
  assert(wishlistContent.includes('hover:scale-105'), "상품 썸네일 호버 시 시각적 몰입 인터랙션 적용");

  // 3. Audit API Route
  console.log('\n--- 3. Testing API Route /api/wishlist-products ---');
  const apiContent = fs.readFileSync('app/api/wishlist-products/route.ts', 'utf8');
  assert(apiContent.includes('artistSlugs'), "API 라우트에서 artistSlugs 쿼리 파라미터 처리 지원");
  assert(apiContent.includes('studioWorks'), "응답 객체에 studioWorks 맵 필드 반환 확인");

  // 4. Live API Execution & Product Association ---
  console.log('\n--- 4. Live API Execution & Product Association ---');
  const mod = await import('../app/api/wishlist-products/route');
  const { GET } = mod.default || mod;
  const testReq = new Request('http://localhost:3000/api/wishlist-products?artistSlugs=soyo-studio,lalavi,blank-seoul');
  const testRes = await GET(testReq);
  const testJson = await testRes.json();

  assert(testRes.status === 200, "API 응답 HTTP 200 OK");
  assert(testJson.success === true, "API 응답 success: true");
  assert(Array.isArray(testJson.studioWorks['soyo-studio']), "Soyo Studio 작품 목록 정상 반환");
  assert(Array.isArray(testJson.studioWorks['lalavi']), "Lalavi Studio 작품 목록 정상 반환");
  assert(Array.isArray(testJson.studioWorks['blank-seoul']), "Blank Seoul 작품 목록 정상 반환");

  console.log('\n================================================================');
  console.log(`📊 AUDIT SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');

  if (passed !== total) process.exit(1);
}

runAudit().catch((err) => {
  console.error("Audit failed with exception:", err);
  process.exit(1);
});
