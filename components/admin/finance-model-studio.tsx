"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PolicySet = { id: string; code: string; name: string };

type Props = {
  policySets: PolicySet[];
  canWrite: boolean;
};

type RpcResult = { data: string | null; error: { message: string } | null };

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(value)) + "đ";
const points = (value: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(value));

const pct = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value) + "%";

function localDateTimeValue() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function FinanceModelStudio({ policySets, canWrite }: Props) {
  const router = useRouter();
  const [scopeType, setScopeType] = useState("merchant");
  const [scopeName, setScopeName] = useState("Cửa hàng A");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveUntil, setEffectiveUntil] = useState("");
  const [cashCustomerRate, setCashCustomerRate] = useState<number | null>(null);
  const [cashXoaiRate, setCashXoaiRate] = useState<number | null>(null);
  const [pointsRedemptionRate, setPointsRedemptionRate] = useState<number | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState(1000000);
  const [cashPaid, setCashPaid] = useState(700000);
  const [pointsPaid, setPointsPaid] = useState(300000);
  const [selectedPolicySet, setSelectedPolicySet] = useState(policySets[0]?.id ?? "");
  const [newSetCode, setNewSetCode] = useState("xoai_reward_allocation");
  const [newSetName, setNewSetName] = useState("Chính sách phân bổ phí & điểm thưởng");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [savedId, setSavedId] = useState("");

  useEffect(() => { setEffectiveFrom(localDateTimeValue()); }, []);

  const cashAllocationRate = (cashCustomerRate ?? 0) + (cashXoaiRate ?? 0);
  const amountValid = Number.isInteger(invoiceAmount) && Number.isInteger(cashPaid) && Number.isInteger(pointsPaid) && invoiceAmount >= 0 && cashPaid >= 0 && pointsPaid >= 0 &&
    Math.round(cashPaid + pointsPaid) === Math.round(invoiceAmount);
  const ratesValid = [cashCustomerRate, cashXoaiRate, pointsRedemptionRate].every(
    (rate) => rate !== null && Number.isFinite(rate) && rate >= 0 && rate <= 100
  ) && cashAllocationRate <= 100;
  const datesValid = Boolean(effectiveFrom) &&
    (!effectiveUntil || new Date(effectiveUntil).getTime() > new Date(effectiveFrom).getTime());

  const result = useMemo(() => {
    const earnedPoints = cashPaid * (cashCustomerRate ?? 0) / 100;
    const xoaiCashRevenue = cashPaid * (cashXoaiRate ?? 0) / 100;
    const xoaiPointsRevenue = pointsPaid * (pointsRedemptionRate ?? 0) / 100;
    const cashAllocation = earnedPoints + xoaiCashRevenue;
    const pointsAllocation = xoaiPointsRevenue;
    const totalAllocation = cashAllocation + pointsAllocation;
    return {
      earnedPoints,
      xoaiCashRevenue,
      xoaiPointsRevenue,
      totalXoaiRevenue: xoaiCashRevenue + xoaiPointsRevenue,
      cashAllocation,
      pointsAllocation,
      totalAllocation,
      merchantWalletCredit: pointsPaid,
      merchantWalletNet: pointsPaid - totalAllocation,
      customerPointsNet: earnedPoints - pointsPaid,
    };
  }, [cashPaid, cashCustomerRate, cashXoaiRate, pointsPaid, pointsRedemptionRate]);

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: "1px solid #dce7df",
    borderRadius: 10, padding: "11px 12px", font: "inherit", color: "#173d2b",
    background: "#fff",
  };
  const labelStyle: React.CSSProperties = {
    display: "grid", gap: 7, color: "#53675b", fontSize: 12, fontWeight: 700,
  };
  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e0eae3", borderRadius: 16, padding: 20,
  };
  const buttonStyle: React.CSSProperties = {
    border: 0, borderRadius: 10, padding: "12px 16px", background: "#13864b",
    color: "#fff", fontWeight: 800, cursor: "pointer",
  };

  function applyExample() {
    setCashCustomerRate(10);
    setCashXoaiRate(5);
    setPointsRedemptionRate(10);
    setInvoiceAmount(1000000);
    setCashPaid(700000);
    setPointsPaid(300000);
    setMessage({ text: "Đã nạp bộ số liệu minh họa: khách 10%, Xoài 5%; phí phần điểm sử dụng 10%. Tất cả đều có thể chỉnh sửa.", ok: true });
  }

  async function callRpc(name: string, args: Record<string, unknown>) {
    const supabase = createClient();
    const call = supabase.rpc as unknown as (rpcName: string, params: Record<string, unknown>) => Promise<RpcResult>;
    const response = await call(name, args);
    if (response.error) throw new Error(response.error.message);
    return response.data;
  }

  async function saveDraft() {
    setMessage(null);
    setSavedId("");
    if (!canWrite) return;
    if (!ratesValid || !amountValid || !datesValid || !scopeName.trim()) {
      setMessage({ text: "Kiểm tra lại tỷ lệ, phạm vi, ngày hiệu lực và tổng thanh toán trước khi lưu.", ok: false });
      return;
    }

    setBusy(true);
    try {
      let policySetId = selectedPolicySet;
      if (!policySetId) {
        policySetId = String(await callRpc("admin_create_policy_set", {
          p_code: newSetCode.trim().toLowerCase(),
          p_name: newSetName.trim(),
          p_description: "Cấu hình phân bổ phí và quyền lợi điểm thưởng của Xoài Go. Tỷ lệ được cấu hình theo phạm vi và thời kỳ hiệu lực.",
        }) ?? "");
        if (!policySetId) throw new Error("Không nhận được mã bộ chính sách sau khi tạo.");
      }

      const config = {
        schema_version: "xoai.reward_allocation.v1",
        policy_scope: {
          scope_type: scopeType,
          scope_name: scopeName.trim(),
        },
        effective_from: new Date(effectiveFrom).toISOString(),
        effective_until: effectiveUntil ? new Date(effectiveUntil).toISOString() : null,
        rate_configuration: {
          cash_paid_amount: {
            customer_points_rate_pct: cashCustomerRate,
            xoai_revenue_rate_pct: cashXoaiRate,
            total_allocation_rate_pct: cashAllocationRate,
          },
          points_redeemed_value: {
            xoai_fee_rate_pct: pointsRedemptionRate,
            issue_new_points: false,
          },
        },
        points_policy: {
          points_per_vnd: 1,
          pending_batch: {
            cutoff_time: "17:00",
            time_zone: "Asia/Ho_Chi_Minh",
            before_cutoff: "same_day_batch",
            at_or_after_cutoff: "next_day_batch",
            release_delay_value: 48,
            release_delay_unit: "hour",
            release_delay_starts_from: "batch_cutoff_timestamp",
            release_requires_all_guards: true,
          },
          pending_points_are_spendable: false,
          cashout_enabled: false,
          transfer_enabled: false,
        },
        merchant_balance_policy: {
          backing_source: "available_balance_only",
          credit_limit_enabled: false,
          negative_balance_visible: true,
          negative_balance_alert: true,
          pending_release_blocked_when_backing_insufficient: true,
        },
        transaction_confirmation: {
          flow: ["customer_scans_merchant_qr", "customer_enters_amount", "customer_selects_points_if_any", "merchant_confirms_completion"],
          pos_integration_planned: true,
          accounting_software_integration_planned: true,
        },
        withdrawal_policy: {
          direct_instant_withdrawal: false,
          request_status: "pending",
          approval: "director_daily_manual_approval",
          customer_points_cashout_allowed: false,
        },
        reversal_policy: {
          deduct_remaining_customer_points: true,
          shortfall_tracking: true,
          auto_cash_collection_from_customer: false,
        },
        rounding_policy: {
          component_rounding: "whole_units",
          remainder_algorithm: "pending_accounting_and_technical_approval",
        },
        account_unlock_policy: {
          auto_unlock_when_balance_conditions_resolved: true,
          manual_admin_approval_when_under_review: true,
        },
        controls: {
          transaction_policy_snapshot_required: true,
          append_only_ledger_required: true,
          idempotency_required: true,
          reversal_instead_of_delete: true,
          activation_requires_separate_approval: true,
        },
        draft_notice: "Draft only. No rate is active until separately reviewed and activated.",
      };

      const draftId = await callRpc("create_policy_version_draft", {
        p_policy_set_id: policySetId,
        p_config: config,
      });
      setSelectedPolicySet(policySetId);
      setSavedId(String(draftId ?? ""));
      setMessage({ text: "Đã lưu bản nháp cấu hình. Chưa được duyệt và chưa áp dụng cho giao dịch.", ok: true });
      router.refresh();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Không thể lưu bản nháp.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ ...cardStyle, background: "#fff8e8", borderColor: "#f0dfb6", color: "#795a20" }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.1 }}>PREVIEW · FINANCIAL MODEL STUDIO</div>
        <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.7 }}>
          Đây là công cụ cấu hình và mô phỏng. Tỷ lệ không phải mặc định của hệ thống. Bản nháp được lưu vào Policy Registry nhưng không kích hoạt điểm, ghi sổ, thu phí hoặc chuyển tiền.
        </p>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19 }}>1. Cấu hình theo cửa hàng / chương trình</h2>
            <p style={{ margin: "6px 0 0", color: "#718176", fontSize: 12 }}>Mỗi phạm vi có thể có tỷ lệ và thời gian hiệu lực riêng.</p>
          </div>
          <button type="button" onClick={applyExample} style={{ ...buttonStyle, background: "#eaf5ee", color: "#17633c" }}>Nạp ví dụ 15%</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
          <label style={labelStyle}>Phạm vi áp dụng
            <select value={scopeType} onChange={(event) => setScopeType(event.target.value)} style={inputStyle}>
              <option value="merchant">Một cửa hàng</option>
              <option value="merchant_group">Nhóm cửa hàng</option>
              <option value="business_category">Ngành hàng</option>
              <option value="campaign">Chiến dịch</option>
              <option value="global">Toàn hệ thống</option>
            </select>
          </label>
          <label style={labelStyle}>Tên cửa hàng / nhóm / chương trình
            <input value={scopeName} onChange={(event) => setScopeName(event.target.value)} style={inputStyle} maxLength={160} />
          </label>
          <label style={labelStyle}>Hiệu lực từ
            <input type="datetime-local" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>Hiệu lực đến (không bắt buộc)
            <input type="datetime-local" value={effectiveUntil} onChange={(event) => setEffectiveUntil(event.target.value)} style={inputStyle} />
          </label>
        </div>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 19 }}>2. Tỷ lệ phân bổ thủ công</h2>
          <p style={{ margin: "6px 0 0", color: "#718176", fontSize: 12 }}>Không có tỷ lệ mặc định. Hãy nhập đủ tỷ lệ được duyệt cho phạm vi này; nút ví dụ chỉ nạp dữ liệu minh họa.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
          <label style={labelStyle}>Hoàn điểm cho khách trên tiền thật (%)
            <input type="number" min="0" max="100" step="0.01" value={cashCustomerRate ?? ""} onChange={(event) => setCashCustomerRate(event.target.value === "" ? null : Number(event.target.value))} style={inputStyle} />
          </label>
          <label style={labelStyle}>Doanh thu / phí Xoài trên tiền thật (%)
            <input type="number" min="0" max="100" step="0.01" value={cashXoaiRate ?? ""} onChange={(event) => setCashXoaiRate(event.target.value === "" ? null : Number(event.target.value))} style={inputStyle} />
          </label>
          <label style={labelStyle}>Phí Xoài trên phần khách dùng điểm (%)
            <input type="number" min="0" max="100" step="0.01" value={pointsRedemptionRate ?? ""} onChange={(event) => setPointsRedemptionRate(event.target.value === "" ? null : Number(event.target.value))} style={inputStyle} />
          </label>
        </div>
        <div style={{ padding: 14, borderRadius: 12, background: ratesValid ? "#edf6ef" : "#fff0ee", color: ratesValid ? "#286342" : "#a22b24", fontSize: 13, lineHeight: 1.6 }}>
          <b>Tổng phân bổ trên phần tiền thật: {pct(cashAllocationRate)}</b>
          <div>Khách nhận {pct(cashCustomerRate ?? 0)} dưới dạng điểm Pending · Xoài nhận {pct(cashXoaiRate ?? 0)} doanh thu/phí.</div>
          {!ratesValid && <div style={{ fontWeight: 800, marginTop: 5 }}>Tỷ lệ không hợp lệ: mỗi tỷ lệ phải từ 0% đến 100%, tổng hai phần trên tiền thật không vượt 100%.</div>}
        </div>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 19 }}>3. Mô phỏng một hóa đơn</h2>
          <p style={{ margin: "6px 0 0", color: "#718176", fontSize: 12 }}>Có thể thay đổi số tiền để kiểm tra tác động của tỷ lệ ngay trên màn hình.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <label style={labelStyle}>Tổng hóa đơn (VND)
            <input type="number" min="0" value={invoiceAmount} onChange={(event) => setInvoiceAmount(Number(event.target.value))} style={inputStyle} />
          </label>
          <label style={labelStyle}>Khách trả tiền thật (VND)
            <input type="number" min="0" value={cashPaid} onChange={(event) => setCashPaid(Number(event.target.value))} style={inputStyle} />
          </label>
          <label style={labelStyle}>Khách dùng điểm (điểm)
            <input type="number" min="0" value={pointsPaid} onChange={(event) => setPointsPaid(Number(event.target.value))} style={inputStyle} />
          </label>
        </div>
        <div style={{ padding: 13, borderRadius: 10, background: amountValid ? "#edf6ef" : "#fff0ee", color: amountValid ? "#286342" : "#a22b24", fontSize: 13 }}>
          {amountValid ? "Tổng tiền thật + điểm sử dụng khớp hóa đơn." : "Tổng tiền thật + điểm sử dụng phải bằng tổng hóa đơn."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          {[
            ["Điểm khách nhận (Pending)", points(result.earnedPoints) + " điểm", "Chỉ tính trên phần tiền thật"],
            ["Doanh thu Xoài từ tiền thật", money(result.xoaiCashRevenue), pct(cashXoaiRate) + " × tiền thật"],
            ["Doanh thu Xoài từ điểm dùng", money(result.xoaiPointsRevenue), pct(pointsRedemptionRate) + " × điểm sử dụng"],
            ["Tổng doanh thu/phí Xoài", money(result.totalXoaiRevenue), "Chưa phải dòng tiền ngân hàng"],
            ["Tổng phân bổ / khấu trừ", money(result.totalAllocation), "Điểm khách + phần Xoài trên tiền thật + phí trên điểm dùng"],
            ["Ví quán — biến động ròng minh họa", money(result.merchantWalletNet), "Điểm sử dụng ghi Có giá trị quán trừ tổng phân bổ"],
            ["Ví khách — biến động điểm ròng", points(result.customerPointsNet) + " điểm", "Điểm Pending mới trừ điểm đã Redeem"],
          ].map(([title, value, note]) => (
            <article key={title} style={{ border: "1px solid #e6eee8", borderRadius: 12, padding: 15, background: "#fbfdfb" }}>
              <div style={{ color: "#718176", fontSize: 11, fontWeight: 700 }}>{title}</div>
              <strong style={{ display: "block", margin: "9px 0 5px", color: "#173d2b", fontSize: 22 }}>{value}</strong>
              <div style={{ color: "#87948c", fontSize: 11, lineHeight: 1.5 }}>{note}</div>
            </article>
          ))}
        </div>
        <div style={{ border: "1px solid #dce8df", borderRadius: 12, padding: 15, display: "grid", gap: 8 }}>
          <b style={{ fontSize: 13 }}>Chi tiết các entry mô phỏng</b>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>Ví khách · cộng điểm Pending</span><b>+{points(result.earnedPoints)} điểm</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>Ví khách · trừ điểm đã sử dụng</span><b>−{points(pointsPaid)} điểm</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>Ví quán · giá trị điểm khách sử dụng</span><b>+{money(pointsPaid)}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>Ví quán · tổng phân bổ / khấu trừ minh họa</span><b>−{money(result.totalAllocation)}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>Ví doanh thu · Xoài</span><b>+{money(result.totalXoaiRevenue)}</b></div>
          <div style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid #e6eee8", color: "#718176", fontSize: 11, lineHeight: 1.6 }}>
            Đây là mô phỏng theo quy tắc phân bổ ví P28/P28A, không phải bút toán kế toán hoặc lệnh thanh toán. Số tiền quán thực nhận và cách thu phí phần tiền thật vẫn cần mapping settlement được duyệt.
          </div>
        </div>
      </section>

      <section style={{ ...cardStyle, display: "grid", gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 19 }}>4. Lưu cấu hình thành bản nháp</h2>
          <p style={{ margin: "6px 0 0", color: "#718176", fontSize: 12 }}>Bản nháp được lưu vào Policy Registry hiện có, có phiên bản và audit. Không tự gửi duyệt hoặc kích hoạt.</p>
        </div>
        {policySets.length > 0 ? (
          <label style={labelStyle}>Bộ chính sách
            <select value={selectedPolicySet} onChange={(event) => setSelectedPolicySet(event.target.value)} style={inputStyle}>
              {policySets.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
            <label style={labelStyle}>Mã bộ chính sách
              <input value={newSetCode} onChange={(event) => setNewSetCode(event.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>Tên bộ chính sách
              <input value={newSetName} onChange={(event) => setNewSetName(event.target.value)} style={inputStyle} />
            </label>
          </div>
        )}
        {canWrite ? (
          <button type="button" disabled={busy || !ratesValid || !amountValid || !datesValid || !scopeName.trim()} onClick={saveDraft} style={{ ...buttonStyle, opacity: busy ? 0.65 : 1, width: "fit-content" }}>
            {busy ? "Đang lưu bản nháp…" : "Lưu cấu hình nháp"}
          </button>
        ) : (
          <p style={{ margin: 0, color: "#8a6b28", fontSize: 12 }}>Tài khoản hiện tại chỉ có quyền xem và mô phỏng. Cần quyền policies.write để lưu bản nháp.</p>
        )}
        {message && <p role={message.ok ? "status" : "alert"} style={{ margin: 0, color: message.ok ? "#16864b" : "#b42318", fontSize: 13, lineHeight: 1.6 }}>{message.text}{savedId ? " Mã phiên bản: " + savedId : ""}</p>}
      </section>
    </div>
  );
}
