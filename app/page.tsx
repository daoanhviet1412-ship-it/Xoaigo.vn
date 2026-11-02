"use client";

import { useEffect, useState } from "react";

const perks = [
  { n: "01", title: "Đặc quyền tại cửa hàng", text: "Thành viên tiếp cận ưu đãi được công bố rõ ràng từ các cửa hàng tham gia Xoài Go." },
  { n: "02", title: "Mua chung có tổ chức", text: "Gom nhu cầu của nhiều người để cửa hàng có cơ sở đưa ra mức giá và điều kiện tốt hơn." },
  { n: "03", title: "Ủng hộ kinh doanh địa phương", text: "Khám phá những địa chỉ quanh mình, giúp cửa hàng tốt tiếp cận thêm khách hàng phù hợp." },
];

const steps = [
  ["Khám phá", "Xem cửa hàng, ưu đãi và các nhóm mua đang mở."],
  ["Chọn cách tham gia", "Dùng ưu đãi tại cửa hàng hoặc đăng ký góp nhu cầu mua chung."],
  ["Giao dịch minh bạch", "Xem rõ giá, số lượng, thời hạn và điều kiện trước khi xác nhận."],
  ["Thanh toán trực tiếp", "Khách hàng thanh toán với cửa hàng cung cấp sản phẩm hoặc dịch vụ."],
];

const faqs = [
  ["Xoài Go là gì?", "Xoài Go là nền tảng kết nối người tiêu dùng với cửa hàng địa phương thông qua ưu đãi thành viên và hoạt động mua chung."],
  ["Tham gia Xoài Go có mất phí không?", "Mô hình thành viên đang được hoàn thiện với mức phí dự kiến 30.000 đồng mỗi tháng. Mức phí, quyền lợi và thời điểm áp dụng chính thức sẽ được công bố trước khi mở đăng ký."],
  ["Xoài Go có trực tiếp bán hàng hay giữ tiền không?", "Định hướng vận hành là kết nối nhu cầu và cửa hàng. Khách hàng thanh toán trực tiếp cho cửa hàng; Xoài Go không đứng ra giữ tiền thanh toán của khách."],
  ["Mua chung hoạt động như thế nào?", "Một chương trình sẽ nêu rõ sản phẩm, giá, số lượng tối thiểu (nếu có), thời hạn gom đơn, cách nhận hàng và điều kiện áp dụng. Chỉ tham gia khi bạn đã xem và đồng ý các thông tin đó."],
  ["Cửa hàng tham gia được lợi gì?", "Cửa hàng có thêm kênh tiếp cận khách hàng, giới thiệu ưu đãi và thử nghiệm gom nhu cầu để tối ưu việc nhập hàng hoặc triển khai chương trình bán hàng."],
  ["Xoài Go đã hoạt động chính thức chưa?", "Website hiện giới thiệu mô hình và định hướng của Xoài Go. Nền tảng đang trong giai đoạn hoàn thiện; các cửa hàng, ưu đãi và chương trình thực tế sẽ được công bố khi sẵn sàng."],
];

