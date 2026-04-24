import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    id: 1, tag: "🔥 LIMITED TIME OFFER",
    headline: ["EVERYTHING", "ONLY AT"],
    price: "₹99", sub: "Shop 1000+ Products — All Just ₹99!",
    cta: "SHOP NOW", ctaSub: "View All Deals",
    items: [
      { emoji: "🎧", label: "Headphones", x: 60, y: 12, delay: 0, size: 56 },
      { emoji: "👜", label: "Handbag", x: 74, y: 46, delay: 0.25, size: 52 },
      { emoji: "🧸", label: "Teddy Bear", x: 54, y: 64, delay: 0.5, size: 50 },
      { emoji: "🕶️", label: "Sunglasses", x: 82, y: 22, delay: 0.75, size: 44 },
      { emoji: "⌚", label: "Watch", x: 88, y: 58, delay: 1.0, size: 44 },
      { emoji: "🎮", label: "Controller", x: 50, y: 38, delay: 1.25, size: 48 },
      { emoji: "👠", label: "Red Heels", x: 78, y: 74, delay: 1.5, size: 40 },
    ],
  },
  {
    id: 2, tag: "👗 NEW FASHION ARRIVALS",
    headline: ["STYLE &", "FASHION"],
    price: "₹99", sub: "Trendy Clothes, Bags & Accessories — All ₹99",
    cta: "SHOP FASHION", ctaSub: "Explore Collection",
    items: [
      { emoji: "👗", label: "Dress", x: 58, y: 10, delay: 0, size: 56 },
      { emoji: "👜", label: "Handbag", x: 78, y: 30, delay: 0.25, size: 52 },
      { emoji: "👠", label: "Heels", x: 62, y: 58, delay: 0.5, size: 50 },
      { emoji: "🧣", label: "Scarf", x: 85, y: 55, delay: 0.75, size: 44 },
      { emoji: "💍", label: "Jewellery", x: 52, y: 76, delay: 1.0, size: 40 },
      { emoji: "🎒", label: "Backpack", x: 88, y: 18, delay: 1.25, size: 48 },
      { emoji: "🕶️", label: "Sunglasses", x: 72, y: 44, delay: 1.5, size: 42 },
    ],
  },
  {
    id: 3, tag: "⚡ GADGET ZONE",
    headline: ["TECH DEALS", "UNDER"],
    price: "₹99", sub: "Headphones, Smartwatches & More — Just ₹99",
    cta: "SHOP GADGETS", ctaSub: "See All Tech",
    items: [
      { emoji: "🎧", label: "Headphones", x: 56, y: 8, delay: 0, size: 58 },
      { emoji: "⌚", label: "Smartwatch", x: 80, y: 26, delay: 0.25, size: 52 },
      { emoji: "🎮", label: "Controller", x: 60, y: 62, delay: 0.5, size: 50 },
      { emoji: "💻", label: "Laptop", x: 84, y: 58, delay: 0.75, size: 46 },
      { emoji: "📱", label: "Phone", x: 70, y: 40, delay: 1.0, size: 48 },
      { emoji: "🔋", label: "Power Bank", x: 88, y: 40, delay: 1.25, size: 40 },
      { emoji: "🖥️", label: "Monitor", x: 52, y: 80, delay: 1.5, size: 42 },
    ],
  },
  {
    id: 4, tag: "🧸 KIDS CORNER",
    headline: ["TOYS &", "GAMES"],
    price: "₹99", sub: "Amazing Toys for Little Ones — All ₹99",
    cta: "SHOP TOYS", ctaSub: "Kids Collection",
    items: [
      { emoji: "🧸", label: "Teddy", x: 58, y: 10, delay: 0, size: 58 },
      { emoji: "🎪", label: "Circus Set", x: 80, y: 26, delay: 0.25, size: 50 },
      { emoji: "🎯", label: "Target Game", x: 84, y: 58, delay: 0.5, size: 46 },
      { emoji: "🚀", label: "Rocket", x: 70, y: 42, delay: 0.75, size: 50 },
      { emoji: "🎨", label: "Art Set", x: 88, y: 40, delay: 1.0, size: 42 },
      { emoji: "🎠", label: "Carousel", x: 60, y: 64, delay: 1.25, size: 44 },
      { emoji: "🎲", label: "Board Game", x: 52, y: 80, delay: 1.5, size: 40 },
    ],
  },
];

