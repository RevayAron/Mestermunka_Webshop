import React from 'react';
import './FrontPage.css';

const FrontPage = ({ onProfileClick }) => {
  return (
    <div className="front-page">
      {/* 1. Header szekció */}
        <header className="main-header">
        <div className="nav-container">
            <div className="logo" onClick={() => navigateTo('home')} style={{cursor: 'pointer'}}>
            <span className="material-symbols-outlined">shopping_bag</span>
            <h2 className="logo-text">VENDORA</h2>
            </div>
            
            <div className="search-box">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search products, brands or B2B supplies..." />
            </div>

            <div className="header-links">
            <nav className="desktop-nav">
                <a href="#">B2B Deals</a>
                <a href="#">Vendors</a>
                <a href="#">Support</a>
            </nav>
            
            <div className="user-utilities">
                {/* Itt a módosítás: onClick esemény hozzáadása */}
                {/* v2 Itt hívjuk meg az onProfileClick-et, amit az App-ban definiáltunk */}
                <button className="icon-btn" onClick={onProfileClick}>
                    <span className="material-symbols-outlined">person</span>
                    <span>Account</span>
                </button>
                
                <button className="cart-btn">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>Cart</span>
                <span className="cart-badge">3</span>
                </button>
            </div>
            </div>
        </div>
        </header>

      <main className="content-wrapper">
        {/* 2. Sidebar Navigation */}
        <aside className="sidebar">
          <div className="category-card">
            <h3 className="section-title">Categories</h3>
            <nav className="cat-nav">
              <CategoryLink icon="devices" label="Electronics" active />
              <CategoryLink icon="home" label="Home & Living" />
              <CategoryLink icon="apparel" label="Fashion" />
              <CategoryLink icon="handyman" label="Industrial Tools" />
              <CategoryLink icon="description" label="Office Supplies" />
              <CategoryLink icon="health_and_safety" label="Health & Beauty" />
            </nav>
          </div>
          <div className="pro-membership-card">
            <h4>B2B Pro Membership</h4>
            <p>Unlock bulk pricing, Net-30 terms, and dedicated account management.</p>
            <button className="outline-btn">Learn More</button>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <section className="main-area">
          <div className="hero-banner">
            <span className="badge">Exclusive Partner</span>
            <h1>Premium Partner <br/> Brands Collection</h1>
            <p>Discover exclusive bulk deals from our top-rated enterprise vendors.</p>
            <div className="hero-actions">
              <button className="btn-primary">Shop Now</button>
              <button className="btn-secondary">View Vendors</button>
            </div>
          </div>

          <div className="filter-scroll">
            {['Free Shipping', 'Bulk Discount', 'Top Rated', 'Flash Sale', 'Condition'].map(f => (
              <button key={f} className="filter-chip">
                {f} <span className="material-symbols-outlined">keyboard_arrow_down</span>
              </button>
            ))}
          </div>

          <div className="section-header">
            <h2>Recommended for You</h2>
            <a href="#" className="view-all">View All <span className="material-symbols-outlined">arrow_forward</span></a>
          </div>

          <div className="products-grid">
            <ProductCard 
              title="Noise Cancelling Wireless Studio Headphones" 
              price="299.00" 
              brand="TechMaster Pro"
              bulk="245.00"
              img="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070"
              tag="TOP SELLER"
            />
            <ProductCard 
              title="Minimalist Series 7 Silver Edition Watch" 
              price="185.00" 
              brand="Eterna Design"
              img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070"
            />
            <ProductCard 
              title="Pro-Series Breathable Mesh Running Shoes" 
              price="120.00" 
              oldPrice="150.00"
              brand="Stride Footwear"
              img="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070"
              tag="20% OFF"
            />
            <ProductCard 
              title="Instant Film Camera with Automatic Exposure" 
              price="79.99" 
              bulk="62.00"
              brand="RetroSnap"
              img="https://lh3.googleusercontent.com/aida-public/AB6AXuCkhrFVXyhSaySDOuUAoflXh3KOkJajvmc3fI2r_lVpKbr0IT2SSCrl4ALFp3DhkcOmuJUoV5h0kWM7unn15lfmn6mwH4BrSWjI4HCQ1mjZpPlftMkl7QyeQOmG2tENuizGcCuYLmSLPykUR_4YLjBBgLQNiFjA_VNLY_KQA1b9n8op_qbyWxfVl2AhFoPQ7CdJbHp4NW8YeOKv1H1FHnJlBsngWvCfiH09n7TU2f-PgUJ8DiRN9VTdpX7i5FpW6sgycayCPRa3CH4"
            />
          </div>

          <div className="b2b-banner">
            <div className="b2b-info">
              <h3>Enterprise Bulk Purchasing</h3>
              <p>Simplified procurement for business. Get customized quotes and dedicated support.</p>
              <div className="b2b-features">
                <span><span className="material-symbols-outlined">verified</span> Wholesale Rates</span>
                <span><span className="material-symbols-outlined">credit_card</span> Net-30 Terms</span>
              </div>
            </div>
            <button className="btn-primary large">Register Company</button>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo"><span className="material-symbols-outlined">shopping_bag</span> VENDORA</div>
            <p>The unified platform for multi-vendor commerce.</p>
          </div>
          <FooterColumn title="Shop" links={['Electronics', 'Office', 'Industrial']} />
          <FooterColumn title="Company" links={['About Us', 'Careers', 'Affiliates']} />
          <FooterColumn title="Support" links={['Track Order', 'Shipping', 'Returns']} />
        </div>
      </footer>
    </div>
  );
};

// Segédkomponensek
const CategoryLink = ({ icon, label, active }) => (
  <a href="#" className={`cat-item ${active ? 'active' : ''}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </a>
);

const ProductCard = ({ title, price, oldPrice, brand, img, tag, bulk }) => (
  <div className="product-card">
    <div className="image-container">
      <img src={img} alt={title} />
      {tag && <span className="card-tag">{tag}</span>}
      <button className="wishlist-btn"><span className="material-symbols-outlined">favorite</span></button>
    </div>
    <div className="card-content">
      <p className="brand-name">{brand}</p>
      <h3 className="product-title">{title}</h3>
      <div className="price-row">
        <div className="price-info">
          <span className="current-price">${price}</span>
          {oldPrice && <span className="old-price">${oldPrice}</span>}
          {bulk && <p className="bulk-price">Bulk: ${bulk}</p>}
        </div>
        <button className="add-cart-btn"><span className="material-symbols-outlined">add_shopping_cart</span></button>
      </div>
    </div>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div className="footer-col">
    <h4>{title}</h4>
    <ul>{links.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}</ul>
  </div>
);



export default FrontPage;