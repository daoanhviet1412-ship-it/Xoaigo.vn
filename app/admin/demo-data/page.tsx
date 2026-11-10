import { PreviewModule } from "@/components/admin/preview-module";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DemoWorkspace } from "@/components/admin/demo-workspace";
import { Store, Users, Sparkles, RotateCcw, MapPin, Search, BadgeCheck } from "lucide-react";

type Params = Promise<{ type?: string; page?: string }>;
const areas = ["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Liên Chiểu","Cẩm Lệ","Hòa Vang"];
const categories = [
  {name:"Cà phê",icon:"☕",color:"#8b5e3c"},
  {name:"Trà sữa",icon:"🧋",color:"#b77945"},
  {name:"Nhà hàng",icon:"🍽️",color:"#d97757"},
  {name:"Quán ăn",icon:"🍜",color:"#d49a38"},
  {name:"Đồ uống",icon:"🥤",color:"#4e9b87"},
  {name:"Làm đẹp",icon:"💆",color:"#b66f91"},
  {name:"Thời trang",icon:"👕",color:"#7185b7"},
  {name:"Siêu thị mini",icon:"🛒",color:"#5c9b65"},
];
const storePrefixes = ["Nhà","Mộc","Góc","Tiệm","Bếp","Phố","Lá","Nắng","Mây","An"];
const storeNames = ["Xanh","Nhỏ","Đà Thành","Mùa Hạ","Ban Mai","Thảnh Thơi","Phố Hội","Nhiên","Mỗi Ngày","Bình Yên"];
const firstNames = ["Minh","Anh","Hương","Tuấn","Linh","Trang","Nam","Thảo","Quân","Vy","Hải","Ngọc","Phúc","My","Duy","Lan","Khoa","Trâm","Long","Chi"];
const lastNames = ["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Võ","Đặng","Bùi","Đỗ","Ngô"];
const pick = <T,>(items:T[],n:number)=>items[n%items.length];
const stores = Array.from({length:100},(_,i)=>{
  const c=pick(categories,i*7+2);
  const name=`${pick(storePrefixes,i*3)} ${pick(storeNames,i*5)} ${i+1}`;
  return {id:i+1,name,code:`XO-MER-${String(i+1).padStart(4,"0")}`,category:c.name,icon:c.icon,color:c.color,area:pick(areas,i*11+1),address:`${18+(i*13)%180} ${pick(["Lê Duẩn","Nguyễn Văn Linh","Trần Phú","Phan Châu Trinh","Ngô Quyền","2 Tháng 9","Hoàng Diệu"],i*3)}, Đà Nẵng`,status:i%10===0?"Chờ duyệt":i%13===0?"Tạm ngưng":"Đang hoạt động",rating:(4.1+(i%9)*0.1).toFixed(1),orders:35+(i*47)%620,joined: new Date(Date.UTC(2026, i%10, 1+(i*3)%27)).toLocaleDateString("vi-VN")};
});
const members = Array.from({length:1000},(_,i)=>{
  const name=`${pick(lastNames,i*7)} ${pick(firstNames,i*3+1)} ${pick(firstNames,i*11+5)}`;
  return {id:i+1,name,code:`XO-MB-${String(i+1).padStart(6,"0")}`,phone:`09${String(10000000+i*7919).slice(0,8)}`,area:pick(areas,i*13),points:((i*137)%95000)+500,orders:(i*7)%42,status:i%31===0?"Chưa xác minh":i%47===0?"Tạm khóa":"Hoạt động",joined:new Date(Date.UTC(2026,i%11,1+(i*5)%27)).toLocaleDateString("vi-VN")};
});
const styles = `
.demo-wrap{min-height:calc(100vh - 64px);padding:28px 32px 48px;background:#f5f8f5;color:#173d2b}
.demo-inner{max-width:1440px;margin:auto;display:grid;gap:20px}
.demo-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
.demo-kicker{font-size:10px;font-weight:850;letter-spacing:1.8px;color:#16864b;margin:0 0 8px}
.demo-head h1{font-size:29px;margin:0;letter-spacing:-.6px}
.demo-head p{font-size:13px;color:#78867d;margin:8px 0 0}
.demo-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid #f0d9a9;background:#fff8e9;color:#9b6a19;padding:8px 11px;border-radius:9px;font-size:11px;font-weight:800}
.demo-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
.demo-stat,.demo-panel{background:#fff;border:1px solid #e5ece7;border-radius:15px;padding:18px}
.demo-stat span{display:flex;align-items:center;gap:8px;color:#78867d;font-size:12px}
.demo-stat strong{display:block;font-size:26px;margin-top:8px}
.demo-stat small{font-size:10px;color:#96a198}
.demo-tabs{display:flex;gap:6px;padding:5px;background:#edf3ee;border-radius:11px;width:max-content}
.demo-tabs a{padding:9px 14px;border-radius:8px;color:#627268;text-decoration:none;font-size:12px;font-weight:700}
.demo-tabs a.active{background:#fff;color:#16864b;box-shadow:0 1px 4px #193f2d12}
.demo-table-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:14px;flex-wrap:wrap}
.demo-table-head b{font-size:14px}
.demo-table-head small{font-size:11px;color:#87948c}
.demo-table{width:100%;border-collapse:collapse;font-size:12px}
.demo-table th{text-align:left;background:#f8fbf8;color:#819087;font-size:10px;letter-spacing:.4px;padding:12px 13px;white-space:nowrap}
.demo-table td{padding:12px 13px;border-top:1px solid #edf2ee;white-space:nowrap}
.demo-identity{display:flex;align-items:center;gap:10px}
.demo-avatar{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;color:white;font-weight:800;font-size:12px;flex-shrink:0}
.demo-identity b{display:block;font-size:12px}
.demo-identity small{display:block;color:#98a39b;font-size:10px;margin-top:3px}
.demo-status{display:inline-flex;padding:5px 8px;border-radius:20px;background:#eaf6ee;color:#16864b;font-size:10px;font-weight:700}
.demo-status.wait{background:#fff5e5;color:#a36d19}
.demo-status.off{background:#f1f2f1;color:#77827a}
.demo-pager{display:flex;justify-content:space-between;align-items:center;padding-top:15px;gap:10px;color:#819087;font-size:11px}
.demo-pager nav{display:flex;gap:5px;flex-wrap:wrap}
.demo-pager a{padding:7px 10px;border:1px solid #e5ece7;border-radius:8px;text-decoration:none;color:#5e6f64;background:#fff}
.demo-pager a.current{background:#16864b;color:white;border-color:#16864b}
.demo-note{display:flex;gap:10px;background:#fffaf0;border:1px solid #f0e4c9;border-radius:12px;padding:14px;color:#796b4f;font-size:11px;line-height:1.65}
@media(max-width:760px){.demo-wrap{padding:20px 13px 34px}.demo-stats{grid-template-columns:1fr 1fr}.demo-stat:last-child{grid-column:1/-1}.demo-head h1{font-size:24px}.demo-panel{padding:13px}.demo-table{min-width:850px}.demo-table-scroll{overflow:auto}}
`;
export default async function DemoDataPage({searchParams}:{searchParams:Params}){
  if (process.env.VERCEL_ENV === "preview") return <PreviewModule module="demo-data" />;
  const params=await searchParams;
  const type=params.type==="members"?"members":"stores";
  if(process.env.VERCEL_ENV==="preview") return <DemoWorkspace module={type==="members"?"customers":"stores"}/>;
  const page=Math.max(1,Math.min(type==="stores"?5:50,Number(params.page)||1));
  const supabase=await createClient();
  const isPreviewDemo=process.env.VERCEL_ENV==="preview";
  if(!supabase && !isPreviewDemo) return <main className="demo-wrap">Chưa kết nối dữ liệu.</main>;
  if(!isPreviewDemo && supabase) {
    const {data:{user}}=await supabase.auth.getUser();
    if(!user) redirect("/admin/login");
    const [{data:profile},{data:grants}]=await Promise.all([
      supabase.from("profiles").select("status").eq("id",user.id).maybeSingle(),
      supabase.from("user_role_grants").select("roles(code)").eq("user_id",user.id).is("revoked_at",null)
    ]);
    const roleCodes=(grants??[]).map(g=>g.roles?.code).filter(Boolean);
    if(profile?.status!=="active"||!roleCodes.some(code=>["platform_owner","platform_admin","ops_manager","ops_agent"].includes(code))) return <main className="demo-wrap">Không có quyền truy cập khu vực DEMO.</main>;
  }
  const source=type==="stores"?stores:members;
  const rows=source.slice((page-1)*20,page*20);
  const pages=type==="stores"?5:50;
  return <main className="demo-wrap"><style>{styles}</style><div className="demo-inner">
    <div className="demo-head"><div><p className="demo-kicker">SANDBOX DATA LAB</p><h1>Dữ liệu giả lập</h1><p>Không ghi vào database · Không tạo tài khoản đăng nhập · Có thể tạo lại bất cứ lúc nào.</p></div><span className="demo-badge"><Sparkles size={14}/> DEMO ONLY</span></div>
    <div className="demo-stats">
      <div className="demo-stat"><span><Store size={16}/> Cửa hàng giả lập</span><strong>100</strong><small>8 nhóm ngành · 7 khu vực Đà Nẵng</small></div>
      <div className="demo-stat"><span><Users size={16}/> Khách hàng giả lập</span><strong>1.000</strong><small>Mã thành viên, điểm mẫu, trạng thái</small></div>
      <div className="demo-stat"><span><RotateCcw size={16}/> Cách reset</span><strong>1 chạm</strong><small>Dữ liệu sinh tự động từ bộ quy tắc cố định</small></div>
    </div>
    <div className="demo-head"><nav className="demo-tabs"><Link className={type==="stores"?"active":""} href="/admin/demo-data?type=stores">100 cửa hàng</Link><Link className={type==="members"?"active":""} href="/admin/demo-data?type=members">1.000 khách hàng</Link></nav><span className="demo-badge">Dữ liệu minh họa, không phải hồ sơ thật</span></div>
    <section className="demo-panel"><div className="demo-table-head"><div><b>{type==="stores"?"Danh sách cửa hàng mẫu":"Danh sách khách hàng mẫu"}</b><br/><small>Trang {page}/{pages} · Hiển thị {rows.length} trên {source.length} bản ghi</small></div><small>Đà Nẵng · DEMO-2026</small></div>
      <div className="demo-table-scroll"><table className="demo-table"><thead><tr>{(type==="stores"?["Cửa hàng","Mã cửa hàng","Ngành hàng","Khu vực","Địa chỉ","Đánh giá","Trạng thái"]:["Khách hàng","Mã thành viên","Điện thoại mẫu","Khu vực","Điểm minh họa","Đơn hàng mẫu","Trạng thái"]).map(x=><th key={x}>{x}</th>)}</tr></thead>
      <tbody>{type==="stores"?rows.map((raw)=>{const r=raw as typeof stores[number];return <tr key={r.id}><td><div className="demo-identity"><span className="demo-avatar" style={{background:r.color}}>{r.icon}</span><span><b>{r.name}</b><small>Tham gia {r.joined}</small></span></div></td><td>{r.code}</td><td>{r.category}</td><td><span style={{display:"inline-flex",alignItems:"center",gap:4}}><MapPin size={12}/>{r.area}</span></td><td>{r.address}</td><td>★ {r.rating}</td><td><span className={`demo-status ${r.status==="Chờ duyệt"?"wait":r.status==="Tạm ngưng"?"off":""}`}>{r.status}</span></td></tr>}):rows.map((raw)=>{const r=raw as typeof members[number];return <tr key={r.id}><td><div className="demo-identity"><span className="demo-avatar" style={{background:["#4b8d6b","#6685b5","#b47b59","#9278aa"][r.id%4]}}>{r.name.split(" ").slice(-2).map(x=>x[0]).join("")}</span><span><b>{r.name}</b><small>Tham gia {r.joined}</small></span></div></td><td>{r.code}</td><td>{r.phone}</td><td>{r.area}</td><td>{r.points.toLocaleString("vi-VN")} điểm</td><td>{r.orders}</td><td><span className={`demo-status ${r.status==="Chưa xác minh"?"wait":r.status==="Tạm khóa"?"off":""}`}>{r.status}</span></td></tr>})}</tbody></table></div>
      <div className="demo-pager"><span>Trang {page} / {pages}</span><nav>{page>1&&<Link href={`/admin/demo-data?type=${type}&page=${page-1}`}>← Trước</Link>}{Array.from({length:Math.min(5,pages)},(_,i)=>Math.max(1,Math.min(pages-4,page-2))+i).map(n=><Link key={n} className={n===page?"current":""} href={`/admin/demo-data?type=${type}&page=${n}`}>{n}</Link>)}{page<pages&&<Link href={`/admin/demo-data?type=${type}&page=${page+1}`}>Tiếp →</Link>}</nav></div>
    </section>
    <div className="demo-note"><BadgeCheck size={17}/><span><b>Ranh giới dữ liệu:</b> Các hồ sơ trên được tạo trực tiếp từ dữ liệu mẫu cố định trong mã nguồn. Chúng không được insert vào Supabase, không ảnh hưởng KPI thật, ví, điểm thưởng, công nợ hay báo cáo tài chính. Số điện thoại là dữ liệu giả định và không dùng để liên hệ.</span></div>
  </div></main>;
}
