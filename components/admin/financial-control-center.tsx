"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { makeInitialState, migrateDemoState, money, number, project, type DemoState } from "@/lib/demo-engine";

const STORAGE_KEY = "xoai-demo-engine-v3";
const LEGACY_STORAGE_KEY = "xoai-demo-engine-v2";
type WalletTab = "overview" | "customer" | "merchant" | "xoai" | "reserve" | "cash";
const tabs: { id: WalletTab; label: string; href: string }[] = [
  { id: "overview", label: "Tổng quan", href: "/admin/finance" },
  { id: "customer", label: "Ví Khách", href: "/admin/finance?wallet=customer" },
  { id: "merchant", label: "Ví Quán", href: "/admin/finance?wallet=merchant" },
  { id: "xoai", label: "Ví doanh thu điểm Xoài", href: "/admin/finance?wallet=xoai" },
  { id: "reserve", label: "Quỹ điểm", href: "/admin/finance?wallet=reserve" },
  { id: "cash", label: "Tài khoản tiền VND", href: "/admin/finance?wallet=cash" },
];
const palette = ["#16864b", "#4d8fc7", "#d69a32", "#9271c8", "#d46d68"];

function Doughnut({ title, subtitle, items, unit }: { title: string; subtitle: string; items: { label: string; value: number }[]; unit: string }) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  let offset = 0;
  return <section className="fc-panel">
    <div className="fc-panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="fc-unit">{unit}</span></div>
    {total <= 0 ? <div className="fc-empty"><b>Chưa có dữ liệu đủ điều kiện</b><span>Không dựng số liệu hoặc tỷ trọng khi mẫu số bằng 0.</span></div> : <div className="fc-donut-layout">
      <div className="fc-donut-wrap"><svg viewBox="0 0 120 120" role="img" aria-label={title}>
        <circle cx="60" cy="60" r="43" fill="none" stroke="#edf2ee" strokeWidth="15" />
        {items.map((item, index) => {
          const value = Math.max(0, item.value);
          const pct = value / total * 100;
          const dash = pct * 2.7018;
          const current = offset;
          offset += dash;
          if (value <= 0) return null;
          return <circle key={item.label} cx="60" cy="60" r="43" fill="none" stroke={palette[index % palette.length]} strokeWidth="15" strokeDasharray={`${dash} ${270.18 - dash}`} strokeDashoffset={-current} transform="rotate(-90 60 60)" />;
        })}
        <text x="60" y="56" textAnchor="middle" className="fc-donut-total">{number(total)}</text>
        <text x="60" y="70" textAnchor="middle" className="fc-donut-unit">{unit}</text>
      </svg></div>
      <div className="fc-legend">{items.map((item, index) => <div className="fc-legend-row" key={item.label}><span className="fc-legend-label"><i style={{ background: palette[index % palette.length] }} />{item.label}</span><b>{number(item.value)} <small>{(item.value / total * 100).toFixed(1)}%</small></b></div>)}</div>
    </div>}
  </section>;
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="fc-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export function FinancialControlCenter({ wallet = "overview" }: { wallet?: string }) {
  const [state, setState] = useState<DemoState>(() => makeInitialState());
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.events) && Array.isArray(parsed?.policies)) {
          const migrated = migrateDemoState(parsed);
          setState(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        }
      }
    } catch { /* Keep the safe seed DEMO when browser storage is unavailable. */ }
    setLoaded(true);
  }, []);
  const data = useMemo(() => project(state), [state]);
  const customerBalances = useMemo(() => ({
    available: data.customers.reduce((sum: number, customer: { available: number }) => sum + customer.available, 0),
    pending: data.customers.reduce((sum: number, customer: { pending: number }) => sum + customer.pending, 0),
    held: data.customers.reduce((sum: number, customer: { held: number }) => sum + customer.held, 0),
  }), [data]);
  const activeTab = tabs.some((tab) => tab.id === wallet) ? wallet as WalletTab : "overview";
  const customerRows = data.customers.slice(0, 12);
  const merchantRows = data.stores.slice(0, 12);

  return <main className="fc-page">
    <div className="fc-inner">
      <header className="fc-heading"><div><p className="fc-eyebrow">XOÀI GO · FINANCE CONTROL</p><h1>{activeTab === "overview" ? "Trung tâm kiểm soát tài chính" : tabs.find((tab) => tab.id === activeTab)?.label}</h1><p>Mỗi ví một trang thống kê · Một sổ sự kiện trung tâm · Tiền và điểm tách biệt.</p></div><span className="fc-demo-tag">PREVIEW · DEMO LOCAL</span></header>
      <nav className="fc-tabs">{tabs.map((tab) => <Link key={tab.id} href={tab.href} className={activeTab === tab.id ? "active" : ""}>{tab.label}</Link>)}</nav>
      <div className="fc-warning"><b>Dữ liệu DEMO, không phải số dư thật.</b> Dữ liệu lấy từ event engine lưu trong trình duyệt. Các ví Quán, doanh thu điểm Xoài và quỹ điểm chưa có sổ điểm phân bổ đầy đủ; hệ thống không tự dựng số liệu cho các ví này.</div>

      {activeTab === "overview" && <>
        <section className="fc-section-label"><h2>Tổng quan điểm</h2><span>Đơn vị: điểm · không quy đổi thành VND</span></section>
        <div className="fc-stats">
          <Stat label="Điểm khả dụng ví Khách" value={number(customerBalances.available)} note="Available · có thể sử dụng theo chính sách" />
          <Stat label="Điểm Pending ví Khách" value={number(customerBalances.pending)} note="Đang chờ đủ điều kiện giải phóng" />
          <Stat label="Điểm Held ví Khách" value={number(customerBalances.held)} note="Tạm giữ · không được sử dụng" />
          <Stat label="Điểm khách đã tiêu" value={number(data.pointsRedeemedNet)} note="Luồng phát sinh ròng trong DEMO" />
        </div>
        <div className="fc-charts">
          <Doughnut title="Cơ cấu số dư ví Khách" subtitle="Phân bổ theo trạng thái số dư" items={[{label:"Available",value:customerBalances.available},{label:"Pending",value:customerBalances.pending},{label:"Held",value:customerBalances.held}]} unit="điểm" />
          <Doughnut title="Quỹ điểm phát hành" subtitle="Chưa có registry tổng cung được nối vào DEMO" items={[]} unit="điểm" />
        </div>
        <section className="fc-section-label"><h2>Tổng quan tiền VND</h2><span>Không đồng nhất với điểm hoặc backing DEMO</span></section>
        <div className="fc-stats">
          <Stat label="Giá trị hóa đơn DEMO" value={money(data.gmvNet)} note="GMV ròng sau sự kiện đảo" />
          <Stat label="Tiền khách trả theo DEMO" value={money(data.cashPaidNet)} note="Chưa có bằng chứng POS/ngân hàng" />
          <Stat label="Phí snapshot" value={money(data.cashFeeNet)} note="Phí tiền mặt snapshot, chưa xác nhận đã thu" />
          <Stat label="Tiền thực có" value="Chưa xác minh" note="Chưa kết nối sao kê hoặc bank register" />
        </div>
        <div className="fc-charts">
          <Doughnut title="Cơ cấu phí snapshot" subtitle="Chưa có phân loại nguồn thu thực nhận" items={[]} unit="VND" />
          <section className="fc-panel"><div className="fc-panel-head"><div><h2>Đi đến thống kê từng ví</h2><p>Chọn từng phân hệ để xem chỉ số và dữ liệu tương ứng.</p></div></div><div className="fc-wallet-links">{tabs.slice(1).map((tab) => <Link key={tab.id} href={tab.href}>{tab.label}<span>→</span></Link>)}</div></section>
        </div>
      </>}

      {activeTab === "customer" && <>
        <section className="fc-stats">
          <Stat label="Available" value={number(customerBalances.available)} note="Số điểm khả dụng khách có thể chi" />
          <Stat label="Pending" value={number(customerBalances.pending)} note="Chưa đủ điều kiện giải phóng" />
          <Stat label="Held" value={number(customerBalances.held)} note="Tạm giữ" />
          <Stat label="Đã tiêu ròng" value={number(data.pointsRedeemedNet)} note="Chỉ số luồng, không phải số dư" />
        </section>
        <Doughnut title="Cơ cấu ví Khách" subtitle="Số dư theo trạng thái" items={[{label:"Available",value:customerBalances.available},{label:"Pending",value:customerBalances.pending},{label:"Held",value:customerBalances.held}]} unit="điểm" />
        <section className="fc-panel"><div className="fc-panel-head"><div><h2>Danh sách ví Khách (12 mẫu)</h2><p>Dữ liệu tổng hợp từ synthetic customers của DEMO.</p></div></div><div className="fc-table-wrap"><table><thead><tr><th>Mã thành viên</th><th>Thành viên</th><th>Available</th><th>Pending</th><th>Held</th></tr></thead><tbody>{customerRows.map((customer: { id: string; name: string; available: number; pending: number; held: number }) => <tr key={customer.id}><td>{customer.id}</td><td>{customer.name}</td><td>{number(customer.available)}</td><td>{number(customer.pending)}</td><td>{number(customer.held)}</td></tr>)}</tbody></table></div></section>
        <p className="fc-policy-note">Chính sách đã chốt: điểm hết hạn sau 6 tháng kể từ thời điểm cộng; tối thiểu 50.000 điểm/lần tiêu; tối đa mặc định 300.000 điểm/lần; bước chọn 10.000 điểm. Lưu ý: engine DEMO hiện chưa mô phỏng đầy đủ hạn dùng và giới hạn tiêu này.</p>
      </>}

      {activeTab === "merchant" && <><section className="fc-stats"><Stat label="Số quán trong bộ DEMO" value={number(data.stores.length)} note="Synthetic stores" /><Stat label="Điểm Quán Pending" value={number(data.merchantPointsPending)} note="Chờ điều kiện P32" /><Stat label="Điểm Quán Available" value={number(data.merchantPointsAvailable)} note="Đã qua Pending trong DEMO" /><Stat label="Cashback chờ quán bổ sung" value={number(data.cashbackPending)} note="App đã ghi nhận nghĩa vụ hoàn điểm" /><Stat label="Cashback quá hạn 3 ngày" value={number(data.cashbackOverdue)} note="Cảnh báo đỏ · giao dịch không bị chặn" /><Stat label="Backing DEMO (VND)" value={money(data.stores.reduce((sum: number, store: { backing: number; pendingBacking: number }) => sum + store.backing, 0))} note="Nguồn mô phỏng cũ, không phải điểm" /></section>{data.cashbackOrders.length > 0 && <section className="fc-panel"><div className="fc-panel-head"><div><h2>Theo dõi nghĩa vụ hoàn điểm</h2><p>App tính cashback trên phần tiền mặt khách trả; nguồn hoàn điểm được trừ từ Ví điểm quán.</p></div></div><div className="fc-table-wrap"><table><thead><tr><th>Mã đơn</th><th>Mã quán</th><th>Điểm cashback</th><th>Hạn xử lý</th><th>Trạng thái</th></tr></thead><tbody>{data.cashbackOrders.map((order: { saleEventId: string; orderId: string; storeId: string; points: number; dueAt: string; status: string; overdue: boolean }) => <tr key={order.saleEventId}><td>{order.orderId}</td><td>{order.storeId}</td><td>{number(order.points)}</td><td>{new Date(order.dueAt).toLocaleString("vi-VN")}</td><td><span className={order.overdue && order.status !== "Đã trừ Ví điểm quán" ? "fc-status-overdue" : "fc-status-pending"}>{order.status}</span></td></tr>)}</tbody></table></div></section>}<section className="fc-panel"><h2>Quán trong bộ DEMO</h2><div className="fc-table-wrap"><table><thead><tr><th>Mã quán</th><th>Tên quán</th><th>Điểm Pending</th><th>Điểm Available</th><th>Cashback đang chờ</th><th>Backing DEMO (VND)</th></tr></thead><tbody>{merchantRows.map((store: { id: string; name: string; backing: number; pendingBacking: number; pointsPending: number; pointsAvailable: number; cashbackPending: number }) => <tr key={store.id}><td>{store.id}</td><td>{store.name}</td><td>{number(store.pointsPending)}</td><td>{number(store.pointsAvailable)}</td><td>{number(store.cashbackPending ?? 0)}</td><td>{money(store.backing)}</td></tr>)}</tbody></table></div></section></>}

      {activeTab === "xoai" && <><section className="fc-stats"><Stat label="Điểm chiết khấu Pending" value={number(data.xoaiDiscountPointsPending)} note="Phần chiết khấu của quán dành cho Xoài" /><Stat label="Điểm chiết khấu Available" value={number(data.xoaiDiscountPointsAvailable)} note="Đã qua điều kiện P32 trong DEMO" /><Stat label="Tổng chiết khấu điểm phát sinh ròng" value={number(data.merchantDiscountPointsNet)} note="Luồng điểm, không phải VND" /><Stat label="Phí tiền mặt ròng" value={money(data.cashFeeNet)} note="VND, theo dõi riêng với điểm" /></section><div className="fc-empty-card"><b>Chưa có sổ điểm hết hạn của khách chuyển về ví Xoài.</b><span>Phần điểm chiết khấu từ giao dịch đã được tách riêng trong engine DEMO. Luồng điểm hết hạn 6 tháng chưa được mô phỏng.</span></div></>}
      {activeTab === "reserve" && <div className="fc-empty-card"><b>Chưa có registry quỹ điểm cố định.</b><span>Chưa có dữ liệu tổng quỹ điểm, đã phát hành và chưa phát hành để lập biểu đồ cơ cấu. Cần bổ sung point reserve registry và quy tắc chuyển trạng thái phát hành/thu hồi.</span></div>}
      {activeTab === "cash" && <><section className="fc-stats"><Stat label="GMV ròng DEMO" value={money(data.gmvNet)} note="Không phải tiền thực thu" /><Stat label="Tiền khách trả DEMO" value={money(data.cashPaidNet)} note="Chưa đối chiếu độc lập" /><Stat label="Phí snapshot" value={money(data.cashFeeNet)} note="Chưa xác nhận đã thu" /><Stat label="Tiền thực có" value="Chưa xác minh" note="Chưa có kết nối ngân hàng" /></section><Doughnut title="Cơ cấu số dư tiền theo tài khoản" subtitle="Chưa có bank register hoặc cash register" items={[]} unit="VND" /><div className="fc-empty-card"><b>Chưa có tài khoản tiền thực có được xác minh.</b><span>Không hiển thị phí dự kiến thành phí đã thu; không suy diễn số dư ví nghiệp vụ thành số dư ngân hàng.</span></div></>}

      <footer className="fc-footer"><span>{loaded ? "Đã đọc dữ liệu từ localStorage DEMO trên trình duyệt này." : "Đang tải dữ liệu DEMO..."}</span><Link href="/admin/ledger">Mở sổ sự kiện →</Link><Link href="/admin/reconciliation">Mở đối soát →</Link></footer>
    </div>
    <style jsx>{`
      .fc-page{min-height:calc(100vh - 64px);padding:28px clamp(14px,3vw,34px) 44px;background:#f5f8f5;color:#173d2b}
      .fc-inner{max-width:1480px;margin:0 auto;display:grid;gap:18px}
      .fc-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
      .fc-eyebrow{font-size:10px;font-weight:850;letter-spacing:1.8px;color:#16864b;margin:0 0 8px}
      .fc-heading h1{font-size:29px;letter-spacing:-.7px;margin:0}
      .fc-heading p:not(.fc-eyebrow){color:#7c8980;font-size:13px;margin:8px 0 0}
      .fc-demo-tag{background:#fff2d9;color:#8a5b12;padding:8px 12px;border-radius:20px;font-size:10px;font-weight:850}
      .fc-tabs{display:flex;gap:6px;flex-wrap:wrap;background:#fff;border:1px solid #e5ece7;padding:8px;border-radius:13px}
      .fc-tabs a{padding:9px 12px;border-radius:9px;text-decoration:none;color:#5d6d63;font-size:12px;font-weight:650}
      .fc-tabs a.active{background:#e8f5eb;color:#137743}
      .fc-warning{background:#fff8e8;border:1px solid #f0dfb6;color:#795a20;border-radius:12px;padding:13px 15px;font-size:12px;line-height:1.65}
      .fc-section-label{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-top:4px}
      .fc-section-label h2{font-size:16px;margin:0}.fc-section-label span{font-size:11px;color:#87948c}
      .fc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
      .fc-stat,.fc-panel{background:#fff;border:1px solid #e5ece7;border-radius:16px;padding:17px;min-width:0}
      .fc-stat span{display:block;color:#728078;font-size:11px;font-weight:700}.fc-stat strong{display:block;font-size:23px;letter-spacing:-.5px;margin:10px 0 5px}.fc-stat small{color:#8a968e;font-size:10px;line-height:1.5}
      .fc-charts{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .fc-panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.fc-panel h2,.fc-panel-head h2{font-size:14px;margin:0}.fc-panel-head p{font-size:11px;color:#87948c;margin:5px 0 0}.fc-unit{font-size:10px;color:#8a968e;background:#f5f8f5;border-radius:20px;padding:5px 8px}
      .fc-donut-layout{display:grid;grid-template-columns:155px 1fr;align-items:center;gap:12px;margin-top:12px}.fc-donut-wrap{width:155px}.fc-donut-wrap svg{width:100%;display:block}.fc-donut-total{font-size:13px;font-weight:800;fill:#173d2b}.fc-donut-unit{font-size:7px;fill:#87948c}
      .fc-legend{display:grid;gap:12px}.fc-legend-row{display:flex;justify-content:space-between;gap:10px;font-size:11px}.fc-legend-label{display:flex;align-items:center;gap:7px;color:#65756b}.fc-legend-label i{width:8px;height:8px;border-radius:50%}.fc-legend-row b{white-space:nowrap}.fc-legend-row small{color:#87948c;font-weight:500;margin-left:4px}
      .fc-empty{min-height:170px;display:grid;align-content:center;justify-items:center;gap:7px;color:#87948c;font-size:11px;text-align:center}.fc-empty b{color:#617168;font-size:12px}
      .fc-wallet-links{display:grid;margin-top:12px}.fc-wallet-links a{padding:12px 0;border-top:1px solid #eef2ef;display:flex;justify-content:space-between;text-decoration:none;color:#52665a;font-size:12px}.fc-wallet-links a span{color:#16864b}
      .fc-empty-card{background:#fff;border:1px dashed #d8e4da;border-radius:15px;padding:24px;display:grid;gap:9px;color:#718176;font-size:12px;line-height:1.65}.fc-empty-card b{font-size:14px;color:#173d2b}
      .fc-table-wrap{overflow:auto;margin-top:14px}table{width:100%;border-collapse:collapse;font-size:11px;white-space:nowrap}th{text-align:left;color:#87948c;font-weight:700;padding:10px;border-bottom:1px solid #e8efe9}td{padding:11px 10px;border-bottom:1px solid #eff3f0;color:#52665a}
      .fc-status-pending{display:inline-block;padding:5px 8px;border-radius:7px;background:#fff4d9;color:#8a5b12;font-weight:750}.fc-status-overdue{display:inline-block;padding:5px 8px;border-radius:7px;background:#fee2e2;color:#b42318;font-weight:850}.fc-policy-note{font-size:11px;color:#7b6b43;background:#fff8e8;border:1px solid #f0dfb6;border-radius:12px;padding:13px;line-height:1.65}
      .fc-footer{display:flex;gap:14px;flex-wrap:wrap;align-items:center;color:#87948c;font-size:10px}.fc-footer a{color:#16864b;text-decoration:none;font-weight:700}
      @media(max-width:900px){.fc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.fc-charts{grid-template-columns:1fr}}
      @media(max-width:560px){.fc-heading h1{font-size:23px}.fc-stats{gap:8px}.fc-stat{padding:13px}.fc-stat strong{font-size:19px}.fc-donut-layout{grid-template-columns:120px 1fr}.fc-donut-wrap{width:120px}.fc-tabs{gap:3px}.fc-tabs a{font-size:10px;padding:8px}}
    `}</style>
  </main>;
}
