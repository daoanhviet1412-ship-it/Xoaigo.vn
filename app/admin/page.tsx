import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowDownRight, ArrowUpRight, Activity, AlertTriangle, ArrowRight,
  BadgeCheck, Building2, CalendarDays, CircleDollarSign, Clock3, Coins,
  CreditCard, ShoppingBag, Store, Users, Wallet, TrendingUp
} from "lucide-react";

type SearchParams = Promise<{ period?: string }>;

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
function compact(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
function dateLabel(date: Date) {
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
}
function StatCard({ label, value, hint, icon: Icon, tone = "green", href }: {
  label: string; value: string; hint: string; icon: React.ComponentType<{size?:number}>;
  tone?: "green" | "blue" | "amber" | "slate"; href?: string;
}) {
  const body = <div className={`xoai-stat-card tone-${tone}`}>
    <div className="xoai-stat-top"><span>{label}</span><i><Icon size={18}/></i></div>
    <strong>{value}</strong>
    <small>{hint}</small>
  </div>;
  return href ? <Link href={href} className="xoai-stat-link">{body}</Link> : body;
}
function LineChart({ points, label }: { points: { label: string; value: number }[]; label: string }) {
  const width = 720, height = 220, pad = 24;
  const max = Math.max(1, ...points.map((p) => p.value));
  const coords = points.map((p, i) => ({
    x: pad + (points.length <= 1 ? 0 : i * (width - pad * 2) / (points.length - 1)),
    y: height - pad - (p.value / max) * (height - pad * 2),
  }));
  const polyline = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${height-pad} ${polyline} ${width-pad},${height-pad}`;
  return <div className="xoai-chart-wrap">
    {points.some((p) => p.value > 0) ? <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="xoai-chart">
      {[0,1,2,3].map((n) => <line key={n} x1={pad} x2={width-pad} y1={pad+n*(height-pad*2)/3} y2={pad+n*(height-pad*2)/3} stroke="#edf2ee" strokeDasharray="4 5"/>)}
      <polygon points={area} fill="#dff2e5" opacity=".8"/>
      <polyline points={polyline} fill="none" stroke="#159653" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#159653" strokeWidth="2"/>)}
    </svg> : <div className="xoai-chart-empty"><Activity size={22}/><b>Chưa có dữ liệu giao dịch</b><span>Biểu đồ sẽ hiển thị khi có đơn hàng hoàn tất trong kỳ.</span></div>}
    <div className="xoai-chart-labels">{points.filter((_,i)=>i===0||i===points.length-1||i%Math.max(1,Math.floor(points.length/5))===0).map((p,i)=><span key={i}>{p.label}</span>)}</div>
  </div>;
}
function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: { label: string; href: string } }) {
  return <div className="xoai-section-title"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action && <Link href={action.href}>{action.label}<ArrowRight size={14}/></Link>}</div>;
}

export default async function AdminHomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const period = ["7d","30d","month"].includes(params.period ?? "") ? params.period! : "30d";
  const now = new Date();
  const start = new Date(now);
  if (period === "7d") start.setDate(start.getDate()-6);
  else if (period === "month") start.setDate(1);
  else start.setDate(start.getDate()-29);
  start.setHours(0,0,0,0);
  const supabase = await createClient();
  if (!supabase) return <main className="xoai-page"><div className="xoai-page-inner"><h1>Chưa kết nối dữ liệu</h1><p>Preview chưa có cấu hình Supabase. Dashboard không sử dụng dữ liệu mẫu.</p></div></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [
    {data:profile,error:profileError},{data:grants,error:grantsError},{data:rolePermissions,error:permissionError},
    {count:merchantCount,error:merchantError},{count:activeMerchantCount,error:activeMerchantError},
    {count:pendingApprovalCount,error:approvalError},{count:memberCount,error:memberError},
    {count:newMemberCount,error:newMemberError},{count:activeCampaignCount,error:campaignError},
    {count:pendingOrderCount,error:pendingOrderError},{data:orders,count:completedOrderCount,error:ordersError},
  ] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,merchant_id,roles(code,name)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("merchants").select("id",{count:"exact",head:true}),
    supabase.from("merchants").select("id",{count:"exact",head:true}).eq("status","active"),
    supabase.from("approval_requests").select("id",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("member_profiles").select("user_id",{count:"exact",head:true}),
    supabase.from("member_profiles").select("user_id",{count:"exact",head:true}).gte("joined_at",start.toISOString()),
    supabase.from("marketing_campaigns").select("id",{count:"exact",head:true}).eq("status","active"),
    supabase.from("commerce_orders").select("id",{count:"exact",head:true}).in("status",["placed","accepted","preparing","ready"]),
    supabase.from("commerce_orders").select("id,total_amount,created_at,currency",{count:"exact"}).eq("status","completed").gte("created_at",start.toISOString()).order("created_at",{ascending:true}).limit(2000),
  ]);

  const errors = [profileError,grantsError,permissionError,merchantError,activeMerchantError,approvalError,memberError,newMemberError,campaignError,pendingOrderError,ordersError].filter(Boolean);
  if (errors.length) return <main className="xoai-page"><div className="xoai-page-inner"><div className="xoai-alert alert-error"><AlertTriangle size={18}/><div><b>Chưa thể tải đầy đủ dữ liệu quản trị</b><p>Một hoặc nhiều truy vấn gặp lỗi. Dashboard ẩn các chỉ số liên quan thay vì hiển thị số 0 gây hiểu nhầm.</p></div></div><Link href="/admin">Thử tải lại</Link></div></main>;
  if (!profile || profile.status !== "active") return <main className="xoai-page"><div className="xoai-page-inner"><h1>Tài khoản chưa được kích hoạt</h1><p>Quyền truy cập quản trị đã bị từ chối.</p></div></main>;
  const roleCodes=(grants??[]).map((g)=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const platformRoles=["platform_owner","platform_admin","ops_manager","ops_agent","finance_manager","finance_operator","policy_reviewer"];
  if(!roleCodes.some((code)=>platformRoles.includes(code))) return <main className="xoai-page"><div className="xoai-page-inner"><h1>Chưa được cấp quyền quản trị</h1><p>Tài khoản đã xác thực nhưng chưa có role nền tảng hợp lệ.</p></div></main>;
  const permissionCodes=new Set((rolePermissions??[]).filter((row)=>roleCodes.includes(row.roles?.code??"")).map((row)=>row.permissions?.code).filter((v):v is string=>Boolean(v)));
  const canSee=(...codes:string[])=>codes.some((code)=>permissionCodes.has(code));
  const orderRows=orders??[];
  const gmv=orderRows.reduce((sum,row)=>sum+Number(row.total_amount||0),0);
  const orderBuckets=Array.from({length:period==="7d"?7:period==="month"?Math.max(1,Math.min(31,now.getDate())):30},(_,i)=>{
    const d=new Date(start);d.setDate(start.getDate()+i);
    return {date:d,label:dateLabel(d),value:0};
  });
  for(const order of orderRows){
    const d=new Date(order.created_at);
    const key=d.toLocaleDateString("en-CA",{timeZone:"Asia/Ho_Chi_Minh"});
    const bucket=orderBuckets.find((b)=>b.date.toLocaleDateString("en-CA",{timeZone:"Asia/Ho_Chi_Minh"})===key);
    if(bucket) bucket.value+=Number(order.total_amount||0);
  }
  const aov=completedOrderCount?gmv/completedOrderCount:0;
  const periodLabel=period==="7d"?"7 ngày gần nhất":period==="month"?"Tháng này":"30 ngày gần nhất";
  const fmtCount=(n:number|null)=>n===null?"—":new Intl.NumberFormat("vi-VN").format(n);
  const showGmv=canSee("orders.read","orders.manage");
  const showMerchants=canSee("merchants.read","merchants.manage");
  const showMembers=canSee("members.read","members.manage");
  const showApprovals=canSee("approvals.read","approvals.review","budgets.review");
  const showCampaigns=canSee("campaigns.read","campaigns.manage");

  const cards=[
    {label:"Doanh thu (GMV)",value:showGmv?money(gmv):"Không có quyền",hint:showGmv?`${fmtCount(completedOrderCount)} giao dịch hoàn tất · ${periodLabel}`:"Cần quyền xem đơn hàng",icon:CircleDollarSign,tone:"green" as const},
    {label:"Số giao dịch",value:showGmv?fmtCount(completedOrderCount):"—",hint:"Đơn hàng trạng thái hoàn tất",icon:ShoppingBag,tone:"blue" as const},
    {label:"Giá trị giao dịch TB",value:showGmv?money(aov):"—",hint:"GMV / số giao dịch hoàn tất",icon:TrendingUp,tone:"blue" as const},
    {label:"Cửa hàng hoạt động",value:showMerchants?fmtCount(activeMerchantCount):"—",hint:showMerchants?`/${fmtCount(merchantCount)} cửa hàng trong hệ thống`:"Cần quyền xem cửa hàng",icon:Store,tone:"green" as const},
    {label:"Thành viên",value:showMembers?fmtCount(memberCount):"—",hint:showMembers?`+${fmtCount(newMemberCount)} thành viên mới trong kỳ`:"Cần quyền xem thành viên",icon:Users,tone:"blue" as const},
    {label:"Chiến dịch đang chạy",value:showCampaigns?fmtCount(activeCampaignCount):"—",hint:"Trạng thái từ dữ liệu chiến dịch",icon:Megaphone,tone:"amber" as const},
  ];
  const chartPoints=orderBuckets.map((b)=>({label:b.label,value:b.value}));
  const missingFinancial=[
    "Tiền cửa hàng nạp mới: chưa có bảng top-up được xác nhận với sao kê ngân hàng.",
    "Ví cửa hàng / số dư bảo đảm: chưa có wallet balance register được xác minh.",
    "Điểm Pending và Available: schema hiện có account, entry và hold nhưng chưa có bucket balance chuẩn để tổng hợp.",
    "Phí nền tảng và doanh thu Xoài: chưa có luồng ghi nhận tài chính được kích hoạt.",
  ];
  return <main className="xoai-page">
    <div className="xoai-page-inner">
      <div className="xoai-page-heading">
        <div><p className="xoai-eyebrow">OPERATIONS COMMAND CENTER</p><h1>Tổng quan hoạt động</h1><p>Theo dõi quy mô giao dịch, sức khỏe hệ sinh thái và các việc cần xử lý.</p></div>
        <div className="xoai-period"><CalendarDays size={16}/><Link className={period==="7d"?"selected":""} href="/admin?period=7d">7 ngày</Link><Link className={period==="30d"?"selected":""} href="/admin?period=30d">30 ngày</Link><Link className={period==="month"?"selected":""} href="/admin?period=month">Tháng này</Link></div>
      </div>

      <section className="xoai-kpi-grid">
        {cards.map((card)=><StatCard key={card.label} {...card}/>)}
      </section>

      <section className="xoai-dashboard-grid">
        <article className="xoai-panel xoai-chart-panel">
          <SectionTitle title="Xu hướng GMV" detail={`Giá trị đơn hàng hoàn tất · ${periodLabel}`} action={{label:"Xem đơn hàng",href:"/admin/orders"}}/>
          <div className="xoai-chart-summary"><strong>{showGmv?money(gmv):"—"}</strong><span>Tổng GMV trong kỳ</span></div>
          <LineChart points={chartPoints} label="Biểu đồ GMV theo ngày"/>
          <div className="xoai-chart-foot"><span><i className="legend-dot"/> GMV (VND)</span><span>Dữ liệu theo ngày · GMT+7</span></div>
        </article>
        <article className="xoai-panel">
          <SectionTitle title="Công việc cần xử lý" detail="Hàng đợi vận hành hiện tại"/>
          <div className="xoai-task-list">
            <Link href="/admin/approvals"><span className="task-icon amber"><ClipboardCheck size={17}/></span><span><b>Yêu cầu chờ phê duyệt</b><small>Các đề xuất cần người có quyền xem xét</small></span><strong>{showApprovals?fmtCount(pendingApprovalCount):"—"}</strong></Link>
            <Link href="/admin/orders"><span className="task-icon blue"><ShoppingBag size={17}/></span><span><b>Đơn hàng đang xử lý</b><small>Đơn chưa hoàn tất hoặc hủy</small></span><strong>{showGmv?fmtCount(pendingOrderCount):"—"}</strong></Link>
            <Link href="/admin/reconciliation"><span className="task-icon green"><BadgeCheck size={17}/></span><span><b>Đối soát cần kiểm tra</b><small>Đợt đối soát và sai lệch</small></span><strong>—</strong></Link>
            <Link href="/admin/funds"><span className="task-icon amber"><Wallet size={17}/></span><span><b>Top-up chờ xác nhận</b><small>Chưa có kết nối xác minh ngân hàng</small></span><strong>—</strong></Link>
          </div>
        </article>
      </section>

      <section className="xoai-dashboard-grid xoai-finance-grid">
        <article className="xoai-panel">
          <SectionTitle title="Tài chính & dòng tiền" detail="Các khoản cần theo dõi riêng biệt"/>
          <div className="xoai-finance-list">
            <div><span><CreditCard size={16}/>Tiền cửa hàng nạp mới</span><b>Chưa có dữ liệu</b><small>Chỉ tính tiền đã xác nhận vào ngân hàng</small></div>
            <div><span><Clock3 size={16}/>Tổng Pending</span><b>Chưa có dữ liệu</b><small>Chưa có nguồn tổng hợp bucket đã xác thực</small></div>
            <div><span><Wallet size={16}/>Số dư ví cửa hàng</span><b>Chưa có dữ liệu</b><small>Sổ vận hành, không phải số dư ngân hàng</small></div>
            <div><span><Coins size={16}/>Điểm Pending / Available</span><b>Chưa có dữ liệu</b><small>Không suy diễn từ số tài khoản điểm</small></div>
          </div>
        </article>
        <article className="xoai-panel">
          <SectionTitle title="Tăng trưởng hệ sinh thái" detail="Quy mô mạng lưới hiện tại"/>
          <div className="xoai-growth-grid">
            <div><span><Store size={16}/>Cửa hàng</span><strong>{showMerchants?fmtCount(merchantCount):"—"}</strong><small>{showMerchants?fmtCount(activeMerchantCount)+" đang hoạt động":"Không có quyền xem"}</small></div>
            <div><span><Users size={16}/>Thành viên</span><strong>{showMembers?fmtCount(memberCount):"—"}</strong><small>{showMembers?"+"+fmtCount(newMemberCount)+" trong kỳ":"Không có quyền xem"}</small></div>
            <div><span><Megaphone size={16}/>Chiến dịch</span><strong>{showCampaigns?fmtCount(activeCampaignCount):"—"}</strong><small>Đang hoạt động</small></div>
            <div><span><ShoppingBag size={16}/>Đơn đang xử lý</span><strong>{showGmv?fmtCount(pendingOrderCount):"—"}</strong><small>Chưa hoàn tất</small></div>
          </div>
        </article>
      </section>

      <section className="xoai-panel xoai-data-note">
        <div className="xoai-note-icon"><AlertTriangle size={19}/></div>
        <div><b>Minh bạch dữ liệu tài chính</b><p>GMV hiện được tính từ tổng <code>total_amount</code> của đơn hàng đã hoàn tất trong Core Platform. Đây là giá trị giao dịch qua ứng dụng, không phải doanh thu kế toán của Xoài. Top-up ngân hàng, wallet balance, bucket Pending/Available và phí nền tảng chưa có nguồn dữ liệu vận hành được xác minh nên đang để “Chưa có dữ liệu”.</p><ul>{missingFinancial.map((item)=><li key={item}>{item}</li>)}</ul><Link href="/admin/finance-model">Mở mô hình tài chính <ArrowRight size={14}/></Link></div>
      </section>
      <footer className="xoai-dashboard-footer"><span><span className="xoai-status-dot"/> Dữ liệu truy vấn trực tiếp từ Core Platform</span><span>Cập nhật lúc {now.toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})} · Asia/Ho_Chi_Minh</span></footer>
    </div>
    <style jsx global>{`
      .xoai-page { min-height:calc(100vh - 64px);padding:30px 34px 44px;background:#f5f8f5;color:#173d2b; }
      .xoai-page-inner { max-width:1440px;margin:0 auto;display:grid;gap:22px; }
      .xoai-page-heading { display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap; }
      .xoai-eyebrow { margin:0 0 8px;color:#16864b;font-size:10px;font-weight:850;letter-spacing:1.8px; }
      .xoai-page-heading h1 { margin:0;font-size:30px;letter-spacing:-.8px;font-weight:780; }
      .xoai-page-heading p:not(.xoai-eyebrow) { margin:8px 0 0;color:#78867d;font-size:13px; }
      .xoai-period { display:flex;align-items:center;gap:3px;padding:4px;background:#fff;border:1px solid #e3ebe5;border-radius:11px;color:#819087; }
      .xoai-period a { padding:7px 11px;border-radius:8px;color:#6c7b71;text-decoration:none;font-size:12px;font-weight:650; }
      .xoai-period a.selected { background:#eaf6ee;color:#117a43; }
      .xoai-kpi-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px; }
      .xoai-stat-link { text-decoration:none;color:inherit; }
      .xoai-stat-card { background:#fff;border:1px solid #e5ece7;border-radius:16px;padding:18px 19px;min-height:132px;box-shadow:0 2px 8px rgba(25,55,36,.025); }
      .xoai-stat-top { display:flex;justify-content:space-between;align-items:center;color:#738178;font-size:12px;font-weight:650; }
      .xoai-stat-top i { width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#eaf6ee;color:#16864b;font-style:normal; }
      .tone-blue .xoai-stat-top i { background:#edf4fc;color:#4079b9; }
      .tone-amber .xoai-stat-top i { background:#fff5e5;color:#b7791f; }
      .xoai-stat-card strong { display:block;margin:11px 0 5px;font-size:25px;letter-spacing:-.6px;font-weight:780;color:#193f2d; }
      .xoai-stat-card small { color:#8a968e;font-size:11px; }
      .xoai-dashboard-grid { display:grid;grid-template-columns:minmax(0,1.55fr) minmax(320px,1fr);gap:16px; }
      .xoai-panel { background:#fff;border:1px solid #e5ece7;border-radius:17px;padding:20px;min-width:0;box-shadow:0 2px 8px rgba(25,55,36,.025); }
      .xoai-section-title { display:flex;align-items:flex-start;justify-content:space-between;gap:12px; }
      .xoai-section-title h2 { margin:0;font-size:15px;font-weight:760;letter-spacing:-.2px; }
      .xoai-section-title p { margin:5px 0 0;color:#8a968e;font-size:11px; }
      .xoai-section-title a { display:flex;align-items:center;gap:5px;text-decoration:none;color:#16864b;font-size:11px;font-weight:700;white-space:nowrap; }
      .xoai-chart-summary { display:flex;align-items:baseline;gap:10px;margin:19px 0 2px; }
      .xoai-chart-summary strong { font-size:24px;letter-spacing:-.5px; }
      .xoai-chart-summary span { color:#87948c;font-size:11px; }
      .xoai-chart-wrap { margin-top:4px; }
      .xoai-chart { display:block;width:100%;height:auto;min-height:180px;overflow:visible; }
      .xoai-chart-labels { display:flex;justify-content:space-between;padding:0 8px;color:#9aa59e;font-size:10px; }
      .xoai-chart-empty { min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#8b988f;font-size:12px;text-align:center; }
      .xoai-chart-empty b { color:#617168;font-size:13px; }
      .xoai-chart-foot { display:flex;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid #eef2ef;color:#8a968e;font-size:10px; }
      .xoai-chart-foot span:first-child { display:flex;align-items:center;gap:7px; }
      .legend-dot { width:8px;height:8px;border-radius:50%;background:#159653; }
      .xoai-task-list { display:grid;margin-top:14px; }
      .xoai-task-list a { display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid #eff3f0;text-decoration:none;color:inherit; }
      .xoai-task-list a:first-child { border-top:0; }
      .xoai-task-list a>span:nth-child(2) { flex:1;min-width:0; }
      .xoai-task-list b { display:block;font-size:11px;font-weight:700; }
      .xoai-task-list small { display:block;margin-top:4px;color:#8b978f;font-size:10px;line-height:1.4; }
      .xoai-task-list strong { font-size:15px; }
      .task-icon { width:33px;height:33px;border-radius:10px;display:grid;place-items:center;flex-shrink:0; }
      .task-icon.amber { background:#fff5e5;color:#b7791f; }.task-icon.blue { background:#edf4fc;color:#4079b9; }.task-icon.green { background:#eaf6ee;color:#16864b; }
      .xoai-finance-list { display:grid;margin-top:13px; }
      .xoai-finance-list>div { padding:12px 0;border-top:1px solid #eff3f0;display:grid;grid-template-columns:1fr auto;gap:5px 10px;align-items:center; }
      .xoai-finance-list>div:first-child { border-top:0; }
      .xoai-finance-list span { display:flex;align-items:center;gap:8px;font-size:11px;color:#65756b; }
      .xoai-finance-list span svg { color:#16864b; }
      .xoai-finance-list b { font-size:11px;color:#8a968e;font-weight:650; }
      .xoai-finance-list small { grid-column:1/-1;color:#9aa59e;font-size:10px;padding-left:24px; }
      .xoai-growth-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px; }
      .xoai-growth-grid>div { padding:14px;background:#f8fbf8;border:1px solid #eef3ef;border-radius:12px; }
      .xoai-growth-grid span { display:flex;align-items:center;gap:7px;color:#7c8980;font-size:10px; }
      .xoai-growth-grid span svg { color:#16864b; }
      .xoai-growth-grid strong { display:block;margin:9px 0 3px;font-size:22px; }
      .xoai-growth-grid small { color:#8c9990;font-size:10px; }
      .xoai-data-note { display:flex;gap:13px;background:#fffdf8;border-color:#f1ead9; }
      .xoai-note-icon { width:36px;height:36px;border-radius:11px;background:#fff2d8;color:#b7791f;display:grid;place-items:center;flex-shrink:0; }
      .xoai-data-note b { font-size:12px; }
      .xoai-data-note p { margin:6px 0;color:#7d796c;font-size:11px;line-height:1.7; }
      .xoai-data-note ul { margin:6px 0 9px;padding-left:17px;color:#8b8577;font-size:10px;line-height:1.7; }
      .xoai-data-note a { display:inline-flex;align-items:center;gap:5px;color:#16864b;font-size:11px;font-weight:700;text-decoration:none; }
      .xoai-dashboard-footer { display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#89968e;font-size:10px;padding:0 2px; }
      .xoai-dashboard-footer>span:first-child { display:flex;align-items:center;gap:7px; }
      .xoai-alert { display:flex;gap:12px;padding:18px;border-radius:14px;background:#fff4f1;color:#a53a2c; }
      .xoai-alert p { margin:5px 0 0;font-size:12px; }
      @media(max-width:1100px) { .xoai-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.xoai-dashboard-grid { grid-template-columns:1fr; } }
      @media(max-width:640px) { .xoai-page { padding:22px 14px 32px; }.xoai-page-heading h1 { font-size:24px; }.xoai-kpi-grid { grid-template-columns:1fr 1fr;gap:9px; }.xoai-stat-card { padding:14px;min-height:120px; }.xoai-stat-card strong { font-size:20px; }.xoai-stat-top { font-size:10px; }.xoai-stat-top i { width:29px;height:29px; }.xoai-panel { padding:15px; }.xoai-period { width:100%;justify-content:space-between; }.xoai-period a { padding:7px 8px;font-size:10px; }.xoai-growth-grid { gap:8px; }.xoai-chart-summary strong { font-size:19px; } }
    `}</style>
  </main>;
}
