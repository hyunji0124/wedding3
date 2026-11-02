/* 공통 도우미 — 수정하지 않아도 됩니다 */
(function () {
  var broken = !window.WEDDING;
  var W = window.WEDDING || {};
  W.groom = W.groom || {}; W.bride = W.bride || {}; W.venue = W.venue || {};
  W.date = W.date || { year: 2026, month: 12, day: 1, hour: 12, minute: 0 };
  var DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  if (broken) {
    document.addEventListener('DOMContentLoaded', function () {
      var m = document.createElement('div');
      m.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:99999;max-width:340px;padding:14px 18px;border-radius:12px;background:#B4463A;color:#fff;font:14px/1.6 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)';
      m.innerHTML = '<b>config.js를 읽지 못했어요</b><br>따옴표(") 나 쉼표(,)가 빠졌는지 확인해 주세요. 마지막으로 고친 줄부터 살펴보면 빨라요.';
      document.body.appendChild(m);
    });
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  var d = W.date || { year: 2026, month: 12, day: 1, hour: 12, minute: 0 };
  var dateObj = new Date(d.year, d.month - 1, d.day, d.hour || 0, d.minute || 0);

  function timeText() {
    var h = d.hour || 0, m = d.minute || 0;
    var ampm = h < 12 ? '오전' : '오후';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return ampm + ' ' + h12 + '시' + (m ? ' ' + m + '분' : '');
  }

  function dday() {
    var now = new Date();
    var t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var t1 = new Date(d.year, d.month - 1, d.day).getTime();
    var diff = Math.round((t1 - t0) / 86400000);
    return diff > 0 ? 'D-' + diff : (diff === 0 ? 'D-DAY' : 'D+' + (-diff));
  }

  function fill(s) {
    var g = W.groom || {}, b = W.bride || {};
    return String(s || '')
      .replace(/\{신랑이름\}/g, g.name || '').replace(/\{신부이름\}/g, b.name || '')
      .replace(/\{신랑\}/g, g.short || g.name || '').replace(/\{신부\}/g, b.short || b.name || '')
      .replace(/\{날짜\}/g, d.month + '월 ' + d.day + '일');
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function toast(msg) {
    var t = document.getElementById('wd-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'wd-toast';
      t.style.cssText = 'position:fixed;left:50%;bottom:40px;transform:translateX(-50%);padding:10px 18px;border-radius:999px;background:rgba(0,0,0,0.8);color:#fff;font-size:14px;z-index:9999;opacity:0;transition:opacity .2s;pointer-events:none;font-family:system-ui,sans-serif';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = 1;
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.style.opacity = 0; }, 1600);
  }

  function copy(text, msg) {
    var done = function () { toast(msg || '복사했어요'); };
    var fallback = function () {
      try {
        var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = 0;
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done();
      } catch (e) { window.prompt('길게 눌러 복사하세요', text); }
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done).catch(fallback);
    else fallback();
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function utcStamp(dt) { return dt.getUTCFullYear() + pad2(dt.getUTCMonth() + 1) + pad2(dt.getUTCDate()) + 'T' + pad2(dt.getUTCHours()) + pad2(dt.getUTCMinutes()) + '00Z'; }
  function calTitle() { var g = W.groom || {}, b = W.bride || {}; return (g.short || g.name) + ' ♥ ' + (b.short || b.name) + ' 결혼식'; }
  function calLocation() { var v = W.venue || {}; return [v.name, v.hall, v.address].filter(Boolean).join(' '); }
  function calTimes() {
    // 한국 시간(UTC+9) 기준으로 UTC 변환 — 보는 사람의 시간대와 상관없이 정확한 시각이 들어갑니다
    var start = new Date(Date.UTC(d.year, d.month - 1, d.day, (d.hour || 0) - 9, d.minute || 0));
    var end = new Date(start.getTime() + 2 * 3600 * 1000);
    return [utcStamp(start), utcStamp(end)];
  }
  function gcalLink() {
    var t = calTimes();
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(calTitle()) +
      '&dates=' + t[0] + '/' + t[1] + '&location=' + encodeURIComponent(calLocation()) + '&details=' + encodeURIComponent((W.share || {}).description || '');
  }
  function icsText() {
    var t = calTimes();
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding-invite-kit//KR', 'BEGIN:VEVENT',
      'UID:' + t[0] + '-wedding@invite', 'DTSTAMP:' + t[0], 'DTSTART:' + t[0], 'DTEND:' + t[1],
      'SUMMARY:' + calTitle(), 'LOCATION:' + calLocation(), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  // 아이폰: 파일 링크 대신 일정 데이터를 사파리에 직접 넘기면 "구독"이 아니라 "캘린더에 추가" 창이 뜹니다
  function appleCal() {
    var b64 = btoa(unescape(encodeURIComponent(icsText())));
    location.assign('data:text/calendar;charset=utf-8;base64,' + b64);
  }
  function icsLink() {
    var g = W.groom || {}, b = W.bride || {}, v = W.venue || {};
    var start = d.year + pad(d.month) + pad(d.day) + 'T' + pad(d.hour || 0) + pad(d.minute || 0) + '00';
    var endH = (d.hour || 0) + 2;
    var end = d.year + pad(d.month) + pad(d.day) + 'T' + pad(endH) + pad(d.minute || 0) + '00';
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding//KR', 'BEGIN:VEVENT',
      'DTSTART;TZID=Asia/Seoul:' + start, 'DTEND;TZID=Asia/Seoul:' + end,
      'SUMMARY:' + (g.short || g.name) + ' ♥ ' + (b.short || b.name) + ' 결혼식',
      'LOCATION:' + (v.name || '') + ' ' + (v.hall || '') + ' ' + (v.address || ''),
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  function share() {
    var s = W.share || {};
    var url = location.href;
    if (navigator.share) navigator.share({ title: s.title || document.title, text: s.description || '', url: url }).catch(function () {});
    else copy(url, '링크를 복사했어요');
  }

  function openUrl(u) { if (u) window.open(u, '_blank'); else toast('링크가 아직 설정되지 않았어요'); }

  window.WD = {
    cfg: W, dateObj: dateObj, pad: pad,
    weekday: DAYS[dateObj.getDay()],
    dateText: d.year + '년 ' + d.month + '월 ' + d.day + '일 ' + DAYS[dateObj.getDay()],
    dateShort: d.year + '.' + pad(d.month) + '.' + pad(d.day),
    timeText: timeText(), dday: dday, fill: fill, esc: esc, toast: toast, copy: copy, icsLink: icsLink, icsText: icsText, gcalLink: gcalLink, appleCal: appleCal, share: share, openUrl: openUrl,
    passcode: pad(d.month) + pad(d.day)
  };
})();
