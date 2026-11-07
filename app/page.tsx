"use client";

import { useState } from "react";

const categories = [
  ["🍜", "Ăn uống"], ["☕", "Cà phê"], ["🧋", "Trà sữa"], ["🥬", "Thực phẩm"],
  ["🛍️", "Mua sắm"], ["💆", "Làm đẹp"], ["🎟️", "Giải trí"], ["🧰", "Dịch vụ"],
];
const steps = [
  ["Khám phá quanh bạn", "Tìm cửa hàng, quyền lợi thành viên và chương trình mua chung phù hợp với nhu cầu."],
  ["Chọn quyền lợi muốn dùng", "Xem rõ ưu đãi, giá, điều kiện và thời hạn trước khi xác nhận tham gia."],
  ["Đến cửa hàng và trải nghiệm", "Sử dụng quyền lợi theo hướng dẫn của chương trình. Mọi thông tin giao dịch được thể hiện minh bạch."],
];
const merchantSteps = [
  ["Tìm hiểu mô hình", "Xoài cùng cửa hàng xác định mục tiêu: thêm khách mới, tăng khách quay lại hay tối ưu đầu vào."],
  ["Thiết kế quyền lợi", "Cùng xây dựng ưu đãi và chương trình phù hợp với sản phẩm, biên lợi nhuận và năng lực phục vụ."],
  ["Kết nối khách hàng", "Đưa cửa hàng và chương trình tiếp cận cộng đồng người tiêu dùng trong khu vực."],
  ["Theo dõi hiệu quả", "Đo lường lượt quan tâm, giao dịch và phản hồi để điều chỉnh chương trình."],
];
const faqs = [
  ["Xoài Go là gì?", "Xoài Go là nền tảng kết nối người tiêu dùng với cửa hàng địa phương. Xoài tổ chức quyền lợi thành viên, chương trình mua chung và các hoạt động giúp cửa hàng tiếp cận khách hàng hiệu quả hơn."],
  ["Xoài Go chỉ dành cho ăn uống?", "Không. Ăn uống là nhóm nhu cầu gần gũi để bắt đầu, nhưng định hướng Xoài Go mở rộng sang thực phẩm, mua sắm và các dịch vụ tiêu dùng thường ngày."],
  ["Thành viên nhận được quyền lợi gì?", "Thành viên có thể tiếp cận ưu đãi tại cửa hàng đối tác, tham gia chương trình mua chung và khám phá những lựa chọn phù hợp trong khu vực. Quyền lợi cụ thể được công bố theo từng cửa hàng và chương trình."],
  ["Cửa hàng tham gia Xoài được gì?", "Cửa hàng có thêm kênh tiếp cận khách mới, công cụ xây dựng ưu đãi và chương trình khách hàng quay lại, đồng thời có thể kết nối nhu cầu mua chung để tối ưu chi phí đầu vào."],
  ["Mua chung hoạt động như thế nào?", "Xoài kết nối nhu cầu của nhiều người cho cùng một sản phẩm hoặc dịch vụ. Mỗi chương trình sẽ công bố rõ mức giá, số lượng, thời hạn, điều kiện và cách nhận hàng trước khi khách xác nhận."],
  ["Thanh toán và đối soát được thực hiện ra sao?", "Phương thức thanh toán, ghi nhận quyền lợi và đối soát được thông báo theo từng loại giao dịch. Khách hàng cần xem kỹ thông tin hiển thị trong chương trình trước khi xác nhận."],
  ["Xoài Go đã hoạt động chính thức chưa?", "Website đang giới thiệu mô hình và tiếp nhận sự quan tâm từ người tiêu dùng, cửa hàng. Các khu vực, cửa hàng và chương trình sẽ được cập nhật khi sẵn sàng triển khai."],
];

