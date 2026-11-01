"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type FormKind = "CUSTOMER" | "MERCHANT";

const categories = ["Quán ăn", "Cà phê / trà", "Mẹ và bé", "Làm đẹp / cắt tóc", "Cơ sở cung ứng thực phẩm", "Khác"];
const cooperationOptions = [
  ["member_offer", "Ưu đãi cho thành viên"],
  ["group_sell", "Tham gia bán mua chung"],
  ["wholesale_buy", "Mua nguyên liệu giá sỉ"],
  ["consult", "Muốn được tư vấn thêm"],
] as const;

export default function RegisterForm() {
  const [kind, setKind] = useState<FormKind>("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openedAt, setOpenedAt] = useState(Date.now());
  const [cooperation, setCooperation] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const syncHash = () => {
      setKind(window.location.hash === "#dang-ky-quan" ? "MERCHANT" : "CUSTOMER");
      setMessage("");
      setError("");
      setConsent(false);
      setCooperation([]);
      setOpenedAt(Date.now());
      window.setTimeout(() => document.getElementById("dang-ky")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const source = useMemo(() => {
    if (typeof window === "undefined") return "direct";
    const params = new URLSearchParams(window.location.search);
    return params.get("utm_source") || params.get("source") || "direct";
  }, []);

  function switchKind(next: FormKind) {
    setKind(next);
    setMessage("");
    setError("");
    setConsent(false);
    setCooperation([]);
    setOpenedAt(Date.now());
    if (typeof window !== "undefined") {
      const hash = next === "MERCHANT" ? "#dang-ky-quan" : "#dang-ky";
      window.history.replaceState(null, "", hash);
    }
  }

  function toggleCooperation(value: string) {
    setCooperation((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setLoading(true);
    setMessage("");
    setError("");
    const payload: Record<string, unknown> = {
      type: kind,
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      location: String(form.get("location") || "").trim(),
      consent,
      website: String(form.get("website") || ""),
      elapsedMs: Date.now() - openedAt,
      source,
    };
    if (kind === "CUSTOMER") {
      payload.interest = String(form.get("interest") || "");
    } else {
      payload.store_name = String(form.get("store_name") || "").trim();
      payload.category = String(form.get("category") || "");
      payload.cooperation = cooperation;
      payload.note = String(form.get("note") || "").trim();
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error("register_failed");
      setMessage(kind === "CUSTOMER"
        ? "Cảm ơn bạn! Xoài Go đã nhận thông tin và sẽ liên hệ khi mở đăng ký."
        : "Cảm ơn! Xoài Go sẽ liên hệ cửa hàng bạn sớm.");
      formElement.reset();
      setConsent(false);
      setCooperation([]);
    } catch {
      setError("Chưa gửi được. Bạn thử lại hoặc nhắn Zalo 0932467282.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="reg-section wrap" id="dang-ky">
      <div className="reg-heading">
        <span className="eyebrow">THAM GIA CỘNG ĐỒNG XOÀI GO</span>
        <h2>Bắt đầu từ một <em>đăng ký nhỏ.</em></h2>
        <p>Chọn hình thức phù hợp để Xoài Go có thể kết nối với bạn.</p>
      </div>
      <div className="reg-card">
        <div className="reg-tabs" role="tablist" aria-label="Loại đăng ký">
          <button type="button" role="tab" aria-selected={kind === "CUSTOMER"} className={kind === "CUSTOMER" ? "is-active" : ""} onClick={() => switchKind("CUSTOMER")}>Tôi là khách</button>
          <button type="button" role="tab" aria-selected={kind === "MERCHANT"} className={kind === "MERCHANT" ? "is-active" : ""} onClick={() => switchKind("MERCHANT")}>Tôi là cửa hàng</button>
        </div>
        <div className="reg-form-wrap">
          <h3>{kind === "CUSTOMER" ? "Đăng ký sớm cho thành viên" : "Đăng ký đối tác"}</h3>
          <p className="reg-description">{kind === "CUSTOMER"
            ? "Để lại thông tin, Xoài Go sẽ báo cho bạn khi mở đăng ký thành viên và khi có quán, ưu đãi đầu tiên."
            : "Để lại thông tin, Xoài Go sẽ liên hệ trao đổi trực tiếp. Chưa có cam kết nào được ký bằng việc đăng ký này."}</p>
          <form onSubmit={submit} key={kind}>
            {kind === "MERCHANT" && <label className="reg-field">Tên cửa hàng<input name="store_name" required minLength={2} maxLength={80} autoComplete="organization" /></label>}
            <div className="reg-two-col">
              <label className="reg-field">{kind === "CUSTOMER" ? "Họ và tên" : "Người liên hệ"}<input name="name" required minLength={2} maxLength={60} autoComplete="name" /></label>
              <label className="reg-field">Số điện thoại (Zalo nếu có)<input name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="09xxxxxxxx hoặc +849xxxxxxxx" pattern="^(0|\+84)[0-9]{9,10}$" /></label>
            </div>
            <label className="reg-field">{kind === "CUSTOMER" ? "Khu vực bạn sống hoặc làm việc" : "Địa chỉ cửa hàng"}<input name="location" required minLength={kind === "CUSTOMER" ? 2 : 5} maxLength={kind === "CUSTOMER" ? 80 : 150} placeholder={kind === "CUSTOMER" ? "Ví dụ: gần cầu Rồng" : "Số nhà, đường, phường..."} /></label>
            {kind === "CUSTOMER" ? (
              <fieldset className="reg-fieldset">
                <legend>Bạn quan tâm đến</legend>
                <label className="reg-choice"><input type="radio" name="interest" value="offers" required /> Ưu đãi tại cửa hàng</label>
                <label className="reg-choice"><input type="radio" name="interest" value="group" /> Mua chung giá tốt</label>
                <label className="reg-choice"><input type="radio" name="interest" value="both" /> Cả hai</label>
              </fieldset>
            ) : (
              <>
                <label className="reg-field">Ngành hàng<select name="category" required defaultValue=""><option value="" disabled>Chọn ngành hàng</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <fieldset className="reg-fieldset">
                  <legend>Nhu cầu hợp tác <span>(chọn ít nhất một)</span></legend>
                  {cooperationOptions.map(([value, label]) => <label className="reg-choice" key={value}><input type="checkbox" checked={cooperation.includes(value)} onChange={() => toggleCooperation(value)} /> {label}</label>)}
                </fieldset>
                <label className="reg-field">Ghi chú thêm <textarea name="note" maxLength={300} rows={3} placeholder="Thông tin bạn muốn Xoài Go biết thêm..." /></label>
              </>
            )}
            <label className="reg-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="reg-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /> <span>Tôi đồng ý để Xoài Go lưu và sử dụng thông tin tôi cung cấp ở trên để liên hệ với tôi về chương trình thành viên và hợp tác.</span></label>
            <div className="reg-privacy">
              <p>Thông tin chỉ được sử dụng để liên hệ về chương trình thành viên và hợp tác của Xoài Go. Bạn có thể yêu cầu xem, sửa hoặc xóa thông tin qua email <a href="mailto:tieudungdanang@gmail.com">tieudungdanang@gmail.com</a>.</p>
              <details><summary>Xem chi tiết</summary><ul>
                <li>Thông tin thu thập: họ tên, số điện thoại, khu vực hoặc địa chỉ cửa hàng, lựa chọn quan tâm, nhu cầu hợp tác và ghi chú (nếu có).</li>
                <li>Mục đích: liên hệ về chương trình thành viên, ưu đãi, mua chung và hợp tác; thông báo khi Xoài Go mở đăng ký.</li>
                <li>Đơn vị vận hành hiển thị: Xoài Go. Liên hệ: tieudungdanang@gmail.com.</li>
                <li>Nơi lưu: Google Sheets, chỉ người được phân quyền trong nhóm vận hành Xoài Go truy cập; không bán dữ liệu hoặc chia sẻ cho bên thứ ba để quảng cáo.</li>
                <li>Thời gian lưu dự kiến: 12 tháng kể từ ngày đăng ký hoặc đến khi bạn yêu cầu xóa.</li>
                <li>Bạn có thể yêu cầu xem, sửa hoặc xóa dữ liệu qua email tieudungdanang@gmail.com.</li>
              </ul><p className="reg-draft-note">Thông tin quyền riêng tư đang được rà soát pháp lý; bản chính thức sẽ được cập nhật trước khi mở đăng ký rộng rãi.</p></details>
            </div>
            {error && <p className="reg-error" role="alert">{error}</p>}
            {message && <p className="reg-success" role="status">{message}</p>}
            <button className="btn btn-primary reg-submit" type="submit" disabled={loading || !consent || (kind === "MERCHANT" && cooperation.length === 0)}>{loading ? "Đang gửi..." : kind === "CUSTOMER" ? "Đăng ký sớm" : "Đăng ký đối tác"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
