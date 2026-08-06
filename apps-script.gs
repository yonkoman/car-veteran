/**
 * ============================================================
 *  카테랑 견적 신청 폼 → Google Sheets 저장용 Apps Script
 * ============================================================
 *
 * 【설정 방법】
 *
 * 1. Google Sheets에서 새 스프레드시트를 만듭니다. (예: "카테랑 신청DB")
 *
 * 2. 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭
 *
 * 3. 열린 에디터의 기존 코드를 지우고 이 파일 내용 전체를 붙여넣기
 *
 * 4. 우측 상단 [배포] → [새 배포] 클릭
 *    - 유형 선택: "웹 앱" (Web app)
 *    - 설명: 아무거나 (예: 견적폼 연동)
 *    - 실행 계정(Execute as): 나 (Me)
 *    - 액세스 권한(Who has access): 전체 (Anyone)
 *      ※ "전체"로 설정해야 랜딩페이지에서 오는 요청을 받을 수 있습니다.
 *        시트 자체는 비공개이며, 이 설정은 "폼 제출 창구"만 여는 것입니다.
 *
 * 5. 배포 후 나오는 "웹 앱 URL"을 복사
 *
 * 6. index.html 파일에서 아래 줄을 찾아 URL을 붙여넣기:
 *      const APPS_SCRIPT_URL = "여기에_배포된_웹앱_URL을_붙여넣으세요";
 *
 * 7. 코드를 수정한 뒤에는 항상 [배포] → [배포 관리] → 연필 아이콘
 *    → "새 버전"으로 다시 배포해야 변경사항이 반영됩니다.
 *
 * 8. 테스트: 랜딩페이지에서 신청 폼을 한 번 제출해보고
 *    스프레드시트에 새 행이 추가되는지 확인하세요.
 *
 * ============================================================
 */

// 첫 실행 시 자동으로 헤더를 만들어줍니다.
const HEADERS = [
  '접수시각', '이름', '연락처', '희망차종',
  '개인정보동의',
  'utm_source', 'utm_campaign', 'utm_content'
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 시트가 비어있으면 헤더 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.submitted_at || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.car_model || '',
      data.consent_privacy || '',
      data.utm_source || '',
      data.utm_campaign || '',
      data.utm_content || ''
    ]);

    // notifyTelegram(data); // 텔레그램 알림 쓰려면 아래 설정 후 이 줄 주석 해제

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ============================================================
 *  (선택) 텔레그램 신규 신청 알림
 * ============================================================
 * 텔레그램 봇을 만들고 아래 두 값을 채운 뒤,
 * 위 doPost 함수 안의 // notifyTelegram(data); 주석을 해제하면
 * 신청이 들어올 때마다 텔레그램으로 알림이 옵니다.
 *
 * 봇 생성: 텔레그램에서 @BotFather 검색 → /newbot
 * CHAT_ID 확인: 봇과 대화 시작 후
 *   https://api.telegram.org/bot{BOT_TOKEN}/getUpdates 접속해서 chat.id 확인
 * ============================================================
 */
function notifyTelegram(data) {
  const BOT_TOKEN = '여기에_봇_토큰';
  const CHAT_ID = '여기에_챗_아이디';

  if (BOT_TOKEN.includes('여기에')) return; // 미설정 시 스킵

  const text =
    `🔔 카테랑 신규 견적 신청\n` +
    `이름: ${data.name}\n` +
    `연락처: ${data.phone}\n` +
    `희망차종: ${data.car_model}\n` +
    `유입: ${data.utm_source || '-'} / ${data.utm_content || '-'}`;

  UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: CHAT_ID, text: text })
  });
}
