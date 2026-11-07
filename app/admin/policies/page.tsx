import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PolicyRegistryActions } from "@/components/admin/policy-proposal-form";

export default async function PoliciesPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: policySets, error }, { data: versions, error: versionError }] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("policy_sets").select("id,code,name,description").order("name"),
    supabase.from("policy_versions").select("id,policy_set_id,version,status,effective_from,effective_until,created_at,config").order("created_at", { ascending: false }).limit(100),
  ]);

  if (profile?.status !== "active") return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  const roleCodes = (grants ?? []).map(grant => grant.roles?.code).filter((value): value is string => Boolean(value));
  const canRead = roleCodes.includes("platform_owner") || roleCodes.includes("policy_reviewer") || roleCodes.includes("platform_admin");
  const canWrite = roleCodes.includes("platform_owner");
  if (!canRead) return <main style={{ padding: 36 }}>Bạn không có quyền xem danh mục chính sách.</main>;

  const setNames = new Map((policySets ?? []).map(item => [item.id, item.name]));
  return <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
    <header style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", gap: 18, flexWrap: "wrap" }}>
      <a href="/admin" style={{ color: "#13864b", fontWeight: 800 }}>XOÀI GO</a>
      <a href="/admin/merchants">Cửa hàng</a><a href="/admin/members">Thành viên</a><a href="/admin/approvals">Phê duyệt</a><a href="/admin/audit">Nhật ký</a>
      <span style={{ color: "#13864b", fontWeight: 700 }}>Chính sách</span>
    </header>
    <section style={{ padding: 32, maxWidth: 1180, margin: "0 auto", display: "grid", gap: 22 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#16864b" }}>POLICY REGISTRY</p>
        <h1 style={{ fontSize: 32, margin: "8px 0" }}>Danh mục chính sách</h1>
        <p style={{ color: "#718176", fontSize: 14, lineHeight: 1.7 }}>Quản lý danh mục và phiên bản. Bản nháp hoặc yêu cầu được duyệt không tự động có hiệu lực; không có quy tắc kinh doanh nào được tự đặt.</p>
      </div>
      <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #e8efe9", fontWeight: 700 }}>Các bộ chính sách ({policySets?.length ?? 0})</div>
        {error ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải danh mục: {error.message}</p> : !policySets?.length ? <p style={{ padding: 20, color: "#718176" }}>Chưa có bộ chính sách nào. Người có quyền ghi có thể tạo danh mục sau khi nghiệp vụ được xác định.</p> : (policySets ?? []).map(item => <article key={item.id} style={{ padding: 18, borderBottom: "1px solid #edf2ee" }}><b>{item.name}</b><span style={{ marginLeft: 10, color: "#16864b", fontSize: 12 }}>{item.code}</span><p style={{ margin: "6px 0 0", color: "#718176", fontSize: 13 }}>{item.description || "Chưa có mô tả."}</p></article>)}
      </section>
      <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #e8efe9", fontWeight: 700 }}>Lịch sử phiên bản ({versions?.length ?? 0})</div>
        {versionError ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải phiên bản: {versionError.message}</p> : !versions?.length ? <p style={{ padding: 20, color: "#718176" }}>Chưa có phiên bản chính sách.</p> : <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ textAlign: "left", background: "#f8fbf8" }}>{["Bộ chính sách", "Phiên bản", "Trạng thái", "Hiệu lực từ", "Hiệu lực đến", "Tạo lúc"].map(h => <th key={h} style={{ padding: 12 }}>{h}</th>)}</tr></thead><tbody>{versions.map(v => <tr key={v.id} style={{ borderTop: "1px solid #edf2ee" }}><td style={{ padding: 12 }}>{setNames.get(v.policy_set_id) ?? v.policy_set_id}</td><td style={{ padding: 12 }}>v{v.version}</td><td style={{ padding: 12 }}>{v.status}</td><td style={{ padding: 12 }}>{v.effective_from ? new Date(v.effective_from).toLocaleString("vi-VN") : "—"}</td><td style={{ padding: 12 }}>{v.effective_until ? new Date(v.effective_until).toLocaleString("vi-VN") : "—"}</td><td style={{ padding: 12 }}>{new Date(v.created_at).toLocaleString("vi-VN")}</td></tr>)}</tbody></table></div>}
      </section>
      {canWrite ? <PolicyRegistryActions policySets={policySets ?? []} /> : <p style={{ color: "#718176", fontSize: 13 }}>Tài khoản chỉ có quyền xem. Không có quyền tạo hoặc sửa bản nháp.</p>}
      <p style={{ color: "#87948c", fontSize: 12 }}>Chấp thuận hiện chỉ ghi nhận quyết định. Việc chuyển phiên bản sang trạng thái approved/hiệu lực cần quy trình thực thi riêng và điều kiện nghiệp vụ được xác nhận.</p>
    </section>
  </main>;
}
