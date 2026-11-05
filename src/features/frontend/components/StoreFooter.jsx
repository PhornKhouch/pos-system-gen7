import React from 'react';
import { FOOTER_COLUMNS, STORE_BRAND } from '../storeConfig';

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-container">
        <div className="store-footer-grid">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="store-footer-title">{col.title}</div>
              {col.items.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="store-footer-bottom">
          © {new Date().getFullYear()} {STORE_BRAND.name} Electronics
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
