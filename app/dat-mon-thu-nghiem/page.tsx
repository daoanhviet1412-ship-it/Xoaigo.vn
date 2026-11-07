"use client";

import { ArrowRight, CheckCircle2, MapPin, ShoppingBag, TicketPercent, Users, Store, Clock3 } from "lucide-react";

const CUSTOMER_APP = "https://datmon-user.vercel.app";
const MERCHANT_APP = "https://datmon-shop.vercel.app";

const categories = ["ĂN UỐNG", "CÀ PHÊ", "TRÀ SỮA", "BÁNH NGỌT", "ĐẶC SẢN ĐỊA PHƯƠNG", "MUA SẮM", "DỊCH VỤ"];

export default function PickupPreview() {
  return (
    <main className="px-page">
      <div className="px-preview-bar">XOÀI GO · BẢN THỬ NGHIỆM TRẢI NGHIỆM ĐẶT TRƯỚC & ĐẾN NHẬN</div>
      <header className="px-header">
        <a href="/" className="px-logo"><img src="/xoai-logo.svg" alt="Xoài Go"/></a>
        <div className="px-location"><MapPin size={15}/><span><small>KHU VỰC</small><b>Đà Nẵng</b></span></div>
        <a className="px-header-cta" href={CUSTOMER_APP}>Mở ứng dụng <ArrowRight size={15}/></a>
      </header>

      <section className="px-hero">
        <div className="px-hero-copy">
          <span className="px-eyebrow"><i/> ƯU ĐÃI ĐỊA PHƯƠNG · XOÀI GO</span>
          <h1>Ăn ngon hơn.<br/><em>Chi tiêu thông minh hơn.</em></h1>
          <p>Khám phá ưu đãi từ cửa hàng quanh bạn. Đặt trước, đến nhận tại quán và thanh toán trực tiếp — đơn giản, rõ ràng.</p>
          <div className="px-hero-actions">
            <a href={CUSTOMER_APP} className="px-button">Khám phá ưu đãi <ArrowRight size={16}/></a>
            <a href="#how" className="px-text-link">Cách hoạt động <span>↓</span></a>
          </div>
          <div className="px-trust"><span><CheckCircle2 size={15}/> Thanh toán tại cửa hàng</span><span><CheckCircle2 size={15}/> Không qua trung gian thanh toán</span></div>
        </div>
        <div className="px-hero-visual">
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85" alt="Bữa ăn tươi ngon"/>
          <div className="px-image-label"><TicketPercent size={19}/><span><small>ĐẶC QUYỀN THÀNH VIÊN</small><b>Ưu đãi từ quán bạn yêu thích</b></span></div>
        </div>
      </section>

      <div className="px-category-band"><div>{[...categories, ...categories].map((c, i) => <span key={i}>{c}<b>✳</b></span>)}</div></div>

      <section className="px-benefits">
        <div className="px-section-intro"><span className="px-eyebrow">MUA SẮM GẦN NHÀ, THÊM NHIỀU GIÁ TRỊ</span><h2>Mỗi lần ghé quán,<br/><em>thêm một quyền lợi.</em></h2><p>Xoài Go kết nối thành viên với cửa hàng địa phương qua ưu đãi và chương trình mua chung. Thông tin và điều kiện được công bố trước khi bạn tham gia.</p></div>
        <div className="px-benefit-list">
          <article><span className="px-benefit-icon"><TicketPercent/></span><div><small>01 · MEMBER PERKS</small><h3>Ưu đãi thành viên</h3><p>Tiếp cận mức giá và quyền lợi riêng tại các cửa hàng đối tác tham gia Xoài Go.</p></div><ArrowRight/></article>
          <article><span className="px-benefit-icon"><Users/></span><div><small>02 · GROUP BUYING</small><h3>Mua chung giá tốt</h3><p>Góp nhu cầu cùng cộng đồng để có cơ hội nhận mức giá và điều kiện mua tốt hơn.</p></div><ArrowRight/></article>
          <article><span className="px-benefit-icon"><Store/></span><div><small>03 · LOCAL PARTNERS</small><h3>Ủng hộ cửa hàng địa phương</h3><p>Khám phá những địa chỉ quanh bạn và giúp cửa hàng tốt tiếp cận thêm khách hàng.</p></div><ArrowRight/></article>
        </div>
      </section>

      <section className="px-how" id="how">
        <div className="px-how-image"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85" alt="Món ăn được chuẩn bị tại nhà hàng"/><div className="px-how-caption">ĐẶT TRƯỚC · ĐẾN NHẬN · THANH TOÁN TẠI QUÁN</div></div>
        <div className="px-how-copy"><span className="px-eyebrow px-light">NHANH GỌN TRONG 3 BƯỚC</span><h2>Chọn ưu đãi.<br/><em>Đặt trước. Ghé lấy.</em></h2><div className="px-steps">
          <div><b>01</b><span><strong>Khám phá ưu đãi quanh bạn</strong><small>Xem chương trình đang được cửa hàng công bố và chọn ưu đãi phù hợp.</small></span></div>
          <div><b>02</b><span><strong>Đặt trước trên ứng dụng</strong><small>Xác nhận lựa chọn và nhận thông tin/mã đặt chỗ theo chương trình.</small></span></div>
          <div><b>03</b><span><strong>Đến cửa hàng và thanh toán</strong><small>Đưa mã cho nhân viên, nhận sản phẩm và thanh toán trực tiếp tại quầy.</small></span></div>
        </div><a className="px-button px-button-light" href={CUSTOMER_APP}>Mở ứng dụng khách hàng <ArrowRight size={16}/></a></div>
      </section>

      <section className="px-merchants">
        <div><span className="px-eyebrow">DÀNH CHO CỬA HÀNG</span><h2>Thêm khách ghé quán.<br/><em>Tăng giá trị mỗi ngày.</em></h2><p>Chủ động giới thiệu ưu đãi, thiết lập số lượng và thời gian áp dụng. Khách đặt trước, đến nhận và thanh toán trực tiếp với cửa hàng.</p><ul><li><CheckCircle2/> Tự công bố ưu đãi và điều kiện rõ ràng</li><li><CheckCircle2/> Chủ động số lượng và khung giờ nhận</li><li><CheckCircle2/> Tiền bán hàng nhận trực tiếp tại quán</li></ul><a className="px-button" href={MERCHANT_APP}>Mở ứng dụng cửa hàng <ArrowRight size={16}/></a></div>
        <div className="px-merchant-image"><img src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1100&q=85" alt="Không gian cửa hàng địa phương"/></div>
      </section>

      <section className="px-bottom-cta"><span className="px-eyebrow px-light">XOÀI GO · ĐÀ NẴNG</span><h2>Cùng nhau mua tốt hơn.</h2><p>Khám phá ứng dụng Xoài Go và những cửa hàng đang đồng hành.</p><a className="px-button px-button-light" href={CUSTOMER_APP}>Bắt đầu khám phá <ArrowRight size={16}/></a></section>
      <footer className="px-footer"><a href="/"><img src="/xoai-logo.svg" alt="Xoài Go"/></a><span>© 2026 Xoài Go · Kết nối người mua với cửa hàng địa phương.</span><a href={MERCHANT_APP}>Dành cho cửa hàng <ArrowRight size={14}/></a></footer>

      <style jsx global>{`
        .px-page{--px-green:#244632;--px-green2:#365c43;--px-gold:#e5b63f;--px-cream:#fbf8f0;--px-muted:#778276;background:var(--px-cream);color:#27392d;min-height:100vh;font-family:Arial,Helvetica,sans-serif}
        .px-page *{box-sizing:border-box}.px-preview-bar{height:30px;background:#244632;color:#f4d98b;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;letter-spacing:1.5px}
        .px-header{height:76px;max-width:1180px;margin:auto;padding:0 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e9e4d8}
        .px-logo img{width:132px;height:auto;max-height:48px;object-fit:contain;object-position:left center}.px-location{display:flex;align-items:center;gap:9px;color:#657366}.px-location small,.px-location b{display:block}.px-location small{font-size:8px;letter-spacing:1.2px;color:#9a9f94}.px-location b{font-size:12px;margin-top:3px;color:#344638}
        .px-header-cta{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #e5e0d4;border-radius:30px;padding:11px 17px;color:#304633;font-size:11px;font-weight:700}
        .px-hero{max-width:1180px;margin:auto;padding:68px 28px 74px;display:grid;grid-template-columns:1fr .92fr;gap:65px;align-items:center}
        .px-eyebrow{font-size:9px;letter-spacing:1.8px;font-weight:800;color:#a17a25;display:inline-flex;align-items:center;gap:8px}.px-eyebrow i{width:7px;height:7px;border-radius:50%;background:#91a86c}
        .px-hero h1{font-size:clamp(43px,5.3vw,68px);line-height:1.08;letter-spacing:-3px;margin:22px 0 19px;color:#253e2e}.px-hero h1 em,.px-section-intro h2 em,.px-how-copy h2 em,.px-merchants h2 em{font-family:Georgia,serif;font-weight:500;color:#c18e25}
        .px-hero-copy>p,.px-section-intro>p,.px-merchants>div:first-child>p{font-size:14px;line-height:1.85;color:#748074;max-width:480px;margin:0}
        .px-hero-actions{display:flex;align-items:center;gap:24px;margin-top:28px}.px-button{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:15px 21px;border-radius:30px;background:#e9bd4b;color:#293d2e;font-size:11px;font-weight:800;box-shadow:0 8px 20px #b48c3020}.px-text-link{font-size:11px;font-weight:700;color:#596b5b}.px-text-link span{margin-left:6px;color:#b68b2b}
        .px-trust{display:flex;gap:18px;flex-wrap:wrap;margin-top:25px;color:#758174;font-size:10px}.px-trust span{display:flex;align-items:center;gap:6px}.px-trust svg{color:#78925c}
        .px-hero-visual{height:390px;position:relative;border-radius:18px;overflow:visible}.px-hero-visual>img{width:100%;height:100%;object-fit:cover;border-radius:18px}.px-image-label{position:absolute;left:-22px;bottom:23px;display:flex;align-items:center;gap:12px;padding:14px 18px;background:#fffdf6;border:1px solid #eee5d3;border-radius:12px;box-shadow:0 10px 28px #263a2a16;color:#a17a25}.px-image-label small,.px-image-label b{display:block}.px-image-label small{font-size:8px;letter-spacing:1px;color:#9a8a68}.px-image-label b{font-size:12px;color:#354a38;margin-top:4px}
        .px-category-band{background:#e9bd4b;overflow:hidden;padding:15px 0;white-space:nowrap}.px-category-band>div{display:flex;justify-content:space-around;gap:30px;min-width:100%;}.px-category-band span{font-size:9px;font-weight:800;letter-spacing:1.5px;color:#5c4720}.px-category-band b{color:#9b7120;margin-left:24px}
        .px-benefits{max-width:1180px;margin:auto;padding:93px 28px 105px;display:grid;grid-template-columns:.8fr 1.2fr;gap:95px;align-items:center}.px-section-intro h2,.px-how-copy h2,.px-merchants h2{font-size:43px;line-height:1.13;letter-spacing:-1.9px;margin:18px 0}.px-section-intro>p{font-size:12px;line-height:1.9}
        .px-benefit-list{border-top:1px solid #e5dfd2}.px-benefit-list article{display:grid;grid-template-columns:48px 1fr 20px;gap:16px;align-items:center;padding:20px 0;border-bottom:1px solid #e5dfd2}.px-benefit-icon{width:42px;height:42px;border-radius:12px;background:#f2ebd8;color:#9a7727;display:grid;place-items:center}.px-benefit-icon svg{width:19px}.px-benefit-list small{font-size:8px;letter-spacing:1.3px;color:#a18a5c;font-weight:800}.px-benefit-list h3{font-size:16px;margin:5px 0;color:#314735}.px-benefit-list p{font-size:11px;line-height:1.7;color:#818a7e;margin:0;max-width:480px}.px-benefit-list article>svg{width:16px;color:#a17b28}
        .px-how{background:#294633;display:grid;grid-template-columns:1fr 1fr;min-height:500px}.px-how-image{position:relative;min-height:500px}.px-how-image>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.px-how-caption{position:absolute;left:24px;bottom:24px;background:#fffdf2eF;padding:12px 15px;border-radius:8px;color:#344735;font-size:8px;font-weight:800;letter-spacing:1px}.px-how-copy{padding:70px clamp(35px,7vw,100px);color:white;align-self:center}.px-light{color:#e6c36a}.px-how-copy h2{font-size:40px;color:white;margin:18px 0 28px}.px-how-copy h2 em{color:#e7c45d}.px-steps{border-top:1px solid #ffffff40;margin-bottom:26px}.px-steps>div{display:grid;grid-template-columns:32px 1fr;gap:13px;padding:17px 0;border-bottom:1px solid #ffffff40}.px-steps>div>b{font-size:10px;color:#e8c45e}.px-steps strong,.px-steps small{display:block}.px-steps strong{font-size:12px}.px-steps small{font-size:10px;line-height:1.6;color:#d6dfd5;margin-top:5px}.px-button-light{background:#f1cc64;color:#263d2e}
        .px-merchants{max-width:1180px;margin:auto;padding:95px 28px;display:grid;grid-template-columns:1fr .9fr;gap:75px;align-items:center}.px-merchants h2{font-size:40px}.px-merchants>div:first-child>p{font-size:12px;line-height:1.9}.px-merchants ul{list-style:none;padding:0;margin:23px 0 28px}.px-merchants li{display:flex;align-items:center;gap:9px;margin:12px 0;font-size:11px;color:#637164}.px-merchants li svg{width:15px;color:#81985f}.px-merchant-image{height:355px;border-radius:16px;overflow:hidden}.px-merchant-image img{width:100%;height:100%;object-fit:cover}
        .px-bottom-cta{background:#294633;text-align:center;color:white;padding:65px 20px}.px-bottom-cta h2{font-size:34px;letter-spacing:-1px;margin:14px 0}.px-bottom-cta p{font-size:12px;color:#d8e0d5;margin:0 0 23px}.px-footer{max-width:1180px;margin:auto;padding:23px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px}.px-footer img{width:105px}.px-footer span,.px-footer>a:last-child{font-size:9px;color:#899185}.px-footer>a:last-child{display:flex;align-items:center;gap:6px}
        @media(max-width:760px){.px-preview-bar{font-size:7px;letter-spacing:.8px;padding:0 8px;text-align:center}.px-header{height:65px;padding:0 16px}.px-logo img{width:108px}.px-location{margin-left:auto;margin-right:12px}.px-header-cta{padding:9px 11px;font-size:9px}.px-hero{padding:38px 18px 42px;display:flex;flex-direction:column;gap:25px;align-items:stretch}.px-hero h1{font-size:43px;letter-spacing:-2px;margin:16px 0}.px-hero-copy>p{font-size:12px}.px-hero-visual{height:235px}.px-image-label{left:10px;bottom:12px;padding:10px 12px}.px-image-label b{font-size:10px}.px-trust{gap:10px;font-size:9px}.px-category-band{padding:12px 0}.px-category-band>div{justify-content:flex-start;gap:22px;width:max-content;padding-left:18px}.px-category-band span{font-size:8px}.px-benefits{padding:55px 18px 60px;display:block}.px-section-intro h2,.px-how-copy h2,.px-merchants h2{font-size:34px}.px-section-intro>p{margin-bottom:27px}.px-benefit-list article{grid-template-columns:40px 1fr 16px;gap:11px}.px-benefit-icon{width:36px;height:36px}.px-benefit-list h3{font-size:14px}.px-how{display:flex;flex-direction:column}.px-how-image{min-height:230px}.px-how-copy{padding:40px 20px 45px}.px-how-copy h2{font-size:35px}.px-merchants{padding:58px 18px;display:flex;flex-direction:column-reverse;gap:30px}.px-merchant-image{width:100%;height:230px}.px-bottom-cta{padding:50px 18px}.px-bottom-cta h2{font-size:29px}.px-footer{padding:20px 18px;flex-wrap:wrap}.px-footer span{order:3;width:100%}}
      `}</style>
    </main>
  );
}
