import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetProposalForm } from "@/components/admin/budget-proposal-form";
import { ApprovalReviewQueue } from "@/components/admin/approval-review-queue";

export default async function BudgetsPage() {
  const supabase=await createClient();
  if(!supabase) return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const [{data:profile},{data:grants},{data:rolePermissions},{data:merchants},{data:campaigns},{data:requests,error}] = await Promise.all([
    supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("merchants").select("id,display_name").order("display_name").limit(300),
    supabase.from("marketing_campaigns").select("id,name,merchant_id").order("created_at",{ascending:false}).limit(300),
    supabase.from("approval_requests").select("id,request_type,resource_type,resource_id,proposed_payload,reason,status,requested_at,requested_by,requester:profiles!approval_requests_requested_by_fkey(display_name)").eq("request_type","marketing_budget_proposal").eq("status","pending").order("requested_at").limit(100)
  ]);
  if(profile?.status!=="active") return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
  const roleCodes=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const permissionCodes=(rolePermissions??[]).filter(x=>roleCodes.includes(x.roles?.code??"")).map(x=>x.permissions?.code).filter((v):v is string=>Boolean(v));
  const canRead=permissionCodes.includes("budgets.read");
  const canWrite=permissionCodes.includes("budgets.write");
  const canReview=permissionCodes.includes("budgets.review");
  if(!canRead && !canWrite && !canReview) return <main style={{padding:36}}>Bạn không có quyền truy cập ngân sách marketing.</main>;
  const items=(requests??[]).map(r=>({id:r.id,request_type:r.request_type,resource_type:r.resource_type,resource_id:r.resource_id,proposed_payload:r.proposed_payload,reason:r.reason,status:r.status,requested_at:r.requested_at,requested_by:r.requested_by,requester_name:Array.isArray(r.requester)?r.requester[0]?.display_name??null:r.requester?.display_name??null}));
  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/merchants">Cửa hàng</a><a href="/admin/members">Thành viên</a><a href="/admin/approvals">Phê duyệt</a><a href="/admin/policies">Chính sách</a><span style={{color:"#13864b",fontWeight:700}}>Ngân sách</span><a href="/admin/funds">Nguồn tiền</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/reconciliation">Đối soát</a><a href="/admin/audit">Nhật ký</a></header>
    <section style={{padding:32,maxWidth:1180,margin:"0 auto",display:"grid",gap:22}}>
      <div><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MARKETING GOVERNANCE</p><h1 style={{fontSize:32,margin:"8px 0"}}>Ngân sách marketing</h1><p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Hiện quản lý đề xuất và phê duyệt. Chưa có tài khoản ngân sách, số dư, phân bổ, giải ngân hoặc thanh toán được tạo.</p></div>
      {canWrite&&<BudgetProposalForm merchants={merchants??[]} campaigns={campaigns??[]}/>}
      <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Đề xuất đang chờ ({items.length})</div>
        {error?<p style={{padding:20,color:"#b42318"}}>Không tải được đề xuất: {error.message}</p>:canReview?<ApprovalReviewQueue items={items}/>:!items.length?<p style={{padding:20,color:"#718176"}}>Chưa có đề xuất ngân sách chờ duyệt.</p>:<p style={{padding:20,color:"#718176"}}>Bạn có quyền xem ngân sách nhưng không có quyền duyệt đề xuất.</p>}
      </section>
      <p style={{color:"#87948c",fontSize:12}}>Khi phê duyệt, hệ thống chỉ ghi nhận quyết định. Chưa có bất kỳ khoản tiền nào được giữ, phân bổ hoặc chuyển.</p>
    </section>
  </main>;
}
