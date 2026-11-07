import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const auditReaderRoles = ["platform_owner", "platform_admin", "finance_manager", "policy_reviewer"];

function label(value: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replaceAll(".", " · ");
}

export default async function AuditLogPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: events, error }] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("id,roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("audit_events").select("id,occurred_at,actor_user_id,actor_kind,action,resource_type,resource_id,outcome,reason,request_id").order("occurred_at", { ascending: false }).limit(100),
  ]);

  if (!profile || profile.status !== "active") {
    return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  }

  const roles = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  if (!roles.some((role) => auditReaderRoles.includes(role))) {
    return <main style={{ padding: 36 }}>Bạn không có quyền xem nhật ký kiểm toán.</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
      <header style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <a href="/admin" style={{ color: "#13864b", fontWeight: 800 }}>XOÀI GO</a>
        <a href="/admin/merchants">Cửa hàng</a>
        <a href="/admin/members">Thành viên</a>
        <span style={{ color: "#13864b", fontWeight: 700 }}>Nhật ký hệ thống</span>
      </header>
      <section style={{ padding: 32, maxWidth: 1280, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#16864b" }}>SECURITY & ACCOUNTABILITY</p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Nhật ký kiểm toán</h1>
        <p style={{ color: "#718176", fontSize: 14 }}>Nhật ký chỉ đọc, ghi nhận các thao tác quản trị và kết quả xử lý. Tối đa 100 sự kiện mới nhất.</p>
        <section style={{ marginTop: 24, background: "#fff", border: "1px solid #e0eae3", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #e8efe9", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <b>Sự kiện gần đây</b><span style={{ fontSize: 12, color: "#718176" }}>{events?.length ?? 0} sự kiện</span>
          </div>
          {error ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải nhật ký: {error.message}</p> : !events?.length ? (
            <div style={{ padding: 28, color: "#718176" }}>
              <b style={{ display: "block", color: "#173d2b", marginBottom: 6 }}>Chưa có sự kiện kiểm toán</b>
              Nhật ký sẽ xuất hiện khi có thao tác được thực hiện qua các lệnh quản trị đã tích hợp.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ textAlign: "left", background: "#f8fbf8", color: "#718176" }}>
                  {["Thời gian", "Thao tác", "Đối tượng", "Actor", "Kết quả", "Lý do / Request"].map((heading) => <th key={heading} style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>{heading}</th>)}
                </tr></thead>
                <tbody>{events.map((event) => (
                  <tr key={event.id} style={{ borderTop: "1px solid #edf2ee" }}>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>{new Date(event.occurred_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td style={{ padding: "14px 16px" }}><b>{label(event.action)}</b></td>
                    <td style={{ padding: "14px 16px" }}>{label(event.resource_type)}<small style={{ display: "block", marginTop: 4, color: "#87948c" }}>{event.resource_id ?? "—"}</small></td>
                    <td style={{ padding: "14px 16px" }}>{event.actor_kind}<small style={{ display: "block", marginTop: 4, color: "#87948c" }}>{event.actor_user_id ? event.actor_user_id.slice(0, 8) + "…" : "System"}</small></td>
                    <td style={{ padding: "14px 16px" }}>{label(event.outcome)}</td>
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>{event.reason || event.request_id || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
        <p style={{ marginTop: 16, color: "#87948c", fontSize: 12 }}>Trang này không cung cấp chức năng sửa hoặc xóa sự kiện. Quyền đọc dữ liệu tiếp tục được kiểm soát ở database bằng RLS.</p>
      </section>
    </main>
  );
}
