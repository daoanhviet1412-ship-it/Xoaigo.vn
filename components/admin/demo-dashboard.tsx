"use client";

import Link from "next/link";

const shops = [
  ["Mộc Xanh Coffee","Cà phê","Hải Châu","Đang hoạt động"],
  ["Tiệm Trà Mây","Trà sữa","Sơn Trà","Đang hoạt động"],
  ["Bếp Nhà Nhiên","Nhà hàng","Ngũ Hành Sơn","Chờ duyệt"],
  ["Góc Phố Nhỏ","Quán ăn","Thanh Khê","Đang hoạt động"],
  ["Nắng Garden","Đồ uống","Cẩm Lệ","Tạm ngưng"],
];
const members = [
  ["Nguyễn Minh Anh","XO-MB-0001","2.450","12"],
  ["Trần Hoàng Nam","XO-MB-0002","1.820","8"],
  ["Lê Ngọc Hương","XO-MB-0003","980","6"],
  ["Phạm Gia Linh","XO-MB-0004","3.100","19"],
  ["Võ Quốc Duy","XO-MB-0005","650","3"],
];
const money = (n:number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";

export function DemoDashboard() {
  const kpis = [
    ["GMV minh họa", money(128450000), "+12,8% so với kỳ trước"],
    ["Cửa hàng", "100", "86 hoạt động · 8 ngành hàng"],
    ["Thành viên", "1.000", "+124 trong tháng"],
    ["Đơn hàng mẫu", "2.486", "94 đang xử lý"],
  ];
  return <main style={{padding:"28px clamp(16px,3vw,36px)",maxWidth:1500,margin:"0 auto",color:"#173d2b"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
      <div><div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#16864b"}}>OPERATIONS COMMAND CENTER</div><h1 style={{fontSize:30,margin:"8px 0"}}>Tổng quan hoạt động</h1><p style={{color:"#728078",margin:0}}>Dữ liệu mô phỏng để xem bố cục và luồng quản trị.</p></div>
      <span style={{background:"#fff3d9",color:"#936313",padding:"8px 12px",borderRadius:20,fontSize:11,fontWeight:800}}>✦ PREVIEW · DEMO DATA</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginTop:24}}>
      {kpis.map(([label,value,hint])=><div key={label} style={{background:"#fff",border:"1px solid #e6ede8",borderRadius:16,padding:20}}><div style={{fontSize:12,color:"#728078"}}>{label}</div><strong style={{display:"block",fontSize:26,margin:"10px 0 5px"}}>{value}</strong><small style={{color:"#87948c"}}>{hint}</small></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.5fr) minmax(280px,1fr)",gap:16,marginTop:18}}>
      <section style={{background:"#fff",border:"1px solid #e6ede8",borderRadius:16,padding:20}}>
        <h2 style={{fontSize:17,margin:"0 0 8px"}}>Xu hướng GMV <small style={{fontSize:10,color:"#a36d19"}}>DEMO</small></h2><p style={{fontSize:12,color:"#87948c"}}>Giá trị giao dịch mô phỏng trong 7 ngày</p>
        <div style={{height:180,display:"flex",alignItems:"end",gap:10,padding:"12px 4px 0",borderBottom:"1px solid #edf2ee"}}>{[42,58,48,76,63,88,70].map((v,i)=><div key={i} style={{flex:1,background:"linear-gradient(180deg,#39ae70,#dff2e5)",height:v+"%",borderRadius:"7px 7px 0 0",position:"relative"}}><small style={{position:"absolute",bottom:-22,left:"50%",transform:"translateX(-50%)",color:"#87948c"}}>{["T2","T3","T4","T5","T6","T7","CN"][i]}</small></div>)}</div>
        <div style={{marginTop:30,fontSize:12,color:"#728078"}}>Tổng GMV minh họa: <b style={{color:"#173d2b"}}>{money(128450000)}</b></div>
      </section>
      <section style={{background:"#fff",border:"1px solid #e6ede8",borderRadius:16,padding:20}}>
        <h2 style={{fontSize:17,margin:"0 0 14px"}}>Việc cần xử lý <small style={{fontSize:10,color:"#a36d19"}}>DEMO</small></h2>
        {[["Yêu cầu chờ duyệt","12"],["Đơn đang xử lý","94"],["Đối soát cần xem","3"],["Cửa hàng cần bổ sung hồ sơ","7"]].map(([a,b])=><div key={a} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderBottom:"1px solid #edf2ee",fontSize:13}}><span>{a}</span><b>{b}</b></div>)}
      </section>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:18}}>
      <section style={{background:"#fff",border:"1px solid #e6ede8",borderRadius:16,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:17}}>Cửa hàng gần đây</h2><Link href="/admin/demo-data?type=stores" style={{fontSize:12,color:"#16864b"}}>Xem dữ liệu DEMO →</Link></div>
        {shops.map(s=><div key={s[0]} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"12px 0",borderTop:"1px solid #edf2ee",fontSize:12}}><span><b>{s[0]}</b><small style={{display:"block",color:"#87948c",marginTop:4}}>{s[1]} · {s[2]}</small></span><span style={{color:s[3]==="Đang hoạt động"?"#16864b":"#a36d19"}}>{s[3]}</span></div>)}
      </section>
      <section style={{background:"#fff",border:"1px solid #e6ede8",borderRadius:16,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:17}}>Thành viên mới</h2><Link href="/admin/demo-data?type=members" style={{fontSize:12,color:"#16864b"}}>Xem dữ liệu DEMO →</Link></div>
        {members.map(m=><div key={m[1]} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"12px 0",borderTop:"1px solid #edf2ee",fontSize:12}}><span><b>{m[0]}</b><small style={{display:"block",color:"#87948c",marginTop:4}}>{m[1]}</small></span><span>{m[2]} điểm</span></div>)}
      </section>
    </div>
    <section style={{marginTop:18,background:"#fffaf0",border:"1px solid #f0e4c9",borderRadius:14,padding:16,fontSize:12,color:"#796b4f",lineHeight:1.7}}><b>Chú ý dữ liệu:</b> Tất cả số liệu trên là dữ liệu giả lập cố định trong mã nguồn Preview. Không lấy từ Supabase, không phải số liệu kinh doanh thật, không tạo giao dịch, không ghi ví/điểm và không ảnh hưởng production.</section>
  </main>;
}
