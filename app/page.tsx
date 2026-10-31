export default function Home() {
  return (
    <main>
      <header className="nav wrap">
        <a className="brand" href="#"><span className="mark">X</span> xoài<span className="go">go</span></a>
        <nav><a href="#about">Về Xoài</a><a href="#benefits">Đặc quyền</a><a href="#partners">Đối tác</a></nav>
        <a className="nav-button" href="#join">Tham gia ngay ↗</a>
      </header>
      <section className="hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">CỘNG ĐỒNG TIÊU DÙNG ĐỊA PHƯƠNG</span>
          <h1>Đi ăn vui hơn.<br/><em>Mua sắm lợi hơn.</em></h1>
          <p>Xoài Go kết nối bạn với những cửa hàng địa phương, ưu đãi dành riêng cho thành viên và những chương trình mua chung tiết kiệm.</p>
          <div className="actions"><a className="button" href="#join">Khám phá Xoài Go ↗</a><a className="plain-link" href="#about">Tìm hiểu thêm ↓</a></div>
          <small className="note">Bắt đầu từ Đà Nẵng · Lan tỏa giá trị địa phương</small>
        </div>
        <div className="hero-art"><div className="halo"></div><div className="fruit">🥭</div><div className="deal deal-one"><b>Ưu đãi thành viên</b><span>Đặc quyền mỗi ngày</span><strong>−10%</strong></div><div className="deal deal-two"><b>Mua chung cộng đồng</b><span>Cùng mua · Cùng tiết kiệm</span></div><div className="art-label">LOCAL FINDS. BETTER DEALS.</div></div>
      </section>
      <div className="ticker">KHÁM PHÁ ĐỊA PHƯƠNG　✳　ƯU ĐÃI THIẾT THỰC　✳　MUA CHUNG CỘNG ĐỒNG　✳　KHÁM PHÁ ĐỊA PHƯƠNG　✳</div>
      <section className="section wrap" id="about">
        <div className="section-top"><div><span className="eyebrow">MỘT CÁCH TIÊU DÙNG MỚI</span><h2>Giá trị tốt hơn,<br/><em>bắt đầu từ kết nối.</em></h2></div><p>Xoài Go tạo nên một cộng đồng nơi người mua tìm được lựa chọn tốt hơn, còn cửa hàng địa phương có thêm cơ hội tiếp cận khách hàng.</p></div>
        <div className="cards" id="benefits">
          <article><span>01</span><div className="symbol">✳</div><h3>Ưu đãi thành viên</h3><p>Tiếp cận những ưu đãi thiết thực tại các cửa hàng đối tác trong cộng đồng Xoài.</p></article>
          <article><span>02</span><div className="symbol">↗</div><h3>Mua chung tiết kiệm</h3><p>Gom nhu cầu cùng mọi người để có thêm lựa chọn và mức giá tốt hơn.</p></article>
          <article><span>03</span><div className="symbol">⌖</div><h3>Khám phá quanh bạn</h3><p>Tìm món ngon, sản phẩm hay và những địa chỉ đáng trải nghiệm tại địa phương.</p></article>
        </div>
      </section>
      <section className="dark-section"><div className="wrap dark-inner"><div><span className="eyebrow">XOÀI GO HOẠT ĐỘNG THẾ NÀO?</span><h2>Đơn giản để tham gia.<br/><em>Thiết thực mỗi ngày.</em></h2></div><div className="steps"><div><b>01</b><p><strong>Khám phá</strong><br/>Tìm cửa hàng và chương trình phù hợp.</p></div><div><b>02</b><p><strong>Tham gia</strong><br/>Sử dụng ưu đãi hoặc góp đơn mua chung.</p></div><div><b>03</b><p><strong>Tận hưởng</strong><br/>Thanh toán trực tiếp với cửa hàng.</p></div></div></div></section>
      <section className="partner wrap" id="partners"><div><span className="eyebrow">DÀNH CHO CỬA HÀNG ĐỊA PHƯƠNG</span><h2>Cùng Xoài kết nối<br/><em>nhiều khách hàng hơn.</em></h2><p>Đưa cửa hàng của bạn đến gần cộng đồng, giới thiệu ưu đãi và cùng tạo nên những chương trình mua chung hấp dẫn.</p><a className="button" href="#join">Trở thành đối tác ↗</a></div><div className="partner-art"><div className="shop">YOUR LOCAL<br/>FAVORITE <b>✳</b><small>GROW TOGETHER</small></div></div></section>
      <section className="join wrap" id="join"><span className="mark large">X</span><div><span className="eyebrow">CỘNG ĐỒNG XOÀI GO</span><h2>Đi cùng nhau,<br/><em>lợi hơn mỗi ngày.</em></h2></div><div><p>Xoài đang từng bước hoàn thiện nền tảng và mở rộng mạng lưới cửa hàng đối tác tại Đà Nẵng.</p><a className="button" href="#join">Kết nối với Xoài ↗</a></div></section>
      <footer><div className="wrap foot"><a className="brand" href="#"><span className="mark">X</span> xoài<span className="go">go</span></a><span>© 2026 Xoài Go · Kết nối tiêu dùng địa phương</span><a href="#join">Kết nối với Xoài ↗</a></div></footer>
    </main>
  );
}
