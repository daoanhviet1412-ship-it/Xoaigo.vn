"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MerchantCreateForm() {
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement=event.currentTarget;
    const form=new FormData(formElement);
    setBusy(true); setError(""); setSuccess("");
    try {
      const supabase=createClient();
      const {error:rpcError}=await supabase.rpc("admin_create_merchant",{
        p_legal_name:String(form.get("legal_name")||""),
        p_display_name:String(form.get("display_name")||""),
        p_business_type:String(form.get("business_type")||"") || undefined,
        p_contact_phone:String(form.get("contact_phone")||"") || undefined,
        p_contact_email:String(form.get("contact_email")||"") || undefined,
        p_slug:String(form.get("slug")||"") || undefined,
      });
      if(rpcError) throw rpcError;
      setSuccess("Đã tạo hồ sơ cửa hàng ở trạng thái Nháp.");
      formElement.reset();
      router.refresh();
    } catch(cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo cửa hàng.");
    } finally { setBusy(false); }
  }

  const input:React.CSSProperties={width:"100%",padding:"11px 12px",border:"1px solid #dbe7de",borderRadius:10,fontSize:14,marginTop:6};
  return <form onSubmit={submit} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,alignItems:"end"}}>
    <label style={{fontSize:12,fontWeight:700}}>Tên cửa hàng<input required name="display_name" style={input}/></label>
    <label style={{fontSize:12,fontWeight:700}}>Tên pháp lý<input required name="legal_name" style={input}/></label>
    <label style={{fontSize:12,fontWeight:700}}>Loại hình<input name="business_type" placeholder="Cà phê, nhà hàng…" style={input}/></label>
    <label style={{fontSize:12,fontWeight:700}}>Số điện thoại<input name="contact_phone" inputMode="tel" style={input}/></label>
    <label style={{fontSize:12,fontWeight:700}}>Email<input name="contact_email" type="email" style={input}/></label>
    <label style={{fontSize:12,fontWeight:700}}>Slug<input name="slug" placeholder="ten-cua-hang" style={input}/></label>
    <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <button disabled={busy} type="submit" style={{border:0,borderRadius:10,padding:"12px 18px",background:"#13864b",color:"#fff",fontWeight:800,cursor:"pointer",opacity:busy ? .7 : 1}}>{busy?"Đang lưu…":"Tạo hồ sơ cửa hàng"}</button>
      {success&&<span role="status" style={{fontSize:12,color:"#16864b"}}>{success}</span>}
      {error&&<span role="alert" style={{fontSize:12,color:"#b42318"}}>{error}</span>}
    </div>
  </form>;
}