export default function Home() {
  const [city, setCity] = useState("Đà Nẵng");
  const [showAppPicker, setShowAppPicker] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <main>
      {showAppPicker && (
        <div role="presentation" onClick={() => setShowAppPicker(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20, 27, 22, .58)", display: "grid", placeItems: "center", padding: 20 }}>
          <section role="dialog" aria-modal="true" aria-labelledby="app-picker-title" onClick={(event) => event.stopPropagation()} style={{ width: "min(100%, 520px)", background: "#fffdf8", borderRadius: 22, padding: "30px 26px 26px", boxShadow: "0 24px 80px rgba(0,0,0,.22)", position: "relative" }}>
            <button type="button" aria-label="Đóng" onClick={() => setShowAppPicker(false)} style={{ position: "absolute", right: 16, top: 14, border: 0, background: "transparent", fontSize: 26, cursor: "pointer", color: "#5d665d" }}>×</button>
            <span className="eyebrow">CHỌN KHÔNG GIAN CỦA BẠN</span>
            <h2 id="app-picker-title" style={{ fontSize: "clamp(25px, 5vw, 34px)", lineHeight: 1.15, margin: "12px 0 8px" }}>Bạn tham gia Xoài Go với vai trò nào?</h2>
            <p style={{ color: "#697168", margin: "0 0 22px" }}>Chọn ứng dụng phù hợp để tiếp tục đăng nhập hoặc đăng ký.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <a href="https://datmon-user.vercel.app" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ minHeight: 100, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 8, padding: 18, textDecoration: "none" }}><strong>Ứng dụng khách</strong><span style={{ fontSize: 13, fontWeight: 400 }}>Khám phá ưu đãi, mua chung ↗</span></a>
              <a href="https://datmon-shop.vercel.app" target="_blank" rel="noreferrer" className="btn btn-soft" style={{ minHeight: 100, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 8, padding: 18, textDecoration: "none" }}><strong>Ứng dụng quán</strong><span style={{ fontSize: 13, fontWeight: 400 }}>Quản lý cửa hàng, hợp tác ↗</span></a>
            </div>
          </section>
        </div>
      )}
      <header className="nav wrap">
        <a className="brand" href="#" aria-label="Xoài Go trang chủ">
          <img className="brand-primary" src="/xoai-logo.svg" alt="Xoài Go — Cùng nhau mua tốt hơn." />
        </a>
        <nav aria-label="Điều hướng chính">
          <a className="active" href="#">Trang chủ</a>
          <a href="#community">Ưu đãi</a>
          <a href="#how">Mua chung</a>
          <a href="#merchant">Khám phá quán</a>
          <a href="#merchant">Dành cho đối tác</a>
          <a href="#faq">Hỏi đáp</a>
        </nav>
        <div className="nav-actions">
          <label className="location-pill location-picker"><span>⌖</span><select aria-label="Chọn thành phố" value={city} onChange={(event) => setCity(event.target.value)}><option>Đà Nẵng</option><option>Hà Nội</option><option>Hồ Chí Minh</option></select><b>⌄</b></label>
          <button className="nav-cta" type="button" onClick={() => setShowAppPicker(true)}>Đăng ký sớm</button>
        </div>
      </header>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><i/> CỘNG ĐỒNG TIÊU DÙNG {city.toUpperCase()}</div>
          <h1>Cùng nhau<br/><em>mua tốt hơn.</em></h1>
          <p className="hero-lead"><strong>Ưu đãi</strong> tại các quán ngon quanh bạn,<br className="desktop-break"/> mua chung giá tốt, và nhiều đặc quyền<br className="desktop-break"/> chỉ dành riêng cho thành viên <strong>Xoài Go.</strong></p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => setShowAppPicker(true)}>Đăng ký sớm <span>→</span></button>
            <a className="btn btn-soft" href="#community">Khám phá ưu đãi</a>
          </div>
          <div className="hero-stats desktop-hero-stats">
            <div><strong>1.000</strong><span>Mục tiêu thành viên đầu tiên</span></div>
            <div><strong>50</strong><span>Mục tiêu quán đối tác</span></div>
            <div><strong>Cùng nhau</strong><span>Phát triển mỗi ngày</span></div>
          </div>
        </div>

      </section>
      <div className="mobile-hero-art" aria-label="Hình ảnh giới thiệu Xoài Go">
        <img src="https://i.ibb.co/JW6qRQSr/5c20bff2-6a73-41ab-a43f-f21bd99693e3.png" alt="Hình ảnh giới thiệu cộng đồng Xoài Go" />
        <div className="mobile-hero-overlay-actions">
          <button className="mobile-hero-cta mobile-hero-cta-primary" type="button" onClick={() => setShowAppPicker(true)}>Đăng ký sớm <span>→</span></button>
          <a className="mobile-hero-cta mobile-hero-cta-secondary" href="#community">Khám phá ưu đãi</a>
        </div>
      </div>
      <div className="hero-stats mobile-hero-stats">
        <div><strong>1.000</strong><span>Mục tiêu thành viên</span></div>
        <div><strong>50</strong><span>Mục tiêu quán đối tác</span></div>
        <div><strong>Cùng nhau</strong><span>Phát triển mỗi ngày</span></div>
      </div>
      <section className="feature-ribbon wrap">
        <article><span className="feature-icon">♜</span><div><b>Ưu đãi quán quen</b><small>Giảm giá và đặc quyền<br/>chỉ dành cho thành viên</small></div></article>
        <article><span className="feature-icon">🛒</span><div><b>Mua chung giá tốt</b><small>Gom nhu cầu, nhập sỉ,<br/>chi phí hợp lý hơn</small></div></article>
        <article><span className="feature-icon">▤</span><div><b>Khám phá quanh bạn</b><small>Nhiều quán ngon<br/>ngay trong khu vực</small></div></article>
        <article><span className="feature-icon">♟</span><div><b>Cộng đồng tiêu dùng</b><small>Cùng nhau mua tốt hơn<br/>mỗi ngày</small></div></article>
      </section>
      <section className="intro wrap" id="community">
        <div className="intro-heading"><span className="eyebrow">KHÔNG CHỈ LÀ MỘT ỨNG DỤNG ƯU ĐÃI</span><h2>Một cộng đồng nhỏ,<br/><em>thêm nhiều giá trị lớn.</em></h2></div>
        <div className="intro-copy"><p>Mỗi ngày chúng ta đều mua thực phẩm, ăn uống và sử dụng dịch vụ quanh nơi mình sống. Xoài Go muốn làm cho những giao dịch quen thuộc ấy trở nên có lợi hơn — bằng cách kết nối đúng người mua với đúng cửa hàng.</p><a className="under-link" href="#how">Tìm hiểu hành trình của bạn <span>↗</span></a></div>
      </section>
      <section className="benefit-grid wrap" aria-label="Quyền lợi dành cho khách hàng">
        <article className="benefit-card benefit-feature">
          <div className="benefit-image"><img src="https://xoaigo.vercel.app/Khuye%CC%82%CC%81n%20ma%CC%83i%2010%25%20be%CC%82n%20ca%CC%82%CC%80u%20Ro%CC%82%CC%80ng.png" alt="Món ăn tại cửa hàng địa phương dành cho thành viên Xoài Go"/></div>
          <div className="benefit-content"><span className="card-index">01 / MEMBER PERKS</span><h3>Ưu đãi<br/><em>thành viên.</em></h3><p>Hưởng mức giá và những ưu đãi riêng tại các cửa hàng đối tác Xoài Go.</p></div>
        </article>
        <article className="benefit-card benefit-warm">
          <div className="benefit-image"><img src="https://xoaigo.vercel.app/Mua%20sa%CC%86%CC%81m%20rau%20qua%CC%89%20be%CC%82n%20Ca%CC%82%CC%80u%20Ro%CC%82%CC%80ng.png" alt="Người tiêu dùng cùng tham gia mua sắm"/></div>
          <div className="benefit-content"><span className="card-index">02 / GROUP BUYING</span><h3>Mua chung<br/><em>giá tốt.</em></h3><p>Góp nhu cầu cùng cộng đồng để có cơ hội mua hàng với mức giá tốt hơn.</p></div>
        </article>
        <article className="benefit-card benefit-green">
          <div className="benefit-image"><img src="https://xoaigo.vercel.app/Giao%20di%CC%A3ch%20tha%CC%82n%20thie%CC%A3%CC%82n%20be%CC%82n%20ca%CC%82%CC%80u%20Ro%CC%82%CC%80ng.png" alt="Thực phẩm tươi tại cửa hàng"/></div>
          <div className="benefit-content"><span className="card-index">03 / CONSUMER RIGHTS</span><h3>Bảo vệ<br/><em>quyền lợi tiêu dùng.</em></h3><p>Minh bạch thông tin giá và điều kiện giao dịch; ghi nhận phản hồi, hỗ trợ kết nối với cửa hàng khi có vấn đề phát sinh.</p></div>
        </article>
      </section>

      <section className="merchant-section" id="merchant"><div className="wrap merchant-layout"><div className="merchant-photo"><img src="https://i.ibb.co/pvKYRDNQ/Bu-a-to-i-a-m-cu-ng-du-o-i-e-n-ma-y.png" alt="Nữ nhân viên Việt Nam đứng tại quầy cà phê, chào khách; phía sau là kệ cà phê và bảng menu"/></div><div className="merchant-copy"><span className="eyebrow">DÀNH CHO CỬA HÀNG ĐỊA PHƯƠNG</span><h2>Khách hàng mới.<br/><em>Cơ hội phát triển mới.</em></h2><p>Xoài Go mong muốn đồng hành cùng những cửa hàng có sản phẩm và dịch vụ tốt, muốn tiếp cận cộng đồng khách hàng gần mình hơn.</p><div className="merchant-points"><div><b>01</b><span>Tiếp cận khách hàng trong cộng đồng Xoài Go</span></div><div><b>02</b><span>Truyền thông và quảng bá cửa hàng, sản phẩm, dịch vụ đến người tiêu dùng</span></div><div><b>03</b><span>Đồng hành cùng phát triển thông qua kết nối nhu cầu và cơ hội kinh doanh</span></div></div><a className="btn btn-primary" href="https://datmon-shop.vercel.app" target="_blank" rel="noreferrer">Dành cho quán <span>↗</span></a></div></div></section>

      <section className="faq-section wrap" id="faq"><div className="faq-heading"><span className="eyebrow">BẠN CÓ THỂ ĐANG THẮC MẮC</span><h2>Hỏi nhanh,<br/><em>hiểu rõ về Xoài.</em></h2><p>Những nguyên tắc cốt lõi trong mô hình Xoài Go.</p></div><div className="faq-list">{faqs.map(([q, a], i) => <details key={q} className="faq-item"><summary><span>{q}</span><b>+</b></summary><p>{a}</p></details>)}</div></section>

      <section className="join-section" id="join"><div className="wrap join-inner"><div><span className="eyebrow light">XOÀI GO · ĐÀ NẴNG</span><h2>Cùng nhau mua tốt hơn.<br/><em>Bắt đầu từ những điều gần gũi.</em></h2><p>Xoài đang hoàn thiện nền tảng và kết nối những cửa hàng đầu tiên. Hẹn gặp bạn trong cộng đồng.</p></div><a className="btn btn-light" href="https://datmon-shop.vercel.app" target="_blank" rel="noreferrer">Dành cho quán <span>↗</span></a></div></section>

      <footer><div className="wrap footer-main"><a className="brand footer-brand" href="#"><img className="brand-primary" src="/xoai-logo.svg" alt="Xoài Go — Cùng nhau mua tốt hơn." /></a><div className="footer-tagline">Cùng nhau mua tốt hơn.</div><nav><a href="#how">Cách hoạt động</a><a href="#merchant">Đối tác</a><a href="#faq">Hỏi đáp</a></nav></div><div className="wrap footer-bottom"><span>© 2026 Xoài Go. Đang trong giai đoạn hoàn thiện nền tảng.</span><span>Made for local communities <b>✳</b></span></div></footer>
    </main>
  );
}
