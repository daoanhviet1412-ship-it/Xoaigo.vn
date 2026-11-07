import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LedgerPage() {
  const supabase=await createClient();
  if(!supabase) return <main style={{padding:36}}>Preview chưa cấu hình Supabase.</main>;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const [{data:profile},{data:grants},{data:rolePermissions},{data:accounts,error:accountError},{data:transactions,error:transactionError}]=await Promise.all([
    supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("ledger_accounts").select("id,account_code,account_name,account_class,is_active").order("account_code"),
    supabase.from("journal_transactions").select("id,transaction_code,description,source_type,status,currency,effective_at,created_at").order("created_at",{ascending:false}).limit(100)
  ]);
  if(profile?.status!=="active") return <main style={{padding:36}}>Tài khoản chưa được kích hoạt.</main>;
  const roles=(grants??[]).map(g=>g.roles?.code).filter((v):v is string=>Boolean(v));
  const permissions=(rolePermissions??[]).filter(x=>roles.includes(x.roles?.code??"")).map(x=>x.permissions?.code);
  if(!permissions.includes("ledger.read")) return <main style={{padding:36}}>Bạn không có quyền xem sổ cái.</main>;
  return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif"}}>
    <header style={{padding:"20px 32px",background:"#fff",borderBottom:"1px solid #e0eae3",display:"flex",gap:18,flexWrap:"wrap"}}><a href="/admin" style={{color:"#13864b",fontWeight:800}}>XOÀI GO</a><a href="/admin/merchants">Cửa hàng</a><a href="/admin/approvals">Phê duyệt</a><a href="/admin/budgets">Ngân sách</a><a href="/admin/reconciliation">Đối soát</a><a href="/admin/audit">Nhật ký</a></header>
    <section style={{padding:32,maxWidth:1180,margin:"0 auto",display:"grid",gap:20}}>
      <div><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>FINANCE CONTROL</p><h1 style={{fontSize:32,margin:"8px 0"}}>Sổ cái bất biến</h1><p style={{color:"#718176",fontSize:14,lineHeight:1.7}}>Nền tảng double-entry đã có cấu trúc và ràng buộc cân bằng. Hiện chỉ đọc; chưa có chart of accounts nghiệp vụ, lệnh ghi sổ, số dư hoặc giao dịch tài chính thật.</p></div>
      <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Danh mục tài khoản ({accounts?.length??0})</div>{accountError?<p style={{padding:18,color:"#b42318"}}>{accountError.message}</p>:!accounts?.length?<p style={{padding:20,color:"#718176"}}>Chưa có tài khoản kế toán. Không tự tạo mã hoặc phân loại tài khoản khi chưa có sơ đồ được duyệt.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Mã","Tên","Phân loại","Trạng thái"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{accounts.map(a=><tr key={a.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{a.account_code}</td><td style={{padding:12}}>{a.account_name}</td><td style={{padding:12}}>{a.account_class}</td><td style={{padding:12}}>{a.is_active?"Đang dùng":"Ngừng dùng"}</td></tr>)}</tbody></table></div>}</section>
      <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,overflow:"hidden"}}><div style={{padding:18,borderBottom:"1px solid #e8efe9",fontWeight:700}}>Bút toán ({transactions?.length??0})</div>{transactionError?<p style={{padding:18,color:"#b42318"}}>{transactionError.message}</p>:!transactions?.length?<p style={{padding:20,color:"#718176"}}>Chưa có bút toán. Mọi giao dịch ghi sổ đang bị khóa cho đến khi có sơ đồ tài khoản, quy tắc ghi nhận và quyền vận hành được duyệt.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Mã","Mô tả","Nguồn","Trạng thái","Tiền tệ","Ngày hiệu lực"].map(h=><th key={h} style={{textAlign:"left",padding:12}}>{h}</th>)}</tr></thead><tbody>{transactions.map(t=><tr key={t.id} style={{borderTop:"1px solid #edf2ee"}}><td style={{padding:12}}>{t.transaction_code}</td><td style={{padding:12}}>{t.description}</td><td style={{padding:12}}>{t.source_type}</td><td style={{padding:12}}>{t.status}</td><td style={{padding:12}}>{t.currency}</td><td style={{padding:12}}>{new Date(t.effective_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td></tr>)}</tbody></table></div>}</section>
    </section>
  </main>;
}
