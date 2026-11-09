import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FinanceModelStudio } from "@/components/admin/finance-model-studio";

export default async function FinanceModelPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: rolePermissions }, { data: policySets, error }] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
    supabase.from("policy_sets").select("id,code,name").order("name"),
  ]);

  if (profile?.status !== "active") {
    return <main style={{ padding: 36, color: "#173d2b" }}><h1>Tài khoản chưa được kích hoạt</h1><p>Quyền truy cập quản trị đã bị từ chối.</p></main>;
  }

  const roles = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  const permissions = (rolePermissions ?? [])
    .filter((item) => roles.includes(item.roles?.code ?? ""))
    .map((item) => item.permissions?.code)
    .filter((value): value is string => Boolean(value));
  const canWrite = permissions.includes("policies.write");
  const canRead = permissions.includes("policies.read") || canWrite;

  if (!canRead) {
    return <main style={{ padding: 36, color: "#173d2b" }}><h1>Không có quyền truy cập</h1><p>Tài khoản của bạn chưa được cấp quyền xem cấu hình chính sách.</p></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
      <header style={{ padding: "18px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <a href="/admin" style={{ color: "#13864b", fontWeight: 900, letterSpacing: 1.2 }}>XOÀI GO</a>
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
          <a href="/admin">Tổng quan</a>
          <a href="/admin/merchants">Cửa hàng</a>
          <a href="/admin/policies">Chính sách</a>
          <a href="/admin/finance-model" style={{ color: "#13864b", fontWeight: 800 }}>Mô hình tài chính</a><a href="/admin/product-decisions">Quyết định sản phẩm</a>
          <a href="/admin/points">Điểm</a>
          <a href="/admin/ledger">Sổ cái</a>
          <a href="/admin/funds">Nguồn tiền</a>
          <a href="/admin/settlements">Công nợ</a>
        </nav>
        <span style={{ color: "#718176", fontSize: 12 }}>{profile.display_name || user.email}</span>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 24px 60px", display: "grid", gap: 20 }}>
        <div>
          <p style={{ margin: 0, color: "#16864b", fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>PRODUCT OWNER · FINANCE CONFIGURATION</p>
          <h1 style={{ margin: "8px 0", fontSize: 32, letterSpacing: -0.8 }}>Mô hình phân bổ phí & điểm thưởng</h1>
          <p style={{ maxWidth: 850, margin: 0, color: "#718176", fontSize: 14, lineHeight: 1.7 }}>
            Cấu hình tỷ lệ riêng theo cửa hàng hoặc chương trình, mô phỏng giao dịch tiền thật kết hợp điểm, sau đó lưu phiên bản nháp để theo dõi và rà soát.
          </p>
        </div>

        {error && <div style={{ padding: 14, borderRadius: 10, background: "#fff0ee", color: "#a22b24", fontSize: 13 }}>Không tải được danh mục chính sách: {error.message}. Bạn vẫn có thể mô phỏng nhưng chưa thể lưu bản nháp.</div>}

        <FinanceModelStudio policySets={policySets ?? []} canWrite={canWrite && !error} />

        <p style={{ margin: 0, color: "#87948c", fontSize: 11, lineHeight: 1.7 }}>
          Trạng thái hệ thống: cấu trúc sổ cái, điểm, nghĩa vụ cửa hàng và quyết toán hiện là nền tảng dữ liệu. Trang này chưa phát sinh giao dịch thật, chưa tự động tính công nợ, chưa chuyển tiền và chưa thay thế việc kế toán/pháp lý phê duyệt mô hình.
        </p>
      </section>
    </main>
  );
}
