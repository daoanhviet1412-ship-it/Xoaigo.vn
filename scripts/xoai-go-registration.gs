function setupSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var raw = spreadsheet.getSheetByName("RAW") || spreadsheet.insertSheet("RAW");
  var headers = [
    "submitted_at", "id", "type", "name", "phone", "location", "interest",
    "store_name", "category", "cooperation", "note", "consent",
    "consent_version", "source", "duplicate", "status", "owner", "internal_note"
  ];
  if (raw.getLastRow() === 0) raw.appendRow(headers);

  var summary = spreadsheet.getSheetByName("TONG_HOP") || spreadsheet.insertSheet("TONG_HOP");
  summary.clear();
  summary.getRange("A1:B7").setValues([
    ["Chỉ số", "Giá trị"],
    ["Tổng khách hợp lệ", ""],
    ["Tổng cửa hàng hợp lệ", ""],
    ["Khách quan tâm ưu đãi", ""],
    ["Khách quan tâm mua chung", ""],
    ["Khách quan tâm cả hai", ""],
    ["Đăng ký trong 7 ngày gần nhất", ""]
  ]);
  summary.getRange("B2").setFormula('=COUNTIFS(RAW!C:C,"CUSTOMER",RAW!O:O,"<>TRUE")');
  summary.getRange("B3").setFormula('=COUNTIFS(RAW!C:C,"MERCHANT",RAW!O:O,"<>TRUE")');
  summary.getRange("B4").setFormula('=COUNTIFS(RAW!C:C,"CUSTOMER",RAW!G:G,"offers",RAW!O:O,"<>TRUE")');
  summary.getRange("B5").setFormula('=COUNTIFS(RAW!C:C,"CUSTOMER",RAW!G:G,"group",RAW!O:O,"<>TRUE")');
  summary.getRange("B6").setFormula('=COUNTIFS(RAW!C:C,"CUSTOMER",RAW!G:G,"both",RAW!O:O,"<>TRUE")');
  summary.getRange("B7").setFormula('=COUNTIFS(RAW!A:A,">="&TEXT(TODAY()-7,"yyyy-MM-dd"),RAW!O:O,"<>TRUE")');
  summary.setFrozenRows(1);
  raw.setFrozenRows(1);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents || "{}");
    var expected = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!expected || data.secret !== expected) return json_({ ok: false, error: "unauthorized" });
    if (data.consent !== true) return json_({ ok: false, error: "no_consent" });

    lock.waitLock(10000);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RAW");
    if (!sheet) throw new Error("Missing RAW sheet");
    var lastRow = sheet.getLastRow();
    var duplicate = false;
    var normalizedPhone = normalizePhone_(data.phone);
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 3, lastRow - 1, 3).getDisplayValues();
      for (var i = 0; i < rows.length; i++) {
        var storedPhone = String(rows[i][2] || "").replace(/^'+/, "").trim();
        if (rows[i][0] === data.type && normalizePhone_(storedPhone) === normalizedPhone) {
          duplicate = true;
          break;
        }
      }
    }

    var now = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      now, Utilities.getUuid(), data.type, data.name, "'" + normalizedPhone, data.location,
      data.interest || "", data.store_name || "", data.category || "", data.cooperation || "",
      data.note || "", true, data.consent_version || "v1-2026-11", data.source || "direct",
      duplicate, "new", "", ""
    ]);

    try {
      var subject = data.type === "MERCHANT"
        ? "[XOÀI GO] Cửa hàng đăng ký đối tác mới"
        : "[XOÀI GO] Khách hàng đăng ký mới";
      MailApp.sendEmail({
        to: "tieudungdanang@gmail.com",
        subject: subject,
        body: "Có đăng ký mới trên Xoài Go.\nLoại: " + data.type +
          "\nTên: " + (data.store_name || data.name) +
          "\nSố điện thoại: " + normalizedPhone +
          "\nKhu vực/địa chỉ: " + data.location +
          "\nMã đăng ký: " + sheet.getRange(sheet.getLastRow(), 2).getValue()
      });
    } catch (mailError) {
      console.error("Registration email notification failed: " + mailError);
    }
    return json_({ ok: true, duplicate: duplicate });
  } catch (error) {
    return json_({ ok: false, error: "server" });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function normalizePhone_(value) {
  var phone = String(value || "").replace(/^'+/, "").replace(/[\s().-]/g, "");
  return phone.indexOf("+84") === 0 ? "0" + phone.slice(3) : phone;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
