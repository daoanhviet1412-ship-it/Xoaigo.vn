"use client";

import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck,
  CircleDollarSign, ClipboardList, Coins, Menu, ShoppingBag, Store,
  Users, Wallet, AlertTriangle, Clock3, Sparkles
} from "lucide-react";

const summary = [
  { label: "Doanh thu giao dịch", value: "—", note: "Chưa kết nối dữ liệu thật", icon: CircleDollarSign, href: "/admin/funds", tone: "green" },
  { label: "Đơn hàng", value: "—", note: "Xem toàn bộ đơn và trạng thái", icon: ShoppingBag, href: "/admin/orders", tone: "blue" },
  { label: "Cửa hàng", value: "—", note: "Hồ sơ, trạng thái, hiệu quả", icon: Store, href: "/admin/merchants", tone: "violet" },
  { label: "Thành viên", value: "—", note: "Hồ sơ và hoạt động thành viên", icon: Users, href: "/admin/members", tone: "amber" },
];

const shortcuts = [
  { title: "Quản lý cửa hàng", desc: "Danh sách, hồ sơ và trạng thái đối tác", href: "/admin/merchants", icon: Store },
  { title: "Quản lý đơn hàng", desc: "Theo dõi đơn mới, đang xử lý và hoàn tất", href: "/admin/orders", icon: ShoppingBag },
  { title: "Thành viên", desc: "Tài khoản, lịch sử và điểm thành viên", href: "/admin/members", icon: Users },
  { title: "Chiến dịch", desc: "Ưu đãi, chương trình và hiệu quả", href: "/admin/campaigns", icon: Sparkles },
];

const finance = [
  { title: "Pending Ví Khách", desc: "Chi tiết các khoản 70% chờ xử lý", value: "—", href: "/admin/points-control", icon: Wallet },
  { title: "Pending Ví App", desc: "Chi tiết các khoản 30% chờ xử lý", value: "—", href: "/admin/points-control", icon: Coins },
  { title: "Đối soát 70/30", desc: "Kiểm tra phân bổ và sai lệch giao dịch", value: "—", href: "/admin/points-control", icon: BadgeCheck },
];

function SectionHeading({ title, detail, href, action = "Xem tất cả" }: { title: string; detail: string; href?: string; action?: string }) {
  return <div className="mx-section-heading"><div><h2>{title}</h2><p>{detail}</p></div>{href && <Link href={href}>{action}<ArrowRight size={15}/></Link>}</div>;
}

