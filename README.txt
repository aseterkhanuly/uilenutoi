WEDDING INVITATION — ҚАЛАЙ ӨЗГЕРТУГЕ БОЛАДЫ

Файлдар:
- index.html
- style.css
- script.js
- images/venue.jpg        — мейрамхана фотосы
- audio/music.mp3         — фондық музыка

1. Атаулар
index.html ішіндегі:
- "Аян & Ая"
- "Асыл & Ақмарал"
мәтіндерін өзіңізге ауыстырыңыз.

2. Күні мен уақыты
index.html -> DATE бөлімінен:
- 17
- МАУСЫМ
- 2026
- 18:00
мәндерін өзгертіңіз.
Күнтізбедегі .chosen класын қажетті күнге ауыстыруға болады.

3. Мекенжай
PLACE бөліміндегі қала, мейрамхана атауын және
https://maps.google.com/ сілтемесін нақты Google Maps сілтемесіне ауыстырыңыз.

4. Фото
Өз фотоңызды:
images/venue.jpg
атауымен салыңыз.

5. Музыка
MP3 файлын:
audio/music.mp3
атауымен салыңыз.

6. RSVP жауаптарын сақтау
Қазір endpoint орнатылмаса, жауап тек браузердің localStorage-ына жазылады.
Google Sheets қажет болса:
- Google Apps Script Web App жасаңыз;
- script.js ішіндегі FORM_ENDPOINT = "" жолына URL қойыңыз.

Google Apps Script мысалы:

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.attendance || '',
    data.guests || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
