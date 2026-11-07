import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MerchantCreateForm } from "@/components/admin/merchant-create-form";

export default async function MerchantsPage() {
  const supabase=await createClient();
  if(!supabase) return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const [{data:profile},{data:grants},{data:merchants,error}] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,roles(code,name)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("merchants").select("id,display_name,legal_name,business_type,onboarding_status,status,contact_phone,created_at").order("created_at",{ascending:false}).limit(100)
  ]);
  if(!profile || profile.status!=="active") return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
  const roleCodes=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const allowed=roleCodes.some(code=>["platform_owner","platform_admin","ops_manager","ops_agent"].includes(code));
  if(!allowed) return <main style={{padding:36}}>Bạn không có quyền truy cập danh sách cửa hàng.</main>;

  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><span style={{marginLeft:12,color:"#718176"}}>/ Quản lý cửa hàng</span></header>
    <section style={{padding:32,maxWidth:1250,margin:"0 auto"}}>
      <p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MERCHANT MANAGEMENT</p>
      <h1 style={{fontSize:32,margin:"8px 0"}}>Quản lý cửa hàng</h1>
      <p style={{color:"#718176",fontSize:14}}>Tạo hồ sơ và theo dõi trạng thái onboarding. Hồ sơ mới luôn ở trạng thái Nháp.</p>
      <section style={{padding:22,marginTop:24,background:"#fff",border:"1px solid #e0eae3",borderRadius:18}}>
        <h2 style={{fontSize:17,margin:"0 0 18px"}}>Thêm cửa hàng</h2>
        <MerchantCreateForm/>
      </section>
      <section style={{marginTop:24,background:"#fff",border:"1px solid #e0eae3",borderRadius:18,overflow:"hidden"}}>
        <div style={{padding:20,borderBottom:"1px solid #e8efe9",display:"flex",justifyContent:"space-between"}}><b>Danh sách cửa hàng</b><span style={{fontSize:12,color:"#718176"}}>{merchants?.length??0} hồ sơ hiển thị</span></div>
        {error?<p style={{padding:20,color:"#b42318"}}>Không thể tải danh sách: {error.message}</p>:!merchants?.length?<p style={{padding:24,color:"#718176"}}>Chưa có cửa hàng. Tạo hồ sơ đầu tiên để bắt đầu.</p>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{textAlign:"left",background:"#f8fbf8",color:"#718176"}}>{["Cửa hàng","Loại hình","Điện thoại","Onboarding","Tài khoản"].map(h=><th key={h} style={{padding:"13px 16px",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{merchants.map(m=><tr key={m.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:"14px 16px"}}><b>{m.display_name}</b><small style={{display:"block",marginTop:4,color:"#87948c"}}>{m.legal_name}</small></td><td style={{padding:"14px 16px"}}>{m.business_type||"—"}</td><td style={{padding:"14px 16px"}}>{m.contact_phone||"—"}</td><td style={{padding:"14px 16px"}}>{m.onboarding_status}</td><td style={{padding:"14px 16px"}}>{m.status}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </section>
  </main>;
}
