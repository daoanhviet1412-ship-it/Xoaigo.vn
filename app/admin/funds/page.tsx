import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function CountCard({ label, value, note }: { label: string; value: number | null; note: string }) {
  return (
    <article style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, padding: 18, display: "grid", gap: 8 }}>
      <div style={{ color: "#718176", fontSize: 12, fontWeight: 700 }}>{label}</div>
      <strong style={{ color: "#173d2b", fontSize: 27 }}>{value === null ? "—" : value.toLocaleString("vi-VN")}</strong>
      <div style={{ color: "#87948c", fontSize: 12, lineHeight: 1.5 }}>{note}</div>
    </article>
  );
}

function SourceCard({ title, status, detail }: { title: string; status: string; detail: string }) {
  return (
    <article style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, padding: 18, display: "grid", gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      <span style={{ width: "fit-content", borderRadius: 20, padding: "5px 10px", background: "#fff5df", color: "#8a5b12", fontSize: 11, fontWeight: 700 }}>{status}</span>
      <p style={{ margin: 0, color: "#718176", fontSize: 13, lineHeight: 1.65 }}>{detail}</p>
    </article>
  );
}

export default async function FundsPage() {
  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Preview chưa cấu hình Supabase.</main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: profile }, { data: grants }, { data: rolePermissions }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", user.id).maybeSingle(),
    supabase.from("user_role_grants").select("roles(code)").eq("user_id", user.id).is("revoked_at", null),
    supabase.from("role_permissions").select("roles(code),permissions(code)"),
  ]);

  if (profile?.status !== "active") return <main style={{ padding: 36 }}>Tài khoản chưa được kích hoạt.</main>;
  const roles = (grants ?? []).map((grant) => grant.roles?.code).filter((value): value is string => Boolean(value));
  const permissions = (rolePermissions ?? [])
    .filter((item) => roles.includes(item.roles?.code ?? ""))
    .map((item) => item.permissions?.code)
    .filter((value): value is string => Boolean(value));

  const canBudgets = permissions.includes("budgets.read");
  const canLedger = permissions.includes("ledger.read");
  const canReconciliation = permissions.includes("reconciliation.read");
  const canSettlements = permissions.includes("settlement.read");
  if (!canBudgets && !canLedger && !canReconciliation && !canSettlements) {
    return <main style={{ padding: 36 }}>Bạn không có quyền xem tổng quan nguồn tiền.</main>;
  }

  const [approvalCount, campaignCount, journalCount, batchCount, obligationCount, settlementCount] = await Promise.all([
    canBudgets ? supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("request_type", "marketing_budget_proposal") : Promise.resolve({ count: null, error: null }),
    canBudgets ? supabase.from("marketing_campaigns").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
    canLedger ? supabase.from("journal_transactions").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
    canReconciliation ? supabase.from("reconciliation_batches").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
    canSettlements ? supabase.from("merchant_obligations").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
    canSettlements ? supabase.from("settlement_batches").select("id", { count: "exact", head: true }) : Promise.resolve({ count: null, error: null }),
  ]);

  const fmt = (count: number | null | undefined) => typeof count === "number" ? count : null;

  return (
    <main style={{ minHeight: "100vh", background: "#f5f8f5", color: "#173d2b", fontFamily: "Arial,sans-serif" }}>
      <header style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e0eae3", display: "flex", gap: 18, flexWrap: "wrap" }}>
        <a href="/admin" style={{ color: "#13864b", fontWeight: 800 }}>XOÀI GO</a>
        <a href="/admin/budgets">Ngân sách marketing</a>
        <a href="/admin/reconciliation">Đối soát</a>
        <a href="/admin/ledger">Sổ cái</a>
        <a href="/admin/settlements">Công nợ & quyết toán</a>
        <a href="/admin/audit">Nhật ký</a>
      </header>

      <section style={{ padding: 32, maxWidth: 1180, margin: "0 auto", display: "grid", gap: 22 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#16864b" }}>FUNDS & LIQUIDITY CONTROL</p>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>Nguồn tiền & thanh khoản</h1>
          <p style={{ color: "#718176", fontSize: 14, lineHeight: 1.7, maxWidth: 820 }}>
            Tổng quan phân loại nguồn tiền theo nguyên tắc Product Owner: tiền đặt cọc được theo dõi riêng để bảo đảm nghĩa vụ hoàn trả; tiền marketing do công ty quản lý và phân phối theo chương trình được duyệt; tiền gốc ngân hàng được bảo toàn; lãi ngân hàng thực nhận được theo dõi riêng.
          </p>
        </div>

        <section style={{ background: "#fff8e8", border: "1px solid #f0dfb6", borderRadius: 14, padding: 16, color: "#795a20", fontSize: 13, lineHeight: 1.65 }}>
          <strong>Chế độ kiểm soát — chưa vận hành số dư.</strong> Trang này chỉ đọc các số lượng bản ghi hiện có. Chưa có sổ tiền đặt cọc, sổ ngân sách marketing thực nhận/phân bổ, bank register, lãi tiền gửi hoặc liquidity calculation. Không có số dư tiền nào được ước tính hay dựng giả.
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
          {canBudgets && <CountCard label="Đề xuất ngân sách marketing" value={fmt(approvalCount.count)} note="Số yêu cầu xin duyệt; không phải ngân sách đã cấp." />}
          {canBudgets && <CountCard label="Chiến dịch" value={fmt(campaignCount.count)} note="Số campaign records; không phản ánh tiền đã phân phối." />}
          {canLedger && <CountCard label="Bút toán sổ cái" value={fmt(journalCount.count)} note="Số journal transaction records; không đồng nghĩa số dư khả dụng." />}
          {canReconciliation && <CountCard label="Đợt đối soát" value={fmt(batchCount.count)} note="Số reconciliation batches; chưa có bank statement connector." />}
          {canSettlements && <CountCard label="Nghĩa vụ merchant" value={fmt(obligationCount.count)} note="Số obligation records; chưa xác nhận thanh toán thực tế." />}
          {canSettlements && <CountCard label="Đợt quyết toán" value={fmt(settlementCount.count)} note="Số settlement batches; chưa có payout execution." />}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <SourceCard title="Tiền đặt cọc merchant" status="Chưa có sổ nguồn tiền" detail="Cần deposit lot theo merchant/hợp đồng, điều kiện hoàn, điểm/quyền lợi liên quan và khoản khấu trừ hợp lệ. Không trộn vào ngân sách marketing." />
          <SourceCard title="Tiền marketing merchant" status="Mới có đề xuất xin duyệt" detail="Công ty quản lý và chủ động phân phối theo campaign/merchant sau khi xác minh tiền thực nhận và được duyệt. Hiện chưa có số dư marketing fund thực tế." />
          <SourceCard title="Phân bổ marketing" status="Chưa có allocation ledger" detail="Cần theo dõi unallocated, allocated, committed, consumed, remaining và reversal. Approval hiện tại chỉ ghi quyết định, chưa cấp ngân sách." />
          <SourceCard title="Tiền gốc gửi ngân hàng" status="Chưa có bank register" detail="Cần theo dõi tài khoản, khoản tiền gửi, gốc, kỳ hạn, ngày đáo hạn, điều kiện rút trước hạn và khả năng thu hồi." />
          <SourceCard title="Lãi ngân hàng" status="Chưa có interest register" detail="Chỉ lãi thực nhận mới được ghi nhận riêng và xem xét rút cho vận hành; lãi dự thu không phải tiền khả dụng." />
          <SourceCard title="Dự phòng thanh khoản" status="Chưa có liquidity engine" detail="Cần tính nghĩa vụ hoàn cọc, ngân sách marketing đã cam kết, redemption/payout, reserve tối thiểu và tiền có thể thu hồi đúng hạn." />
        </div>

        <section style={{ background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, padding: 20, display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Lộ trình kích hoạt</h2>
          <ol style={{ margin: 0, paddingLeft: 20, color: "#5d6d63", fontSize: 13, lineHeight: 1.9 }}>
            <li>Hoàn thiện source model cho deposit và marketing fund.</li>
            <li>Thiết kế allocation ledger và approval command; không cấp tiền chỉ bằng thao tác giao diện.</li>
            <li>Thiết kế bank register, interest register và liquidity reserve.</li>
            <li>Kết nối dữ liệu nguồn và nâng cấp reconciliation matching/discrepancy.</li>
            <li>Kiểm thử maker-checker, RLS, idempotency, concurrency và liquidity guard trước khi mở ghi.</li>
          </ol>
        </section>
      </section>
    </main>
  );
}
