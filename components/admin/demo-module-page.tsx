import Link from "next/link";
import {demoCustomers,demoStores,demoOrders,demoPointEvents,demoWalletEvents,demoLedger,demoReconciliation,demoSettlements} from "@/lib/demo-data";
type ModuleKey="customers"|"orders"|"points"|"wallet"|"ledger"|"reconciliation"|"settlements"|"stores";
const money=(n:number)=>new Intl.NumberFormat("vi-VN").format(n)+" ₫";
const points=(n:number)=>new Intl.NumberFormat("vi-VN").format(n)+" điểm";
const nav:[string,string][]=[["/admin","Tổng quan"],["/admin/demo-data?type=stores","Cửa hàng"],["/admin/demo-data?type=members","Khách hàng"],["/admin/orders","Đơn hàng"],["/admin/points","Điểm thành viên"],["/admin/wallet","Ví & biến động"],["/admin/ledger","Sổ cái"],["/admin/reconciliation","Đối soát"],["/admin/settlements","Công nợ & quyết toán"]];
const headers:Record<ModuleKey,string[]>={customers:["Mã thành viên","Khách hàng","Điện thoại giả lập","Khu vực","Điểm","Chi tiêu","Đơn hàng","Trạng thái"],stores:["Mã cửa hàng","Cửa hàng","Ngành hàng","Khu vực","Trạng thái"],orders:["Mã đơn","Khách hàng","Cửa hàng","Giá trị","Điểm","Trạng thái","Thời gian"],points:["Mã sự kiện","Khách hàng","Loại","Điểm","Trạng thái","Đơn liên quan"],wallet:["Mã biến động","Chủ tài khoản","Loại","Giá trị","Ngăn số dư","Tham chiếu"],ledger:["Mã bút toán","Diễn giải","Nguồn","Nợ","Có","Trạng thái"],reconciliation:["Mã đợt","Nguồn","Kỳ","Số dòng","Khớp","Chênh lệch","Trạng thái"],settlements:["Mã đợt","Cửa hàng","Tổng giao dịch","Phí minh họa","Thực nhận minh họa","Trạng thái"]};
const rows:Record<ModuleKey,(string|number)[][]>={
customers:demoCustomers.map(x=>[x.id,x.name,x.phone,x.area,points(x.points),money(x.spent),x.orders,x.status]),
stores:demoStores.map(x=>[x.id,x.name,x.category,x.area,x.status]),
orders:demoOrders.map(x=>[x.id,x.customer,x.store,money(x.amount),points(x.points),x.status,new Date(x.date).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})]),
points:demoPointEvents.map(x=>[x.id,x.customer,x.kind,points(x.points),x.state,x.order]),
wallet:demoWalletEvents.map(x=>[x.id,x.owner,x.type,points(x.amount),x.bucket,x.source]),
ledger:demoLedger.map(x=>[x.id,x.description,x.source,money(x.debit),money(x.credit),x.status]),
reconciliation:demoReconciliation.map(x=>[x.id,x.source,x.period,x.items,x.matched,x.difference,x.status]),
settlements:demoSettlements.map(x=>[x.id,x.store,money(x.gross),money(x.fees),money(x.net),x.status]),
};
const title:Record<ModuleKey,string>={customers:"Khách hàng DEMO",stores:"Cửa hàng DEMO",orders:"Đơn hàng & chi tiêu DEMO",points:"Điểm thành viên DEMO",wallet:"Ví & biến động DEMO",ledger:"Sổ cái minh họa",reconciliation:"Đối soát minh họa",settlements:"Công nợ & quyết toán minh họa"};
export function DemoModulePage({module}:{module:ModuleKey}){
 const cols=headers[module],data=rows[module];
 return <main style={{minHeight:"100vh",background:"#f5f8f5",color:"#173d2b",fontFamily:"Arial,sans-serif",padding:"26px clamp(14px,3vw,36px)"}}>
 <div style={{maxWidth:1400,margin:"auto",display:"grid",gap:18}}>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><div><Link href="/admin" style={{color:"#16864b",fontWeight:800,textDecoration:"none"}}>XOÀI GO ADMIN</Link><h1 style={{fontSize:29,margin:"12px 0 5px"}}>{title[module]}</h1><p style={{color:"#728078",fontSize:13,margin:0}}>Bộ dữ liệu dùng chung · liên kết bằng mã khách hàng, cửa hàng và đơn hàng.</p></div><span style={{background:"#fff3d9",color:"#936313",padding:"8px 12px",borderRadius:20,fontSize:11,fontWeight:800}}>PREVIEW · DEMO · CHỈ ĐỌC</span></header>
 <nav style={{display:"flex",gap:8,flexWrap:"wrap",background:"#fff",padding:12,border:"1px solid #e5ece7",borderRadius:12}}>{nav.map(([href,label])=><Link key={href} href={href} style={{color:"#28744b",fontSize:12,textDecoration:"none",padding:"7px 9px",background:"#f4f8f4",borderRadius:7}}>{label}</Link>)}</nav>
 <section style={{background:"#fff",border:"1px solid #e5ece7",borderRadius:14,overflow:"hidden"}}><div style={{padding:16,borderBottom:"1px solid #edf2ee",fontWeight:700}}>{data.length} bản ghi minh họa</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:760}}><thead><tr>{cols.map(c=><th key={c} style={{textAlign:"left",padding:12,background:"#f8fbf8",color:"#77867c",whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} style={{borderTop:"1px solid #edf2ee"}}>{r.map((v,j)=><td key={j} style={{padding:12,whiteSpace:"nowrap"}}>{v}</td>)}</tr>)}</tbody></table></div></section>
 {module==="customers"&&<section style={{background:"#fff",border:"1px solid #e5ece7",borderRadius:14,padding:16}}><b>Liên kết dữ liệu mẫu</b><p style={{fontSize:13,color:"#728078",lineHeight:1.7}}>Ví dụ: {demoCustomers[0].name} ({demoCustomers[0].id}) có {points(demoCustomers[0].points)}, chi tiêu {money(demoCustomers[0].spent)} qua {demoCustomers[0].orders} đơn. Các đơn và biến động điểm tham chiếu cùng mã thành viên này.</p></section>}
 <section style={{background:"#fffaf0",border:"1px solid #f0e4c9",borderRadius:12,padding:14,color:"#796b4f",fontSize:12,lineHeight:1.7}}><b>Lưu ý:</b> Toàn bộ số liệu, số dư, phí và bút toán là dữ liệu giả lập để kiểm tra giao diện/luồng. Không phải số liệu kinh doanh hoặc kế toán; không ghi Supabase, không tạo giao dịch, không cộng/trừ điểm thật, không chuyển tiền. Số điện thoại chỉ là dữ liệu giả lập, không dùng liên hệ.</section>
 </div></main>;
}
