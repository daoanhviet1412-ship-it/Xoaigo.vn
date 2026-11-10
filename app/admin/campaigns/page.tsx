import { PreviewModule } from "@/components/admin/preview-module";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {CampaignCreateForm} from "@/components/admin/campaign-create-form";
export default async function CampaignsPage(){
  if (process.env.VERCEL_ENV === "preview") return <PreviewModule module="campaigns" />;
 const supabase=await createClient();if(!supabase)return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/admin/login");
 const [{data:profile},{data:grants},{data:rolePermissions},{data:merchants},{data:campaigns,error}]=await Promise.all([
  supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
  supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
  supabase.from("role_permissions").select("roles(code),permissions(code)"),
  supabase.from("merchants").select("id,display_name").order("display_name").limit(300),
  supabase.from("marketing_campaigns").select("id,merchant_id,name,description,status,starts_at,ends_at,created_at").order("created_at",{ascending:false}).limit(100)
 ]);
 if(profile?.status!=="active")return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
 const roles=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));const perms=(rolePermissions??[]).filter(x=>roles.includes(x.roles?.code??"")).map(x=>x.permissions?.code);
 const canRead=perms.includes("campaigns.read")||perms.includes("campaigns.manage");const canManage=perms.includes("campaigns.manage");
 if(!canRead)return <main style={{padding:36}}>Bạn không có quyền xem chiến dịch.</main>;
 const merchantNames=new Map((merchants??[]).map(m=>[m.id,m.display_name]));
 return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}><header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/merchants">Cửa hàng</a><a href="/admin/catalog">Danh mục</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/approvals">Phê duyệt</a></header><section style={{padding:32,maxWidth:1180,margin:"0 auto",display:"grid",gap:22}}><div><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MARKETING OPERATIONS</p><h1 style={{fontSize:32,margin:"8px 0"}}>Chiến dịch marketing</h1><p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Chiến dịch mới chỉ được tạo ở trạng thái nháp. Không có ngân sách, chiết khấu hoặc nội dung khuyến mại nào tự động được kích hoạt.</p></div>{canManage&&<CampaignCreateForm merchants={merchants??[]}/>}<section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Danh sách chiến dịch ({campaigns?.length??0})</div>{error?<p style={{padding:18,color:"#b42318"}}>{error.message}</p>:!campaigns?.length?<p style={{padding:20,color:"#718176"}}>Chưa có chiến dịch trong phạm vi truy cập.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Chiến dịch","Cửa hàng","Trạng thái","Bắt đầu","Kết thúc"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{campaigns.map(c=><tr key={c.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}><b>{c.name}</b><small style={{display:"block",color:"#87948c",marginTop:4}}>{c.description||"—"}</small></td><td style={{padding:12}}>{merchantNames.get(c.merchant_id)||c.merchant_id}</td><td style={{padding:12}}>{c.status}</td><td style={{padding:12}}>{c.starts_at?new Date(c.starts_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }):"—"}</td><td style={{padding:12}}>{c.ends_at?new Date(c.ends_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }):"—"}</td></tr>)}</tbody></table></div>}</section></section></main>;
}