export default function Home() {
  const [city, setCity] = useState("Đà Nẵng");
  return (
    <main>
      <header className="topbar">
        <a href="#" className="brand" aria-label="Xoài Go"><img src="/xoai-logo.svg" alt="Xoài Go"/></a>
        <nav className="main-nav"><a href="#how">Cách hoạt động</a><a href="#benefits">Quyền lợi</a><a href="#for-shops">Dành cho cửa hàng</a><a href="#faq">FAQ</a></nav>
        <div className="top-actions"><label className="city"><span>⌖</span><select value={city} onChange={e=>setCity(e.target.value)} aria-label="Khu vực"><option>Đà Nẵng</option><option>Hội An</option><option>Huế</option></select></label><a className="top-cta" href="#join">Tham gia Xoài <span>↗</span></a></div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow"><i/> CỘNG ĐỒNG TIÊU DÙNG ĐỊA PHƯƠNG · {city.toUpperCase()}</div>
          <h1>Mua sắm mỗi ngày.<br/><em>Giá trị nhiều hơn.</em></h1>
          <p className="hero-copy">Khám phá cửa hàng quanh bạn, tận hưởng quyền lợi thành viên và kết nối sức mua cộng đồng — để người tiêu dùng mua tốt hơn, cửa hàng phát triển tốt hơn.</p>
          <div className="hero-actions"><a className="btn btn-primary" href="#how">Khám phá cách hoạt động <span>→</span></a><a className="hero-secondary" href="#for-shops">Bạn là chủ cửa hàng? <span>↗</span></a></div>
          <p className="hero-footnote">Bắt đầu từ Đà Nẵng · Kết nối người mua và cửa hàng địa phương</p>
        </div>
        <div className="hero-image">
          <img src="https://i.ibb.co/JW6qRQSr/5c20bff2-6a73-41ab-a43f-f21bd99693e3.png" alt="Hình ảnh cộng đồng và trải nghiệm Xoài Go"/>
          <div className="hero-tag"><b>XOÀI GO</b><span>Cùng nhau mua tốt hơn.</span></div>
        </div>
      </section>

      <section className="category-band" aria-label="Các nhóm tiêu dùng"><div className="category-caption">KHÁM PHÁ NHU CẦU HẰNG NGÀY</div><div className="category-track">{categories.map(([icon,name])=><div className="category" key={name}><span>{icon}</span><b>{name}</b></div>)}</div></section>

      <section className="proof-row"><div><strong>01</strong><span>Một cộng đồng<br/>tiêu dùng địa phương</span></div><div><strong>02</strong><span>Quyền lợi thiết thực<br/>cho thành viên</span></div><div><strong>03</strong><span>Thêm cơ hội phát triển<br/>cho cửa hàng</span></div></section>

      <section className="how-section" id="how">
        <div className="section-head"><div><div className="eyebrow">CÁCH XOÀI GO HOẠT ĐỘNG</div><h2>Đơn giản để tham gia.<br/><em>Rõ ràng trong từng bước.</em></h2></div><p>Từ lúc khám phá đến khi sử dụng quyền lợi, các thông tin quan trọng đều được công bố để bạn chủ động lựa chọn.</p></div>
        <div className="steps-grid">{steps.map(([title,desc],i)=><article className="step-card" key={title}><span className="step-index">0{i+1}</span><div className="step-symbol">{["⌕","✳","✓"][i]}</div><h3>{title}</h3><p>{desc}</p></article>)}</div>
        <div className="how-visual"><img src="https://i.ibb.co/Z9Zym05/Mi-Qua-ng-ga-giu-a-sa-c-xanh-mo-c-ma-c.png" alt="Món ăn tại cửa hàng địa phương"/><div className="visual-copy"><span>LOCAL DISCOVERY</span><strong>Những lựa chọn tốt<br/>ngay quanh bạn.</strong><p>Không chỉ là một ưu đãi. Là cách khám phá và kết nối với cửa hàng địa phương.</p></div></div>
      </section>

      <section className="for-shops" id="for-shops">
        <div className="shop-visual"><img src="https://i.ibb.co/pvKYRDNQ/Bu-a-to-i-a-m-cu-ng-du-o-i-e-n-ma-y.png" alt="Không gian cửa hàng và nhân viên phục vụ khách"/></div>
        <div className="shop-content"><div className="eyebrow light">DÀNH CHO CỬA HÀNG & ĐỐI TÁC</div><h2>Thêm khách hàng mới.<br/><em>Tăng trưởng có chiến lược.</em></h2><p>Xoài không chỉ giới thiệu cửa hàng. Chúng tôi cùng đối tác thiết kế chương trình phù hợp để tăng lượt khách, khuyến khích khách quay lại và tối ưu hoạt động kinh doanh.</p>
          <div className="shop-steps">{merchantSteps.map(([title,desc],i)=><div className="shop-step" key={title}><b>0{i+1}</b><span><strong>{title}</strong><small>{desc}</small></span></div>)}</div>
          <a className="btn btn-yellow" href="#join">Tìm hiểu cơ hội hợp tác <span>↗</span></a>
        </div>
      </section>

      <section className="benefits-section" id="benefits">
        <div className="section-head"><div><div className="eyebrow">GIÁ TRỊ CHO HAI PHÍA</div><h2>Người mua có lợi.<br/><em>Cửa hàng cũng phát triển.</em></h2></div><p>Một nền tảng chỉ có giá trị khi tạo ra lợi ích thực tế cho cả người tiêu dùng lẫn đơn vị cung cấp sản phẩm, dịch vụ.</p></div>
        <div className="benefit-list">
          <article><div className="benefit-image"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85" alt="Bữa ăn đa dạng"/></div><div><span>01 / FOR MEMBERS</span><h3>Chi tiêu hợp lý hơn</h3><p>Tiếp cận ưu đãi rõ ràng, quyền lợi thành viên và chương trình mua chung cho nhu cầu hằng ngày.</p></div></article>
          <article><div className="benefit-image"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85" alt="Khách hàng thanh toán tại cửa hàng"/></div><div><span>02 / FOR MERCHANTS</span><h3>Tiếp cận khách hàng tốt hơn</h3><p>Có thêm kênh giới thiệu cửa hàng, xây dựng chương trình và tạo lý do để khách quay lại.</p></div></article>
          <article><div className="benefit-image"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85" alt="Nông sản và thực phẩm tươi"/></div><div><span>03 / GROUP BUYING</span><h3>Tận dụng sức mua cộng đồng</h3><p>Kết nối nhu cầu để có cơ hội mua với điều kiện tốt hơn và tối ưu chi phí đầu vào.</p></div></article>
        </div>
      </section>

      <section className="faq-section" id="faq"><div className="faq-intro"><div className="eyebrow">FAQ · XOÀI GO</div><h2>Câu hỏi thường gặp.</h2><p>Những thông tin cơ bản trước khi bạn tham gia cộng đồng hoặc đăng ký cửa hàng đối tác.</p></div><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<b>+</b></summary><p>{a}</p></details>)}</div></section>

      <section className="join-section" id="join"><div><div className="eyebrow light">CÙNG XÂY DỰNG CỘNG ĐỒNG</div><h2>Bạn là người tiêu dùng?<br/><em>Hay một cửa hàng địa phương?</em></h2><p>Hãy để lại sự quan tâm và đồng hành cùng Xoài Go trong giai đoạn kết nối những đối tác đầu tiên.</p></div><div className="join-actions"><a className="btn btn-white" href="#how">Tìm hiểu Xoài Go <span>↗</span></a><a className="join-text" href="#for-shops">Tôi muốn trở thành đối tác</a></div></section>

      <footer className="footer"><div className="footer-main"><a href="#"><img src="/xoai-logo.svg" alt="Xoài Go"/></a><p>Cộng đồng tiêu dùng địa phương.<br/>Cùng nhau mua tốt hơn.</p><nav><a href="#how">Cách hoạt động</a><a href="#benefits">Quyền lợi</a><a href="#for-shops">Đối tác</a><a href="#faq">FAQ</a></nav></div><div className="footer-bottom"><span>© 2026 Xoài Go. Nội dung được cập nhật theo từng giai đoạn triển khai.</span><span>Made for local communities <b>✳</b></span></div></footer>
    </main>
  );
}
