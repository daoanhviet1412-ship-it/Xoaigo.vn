import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PolicyProposalForm } from "@/components/admin/policy-proposal-form";

export default async function PoliciesPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: policySets, error }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("policy_sets").select("id,code,name,description").order("name"),
  ]);

  if (profile?.status !== "active") return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  const roleCodes = (grants ?? []).map(grant => grant.roles?.code).filter((value): value is string => Boolean(value));
  const canRead = roleCodes.includes("platform_owner") || roleCodes.includes("policy_reviewer") || roleCodes.includes("platform_admin");
  const canSubmit = roleCodes.includes("platform_owner");
  if (!canRead) return <main style={{ padding: 36 }}>Bạn không có quyền xem danh mục chính sách.</main>;

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
        <p style={{ color: "#718176", fontSize: 14, lineHeight: 1.7 }}>Danh mục hiện có được đọc từ cơ sở dữ liệu. Chưa có quy tắc chiết khấu, điểm thưởng hoặc tỷ lệ ưu đãi nào được tự đặt trong giao diện.</p>
      </div>
      <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid #e8efe9", fontWeight: 700 }}>Các bộ chính sách ({policySets?.length ?? 0})</div>
        {error ? <p style={{ padding: 20, color: "#b42318" }}>Không thể tải danh mục: {error.message}</p> : !policySets?.length ? <p style={{ padding: 20, color: "#718176" }}>Chưa có bộ chính sách nào được tạo.</p> : <div style={{ display: "grid", gap: 0 }}>
          {policySets.map(item => <article key={item.id} style={{ padding: 18, borderBottom: "1px solid #edf2ee" }}>
            <b>{item.name}</b><span style={{ marginLeft: 10, color: "#16864b", fontSize: 12 }}>{item.code}</span>
            <p style={{ margin: "6px 0 0", color: "#718176", fontSize: 13 }}>{item.description || "Chưa có mô tả."}</p>
          </article>)}
        </div>}
      </section>
      {canSubmit && <PolicyProposalForm policySets={policySets ?? []} />}
      {!canSubmit && <p style={{ color: "#718176", fontSize: 13 }}>Tài khoản có quyền xem danh mục nhưng không có quyền gửi đề xuất chính sách.</p>}
      <p style={{ color: "#87948c", fontSize: 12 }}>Mọi đề xuất được lưu ở trạng thái chờ duyệt. Chấp thuận hiện chỉ ghi nhận quyết định, chưa tự kích hoạt cấu hình.</p>
    </section>
  </main>;
}
