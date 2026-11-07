import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApprovalReviewQueue } from "@/components/admin/approval-review-queue";

export default async function ApprovalsPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: requests, error }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("approval_requests")
      .select("id,request_type,resource_type,resource_id,proposed_payload,reason,status,requested_at,requested_by,requester:profiles!approval_requests_requested_by_fkey(display_name)")
      .eq("status", "pending")
      .order("requested_at", { ascending: true })
      .limit(100),
  ]);

  if (profile?.status !== "active") return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  const roleCodes = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  const canReview = roleCodes.includes("platform_owner") || roleCodes.includes("policy_reviewer");
  const canRead = canReview || roleCodes.includes("platform_admin") || roleCodes.includes("finance_manager") || roleCodes.includes("ops_manager");
  if (!canRead) return <main style={{ padding: 36 }}>Bạn không có quyền xem hàng đợi phê duyệt.</main>;

  const items = (requests ?? []).map((request) => ({
    id: request.id,
    request_type: request.request_type,
    resource_type: request.resource_type,
    resource_id: request.resource_id,
    proposed_payload: request.proposed_payload,
    reason: request.reason,
    status: request.status,
    requested_at: request.requested_at,
    requested_by: request.requested_by,
    requester_name: Array.isArray(request.requester) ? request.requester[0]?.display_name ?? null : request.requester?.display_name ?? null,
  }));

  return <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
    <header style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", gap: 18, flexWrap: "wrap" }}>
      <a href="/admin" style={{ color: "#13864b", fontWeight: 800 }}>XOÀI GO</a>
      <a href="/admin/merchants">Cửa hàng</a><a href="/admin/members">Thành viên</a>
      <span style={{ color: "#13864b", fontWeight: 700 }}>Phê duyệt</span><a href="/admin/audit">Nhật ký</a>
    </header>
    <section style={{ padding: 32, maxWidth: 1180, margin: "0 auto" }}>
      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#16864b" }}>GOVERNANCE & MAKER-CHECKER</p>
      <h1 style={{ fontSize: 32, margin: "8px 0" }}>Hàng đợi phê duyệt</h1>
      <p style={{ color: "#718176", fontSize: 14, lineHeight: 1.7 }}>Mỗi quyết định yêu cầu lý do và được ghi vào nhật ký bất biến. Người tạo không thể tự duyệt yêu cầu của mình.</p>
      {!canReview && <div style={{ padding: 14, background: "#fff5df", color: "#80551a", borderRadius: 12, marginTop: 18, fontSize: 13 }}>Tài khoản có quyền xem nhưng không có quyền chấp thuận hoặc từ chối.</div>}
      <section style={{ marginTop: 24, background: "#fff", border: "1px solid #e0eae3", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #e8efe9", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <b>Yêu cầu đang chờ</b><span style={{ color: "#718176", fontSize: 12 }}>{items.length} yêu cầu</span>
        </div>
        {error ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải hàng đợi: {error.message}</p> : canReview ? <ApprovalReviewQueue items={items} /> : !items.length ? <p style={{ padding: 24, color: "#718176" }}>Không có yêu cầu chờ duyệt.</p> : <div style={{ padding: 20, color: "#718176", fontSize: 13 }}>Bạn có thể xem hàng đợi nhưng không được quyền xử lý.</div>}
      </section>
      <p style={{ marginTop: 16, color: "#87948c", fontSize: 12 }}>Lưu ý: Chấp thuận ở đây chỉ ghi nhận quyết định phê duyệt. Hệ thống chưa tự thực thi payload, kích hoạt chính sách hay phát sinh nghiệp vụ tài chính.</p>
    </section>
  </main>;
}
