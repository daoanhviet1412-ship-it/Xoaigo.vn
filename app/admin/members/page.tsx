import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase=await createClient();
  if(!supabase) return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const [{data:profile},{data:grants},{data:members,error}]=await Promise.all([
    supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,roles(code)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("member_profiles").select("user_id,member_code,joined_at,profiles!member_profiles_user_id_fkey(display_name,phone,status)").order("joined_at",{ascending:false}).limit(100)
  ]);
  if(profile?.status!=="active") return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
  const codes=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const allowed=codes.some(code=>["platform_owner","platform_admin","ops_manager"].includes(code));
  if(!allowed) return <main style={{padding:36}}>Bạn không có quyền xem danh sách thành viên.</main>;

  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><span style={{marginLeft:12,color:"#718176"}}>/ Thành viên</span></header>
    <section style={{padding:32,maxWidth:1200,margin:"0 auto"}}>
      <p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MEMBER DIRECTORY</p>
      <h1 style={{fontSize:32,margin:"8px 0"}}>Quản lý thành viên</h1>
      <p style={{color:"#718176",fontSize:14}}>Danh sách hồ sơ thành viên đã đăng ký. Chỉ hiển thị dữ liệu được phép theo RLS.</p>
      <section style={{marginTop:24,background:"#fff",border:"1px solid #e0eae3",borderRadius:18,overflow:"hidden"}}>
        <div style={{padding:20,borderBottom:"1px solid #e8efe9",display:"flex",justifyContent:"space-between"}}><b>Thành viên</b><span style={{fontSize:12,color:"#718176"}}>{members?.length??0} hồ sơ</span></div>
        {error?<p style={{padding:20,color:"#b42318"}}>Không thể tải danh sách: {error.message}</p>:!members?.length?<p style={{padding:24,color:"#718176"}}>Chưa có thành viên đăng ký trong hệ thống.</p>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{textAlign:"left",background:"#f8fbf8",color:"#718176"}}>{["Thành viên","Mã thành viên","Điện thoại","Ngày tham gia","Trạng thái"].map(h=><th key={h} style={{padding:"13px 16px",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{members.map(m=><tr key={m.user_id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:"14px 16px"}}><b>{m.profiles?.display_name||"Chưa cập nhật"}</b><small style={{display:"block",marginTop:4,color:"#87948c"}}>{m.user_id.slice(0,8)}…</small></td><td style={{padding:"14px 16px"}}>{m.member_code||"—"}</td><td style={{padding:"14px 16px"}}>{m.profiles?.phone||"—"}</td><td style={{padding:"14px 16px"}}>{new Date(m.joined_at).toLocaleDateString("vi-VN")}</td><td style={{padding:"14px 16px"}}>{m.profiles?.status||"—"}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </section>
  </main>;
}
