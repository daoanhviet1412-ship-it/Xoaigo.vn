"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ApprovalItem = {
  id: string;
  request_type: string;
  resource_type: string;
  resource_id: string | null;
  proposed_payload: unknown;
  reason: string;
  status: string;
  requested_at: string;
  requested_by: string;
  requester_name: string | null;
};

export function ApprovalReviewQueue({ items }: { items: ApprovalItem[] }) {
  const router = useRouter();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; ok: boolean } | null>(null);

  async function decide(item: ApprovalItem, decision: "approved" | "rejected") {
    const reason = (reasons[item.id] || "").trim();
    if (!reason) {
      setFeedback({ id: item.id, message: "Cần ghi lý do xử lý trước khi xác nhận.", ok: false });
      return;
    }
    const confirmation = decision === "approved" ? "Chấp thuận yêu cầu này?" : "Từ chối yêu cầu này?";
    if (!window.confirm(confirmation)) return;

    setBusyId(item.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      const rpc = supabase.rpc as unknown as (
        fn: string,
        args: Record<string, string>
      ) => Promise<{ error: { message: string } | null }>;
      const { error } = await rpc("review_approval_request", {
        p_request_id: item.id,
        p_decision: decision,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
      setFeedback({
        id: item.id,
        message: decision === "approved" ? "Đã ghi nhận chấp thuận." : "Đã ghi nhận từ chối.",
        ok: true,
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        id: item.id,
        message: error instanceof Error ? error.message : "Không thể xử lý yêu cầu.",
        ok: false,
      });
    } finally {
      setBusyId(null);
    }
  }

  if (!items.length) {
    return <div style={{ padding: 28, color: "#718176" }}>
      <b style={{ display: "block", color: "#173d2b", marginBottom: 6 }}>Không có yêu cầu chờ duyệt</b>
      Khi có yêu cầu mới, chúng sẽ xuất hiện tại hàng đợi này.
    </div>;
  }

  return <div style={{ display: "grid", gap: 14, padding: 18 }}>
    {items.map((item) => (
      <article key={item.id} style={{ border: "1px solid #e3ece5", borderRadius: 14, padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <b style={{ color: "#173d2b" }}>{item.request_type.replaceAll("_", " ")}</b>
            <div style={{ color: "#718176", fontSize: 12, marginTop: 5 }}>{item.resource_type} · {item.resource_id || "Chưa gắn đối tượng"}</div>
          </div>
          <span style={{ fontSize: 12, color: "#8a5b12", background: "#fff5df", borderRadius: 20, padding: "5px 10px", height: "fit-content" }}>Chờ duyệt</span>
        </div>
        <div style={{ color: "#5d6d63", fontSize: 13, lineHeight: 1.6 }}>
          <div><b>Người gửi:</b> {item.requester_name || item.requested_by}</div>
          <div><b>Thời gian:</b> {new Date(item.requested_at).toLocaleString("vi-VN")}</div>
          <div><b>Lý do đề xuất:</b> {item.reason}</div>
        </div>
        <details>
          <summary style={{ cursor: "pointer", color: "#16864b", fontSize: 13, fontWeight: 700 }}>Xem nội dung đề xuất</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#f7faf7", padding: 14, borderRadius: 10, fontSize: 12, color: "#425349" }}>{JSON.stringify(item.proposed_payload, null, 2)}</pre>
        </details>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#425349" }}>
          Lý do xử lý (bắt buộc)
          <textarea value={reasons[item.id] || ""} onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} rows={2} maxLength={1000} placeholder="Ghi căn cứ chấp thuận hoặc lý do từ chối…" style={{ width: "100%", resize: "vertical", border: "1px solid #dbe7de", borderRadius: 10, padding: 11, font: "inherit" }} />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button disabled={busyId === item.id} onClick={() => decide(item, "approved")} style={{ border: 0, borderRadius: 9, padding: "10px 15px", background: "#13864b", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: busyId === item.id ? .6 : 1 }}>Chấp thuận</button>
          <button disabled={busyId === item.id} onClick={() => decide(item, "rejected")} style={{ border: "1px solid #e6caca", borderRadius: 9, padding: "10px 15px", background: "#fff", color: "#a33b32", fontWeight: 700, cursor: "pointer", opacity: busyId === item.id ? .6 : 1 }}>Từ chối</button>
          {busyId === item.id && <span style={{ alignSelf: "center", color: "#718176", fontSize: 12 }}>Đang xử lý…</span>}
        </div>
        {feedback?.id === item.id && <p role={feedback.ok ? "status" : "alert"} style={{ margin: 0, color: feedback.ok ? "#16864b" : "#b42318", fontSize: 12 }}>{feedback.message}</p>}
      </article>
    ))}
  </div>;
}
