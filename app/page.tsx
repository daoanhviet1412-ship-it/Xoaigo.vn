"use client";

import { useState } from "react";

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

  return (
    <main>
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
          <a className="nav-cta" href="#join">Tải ứng dụng</a>
        </div>
      </header>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><i/> CỘNG ĐỒNG TIÊU DÙNG {city.toUpperCase()}</div>
          <h1>Cùng nhau<br/><em>mua tốt hơn.</em></h1>
          <p className="hero-lead"><strong>Ưu đãi</strong> tại các quán ngon quanh bạn,<br className="desktop-break"/> mua chung giá tốt, và nhiều đặc quyền<br className="desktop-break"/> chỉ dành riêng cho thành viên <strong>Xoài Go.</strong></p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#join">Tải ứng dụng <span>→</span></a>
            <a className="btn btn-soft" href="#community">Khám phá ưu đãi</a>
          </div>
          <div className="hero-stats desktop-hero-stats">
            <div><strong>1.000+</strong><span>Thành viên sớm</span></div>
            <div><strong>50+</strong><span>Quán đối tác</span></div>
            <div><strong>Nhiều hơn</strong><span>Mỗi ngày</span></div>
          </div>
        </div>

      </section>
      <div className="mobile-hero-art" aria-label="Hình ảnh giới thiệu Xoài Go">
        <img src="https://i.ibb.co/JW6qRQSr/5c20bff2-6a73-41ab-a43f-f21bd99693e3.png" alt="Hình ảnh giới thiệu cộng đồng Xoài Go" />
      </div>
      <div className="hero-stats mobile-hero-stats">
        <div><strong>1.000+</strong><span>Thành viên sớm</span></div>
        <div><strong>50+</strong><span>Quán đối tác</span></div>
        <div><strong>Nhiều hơn</strong><span>Mỗi ngày</span></div>
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
      <section className="benefit-grid wrap" aria-label="Quyền lợi thành viên">
        <article className="benefit-card benefit-feature">
          <div className="benefit-image"><img src="https://delightfulplate.com/wp-content/uploads/2023/01/Mi-Quang-Ga-Vietnamese-Quang-style-noodle.jpg" alt="Một tô mì Quảng gà với rau sống, đậu phộng và bánh tráng"/></div>
          <div className="benefit-content"><span className="card-index">01 / MEMBER PERKS</span><h3>Ăn ngon hơn.<br/>Ưu đãi thật hơn.</h3><p>Những ưu đãi cụ thể từ cửa hàng tham gia — để mỗi lần ghé quán đều có thêm một lý do vui.</p></div>
        </article>
        <article className="benefit-card benefit-warm">
          <div className="benefit-image"><img src="https://images.pexels.com/photos/19966191/pexels-photo-19966191.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Cặp đôi nam nữ Việt Nam trẻ trung, tươi cười bên nhau"/></div>
          <div className="benefit-content"><span className="card-index">02 / XOÀI COMMUNITY</span><h3>Cộng đồng<br/><em>cùng sẻ chia.</em></h3><p>Kết nối người tiêu dùng và cửa hàng địa phương bằng những trải nghiệm gần gũi.</p></div>
        </article>
        <article className="benefit-card benefit-green">
          <div className="benefit-image"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85" alt="Giỏ hàng thực phẩm xanh tươi bắt mắt"/></div>
          <div className="benefit-content"><span className="card-index">03 / GROUP BUYING</span><h3>Giỏ hàng đầy.<br/><em>Giá tốt hơn.</em></h3><p>Gom nhu cầu mua sắm để tận dụng sức mua cộng đồng.</p></div>
        </article>
      </section>

      <section className="how-section" id="how">
        <div className="wrap how-layout">
          <div className="how-intro"><span className="eyebrow light">CÁCH XOÀI GO HOẠT ĐỘNG</span><h2>Rõ ràng từ lúc chọn.<br/><em>Yên tâm khi giao dịch.</em></h2><p>Xoài tập trung kết nối và tổ chức thông tin. Bạn biết mình đang mua gì, từ ai và theo điều kiện nào.</p><div className="how-visual how-food-visual"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1100&q=85" alt="Món ăn tươi ngon cùng ưu đãi thành viên"/><div className="food-coupon"><span>ƯU ĐÃI THÀNH VIÊN</span><strong>GIẢM 10%</strong><b>MÃ: XOAI10</b></div></div></div>
          <div><div className="step-list">{steps.map((step, i) => <div className="step" key={step[0]}><span className="step-no">0{i + 1}</span><div><h3>{step[0]}</h3><p>{step[1]}</p></div><span className="step-arrow">↗</span></div>)}</div><p className="how-trust-note">Xoài Go kết nối người mua với cửa hàng, không trực tiếp bán hàng hay giữ tiền. Giá, điều kiện và cách nhận hàng được công bố trước; khách thanh toán trực tiếp với cửa hàng.</p></div>
        </div>
      </section>

      <section className="merchant-section" id="merchant"><div className="wrap merchant-layout"><div className="merchant-photo"><img src="https://napoli.vn/Document/Images/CUA-HANG-TIEU-BIEU/napoli-coffee-chung-cu-q7-so-600-nguyen-luong-bang-p-phu-my-01/napoli-coffee-chung-cu-q7-so-600-nguyen-luong-bang-p-phu-my-quan-7-tp-hcm-vn-04.jpg" alt="Nữ nhân viên Việt Nam đứng tại quầy cà phê, chào khách; phía sau là kệ cà phê và bảng menu"/></div><div className="merchant-copy"><span className="eyebrow">DÀNH CHO CỬA HÀNG ĐỊA PHƯƠNG</span><h2>Khách hàng mới.<br/><em>Cơ hội phát triển mới.</em></h2><p>Xoài Go mong muốn đồng hành cùng những cửa hàng có sản phẩm và dịch vụ tốt, muốn tiếp cận cộng đồng khách hàng gần mình hơn.</p><div className="merchant-points"><div><b>01</b><span>Giới thiệu cửa hàng và ưu đãi đến cộng đồng</span></div><div><b>02</b><span>Thử nghiệm chương trình mua chung theo nhu cầu</span></div><div><b>03</b><span>Thêm một kênh xây dựng khách hàng quay lại</span></div></div><a className="btn btn-primary" href="#join">Tìm hiểu cơ hội hợp tác <span>↗</span></a></div></div></section>

      <section className="faq-section wrap" id="faq"><div className="faq-heading"><span className="eyebrow">BẠN CÓ THỂ ĐANG THẮC MẮC</span><h2>Hỏi nhanh,<br/><em>hiểu rõ về Xoài.</em></h2><p>Những nguyên tắc cốt lõi trong mô hình Xoài Go.</p></div><div className="faq-list">{faqs.map(([q, a], i) => <details key={q} className="faq-item"><summary><span>{q}</span><b>+</b></summary><p>{a}</p></details>)}</div></section>

      <section className="join-section" id="join"><div className="wrap join-inner"><div><span className="eyebrow light">XOÀI GO · ĐÀ NẴNG</span><h2>Cùng nhau mua tốt hơn.<br/><em>Bắt đầu từ những điều gần gũi.</em></h2><p>Xoài đang hoàn thiện nền tảng và kết nối những cửa hàng đầu tiên. Hẹn gặp bạn trong cộng đồng.</p></div><a className="btn btn-light" href="#merchant">Tôi muốn đồng hành <span>↗</span></a></div></section>

      <footer><div className="wrap footer-main"><a className="brand footer-brand" href="#"><img className="brand-primary" src="/xoai-logo.svg" alt="Xoài Go — Cùng nhau mua tốt hơn." /></a><div className="footer-tagline">Cùng nhau mua tốt hơn.</div><nav><a href="#how">Cách hoạt động</a><a href="#merchant">Đối tác</a><a href="#faq">Hỏi đáp</a></nav></div><div className="wrap footer-bottom"><span>© 2026 Xoài Go. Đang trong giai đoạn hoàn thiện nền tảng.</span><span>Made for local communities <b>✳</b></span></div></footer>
    </main>
  );
}
