import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{padding:40,fontFamily:"Arial,sans-serif"}}><h1>XOÀI GO · Control Center</h1><p>Preview chưa có cấu hình Supabase. Dashboard chưa truy vấn dữ liệu thật.</p></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{data:profile},{data:grants},{count:merchantCount},{count:pendingApprovalCount}] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,merchant_id,roles(code,name)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("merchants").select("id",{count:"exact",head:true}),
    supabase.from("approval_requests").select("id",{count:"exact",head:true}).eq("status","pending")
  ]);
  if(!profile || profile.status!=="active") return <main style={{padding:40,fontFamily:"Arial,sans-serif",color:"#173d2b"}}><h1>Tài khoản chưa được kích hoạt</h1><p>Hồ sơ người dùng đang bị khóa hoặc chưa đồng bộ. Quyền truy cập quản trị đã bị từ chối.</p></main>;
  const roleCodes=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const hasPlatformAccess=roleCodes.some(code=>["platform_owner","platform_admin","ops_manager","ops_agent","finance_manager","finance_operator","policy_reviewer"].includes(code));
  if(!hasPlatformAccess) return <main style={{padding:40,fontFamily:"Arial,sans-serif",color:"#173d2b"}}><h1>Chưa được cấp quyền quản trị</h1><p>Tài khoản {user.email} đã xác thực nhưng chưa có role nền tảng hợp lệ. Liên hệ người quản trị để được cấp quyền.</p></main>;
  const cards=[
    ["Tổng số cửa hàng",String(merchantCount??0),"Dữ liệu trực tiếp từ Supabase"],
    ["Yêu cầu chờ duyệt",String(pendingApprovalCount??0),"Hàng đợi phê duyệt"],
    ["Vai trò được cấp",String(roleCodes.length),"Quyền hiện tại của tài khoản"]
  ];
  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"18px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}>
      <div><b style={{color:"#13864b",letterSpacing:1.5}}>XOÀI GO</b><span style={{marginLeft:12,color:"#708076",fontSize:13}}>Control Center</span></div>
      <nav style={{display:"flex",gap:18,fontSize:13,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:700}}>Tổng quan</a><a href="/admin/merchants">Cửa hàng</a><a href="/admin/catalog">Danh mục</a><a href="/admin/campaigns">Chiến dịch</a><a href="/admin/members">Thành viên</a><a href="/admin/approvals">Phê duyệt</a><a href="/admin/policies">Chính sách</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/reconciliation">Đối soát</a><a href="/admin/points">Điểm</a><a href="/admin/settlements">Công nợ</a><a href="/admin/audit">Nhật ký</a></nav>
      <div style={{fontSize:13,color:"#65766b"}}>{profile.display_name||user.email}</div>
    </header>
    <section style={{padding:32,maxWidth:1200,margin:"0 auto"}}>
      <p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>OPERATIONS OVERVIEW</p>
      <h1 style={{fontSize:32,margin:"8px 0"}}>Tổng quan vận hành</h1>
      <p style={{color:"#718176",fontSize:14}}>Số liệu được truy vấn trực tiếp từ Supabase; không dùng dữ liệu mẫu hoặc localStorage.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:28}}>
        {cards.map(([label,value,caption])=><article key={label} style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:18,padding:22}}><div style={{fontSize:13,color:"#6d7c72"}}>{label}</div><strong style={{display:"block",fontSize:34,margin:"12px 0 5px"}}>{value}</strong><small style={{color:"#87948c"}}>{caption}</small></article>)}
      </div>
      <div style={{marginTop:24,padding:20,borderRadius:16,background:"#eaf5ee",color:"#326448",fontSize:13,lineHeight:1.7}}>Giai đoạn hiện tại: nền tảng dữ liệu, phân quyền, hồ sơ cửa hàng và thành viên đã được khởi tạo. Các module ngân sách, điểm thưởng, công nợ và sổ cái chưa mở vận hành; không hiển thị số dư tài chính giả.</div>
    </section>
  </main>;
}
