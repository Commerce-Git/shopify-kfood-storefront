/**
 * 리뷰 금지어 필터 — 자동 승인 시 악성/스팸 리뷰를 걸러냅니다.
 * 금지어가 포함된 리뷰는 'pending' 상태로 저장되어 수동 확인이 필요합니다.
 */

const BLOCKED_WORDS = [
  // 비속어 (English)
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'crap',
  // 스팸 패턴
  'buy now', 'click here', 'free money', 'casino', 'viagra',
  'http://', 'https://', 'www.',
  // 경쟁사 언급
  'competitor', 'scam', 'fraud', 'lawsuit', 'sue',
];

/**
 * 리뷰 텍스트에 금지어가 포함되어 있는지 확인합니다.
 * @returns 'approved' (통과) 또는 'pending' (수동 확인 필요)
 */
export function getReviewStatus(title: string | null, body: string): 'approved' | 'pending' {
  const combined = `${title || ''} ${body}`.toLowerCase();

  for (const word of BLOCKED_WORDS) {
    if (combined.includes(word.toLowerCase())) {
      return 'pending';
    }
  }

  return 'approved';
}