export default function HeroSlider() {
  const [cur, setCur] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState("next");
  const [visItems, setVisItems] = useState([]);
  const [textKey, setTextKey] = useState(0);
  const timerRef = useRef(null);

  const showItems = (idx) => {
    setVisItems([]);
    SLIDES[idx].items.forEach((_, i) => {
      setTimeout(() => setVisItems(p => [...p, i]), i * 140 + 350);
    });
  };

  useEffect(() => { showItems(0); }, []);

  const go = (toIdx, d) => {
    if (animating) return;
    clearInterval(timerRef.current);
    setAnimating(true);
    setDir(d);
    setVisItems([]);
    setTimeout(() => {
      setCur(toIdx);
      setTextKey(k => k + 1);
      setAnimating(false);
      showItems(toIdx);
      startAuto(toIdx);
    }, 420);
  };

  const startAuto = (from) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % SLIDES.length;
        setTextKey(k => k + 1);
        setVisItems([]);
        showItems(next);
        return next;
      });
    }, 4800);
  };

  useEffect(() => {
    startAuto(0);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[cur];

  return (
    <section style={{
      position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg,#fff7f7 0%,#fff 45%,#fff5f5 100%)",
      minHeight: 500,
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&display=swap');
        @keyframes floatAnim{0%,100%{transform:translateY(0) rotate(-2deg) scale(1)}50%{transform:translateY(-16px) rotate(3deg) scale(1.04)}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.3) rotate(-15deg)}65%{transform:scale(1.18) rotate(4deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes slideLeft{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(35px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes badgeBounce{0%,100%{transform:rotate(-4deg) scale(1)}50%{transform:rotate(-4deg) scale(1.06)}}
        @keyframes dotPulse{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        .float-i{animation:floatAnim 2.8s ease-in-out infinite}
        .pop-i{animation:popIn 0.45s cubic-bezier(.34,1.56,.64,1) both}
        .txt-left{animation:slideLeft 0.5s .05s ease-out both}
        .txt-right{animation:slideRight 0.5s .05s ease-out both}
        .txt-up{animation:slideUp 0.45s ease-out both}
        .badge-b{animation:badgeBounce 1.8s ease-in-out infinite}
        .shimmer-btn{background:linear-gradient(90deg,#b91c1c,#dc2626,#f87171,#dc2626,#b91c1c);background-size:300% auto;animation:shimmer 2s linear infinite}
        .arr-btn{transition:all .18s;cursor:pointer}
        .arr-btn:hover{background:#dc2626!important;color:#fff!important;border-color:#dc2626!important}
      `}</style>

      {/* BG decorative circles */}
      <div style={{
        position: "absolute", right: -100, top: -80, width: 560, height: 560,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(220,38,38,0.12) 0%,transparent 68%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", left: -80, bottom: -100, width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(220,38,38,0.06) 0%,transparent 68%)",
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", minHeight: 500, flexDirection: "row", flexWrap: "wrap" }}>

          {/* LEFT TEXT */}
          <div
            key={`t-${textKey}`}
            className={dir === "next" ? "txt-left" : "txt-right"}
            style={{ flex: "1 1 40%", minWidth: 320, paddingTop: 48, paddingBottom: 48 }}
          >
            {/* Live tag */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#fff0f0", border: "1.5px solid #fca5a5",
              color: "#dc2626", fontSize: 11, fontWeight: 800,
              padding: "5px 15px", borderRadius: 50, marginBottom: 20,
              letterSpacing: "0.06em"
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#dc2626",
                display: "inline-block", animation: "dotPulse 1.4s infinite"
              }} />
              {slide.tag}
            </div>

            {/* Big headline */}
            <div style={{
              fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, lineHeight: 0.95,
              marginBottom: 4
            }}>
              <div style={{ fontSize: "clamp(48px, 5vw, 62px)", color: "#111", letterSpacing: -1.5 }}>{slide.headline[0]}</div>
              <div style={{ fontSize: "clamp(48px, 5vw, 62px)", color: "#111", letterSpacing: -1.5 }}>{slide.headline[1]}</div>
            </div>

            {/* ₹99 */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, fontSize: "clamp(80px, 8vw, 100px)", color: "#dc2626",
                lineHeight: 1, letterSpacing: -4
              }}>₹99</span>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#bbb", textDecoration: "line-through", fontWeight: 600 }}>₹999</div>
                <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 800 }}>90% OFF!</div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "#777", marginBottom: 26, fontWeight: 500, lineHeight: 1.5 }}>
              {slide.sub}
            </p>

            {/* 4 trust points */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginBottom: 30 }}>
              {[
                ["🏆","Best Quality Guaranteed"],
                ["🛡️","Safe & Secure Shopping"],
                ["🎁","Great Offers Daily"],
                ["⚡","Fast Delivery On Time"]
              ].map(([ic,tx]) => (
                <div key={tx} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555", fontWeight: 600 }}>
                  <span style={{ fontSize: 15 }}>{ic}</span>{tx}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link to="/products"
                className="shimmer-btn"
                style={{
                  color: "#fff", fontWeight: 900, fontSize: 15,
                  border: "none", padding: "14px 36px", borderRadius: 50,
                  cursor: "pointer", letterSpacing: 0.6,
                  boxShadow: "0 6px 26px rgba(220,38,38,0.38)",
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "inherit", transition: "transform 0.15s",
                  textDecoration: "none"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05) translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {slide.cta} ›
              </Link>
              <Link to="/products"
                style={{
                  background: "transparent",
                  border: "2px solid #dc2626",
                  color: "#dc2626", fontWeight: 700, fontSize: 13,
                  padding: "12px 24px", borderRadius: 50, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                  textDecoration: "none"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
              >
                {slide.ctaSub}
              </Link>
            </div>
          </div>

          {/* RIGHT — Floating products */}
          <div className="hidden lg:block" style={{ flex: "1 1 50%", position: "relative", height: 500, minWidth: 400 }}>

            {/* ₹99 Badge */}
            <div className="badge-b" style={{
              position: "absolute", top: 28, right: 20, zIndex: 8,
              background: "linear-gradient(145deg,#dc2626,#991b1b)",
              color: "#fff", borderRadius: 20,
              padding: "12px 22px",
              boxShadow: "0 8px 32px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.8, textTransform: "uppercase" }}>ONLY AT</div>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, fontSize: 46, lineHeight: 1, letterSpacing: -2
              }}>₹99</div>
            </div>

            {/* Floating product items */}
            {slide.items.map((item, i) => (
              <div
                key={`${cur}-item-${i}`}
                className={visItems.includes(i) ? "pop-i" : ""}
                style={{
                  position: "absolute",
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  opacity: visItems.includes(i) ? 1 : 0,
                  zIndex: i === 0 ? 5 : 4,
                }}
              >
                <div
                  className="float-i"
                  style={{
                    animationDelay: `${i * 0.38}s`,
                    animationDuration: `${2.5 + i * 0.22}s`,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    cursor: "pointer"
                  }}
                >
                  {/* Product card */}
                  <div style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: `${item.size > 50 ? 16 : 12}px ${item.size > 50 ? 18 : 14}px`,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(220,38,38,0.07)",
                    fontSize: item.size,
                    lineHeight: 1,
                    border: "1.5px solid rgba(220,38,38,0.07)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.14)";
                      e.currentTarget.style.boxShadow = "0 14px 40px rgba(220,38,38,0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.10)";
                    }}
                  >
                    {item.emoji}
                  </div>
                  {/* Label chip */}
                  <div style={{
                    background: "#dc2626", color: "#fff",
                    fontSize: 9, fontWeight: 800,
                    padding: "2px 10px", borderRadius: 50,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                    whiteSpace: "nowrap"
                  }}>
                    {item.label} • ₹99
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ← → Arrow Controls */}
      {[
        { side: "left", val: 16, label: "‹", action: () => go((cur - 1 + SLIDES.length) % SLIDES.length, "prev") },
        { side: "right", val: 16, label: "›", action: () => go((cur + 1) % SLIDES.length, "next") }
      ].map(b => (
        <button
          key={b.side}
          className="arr-btn hidden lg:flex"
          onClick={b.action}
          style={{
            position: "absolute", [b.side]: b.val, top: "50%", transform: "translateY(-50%)",
            width: 44, height: 44, borderRadius: "50%",
            background: "#fff", border: "1.5px solid #e8e8e8",
            fontSize: 22, color: "#555", cursor: "pointer", zIndex: 10,
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 14px rgba(0,0,0,0.08)"
          }}
        >{b.label}</button>
      ))}

      {/* Dot indicators */}
      <div style={{
        position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 8, zIndex: 10
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > cur ? "next" : "prev")}
            style={{
              width: i === cur ? 32 : 10, height: 10,
              borderRadius: 5, border: "none",
              background: i === cur ? "#dc2626" : "#ddd",
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(.4,0,.2,1)"
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="hidden lg:block" style={{
        position: "absolute", bottom: 22, right: 44,
        fontSize: 13, fontWeight: 700, color: "#bbb", zIndex: 10
      }}>
        <span style={{ color: "#dc2626", fontWeight: 900 }}>{String(cur + 1).padStart(2, "0")}</span>
        <span> / {String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
