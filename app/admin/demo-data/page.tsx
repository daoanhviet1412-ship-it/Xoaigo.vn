"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Download, RefreshCw, Store, Users, ShoppingBag, Coins, AlertTriangle } from "lucide-react";

type Merchant = { id:string; name:string; category:string; district:string; openingXg:number; balanceXg:number; transactions:number };
type Customer = { id:string; name:string; code:string; earnedXg:number; transactions:number };
type Tx = { id:string; merchantId:string; customerId:string; amountVnd:number; pointsXg:number; customerXg:number; xoaiXg:number; status:string; createdAt:string };
type Demo = { version:number; generatedAt:string; merchants:Merchant[]; customers:Customer[]; transactions:Tx[] };
const KEY="xoai-go-demo-ledger-v1";
const fmt=(n:number)=>new Intl.NumberFormat("vi-VN").format(n);
const categories=[
  {name:"Quán ăn",items:["Bếp Nhà","Cơm Niêu","Mì Quảng","Bún Chả Cá","Phở","Bánh Xèo","Cơm Gà","Món Huế","Lẩu","Hải Sản"]},
  {name:"Quán nhậu",items:["Lẩu Bò","Hải Sản Tươi","Ốc Đêm","Bia Hơi","Nướng Than","Quán Nhậu","Gỏi Cá","BBQ","Bê Thui","Lẩu Hải Sản"]},
  {name:"Cà phê",items:["The Coffee","Cà Phê Góc Phố","Roastery","Cà Phê Vườn","Slow Coffee","Cà Phê Muối","Rang Xay","Cà Phê Sân Vườn","Brew Lab","Cà Phê Sách"]},
  {name:"Trà sữa",items:["Trà Sữa Nhà","Tea House","Trà Trái Cây","Milk Tea","Trà Sữa Xoài","Trà Đài Loan","Matcha","Trà Sữa Phố","Tea Lab","Trà Sữa 1988"]},
  {name:"Ăn nhanh & khác",items:["Burger","Pizza","Gà Rán","Bánh Mì","Healthy Food"]}
];
const districts=["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Cẩm Lệ","Liên Chiểu"];
const first=["Minh Anh","Gia Hân","Hoàng Nam","Khánh Linh","Tuấn Kiệt","Bảo Ngọc","Đức Anh","Phương Thảo","Quốc Bảo","Hà My","Anh Khoa","Thùy Dương","Nhật Minh","Mai Chi","Thanh Tùng","Ngọc Hà","Đình Phúc","Yến Nhi","Hải Đăng","Kim Ngân"];
const last=["Nguyễn","Trần","Lê","Phạm","Hoàng","Võ","Đặng","Bùi","Đỗ","Phan"];
function makeDemo():Demo {
  const merchants:Merchant[]=[];
  categories.forEach((group,g)=>group.items.forEach((item,i)=>{
    const id="M"+String(merchants.length+1).padStart(3,"0");
    merchants.push({id,name:item+" "+(i+1),category:group.name,district:districts[(merchants.length*3+g)%districts.length],openingXg:200000,balanceXg:200000,transactions:0});
  }));
  const customers:Customer[]=Array.from({length:500},(_,i)=>({id:"C"+String(i+1).padStart(4,"0"),name:last[i%last.length]+" "+first[(i*7+i%13)%first.length],code:"XG"+String(i+1).padStart(6,"0"),earnedXg:0,transactions:0}));
  const transactions:Tx[]=customers.map((c,i)=>{
    const m=merchants[(i*17+Math.floor(i/7))%merchants.length];
    const pointsXg=10000, customerXg=7000, xoaiXg=3000;
    m.balanceXg-=pointsXg; m.transactions++; c.earnedXg+=customerXg; c.transactions++;
    const d=new Date(Date.now()-((499-i)%30)*86400000-((i*37)%720)*60000);
    return {id:"DEMO-"+String(i+1).padStart(6,"0"),merchantId:m.id,customerId:c.id,amountVnd:100000,pointsXg,customerXg,xoaiXg,status:"COMPLETED_DEMO",createdAt:d.toISOString()};
  });
  return {version:1,generatedAt:new Date().toISOString(),merchants,customers,transactions};
}
export default function DemoDataPage(){
 const [data,setData]=useState<Demo|null>(null),[tab,setTab]=useState<"summary"|"merchants"|"customers"|"transactions">("summary"),[page,setPage]=useState(0),[notice,setNotice]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setData(JSON.parse(raw) as Demo)}catch{setNotice("Không đọc được dữ liệu DEMO đã lưu.")}},[]);
 const seed=()=>{const next=makeDemo();localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event("xoai-demo-data-updated"));setData(next);setPage(0);setNotice("Đã tạo bộ dữ liệu DEMO trong trình duyệt này.")};
 const reset=()=>{localStorage.removeItem(KEY);window.dispatchEvent(new Event("xoai-demo-data-updated"));setData(null);setPage(0);setNotice("Đã xóa bộ dữ liệu DEMO khỏi trình duyệt này.")};
 const download=()=>{if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="xoai-go-demo-data.json";a.click();URL.revokeObjectURL(url)};
 const totals=useMemo(()=>{if(!data)return null;const revenue=data.transactions.reduce((s,t)=>s+t.amountVnd,0);const issued=data.merchants.reduce((s,m)=>s+m.openingXg,0)+data.transactions.reduce((s,t)=>s+t.pointsXg,0);const customer=data.transactions.reduce((s,t)=>s+t.customerXg,0);const app=data.transactions.reduce((s,t)=>s+t.xoaiXg,0);const merchantBalance=data.merchants.reduce((s,m)=>s+m.balanceXg,0);return {revenue,issued,unissued:1000000000-issued,customer,app,merchantBalance,initial:data.merchants.reduce((s,m)=>s+m.openingXg,0),points:data.transactions.reduce((s,t)=>s+t.pointsXg,0)}},[data]);
 const rows=data?(tab==="merchants"?data.merchants:tab==="customers"?data.customers:data.transactions):[];
 const pageSize=20,shown=rows.slice(page*pageSize,(page+1)*pageSize);
 return <main style={{padding:"28px clamp(16px,3vw,38px)",maxWidth:1500,margin:"0 auto",color:"#173d2b"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap",alignItems:"center"}}><div><p style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>SANDBOX / LOCAL BROWSER DATA</p><h1 style={{fontSize:30,margin:"7px 0"}}>Trung tâm dữ liệu DEMO</h1><p style={{color:"#718176",margin:0}}>50 cửa hàng · 500 khách hàng · 500 giao dịch mô phỏng</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={seed} style={btn}><RefreshCw size={15}/> {data?"Tạo lại dữ liệu":"Nạp dữ liệu DEMO"}</button><button disabled={!data} onClick={download} style={btnSecondary}><Download size={15}/> Xuất JSON</button><button disabled={!data} onClick={reset} style={btnDanger}>Xóa DEMO</button></div></div>
  <div style={{marginTop:18,padding:14,borderRadius:12,background:"#fff8e8",border:"1px solid #f0dfb6",color:"#795a20",display:"flex",gap:10,fontSize:13,lineHeight:1.6}}><AlertTriangle size={18} style={{flexShrink:0}}/><div><b>Chỉ là dữ liệu giả lập trên trình duyệt.</b> Không ghi Supabase, không tạo giao dịch thật, không ảnh hưởng Production. XG và VNĐ được lưu ở hai trường độc lập. Dữ liệu chỉ có trên trình duyệt và thiết bị đã nạp.</div></div>
  {notice&&<p style={{fontSize:13,color:"#16864b"}}>{notice}</p>}
  {!data||!totals?<section style={panel}><Database size={28}/><h2>Chưa có dữ liệu DEMO</h2><p style={{color:"#718176"}}>Nhấn “Nạp dữ liệu DEMO” để tạo dữ liệu mẫu nhất quán.</p></section>:<>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:18}}>
    <Card icon={<Store/>} label="Cửa hàng" value="50" note="Mỗi cửa hàng cấp ban đầu 200.000 XG"/>
    <Card icon={<Users/>} label="Khách hàng" value="500" note="Mã khách DEMO, không dùng PII thật"/>
    <Card icon={<ShoppingBag/>} label="Doanh thu giao dịch" value={fmt(totals.revenue)+" ₫"} note="500 × 100.000 VNĐ"/>
    <Card icon={<Coins/>} label="Điểm phát sinh" value={fmt(totals.points)+" XG"} note="10% doanh thu quy ước trong DEMO"/>
   </div>
   <section style={{...panel,marginTop:14}}><h2 style={{marginTop:0}}>Nguồn cung điểm XG</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:16}}>
    <Metric label="Tổng điểm tối đa" value="1.000.000.000 XG"/><Metric label="Đã phát hành" value={fmt(totals.issued)+" XG"}/><Metric label="Chưa phát hành" value={fmt(totals.unissued)+" XG"}/><Metric label="Điểm khởi tạo tại 50 quán" value={fmt(totals.initial)+" XG"}/>
   </div><div style={{height:12,background:"#edf2ee",borderRadius:99,overflow:"hidden",marginTop:16}}><div style={{height:"100%",width:(totals.issued/1000000000*100)+"%",background:"#159653"}}/></div><small style={{color:"#718176"}}>Đã phát hành / tổng điểm tối đa · tỷ lệ {(totals.issued/1000000000*100).toFixed(2)}%</small></section>
   <section style={{...panel,marginTop:14}}><h2 style={{marginTop:0}}>Phân bổ điểm từ giao dịch</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}><Metric label="Khách hàng · 70%" value={fmt(totals.customer)+" XG"}/><Metric label="Ví Xoài · 30%" value={fmt(totals.app)+" XG"}/><Metric label="Số dư điểm còn lại tại cửa hàng" value={fmt(totals.merchantBalance)+" XG"}/><Metric label="Tổng điểm quán cấp ban đầu" value={fmt(totals.initial)+" XG"}/></div><p style={{fontSize:12,color:"#718176",lineHeight:1.7,marginBottom:0}}>Mỗi giao dịch 100.000 VNĐ tạo 10.000 XG nghĩa vụ điểm: khách Pending 7.000 XG, Ví Xoài Pending 3.000 XG. Số dư quán bị trừ 10.000 XG. Earn Pending không tự động chuyển Available.</p></section>
   <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"18px 0"}}>{(["summary","merchants","customers","transactions"] as const).map(t=><button key={t} onClick={()=>{setTab(t);setPage(0)}} style={tab===t?btn:btnSecondary}>{({summary:"Tổng quan",merchants:"50 cửa hàng",customers:"500 khách hàng",transactions:"500 giao dịch"} as const)[t]}</button>)}</div>
   {tab!=="summary"&&<section style={{...panel,overflowX:"auto"}}><div style={{fontWeight:800,marginBottom:12}}>{({merchants:"Danh sách cửa hàng",customers:"Danh sách khách hàng",transactions:"Sổ giao dịch"} as const)[tab]}</div><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:760}}><thead><tr>{(tab==="merchants"?["Mã","Cửa hàng","Nhóm","Khu vực","Giao dịch","Số dư XG"]:tab==="customers"?["Mã","Khách hàng DEMO","Số giao dịch","Điểm Pending XG"]:["Mã giao dịch","Mã cửa hàng","Mã khách","Doanh thu VNĐ","Tổng điểm XG","Khách 70% XG","Xoài 30% XG","Trạng thái"]).map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>{shown.map((row)=>{const r=row as unknown as Record<string,string|number>;return <tr key={String(r.id)} style={{borderTop:"1px solid #edf2ee"}}>{tab==="merchants"?<><td style={td}>{r.id}</td><td style={td}>{r.name}</td><td style={td}>{r.category}</td><td style={td}>{r.district}</td><td style={td}>{r.transactions}</td><td style={td}>{fmt(Number(r.balanceXg))}</td></>:tab==="customers"?<><td style={td}>{r.id}</td><td style={td}>{r.name}</td><td style={td}>{r.transactions}</td><td style={td}>{fmt(Number(r.earnedXg))}</td></>:<><td style={td}>{r.id}</td><td style={td}>{r.merchantId}</td><td style={td}>{r.customerId}</td><td style={td}>{fmt(Number(r.amountVnd))}</td><td style={td}>{fmt(Number(r.pointsXg))}</td><td style={td}>{fmt(Number(r.customerXg))}</td><td style={td}>{fmt(Number(r.xoaiXg))}</td><td style={td}>{r.status}</td></>}</tr>})}</tbody></table><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,fontSize:13}}><span>{fmt(rows.length)} bản ghi</span><div style={{display:"flex",gap:8}}><button style={btnSecondary} disabled={page===0} onClick={()=>setPage(p=>p-1)}>Trước</button><span style={{padding:9}}>{page+1}/{Math.max(1,Math.ceil(rows.length/pageSize))}</span><button style={btnSecondary} disabled={(page+1)*pageSize>=rows.length} onClick={()=>setPage(p=>p+1)}>Sau</button></div></div></section>}
  </>}
 </main>;
}
const panel:React.CSSProperties={background:"#fff",border:"1px solid #e0eae3",borderRadius:16,padding:20};
const btn:React.CSSProperties={display:"inline-flex",alignItems:"center",gap:7,border:0,borderRadius:10,padding:"10px 14px",background:"#13864b",color:"#fff",fontWeight:700,cursor:"pointer"};
const btnSecondary:React.CSSProperties={...btn,background:"#edf5ef",color:"#17633a"};
const btnDanger:React.CSSProperties={...btn,background:"#fff0ef",color:"#b42318"};
const th:React.CSSProperties={textAlign:"left",padding:12,color:"#718176",whiteSpace:"nowrap"};
const td:React.CSSProperties={padding:12,whiteSpace:"nowrap"};
function Card({icon,label,value,note}:{icon:React.ReactNode;label:string;value:string;note:string}){return <div style={{...panel,padding:16}}><div style={{display:"flex",justifyContent:"space-between",color:"#16864b"}}>{label}{icon}</div><b style={{display:"block",fontSize:22,margin:"10px 0 5px"}}>{value}</b><small style={{color:"#718176"}}>{note}</small></div>}
function Metric({label,value}:{label:string;value:string}){return <div><small style={{color:"#718176"}}>{label}</small><b style={{display:"block",fontSize:19,marginTop:6}}>{value}</b></div>}
