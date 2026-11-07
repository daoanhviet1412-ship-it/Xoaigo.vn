"use client";

import { useState } from "react";

const categories = ["Ăn uống", "Cà phê", "Trà sữa", "Mua sắm", "Thực phẩm", "Dịch vụ", "Làm đẹp", "Giải trí"];

const faqs = [
  ["Xoài Go là gì?", "Xoài Go là nền tảng kết nối người tiêu dùng với cửa hàng địa phương thông qua quyền lợi thành viên, ưu đãi tại cửa hàng và các chương trình mua chung."],
  ["Tham gia Xoài Go có mất phí không?", "Xoài đang hoàn thiện mô hình thành viên. Mức phí dự kiến là 30.000 đồng/tháng; quyền lợi, điều kiện và thời điểm áp dụng sẽ được công bố rõ trước khi mở đăng ký."],
  ["Tôi được lợi gì khi là thành viên?", "Bạn có thể tiếp cận ưu đãi tại các cửa hàng đối tác, tham gia chương trình mua chung và khám phá các địa chỉ phù hợp quanh khu vực của mình."],
  ["Cửa hàng được lợi gì khi tham gia?", "Cửa hàng có thêm kênh tiếp cận khách hàng mới, tạo lý do để khách quay lại, chủ động thiết kế chương trình ưu đãi và thử nghiệm gom nhu cầu mua chung."],
  ["Mua chung hoạt động như thế nào?", "Mỗi chương trình sẽ công bố sản phẩm, giá, số lượng, thời hạn, điều kiện và cách nhận hàng. Người mua xem thông tin trước khi xác nhận tham gia."],
  ["Xoài Go có trực tiếp bán hàng hoặc giữ tiền không?", "Xoài Go tập trung kết nối người mua và cửa hàng. Với giao dịch thanh toán trực tiếp tại cửa hàng, khách thanh toán cho đơn vị cung cấp sản phẩm hoặc dịch vụ theo thông tin hiển thị của từng chương trình."],
];

