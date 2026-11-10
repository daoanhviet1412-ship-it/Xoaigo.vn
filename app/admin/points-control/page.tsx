"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PENDING_CONTROL_KEY, readPendingTransactions, summarizePending, writePendingTransactions, type PendingTransaction as Tx } from "@/lib/pending-control";

const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);
const money = (n: number) => fmt(n) + " điểm";
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #e4ece5", borderRadius: 16, padding: 18, boxShadow: "0 5px 20px rgba(20,60,35,.04)" };
const input: React.CSSProperties = { width: "100%", border: "1px solid #d8e3da", borderRadius: 9, padding: "11px 12px", marginTop: 6, color: "#183d2b", background: "#fff" };

export default function PendingControlPage() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [merchant, setMerchant] = useState("Mộc Xanh Coffee");
  const [orderRef, setOrderRef] = useState("");
  const [debit, setDebit] = useState("10000");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setRows(readPendingTransactions());
    setLoaded(true);
    const sync = (event: StorageEvent) => { if (!event.key || event.key === PENDING_CONTROL_KEY) setRows(readPendingTransactions()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => { if (loaded) { try { writePendingTransactions(rows); window.dispatchEvent(new CustomEvent("xoai-pending-updated")); } catch {} } }, [rows, loaded]);

  const summary = summarizePending(rows);
  const { customerPending, appPending, totalPending, merchantDebit, allocated, variance, mismatchCount: mismatchRowsCount } = summary;
  const stats = useMemo(() => [
    ["Pending Ví Khách", customerPending, "70% phân bổ"],
    ["Pending Ví App", appPending, "30% phân bổ"],
    ["Ví Pending tổng hợp", totalPending, "Chỉ thống kê · không phải ví ghi sổ thứ ba"],
    ["Tổng bị trừ Ví Quán", merchantDebit, "Tổng theo giao dịch còn hiệu lực"],
  ], [customerPending, appPending, totalPending, merchantDebit]);

  function addTransaction() {
    const amount = Number(debit);
    const ref = orderRef.trim();
    if (!ref) { setNotice("Nhập mã giao dịch / mã đơn để chống ghi trùng."); return; }
    if (!Number.isSafeInteger(amount) || amount <= 0) { setNotice("Số điểm trừ Ví Quán phải là số nguyên dương."); return; }
    if (rows.some(r => r.orderRef.toLowerCase() === ref.toLowerCase() && r.status !== "REVERSED")) { setNotice("Mã giao dịch đã tồn tại. Hệ thống chặn ghi trùng."); return; }
    const app = Math.round(amount * 0.3);
    const customer = amount - app;
    const tx: Tx = { id: "XO-PND-" + crypto.randomUUID(), merchant, orderRef: ref, merchantDebit: amount, customerPending: customer, appPending: app, createdAt: new Date().toISOString(), status: "PENDING" };
    setRows(prev => [tx, ...prev]);
    setOrderRef("");
    setNotice("Đã ghi nhận một lần trừ Ví Quán và hai phân bổ Pending theo tỷ lệ 70/30.");
  }
  function reverse(id: string) {
    if (!window.confirm("Đảo giao dịch này trong DEMO? Bản ghi gốc vẫn được giữ để truy vết.")) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "REVERSED", reversedAt: new Date().toISOString() } : r));
    setNotice("Đã đánh dấu đảo DEMO; không xóa sự kiện gốc.");
  }

  return <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", padding: "26px clamp(14px,3vw,34px)", fontFamily: "Arial,sans-serif" }}>
    <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gap: 18 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div><Link href="/admin" style={{ color: "#16864b", fontWeight: 800, textDecoration: "none" }}>XOÀI GO ADMIN</Link><h1 style={{ fontSize: 30, margin: "10px 0 5px" }}>Kiểm soát Pending & Đối soát Ví Quán</h1><p style={{ margin: 0, color: "#718078" }}>Phân bổ 70% Ví Khách · 30% Ví App · đối chiếu với khoản trừ Ví Quán.</p></div>
        <span style={{ background: "#fff3d9", color: "#936313", padding: "9px 13px", borderRadius: 30, fontWeight: 800, fontSize: 11 }}>PREVIEW · DEMO LOCAL · KHÔNG GHI SUPABASE</span>
      </header>
      <section style={{ ...panel, background: "#f0f8f1" }}><b>Quy tắc hiện hành</b><p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>Mỗi giao dịch: trừ điểm từ Ví Quán một lần; phân bổ 70% sang Pending Ví Khách và 30% sang Pending Ví App. Ví Pending tổng hợp chỉ cộng số liệu từ hai Pending trên, không tạo bút toán hoặc số dư thứ ba. Công thức 7% / 3% / 10% đã bị hủy và không được sử dụng tại màn hình này.</p></section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
        {stats.map(([label, value, note]) => <article key={String(label)} style={panel}><small style={{ color: "#728078" }}>{label}</small><strong style={{ display: "block", fontSize: 25, margin: "8px 0" }}>{money(Number(value))}</strong><small style={{ color: "#87948c" }}>{note}</small></article>)}
      </section>
      <section style={{ ...panel, borderColor: variance === 0 ? "#cfe6d4" : "#f0c5c1", background: variance === 0 ? "#f7fcf7" : "#fff7f6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><b>Kiểm tra tổng đối soát</b><p style={{ margin: "6px 0", color: "#728078" }}>Chênh lệch = Điểm bị trừ Ví Quán − (Pending Ví Khách + Pending Ví App)</p></div><strong style={{ fontSize: 25, color: variance === 0 ? "#16864b" : "#b42318" }}>{money(variance)}</strong></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 10 }}>
          <div><small>Ví Quán đã trừ</small><b style={{ display: "block", marginTop: 5 }}>{money(merchantDebit)}</b></div><div><small>Pending Khách + App</small><b style={{ display: "block", marginTop: 5 }}>{money(allocated)}</b></div><div><small>Kết quả</small><b style={{ display: "block", marginTop: 5, color: variance === 0 ? "#16864b" : "#b42318" }}>{variance === 0 ? "KHỚP" : "CẢNH BÁO CHÊNH LỆCH"}</b></div><div><small>Giao dịch đang lệch</small><b style={{ display: "block", marginTop: 5 }}>{mismatchRowsCount}</b></div>
        </div>
        {variance !== 0 && <p style={{ color: "#b42318", fontWeight: 700, marginBottom: 0 }}>Có sai lệch. Chỉ đưa vào hàng đợi điều tra; không tự sửa số dư hoặc tự tạo bút toán điều chỉnh.</p>}
      </section>
      <section style={panel}>
        <h2 style={{ marginTop: 0 }}>Ghi nhận giao dịch DEMO</h2><p style={{ color: "#728078", fontSize: 13 }}>Dùng để kiểm tra luồng nghiệp vụ trên trình duyệt. Không phải giao dịch thật.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <label style={{ fontSize: 12 }}>Cửa hàng<input value={merchant} onChange={e => setMerchant(e.target.value)} style={input} /></label>
          <label style={{ fontSize: 12 }}>Mã giao dịch / mã đơn<input value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="XO-ORDER-0001" style={input} /></label>
          <label style={{ fontSize: 12 }}>Điểm bị trừ từ Ví Quán<input type="number" min="1" step="1" value={debit} onChange={e => setDebit(e.target.value)} style={input} /></label>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}><button onClick={addTransaction} style={{ border: 0, borderRadius: 9, padding: "11px 16px", background: "#16864b", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Ghi nhận trừ Ví Quán & phân bổ 70/30</button><button onClick={() => { if (window.confirm("Xóa toàn bộ dữ liệu DEMO trên trình duyệt này?")) { setRows([]); setNotice("Đã xóa dữ liệu DEMO local."); } }} style={{ border: "1px solid #dbe6dd", borderRadius: 9, padding: "11px 14px", background: "#fff", cursor: "pointer" }}>Reset DEMO</button></div>
        {notice && <p role="status" style={{ color: "#16864b", fontSize: 13, marginBottom: 0 }}>{notice}</p>}
      </section>
      <section style={{ ...panel, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div><h2 style={{ margin: 0 }}>Bảng giao dịch & kiểm tra trùng khớp</h2><small style={{ color: "#728078" }}>{rows.length} bản ghi · cùng mã giao dịch xuyên suốt các phân bổ</small></div><span style={{ color: mismatchRowsCount ? "#b42318" : "#16864b", fontWeight: 800 }}>{mismatchRowsCount ? "Cần điều tra" : "Không có chênh lệch"}</span></div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000, fontSize: 12 }}><thead><tr>{["Mã giao dịch","Cửa hàng","Ví Quán bị trừ","Pending Khách 70%","Pending App 30%","Tổng Pending","Chênh lệch","Trạng thái","Thao tác"].map(h => <th key={h} style={{ textAlign: "left", padding: 12, background: "#f8fbf8", color: "#718078", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead><tbody>{rows.map(r => { const diff = r.status === "REVERSED" ? 0 : r.merchantDebit - r.customerPending - r.appPending; const bad = diff !== 0; return <tr key={r.id} style={{ borderTop: "1px solid #edf2ee", background: bad ? "#fff8f7" : "#fff" }}><td style={{ padding: 12, whiteSpace: "nowrap" }}><b>{r.orderRef}</b><small style={{ display: "block", color: "#87948c" }}>{new Date(r.createdAt).toLocaleString("vi-VN")}</small></td><td style={{ padding: 12 }}>{r.merchant}</td><td style={{ padding: 12 }}>{money(r.merchantDebit)}</td><td style={{ padding: 12 }}>{money(r.customerPending)}</td><td style={{ padding: 12 }}>{money(r.appPending)}</td><td style={{ padding: 12 }}>{money(r.customerPending + r.appPending)}</td><td style={{ padding: 12, color: bad ? "#b42318" : "#16864b", fontWeight: 800 }}>{money(diff)}</td><td style={{ padding: 12, color: r.status === "REVERSED" ? "#87948c" : bad ? "#b42318" : "#16864b" }}>{r.status === "REVERSED" ? "Đã đảo" : bad ? "Cảnh báo lệch" : r.status === "RELEASED" ? "Đã giải phóng" : "Pending · DEMO"}</td><td style={{ padding: 12 }}>{r.status !== "REVERSED" && <button onClick={() => reverse(r.id)} style={{ border: "1px solid #e6c9c6", color: "#a33", background: "#fff", borderRadius: 7, padding: "6px 9px", cursor: "pointer" }}>Đảo DEMO</button>}</td></tr>; })}{rows.length === 0 && <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", color: "#87948c" }}>Chưa có giao dịch. Tạo một giao dịch DEMO để kiểm tra 70/30.</td></tr>}</tbody></table></div>
      </section>
      <section style={{ ...panel, background: "#fffaf0", borderColor: "#f0e4c9", color: "#796b4f", fontSize: 12, lineHeight: 1.7 }}><b>Giới hạn bản Preview:</b> dữ liệu lưu localStorage trên trình duyệt hiện tại; chưa kết nối Supabase, POS, QR hoặc ngân hàng. Bản này chưa tự động giải phóng Pending vì thời hạn/điều kiện release chưa được chốt lại. Sai lệch được cảnh báo, không tự động điều chỉnh. Đây là màn hình thử nghiệm nghiệp vụ, chưa phải sổ cái tiền/điểm thật.</section>
    </div>
  </main>;
}
