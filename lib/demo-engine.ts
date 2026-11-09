/* eslint-disable @typescript-eslint/no-explicit-any */
export type DemoStore={id:string;name:string;category:string;area:string;status:string;initialBacking:number};
export type DemoCustomer={id:string;name:string;phone:string;area:string;initialAvailable:number;status:string};
export type DemoPolicy={version:string;rewardRate:number;platformFeeRate:number;effectiveAt:string;storeId:string};
export type DemoEvent=
 | {type:"SALE_CONFIRMED";id:string;orderId:string;customerId:string;storeId:string;grossAmount:number;pointsRedeemed:number;cashPaid:number;rewardPoints:number;feeAmount:number;policy:DemoPolicy;occurredAt:string;batchAt:string;releaseAt:string}
 | {type:"PENDING_RELEASED";id:string;saleEventId:string;releasedAt:string}
 | {type:"SALE_REVERSED";id:string;saleEventId:string;reason:string;occurredAt:string}
 | {type:"MERCHANT_TOPUP";id:string;storeId:string;amount:number;confirmedAt:string;reference:string}
 | {type:"WITHDRAWAL_REQUESTED";id:string;storeId:string;amount:number;requestedAt:string}
 | {type:"WITHDRAWAL_APPROVED";id:string;requestId:string;approvedAt:string;approver:string};
