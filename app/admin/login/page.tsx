"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      window.location.assign(nextPath.startsWith("/admin") ? nextPath : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f4f8f4",fontFamily:"Arial,sans-serif",color:"#173d2b"}}>
      <section style={{width:"min(100%,420px)",padding:32,border:"1px solid #dce9df",borderRadius:22,background:"#fff",boxShadow:"0 18px 55px rgba(20,70,40,.08)"}}>
        <div style={{fontSize:12,fontWeight:800,letterSpacing:2,color:"#16864b"}}>XOÀI GO · CONTROL CENTER</div>
        <h1 style={{fontSize:30,margin:"14px 0 8px"}}>Đăng nhập quản trị</h1>
        <p style={{color:"#68796f",fontSize:14,lineHeight:1.6}}>Khu vực dành cho tài khoản đã được cấp quyền. Không có chức năng tự đăng ký quản trị công khai.</p>
        {!configured ? (
          <div role="status" style={{padding:16,borderRadius:12,background:"#fff5df",color:"#80551a",fontSize:13,lineHeight:1.6}}>
            Chưa cấu hình kết nối Supabase cho môi trường này. Cần thiết lập NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong Preview Environment trước khi đăng nhập.
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{display:"grid",gap:14,marginTop:24}}>
            <label style={{display:"grid",gap:7,fontSize:13,fontWeight:700}}>Email
              <input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:13,border:"1px solid #d8e4dc",borderRadius:10,fontSize:15}}/>
            </label>
            <label style={{display:"grid",gap:7,fontSize:13,fontWeight:700}}>Mật khẩu
              <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:13,border:"1px solid #d8e4dc",borderRadius:10,fontSize:15}}/>
            </label>
            {error && <p role="alert" style={{margin:0,color:"#b42318",fontSize:13}}>{error}</p>}
            <button disabled={busy} type="submit" style={{padding:14,border:0,borderRadius:11,background:"#13864b",color:"#fff",fontWeight:800,cursor:"pointer",opacity:busy?.7:1}}>{busy?"Đang xác thực…":"Đăng nhập"}</button>
          </form>
        )}
        <p style={{fontSize:11,color:"#849188",marginTop:24}}>Bảo mật theo phiên Supabase Auth. Quyền Admin được xác định ở database, không lấy từ lựa chọn trên giao diện.</p>
      </section>
    </main>
  );
}
