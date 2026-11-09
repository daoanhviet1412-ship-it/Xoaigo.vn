import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DemoModulePage } from "@/components/admin/demo-module-page";

export default async function SettlementsPage(){
  if (process.env.VERCEL_ENV === "preview") return <DemoModulePage module="settlements" />;
 const supabase=await createClient(); if(!supabase)return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
 const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/admin/login");
 const [{data:profile},{data:grants},{data:rolePermissions},{data:obligations,error:obligationError},{data:batches,error:batchError}] = await Promise.all([
  supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
  supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
  supabase.from("role_permissions").select("roles(code),permissions(code)"),
  supabase.from("merchant_obligations").select("id,merchant_id,obligation_type,source_type,source_id,amount,currency,status,due_at,description,created_at").order("created_at",{ascending:false}).limit(100),
  supabase.from("settlement_batches").select("id,batch_code,merchant_id,currency,status,period_start,period_end,created_at").order("created_at",{ascending:false}).limit(100)
 ]);
 if(profile?.status!=="active")return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
 const roles=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
 const permissions=(rolePermissions??[]).filter(x=>roles.includes(x.roles?.code??"")).map(x=>x.permissions?.code);
 if(!permissions.includes("settlement.read"))return <main style={{padding:36}}>Bạn không có quyền xem công nợ và đối soát.</main>;
 return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
  <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/points">Điểm thành viên</a><a href="/admin/ledger">Sổ cái</a><a href="/admin/reconciliation">Đối soát</a><a href="/admin/audit">Nhật ký</a></header>
  <section style={{padding:32,maxWidth:1180,margin:"0 auto",display:"grid",gap:22}}><div><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>MERCHANT FINANCE</p><h1 style={{fontSize:32,margin:"8px 0"}}>Công nợ & quyết toán</h1><p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Đã có cấu trúc khoản phải thu/phải trả, batch quyết toán và dòng đối soát. Chưa tính công nợ tự động, xác nhận thanh toán, giải ngân hoặc chuyển tiền.</p></div>
  <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Nghĩa vụ merchant ({obligations?.length??0})</div>{obligationError?<p style={{padding:18,color:"#b42318"}}>{obligationError.message}</p>:!obligations?.length?<p style={{padding:20,color:"#718176"}}>Chưa có khoản phải thu/phải trả. Cần duyệt quy tắc tính phí, thời điểm ghi nhận và điều khoản merchant trước khi phát sinh.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Merchant","Loại","Số tiền","Trạng thái","Hạn","Mô tả"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{obligations.map(o=><tr key={o.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{o.merchant_id}</td><td style={{padding:12}}>{o.obligation_type}</td><td style={{padding:12}}>{Number(o.amount).toLocaleString("vi-VN")} {o.currency}</td><td style={{padding:12}}>{o.status}</td><td style={{padding:12}}>{o.due_at?new Date(o.due_at).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }):"—"}</td><td style={{padding:12}}>{o.description}</td></tr>)}</tbody></table></div>}</section>
  <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Đợt quyết toán ({batches?.length??0})</div>{batchError?<p style={{padding:18,color:"#b42318"}}>{batchError.message}</p>:!batches?.length?<p style={{padding:20,color:"#718176"}}>Chưa có đợt quyết toán. Không có lịch thanh toán hay chuyển tiền nào được thiết lập.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Mã batch","Merchant","Tiền tệ","Trạng thái","Tạo lúc"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{batches.map(b=><tr key={b.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{b.batch_code}</td><td style={{padding:12}}>{b.merchant_id||"Toàn nền tảng"}</td><td style={{padding:12}}>{b.currency}</td><td style={{padding:12}}>{b.status}</td><td style={{padding:12}}>{new Date(b.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td></tr>)}</tbody></table></div>}</section>
  </section></main>;
}
