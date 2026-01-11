import React from 'react';
import './VendorDash.css';

const VendorDashboard = () => {
  return (
    <div className="vendor-dashboard">
      {/* Bal oldali Sidebar */}
      <aside className="v-sidebar">
        <div className="v-brand">
          <div className="v-logo-icon">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <div className="v-brand-info">
            <span className="v-company">Vendor Hub</span>
            <span className="v-sub">Ergo Solutions Ltd.</span>
          </div>
        </div>

        <nav className="v-nav">
          <NavItem icon="grid_view" label="Dashboard" />
          <NavItem icon="inventory_2" label="Inventory" active />
          <NavItem icon="orders" label="Orders" />
          <NavItem icon="leaderboard" label="Sales Analytics" />
          <NavItem icon="assignment_return" label="Returns" />
        </nav>

        <div className="v-nav-bottom">
          <NavItem icon="settings" label="Settings" />
          <NavItem icon="help" label="Help Center" />
        </div>
      </aside>

      {/* Jobb oldali tartalom */}
      <main className="v-main">
        <header className="v-header">
          <div className="v-header-left">
            <h1>Inventory Management</h1>
          </div>
          <div className="v-header-right">
            <div className="v-search">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Search SKU, product name..." />
            </div>
            <button className="v-btn-primary">
              <span className="material-symbols-outlined">add</span> Add New Product
            </button>
            <div className="v-notif">
              <span className="material-symbols-outlined">notifications</span>
            </div>
            <div className="v-avatar"></div>
          </div>
        </header>

        <section className="v-content">
          <div className="v-section-title">
            <h2>My Products</h2>
            <p>Monitor and manage your ergonomic workstation product listings.</p>
          </div>

          {/* Statisztikai Kártyák */}
          <div className="v-stats-grid">
            <StatCard label="Total SKUs" value="1,284" trend="+2.4% vs last mo" icon="inventory" color="blue" />
            <StatCard label="Active Listings" value="1,240" trend="+1.1% vs last mo" icon="check_circle" color="green" />
            <StatCard label="Low Stock Alerts" value="12" trend="-5.2% vs last mo" icon="warning" color="orange" />
          </div>

          {/* Táblázat szűrők */}
          <div className="v-table-container">
            <div className="v-table-tabs">
              <span className="active">All Products</span>
              <span>Active</span>
              <span>Hidden</span>
              <span>Out of Stock</span>
            </div>
            
            <table className="v-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>STOCK LEVEL</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <TableRow 
                  name="Pro-Align Ergonomic Chair" 
                  sub="V2 Edition • Black"
                  sku="ERGO-CH-001"
                  cat="Seating"
                  stock={42}
                  maxStock={100}
                  price="499.00"
                  status="Active"
                />
                <TableRow 
                  name="Apex Standing Desk" 
                  sub="Bamboo Top • Dual Motor"
                  sku="ERGO-DSK-024"
                  cat="Desks"
                  stock={8}
                  maxStock={100}
                  price="849.50"
                  status="Active"
                />
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

// Segédkomponensek
const NavItem = ({ icon, label, active }) => (
  <div className={`v-nav-item ${active ? 'active' : ''}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, trend, icon, color }) => (
  <div className={`v-stat-card ${color}`}>
    <div className="v-stat-header">
      <span className="v-stat-label">{label}</span>
      <span className="material-symbols-outlined v-stat-icon">{icon}</span>
    </div>
    <div className="v-stat-value">{value}</div>
    <div className="v-stat-trend">{trend}</div>
  </div>
);

const TableRow = ({ name, sub, sku, cat, stock, maxStock, price, status }) => (
  <tr>
    <td>
      <div className="v-prod-info">
        <div className="v-prod-img-placeholder"></div>
        <div>
          <div className="v-prod-name">{name}</div>
          <div className="v-prod-sub">{sub}</div>
        </div>
      </div>
    </td>
    <td>{sku}</td>
    <td>{cat}</td>
    <td>
      <div className="v-stock-bar-container">
        <div className="v-stock-bar" style={{width: `${stock}%`}}></div>
        <span>{stock} units</span>
      </div>
    </td>
    <td><strong>${price}</strong></td>
    <td><span className={`v-status ${status.toLowerCase()}`}>{status}</span></td>
    <td><span className="material-symbols-outlined v-edit">edit</span></td>
  </tr>
);

export default VendorDashboard;