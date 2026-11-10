import { PreviewModule } from "@/components/admin/preview-module";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const auditReaderRoles = ["platform_owner", "platform_admin", "finance_manager", "policy_reviewer"];
type SearchParams = Promise<{ actor?: string; action?: string; merchant?: string; from?: string; to?: string }>;

function label(value: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replaceAll(".", " · ");
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export default async function AuditLogPage({ searchParams }: { searchParams: SearchParams }) {
  if (process.env.VERCEL_ENV === "preview") return <PreviewModule module="audit" />;
  const filters = await searchParams;
  const actor = (filters.actor ?? "").trim();
  const action = (filters.action ?? "").trim().slice(0, 100);
  const merchant = (filters.merchant ?? "").trim();
  const from = datePattern.test(filters.from ?? "") ? filters.from! : "";
  const to = datePattern.test(filters.to ?? "") ? filters.to! : "";

  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,roles(code)").eq("user_id", user.id).is("revoked_at", null),
  ]);

  if (!profile || profile.status !== "active") {
    return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  }

  const roles = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  if (!roles.some((role) => auditReaderRoles.includes(role))) {
    return <main style={{ padding: 36 }}>Bạn không có quyền xem nhật ký kiểm toán.</main>;
  }

  let query = supabase.from("audit_events")
    .select("id,occurred_at,actor_user_id,actor_kind,action,resource_type,resource_id,merchant_id,outcome,reason,request_id,idempotency_key,metadata")
    .order("occurred_at", { ascending: false })
    .limit(200);

  if (uuidPattern.test(actor)) query = query.eq("actor_user_id", actor);
  if (uuidPattern.test(merchant)) query = query.eq("merchant_id", merchant);
  if (action) query = query.ilike("action", `%${action.replace(/[,%_]/g, "")}%`);
  if (from) query = query.gte("occurred_at", `${from}T00:00:00.000+07:00`);
  if (to) query = query.lte("occurred_at", `${to}T23:59:59.999+07:00`);

  const { data: events, error } = await query;
  const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #dbe7de", borderRadius: 9, font: "inherit" };

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
      <header style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <a href="/admin" style={{ color: "#13864b", fontWeight: 800 }}>XOÀI GO</a>
        <a href="/admin/merchants">Cửa hàng</a>
        <a href="/admin/members">Thành viên</a>
        <a href="/admin/approvals">Phê duyệt</a>
        <a href="/admin/policies">Chính sách</a>
        <a href="/admin/budgets">Ngân sách</a>
        <span style={{ color: "#13864b", fontWeight: 700 }}>Nhật ký hệ thống</span>
      </header>
      <section style={{ padding: 32, maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#16864b" }}>SECURITY & ACCOUNTABILITY</p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Nhật ký kiểm toán</h1>
        <p style={{ color: "#718176", fontSize: 14 }}>Nhật ký chỉ đọc, tối đa 200 sự kiện mới nhất theo bộ lọc.</p>
        <form method="get" style={{ marginTop: 20, padding: 18, background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>Actor user ID<input name="actor" defaultValue={actor} placeholder="UUID người thực hiện" style={input} /></label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>Loại thao tác<input name="action" defaultValue={action} placeholder="merchant.created" maxLength={100} style={input} /></label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>Merchant ID<input name="merchant" defaultValue={merchant} placeholder="UUID cửa hàng" style={input} /></label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>Từ ngày<input type="date" name="from" defaultValue={from} style={input} /></label>
          <label style={{ display: "grid", gap: 5, fontSize: 12, fontWeight: 700 }}>Đến ngày<input type="date" name="to" defaultValue={to} min={from || undefined} style={input} /></label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ border: 0, borderRadius: 9, padding: "10px 14px", background: "#13864b", color: "#fff", fontWeight: 700 }}>Lọc nhật ký</button>
            <a href="/admin/audit" style={{ alignSelf: "center", color: "#68796f", fontSize: 13 }}>Xóa lọc</a>
          </div>
        </form>
        <section style={{ marginTop: 24, background: "#fff", border: "1px solid #e0eae3", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #e8efe9", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <b>Sự kiện gần đây</b><span style={{ fontSize: 12, color: "#718176" }}>{events?.length ?? 0} sự kiện</span>
          </div>
          {error ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải nhật ký: {error.message}</p> : !events?.length ? (
            <div style={{ padding: 28, color: "#718176" }}>
              <b style={{ display: "block", color: "#173d2b", marginBottom: 6 }}>Không có sự kiện phù hợp</b>
              Thử bỏ bớt bộ lọc hoặc chọn khoảng thời gian khác.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ textAlign: "left", background: "#f8fbf8", color: "#718176" }}>
                  {["Thời gian", "Thao tác", "Đối tượng", "Actor", "Kết quả", "Lý do / Request", "Metadata"].map((heading) => <th key={heading} style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>{heading}</th>)}
                </tr></thead>
                <tbody>{events.map((event) => (
                  <tr key={event.id} style={{ borderTop: "1px solid #edf2ee" }}>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>{new Date(event.occurred_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}</td>
                    <td style={{ padding: "14px 16px" }}><b>{label(event.action)}</b></td>
                    <td style={{ padding: "14px 16px" }}>{label(event.resource_type)}<small style={{ display: "block", marginTop: 4, color: "#87948c" }}>{event.resource_id ?? "—"}{event.merchant_id ? ` · Merchant ${event.merchant_id.slice(0, 8)}…` : ""}</small></td>
                    <td style={{ padding: "14px 16px" }}>{event.actor_kind}<small style={{ display: "block", marginTop: 4, color: "#87948c" }}>{event.actor_user_id ? event.actor_user_id.slice(0, 8) + "…" : "System"}</small></td>
                    <td style={{ padding: "14px 16px" }}>{label(event.outcome)}</td>
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>{event.reason || event.request_id || event.idempotency_key || "—"}</td>
                    <td style={{ padding: "14px 16px", maxWidth: 320 }}><details><summary style={{ cursor: "pointer", color: "#16864b" }}>Xem</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 11 }}>{JSON.stringify(event.metadata, null, 2)}</pre></details></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <p style={{ marginTop: 16, color: "#87948c", fontSize: 12 }}>Trang này không cung cấp chức năng sửa hoặc xóa sự kiện. RLS tiếp tục kiểm soát quyền đọc ở database; bộ lọc chỉ thu hẹp kết quả phía truy vấn.</p>
      </section>
    </main>
  );
}
