import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FinancialControlCenter } from "@/components/admin/financial-control-center";

export default async function FinancialPage({ searchParams }: { searchParams: Promise<{ wallet?: string }> }) {
  const { wallet } = await searchParams;
  if (process.env.VERCEL_ENV === "preview") return <FinancialControlCenter wallet={wallet} />;

  const supabase = await createClient();
  if (!supabase) return <main style={{ padding: 36 }}>Chưa cấu hình dữ liệu.</main>;
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
    .map((item) => item.permissions?.code);
  const canReadFinance = permissions.some((permission) =>
    ["ledger.read", "reconciliation.read", "settlement.read", "budgets.read"].includes(permission ?? "")
  );
  if (!canReadFinance) return <main style={{ padding: 36 }}>Bạn không có quyền xem khu vực tài chính.</main>;

  return <main style={{ padding: 36 }}>Khu vực thống kê ví đang ở chế độ DEMO Preview; dữ liệu thật chưa được kết nối.</main>;
}