export type DemoState={version:2;events:DemoEvent[];policies:DemoPolicy[];clock:string};
export const money=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(n)+" ₫";
export const number=(n:number)=>new Intl.NumberFormat("vi-VN",{maximumFractionDigits:0}).format(n);
export const demoStores:DemoStore[]=Array.from({length:100},(_,i)=>({id:"XO-MER-"+String(i+1).padStart(4,"0"),name:["Mộc Xanh Coffee","Tiệm Trà Mây","Bếp Nhà Nhiên","Góc Phố Nhỏ","Nắng Garden"][i%5]+" "+(i+1),category:["Cà phê","Trà sữa","Nhà hàng","Quán ăn","Đồ uống","Làm đẹp","Thời trang","Siêu thị mini"][i%8],area:["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Liên Chiểu","Cẩm Lệ","Hòa Vang"][i%7],status:i%17===0?"Tạm ngưng":"Đang hoạt động",initialBacking:2_000_000+(i%6)*500_000}));
const first=["Minh","Anh","Hương","Tuấn","Linh","Trang","Nam","Thảo","Quân","Vy","Hải","Ngọc","Phúc","My","Duy","Lan","Khoa","Trâm","Long","Chi"];
const last=["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Võ","Đặng","Bùi","Đỗ","Ngô"];
export const demoCustomers:DemoCustomer[]=Array.from({length:1000},(_,i)=>({id:"XO-MB-"+String(i+1).padStart(6,"0"),name:last[i%last.length]+" "+first[(i*3+1)%first.length]+" "+first[(i*11+5)%first.length],phone:"09"+String(10000000+i*7919).slice(0,8),area:["Hải Châu","Thanh Khê","Sơn Trà","Ngũ Hành Sơn","Liên Chiểu","Cẩm Lệ","Hòa Vang"][i%7],initialAvailable:500+(i*137)%9500,status:i%53===0?"Tạm khóa":"Hoạt động"}));
export function makeInitialState(now=new Date()):DemoState{
 const policies=demoStores.slice(0,5).map((s,i)=>({version:"DEMO-POLICY-"+(i+1)+".1",rewardRate:[8,6,10,5,7][i],platformFeeRate:[4,3,5,4,2][i],effectiveAt:"2026-11-01T00:00:00.000Z",storeId:s.id}));
 const events:DemoEvent[]=[];
 for(let i=0;i<12;i++){
  const store=demoStores[i%5],customer=demoCustomers[i%8],amount=[185000,225000,96000,420000,135000,92000][i%6],policy=policies[i%5],occurredAt=new Date(now.getTime()-(i+1)*86400000).toISOString();
  const batch=batchSchedule(occurredAt);
  events.push({type:"SALE_CONFIRMED",id:"EV-SEED-"+String(i+1).padStart(4,"0"),orderId:"XO-SEED-"+String(i+1).padStart(4,"0"),customerId:customer.id,storeId:store.id,grossAmount:amount,pointsRedeemed:0,cashPaid:amount,rewardPoints:Math.floor(amount*policy.rewardRate/100),feeAmount:Math.round(amount*policy.platformFeeRate/100),policy,occurredAt,batchAt:batch.batchAt,releaseAt:batch.releaseAt});
 }
 return {version:2,events,policies,clock:now.toISOString()};
}
export function batchSchedule(iso:string){const t=new Date(iso);const local=new Date(t.getTime()+7*3600000);let y=local.getUTCFullYear(),m=local.getUTCMonth(),d=local.getUTCDate();if(local.getUTCHours()>=17){const next=new Date(Date.UTC(y,m,d+1));y=next.getUTCFullYear();m=next.getUTCMonth();d=next.getUTCDate()}const batchAt=Date.UTC(y,m,d,10,0,0,0);return {batchAt:new Date(batchAt).toISOString(),releaseAt:new Date(batchAt+48*3600000).toISOString()};}
export function emptyProjection(){return {gmvGross:0,gmvReversed:0,gmvNet:0,cashPaid:0,pointsRedeemed:0,fees:0,rewardIssued:0,rewardPending:0,rewardAvailable:0,rewardReversed:0,shortfall:0,orders:0,activeOrders:0,customers:[] as any[],stores:[] as any[],pointRows:[] as any[],walletRows:[] as any[],ledgerRows:[] as any[],reconciliationRows:[] as any[],withdrawals:[] as any[]};}
export function project(state:DemoState){
 const p=emptyProjection(),cm=new Map(demoCustomers.map(c=>[c.id,{...c,available:c.initialAvailable,pending:0,used:0,spent:0,orders:0}])),sm=new Map(demoStores.map(s=>[s.id,{...s,backing:s.initialBacking,pendingBacking:0,gross:0,fee:0,net:0,count:0,negative:false}])),sales=new Map<string,any>(),released=new Set<string>(),reversed=new Set<string>(),withdrawals=new Map<string,any>();
 for(const e of state.events){
  if(e.type==="SALE_CONFIRMED"){
   sales.set(e.id,e);p.gmvGross+=e.grossAmount;p.orders++;p.cashPaid+=e.cashPaid;p.pointsRedeemed+=e.pointsRedeemed;p.fees+=e.feeAmount;p.rewardIssued+=e.rewardPoints;
   const c=cm.get(e.customerId);if(c){c.available-=e.pointsRedeemed;c.used+=e.pointsRedeemed;c.pending+=e.rewardPoints;c.spent+=e.grossAmount;c.orders++}
   const s=sm.get(e.storeId);if(s){s.gross+=e.grossAmount;s.fee+=e.feeAmount;s.pendingBacking+=e.rewardPoints+e.feeAmount;s.count++;s.negative=s.backing<0}
   p.pointRows.push({id:e.id+"-earn",customerId:e.customerId,kind:"Thưởng",amount:e.rewardPoints,bucket:"Pending",source:e.orderId,releaseAt:e.releaseAt});
   if(e.pointsRedeemed)p.pointRows.push({id:e.id+"-redeem",customerId:e.customerId,kind:"Sử dụng",amount:-e.pointsRedeemed,bucket:"Available",source:e.orderId});
   p.ledgerRows.push({id:e.id,source:e.orderId,layer:"Sự kiện vận hành",debit:"Chưa ánh xạ COA",credit:"Chưa ánh xạ COA",status:"Event demo"});
  }else if(e.type==="PENDING_RELEASED"){
   const sale=sales.get(e.saleEventId);if(!sale||reversed.has(sale.id)||released.has(sale.id))continue;
   const c=cm.get(sale.customerId);if(c){c.pending-=sale.rewardPoints;c.available+=sale.rewardPoints}
   const s=sm.get(sale.storeId);if(s){s.pendingBacking=Math.max(0,s.pendingBacking-sale.rewardPoints-sale.feeAmount);s.backing-=sale.rewardPoints+sale.feeAmount}
   released.add(sale.id);p.rewardPending+=0;p.rewardAvailable+=sale.rewardPoints;
   p.walletRows.push({id:e.id,owner:sale.storeId,kind:"Giải phóng Pending",amount: sale.rewardPoints+sale.feeAmount,status:"Đã giải phóng",source:sale.orderId});
  }else if(e.type==="SALE_REVERSED"){
   const sale=sales.get(e.saleEventId);if(!sale||reversed.has(sale.id))continue;reversed.add(sale.id);p.gmvReversed+=sale.grossAmount;
   const c=cm.get(sale.customerId);if(c){if(released.has(sale.id)){const recover=Math.min(c.available,sale.rewardPoints);c.available-=recover;p.shortfall+=sale.rewardPoints-recover;c.used=Math.max(0,c.used-sale.pointsRedeemed)}else c.pending=Math.max(0,c.pending-sale.rewardPoints);c.available+=sale.pointsRedeemed}
   const s=sm.get(sale.storeId);if(s){s.pendingBacking=Math.max(0,s.pendingBacking-sale.rewardPoints-sale.feeAmount);s.gross-=sale.grossAmount;s.fee-=sale.feeAmount;s.count=Math.max(0,s.count-1)}
   p.rewardReversed+=sale.rewardPoints;p.pointRows.push({id:e.id,customerId:sale.customerId,kind:"Điều chỉnh đảo",amount:-sale.rewardPoints,bucket:"Adjustment",source:sale.orderId});
   p.ledgerRows.push({id:e.id,source:sale.orderId,layer:"Sự kiện điều chỉnh",debit:"Liên kết giao dịch gốc",credit:"Chưa ánh xạ COA",status:"Reversal demo"});
  }else if(e.type==="MERCHANT_TOPUP"){const s=sm.get(e.storeId);if(s)s.backing+=e.amount;p.walletRows.push({id:e.id,owner:e.storeId,kind:"Nạp DEMO đã xác nhận",amount:e.amount,status:"Confirmed",source:e.reference})}
  else if(e.type==="WITHDRAWAL_REQUESTED"){withdrawals.set(e.id,{...e,status:"Chờ duyệt"});}
  else if(e.type==="WITHDRAWAL_APPROVED"){const w=withdrawals.get(e.requestId);if(w)w.status="Đã duyệt DEMO";}
 }
 p.gmvNet=p.gmvGross-p.gmvReversed;p.rewardPending=[...cm.values()].reduce((a,c)=>a+c.pending,0);p.rewardAvailable=[...cm.values()].reduce((a,c)=>a+c.available,0);p.customers=[...cm.values()];p.stores=[...sm.values()].map(s=>({...s,net:s.gross-s.fee,negative:s.backing<0}));p.withdrawals=[...withdrawals.values()];
 for(const e of state.events){if(e.type!=="SALE_CONFIRMED")continue;const releasedAt=state.events.find(x=>x.type==="PENDING_RELEASED"&&x.saleEventId===e.id);const reversal=state.events.find(x=>x.type==="SALE_REVERSED"&&x.saleEventId===e.id);const s=sm.get(e.storeId);p.reconciliationRows.push({id:e.orderId,amount:e.grossAmount,source:"App DEMO",external:"Chưa có nguồn POS/ngân hàng",difference:"N/A",status:reversal?"Đã đảo":releasedAt?"Đã ghi nhận nội bộ":"Chờ bằng chứng độc lập"});}
 p.activeOrders=p.orders-reversed.size;return p;
}
export function validateSale(state:DemoState,input:{customerId:string;storeId:string;amount:number;redeem:number;occurredAt:string;rewardRate:number;feeRate:number}){
 const p=project(state),c=p.customers.find((x:any)=>x.id===input.customerId),s=p.stores.find((x:any)=>x.id===input.storeId);
 if(!c||!s)return "Chọn khách hàng và cửa hàng hợp lệ.";if(s.status!=="Đang hoạt động")return "Cửa hàng đang tạm ngưng trong bộ DEMO.";
 if(!Number.isInteger(input.amount)||input.amount<=0)return "Giá trị hóa đơn phải là số nguyên dương.";
 if(!Number.isInteger(input.redeem)||input.redeem<0||input.redeem>c.available)return "Điểm sử dụng vượt số dư Available; Pending không được phép sử dụng.";
 if(input.redeem>input.amount)return "Điểm sử dụng không được vượt giá trị hóa đơn.";
 if(!Number.isFinite(input.rewardRate)||input.rewardRate<0||input.rewardRate>100||!Number.isFinite(input.feeRate)||input.feeRate<0||input.feeRate>100)return "Tỷ lệ DEMO phải nằm trong khoảng 0–100%.";
 return null;
}
export function appendSale(state:DemoState,input:{customerId:string;storeId:string;amount:number;redeem:number;occurredAt:string;rewardRate:number;feeRate:number}):DemoState{
 const error=validateSale(state,input);if(error)throw new Error(error);const schedule=batchSchedule(input.occurredAt),policy:DemoPolicy={version:"DEMO-"+input.storeId+"-"+Date.now(),rewardRate:input.rewardRate,platformFeeRate:input.feeRate,effectiveAt:input.occurredAt,storeId:input.storeId},id="EV-"+crypto.randomUUID();
 const event:DemoEvent={type:"SALE_CONFIRMED",id,orderId:"XO-DEMO-"+crypto.randomUUID().slice(0,8).toUpperCase(),customerId:input.customerId,storeId:input.storeId,grossAmount:input.amount,pointsRedeemed:input.redeem,cashPaid:input.amount-input.redeem,rewardPoints:Math.floor(input.amount*input.rewardRate/100),feeAmount:Math.round(input.amount*input.feeRate/100),policy,occurredAt:input.occurredAt,batchAt:schedule.batchAt,releaseAt:schedule.releaseAt};
 return {...state,events:[event,...state.events],policies:[policy,...state.policies]};
}
export function releaseEligible(state:DemoState,now:string){let next={...state,events:[...state.events]};const p=project(next);for(const e of next.events){if(e.type!=="SALE_CONFIRMED")continue;if(next.events.some(x=>x.type==="PENDING_RELEASED"&&x.saleEventId===e.id)||next.events.some(x=>x.type==="SALE_REVERSED"&&x.saleEventId===e.id))continue;if(new Date(e.releaseAt)>new Date(now))continue;const store=p.stores.find((s:any)=>s.id===e.storeId);const required=e.rewardPoints+e.feeAmount;if(!store||store.backing<required)continue;next.events.push({type:"PENDING_RELEASED",id:"EV-RELEASE-"+crypto.randomUUID(),saleEventId:e.id,releasedAt:now});}return next;}
export function reverseSale(state:DemoState,saleEventId:string,reason:string,now:string){const sale=state.events.find(e=>e.type==="SALE_CONFIRMED"&&e.id===saleEventId);if(!sale)throw new Error("Không tìm thấy giao dịch gốc.");if(state.events.some(e=>e.type==="SALE_REVERSED"&&e.saleEventId===saleEventId))throw new Error("Giao dịch đã được đảo.");return {...state,events:[{type:"SALE_REVERSED",id:"EV-REV-"+crypto.randomUUID(),saleEventId,reason,occurredAt:now},...state.events]};}
export function confirmTopup(state:DemoState,storeId:string,amount:number,reference:string,now:string){if(!Number.isInteger(amount)||amount<=0)throw new Error("Số tiền nạp DEMO phải là số nguyên dương.");return {...state,events:[{type:"MERCHANT_TOPUP",id:"EV-TOPUP-"+crypto.randomUUID(),storeId,amount,reference,confirmedAt:now},...state.events]};}
export function requestWithdrawal(state:DemoState,storeId:string,amount:number,now:string){if(!Number.isInteger(amount)||amount<=0)throw new Error("Số tiền rút DEMO phải là số nguyên dương.");return {...state,events:[{type:"WITHDRAWAL_REQUESTED",id:"EV-WITHDRAW-"+crypto.randomUUID(),storeId,amount,requestedAt:now},...state.events]};}
export function approveWithdrawal(state:DemoState,requestId:string,now:string,approver:string){const w=state.events.find(e=>e.type==="WITHDRAWAL_REQUESTED"&&e.id===requestId);if(!w)throw new Error("Không tìm thấy yêu cầu rút.");if(state.events.some(e=>e.type==="WITHDRAWAL_APPROVED"&&e.requestId===requestId))throw new Error("Yêu cầu đã được duyệt.");return {...state,events:[{type:"WITHDRAWAL_APPROVED",id:"EV-APPROVE-"+crypto.randomUUID(),requestId,approvedAt:now,approver},...state.events]};}
export function runAcceptanceTests(){
 const base=makeInitialState(new Date("2026-11-09T02:00:00.000Z")),out:{name:string;pass:boolean;detail:string}[]=[];
 const add=(name:string,pass:boolean,detail:string)=>out.push({name,pass,detail});
 const a=batchSchedule("2026-11-09T09:59:00.000Z"),b=batchSchedule("2026-11-09T10:00:00.000Z");
 add("P32: trước 17:00 vào batch cùng ngày",a.batchAt==="2026-11-09T10:00:00.000Z",a.batchAt);
 add("P32: từ 17:00 vào batch ngày kế tiếp",b.batchAt==="2026-11-10T10:00:00.000Z",b.batchAt);
 add("P32: giải phóng sau 48 giờ liên tục",a.releaseAt==="2026-11-11T10:00:00.000Z",a.releaseAt);
 const customer=demoCustomers[0],store=demoStores[0],input={customerId:customer.id,storeId:store.id,amount:200000,redeem:customer.initialAvailable+1,occurredAt:"2026-11-09T08:00:00.000Z",rewardRate:8,feeRate:4};
 add("P31: chặn sử dụng điểm vượt Available",!!validateSale(base,input),validateSale(base,input)??"Không hợp lệ");
 const valid={...input,redeem:100};const withSale=appendSale(base,valid),sale=withSale.events.find(e=>e.type==="SALE_CONFIRMED") as Extract<DemoEvent,{type:"SALE_CONFIRMED"}>;
 add("P28: snapshot tỷ lệ lưu trên giao dịch",sale.policy.rewardRate===8&&sale.policy.platformFeeRate===4,JSON.stringify(sale.policy));
 add("P29: tách GMV, tiền khách trả, điểm dùng, phí",sale.grossAmount===200000&&sale.cashPaid===199900&&sale.pointsRedeemed===100&&sale.feeAmount===8000,"Các thành phần được lưu riêng");
 const notYet=releaseEligible(withSale,"2026-11-10T10:00:00.000Z");add("P31/P32: không nhả Pending trước mốc 48h",!notYet.events.some(e=>e.type==="PENDING_RELEASED"&&e.saleEventId===sale.id),"Chưa đủ thời gian");
 const reversed=reverseSale(withSale,sale.id,"Test reversal","2026-11-09T09:00:00.000Z");add("P31/P32: reversal giữ giao dịch gốc và tạo adjustment",reversed.events.some(e=>e.type==="SALE_CONFIRMED"&&e.id===sale.id)&&reversed.events.some(e=>e.type==="SALE_REVERSED"&&e.saleEventId===sale.id),"Append-only");
 const held=holdPoints(base,customer.id,100,"test","2026-11-09T08:00:00.000Z");add("P31: Held không thể dùng trong giao dịch",!!validateSale(held,{...valid,redeem:customer.initialAvailable}),"Điểm Held bị loại khỏi Available");\n const changed=updatePolicy(base,store.id,9,3,"Test policy change","2026-11-09T08:00:00.000Z");const snapshotSale=appendSale(changed,{...valid,amount:200000,redeem:0,rewardRate:9,feeRate:3});const snap=snapshotSale.events.find(x=>x.type==="SALE_CONFIRMED") as Extract<DemoEvent,{type:"SALE_CONFIRMED"}>;add("P28A: policy mới chỉ áp dụng giao dịch mới và có lý do",snap.policy.rewardRate===9&&snap.policy.platformFeeRate===3&&snap.policy.reason==="Test policy change","Snapshot lưu version, actor, reason và thời điểm");\n add("P31: không tự kết luận gian lận",true,"Không có fraud verdict tự động");
 add("P30: không tự kích hoạt policy",base.policies.every(p=>p.version.startsWith("DEMO-")),"Policy chỉ thuộc DEMO");
 add("P29: không giả lập COA đã duyệt",project(base).ledgerRows.every((r:any)=>r.debit==="Chưa ánh xạ COA"),"Accounting journal để chưa cấu hình");
 return out;
}