export function DemoDashboard() {
  return (
    <main className="mx-dashboard">
      <style jsx>{`
        .mx-dashboard{max-width:1440px;margin:0 auto;padding:28px 30px 48px;color:#173d2b;display:grid;gap:22px}
        .mx-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
        .mx-kicker{font-size:10px;font-weight:800;letter-spacing:1.6px;color:#16864b;margin:0 0 8px}
        h1{font-size:28px;letter-spacing:-.8px;margin:0;font-weight:780}
        .mx-sub{font-size:13px;color:#7c8981;margin:7px 0 0}
        .mx-badge{display:inline-flex;align-items:center;gap:7px;background:#fff4d9;border:1px solid #f1e4bf;color:#94681a;border-radius:99px;padding:8px 11px;font-size:10px;font-weight:800;white-space:nowrap}
        .mx-dot{width:7px;height:7px;border-radius:50%;background:#d69a25}
        .mx-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}
        .mx-card,.mx-panel{background:#fff;border:1px solid #e6ede8;border-radius:16px;box-shadow:0 3px 12px rgba(23,61,43,.035)}
        .mx-card{padding:17px;text-decoration:none;color:inherit;display:block;transition:transform .16s,border-color .16s}
        .mx-card:hover,.mx-row:hover,.mx-shortcut:hover{transform:translateY(-2px);border-color:#b9d9c4}
        .mx-card-top{display:flex;align-items:center;justify-content:space-between;color:#748279;font-size:12px;font-weight:650;gap:8px}
        .mx-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:#eaf6ee;color:#16864b}
        .mx-icon.blue{background:#edf4fc;color:#477db8}.mx-icon.violet{background:#f2effc;color:#7964b3}.mx-icon.amber{background:#fff5e5;color:#b7791f}
        .mx-value{font-size:27px;font-weight:800;letter-spacing:-.8px;margin:14px 0 4px}
        .mx-note{font-size:11px;color:#8b978f}
        .mx-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,1fr);gap:16px}
        .mx-panel{padding:19px;min-width:0}
        .mx-section-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .mx-section-heading h2{font-size:15px;margin:0;font-weight:780}
        .mx-section-heading p{font-size:11px;color:#89968e;margin:5px 0 0}
        .mx-section-heading>a{font-size:11px;color:#16864b;text-decoration:none;font-weight:750;display:flex;align-items:center;gap:5px;white-space:nowrap}
        .mx-empty{margin-top:16px;border:1px dashed #dfe9e2;background:#fafcfb;border-radius:13px;min-height:165px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;color:#8a978f;gap:8px}
        .mx-empty strong{font-size:13px;color:#52675a}.mx-empty span{font-size:11px;max-width:340px;line-height:1.6}
        .mx-list{display:grid;margin-top:12px}
        .mx-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid #eff3f0;text-decoration:none;color:inherit;transition:transform .16s}
        .mx-row:first-child{border-top:0}
        .mx-row-main{flex:1;min-width:0}.mx-row-main b{font-size:12px;display:block}.mx-row-main small{font-size:10px;color:#89968e;display:block;margin-top:4px}
        .mx-row-value{font-size:13px;font-weight:750}.mx-chevron{color:#a0aaa3}
        .mx-shortcuts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:14px}
        .mx-shortcut{padding:15px;border:1px solid #eaf0eb;border-radius:13px;text-decoration:none;color:inherit;display:flex;align-items:flex-start;gap:11px;transition:transform .16s,border-color .16s}
        .mx-shortcut b{font-size:12px;display:block}.mx-shortcut small{font-size:10px;color:#89968e;display:block;line-height:1.5;margin-top:5px}
        .mx-foot{font-size:10px;color:#929e96;display:flex;align-items:center;gap:7px}
        @media(max-width:1050px){.mx-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.mx-grid{grid-template-columns:1fr}.mx-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:640px){.mx-dashboard{padding:19px 13px 34px;gap:15px}.mx-head{display:block}.mx-head h1{font-size:23px}.mx-sub{font-size:12px;line-height:1.5}.mx-badge{margin-top:13px}.mx-kpis{gap:9px}.mx-card{padding:13px;border-radius:14px}.mx-card-top{font-size:10px;align-items:flex-start}.mx-icon{width:31px;height:31px}.mx-value{font-size:22px;margin-top:12px}.mx-note{font-size:10px;line-height:1.45}.mx-panel{padding:14px;border-radius:14px}.mx-shortcuts{grid-template-columns:1fr 1fr;gap:8px}.mx-shortcut{padding:12px;display:block}.mx-shortcut .mx-icon{margin-bottom:9px}.mx-shortcut b{font-size:11px}.mx-shortcut small{font-size:9px}.mx-section-heading h2{font-size:14px}.mx-row{gap:9px}.mx-row-main b{font-size:11px}.mx-row-main small{font-size:9px}}
      `}</style>

      <div className="mx-head">
        <div><p className="mx-kicker">OPERATIONS COMMAND CENTER</p><h1>Tổng quan hoạt động</h1><p className="mx-sub">Một màn hình để nắm tình hình, đi sâu vào từng phân hệ khi cần.</p></div>
        <span className="mx-badge"><i className="mx-dot"/> PREVIEW · DỮ LIỆU CHƯA KẾT NỐI</span>
      </div>

      <section className="mx-kpis">
        {summary.map((item) => { const Icon = item.icon; return <Link href={item.href} className="mx-card" key={item.label}>
          <div className="mx-card-top"><span>{item.label}</span><i className={`mx-icon ${item.tone}`}><Icon size={18}/></i></div>
          <div className="mx-value">{item.value}</div><div className="mx-note">{item.note}</div>
        </Link>; })}
      </section>

      <section className="mx-grid">
        <article className="mx-panel">
          <SectionHeading title="Tài chính & điểm" detail="Tổng hợp các khoản cần theo dõi · bấm để mở bảng chi tiết" href="/admin/points-control"/>
          <div className="mx-list">{finance.map((item) => {const Icon=item.icon;return <Link className="mx-row" href={item.href} key={item.title}>
            <i className="mx-icon"><Icon size={17}/></i><span className="mx-row-main"><b>{item.title}</b><small>{item.desc}</small></span><strong className="mx-row-value">{item.value}</strong><ArrowRight className="mx-chevron" size={16}/>
          </Link>;})}</div>
        </article>
        <article className="mx-panel">
          <SectionHeading title="Hàng đợi cần chú ý" detail="Các khu vực vận hành cần kiểm tra"/>
          <div className="mx-list">
            <Link className="mx-row" href="/admin/approvals"><i className="mx-icon amber"><ClipboardList size={17}/></i><span className="mx-row-main"><b>Yêu cầu chờ phê duyệt</b><small>Mở danh sách yêu cầu và xem từng hồ sơ</small></span><ArrowRight className="mx-chevron" size={16}/></Link>
            <Link className="mx-row" href="/admin/orders"><i className="mx-icon blue"><Clock3 size={17}/></i><span className="mx-row-main"><b>Đơn hàng đang xử lý</b><small>Lọc theo trạng thái và thời gian</small></span><ArrowRight className="mx-chevron" size={16}/></Link>
            <Link className="mx-row" href="/admin/reconciliation"><i className="mx-icon"><AlertTriangle size={17}/></i><span className="mx-row-main"><b>Giao dịch cần đối soát</b><small>Xem giao dịch khớp, lệch và hồ sơ liên quan</small></span><ArrowRight className="mx-chevron" size={16}/></Link>
          </div>
        </article>
      </section>

      <section className="mx-panel">
        <SectionHeading title="Truy cập nhanh" detail="Mở từng phân hệ để xem danh sách, bộ lọc và bảng dữ liệu con"/>
        <div className="mx-shortcuts">{shortcuts.map((item) => {const Icon=item.icon;return <Link className="mx-shortcut" href={item.href} key={item.title}>
          <i className="mx-icon"><Icon size={18}/></i><span><b>{item.title}</b><small>{item.desc}</small></span>
        </Link>;})}</div>
      </section>

      <div className="mx-foot"><Activity size={14}/> Giao diện tổng quan bản thử nghiệm. Các số liệu hiển thị “—” cho đến khi có nguồn dữ liệu được xác minh.</div>
    </main>
  );
}
