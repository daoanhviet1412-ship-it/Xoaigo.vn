"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Merchant = {
  id: string;
  legal_name: string | null;
  display_name: string | null;
  business_type: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  slug: string | null;
};

export function MerchantEditForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [legal, setLegal] = useState(merchant.legal_name ?? "");
  const [display, setDisplay] = useState(merchant.display_name ?? "");
  const [type, setType] = useState(merchant.business_type ?? "");
  const [phone, setPhone] = useState(merchant.contact_phone ?? "");
  const [email, setEmail] = useState(merchant.contact_email ?? "");
  const [slug, setSlug] = useState(merchant.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("");
    if (!legal.trim() || !display.trim()) {
      setMessage("Tên pháp lý và tên hiển thị là bắt buộc.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("admin_update_merchant", {
        p_merchant_id: merchant.id,
        p_legal_name: legal.trim(),
        p_display_name: display.trim(),
        p_business_type: type.trim() || null,
        p_contact_phone: phone.trim() || null,
        p_contact_email: email.trim() || null,
        p_slug: slug.trim() || null,
      });
      if (error) throw new Error(error.message);
      setMessage("Đã cập nhật hồ sơ và ghi audit log. Trạng thái onboarding không thay đổi.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể cập nhật cửa hàng.");
    } finally {
      setBusy(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: 9,
    border: "1px solid #dbe7de",
    borderRadius: 8,
    font: "inherit",
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          border: "1px solid #d5e5d9",
          borderRadius: 8,
          padding: "7px 10px",
          background: "#fff",
          color: "#13864b",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {open ? "Đóng chỉnh sửa" : "Sửa hồ sơ"}
      </button>
      {open && (
        <div
          style={{
            minWidth: 260,
            padding: 12,
            border: "1px solid #e0eae3",
            borderRadius: 10,
            display: "grid",
            gap: 8,
            background: "#fbfdfb",
          }}
        >
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Tên pháp lý
            <input value={legal} onChange={(event) => setLegal(event.target.value)} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Tên hiển thị
            <input value={display} onChange={(event) => setDisplay(event.target.value)} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Loại hình
            <input value={type} onChange={(event) => setType(event.target.value)} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Điện thoại
            <input value={phone} onChange={(event) => setPhone(event.target.value)} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>
            Slug
            <input value={slug} onChange={(event) => setSlug(event.target.value)} style={input} />
          </label>
          <button
            disabled={busy}
            onClick={save}
            style={{
              border: 0,
              borderRadius: 8,
              padding: 9,
              background: "#13864b",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {busy ? "Đang lưu…" : "Lưu hồ sơ"}
          </button>
        </div>
      )}
      {message && (
        <small role="status" style={{ color: "#16864b", maxWidth: 260 }}>
          {message}
        </small>
      )}
    </div>
  );
}
