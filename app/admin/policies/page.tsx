"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./policies.module.css";

type Policy = { fee: number; reward: number; cap: number; effective: string; version: string };
type Request = { id: string; fee: number; reward: number; cap: number; effective: string; reason: string; created: string; status: "pending" | "approved" | "rejected"; reviewer?: string; reviewedAt?: string };

const initialPolicy: Policy = { fee: 3, reward: 5, cap: 50000, effective: "2026-11-07", version: "v1.0" };
const initialRequests: Request[] = [
  { id: "POL-0002", fee: 2.5, reward: 4, cap: 40000, effective: "2026-11-15", reason: "Thử nghiệm chính sách ưu đãi mùa cuối năm tại nhóm cửa hàng pilot.", created: "2026-11-07 09:30", status: "pending" },
];

const money = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export default function PolicyAdminPage() {
  const [policy, setPolicy] = useState<Policy>(initialPolicy);
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [loaded, setLoaded] = useState(false);
  const [fee, setFee] = useState("2.5");
  const [reward, setReward] = useState("4");
  const [cap, setCap] = useState("40000");
  const [effective, setEffective] = useState("2026-11-15");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState<"operator" | "owner">("operator");
  const [notice, setNotice] = useState("Đây là môi trường mô phỏng. Không kết nối dữ liệu giao dịch thật.");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("xoai-policy-demo-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.policy && Array.isArray(parsed.requests)) {
          setPolicy(parsed.policy);
          setRequests(parsed.requests);
        }
      }
    } catch { /* Keep the safe sample state if local storage is unavailable. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("xoai-policy-demo-v1", JSON.stringify({ policy, requests }));
  }, [policy, requests, loaded]);

  const pending = requests.filter((r) => r.status === "pending").length;
  const latest = useMemo(() => [...requests].sort((a, b) => b.id.localeCompare(a.id)), [requests]);

  function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Number(fee), rw = Number(reward), c = Number(cap);
    if (!Number.isFinite(f) || f < 0 || f > 10 || !Number.isFinite(rw) || rw < 0 || rw > 100 || !Number.isFinite(c) || c < 0 || !reason.trim()) {
      setNotice("Vui lòng kiểm tra tỷ lệ, hạn mức và lý do thay đổi.");
      return;
    }
    const nextId = "POL-" + String(Math.max(2, ...requests.map((r) => Number(r.id.split("-")[1]) || 0)) + 1).padStart(4, "0");
    setRequests((prev) => [{ id: nextId, fee: f, reward: rw, cap: c, effective, reason: reason.trim(), created: new Date().toLocaleString("vi-VN"), status: "pending" }, ...prev]);
    setReason("");
    setShowForm(false);
    setNotice("Đã tạo yêu cầu. Chính sách hiện tại chưa thay đổi; cần người có quyền phê duyệt.");
  }

  function review(id: string, decision: "approved" | "rejected") {
    if (role !== "owner") {
      setNotice("Tài khoản mô phỏng hiện tại chỉ có quyền đề xuất. Chuyển sang vai trò Chủ sở hữu để thử thao tác phê duyệt.");
      return;
    }
    const target = requests.find((r) => r.id === id);
    if (!target || target.status !== "pending") return;
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: decision, reviewer: "Chủ sở hữu (demo)", reviewedAt: new Date().toLocaleString("vi-VN") } : r));
    if (decision === "approved" && target.effective <= new Date().toISOString().slice(0, 10)) {
      setPolicy({ fee: target.fee, reward: target.reward, cap: target.cap, effective: target.effective, version: "v" + (Number(policy.version.replace("v", "")) + 0.1).toFixed(1) });
      setNotice("Đã phê duyệt và kích hoạt chính sách trong bản demo.");
    } else if (decision === "approved") {
      setNotice("Đã phê duyệt. Chính sách được lên lịch; bản demo chưa có bộ lập lịch chạy nền để tự kích hoạt vào ngày tương lai.");
    } else {
      setNotice("Yêu cầu đã bị từ chối. Chính sách hiện tại không thay đổi.");
    }
  }

  function resetDemo() {
    setPolicy(initialPolicy);
    setRequests(initialRequests);
    localStorage.removeItem("xoai-policy-demo-v1");
    setNotice("Đã khôi phục dữ liệu mẫu ban đầu.");
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/"><span className={styles.logo}>X</span><span>Xoài Go <small>ADMIN</small></span></a>
        <div className={styles.topActions}>
          <span className={styles.demoTag}>DEMO · SANDBOX</span>
          <label className={styles.rolePicker}>Vai trò mô phỏng
            <select value={role} onChange={(e) => setRole(e.target.value as "operator" | "owner")}>
              <option value="operator">Người đề xuất</option>
              <option value="owner">Chủ sở hữu / Người duyệt</option>
            </select>
          </label>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sideLabel}>WORKSPACE</div>
          <a className={styles.sideItem} href="/">⌂ <span>Tổng quan</span></a>
          <a className={styles.sideItem} href="#policies">▤ <span>Giao dịch</span></a>
          <a className={styles.sideItemActive} href="#policies">⚙ <span>Chính sách</span></a>
          <a className={styles.sideItem} href="#history">◷ <span>Lịch sử phiên bản</span></a>
          <div className={styles.sideFoot}>XOÀI GO<br/><small>Policy Control Center</small></div>
        </aside>

        <section className={styles.content}>
          <div className={styles.pageHead}>
            <div><div className={styles.eyebrow}>QUẢN TRỊ HỆ THỐNG / CHÍNH SÁCH</div><h1>Kiểm soát thay đổi chính sách</h1><p>Mọi thay đổi phải được kiểm tra và phê duyệt trước khi có hiệu lực.</p></div>
            <button className={styles.primaryBtn} onClick={() => setShowForm((v) => !v)}>＋ Tạo yêu cầu thay đổi</button>
          </div>

          <div className={styles.notice}>ⓘ {notice}</div>
          <div className={styles.warning}>Bản thử nghiệm giao diện: dữ liệu chỉ lưu trên trình duyệt này. Phân quyền đang mô phỏng, chưa phải xác thực bảo mật thật và không được dùng để vận hành tiền/điểm thật.</div>

          <div className={styles.stats}>
            <article><span>Phí nền tảng hiện tại</span><strong>{policy.fee}%</strong><small>Áp dụng theo phiên bản {policy.version}</small></article>
            <article><span>Tỷ lệ thưởng hiện tại</span><strong>{policy.reward}%</strong><small>Chính sách đang có hiệu lực</small></article>
            <article><span>Hạn mức thưởng / giao dịch</span><strong>{money(policy.cap)}</strong><small>Giới hạn theo chính sách</small></article>
            <article><span>Yêu cầu chờ duyệt</span><strong>{pending}</strong><small>Cần người có thẩm quyền xử lý</small></article>
          </div>

          {showForm && <form className={styles.formCard} onSubmit={submitRequest}>
            <div className={styles.formHead}><div><h2>Đề xuất thay đổi chính sách</h2><p>Gửi yêu cầu để người có quyền xem xét. Chưa thay đổi chính sách đang áp dụng.</p></div><button type="button" className={styles.closeBtn} onClick={() => setShowForm(false)}>×</button></div>
            <div className={styles.formGrid}>
              <label>Phí nền tảng (%)<input type="number" min="0" max="10" step="0.1" value={fee} onChange={(e) => setFee(e.target.value)} required/></label>
              <label>Tỷ lệ thưởng (%)<input type="number" min="0" max="100" step="0.1" value={reward} onChange={(e) => setReward(e.target.value)} required/></label>
              <label>Hạn mức thưởng / giao dịch (đ)<input type="number" min="0" step="1000" value={cap} onChange={(e) => setCap(e.target.value)} required/></label>
              <label>Ngày dự kiến có hiệu lực<input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} required/></label>
              <label className={styles.full}>Lý do thay đổi<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nêu lý do, phạm vi cửa hàng áp dụng và tác động dự kiến..." required/></label>
            </div>
            <div className={styles.formFoot}><span>Quy trình: Đề xuất → Kiểm tra → Phê duyệt → Hiệu lực</span><button className={styles.primaryBtn} type="submit">Gửi yêu cầu phê duyệt</button></div>
          </form>}

          <section className={styles.panel} id="policies">
            <div className={styles.panelHead}><div><h2>Yêu cầu thay đổi</h2><p>Người đề xuất không thể tự phê duyệt yêu cầu của mình.</p></div><span className={styles.count}>{requests.length} yêu cầu</span></div>
            <div className={styles.requestList}>
              {latest.map((r) => <article className={styles.request} key={r.id}>
                <div className={styles.requestTop}><div><b>{r.id}</b><span className={r.status === "pending" ? styles.pending : r.status === "approved" ? styles.approved : styles.rejected}>{r.status === "pending" ? "Chờ phê duyệt" : r.status === "approved" ? "Đã phê duyệt" : "Đã từ chối"}</span></div><small>Tạo lúc {r.created}</small></div>
                <div className={styles.changeGrid}><div><small>Phí nền tảng</small><b>{r.fee}%</b></div><div><small>Tỷ lệ thưởng</small><b>{r.reward}%</b></div><div><small>Hạn mức / giao dịch</small><b>{money(r.cap)}</b></div><div><small>Ngày hiệu lực dự kiến</small><b>{r.effective}</b></div></div>
                <p className={styles.reason}>{r.reason}</p>
                {r.reviewer && <small className={styles.reviewMeta}>Xử lý bởi {r.reviewer} · {r.reviewedAt}</small>}
                {r.status === "pending" && <div className={styles.reviewActions}><span>{role === "owner" ? "Bạn đang ở vai trò người phê duyệt (mô phỏng)." : "Đăng nhập vai trò người duyệt để thử bước phê duyệt."}</span><div><button className={styles.rejectBtn} onClick={() => review(r.id, "rejected")}>Từ chối</button><button className={styles.approveBtn} onClick={() => review(r.id, "approved")}>Phê duyệt</button></div></div>}
              </article>)}
              {requests.length === 0 && <div className={styles.empty}>Chưa có yêu cầu thay đổi nào.</div>}
            </div>
          </section>

          <section className={styles.panel} id="history">
            <div className={styles.panelHead}><div><h2>Lịch sử chính sách</h2><p>Phiên bản hiện tại và các yêu cầu đã xử lý được lưu để tra cứu.</p></div></div>
            <div className={styles.historyRow}><span className={styles.liveDot}/><div><b>{policy.version} · Đang áp dụng</b><small>Phí {policy.fee}% · Thưởng {policy.reward}% · Hạn mức {money(policy.cap)}</small></div><time>{policy.effective}</time></div>
            {latest.filter((r) => r.status !== "pending").map((r) => <div className={styles.historyRow} key={r.id}><span className={r.status === "approved" ? styles.liveDot : styles.offDot}/><div><b>{r.id} · {r.status === "approved" ? "Đã phê duyệt" : "Đã từ chối"}</b><small>Phí {r.fee}% · Thưởng {r.reward}% · {r.reason}</small></div><time>{r.reviewedAt}</time></div>)}
          </section>

          <div className={styles.bottomActions}><button className={styles.resetBtn} onClick={resetDemo}>Khôi phục dữ liệu mẫu</button><span>Demo tương tác · Không kết nối Supabase · Không tác động app khách hàng</span></div>
        </section>
      </div>
    </main>
  );
}