export default function Home() {
  const [city, setCity] = useState("Đà Nẵng");
  return (
    <main>
      <header className="site-header">
        <a className="logo" href="#"><img src="/xoai-logo.svg" alt="Xoài Go" /></a>
        <nav className="desktop-nav">
          <a href="#how">Cách hoạt động</a><a href="#benefits">Quyền lợi</a><a href="#merchants">Dành cho cửa hàng</a><a href="#faq">Hỏi đáp</a>
        </nav>
        <div className="header-actions">
          <label className="city-select"><span>⌖</span><select value={city} onChange={e => setCity(e.target.value)}><option>Đà Nẵng</option><option>Hội An</option><option>Huế</option></select></label>
          <a className="button button-dark" href="#join">Tham gia Xoài <span>↗</span></a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="kicker"><i /> CỘNG ĐỒNG TIÊU DÙNG ĐỊA PHƯƠNG · {city.toUpperCase()}</div>
          <h1>Mua sắm mỗi ngày.<br/><em>Giá trị nhiều hơn.</em></h1>
          <p className="hero-lead">Kết nối với những cửa hàng quanh bạn, tận hưởng quyền lợi thành viên và cùng cộng đồng tạo nên những mức giá tốt hơn.</p>
          <div className="hero-buttons"><a className="button button-orange" href="#how">Khám phá Xoài Go <span>→</span></a><a className="text-button" href="#merchants">Tôi là chủ cửa hàng ↗</a></div>
          <div className="hero-proof"><span className="proof-mark">✳</span><span>Một cộng đồng tiêu dùng mới, bắt đầu từ những điều gần gũi.</span></div>
        </div>
        <div className="hero-art">
          <div className="hero-photo"><img src="https://i.ibb.co/Z9Zym05/Mi-Qua-ng-ga-giu-a-sa-c-xanh-mo-c-ma-c.png" alt="Món mì Quảng đặc trưng Đà Nẵng"/></div>
          <div className="hero-sticker"><span>XOÀI GO</span><strong>MUA TỐT<br/>HƠN CÙNG NHAU</strong><b>✳</b></div>
          <div className="hero-note"><span className="note-icon">%</span><div><b>Đặc quyền thành viên</b><small>Ưu đãi từ cửa hàng đối tác</small></div></div>
          <div className="hero-note hero-note-bottom"><span className="note-icon note-green">⌂</span><div><b>Ủng hộ cửa hàng địa phương</b><small>Khám phá ngay quanh bạn</small></div></div>
        </div>
      </section>

      <section className="category-strip"><div className="category-label">KHÁM PHÁ NHU CẦU HẰNG NGÀY</div><div className="category-list">{categories.map((item, i) => <span key={item}>{item}<b>{i === categories.length - 1 ? "✳" : "·"}</b></span>)}</div></section>

      <section className="numbers-section">
        <div><strong>01</strong><span>Một cộng đồng<br/>tiêu dùng địa phương</span></div>
        <div><strong>02</strong><span>Quyền lợi thiết thực<br/>cho thành viên</span></div>
        <div><strong>03</strong><span>Thêm cơ hội phát triển<br/>cho cửa hàng</span></div>
      </section>

      <section className="section how-section" id="how">
        <div className="section-heading"><div><div className="kicker">CÁCH XOÀI GO HOẠT ĐỘNG</div><h2>Đơn giản để tham gia.<br/><em>Rõ ràng trong từng giao dịch.</em></h2></div><p>Từ một nhu cầu rất quen thuộc — ăn uống, mua sắm và sử dụng dịch vụ — Xoài giúp bạn tiếp cận những lựa chọn có lợi hơn.</p></div>
        <div className="how-grid">
          <article className="how-card"><span className="step-number">01</span><div className="how-icon">⌕</div><h3>Khám phá cửa hàng</h3><p>Tìm các cửa hàng, ưu đãi và chương trình mua chung trong khu vực của bạn.</p></article>
          <article className="how-card"><span className="step-number">02</span><div className="how-icon">✳</div><h3>Chọn quyền lợi phù hợp</h3><p>Xem ưu đãi thành viên hoặc tham gia gom nhu cầu để có mức giá tốt hơn.</p></article>
          <article className="how-card"><span className="step-number">03</span><div className="how-icon">✓</div><h3>Xác nhận minh bạch</h3><p>Thông tin giá, số lượng, thời hạn và điều kiện được thể hiện trước khi bạn tham gia.</p></article>
          <article className="how-card"><span className="step-number">04</span><div className="how-icon">♡</div><h3>Trải nghiệm và quay lại</h3><p>Sử dụng sản phẩm, dịch vụ tại cửa hàng và tiếp tục khám phá những quyền lợi mới.</p></article>
        </div>
      </section>

      <section className="benefits-section" id="benefits">
        <div className="section section-heading"><div><div className="kicker">GIÁ TRỊ CHO NGƯỜI TIÊU DÙNG</div><h2>Không chỉ tiết kiệm.<br/><em>Mà còn mua sắm thông minh hơn.</em></h2></div><p>Xoài kết nối những nhu cầu thường ngày thành sức mua cộng đồng — để lợi ích không chỉ dừng lại ở một lần giảm giá.</p></div>
        <div className="benefit-layout">
          <article className="benefit-large"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=85" alt="Bữa ăn tươi ngon"/><div className="benefit-overlay"><span>01 / MEMBER BENEFITS</span><h3>Chi tiêu có lợi.<br/><em>Trải nghiệm trọn vẹn.</em></h3><p>Tiếp cận ưu đãi rõ ràng từ những cửa hàng bạn yêu thích.</p></div></article>
          <div className="benefit-stack">
            <article className="benefit-small benefit-cream"><span>02 / GROUP BUYING</span><div className="benefit-illustration">▦</div><h3>Cùng mua chung.<br/><em>Cùng có giá tốt.</em></h3><p>Gom nhu cầu để tận dụng lợi thế số lượng.</p></article>
            <article className="benefit-small benefit-green"><span>03 / LOCAL COMMUNITY</span><div className="benefit-illustration">⌂</div><h3>Khám phá cửa hàng<br/><em>ngay quanh bạn.</em></h3><p>Ủng hộ kinh doanh địa phương và tìm thêm địa chỉ đáng thử.</p></article>
          </div>
        </div>
      </section>

      <section className="merchant-section" id="merchants">
        <div className="merchant-image"><img src="https://i.ibb.co/pvKYRDNQ/Bu-a-to-i-a-m-cu-ng-du-o-i-e-n-ma-y.png" alt="Chủ cửa hàng phục vụ khách hàng"/></div>
        <div className="merchant-content"><div className="kicker">DÀNH CHO CỬA HÀNG & ĐỐI TÁC</div><h2>Thêm khách hàng mới.<br/><em>Tăng trưởng bền vững hơn.</em></h2><p>Xoài không chỉ đưa cửa hàng lên một danh sách. Chúng tôi muốn cùng cửa hàng thiết kế cách tiếp cận khách hàng, tạo ưu đãi hợp lý và tổ chức nhu cầu mua chung.</p>
          <div className="merchant-points"><div><b>01</b><span><strong>Tiếp cận khách hàng mới</strong><small>Đưa cửa hàng đến gần cộng đồng người tiêu dùng trong khu vực.</small></span></div><div><b>02</b><span><strong>Tăng lượt khách quay lại</strong><small>Tạo quyền lợi và lý do thiết thực để khách tiếp tục lựa chọn cửa hàng.</small></span></div><div><b>03</b><span><strong>Chủ động chương trình bán hàng</strong><small>Thiết kế ưu đãi, thử nghiệm mua chung và theo dõi hiệu quả.</small></span></div><div><b>04</b><span><strong>Tối ưu nhu cầu đầu vào</strong><small>Kết nối nhu cầu mua chung để có thêm cơ hội tối ưu chi phí nhập hàng.</small></span></div></div>
          <a className="button button-orange" href="#join">Đăng ký hợp tác cùng Xoài <span>↗</span></a>
        </div>
      </section>

      <section className="faq-section section" id="faq"><div className="faq-heading"><div className="kicker">CÂU HỎI THƯỜNG GẶP</div><h2>Điều bạn muốn biết<br/><em>về Xoài Go.</em></h2><p>Minh bạch ngay từ đầu để khách hàng và cửa hàng yên tâm tham gia.</p></div><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<b>+</b></summary><p>{a}</p></details>)}</div></section>

      <section className="join-section" id="join"><div className="join-inner"><div className="kicker">XOÀI GO · ĐÀ NẴNG</div><h2>Cùng nhau mua tốt hơn.<br/><em>Bắt đầu từ hôm nay.</em></h2><p>Xoài đang kết nối những cửa hàng đầu tiên và hoàn thiện cộng đồng tiêu dùng địa phương. Hãy để lại thông tin để đồng hành cùng chúng tôi.</p><div className="join-buttons"><a className="button button-light" href="mailto:hello@xoaigo.vn?subject=Quan%20t%C3%A2m%20tham%20gia%20Xo%C3%A0i%20Go">Tôi muốn tham gia <span>↗</span></a><a className="join-link" href="#merchants">Tôi là cửa hàng đối tác</a></div></div></section>

      <footer className="site-footer"><div className="footer-top"><a className="logo" href="#"><img src="/xoai-logo.svg" alt="Xoài Go"/></a><p>Cộng đồng tiêu dùng địa phương.<br/>Cùng nhau mua tốt hơn.</p><div className="footer-links"><a href="#how">Cách hoạt động</a><a href="#benefits">Quyền lợi</a><a href="#merchants">Đối tác</a><a href="#faq">Hỏi đáp</a></div></div><div className="footer-bottom"><span>© 2026 Xoài Go. Nội dung đang trong giai đoạn hoàn thiện.</span><span>Made for local communities <b>✳</b></span></div></footer>
    </main>
  );
}
