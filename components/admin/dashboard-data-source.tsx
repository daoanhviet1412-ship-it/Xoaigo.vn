"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Activity, Coins, ShoppingBag, Store, Users, RefreshCw, ArrowRight } from "lucide-react";

type Merchant={id:string;name:string;category:string;district:string;openingXg:number;balanceXg:number;transactions:number};
type Customer={id:string;name:string;code:string;earnedXg:number;transactions:number};
type Tx={id:string;merchantId:string;customerId:string;amountVnd:number;pointsXg:number;customerXg:number;xoaiXg:number;status:string;createdAt:string};
type Demo={version:number;generatedAt:string;merchants:Merchant[];customers:Customer[];transactions:Tx[]};
const KEY="xoai-go-demo-ledger-v1";
const fmt=(n:number)=>new Intl.NumberFormat("vi-VN").format(n);
export default function DashboardDataSource({live}:{live:ReactNode}){
 const [demo,setDemo]=useState<Demo|null>(null);
 useEffect(()=>{const read=()=>{try{const raw=localStorage.getItem(KEY);setDemo(raw?JSON.parse(raw) as Demo:null)}catch{setDemo(null)}};read();window.addEventListener("storage",read);window.addEventListener("xoai-demo-data-updated",read);return()=>{window.removeEventListener("storage",read);window.removeEventListener("xoai-demo-data-updated",read)}},[]);
 const totals=useMemo(()=>{if(!demo)return null;return {gmv:demo.transactions.reduce((s,t)=>s+t.amountVnd,0),points:demo.transactions.reduce((s,t)=>s+t.pointsXg,0),customer:demo.transactions.reduce((s,t)=>s+t.customerXg,0),app:demo.transactions.reduce((s,t)=>s+t.xoaiXg,0),merchant:demo.merchants.reduce((s,m)=>s+m.balanceXg,0),issued:demo.merchants.reduce((s,m)=>s+m.openingXg,0)}},[demo]);
 if(!demo||!totals)return <>{live}</>;
 return <main className="xoai-page"><div className="xoai-page-inner">
  <div className="xoai-page-heading"><div><p className="xoai-eyebrow">OPERATIONS COMMAND CENTER · DEMO</p><h1>Tổng quan hoạt động</h1><p>Toàn bộ chỉ số bên dưới lấy từ cùng bộ dữ liệu DEMO đang lưu trong trình duyệt.</p></div><a href="/admin/demo-data" className="xoai-demo-action"><RefreshCw size={15}/> Quản lý dữ liệu DEMO</a></div>
  <div className="xoai-demo-banner"><b>ĐANG XEM DỮ LIỆU DEMO</b><span>Không phải dữ liệu thật · Không ghi Supabase · Không ảnh hưởng Production</span></div>
  <section className="xoai-kpi-grid">
   {[{label:"GMV mô phỏng",value:fmt(totals.gmv)+" ₫",hint:"Tổng giá trị đơn hàng DEMO",icon:Activity},{label:"Giao dịch",value:fmt(demo.transactions.length),hint:"Giao dịch mô phỏng",icon:ShoppingBag},{label:"Cửa hàng",value:fmt(demo.merchants.length),hint:"Cửa hàng mẫu",icon:Store},{label:"Thành viên",value:fmt(demo.customers.length),hint:"Khách hàng mẫu",icon:Users},{label:"Điểm phân bổ qua giao dịch",value:fmt(totals.points)+" XG",hint:"Chuyển từ nguồn điểm cửa hàng",icon:Coins},{label:"Phân bổ khách hàng",value:fmt(totals.customer)+" XG",hint:"70% tổng điểm Earn",icon:Users}] .map((x)=><article className="xoai-stat-card tone-green" key={x.label}><div className="xoai-stat-top"><span>{x.label}</span><i><x.icon size={18}/></i></div><strong>{x.value}</strong><small>{x.hint}</small></article>)}
  </section>
  <section className="xoai-dashboard-grid"><article className="xoai-panel"><div className="xoai-section-title"><div><h2>Phân bổ điểm Earn</h2><p>Theo chính sách DEMO 70/30</p></div></div><div className="xoai-finance-list"><div><span>Tổng điểm cửa hàng đã tạo</span><b>{fmt(totals.issued)} XG</b></div><div><span>Cửa hàng còn giữ</span><b>{fmt(totals.merchant)} XG</b></div><div><span>Customer Wallet · 70% phần đã phân bổ</span><b>{fmt(totals.customer)} XG</b></div><div><span>App Wallet · 30% phần đã phân bổ</span><b>{fmt(totals.app)} XG</b></div></div><p style={{fontSize:12,color:"#718176",lineHeight:1.6}}>Điểm khách + điểm Xoài được phân bổ từ nguồn điểm cửa hàng, không cộng thêm vào tổng phát hành. Đối chiếu: {fmt(totals.merchant)} + {fmt(totals.customer)} + {fmt(totals.app)} = {fmt(totals.issued)} XG. Bộ DEMO hiện chưa mô phỏng đầy đủ Redeem, ví Pending/Available/Held hoặc quy trình duyệt thủ công.</p></article>
   <article className="xoai-panel"><div className="xoai-section-title"><div><h2>Quy mô dữ liệu</h2><p>Cùng nguồn dữ liệu với trang Dữ liệu DEMO</p></div></div><div className="xoai-growth-grid"><div><span>Cửa hàng</span><strong>{fmt(demo.merchants.length)}</strong></div><div><span>Khách hàng</span><strong>{fmt(demo.customers.length)}</strong></div><div><span>Giao dịch</span><strong>{fmt(demo.transactions.length)}</strong></div><div><span>Điểm App · 30%</span><strong>{fmt(totals.app)} XG</strong></div></div><a href="/admin/demo-data" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:18,color:"#13864b",fontWeight:700,fontSize:13}}>Mở sổ dữ liệu DEMO <ArrowRight size={15}/></a></article>
  </section>
  <footer className="xoai-dashboard-footer"><span><span className="xoai-status-dot"/> Nguồn dữ liệu: localStorage · xoai-go-demo-ledger-v1</span><span>Khởi tạo {new Date(demo.generatedAt).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}</span></footer>
 </div></main>;
}
