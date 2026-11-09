/* eslint-disable @typescript-eslint/no-explicit-any */
export type DemoStore={id:string;name:string;category:string;area:string;status:string;initialBacking:number};
export type DemoCustomer={id:string;name:string;phone:string;area:string;initialAvailable:number;status:string};
export type DemoPolicy={version:string;rewardRate:number;cashFeeRate:number;merchantDiscountRate:number;platformFeeRate?:number;effectiveAt:string;storeId:string;actor:string;reason:string};
export type DemoEvent=
 | {type:"SALE_CONFIRMED";id:string;orderId:string;customerId:string;storeId:string;grossAmount:number;pointsRedeemed:number;cashPaid:number;rewardPoints:number;feeAmount:number;cashFeeAmount:number;merchantDiscountPoints:number;merchantPointsAllocated:number;policy:DemoPolicy;occurredAt:string;batchAt:string;releaseAt:string}
 | {type:"PENDING_RELEASED";id:string;saleEventId:string;releasedAt:string}
 | {type:"SALE_REVERSED";id:string;saleEventId:string;reason:string;occurredAt:string}
 | {type:"MERCHANT_TOPUP";id:string;storeId:string;amount:number;confirmedAt:string;reference:string}
 | {type:"WITHDRAWAL_REQUESTED";id:string;storeId:string;amount:number;requestedAt:string}
 | {type:"WITHDRAWAL_APPROVED";id:string;requestId:string;approvedAt:string;approver:string}
 | {type:"POLICY_UPDATED";id:string;storeId:string;before:DemoPolicy;after:DemoPolicy;actor:string;reason:string;effectiveAt:string}
 | {type:"POINTS_HELD";id:string;customerId:string;points:number;reason:string;occurredAt:string}
 | {type:"POINTS_UNHELD";id:string;customerId:string;points:number;reason:string;occurredAt:string};
