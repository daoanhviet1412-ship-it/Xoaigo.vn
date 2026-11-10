import { PreviewModule } from "@/components/admin/preview-module";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const decisions = [
  {
    number: "01",
    title: "Chốt và giải phóng Pending",
    status: "Đã chốt",
    body: "Batch hằng ngày lúc 17:00, múi giờ Asia/Ho_Chi_Minh. Giao dịch trước 17:00 vào batch cùng ngày; giao dịch từ 17:00 trở đi vào batch ngày hôm sau. Xét nhả sớm nhất sau đủ 48 giờ liên tục kể từ timestamp chốt batch, chỉ khi tất cả điều kiện bảo đảm và kiểm soát đạt.",
  },
  {
    number: "02",
    title: "Nguồn bảo đảm Pending",
    status: "Đã chốt",
    body: "Chỉ dùng số dư Available của cửa hàng; không cấp hạn mức tín dụng mặc định. Khi số dư âm vẫn hiển thị số âm và cảnh báo cửa hàng nạp bổ sung. Không giải phóng Pending khi số dư không đủ bảo đảm.",
  },
  {
    number: "03",
    title: "Xác nhận giao dịch tại cửa hàng",
    status: "Đã chốt",
    body: "Khách quét QR cửa hàng, nhập số tiền, tự chọn số điểm muốn sử dụng nếu có; cửa hàng xác nhận giao dịch hoàn thành. Định hướng tích hợp POS/phần mềm bán hàng và phần mềm kế toán để đồng bộ giao dịch, công nợ và đối soát.",
  },
  {
    number: "04",
    title: "Số dư cửa hàng âm",
    status: "Đã chốt",
    body: "Cho phép hiển thị số dư âm. Không giải phóng Pending khi thiếu nguồn bảo đảm. Cảnh báo cửa hàng và Admin; không tự động kết luận gian lận chỉ vì số dư âm.",
  },
  {
    number: "05",
    title: "Nạp tiền và yêu cầu rút tiền",
    status: "Đã chốt quy trình",
    body: "Định hướng tích hợp ngân hàng để nhận diện và đối soát khoản nạp. Không chi rút trực tiếp tức thời: yêu cầu rút tạo trạng thái Pending và Giám đốc duyệt theo ngày. Điểm khách hàng vẫn không được quy đổi/rút thành tiền mặt; mọi loại số dư có thể rút (nếu có) phải được phân loại và rà soát pháp lý trước.",
  },
  {
    number: "06",
    title: "Đảo giao dịch sau khi điểm đã phát sinh",
    status: "Đã chốt",
    body: "Khi đảo giao dịch, trừ số điểm còn lại của khách; phần thiếu được ghi nhận thành shortfall để theo dõi. Không tự động yêu cầu khách nộp tiền. Điều chỉnh phải liên kết giao dịch gốc và giữ audit trail; không sửa/xóa entry gốc.",
  },
  {
    number: "07",
    title: "Làm tròn",
    status: "Đã chốt nguyên tắc",
    body: "Làm tròn từng cấu phần về đơn vị nguyên. Thuật toán xử lý phần dư cuối cùng còn chờ xác nhận kế toán/kỹ thuật; không tự hard-code khi chưa được duyệt.",
  },
  {
    number: "08",
    title: "Mở khóa tài khoản",
    status: "Đã chốt",
    body: "Tự động mở lại khi điều kiện số dư được khắc phục và không còn cờ rà soát. Nếu đang có discrepancy/review thì cần Admin hoặc cấp có thẩm quyền duyệt thủ công, có lưu lý do và audit.",
  },
];

