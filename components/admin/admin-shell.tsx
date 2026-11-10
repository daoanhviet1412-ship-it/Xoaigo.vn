"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Database, Store, ShoppingBag, Users, Megaphone, Tags, ClipboardCheck,
  ShieldCheck, Wallet, Landmark, ReceiptText, Scale, Coins, Settings, ScrollText,
  ChevronDown, ChevronLeft, Menu, X, Leaf
} from "lucide-react";

const groups = [
  { title: "Tổng quan", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  { title: "Kinh doanh", items: [
    { label: "Cửa hàng", href: "/admin/merchants", icon: Store },
    { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingBag },
    { label: "Thành viên", href: "/admin/members", icon: Users },
    { label: "Chiến dịch", href: "/admin/campaigns", icon: Megaphone },
    { label: "Danh mục", href: "/admin/catalog", icon: Tags },
  ]},
  { title: "Vận hành", items: [
    { label: "Phê duyệt", href: "/admin/approvals", icon: ClipboardCheck },
    { label: "Chính sách", href: "/admin/policies", icon: ShieldCheck },
  ]},
  { title: "Tài chính", items: [
    { label: "Tổng quan tài chính", href: "/admin/funds", icon: Wallet },
    { label: "Mô hình tài chính", href: "/admin/finance-model", icon: Scale },
    { label: "Ngân sách", href: "/admin/budgets", icon: Landmark },
    { label: "Sổ cái", href: "/admin/ledger", icon: ReceiptText },
    { label: "Đối soát", href: "/admin/reconciliation", icon: Scale },
    { label: "Điểm thưởng", href: "/admin/points", icon: Coins },
    { label: "Công nợ", href: "/admin/settlements", icon: ReceiptText },
  ]},
  { title: "Hệ thống", items: [
    { label: "Quyết định sản phẩm", href: "/admin/product-decisions", icon: ClipboardCheck },
    { label: "Phân quyền", href: "/admin/access", icon: Settings },
    { label: "Nhật ký hoạt động", href: "/admin/audit", icon: ScrollText },
    { label: "Dữ liệu DEMO (Sandbox)", href: "/admin/demo-data", icon: Database },
  ]},
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Kinh doanh": true, "Vận hành": true, "Tài chính": true, "Hệ thống": false,
  });

  if (pathname === "/admin/login") return <>{children}</>;

  const activeItem = groups.flatMap((g) => g.items).find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/")
  );

  const sidebar = (
    <aside className={`xoai-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
      <div className="xoai-brand">
        <span className="xoai-brand-mark"><Leaf size={19} /></span>
        {!collapsed && <span><b>XOÀI GO</b><small>CONTROL CENTER</small></span>}
        <button className="xoai-icon-btn xoai-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Thu gọn menu"><ChevronLeft size={17} /></button>
        <button className="xoai-icon-btn xoai-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={18} /></button>
      </div>
      <nav className="xoai-nav">
        {groups.map((group) => {
          const isOpen = collapsed ? true : (expanded[group.title] ?? true);
          return <div className="xoai-nav-group" key={group.title}>
            {group.title === "Tổng quan" ? null : (
              <button className="xoai-group-title" onClick={() => setExpanded((old) => ({ ...old, [group.title]: !isOpen }))} title={collapsed ? group.title : undefined}>
                {!collapsed && <span>{group.title}</span>}
                {!collapsed && <ChevronDown size={14} className={isOpen ? "" : "is-rotated"} />}
              </button>
            )}
            {(isOpen || group.title === "Tổng quan") && group.items.map((item) => {
              const Icon = item.icon;
              const active = activeItem?.href === item.href;
              return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`xoai-nav-link ${active ? "is-active" : ""}`} title={collapsed ? item.label : undefined}>
                <Icon size={18} strokeWidth={1.8} />
                {!collapsed && <span>{item.label}</span>}
                {active && <i />}
              </Link>;
            })}
          </div>;
        })}
      </nav>
      <div className="xoai-sidebar-foot">{!collapsed ? <><span className="xoai-status-dot" /> Preview environment</> : <span className="xoai-status-dot" />}</div>
    </aside>
  );

  return (
    <div className="xoai-admin-frame">
      {sidebar}
      {mobileOpen && <button className="xoai-backdrop" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />}
      <div className={`xoai-admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <header className="xoai-topbar">
          <button className="xoai-icon-btn xoai-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu size={20} /></button>
          <div className="xoai-breadcrumb"><span>XOÀI GO</span><b>/</b>{activeItem?.label ?? "Control Center"}</div>
          <div className="xoai-topbar-right"><span className="xoai-live-dot" /> <span>Admin workspace</span></div>
        </header>
        {children}
      </div>
      <style jsx global>{`
        :root { --xoai-green:#13864b; --xoai-ink:#173d2b; --xoai-muted:#728078; --xoai-line:#e6ede8; --xoai-bg:#f5f8f5; }
        * { box-sizing:border-box; }
        .xoai-admin-frame { min-height:100vh; background:var(--xoai-bg); color:var(--xoai-ink); }
        .xoai-sidebar { position:fixed; z-index:40; inset:0 auto 0 0; width:252px; background:#fff; border-right:1px solid var(--xoai-line); display:flex; flex-direction:column; transition:width .2s ease; }
        .xoai-sidebar.is-collapsed { width:76px; }
        .xoai-brand { height:76px; display:flex; align-items:center; gap:11px; padding:0 17px; border-bottom:1px solid var(--xoai-line); flex-shrink:0; }
        .xoai-brand-mark { width:36px;height:36px;border-radius:12px;background:#eaf6ee;color:var(--xoai-green);display:grid;place-items:center;flex-shrink:0; }
        .xoai-brand b { display:block;font-size:14px;letter-spacing:1.4px;color:var(--xoai-green);white-space:nowrap; }
        .xoai-brand small { display:block;font-size:9px;letter-spacing:1.5px;color:#8b988f;margin-top:3px;white-space:nowrap; }
        .xoai-icon-btn { border:0;background:transparent;color:#6d7c72;border-radius:9px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer; }
        .xoai-icon-btn:hover { background:#f0f6f1;color:var(--xoai-green); }
        .xoai-collapse { margin-left:auto; }
        .is-collapsed .xoai-brand { padding:0 20px;flex-wrap:wrap;justify-content:center; }
        .is-collapsed .xoai-collapse { display:none; }
        .xoai-nav { padding:15px 11px;overflow:auto;flex:1; }
        .xoai-nav-group { margin-bottom:12px; }
        .xoai-group-title { width:100%;display:flex;align-items:center;justify-content:space-between;border:0;background:transparent;padding:9px 11px;color:#9aa59d;font-size:10px;font-weight:800;letter-spacing:1.15px;text-transform:uppercase;cursor:pointer; }
        .xoai-group-title svg { transition:transform .18s; }
        .xoai-group-title svg.is-rotated { transform:rotate(-90deg); }
        .xoai-nav-link { position:relative;display:flex;align-items:center;gap:12px;padding:10px 12px;margin:2px 0;border-radius:10px;text-decoration:none;color:#5e6f64;font-size:13px;font-weight:550;transition:background .15s,color .15s; }
        .xoai-nav-link:hover { background:#f4f8f4;color:var(--xoai-green); }
        .xoai-nav-link.is-active { background:#eaf6ee;color:#117a43;font-weight:750; }
        .xoai-nav-link i { position:absolute;right:0;top:9px;bottom:9px;width:3px;border-radius:4px;background:var(--xoai-green); }
        .is-collapsed .xoai-nav-link { justify-content:center;padding:12px 0; }
        .is-collapsed .xoai-group-title { justify-content:center;padding:8px 0; }
        .xoai-sidebar-foot { padding:16px 19px;border-top:1px solid var(--xoai-line);font-size:11px;color:#859188;display:flex;align-items:center;gap:8px;white-space:nowrap; }
        .xoai-status-dot,.xoai-live-dot { display:inline-block;width:7px;height:7px;border-radius:50%;background:#24a35a;flex-shrink:0; }
        .xoai-admin-main { min-height:100vh;margin-left:252px;transition:margin-left .2s ease; }
        .xoai-admin-main > main > header:first-child { display:none !important; }
        .xoai-admin-main.sidebar-collapsed { margin-left:76px; }
        .xoai-topbar { height:64px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--xoai-line);display:flex;align-items:center;justify-content:space-between;padding:0 30px;position:sticky;top:0;z-index:20; }
        .xoai-breadcrumb { display:flex;align-items:center;gap:10px;font-size:13px;color:#65756b; }
        .xoai-breadcrumb span { color:var(--xoai-green);font-weight:850;letter-spacing:1px; }
        .xoai-breadcrumb b { color:#c2cbc4;font-weight:400; }
        .xoai-topbar-right { display:flex;align-items:center;gap:8px;color:#829087;font-size:12px; }
        .xoai-mobile-menu,.xoai-mobile-close,.xoai-backdrop { display:none; }
        @media(max-width:900px) {
          .xoai-sidebar { transform:translateX(-100%);width:270px!important;transition:transform .22s ease; }
          .xoai-sidebar.is-mobile-open { transform:translateX(0); }
          .xoai-admin-main,.xoai-admin-main.sidebar-collapsed { margin-left:0; }
          .xoai-mobile-menu { display:grid; }
          .xoai-mobile-close { display:grid;margin-left:auto; }
          .xoai-collapse { display:none; }
          .xoai-backdrop { display:block;position:fixed;inset:0;background:rgba(13,35,22,.35);border:0;z-index:30; }
          .xoai-topbar { padding:0 16px;gap:12px; }
        }
      `}</style>
    </div>
  );
}
