"use client";

import { ArrowRight, CheckCircle2, Users, Store, TicketPercent, TrendingUp, Boxes, Handshake, Wallet, ClipboardList, MapPin } from "lucide-react";

const CUSTOMER_APP = "https://datmon-user.vercel.app";
const MERCHANT_APP = "https://datmon-shop.vercel.app";
const categories = ["ĂN UỐNG", "CÀ PHÊ", "TRÀ SỮA", "MUA SẮM", "ĐẶC SẢN", "DỊCH VỤ", "NHU YẾU PHẨM"];

export default function XoaiPreview() {
  return (
    <main className="xg">
      <div className="xg-topline">XOÀI GO · CỘNG ĐỒNG TIÊU DÙNG & ĐỐI TÁC ĐỊA PHƯƠNG</div>
      <header className="xg-nav">
        <a href="/" className="xg-logo"><img src="/xoai-logo.svg" alt="Xoài Go"/></a>
        <div className="xg-place"><MapPin size={15}/><span><small>KHU VỰC</small><b>Đà Nẵng</b></span></div>
        <a className="xg-nav-cta" href={CUSTOMER_APP}>Tham gia Xoài Go <ArrowRight size={15}/></a>
      </header>

      <section className="xg-hero">
        <div className="xg-hero-copy">
          <span className="xg-kicker"><i/> CỘNG ĐỒNG TIÊU DÙNG THÔNG MINH</span>
          <h1>Chi tiêu mỗi ngày.<br/><em>Nhận thêm giá trị.</em></h1>
          <p>Xoài Go kết nối bạn với các cửa hàng địa phương để hưởng ưu đãi thành viên, mua chung giá tốt và tiếp cận những quyền lợi thiết thực trong các nhu cầu hằng ngày.</p>
          <div className="xg-actions"><a className="xg-btn" href={CUSTOMER_APP}>Dành cho khách hàng <ArrowRight size={16}/></a><a className="xg-link" href="#merchant">Tôi có cửa hàng <span>↓</span></a></div>
          <div className="xg-proof"><span><CheckCircle2/> Ưu đãi rõ điều kiện</span><span><CheckCircle2/> Thanh toán trực tiếp tại cửa hàng</span></div>
        </div>
        <div className="xg-hero-photo"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85" alt="Bữa ăn và trải nghiệm tiêu dùng"/><div className="xg-photo-note"><TicketPercent/><span><small>ĐẶC QUYỀN THÀNH VIÊN</small><b>Tiết kiệm từ những lần mua quen thuộc</b></span></div></div>
      </section>

      <div className="xg-category"><div>{[...categories,...categories].map((c,i)=><span key={i}>{c}<b>✳</b></span>)}</div></div>

      <section className="xg-customer" id="customer">
        <div className="xg-intro"><span className="xg-kicker">DÀNH CHO KHÁCH HÀNG</span><h2>Không chỉ săn khuyến mãi.<br/><em>Mà tiết kiệm đều đặn.</em></h2><p>Xoài Go hướng đến những khoản chi tiêu bạn vẫn phát sinh mỗi ngày. Thay vì chỉ tìm một deal thật rẻ, bạn có thêm lý do để mua sắm thông minh tại những cửa hàng mình tin chọn.</p><a className="xg-underlink" href={CUSTOMER_APP}>Khám phá ứng dụng khách hàng <ArrowRight size={15}/></a></div>
        <div className="xg-customer-list">
          <article><span className="xg-icon"><TicketPercent/></span><div><small>01 · MEMBER BENEFITS</small><h3>Ưu đãi thành viên tại cửa hàng</h3><p>Một tài khoản thành viên để tiếp cận quyền lợi riêng tại các cửa hàng tham gia Xoài Go — kể cả những nơi bạn thường xuyên ghé.</p></div></article>
          <article><span className="xg-icon"><Users/></span><div><small>02 · COMMUNITY BUYING</small><h3>Mua chung để có giá tốt hơn</h3><p>Góp nhu cầu với cộng đồng. Khi nhiều người cùng mua, cửa hàng và nhà cung cấp có cơ sở đưa ra mức giá và điều kiện tốt hơn.</p></div></article>
          <article><span className="xg-icon"><Wallet/></span><div><small>03 · SIMPLE & TRANSPARENT</small><h3>Giao dịch đơn giản, minh bạch</h3><p>Xem rõ giá, ưu đãi và điều kiện trước khi tham gia. Với giao dịch tại cửa hàng, bạn thanh toán trực tiếp cho cửa hàng, Xoài không giữ tiền của bạn.</p></div></article>
          <article><span className="xg-icon"><TrendingUp/></span><div><small>04 · EVERYDAY SAVINGS</small><h3>Giá trị tích lũy theo thói quen</h3><p>Lợi ích đến từ những lần ăn uống, mua sắm và sử dụng dịch vụ thường ngày — không phụ thuộc vào việc chờ một đợt khuyến mãi lớn.</p></div></article>
        </div>
      </section>

      <section className="xg-how" id="how">
        <div className="xg-how-photo"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85" alt="Cửa hàng chuẩn bị món ăn"/><span>KHÁM PHÁ · ĐẶT TRƯỚC · ĐẾN NHẬN</span></div>
        <div className="xg-how-copy"><span className="xg-kicker xg-light">CÁCH THAM GIA</span><h2>Tham gia dễ dàng.<br/><em>Quyền lợi rõ ràng.</em></h2>
          <div className="xg-steps">
            <div><b>01</b><span><strong>Tạo tài khoản thành viên</strong><small>Sử dụng tài khoản trên ứng dụng Xoài Go.</small></span></div>
            <div><b>02</b><span><strong>Chọn cửa hàng hoặc chương trình mua chung</strong><small>Xem quyền lợi, giá, thời hạn và điều kiện áp dụng.</small></span></div>
            <div><b>03</b><span><strong>Sử dụng ưu đãi và thanh toán</strong><small>Đưa thông tin/mã xác nhận cho cửa hàng và thanh toán trực tiếp theo hướng dẫn.</small></span></div>
          </div>
          <a className="xg-btn xg-btn-light" href={CUSTOMER_APP}>Mở ứng dụng khách hàng <ArrowRight size={16}/></a>
        </div>
      </section>

      <section className="xg-merchant" id="merchant">
        <div className="xg-merchant-copy"><span className="xg-kicker">DÀNH CHO CHỦ CỬA HÀNG</span><h2>Không chỉ có thêm lượt thấy.<br/><em>Mà có thêm khách quay lại.</em></h2><p>Xoài Go muốn trở thành đối tác phát triển kinh doanh cùng cửa hàng: kết nối khách hàng, hỗ trợ xây dựng chương trình thành viên và giúp cửa hàng khai thác tốt hơn nguồn lực sẵn có.</p>
          <ul>
            <li><CheckCircle2/> Tiếp cận cộng đồng khách hàng mới trong khu vực</li>
            <li><CheckCircle2/> Tạo lý do để khách cũ quay lại thường xuyên</li>
            <li><CheckCircle2/> Tự thiết kế ưu đãi theo sản phẩm, số lượng và khung giờ</li>
            <li><CheckCircle2/> Khách đặt trước, cửa hàng phục vụ và thu tiền trực tiếp</li>
          </ul>
          <a className="xg-btn" href={MERCHANT_APP}>Dành cho cửa hàng <ArrowRight size={16}/></a>
        </div>
        <div className="xg-merchant-photo"><img src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1100&q=85" alt="Không gian cửa hàng địa phương"/></div>
      </section>

      <section className="xg-shop-value">
        <div className="xg-shop-heading"><span className="xg-kicker">ĐỒNG HÀNH CÙNG CỬA HÀNG</span><h2>Xoài cùng cửa hàng<br/><em>phát triển bền vững.</em></h2><p>Không dừng ở việc đăng ưu đãi. Xoài hướng đến hỗ trợ cửa hàng làm kinh doanh bài bản hơn.</p></div>
        <div className="xg-shop-grid">
          <article><span><ClipboardList/></span><small>01 · PROFESSIONALIZE</small><h3>Chuẩn hóa cách bán hàng</h3><p>Cùng cửa hàng hoàn thiện menu, thông tin sản phẩm, giá bán, quy trình nhận đơn và phục vụ để khách dễ chọn, dễ mua.</p></article>
          <article><span><TrendingUp/></span><small>02 · CUSTOMER RETENTION</small><h3>Tăng khách quay lại</h3><p>Xây dựng ưu đãi thành viên và chương trình chăm sóc phù hợp, thay cho giảm giá đại trà làm mỏng lợi nhuận.</p></article>
          <article><span><Boxes/></span><small>03 · GROUP PROCUREMENT</small><h3>Tối ưu chi phí đầu vào</h3><p>Kết nối nhu cầu nhập hàng của nhiều cửa hàng để tạo sức mua chung, tăng cơ hội đàm phán giá và điều kiện cung ứng.</p></article>
          <article><span><Handshake/></span><small>04 · GROWTH PARTNER</small><h3>Đồng hành tăng trưởng</h3><p>Xoài có thể tư vấn cách xây dựng sản phẩm, định giá và trải nghiệm phục vụ để cửa hàng nâng giá trị đơn hàng bằng chất lượng thật.</p></article>
        </div>
      </section>

      <section className="xg-model">
        <span className="xg-kicker xg-light">MỘT CỘNG ĐỒNG · BA BÊN CÙNG CÓ LỢI</span><h2>Khi nhu cầu được kết nối,<br/><em>giá trị được chia sẻ.</em></h2>
        <div className="xg-model-grid">
          <article><Users/><b>Khách hàng</b><p>Tiết kiệm chi tiêu, có thêm lựa chọn và quyền lợi thiết thực.</p></article>
          <article><Store/><b>Cửa hàng</b><p>Có thêm khách mới, tăng khách quay lại và tối ưu chi phí kinh doanh.</p></article>
          <article><Handshake/><b>Xoài Go</b><p>Tạo doanh thu từ dịch vụ kết nối và giao dịch phát sinh minh bạch.</p></article>
        </div>
        <p className="xg-model-note">Xoài Go kết nối người mua với đơn vị cung cấp. Khách hàng thanh toán trực tiếp cho cửa hàng/nhà cung cấp; Xoài Go không giữ tiền thanh toán của khách.</p>
      </section>

      <section className="xg-faq">
        <div><span className="xg-kicker">THÔNG TIN MINH BẠCH</span><h2>Một vài điều<br/><em>bạn nên biết.</em></h2><p>Tham gia khi bạn hiểu rõ quyền lợi, cách hoạt động và điều kiện của từng chương trình.</p></div>
        <div className="xg-faq-list">
          <details><summary>Xoài Go có phải ứng dụng săn deal không?</summary><p>Không chỉ vậy. Ưu đãi là một phần; định hướng của Xoài là cộng đồng tiêu dùng giúp thành viên tiết kiệm trong chi tiêu hằng ngày và kết nối cửa hàng địa phương.</p></details>
          <details><summary>Xoài Go có giữ tiền hoặc thu hộ khách hàng không?</summary><p>Định hướng hiện tại là khách hàng thanh toán trực tiếp cho cửa hàng hoặc nhà cung cấp. Xoài Go không giữ tiền thanh toán của khách.</p></details>
          <details><summary>Phí thành viên đã được áp dụng chưa?</summary><p>Mức phí 30.000 đồng/tháng từng được đưa ra để nghiên cứu. Chính sách chính thức, quyền lợi đi kèm và thời điểm áp dụng sẽ được công bố trước khi mở đăng ký.</p></details>
          <details><summary>Cửa hàng có phải giảm giá tất cả sản phẩm không?</summary><p>Không. Cửa hàng chủ động chọn sản phẩm, mức ưu đãi, số lượng và thời gian áp dụng. Mục tiêu là tạo chương trình phù hợp để có thêm khách và tăng khả năng quay lại.</p></details>
          <details><summary>Mua chung có gì khác ưu đãi thành viên?</summary><p>Ưu đãi thành viên áp dụng theo chính sách của từng cửa hàng. Mua chung là chương trình tập hợp nhu cầu của nhiều người để thương lượng giá hoặc điều kiện mua tốt hơn; thông tin từng chương trình sẽ được công bố rõ.</p></details>
        </div>
      </section>

      <section className="xg-final"><span className="xg-kicker xg-light">XOÀI GO · ĐÀ NẴNG</span><h2>Cùng nhau mua tốt hơn.<br/><em>Cùng nhau kinh doanh tốt hơn.</em></h2><p>Tham gia cộng đồng tiêu dùng và cửa hàng đang xây dựng một cách mua bán có lợi cho cả hai bên.</p><div><a className="xg-btn xg-btn-light" href={CUSTOMER_APP}>Tôi là khách hàng <ArrowRight size={15}/></a><a className="xg-outline" href={MERCHANT_APP}>Tôi là cửa hàng <ArrowRight size={15}/></a></div></section>
      <footer className="xg-footer"><a href="/"><img src="/xoai-logo.svg" alt="Xoài Go"/></a><span>© 2026 Xoài Go · Kết nối người tiêu dùng và cửa hàng địa phương.</span><a href={MERCHANT_APP}>Đối tác cửa hàng <ArrowRight size={14}/></a></footer>

      <style jsx global>{`
        .xg{--green:#155b38;--deep:#0d452b;--gold:#e8bd55;--cream:#fbfaf5;--ink:#213b2c;--muted:#718075;background:var(--cream);color:var(--ink);min-height:100vh;font-family:Arial,Helvetica,sans-serif}.xg *{box-sizing:border-box}.xg a{text-decoration:none}
        .xg-topline{height:30px;background:var(--deep);color:#f2d98f;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;letter-spacing:1.5px}
        .xg-nav{height:76px;max-width:1180px;margin:auto;padding:0 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e8e8dc}.xg-logo img{width:132px;max-height:48px;object-fit:contain}.xg-place{display:flex;align-items:center;gap:9px;color:#718075}.xg-place small,.xg-place b{display:block}.xg-place small{font-size:8px;letter-spacing:1px;color:#9aa399}.xg-place b{font-size:12px;color:#354b3b;margin-top:3px}.xg-nav-cta{display:flex;align-items:center;gap:9px;padding:12px 18px;border:1px solid #e2e5db;border-radius:30px;background:white;color:#244832;font-size:11px;font-weight:800}
        .xg-hero{max-width:1180px;margin:auto;padding:68px 28px 74px;display:grid;grid-template-columns:1fr .92fr;gap:65px;align-items:center}.xg-kicker{display:inline-flex;align-items:center;gap:8px;color:#9a782e;font-size:9px;font-weight:800;letter-spacing:1.7px}.xg-kicker i{width:7px;height:7px;border-radius:50%;background:#88a36e}.xg-hero h1{font-size:clamp(44px,5.3vw,68px);line-height:1.08;letter-spacing:-3px;margin:22px 0 19px;color:#203c2b}.xg-hero h1 em,.xg-intro h2 em,.xg-how-copy h2 em,.xg-merchant h2 em,.xg-shop-heading h2 em,.xg-model h2 em,.xg-faq h2 em,.xg-final h2 em{font-family:Georgia,serif;font-weight:500;color:#c09331}.xg-hero-copy>p{max-width:500px;color:#728075;font-size:14px;line-height:1.9;margin:0}.xg-actions{display:flex;align-items:center;gap:24px;margin-top:28px}.xg-btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:15px 21px;border-radius:30px;background:var(--gold);color:#243b2b;font-size:11px;font-weight:800;box-shadow:0 8px 20px #b48c3020}.xg-link{font-size:11px;font-weight:800;color:#536c59}.xg-link span{color:#b68b2b;margin-left:6px}.xg-proof{display:flex;flex-wrap:wrap;gap:18px;margin-top:25px;color:#788579;font-size:10px}.xg-proof span{display:flex;align-items:center;gap:6px}.xg-proof svg{width:14px;color:#78945f}
        .xg-hero-photo{height:390px;position:relative;border-radius:18px}.xg-hero-photo>img{width:100%;height:100%;object-fit:cover;border-radius:18px}.xg-photo-note{position:absolute;left:-22px;bottom:22px;display:flex;align-items:center;gap:12px;padding:14px 18px;background:#fffdf6;border:1px solid #eee5d3;border-radius:12px;box-shadow:0 10px 28px #263a2a16;color:#a17a25}.xg-photo-note small,.xg-photo-note b{display:block}.xg-photo-note small{font-size:8px;letter-spacing:1px;color:#9a8a68}.xg-photo-note b{font-size:12px;color:#354a38;margin-top:4px}
        .xg-category{background:var(--gold);overflow:hidden;padding:15px 0;white-space:nowrap}.xg-category>div{display:flex;justify-content:space-around;gap:30px;min-width:100%}.xg-category span{font-size:9px;font-weight:800;letter-spacing:1.4px;color:#5c4720}.xg-category b{margin-left:24px;color:#9b7120}
        .xg-customer{max-width:1180px;margin:auto;padding:95px 28px 105px;display:grid;grid-template-columns:.8fr 1.2fr;gap:85px;align-items:center}.xg-intro h2,.xg-how-copy h2,.xg-merchant h2,.xg-shop-heading h2,.xg-faq h2{font-size:clamp(34px,4vw,45px);line-height:1.13;letter-spacing:-1.8px;margin:18px 0}.xg-intro>p,.xg-shop-heading>p,.xg-faq>div:first-child>p{font-size:12px;line-height:1.9;color:#748176}.xg-underlink{display:inline-flex;align-items:center;gap:10px;margin-top:22px;color:#17613c;font-size:11px;font-weight:800}
        .xg-customer-list{border-top:1px solid #e5e4d9}.xg-customer-list article{display:grid;grid-template-columns:46px 1fr;gap:16px;padding:19px 0;border-bottom:1px solid #e5e4d9;align-items:start}.xg-icon{width:42px;height:42px;border-radius:12px;background:#edf2e7;color:#8c742f;display:grid;place-items:center}.xg-icon svg{width:19px}.xg-customer-list small,.xg-shop-grid small{font-size:8px;letter-spacing:1.3px;color:#a18a5c;font-weight:800}.xg-customer-list h3{font-size:16px;margin:5px 0;color:#314735}.xg-customer-list p{font-size:11px;line-height:1.7;color:#818a7e;margin:0;max-width:540px}
        .xg-how{background:#294633;display:grid;grid-template-columns:1fr 1fr;min-height:500px}.xg-how-photo{position:relative;min-height:500px}.xg-how-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.xg-how-photo>span{position:absolute;left:24px;bottom:24px;background:#fffdf2;padding:12px 15px;border-radius:8px;color:#344735;font-size:8px;font-weight:800;letter-spacing:1px}.xg-how-copy{padding:70px clamp(35px,7vw,100px);color:white;align-self:center}.xg-light{color:#e6c36a}.xg-how-copy h2{color:white;font-size:40px;margin:18px 0 28px}.xg-how-copy h2 em{color:#e7c45d}.xg-steps{border-top:1px solid #ffffff40;margin-bottom:26px}.xg-steps>div{display:grid;grid-template-columns:32px 1fr;gap:13px;padding:17px 0;border-bottom:1px solid #ffffff40}.xg-steps>div>b{font-size:10px;color:#e8c45e}.xg-steps strong,.xg-steps small{display:block}.xg-steps strong{font-size:12px}.xg-steps small{font-size:10px;line-height:1.6;color:#d6dfd5;margin-top:5px}.xg-btn-light{background:#f1cc64;color:#263d2e}
        .xg-merchant{max-width:1180px;margin:auto;padding:95px 28px;display:grid;grid-template-columns:1fr .9fr;gap:75px;align-items:center}.xg-merchant h2{font-size:clamp(34px,3.8vw,43px)}.xg-merchant-copy>p{font-size:12px;line-height:1.9;color:#748176}.xg-merchant ul{list-style:none;padding:0;margin:23px 0 28px}.xg-merchant li{display:flex;align-items:flex-start;gap:9px;margin:13px 0;font-size:11px;line-height:1.6;color:#637164}.xg-merchant li svg{width:15px;flex:none;color:#81985f}.xg-merchant-photo{height:390px;border-radius:18px;overflow:hidden}.xg-merchant-photo img{width:100%;height:100%;object-fit:cover}
        .xg-shop-value{background:#f0f6f0;padding:86px max(28px,calc((100% - 1124px)/2));border-top:1px solid #e3ece3;border-bottom:1px solid #e3ece3}.xg-shop-heading{max-width:600px}.xg-shop-heading h2{font-size:42px}.xg-shop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:35px}.xg-shop-grid article{background:#fff;border:1px solid #e2ebe2;border-radius:15px;padding:22px 19px;min-height:230px}.xg-shop-grid article>span{width:38px;height:38px;border-radius:11px;background:#edf4ed;color:#287249;display:grid;place-items:center;margin-bottom:17px}.xg-shop-grid article>span svg{width:18px}.xg-shop-grid h3{font-size:16px;line-height:1.35;color:#244632;margin:9px 0}.xg-shop-grid p{font-size:11px;line-height:1.75;color:#748176;margin:0}
        .xg-model{background:#214a33;color:white;text-align:center;padding:78px 24px}.xg-model h2{font-size:clamp(32px,4vw,44px);line-height:1.15;letter-spacing:-1.5px;margin:17px 0 35px}.xg-model h2 em{color:#e8c96f}.xg-model-grid{max-width:1000px;margin:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.xg-model-grid article{padding:25px 22px;border:1px solid #ffffff38;border-radius:15px;background:#ffffff0b}.xg-model-grid svg{width:23px;color:#e8c96f;display:block;margin:0 auto 13px}.xg-model-grid b{font-size:15px}.xg-model-grid p{font-size:11px;line-height:1.7;color:#d5e0d7;margin:9px 0 0}.xg-model-note{max-width:780px;margin:25px auto 0;color:#d5e0d7;font-size:10px;line-height:1.8}
        .xg-faq{max-width:1180px;margin:auto;padding:95px 28px;display:grid;grid-template-columns:.7fr 1.3fr;gap:90px}.xg-faq-list{border-top:1px solid #e3e6dc}.xg-faq-list details{border-bottom:1px solid #e3e6dc;padding:18px 0}.xg-faq-list summary{font-size:13px;font-weight:800;color:#2d4936;cursor:pointer;list-style:none}.xg-faq-list summary::-webkit-details-marker{display:none}.xg-faq-list summary:after{content:'+';float:right;color:#9a782e;font-size:18px}.xg-faq-list details[open] summary:after{content:'−'}.xg-faq-list p{font-size:11px;line-height:1.8;color:#748176;margin:12px 22px 0 0}
        .xg-final{background:#294633;text-align:center;color:white;padding:65px 20px}.xg-final h2{font-size:clamp(30px,4vw,42px);line-height:1.2;letter-spacing:-1px;margin:14px 0}.xg-final h2 em{color:#e8c96f}.xg-final>p{font-size:12px;line-height:1.7;color:#d8e0d5;margin:0 auto 24px;max-width:600px}.xg-final>div{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.xg-outline{display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border:1px solid #ffffff80;border-radius:30px;color:white;font-size:11px;font-weight:800}.xg-footer{max-width:1180px;margin:auto;padding:23px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px}.xg-footer img{width:105px}.xg-footer span,.xg-footer>a:last-child{font-size:9px;color:#899185}.xg-footer>a:last-child{display:flex;align-items:center;gap:6px;color:#64776a}
        @media(max-width:850px){.xg-shop-grid{grid-template-columns:repeat(2,1fr)}.xg-customer{gap:45px}.xg-faq{gap:45px}}
        @media(max-width:700px){.xg-topline{font-size:7px;letter-spacing:.7px;padding:0 8px;text-align:center}.xg-nav{height:65px;padding:0 16px}.xg-logo img{width:108px}.xg-place{margin-left:auto;margin-right:12px}.xg-nav-cta{padding:9px 11px;font-size:9px}.xg-hero{padding:38px 18px 42px;display:flex;flex-direction:column;gap:25px;align-items:stretch}.xg-hero h1{font-size:43px;letter-spacing:-2px;margin:16px 0}.xg-hero-copy>p{font-size:12px}.xg-hero-photo{height:235px}.xg-photo-note{left:10px;bottom:12px;padding:10px 12px}.xg-photo-note b{font-size:10px}.xg-proof{gap:10px;font-size:9px}.xg-category{padding:12px 0}.xg-category>div{justify-content:flex-start;gap:22px;width:max-content;padding-left:18px}.xg-category span{font-size:8px}.xg-customer{padding:58px 18px 62px;display:block}.xg-intro h2,.xg-how-copy h2,.xg-merchant h2,.xg-shop-heading h2,.xg-faq h2{font-size:34px}.xg-intro>p{margin-bottom:20px}.xg-customer-list{margin-top:28px}.xg-customer-list article{grid-template-columns:38px 1fr;gap:12px;padding:16px 0}.xg-icon{width:36px;height:36px}.xg-customer-list h3{font-size:14px}.xg-how{display:flex;flex-direction:column}.xg-how-photo{min-height:230px}.xg-how-copy{padding:40px 20px 45px}.xg-how-copy h2{font-size:35px}.xg-merchant{padding:60px 18px;display:flex;flex-direction:column-reverse;gap:30px}.xg-merchant-photo{width:100%;height:230px}.xg-shop-value{padding:60px 18px}.xg-shop-heading h2{font-size:34px}.xg-shop-grid{grid-template-columns:1fr 1fr;gap:8px;margin-top:25px}.xg-shop-grid article{padding:16px 13px;min-height:0;border-radius:12px}.xg-shop-grid h3{font-size:13px}.xg-shop-grid p{font-size:10px}.xg-shop-grid small{font-size:7px;letter-spacing:.7px}.xg-model{padding:58px 18px}.xg-model-grid{grid-template-columns:1fr;gap:9px}.xg-model-grid article{padding:18px}.xg-model-grid svg{margin-bottom:8px}.xg-faq{padding:60px 18px;display:block}.xg-faq-list{margin-top:25px}.xg-final{padding:50px 18px}.xg-final h2{font-size:30px}.xg-footer{padding:20px 18px;flex-wrap:wrap}.xg-footer span{order:3;width:100%}}
      `}</style>
    </main>
  );
}