export default async function ProductDecisionsPage() {
  if (process.env.VERCEL_ENV === "preview") return <PreviewModule module="product-decisions" />;
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: rolePermissions }] = await Promise.all([
    supabase.from("profiles").select("display_name,status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
  ]);

  if (profile?.status !== "active") {
    return <main style={{ padding: 36 }}><h1>Tài khoản chưa được kích hoạt</h1></main>;
  }

  const roles = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  const permissions = (rolePermissions ?? [])
    .filter((item) => roles.includes(item.roles?.code ?? ""))
    .map((item) => item.permissions?.code)
    .filter((value): value is string => Boolean(value));
  if (!permissions.includes("policies.read") && !permissions.includes("policies.write")) {
    return <main style={{ padding: 36 }}><h1>Không có quyền truy cập</h1><p>Tài khoản chưa được cấp quyền xem quyết định sản phẩm.</p></main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
      <header style={{ padding: "18px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <a href="/admin" style={{ color: "#13864b", fontWeight: 900, letterSpacing: 1.2 }}>XOÀI GO</a>
        <nav style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
          <a href="/admin">Tổng quan</a>
          <a href="/admin/finance-model">Mô hình tài chính</a>
          <a href="/admin/product-decisions" style={{ color: "#13864b", fontWeight: 800 }}>Quyết định sản phẩm</a>
          <a href="/admin/ledger">Sổ cái</a>
          <a href="/admin/points">Điểm</a>
          <a href="/admin/settlements">Công nợ</a>
        </nav>
        <span style={{ color: "#718176", fontSize: 12 }}>{profile.display_name || user.email}</span>
      </header>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "30px 24px 60px", display: "grid", gap: 18 }}>
        <div>
          <p style={{ margin: 0, color: "#16864b", fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>PRODUCT OWNER · DECISION REGISTER</p>
          <h1 style={{ margin: "8px 0", fontSize: 32, letterSpacing: -0.8 }}>Quyết định sản phẩm</h1>
          <p style={{ maxWidth: 820, margin: 0, color: "#718176", fontSize: 14, lineHeight: 1.7 }}>P32 · Phiên bản 1.0 · Cập nhật 09/11/2026. Đây là các quyết định nghiệp vụ đã được Product Owner xác nhận; không phải phê duyệt kế toán/pháp lý hoặc chỉ thị kích hoạt giao dịch thật.</p>
        </div>

        <section style={{ padding: 18, borderRadius: 14, border: "1px solid #f0dfb6", background: "#fff8e8", color: "#795a20", lineHeight: 1.7, fontSize: 13 }}>
          <b>Ranh giới Preview</b>
          <p style={{ margin: "6px 0 0" }}>Màn hình này chỉ hiển thị quyết định. Chưa phát hành điểm thật, chưa tự động nhả Pending, chưa ghi bút toán kế toán, chưa thực hiện payout/rút tiền và chưa chuyển tiền. Không có migration hoặc thay đổi dữ liệu nghiệp vụ live trong cập nhật này.</p>
        </section>

        <div style={{ display: "grid", gap: 12 }}>
          {decisions.map((item) => (
            <article key={item.number} style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 14, padding: 18, display: "grid", gridTemplateColumns: "44px 1fr", gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "#eaf5ee", color: "#17633c", display: "grid", placeItems: "center", fontWeight: 900 }}>{item.number}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 16 }}>{item.title}</h2>
                  <span style={{ fontSize: 10, color: "#17633c", background: "#edf6ef", padding: "4px 8px", borderRadius: 20, fontWeight: 800 }}>{item.status}</span>
                </div>
                <p style={{ margin: "8px 0 0", color: "#53675b", fontSize: 13, lineHeight: 1.75 }}>{item.body}</p>
              </div>
            </article>
          ))}
        </div>

        <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 14, padding: 18, display: "grid", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Các mục còn chờ</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#53675b", fontSize: 13, lineHeight: 1.8 }}>
            <li>Mục 9: đồng bộ production/main hay tiếp tục giữ nguyên — Product Owner chưa chọn.</li>
            <li>Migration 0025, bật Leaked Password Protection và tạo checker account — chưa được phê duyệt trong lượt này.</li>
            <li>COA, bản chất pháp lý của số dư/công nợ, đối tác ngân hàng/thanh toán và loại số dư được phép rút — chờ chuyên môn xác nhận.</li>
            <li>Thuật toán phần dư khi làm tròn, nguồn bằng chứng giao dịch QR và điều kiện mở khóa chi tiết — cần đặc tả kỹ thuật.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
