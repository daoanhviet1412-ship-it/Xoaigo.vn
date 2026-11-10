import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DemoModulePage } from "@/components/admin/demo-module-page";

export default async function ReconciliationPage() {
  if (process.env.VERCEL_ENV === "preview") return <DemoModulePage module="reconciliation" />;
  const supabase=await createClient();
  if(!supabase) return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const [{data:profile},{data:grants},{data:rolePermissions},{data:batches,error}]=await Promise.all([
    supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("reconciliation_batches").select("id,batch_code,source_system,source_reference,currency,status,period_start,period_end,created_at").order("created_at",{ascending:false}).limit(100)
  ]);
  if(profile?.status!=="active") return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
  const roles=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const permissions=(rolePermissions??[]).filter(x=>roles.includes(x.roles?.code??"")).map(x=>x.permissions?.code);
  if(!permissions.includes("reconciliation.read")) return <main style={{padding:36}}>Bạn không có quyền xem dữ liệu đối soát.</main>;
  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/funds">Nguồn tiền</a><a href="/admin/audit">Nhật ký</a></header>
    <section style={{padding:32,maxWidth:1180,margin:"0 auto"}}>
      <p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>RECONCILIATION CONTROL</p><h1 style={{fontSize:32,margin:"8px 0"}}>Đối soát</h1>
      <p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Đã tạo cấu trúc batch và dòng đối soát để lưu dấu vết so sánh. Chưa kết nối ngân hàng, payment provider, file đối soát hoặc quy tắc xác nhận chênh lệch.</p>
      <section style={{marginTop:22,background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Các đợt đối soát ({batches?.length??0})</div>{error?<p style={{padding:18,color:"#b42318"}}>{error.message}</p>:!batches?.length?<p style={{padding:20,color:"#718176"}}>Chưa có đợt đối soát. Chờ xác nhận nguồn dữ liệu, kỳ đối soát và quy tắc xử lý sai lệch.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Mã đợt","Nguồn","Tham chiếu","Tiền tệ","Trạng thái","Tạo lúc"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{batches.map(b=><tr key={b.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{b.batch_code}</td><td style={{padding:12}}>{b.source_system}</td><td style={{padding:12}}>{b.source_reference||"—"}</td><td style={{padding:12}}>{b.currency}</td><td style={{padding:12}}>{b.status}</td><td style={{padding:12}}>{new Date(b.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td></tr>)}</tbody></table></div>}</section>
    </section>
  </main>;
}
