import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{padding:40,fontFamily:"Arial,sans-serif"}}><h1>XOÀI GO · Control Center</h1><p>Preview chưa có cấu hình Supabase. Dashboard chưa truy vấn dữ liệu thật.</p></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{data:profile,error:profileError},{data:grants,error:grantsError},{data:rolePermissions,error:permissionError},{count:merchantCount,error:merchantError},{count:pendingApprovalCount,error:approvalError},{count:memberCount,error:memberError},{count:activeCampaignCount,error:campaignError},{count:openOrderCount,error:orderError},{count:pendingMerchantCount,error:onboardingError},{count:pointsAccountCount,error:pointsError},{count:openObligationCount,error:obligationError},{count:overduePayableCount,error:payableError}] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,merchant_id,roles(code,name)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("merchants").select("id",{count:"exact",head:true}),
    supabase.from("approval_requests").select("id",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("member_profiles").select("user_id",{count:"exact",head:true}),
    supabase.from("marketing_campaigns").select("id",{count:"exact",head:true}).eq("status","active"),
    supabase.from("commerce_orders").select("id",{count:"exact",head:true}).in("status",["placed","accepted","preparing","ready"]),
    supabase.from("merchants").select("id",{count:"exact",head:true}).in("onboarding_status",["submitted","under_review"]),
    supabase.from("points_accounts").select("id",{count:"exact",head:true}),
    supabase.from("merchant_obligations").select("id",{count:"exact",head:true}).in("status",["draft","confirmed","disputed"]),
    supabase.from("merchant_obligations").select("id",{count:"exact",head:true}).eq("obligation_type","payable").eq("status","confirmed").lt("due_at",new Date().toISOString())
  ]);
  const dashboardErrors = [profileError,grantsError,permissionError,merchantError,approvalError,memberError,campaignError,orderError,onboardingError,pointsError,obligationError,payableError].filter(Boolean);
  if(dashboardErrors.length) return <main style={{minHeight:"100vh",padding:40,background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}><h1>Chưa thể tải đầy đủ dữ liệu quản trị</h1><p>Một hoặc nhiều truy vấn Supabase gặp lỗi. Dashboard tạm ẩn các chỉ số để tránh hiển thị số 0 gây hiểu nhầm. Vui lòng kiểm tra quyền đọc, kết nối và thử tải lại.</p><a href="/admin" style={{color:"#13864b"}}>Tải lại dashboard</a></main>;
  if(!profile || profile.status!=="active") return <main style={{padding:40,fontFamily:"Arial,sans-serif",color:"#173d2b"}}><h1>Tài khoản chưa được kích hoạt</h1><p>Hồ sơ người dùng đang bị khóa hoặc chưa đồng bộ. Quyền truy cập quản trị đã bị từ chối.</p></main>;
  const roleCodes=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const hasPlatformAccess=roleCodes.some(code=>["platform_owner","platform_admin","ops_manager","ops_agent","finance_manager","finance_operator","policy_reviewer"].includes(code));
  const permissionCodes=new Set((rolePermissions??[]).filter(row=>roleCodes.includes(row.roles?.code??"")).map(row=>row.permissions?.code).filter((code):code is string=>Boolean(code)));
  const canSee=(...codes:string[])=>codes.some(code=>permissionCodes.has(code));
  if(!hasPlatformAccess) return <main style={{padding:40,fontFamily:"Arial,sans-serif",color:"#173d2b"}}><h1>Chưa được cấp quyền quản trị</h1><p>Tài khoản {user.email} đã xác thực nhưng chưa có role nền tảng hợp lệ. Liên hệ người quản trị để được cấp quyền.</p></main>;
  const cards=[
    {label:"Tổng số cửa hàng",value:merchantCount,permission:["merchants.read","merchants.manage"],caption:"Dữ liệu trực tiếp từ Supabase"},
    {label:"Yêu cầu chờ duyệt",value:pendingApprovalCount,permission:["approvals.read","approvals.review","budgets.review"],caption:"Hàng đợi phê duyệt"},
    {label:"Thành viên",value:memberCount,permission:["members.read","members.manage"],caption:"Hồ sơ thành viên"},
    {label:"Chiến dịch đang chạy",value:activeCampaignCount,permission:["campaigns.read","campaigns.manage"],caption:"Trạng thái từ dữ liệu chiến dịch"},
    {label:"Đơn hàng đang xử lý",value:openOrderCount,permission:["orders.read","orders.manage"],caption:"Đơn chưa hoàn tất hoặc hủy"},
    {label:"Merchant chờ xử lý",value:pendingMerchantCount,permission:["merchants.read","merchants.manage"],caption:"Đã gửi hoặc đang được xem xét"},
    {label:"Tài khoản điểm",value:pointsAccountCount,permission:["points.read","points.manage"],caption:"Số tài khoản, không phải số dư điểm"},
    {label:"Nghĩa vụ chưa tất toán",value:openObligationCount,permission:["settlement.read","settlement.manage"],caption:"Khoản nháp, đã xác nhận hoặc tranh chấp"},
    {label:"Khoản phải trả quá hạn",value:overduePayableCount,permission:["settlement.read","settlement.manage"],caption:"Nghĩa vụ đã xác nhận quá hạn thanh toán"}
  ].map(card=>({...card,visible:canSee(...card.permission)}));
  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"18px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}>
      <div><b style={{color:"#13864b",letterSpacing:1.5}}>XOÀI GO</b><span style={{marginLeft:12,color:"#708076",fontSize:13}}>Control Center</span></div>
      <nav style={{display:"flex",gap:18,fontSize:13,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:700}}>Tổng quan</a><a href="/admin/merchants">Cửa hàng</a><a href="/admin/orders">Đơn hàng</a><a href="/admin/access">Truy cập</a><a href="/admin/catalog">Danh mục</a><a href="/admin/campaigns">Chiến dịch</a><a href="/admin/members">Thành viên</a><a href="/admin/approvals">Phê duyệt</a><a href="/admin/policies">Chính sách</a><a href="/admin/finance-model">Mô hình tài chính</a><a href="/admin/product-decisions">Quyết định sản phẩm</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/reconciliation">Đối soát</a><a href="/admin/points">Điểm</a><a href="/admin/settlements">Công nợ</a><a href="/admin/audit">Nhật ký</a></nav>
      <div style={{fontSize:13,color:"#65766b"}}>{profile.display_name||user.email}</div>
    </header>
    <section style={{padding:32,maxWidth:1200,margin:"0 auto"}}>
      <p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>OPERATIONS OVERVIEW</p>
      <h1 style={{fontSize:32,margin:"8px 0"}}>Tổng quan vận hành</h1>
      <p style={{color:"#718176",fontSize:14}}>Số liệu được truy vấn trực tiếp từ Supabase; không dùng dữ liệu mẫu hoặc localStorage.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:28}}>
        {cards.map(card=><article key={card.label} style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:18,padding:22}}><div style={{fontSize:13,color:"#6d7c72"}}>{card.label}</div><strong style={{display:"block",fontSize:card.visible?34:16,margin:"12px 0 5px"}}>{card.visible?String(card.value??0):"Không có quyền xem"}</strong><small style={{color:"#87948c"}}>{card.visible?card.caption:"Liên hệ quản trị viên để được cấp quyền phù hợp."}</small></article>)}
      </div>
      <div style={{marginTop:24,padding:20,borderRadius:16,background:"#eaf5ee",color:"#326448",fontSize:13,lineHeight:1.7}}>Dashboard chỉ hiển thị chỉ số có nguồn dữ liệu thật. Tài khoản điểm và nghĩa vụ được hiển thị theo số bản ghi, không suy diễn thành số dư tiền. Luồng giao dịch tại quán, ngân sách đã nạp/phân bổ và số dư điểm khả dụng/chờ vẫn chưa được bật; không có số liệu tài chính giả lập.</div>
    </section>
  </main>;
}
