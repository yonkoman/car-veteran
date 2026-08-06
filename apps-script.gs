/**
 * 리스카 견적 신청 폼 → 구글시트 저장용 Apps Script
 *
 * 사용 방법
 * 1) 구글시트를 새로 만들고 첫 번째 행(헤더)에 아래 순서로 입력하세요:
 *    타임스탬프 | 이름 | 연락처 | 희망차종 | 개인정보동의 | utm_source | utm_campaign | utm_content | 제출시각
 * 2) 시트 메뉴 [확장 프로그램] > [Apps Script] 를 열고 이 파일 내용을 붙여넣으세요.
 * 3) [배포] > [새 배포] > 유형: 웹앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 전체 허용(익명 사용자 포함)
 * 4) 배포 후 나오는 웹앱 URL을 index.html의 APPS_SCRIPT_URL 에 붙여넣으세요.
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.phone || '',
    data.car_model || '',
    data.consent_privacy || '',
    data.utm_source || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.submitted_at || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
