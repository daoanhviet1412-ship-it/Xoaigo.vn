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
  return (
    <main>
      <header className="nav wrap">
        <a className="brand" href="#" aria-label="Xoài Go trang chủ">
          <img src="/xoai-mark.svg" alt="" /><span>Xoài<span className="brand-go">Go</span></span>
        </a>
        <nav aria-label="Điều hướng chính">
          <a href="#how">Cách hoạt động</a><a href="#community">Cộng đồng</a><a href="#merchant">Đối tác cửa hàng</a><a href="#faq">Hỏi đáp</a>
        </nav>
        <a className="nav-cta" href="#join">Khám phá Xoài <span>↗</span></a>
      </header>

      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><i/> CỘNG ĐỒNG TIÊU DÙNG ĐỊA PHƯƠNG · ĐÀ NẴNG</div>
          <h1>Mua sắm thông minh.<br/><em>Vui hơn khi có hội.</em></h1>
          <p className="hero-lead">Kết nối người mua với cửa hàng địa phương, tận hưởng ưu đãi thành viên và cùng nhau tạo nên những lựa chọn tốt hơn.</p>
          <div className="hero-actions"><a className="btn btn-primary" href="#how">Khám phá cách Xoài hoạt động <span>↗</span></a><a className="text-link" href="#merchant">Tôi có cửa hàng <span>→</span></a></div>
          <div className="hero-proof"><span className="proof-icon">✳</span><span>Bắt đầu từ Đà Nẵng</span><b>·</b><span>Ưu tiên giá trị thật</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85" alt="Quầy rau củ tươi tại cửa hàng địa phương"/></div>
          <div className="photo-stamp"><img src="/xoai-mark.svg" alt=""/><span>LOCAL<br/>FINDS</span></div>
          <div className="floating-note note-top"><span className="note-symbol">✳</span><div><strong>Ưu đãi thành viên</strong><small>Giá trị thiết thực mỗi ngày</small></div></div>
          <div className="floating-note note-bottom"><span className="note-symbol green">↗</span><div><strong>Mua chung cộng đồng</strong><small>Gom nhu cầu · Tốt hơn cùng nhau</small></div></div>
          <span className="visual-caption">GOOD LOCAL. GOOD PEOPLE. BETTER VALUE.</span>
        </div>
      </section>

      <section className="marquee"><div>ĐI CHỢ VUI HƠN <b>✳</b> ƯU ĐÃI THIẾT THỰC <b>✳</b> MUA CHUNG CỘNG ĐỒNG <b>✳</b> ỦNG HỘ CỬA HÀNG ĐỊA PHƯƠNG <b>✳</b> CÙNG NHAU MUA TỐT HƠN <b>✳</b></div></section>

      <section className="intro wrap" id="community">
        <div className="intro-heading"><span className="eyebrow">KHÔNG CHỈ LÀ MỘT ỨNG DỤNG ƯU ĐÃI</span><h2>Một cộng đồng nhỏ,<br/><em>thêm nhiều giá trị lớn.</em></h2></div>
        <div className="intro-copy"><p>Mỗi ngày chúng ta đều mua thực phẩm, ăn uống và sử dụng dịch vụ quanh nơi mình sống. Xoài Go muốn làm cho những giao dịch quen thuộc ấy trở nên có lợi hơn — bằng cách kết nối đúng người mua với đúng cửa hàng.</p><a className="under-link" href="#how">Tìm hiểu hành trình của bạn <span>↗</span></a></div>
      </section>

      <section className="benefit-grid wrap">
        <article className="benefit-card benefit-feature">
          <div className="benefit-image"><img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=85" alt="Không gian một cửa hàng ăn uống địa phương"/></div>
          <div className="benefit-content"><span className="card-index">01 / MEMBER PERKS</span><h3>Đặc quyền<br/>dành cho thành viên.</h3><p>Những ưu đãi cụ thể từ cửa hàng tham gia — để mỗi lần ghé quán đều có thêm một lý do vui.</p></div>
        </article>
        <article className="benefit-card benefit-warm"><span className="card-index">02 / GROUP BUYING</span><div className="big-symbol">↗</div><h3>Mua chung,<br/><em>lợi ích chung.</em></h3><p>Khi nhiều người cùng có nhu cầu, sức mua cộng đồng có thể tạo ra điều kiện tốt hơn.</p><span className="card-decoration">CÙNG NHAU MUA TỐT HƠN</span></article>
        <article className="benefit-card benefit-green"><span className="card-index">03 / LOCAL DISCOVERY</span><div className="big-symbol">⌖</div><h3>Gần nhà hơn.<br/>Đáng thử hơn.</h3><p>Khám phá cửa hàng, món ngon và sản phẩm địa phương ngay trong cộng đồng của mình.</p><div className="green-orbit">X</div></article>
      </section>

      <section className="how-section" id="how">
        <div className="wrap how-layout">
          <div className="how-intro"><span className="eyebrow light">CÁCH XOÀI GO HOẠT ĐỘNG</span><h2>Rõ ràng từ lúc chọn.<br/><em>Yên tâm khi giao dịch.</em></h2><p>Xoài tập trung kết nối và tổ chức thông tin. Bạn biết mình đang mua gì, từ ai và theo điều kiện nào.</p><div className="how-visual"><img src="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=85" alt="Túi hàng mua sắm tại cửa hàng"/></div></div>
          <div className="step-list">{steps.map((step, i) => <div className="step" key={step[0]}><span className="step-no">0{i + 1}</span><div><h3>{step[0]}</h3><p>{step[1]}</p></div><span className="step-arrow">↗</span></div>)}</div>
        </div>
      </section>

      <section className="model-section wrap">
        <div className="model-copy"><span className="eyebrow">MINH BẠCH TRONG CÁCH KẾT NỐI</span><h2>Xoài kết nối.<br/><em>Cửa hàng phục vụ.</em></h2><p>Xoài Go không định trở thành một cửa hàng trung gian ôm hàng. Nền tảng hướng tới việc kết nối nhu cầu, giúp cửa hàng hiểu khách hơn và giúp người mua có thêm lựa chọn.</p><ul><li><span>✓</span> Khách hàng thanh toán trực tiếp với cửa hàng.</li><li><span>✓</span> Giá và điều kiện chương trình được công bố trước.</li><li><span>✓</span> Cửa hàng chủ động chuẩn bị và cung cấp sản phẩm.</li></ul></div>
        <div className="model-card"><div className="model-card-top"><span>XOÀI GO</span><img src="/xoai-mark.svg" alt=""/></div><div className="flow-node"><b>NGƯỜI MUA</b><small>Nhu cầu · Lựa chọn</small></div><div className="flow-connect">↕</div><div className="flow-platform"><img src="/xoai-mark.svg" alt=""/><div><b>KẾT NỐI CỘNG ĐỒNG</b><small>Ưu đãi · Gom nhu cầu</small></div></div><div className="flow-connect">↕</div><div className="flow-node"><b>CỬA HÀNG ĐỐI TÁC</b><small>Sản phẩm · Dịch vụ</small></div><div className="model-foot">THANH TOÁN TRỰC TIẾP TẠI CỬA HÀNG</div></div>
      </section>

      <section className="merchant-section" id="merchant"><div className="wrap merchant-layout"><div className="merchant-photo"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1100&q=85" alt="Chủ cửa hàng phục vụ khách hàng"/></div><div className="merchant-copy"><span className="eyebrow">DÀNH CHO CỬA HÀNG ĐỊA PHƯƠNG</span><h2>Khách hàng mới.<br/><em>Cơ hội phát triển mới.</em></h2><p>Xoài Go mong muốn đồng hành cùng những cửa hàng có sản phẩm và dịch vụ tốt, muốn tiếp cận cộng đồng khách hàng gần mình hơn.</p><div className="merchant-points"><div><b>01</b><span>Giới thiệu cửa hàng và ưu đãi đến cộng đồng</span></div><div><b>02</b><span>Thử nghiệm chương trình mua chung theo nhu cầu</span></div><div><b>03</b><span>Thêm một kênh xây dựng khách hàng quay lại</span></div></div><a className="btn btn-primary" href="#join">Tìm hiểu cơ hội hợp tác <span>↗</span></a></div></div></section>

      <section className="faq-section wrap" id="faq"><div className="faq-heading"><span className="eyebrow">BẠN CÓ THỂ ĐANG THẮC MẮC</span><h2>Hỏi nhanh,<br/><em>hiểu rõ về Xoài.</em></h2><p>Những nguyên tắc cốt lõi trong mô hình Xoài Go.</p></div><div className="faq-list">{faqs.map(([q, a], i) => <details key={q} className="faq-item"><summary><span>{q}</span><b>+</b></summary><p>{a}</p></details>)}</div></section>

      <section className="join-section" id="join"><div className="wrap join-inner"><img src="/xoai-mark.svg" alt=""/><div><span className="eyebrow light">XOÀI GO · ĐÀ NẴNG</span><h2>Cùng nhau mua tốt hơn.<br/><em>Bắt đầu từ những điều gần gũi.</em></h2><p>Xoài đang hoàn thiện nền tảng và kết nối những cửa hàng đầu tiên. Hẹn gặp bạn trong cộng đồng.</p></div><a className="btn btn-light" href="#merchant">Tôi muốn đồng hành <span>↗</span></a></div></section>

      <footer><div className="wrap footer-main"><a className="brand footer-brand" href="#"><img src="/xoai-mark.svg" alt=""/><span>Xoài<span className="brand-go">Go</span></span></a><div className="footer-tagline">Cùng nhau mua tốt hơn.</div><nav><a href="#how">Cách hoạt động</a><a href="#merchant">Đối tác</a><a href="#faq">Hỏi đáp</a></nav></div><div className="wrap footer-bottom"><span>© 2026 Xoài Go. Đang trong giai đoạn hoàn thiện nền tảng.</span><span>Made for local communities <b>✳</b></span></div></footer>
    </main>
  );
}
