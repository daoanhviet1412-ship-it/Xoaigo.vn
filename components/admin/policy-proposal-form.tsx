"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PolicySet = { id: string; code: string; name: string; description: string | null };

export function PolicyProposalForm({ policySets }: { policySets: PolicySet[] }) {
  const router = useRouter();
  const [policySetId, setPolicySetId] = useState(policySets[0]?.id ?? "");
  const [configText, setConfigText] = useState("{\n  \n}");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);

  async function submit() {
    setFeedback(null);
    if (!policySetId) {
      setFeedback({ message: "Chọn bộ chính sách cần đề xuất.", ok: false });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ message: "Cần ghi lý do đề xuất.", ok: false });
      return;
    }
    let proposedConfig: unknown;
    try {
      proposedConfig = JSON.parse(configText);
    } catch {
      setFeedback({ message: "Cấu hình phải là JSON hợp lệ.", ok: false });
      return;
    }
    if (!proposedConfig || typeof proposedConfig !== "object" || Array.isArray(proposedConfig)) {
      setFeedback({ message: "Cấu hình phải là một JSON object.", ok: false });
      return;
    }
    if (!window.confirm("Gửi đề xuất chính sách vào hàng đợi phê duyệt?")) return;

    setBusy(true);
    try {
      const supabase = createClient();
      const rpc = supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: string | null; error: { message: string } | null }>;
      const { data, error } = await rpc("submit_policy_approval_request", {
        p_policy_set_id: policySetId,
        p_proposed_config: proposedConfig,
        p_reason: reason.trim(),
      });
      if (error) throw new Error(error.message);
      setFeedback({ message: `Đã gửi đề xuất. Mã yêu cầu: ${data ?? "đã ghi nhận"}`, ok: true });
      setReason("");
      router.refresh();
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Không thể gửi đề xuất.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, padding: 22, display: "grid", gap: 14 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 19 }}>Tạo đề xuất chính sách</h2>
      <p style={{ color: "#718176", fontSize: 13, lineHeight: 1.6 }}>Đề xuất sẽ được ghi nhận để người có thẩm quyền khác xem xét. Gửi đề xuất không làm thay đổi chính sách đang áp dụng.</p>
    </div>
    <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>
      Bộ chính sách
      <select value={policySetId} onChange={e => setPolicySetId(e.target.value)} style={{ padding: 11, border: "1px solid #dbe7de", borderRadius: 9, background: "#fff" }}>
        {policySets.map(item => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
      </select>
    </label>
    <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>
      Cấu hình đề xuất (JSON)
      <textarea value={configText} onChange={e => setConfigText(e.target.value)} rows={9} spellCheck={false} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 12, border: "1px solid #dbe7de", borderRadius: 9, fontFamily: "monospace", fontSize: 12 }} />
    </label>
    <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>
      Lý do đề xuất (bắt buộc)
      <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={2000} placeholder="Nêu mục tiêu, căn cứ và nội dung cần xem xét…" style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 12, border: "1px solid #dbe7de", borderRadius: 9, font: "inherit" }} />
    </label>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button disabled={busy || !policySets.length} onClick={submit} style={{ border: 0, borderRadius: 9, padding: "11px 17px", background: "#13864b", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: busy || !policySets.length ? .6 : 1 }}>{busy ? "Đang gửi…" : "Gửi đề xuất phê duyệt"}</button>
      {!policySets.length && <span style={{ color: "#8a5b12", fontSize: 12 }}>Chưa có bộ chính sách để tạo đề xuất.</span>}
    </div>
    {feedback && <p role={feedback.ok ? "status" : "alert"} style={{ margin: 0, color: feedback.ok ? "#16864b" : "#b42318", fontSize: 13 }}>{feedback.message}</p>}
  </section>;
}
