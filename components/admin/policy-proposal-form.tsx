"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PolicySet = { id: string; code: string; name: string; description: string | null };
type RpcResult = { data: string | null; error: { message: string } | null };

export function PolicyRegistryActions({ policySets }: { policySets: PolicySet[] }) {
  const router = useRouter();
  const [selectedId,setSelectedId]=useState(policySets[0]?.id??"");
  const [code,setCode]=useState("");
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [configText,setConfigText]=useState("{\n  \n}");
  const [reason,setReason]=useState("");
  const [busy,setBusy]=useState(false);
  const [idempotencyKey,setIdempotencyKey]=useState("");
  const [message,setMessage]=useState<{text:string;ok:boolean}|null>(null);

  async function rpc(fn:string,args:Record<string,unknown>){
    const supabase=createClient();
    const call=supabase.rpc as unknown as (name:string,params:Record<string,unknown>)=>Promise<RpcResult>;
    const result=await call(fn,args);
    if(result.error)throw new Error(result.error.message);
    return result.data;
  }
  async function createSet(){
    setMessage(null);
    if(!code.trim()||!name.trim()){setMessage({text:"Cần nhập mã và tên bộ chính sách.",ok:false});return;}
    setBusy(true);
    try{
      const id=await rpc("admin_create_policy_set",{p_code:code.trim().toLowerCase(),p_name:name.trim(),p_description:description.trim()||null});
      setSelectedId(id??"");setCode("");setName("");setDescription("");
      setMessage({text:"Đã tạo bộ chính sách. Chưa có quy tắc nào được kích hoạt.",ok:true});router.refresh();
    }catch(e){setMessage({text:e instanceof Error?e.message:"Không thể tạo bộ chính sách.",ok:false});}
    finally{setBusy(false);}
  }
  async function createDraft(){
    setMessage(null);
    if(!selectedId){setMessage({text:"Chọn bộ chính sách trước.",ok:false});return;}
    let config:unknown;
    try{config=JSON.parse(configText);}catch{setMessage({text:"Cấu hình phải là JSON hợp lệ.",ok:false});return;}
    if(!config||typeof config!=="object"||Array.isArray(config)){setMessage({text:"Cấu hình phải là một JSON object.",ok:false});return;}
    setBusy(true);
    try{
      const id=await rpc("create_policy_version_draft",{p_policy_set_id:selectedId,p_config:config});
      setMessage({text:`Đã lưu phiên bản nháp ${id??""}. Bản nháp chưa được duyệt hoặc áp dụng.`,ok:true});router.refresh();
    }catch(e){setMessage({text:e instanceof Error?e.message:"Không thể tạo phiên bản nháp.",ok:false});}
    finally{setBusy(false);}
  }
  async function submitForReview(){
    setMessage(null);
    if(!selectedId||!reason.trim()){setMessage({text:"Chọn bộ chính sách và ghi lý do gửi duyệt.",ok:false});return;}
    let config:unknown;
    try{config=JSON.parse(configText);}catch{setMessage({text:"Cấu hình phải là JSON hợp lệ.",ok:false});return;}
    if(!config||typeof config!=="object"||Array.isArray(config)){setMessage({text:"Cấu hình phải là một JSON object.",ok:false});return;}
    if(!window.confirm("Gửi cấu hình này vào hàng đợi phê duyệt?"))return;
    const requestKey=idempotencyKey||crypto.randomUUID();
    setIdempotencyKey(requestKey);setBusy(true);
    try{
      const id=await rpc("submit_policy_approval_request",{p_policy_set_id:selectedId,p_proposed_config:config,p_reason:reason.trim(),p_idempotency_key:requestKey});
      setReason("");setIdempotencyKey("");
      setMessage({text:`Đã gửi yêu cầu phê duyệt ${id??""}. Cấu hình chưa được áp dụng.`,ok:true});router.refresh();
    }catch(e){setMessage({text:e instanceof Error?e.message:"Không thể gửi yêu cầu.",ok:false});}
    finally{setBusy(false);}
  }

  const input:React.CSSProperties={width:"100%",boxSizing:"border-box",padding:11,border:"1px solid #dbe7de",borderRadius:9,font:"inherit"};
  const button:React.CSSProperties={border:0,borderRadius:9,padding:"10px 14px",background:"#13864b",color:"#fff",fontWeight:700,cursor:"pointer"};
  return <div style={{display:"grid",gap:18}}>
    <section style={{border:"1px solid #e0eae3",borderRadius:14,padding:18,display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Tạo bộ chính sách</h2>
      <p style={{margin:0,color:"#718176",fontSize:13}}>Chỉ tạo danh mục để quản lý. Không đồng nghĩa chính sách đã có hiệu lực.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
        <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Mã (a-z, 0-9, _)<input value={code} onChange={e=>setCode(e.target.value)} style={input} maxLength={64} placeholder="membership_benefits"/></label>
        <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Tên bộ chính sách<input value={name} onChange={e=>setName(e.target.value)} style={input} maxLength={160}/></label>
        <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Mô tả<input value={description} onChange={e=>setDescription(e.target.value)} style={input}/></label>
      </div>
      <button disabled={busy} onClick={createSet} style={button}>Tạo bộ chính sách</button>
    </section>
    <section style={{border:"1px solid #e0eae3",borderRadius:14,padding:18,display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Tạo phiên bản và gửi duyệt</h2>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Bộ chính sách<select value={selectedId} onChange={e=>{setSelectedId(e.target.value);setIdempotencyKey("");}} style={input}><option value="">Chọn bộ chính sách</option>{policySets.map(item=><option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Cấu hình JSON<textarea value={configText} onChange={e=>{setConfigText(e.target.value);setIdempotencyKey("");}} rows={8} spellCheck={false} style={{...input,resize:"vertical",fontFamily:"monospace",fontSize:12}}/></label>
      <button disabled={busy||!selectedId} onClick={createDraft} style={button}>Lưu phiên bản nháp</button>
      <label style={{display:"grid",gap:5,fontSize:12,fontWeight:700}}>Lý do gửi phê duyệt<textarea value={reason} onChange={e=>{setReason(e.target.value);setIdempotencyKey("");}} rows={3} maxLength={2000} style={{...input,resize:"vertical"}} placeholder="Căn cứ và mục tiêu của đề xuất…"/></label>
      <button disabled={busy||!selectedId} onClick={submitForReview} style={{...button,background:"#245c9b"}}>{busy?"Đang gửi…":"Gửi đề xuất vào hàng đợi"}</button>
    </section>
    {message&&<p role={message.ok?"status":"alert"} style={{margin:0,color:message.ok?"#16864b":"#b42318",fontSize:13}}>{message.text}</p>}
  </div>;
}
