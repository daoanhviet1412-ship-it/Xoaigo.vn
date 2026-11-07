import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PointsPage(){
 const supabase=await createClient(); if(!supabase)return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/admin/login");
 const [{data:profile},{data:grants},{data:rolePermissions},{data:accounts,error}] = await Promise.all([
  supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
  supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
  supabase.from("role_permissions").select("roles(code),permissions(code)"),
  supabase.from("points_accounts").select("id,member_user_id,program_code,status,created_at").order("created_at",{ascending:false}).limit(100)
 ]);
 if(profile?.status!=="active")return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
 const roles=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
 const permissions=(rolePermissions??[]).filter(x=>roles.includes(x.roles?.code??"")).map(x=>x.permissions?.code);
 if(!permissions.includes("points.read"))return <main style={{padding:36}}>Bạn không có quyền xem điểm thành viên.</main>;
 return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
  <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/settlements">Công nợ & đối soát</a><a href="/admin/audit">Nhật ký</a></header>
  <section style={{padding:32,maxWidth:1180,margin:"0 auto"}}><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MEMBER BENEFITS</p><h1 style={{fontSize:32,margin:"8px 0"}}>Điểm thành viên</h1><p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Đã có cấu trúc tài khoản điểm, bút toán điểm bất biến và điểm giữ. Chưa bật ghi nhận, đổi, hết hạn hoặc hoàn điểm; không có tỷ lệ quy đổi nào được tự đặt. Điểm không được xem là tiền mặt.</p>
  <section style={{marginTop:22,background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Tài khoản điểm ({accounts?.length??0})</div>{error?<p style={{padding:18,color:"#b42318"}}>{error.message}</p>:!accounts?.length?<p style={{padding:20,color:"#718176"}}>Chưa có tài khoản điểm. Cần chốt chương trình, chính sách và điều kiện thành viên trước khi mở.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Thành viên","Chương trình","Trạng thái","Tạo lúc"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{accounts.map(a=><tr key={a.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{a.member_user_id}</td><td style={{padding:12}}>{a.program_code}</td><td style={{padding:12}}>{a.status}</td><td style={{padding:12}}>{new Date(a.created_at).toLocaleString("vi-VN")}</td></tr>)}</tbody></table></div>}</section>
  </section></main>;
}
