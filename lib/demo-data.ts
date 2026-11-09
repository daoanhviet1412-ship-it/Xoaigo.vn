// Deterministic, read-only Preview fixtures. Never used by production.
export const demoCustomers = [
  {id:"XO-MB-000001",name:"Nguyễn Minh Anh",phone:"0900 000 101",area:"Hải Châu",points:2450,available:2150,pending:300,spent:4280000,orders:12,status:"Hoạt động"},
  {id:"XO-MB-000002",name:"Trần Hoàng Nam",phone:"0900 000 102",area:"Sơn Trà",points:1820,available:1620,pending:200,spent:3150000,orders:8,status:"Hoạt động"},
  {id:"XO-MB-000003",name:"Lê Ngọc Hương",phone:"0900 000 103",area:"Thanh Khê",points:980,available:980,pending:0,spent:1760000,orders:6,status:"Hoạt động"},
  {id:"XO-MB-000004",name:"Phạm Gia Linh",phone:"0900 000 104",area:"Ngũ Hành Sơn",points:3100,available:2700,pending:400,spent:6920000,orders:19,status:"Hoạt động"},
  {id:"XO-MB-000005",name:"Võ Quốc Duy",phone:"0900 000 105",area:"Cẩm Lệ",points:650,available:650,pending:0,spent:890000,orders:3,status:"Hoạt động"},
];
export const demoStores = [
  {id:"XO-MER-0001",name:"Mộc Xanh Coffee",category:"Cà phê",area:"Hải Châu",status:"Đang hoạt động"},
  {id:"XO-MER-0002",name:"Tiệm Trà Mây",category:"Trà sữa",area:"Sơn Trà",status:"Đang hoạt động"},
  {id:"XO-MER-0003",name:"Bếp Nhà Nhiên",category:"Nhà hàng",area:"Ngũ Hành Sơn",status:"Chờ duyệt"},
  {id:"XO-MER-0004",name:"Góc Phố Nhỏ",category:"Quán ăn",area:"Thanh Khê",status:"Đang hoạt động"},
  {id:"XO-MER-0005",name:"Nắng Garden",category:"Đồ uống",area:"Cẩm Lệ",status:"Tạm ngưng"},
];
const orderSeeds = [
  [0,0,185000,14800,"Đã hoàn tất"],[1,1,225000,18000,"Đã hoàn tất"],[2,3,96000,7680,"Đã hoàn tất"],
  [3,2,420000,33600,"Đã hoàn tất"],[4,4,135000,10800,"Đã hoàn tất"],[0,0,92000,7360,"Đã hoàn tất"],
  [1,3,178000,14240,"Đã hoàn tất"],[2,1,156000,12480,"Đang xử lý"],[3,0,285000,22800,"Đã hoàn tất"],
  [0,2,315000,25200,"Đã hoàn tất"],[1,4,88000,7040,"Đã hoàn tất"],[3,1,195000,15600,"Chờ xác nhận"],
] as const;
export const demoOrders = orderSeeds.map((s,i)=>({id:`XO-ORD-2026-${String(i+1).padStart(4,"0")}`,customer:demoCustomers[s[0]].name,customerId:demoCustomers[s[0]].id,store:demoStores[s[1]].name,storeId:demoStores[s[1]].id,amount:s[2],points:s[3],status:s[4],date:new Date(Date.UTC(2026,10,Math.max(1,9-i),10+(i%8),15)).toISOString()}));
export const demoPointEvents = demoOrders.filter(o=>o.status==="Đã hoàn tất").map((o,i)=>({id:`PT-${String(i+1).padStart(4,"0")}`,customer:o.customer,customerId:o.customerId,order:o.id,kind:i%3===0?"Cộng điểm":"Sử dụng điểm",points:i%3===0?Math.round(o.amount*0.08):Math.round(o.points/2),state:i%4===0?"Pending":"Available",date:o.date}));
export const demoWalletEvents = [
  {id:"WL-0001",owner:"Nguyễn Minh Anh",type:"Điểm thưởng",amount:300,bucket:"Pending",source:"XO-ORD-2026-0001"},
  {id:"WL-0002",owner:"Nguyễn Minh Anh",type:"Sử dụng điểm",amount:-150,bucket:"Available",source:"XO-ORD-2026-0006"},
  {id:"WL-0003",owner:"Trần Hoàng Nam",type:"Điểm thưởng",amount:200,bucket:"Pending",source:"XO-ORD-2026-0002"},
  {id:"WL-0004",owner:"Phạm Gia Linh",type:"Điểm thưởng",amount:400,bucket:"Available",source:"XO-ORD-2026-0004"},
  {id:"WL-0005",owner:"Lê Ngọc Hương",type:"Sử dụng điểm",amount:-100,bucket:"Available",source:"XO-ORD-2026-0003"},
];
export const demoLedger = demoOrders.filter(o=>o.status==="Đã hoàn tất").map((o,i)=>({id:`JE-DEMO-${String(i+1).padStart(4,"0")}`,description:`Giao dịch minh họa ${o.id}`,source:o.id,status:"Mô phỏng",debit:o.amount,credit:o.amount,date:o.date}));
export const demoReconciliation = [
  {id:"REC-DEMO-001",source:"Đơn hàng nội bộ",period:"01–07/11/2026",items:42,matched:40,difference:2,status:"Cần kiểm tra"},
  {id:"REC-DEMO-002",source:"Báo cáo cửa hàng",period:"08/11/2026",items:18,matched:18,difference:0,status:"Khớp dữ liệu"},
  {id:"REC-DEMO-003",source:"Điểm thành viên",period:"01–08/11/2026",items:27,matched:25,difference:2,status:"Cần kiểm tra"},
];
export const demoSettlements = [
  {id:"SET-DEMO-001",store:"Mộc Xanh Coffee",gross:1850000,fees:74000,net:1776000,status:"Chờ đối soát"},
  {id:"SET-DEMO-002",store:"Tiệm Trà Mây",gross:2340000,fees:93600,net:2246400,status:"Đang rà soát"},
  {id:"SET-DEMO-003",store:"Góc Phố Nhỏ",gross:1280000,fees:51200,net:1228800,status:"Mô phỏng"},
];
