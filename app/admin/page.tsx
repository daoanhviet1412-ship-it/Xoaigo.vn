import Link from "next/link";
import { DemoDashboard } from "@/components/admin/demo-dashboard";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Activity, AlertTriangle, ArrowRight, BadgeCheck, CalendarDays,
  CircleDollarSign, Clock3, Coins, CreditCard, ShoppingBag, Store,
  Users, Wallet, TrendingUp, ClipboardCheck, Megaphone
} from "lucide-react";

type SearchParams = Promise<{ period?: string }>;

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
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
    </svg> : <div className="xoai-chart-empty"><Activity size={22}/><b>Chưa có dữ liệu giao dịch</b><span>Biểu đồ sẽ hiển thị khi có đủ dữ liệu đơn hàng trong kỳ.</span></div>}
    <div className="xoai-chart-labels">{points.filter((_,i)=>i===0||i===points.length-1||i%Math.max(1,Math.floor(points.length/5))===0).map((p,i)=><span key={i}>{p.label}</span>)}</div>
  </div>;
}
function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: { label: string; href: string } }) {
  return <div className="xoai-section-title"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action && <Link href={action.href}>{action.label}<ArrowRight size={14}/></Link>}</div>;
}

export default async function AdminHomePage({ searchParams }: { searchParams: SearchParams }) {
  if (process.env.VERCEL_ENV === "preview") return <DemoDashboard />;
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
  const hasCompleteGmv = (completedOrderCount ?? 0) <= orderRows.length;
  const aov=completedOrderCount && hasCompleteGmv ? gmv/completedOrderCount : 0;
  const periodLabel=period==="7d"?"7 ngày gần nhất":period==="month"?"Tháng này":"30 ngày gần nhất";
  const fmtCount=(n:number|null)=>n===null?"—":new Intl.NumberFormat("vi-VN").format(n);
  const showGmv=canSee("orders.read","orders.manage");
  const showMerchants=canSee("merchants.read","merchants.manage");
  const showMembers=canSee("members.read","members.manage");
  const showApprovals=canSee("approvals.read","approvals.review","budgets.review");
  const showCampaigns=canSee("campaigns.read","campaigns.manage");

  const cards=[
    {label:"Doanh thu (GMV)",value:showGmv?(hasCompleteGmv?money(gmv):"Cần tổng hợp"): "Không có quyền",hint:showGmv?`${fmtCount(completedOrderCount)} giao dịch hoàn tất · ${periodLabel}`:"Cần quyền xem đơn hàng",icon:CircleDollarSign,tone:"green" as const},
    {label:"Số giao dịch",value:showGmv?fmtCount(completedOrderCount):"—",hint:"Đơn hàng trạng thái hoàn tất",icon:ShoppingBag,tone:"blue" as const},
    {label:"Giá trị giao dịch TB",value:showGmv?(hasCompleteGmv?money(aov):"—"):"—",hint:"GMV / số giao dịch hoàn tất",icon:TrendingUp,tone:"blue" as const},
    {label:"Cửa hàng hoạt động",value:showMerchants?fmtCount(activeMerchantCount):"—",hint:showMerchants?`/${fmtCount(merchantCount)} cửa hàng trong hệ thống`:"Cần quyền xem cửa hàng",icon:Store,tone:"green" as const},
    {label:"Thành viên",value:showMembers?fmtCount(memberCount):"—",hint:showMembers?`+${fmtCount(newMemberCount)} thành viên mới trong kỳ`:"Cần quyền xem thành viên",icon:Users,tone:"blue" as const},
    {label:"Chiến dịch đang chạy",value:showCampaigns?fmtCount(activeCampaignCount):"—",hint:"Trạng thái từ dữ liệu chiến dịch",icon:Megaphone,tone:"amber" as const},
  ];
  const chartPoints=orderBuckets.map((b)=>({label:b.label,value:hasCompleteGmv?b.value:0}));
  const missingFinancial=[
    ...(hasCompleteGmv?[]:["Số đơn hoàn tất vượt giới hạn bản ghi truy vấn; GMV tạm ẩn để tránh tổng thiếu. Cần RPC/view tổng hợp phía database."]),
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
          <div className="xoai-chart-summary"><strong>{showGmv&&hasCompleteGmv?money(gmv):"—"}</strong><span>Tổng GMV trong kỳ</span></div>
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
        <div><b>Minh bạch dữ liệu tài chính</b><p>GMV hiện được tính từ tổng <code>total_amount</code> của đơn hàng đã hoàn tất trong Core Platform (tối đa 2.000 bản ghi; nếu vượt giới hạn, giá trị được ẩn để tránh tổng thiếu). Đây là giá trị giao dịch qua ứng dụng, không phải doanh thu kế toán của Xoài. Top-up ngân hàng, wallet balance, bucket Pending/Available và phí nền tảng chưa có nguồn dữ liệu vận hành được xác minh nên đang để “Chưa có dữ liệu”.</p><ul>{missingFinancial.map((item)=><li key={item}>{item}</li>)}</ul><Link href="/admin/finance-model">Mở mô hình tài chính <ArrowRight size={14}/></Link></div>
      </section>
      <footer className="xoai-dashboard-footer"><span><span className="xoai-status-dot"/> Dữ liệu truy vấn trực tiếp từ Core Platform</span><span>Cập nhật lúc {now.toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})} · Asia/Ho_Chi_Minh</span></footer>
    </div>

  </main>;
}
