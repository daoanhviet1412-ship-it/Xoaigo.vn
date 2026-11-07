"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Merchant = { id: string; display_name: string };
type Campaign = { id: string; name: string; merchant_id: string };
type RpcResult = { data: string | null; error: { message: string } | null };

export function BudgetProposalForm({ merchants, campaigns }: { merchants: Merchant[]; campaigns: Campaign[] }) {
  const router = useRouter();
  const [merchantId,setMerchantId]=useState("");
  const [campaignId,setCampaignId]=useState("");
  const [amount,setAmount]=useState("");
  const [currency,setCurrency]=useState("VND");
  const [source,setSource]=useState("");
  const [purpose,setPurpose]=useState("");
  const [reason,setReason]=useState("");
  const [busy,setBusy]=useState(false);const [idempotencyKey,setIdempotencyKey]=useState("");
  const [feedback,setFeedback]=useState<{text:string;ok:boolean}|null>(null);

  async function submit() {
    setFeedback(null);
    if(!amount || !source.trim() || !purpose.trim() || !reason.trim()) {
      setFeedback({text:"Cần nhập số tiền đề xuất, nguồn, mục đích và lý do.",ok:false}); return;
    }
    const numericAmount=Number(amount);
    if(!Number.isFinite(numericAmount) || numericAmount<=0) {
      setFeedback({text:"Số tiền đề xuất phải lớn hơn 0.",ok:false}); return;
    }
    if(!window.confirm("Gửi đề xuất ngân sách để người có thẩm quyền xem xét? Đây chưa phải khoản tiền được cấp hoặc chuyển.")) return;
    setBusy(true);
    try {
      const supabase=createClient();
      const rpc=supabase.rpc as unknown as (name:string,args:Record<string,unknown>)=>Promise<RpcResult>;
      const {data,error}=await rpc("submit_budget_approval_request",{
        p_merchant_id:merchantId || null,
        p_campaign_id:campaignId || null,
        p_amount:numericAmount,
        p_currency:currency.trim().toUpperCase(),
        p_funding_source:source.trim(),
        p_purpose:purpose.trim(),
        p_reason:reason.trim()
      });
      if(error) throw new Error(error.message);
      setFeedback({text:`Đã gửi đề xuất ngân sách ${data ?? ""}. Chưa có khoản ngân sách nào được ghi nhận hoặc giải ngân.`,ok:true});
      setAmount("");setSource("");setPurpose("");setReason("");setCampaignId("");setIdempotencyKey("");
      router.refresh();
    } catch(error) {
      setFeedback({text:error instanceof Error?error.message:"Không thể gửi đề xuất.",ok:false});
    } finally {setBusy(false);}
  }

  const input:React.CSSProperties={width:"100%",boxSizing:"border-box",padding:11,border:"1px solid #dbe7de",borderRadius:9,font:"inherit"};
  const button:React.CSSProperties={border:0,borderRadius:9,padding:"11px 16px",background:"#13864b",color:"#fff",fontWeight:700,cursor:"pointer"};
  const scopedCampaigns=campaigns.filter(c=>!merchantId || c.merchant_id===merchantId);

  return <section style={{background:"#fff",border:"1px solid #e0eae3",borderRadius:16,padding:20,display:"grid",gap:13}}>
    <div><h2 style={{margin:0,fontSize:19}}>Tạo đề xuất ngân sách</h2><p style={{color:"#718176",fontSize:13,lineHeight:1.6}}>Đây là yêu cầu xin duyệt, không phải số dư ngân sách, cam kết cấp vốn hay lệnh chuyển tiền. Nguồn và mục đích do người đề xuất khai báo.</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Cửa hàng (không bắt buộc)<select value={merchantId} onChange={e=>{setMerchantId(e.target.value);setCampaignId("");setIdempotencyKey("");}} style={input}><option value="">Toàn nền tảng / chưa gắn quán</option>{merchants.map(m=><option key={m.id} value={m.id}>{m.display_name}</option>)}</select></label>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Chiến dịch (không bắt buộc)<select value={campaignId} onChange={e=>setCampaignId(e.target.value);setIdempotencyKey("");} style={input}><option value="">Chưa gắn chiến dịch</option>{scopedCampaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Số tiền đề xuất<input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value);setIdempotencyKey("");} style={input} placeholder="Nhập số tiền" /></label>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Mã tiền tệ<input value={currency} onChange={e=>setCurrency(e.target.value);setIdempotencyKey("");} maxLength={3} style={input}/></label>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Nguồn ngân sách<input value={source} onChange={e=>setSource(e.target.value);setIdempotencyKey("");} maxLength={160} style={input} placeholder="Mô tả nguồn dự kiến"/></label>
    </div>
    <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Mục đích / phạm vi<textarea value={purpose} onChange={e=>setPurpose(e.target.value);setIdempotencyKey("");} rows={2} maxLength={1000} style={{...input,resize:"vertical"}}/></label>
    <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Lý do và căn cứ gửi duyệt<textarea value={reason} onChange={e=>setReason(e.target.value);setIdempotencyKey("");} rows={2} maxLength={2000} style={{...input,resize:"vertical"}}/></label>
    <button disabled={busy} onClick={submit} style={{...button,opacity:busy?.6:1}}>{busy?"Đang gửi…":"Gửi đề xuất phê duyệt"}</button>
    {feedback&&<p role={feedback.ok?"status":"alert"} style={{margin:0,color:feedback.ok?"#16864b":"#b42318",fontSize:13}}>{feedback.text}</p>}
  </section>;
}