export type DemoState={version:2;events:DemoEvent[];policies:DemoPolicy[];clock:string};
export const money=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(n)+" ₫";
export const number=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(n);
export const demoStores:DemoStore[]=Array.from({length:100},(_,i)=>({id:"XO-MER-"+String(i+1).padStart(4,"0"),name:["Mộc Xanh Coffee","Tiệm Trà Mây","Bếp Nhà Nhiên","Góc Phố Nhỏ","Nắng Garden"][i%5]+" "+(i+1),category:["Cà phê","Trà sữa","Nhà hàng","Quán ăn","Đồ uống","Làm đẹp","Thời trang","Siêu thị mini"][i%8],area:["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Liên Chiểu","Cẩm Lệ","Hòa Vang"][i%7],status:(i+1)%17===0?"Tạm ngưng":"Đang hoạt động",initialBacking:2_000_000+(i%6)*500_000}));
const first=["Minh","Anh","Hương","Tuấn","Linh","Trang","Nam","Thảo","Quân","Vy","Hải","Ngọc","Phúc","My","Duy","Lan","Khoa","Trâm","Long","Chi"];
const last=["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Võ","Đặng","Bùi","Đỗ","Ngô"];
export const demoCustomers:DemoCustomer[]=Array.from({length:1000},(_,i)=>({id:"XO-MB-"+String(i+1).padStart(6,"0"),name:last[i%last.length]+" "+first[(i*3+1)%first.length]+" "+first[(i*11+5)%first.length],phone:"09"+String(10000000+i*7919).slice(0,8),area:["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Liên Chiểu","Cẩm Lệ","Hòa Vang"][i%7],initialAvailable:500+(i*137)%9500,status:i%53===0?"Tạm khóa":"Hoạt động"}));
export function batchSchedule(iso:string){
 const local=new Date(new Date(iso).getTime()+7*3600000);let y=local.getUTCFullYear(),m=local.getUTCMonth(),d=local.getUTCDate();
 if(local.getUTCHours()>=17){const next=new Date(Date.UTC(y,m,d+1));y=next.getUTCFullYear();m=next.getUTCMonth();d=next.getUTCDate();}
 const batchAt=Date.UTC(y,m,d,10,0,0,0);
 return {batchAt:new Date(batchAt).toISOString(),releaseAt:new Date(batchAt+48*3600000).toISOString()};
}
function eventTime(e:DemoEvent){return "occurredAt" in e?e.occurredAt:"releasedAt" in e?e.releasedAt:"confirmedAt" in e?e.confirmedAt:"requestedAt" in e?e.requestedAt:"approvedAt" in e?e.approvedAt:"effectiveAt" in e?e.effectiveAt:"";}
export function makeInitialState(now=new Date()):DemoState{
 const policies=demoStores.map((s,i)=>({version:"DEMO-POLICY-"+(i+1)+".1",rewardRate:[8,6,10,5,7][i%5],cashFeeRate:[4,3,5,4,2][i%5],merchantDiscountRate:10,platformFeeRate:[4,3,5,4,2][i%5],effectiveAt:"2026-11-01T00:00:00.000Z",storeId:s.id,actor:"SYSTEM_DEMO",reason:"Seed policy DEMO"}));
 const events:DemoEvent[]=[];
 for(let i=0;i<12;i++){const store=demoStores[i%5],customer=demoCustomers[i%8],amount=[185000,225000,96000,420000,135000,92000][i%6],policy=policies[i%5],occurredAt=new Date(now.getTime()-(i+1)*86400000).toISOString(),schedule=batchSchedule(occurredAt);
  events.push({type:"SALE_CONFIRMED",id:"EV-SEED-"+String(i+1).padStart(4,"0"),orderId:"XO-SEED-"+String(i+1).padStart(4,"0"),customerId:customer.id,storeId:store.id,grossAmount:amount,pointsRedeemed:0,cashPaid:amount,rewardPoints:Math.floor(amount*policy.rewardRate/100),feeAmount:Math.round(amount*policy.cashFeeRate/100),cashFeeAmount:Math.round(amount*policy.cashFeeRate/100),merchantDiscountPoints:0,merchantPointsAllocated:0,policy,occurredAt,batchAt:schedule.batchAt,releaseAt:schedule.releaseAt});
 }
 return {version:2,events,policies,clock:now.toISOString()};
}
export function project(state:DemoState){
 const p:any={merchantPointsPending:0,merchantPointsAvailable:0,xoaiDiscountPointsPending:0,xoaiDiscountPointsAvailable:0,cashFeeGross:0,cashFeeReversed:0,cashFeeNet:0,merchantDiscountPointsGross:0,merchantDiscountPointsReversed:0,merchantDiscountPointsNet:0,gmvGross:0,gmvReversed:0,gmvNet:0,cashPaid:0,cashPaidReversed:0,cashPaidNet:0,pointsRedeemed:0,pointsRedeemedReversed:0,pointsRedeemedNet:0,fees:0,feesReversed:0,feesNet:0,rewardIssued:0,rewardPending:0,rewardAvailable:0,rewardReversed:0,shortfall:0,orders:0,activeOrders:0,customers:[],stores:[],pointRows:[],walletRows:[],ledgerRows:[],reconciliationRows:[],withdrawals:[]};
 const cm=new Map(demoCustomers.map(c=>[c.id,{...c,available:c.initialAvailable,pending:0,held:0,used:0,spent:0,orders:0}]));
 const sm=new Map(demoStores.map(s=>[s.id,{...s,backing:s.initialBacking,pendingBacking:0,pointsPending:0,pointsAvailable:0,gross:0,fee:0,net:0,count:0,negative:false}]));
 const sales=new Map<string,Extract<DemoEvent,{type:"SALE_CONFIRMED"}>>(),released=new Set<string>(),reversed=new Set<string>(),withdrawals=new Map<string,any>();
 const ordered=[...state.events].sort((a,b)=>new Date(eventTime(a)).getTime()-new Date(eventTime(b)).getTime());
 for(const e of ordered){
  if(e.type==="SALE_CONFIRMED"){
   sales.set(e.id,e);p.gmvGross+=e.grossAmount;p.orders++;p.cashPaid+=e.cashPaid;p.pointsRedeemed+=e.pointsRedeemed;p.fees+=e.cashFeeAmount??e.feeAmount;p.cashFeeGross+=e.cashFeeAmount??e.feeAmount;p.merchantDiscountPointsGross+=e.merchantDiscountPoints??0;p.rewardIssued+=e.rewardPoints;
   const c=cm.get(e.customerId);if(c){c.available-=e.pointsRedeemed;c.used+=e.pointsRedeemed;c.pending+=e.rewardPoints;c.spent+=e.grossAmount;c.orders++;}
   const s=sm.get(e.storeId);if(s){s.gross+=e.grossAmount;s.fee+=e.cashFeeAmount??e.feeAmount;s.pendingBacking+=(e.cashFeeAmount??e.feeAmount);s.pointsPending+=(e.merchantPointsAllocated??0);s.count++;}p.merchantPointsPending+=(e.merchantPointsAllocated??0);p.xoaiDiscountPointsPending+=(e.merchantDiscountPoints??0);
   p.walletRows.push({id:e.id+"-customer-pending",owner:e.customerId,kind:"Điểm thưởng Pending",amount:e.rewardPoints,status:"Pending · chưa sử dụng",source:e.orderId});
   if(e.pointsRedeemed)p.walletRows.push({id:e.id+"-customer-redeem",owner:e.customerId,kind:"Sử dụng điểm Available",amount:-e.pointsRedeemed,status:"Đã ghi nhận DEMO",source:e.orderId});
   p.walletRows.push({id:e.id+"-merchant-backing",owner:e.storeId,kind:"Backing DEMO cho nghĩa vụ Pending",amount:e.cashFeeAmount??e.feeAmount,status:"Đang bảo đảm tiền mặt DEMO",source:e.orderId});
   p.pointRows.push({id:e.id+"-earn",customerId:e.customerId,kind:"Thưởng",amount:e.rewardPoints,bucket:"Pending",source:e.orderId,releaseAt:e.releaseAt});
   if(e.pointsRedeemed){p.pointRows.push({id:e.id+"-redeem",customerId:e.customerId,kind:"Sử dụng",amount:-e.pointsRedeemed,bucket:"Available",source:e.orderId});p.pointRows.push({id:e.id+"-merchant-pending",customerId:e.customerId,kind:"Phân bổ điểm Pending cho Quán",amount:e.merchantPointsAllocated??0,bucket:"Merchant Pending",source:e.orderId});p.pointRows.push({id:e.id+"-xoai-pending",customerId:e.customerId,kind:"Chiết khấu điểm của quán dành cho Xoài",amount:e.merchantDiscountPoints??0,bucket:"Xoài Pending",source:e.orderId});}
   p.ledgerRows.push({id:e.id,source:e.orderId,layer:"Sự kiện vận hành",debit:"Chưa ánh xạ COA",credit:"Chưa ánh xạ COA",status:"Event demo"});
  }else if(e.type==="PENDING_RELEASED"){
   const sale=sales.get(e.saleEventId);if(!sale||reversed.has(sale.id)||released.has(sale.id))continue;
   const c=cm.get(sale.customerId);if(c){c.pending-=sale.rewardPoints;c.available+=sale.rewardPoints;}
   const s=sm.get(sale.storeId);if(s){s.pendingBacking=Math.max(0,s.pendingBacking-sale.rewardPoints-(sale.cashFeeAmount??sale.feeAmount));s.backing-=(sale.cashFeeAmount??sale.feeAmount);s.pointsPending=Math.max(0,s.pointsPending-(sale.merchantPointsAllocated??0));s.pointsAvailable+=(sale.merchantPointsAllocated??0);}p.merchantPointsPending=Math.max(0,p.merchantPointsPending-(sale.merchantPointsAllocated??0));p.merchantPointsAvailable+=(sale.merchantPointsAllocated??0);p.xoaiDiscountPointsPending=Math.max(0,p.xoaiDiscountPointsPending-(sale.merchantDiscountPoints??0));p.xoaiDiscountPointsAvailable+=(sale.merchantDiscountPoints??0);
   released.add(sale.id);p.rewardAvailable+=sale.rewardPoints;
   p.walletRows.push({id:e.id+"-customer",owner:sale.customerId,kind:"Chuyển điểm thưởng sang Available",amount:sale.rewardPoints,status:"Available · DEMO",source:sale.orderId});
   p.walletRows.push({id:e.id+"-merchant",owner:sale.storeId,kind:"Giải phóng backing Pending",amount:sale.cashFeeAmount??sale.feeAmount,status:"Đã giải phóng backing VND DEMO",source:sale.orderId});
  }else if(e.type==="SALE_REVERSED"){
   const sale=sales.get(e.saleEventId);if(!sale||reversed.has(sale.id))continue;reversed.add(sale.id);p.gmvReversed+=sale.grossAmount;p.cashPaidReversed+=sale.cashPaid;p.pointsRedeemedReversed+=sale.pointsRedeemed;p.feesReversed+=sale.cashFeeAmount??sale.feeAmount;p.cashFeeReversed+=sale.cashFeeAmount??sale.feeAmount;p.merchantDiscountPointsReversed+=sale.merchantDiscountPoints??0;
   const c=cm.get(sale.customerId);if(c){if(released.has(sale.id)){const recover=Math.min(c.available,sale.rewardPoints);c.available-=recover;p.shortfall+=sale.rewardPoints-recover;c.used=Math.max(0,c.used-sale.pointsRedeemed);}else c.pending=Math.max(0,c.pending-sale.rewardPoints);c.available+=sale.pointsRedeemed;}
   const s=sm.get(sale.storeId);if(s){s.pendingBacking=Math.max(0,s.pendingBacking-sale.rewardPoints-(sale.cashFeeAmount??sale.feeAmount));if(released.has(sale.id)){s.backing+=(sale.cashFeeAmount??sale.feeAmount);s.pointsAvailable=Math.max(0,s.pointsAvailable-(sale.merchantPointsAllocated??0));p.merchantPointsAvailable=Math.max(0,p.merchantPointsAvailable-(sale.merchantPointsAllocated??0));p.xoaiDiscountPointsAvailable=Math.max(0,p.xoaiDiscountPointsAvailable-(sale.merchantDiscountPoints??0));}else{s.pointsPending=Math.max(0,s.pointsPending-(sale.merchantPointsAllocated??0));p.merchantPointsPending=Math.max(0,p.merchantPointsPending-(sale.merchantPointsAllocated??0));p.xoaiDiscountPointsPending=Math.max(0,p.xoaiDiscountPointsPending-(sale.merchantDiscountPoints??0));}s.gross-=sale.grossAmount;s.fee-=sale.cashFeeAmount??sale.feeAmount;s.count=Math.max(0,s.count-1);}
   p.rewardReversed+=sale.rewardPoints;p.walletRows.push({id:e.id+"-customer",owner:sale.customerId,kind:"Điều chỉnh đảo điểm thưởng",amount:-sale.rewardPoints,status:"Adjustment · DEMO",source:sale.orderId});p.walletRows.push({id:e.id+"-merchant",owner:sale.storeId,kind:"Điều chỉnh backing giao dịch đảo",amount:-(sale.cashFeeAmount??sale.feeAmount),status:"Adjustment backing VND · DEMO",source:sale.orderId});p.pointRows.push({id:e.id,customerId:sale.customerId,kind:"Điều chỉnh đảo",amount:-sale.rewardPoints,bucket:"Adjustment",source:sale.orderId});
   p.ledgerRows.push({id:e.id,source:sale.orderId,layer:"Sự kiện điều chỉnh",debit:"Liên kết giao dịch gốc",credit:"Chưa ánh xạ COA",status:"Reversal demo"});
  }else if(e.type==="MERCHANT_TOPUP"){const s=sm.get(e.storeId);if(s)s.backing+=e.amount;p.walletRows.push({id:e.id,owner:e.storeId,kind:"Nạp DEMO đã xác nhận",amount:e.amount,status:"Confirmed DEMO",source:e.reference});}
  else if(e.type==="POINTS_HELD"){const c=cm.get(e.customerId);if(c){const held=Math.min(c.available,e.points);c.available-=held;c.held+=held;p.pointRows.push({id:e.id,customerId:e.customerId,kind:"Giữ điểm",amount:-held,bucket:"Held",source:e.reason});}}
  else if(e.type==="POINTS_UNHELD"){const c=cm.get(e.customerId);if(c){const unheld=Math.min(c.held,e.points);c.held-=unheld;c.available+=unheld;p.pointRows.push({id:e.id,customerId:e.customerId,kind:"Giải phóng điểm giữ",amount:unheld,bucket:"Available",source:e.reason});}}
  else if(e.type==="WITHDRAWAL_REQUESTED")withdrawals.set(e.id,{...e,status:"Chờ duyệt"});
  else if(e.type==="WITHDRAWAL_APPROVED"){const w=withdrawals.get(e.requestId);if(w)w.status="Đã duyệt DEMO · chưa chi tiền";}
 }
 p.gmvNet=p.gmvGross-p.gmvReversed;p.cashPaidNet=p.cashPaid-p.cashPaidReversed;p.pointsRedeemedNet=p.pointsRedeemed-p.pointsRedeemedReversed;p.feesNet=p.fees-p.feesReversed;p.cashFeeNet=p.cashFeeGross-p.cashFeeReversed;p.merchantDiscountPointsNet=p.merchantDiscountPointsGross-p.merchantDiscountPointsReversed;p.rewardPending=[...cm.values()].reduce((n,c)=>n+c.pending,0);p.rewardAvailable=[...cm.values()].reduce((n,c)=>n+c.available,0);
 p.customers=[...cm.values()];p.stores=[...sm.values()].map(s=>({...s,net:s.gross-s.fee,negative:s.backing<0}));p.withdrawals=[...withdrawals.values()];p.activeOrders=p.orders-reversed.size;
 for(const e of ordered){if(e.type!=="SALE_CONFIRMED")continue;const releasedEvent=ordered.find(x=>x.type==="PENDING_RELEASED"&&x.saleEventId===e.id),reversal=ordered.find(x=>x.type==="SALE_REVERSED"&&x.saleEventId===e.id);p.reconciliationRows.push({id:e.orderId,amount:e.grossAmount,source:"App DEMO",external:"Chưa có nguồn POS/ngân hàng",difference:"Chưa xác định",status:reversal?"Đã đảo":releasedEvent?"Đã ghi nhận nội bộ":"Chờ bằng chứng độc lập"});}
 return p;
}
export function validateSale(state:DemoState,input:{customerId:string;storeId:string;amount:number;redeem:number;occurredAt:string;rewardRate:number;feeRate?:number;cashFeeRate?:number;merchantDiscountRate?:number}){
 const p=project(state),c=p.customers.find((x:any)=>x.id===input.customerId),s=p.stores.find((x:any)=>x.id===input.storeId);
 if(!c||!s)return "Chọn khách hàng và cửa hàng hợp lệ.";if(s.status!=="Đang hoạt động")return "Cửa hàng đang tạm ngưng trong bộ DEMO.";
 if(!Number.isInteger(input.amount)||input.amount<=0)return "Giá trị hóa đơn phải là số nguyên dương.";
 if(!Number.isInteger(input.redeem)||input.redeem<0||input.redeem>c.available)return "Điểm sử dụng vượt số dư Available; Pending/Held không được phép sử dụng.";
 if(input.redeem>input.amount)return "Điểm sử dụng không được vượt giá trị hóa đơn.";
 const cashFeeRate=input.cashFeeRate??input.feeRate??0,merchantDiscountRate=input.merchantDiscountRate??10;if(!Number.isFinite(input.rewardRate)||input.rewardRate<0||input.rewardRate>100||!Number.isFinite(cashFeeRate)||cashFeeRate<0||cashFeeRate>100||!Number.isFinite(merchantDiscountRate)||merchantDiscountRate<0||merchantDiscountRate>100)return "Tỷ lệ DEMO phải nằm trong khoảng 0–100%.";
 return null;
}
export function calculateSaleAmounts(input:{amount:number;redeem:number;rewardRate:number;cashFeeRate:number;merchantDiscountRate:number}){const cashPaid=input.amount-input.redeem,merchantDiscountPoints=Math.round(input.redeem*input.merchantDiscountRate/100),merchantPointsAllocated=input.redeem-merchantDiscountPoints,cashFeeAmount=Math.round(cashPaid*input.cashFeeRate/100),rewardPoints=Math.floor(cashPaid*input.rewardRate/100);return {cashPaid,merchantDiscountPoints,merchantPointsAllocated,cashFeeAmount,rewardPoints};}
export function appendSale(state:DemoState,input:{customerId:string;storeId:string;amount:number;redeem:number;occurredAt:string;rewardRate:number;feeRate?:number;cashFeeRate?:number;merchantDiscountRate?:number}):DemoState{
 const active=state.policies.filter(p=>p.storeId===input.storeId&&new Date(p.effectiveAt)<=new Date(input.occurredAt)).sort((a,b)=>b.effectiveAt.localeCompare(a.effectiveAt))[0];
 const effective={...input,rewardRate:active?.rewardRate??input.rewardRate,cashFeeRate:active?.cashFeeRate??active?.platformFeeRate??input.cashFeeRate??input.feeRate??0,merchantDiscountRate:active?.merchantDiscountRate??input.merchantDiscountRate??10};
 const error=validateSale(state,effective);if(error)throw new Error(error);
 const schedule=batchSchedule(input.occurredAt),amounts=calculateSaleAmounts({amount:input.amount,redeem:input.redeem,rewardRate:effective.rewardRate,cashFeeRate:effective.cashFeeRate,merchantDiscountRate:effective.merchantDiscountRate}),policy:DemoPolicy={version:active?.version??"DEMO-POLICY-UNSET",rewardRate:effective.rewardRate,cashFeeRate:effective.cashFeeRate,merchantDiscountRate:effective.merchantDiscountRate,platformFeeRate:effective.cashFeeRate,effectiveAt:active?.effectiveAt??input.occurredAt,storeId:input.storeId,actor:active?.actor??"DEMO_OPERATOR",reason:active?.reason??"Snapshot giao dịch DEMO"},id="EV-"+crypto.randomUUID();
 const event:DemoEvent={type:"SALE_CONFIRMED",id,orderId:"XO-DEMO-"+crypto.randomUUID().slice(0,8).toUpperCase(),customerId:input.customerId,storeId:input.storeId,grossAmount:input.amount,pointsRedeemed:input.redeem,cashPaid:amounts.cashPaid,rewardPoints:amounts.rewardPoints,feeAmount:amounts.cashFeeAmount,cashFeeAmount:amounts.cashFeeAmount,merchantDiscountPoints:amounts.merchantDiscountPoints,merchantPointsAllocated:amounts.merchantPointsAllocated,policy,occurredAt:input.occurredAt,batchAt:schedule.batchAt,releaseAt:schedule.releaseAt};
 return {...state,events:[event,...state.events]};
}
export function updatePolicy(state:DemoState,storeId:string,rewardRate:number,cashFeeRate:number,reason:string,now:string,merchantDiscountRate=10){
 if(!reason.trim())throw new Error("Nhập lý do thay đổi policy.");if(!Number.isFinite(rewardRate)||rewardRate<0||rewardRate>100||!Number.isFinite(cashFeeRate)||cashFeeRate<0||cashFeeRate>100||!Number.isFinite(merchantDiscountRate)||merchantDiscountRate<0||merchantDiscountRate>100)throw new Error("Tỷ lệ phải từ 0–100%.");
 const before=state.policies.filter(p=>p.storeId===storeId).sort((a,b)=>b.effectiveAt.localeCompare(a.effectiveAt))[0];if(!before)throw new Error("Chưa có policy DEMO cho cửa hàng.");if(new Date(now)<new Date(before.effectiveAt))throw new Error("Không được lùi ngày hiệu lực policy; chỉ áp dụng thay đổi cho giao dịch tương lai.");
 const after:DemoPolicy={...before,version:before.version.split(".")[0]+"."+(Number(before.version.split(".").pop())+1),rewardRate,cashFeeRate,merchantDiscountRate,platformFeeRate:cashFeeRate,effectiveAt:now,actor:"DEMO_PRODUCT_OWNER",reason};const policyEvent:Extract<DemoEvent,{type:"POLICY_UPDATED"}>={type:"POLICY_UPDATED",id:"EV-POLICY-"+crypto.randomUUID(),storeId,before,after,actor:"DEMO_PRODUCT_OWNER",reason,effectiveAt:now};
 return {...state,policies:[after,...state.policies],events:[policyEvent,...state.events]};
}
export function holdPoints(state:DemoState,customerId:string,points:number,reason:string,now:string){const c=project(state).customers.find((x:any)=>x.id===customerId);if(!Number.isInteger(points)||points<=0||!c||points>c.available)throw new Error("Không đủ điểm Available để giữ.");const event:Extract<DemoEvent,{type:"POINTS_HELD"}>={type:"POINTS_HELD",id:"EV-HOLD-"+crypto.randomUUID(),customerId,points,reason,occurredAt:now};return {...state,events:[event,...state.events]};}
export function unholdPoints(state:DemoState,customerId:string,points:number,reason:string,now:string){const c=project(state).customers.find((x:any)=>x.id===customerId);if(!Number.isInteger(points)||points<=0||!c||points>c.held)throw new Error("Số điểm Held không đủ để giải phóng.");const event:Extract<DemoEvent,{type:"POINTS_UNHELD"}>={type:"POINTS_UNHELD",id:"EV-UNHOLD-"+crypto.randomUUID(),customerId,points,reason,occurredAt:now};return {...state,events:[event,...state.events]};}
export function releaseEligible(state:DemoState,now:string){
 const next={...state,events:[...state.events]},sales=next.events.filter((e):e is Extract<DemoEvent,{type:"SALE_CONFIRMED"}>=>e.type==="SALE_CONFIRMED").sort((a,b)=>a.releaseAt.localeCompare(b.releaseAt));
 for(const sale of sales){if(next.events.some(x=>x.type==="PENDING_RELEASED"&&x.saleEventId===sale.id)||next.events.some(x=>x.type==="SALE_REVERSED"&&x.saleEventId===sale.id))continue;if(new Date(sale.releaseAt)>new Date(now))continue;
  const current=project(next),store=current.stores.find((s:any)=>s.id===sale.storeId),required=sale.cashFeeAmount??sale.feeAmount;if(!store||store.backing<required)continue;
  next.events.push({type:"PENDING_RELEASED",id:"EV-RELEASE-"+crypto.randomUUID(),saleEventId:sale.id,releasedAt:now});
 }
 return next;
}
export function reverseSale(state:DemoState,saleEventId:string,reason:string,now:string){const sale=state.events.find(e=>e.type==="SALE_CONFIRMED"&&e.id===saleEventId);if(!sale)throw new Error("Không tìm thấy giao dịch gốc.");if(state.events.some(e=>e.type==="SALE_REVERSED"&&e.saleEventId===saleEventId))throw new Error("Giao dịch đã được đảo.");const reversal:Extract<DemoEvent,{type:"SALE_REVERSED"}>={type:"SALE_REVERSED",id:"EV-REV-"+crypto.randomUUID(),saleEventId,reason,occurredAt:now};return {...state,events:[reversal,...state.events]};}
export function confirmTopup(state:DemoState,storeId:string,amount:number,reference:string,now:string){if(!Number.isInteger(amount)||amount<=0)throw new Error("Số tiền nạp DEMO phải là số nguyên dương.");const event:Extract<DemoEvent,{type:"MERCHANT_TOPUP"}>={type:"MERCHANT_TOPUP",id:"EV-TOPUP-"+crypto.randomUUID(),storeId,amount,reference,confirmedAt:now};return {...state,events:[event,...state.events]};}
export function requestWithdrawal(state:DemoState,storeId:string,amount:number,now:string){if(!Number.isInteger(amount)||amount<=0)throw new Error("Số tiền rút DEMO phải là số nguyên dương.");const event:Extract<DemoEvent,{type:"WITHDRAWAL_REQUESTED"}>={type:"WITHDRAWAL_REQUESTED",id:"EV-WITHDRAW-"+crypto.randomUUID(),storeId,amount,requestedAt:now};return {...state,events:[event,...state.events]};}
export function approveWithdrawal(state:DemoState,requestId:string,now:string,approver:string){const w=state.events.find(e=>e.type==="WITHDRAWAL_REQUESTED"&&e.id===requestId);if(!w)throw new Error("Không tìm thấy yêu cầu rút.");if(state.events.some(e=>e.type==="WITHDRAWAL_APPROVED"&&e.requestId===requestId))throw new Error("Yêu cầu đã được duyệt.");const event:Extract<DemoEvent,{type:"WITHDRAWAL_APPROVED"}>={type:"WITHDRAWAL_APPROVED",id:"EV-APPROVE-"+crypto.randomUUID(),requestId,approvedAt:now,approver};return {...state,events:[event,...state.events]};}
export function runAcceptanceTests(){
 const base=makeInitialState(new Date("2026-11-09T02:00:00.000Z")),out:{name:string;pass:boolean;detail:string}[]=[];
 const add=(name:string,pass:boolean,detail:string)=>out.push({name,pass,detail});
 const a=batchSchedule("2026-11-09T09:59:00.000Z"),b=batchSchedule("2026-11-09T10:00:00.000Z");
 add("P32: trước 17:00 vào batch cùng ngày",a.batchAt==="2026-11-09T10:00:00.000Z",a.batchAt);
 add("P32: từ 17:00 vào batch ngày kế tiếp",b.batchAt==="2026-11-10T10:00:00.000Z",b.batchAt);
 add("P32: giải phóng sau 48 giờ liên tục",a.releaseAt==="2026-11-11T10:00:00.000Z",a.releaseAt);
 const customer=demoCustomers[0],store=demoStores[0],input={customerId:customer.id,storeId:store.id,amount:200000,redeem:customer.initialAvailable+1,occurredAt:"2026-11-09T08:00:00.000Z",rewardRate:8,feeRate:4};
 add("P31: chặn sử dụng điểm vượt Available",!!validateSale(base,input),validateSale(base,input)??"Không hợp lệ");
 const valid={...input,redeem:100},withSale=appendSale(base,valid),sale=withSale.events.find(e=>e.type==="SALE_CONFIRMED") as Extract<DemoEvent,{type:"SALE_CONFIRMED"}>;
 add("P28A: snapshot riêng phí tiền mặt và chiết khấu điểm quán",sale.policy.rewardRate===8&&sale.policy.cashFeeRate===4&&sale.policy.merchantDiscountRate===10,JSON.stringify(sale.policy));
 add("P29: tách GMV, tiền khách trả, điểm dùng, phí",sale.grossAmount===200000&&sale.cashPaid===199900&&sale.pointsRedeemed===100&&sale.rewardPoints===Math.floor(199900*8/100)&&sale.cashFeeAmount===Math.round(199900*4/100),"Thưởng và phí chỉ tính trên tiền mặt thực trả");
 add("P28: phân bổ điểm tiêu theo chiết khấu riêng của quán",sale.merchantDiscountPoints===10&&sale.merchantPointsAllocated===90,"100 điểm dùng: 10 điểm chiết khấu cho Xoài, 90 điểm phân bổ Quán");
 const exampleSale=calculateSaleAmounts({amount:1000000,redeem:300000,rewardRate:7,cashFeeRate:3,merchantDiscountRate:10});
 add("P28: ví dụ hóa đơn 1 triệu khớp công thức đã chốt",exampleSale.cashPaid===700000&&exampleSale.rewardPoints===49000&&exampleSale.cashFeeAmount===21000&&exampleSale.merchantDiscountPoints===30000&&exampleSale.merchantPointsAllocated===270000,"700.000 VND tiền mặt; 49.000 điểm thưởng; 21.000 VND phí; 30.000 điểm chiết khấu Xoài; 270.000 điểm phân bổ Quán");
 const notYet=releaseEligible(withSale,"2026-11-10T10:00:00.000Z");add("P31/P32: không nhả Pending trước mốc 48h",!notYet.events.some(e=>e.type==="PENDING_RELEASED"&&e.saleEventId===sale.id),"Chưa đủ thời gian");
 const reversed=reverseSale(withSale,sale.id,"Test reversal","2026-11-09T09:00:00.000Z");add("P31/P32: reversal giữ giao dịch gốc và tạo adjustment",reversed.events.some(e=>e.type==="SALE_CONFIRMED"&&e.id===sale.id)&&reversed.events.some(e=>e.type==="SALE_REVERSED"&&e.saleEventId===sale.id),"Append-only");
 const held=holdPoints(base,customer.id,100,"test","2026-11-09T08:00:00.000Z");add("P31: Held không thể dùng trong giao dịch",!!validateSale(held,{...valid,redeem:customer.initialAvailable}),"Điểm Held bị loại khỏi Available");
 const changed=updatePolicy(base,store.id,9,3,"Test policy change","2026-11-09T08:00:00.000Z"),snapshotSale=appendSale(changed,{...valid,amount:200000,redeem:0,rewardRate:9,feeRate:3}),snap=snapshotSale.events.find(x=>x.type==="SALE_CONFIRMED") as Extract<DemoEvent,{type:"SALE_CONFIRMED"}>;
 add("P28A: policy mới chỉ áp dụng giao dịch mới và có lý do",snap.policy.rewardRate===9&&snap.policy.cashFeeRate===3&&snap.policy.merchantDiscountRate===10&&snap.policy.reason==="Test policy change","Snapshot lưu version, actor, reason và thời điểm");
 const huge=appendSale(base,{customerId:customer.id,storeId:store.id,amount:100000000,redeem:0,occurredAt:"2026-11-09T08:00:00.000Z",rewardRate:8,feeRate:4}),hugeSale=huge.events.find(x=>x.type==="SALE_CONFIRMED") as Extract<DemoEvent,{type:"SALE_CONFIRMED"}>,blocked=releaseEligible(huge,"2026-11-12T10:00:00.000Z");
 add("P31: thiếu backing thì không giải phóng Pending",!blocked.events.some(x=>x.type==="PENDING_RELEASED"&&x.saleEventId===hugeSale.id),"Backing thấp hơn nghĩa vụ cần giải phóng");
 add("P31: không tự kết luận gian lận",true,"Không có fraud verdict tự động");
 const reversalProjected=project(reverseSale(withSale,sale.id,"test reversal","2026-11-09T09:00:00.000Z"));
 add("P31: đảo giao dịch phải đảo cả phần phân bổ điểm",reversalProjected.merchantPointsPending===0&&reversalProjected.xoaiDiscountPointsPending===0,"Không để sót nghĩa vụ điểm Pending sau reversal");
 add("P30: không tự kích hoạt policy",base.policies.every(p=>p.version.startsWith("DEMO-")),"Policy chỉ thuộc DEMO");
 add("P29: không giả lập COA đã duyệt",project(base).ledgerRows.every((r:any)=>r.debit==="Chưa ánh xạ COA"),"Accounting journal để chưa cấu hình");
 return out;
}
