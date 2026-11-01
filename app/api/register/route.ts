import { NextResponse } from "next/server";

const PHONE = /^(0|\+84)\d{9,10}$/;
const CATS = ["Quán ăn", "Cà phê / trà", "Mẹ và bé", "Làm đẹp / cắt tóc", "Cơ sở cung ứng thực phẩm", "Khác"];
const INTEREST = ["offers", "group", "both"];
const COOP = ["member_offer", "group_sell", "wholesale_buy", "consult"];
const CONSENT_VERSION = "v1-2026-11";
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  if (clean(body.website, 80)) return NextResponse.json({ ok: true });
  const elapsed = Number(body.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < 3000) return NextResponse.json({ ok: true });

  const type = body.type === "MERCHANT" ? "MERCHANT" : body.type === "CUSTOMER" ? "CUSTOMER" : null;
  const name = clean(body.name, 60);
  const location = clean(body.location, 150);
  let phone = clean(body.phone, 20).replace(/[\s().-]/g, "");
  if (!type || body.consent !== true || name.length < 2 || location.length < (type === "MERCHANT" ? 5 : 2) || !PHONE.test(phone)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  if (phone.startsWith("+84")) phone = "0" + phone.slice(3);

  const out: Record<string, unknown> = {
    secret: process.env.SHEETS_SECRET, type, name, phone, location,
    consent: true, consent_version: CONSENT_VERSION,
    source: clean(body.source, 60) || "direct",
  };
  if (type === "CUSTOMER") {
    if (!INTEREST.includes(String(body.interest))) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    out.interest = body.interest;
  } else {
    const storeName = clean(body.store_name, 80);
    const category = clean(body.category, 80);
    const cooperation = Array.isArray(body.cooperation)
      ? body.cooperation.filter((item): item is string => typeof item === "string" && COOP.includes(item))
      : [];
    if (storeName.length < 2 || !CATS.includes(category) || cooperation.length === 0) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    out.store_name = storeName;
    out.category = category;
    out.cooperation = [...new Set(cooperation)].join(";");
    out.note = clean(body.note, 300);
  }

  const webhook = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_SECRET;
  if (!webhook || !secret) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(out),
      redirect: "follow",
      cache: "no-store",
    });
    const text = await response.text();
    let result: { ok?: boolean };
    try { result = JSON.parse(text); }
    catch { throw new Error("Apps Script did not return JSON"); }
    if (!response.ok || result.ok !== true) throw new Error("Registration storage failed");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "storage_failed" }, { status: 502 });
  }
}
