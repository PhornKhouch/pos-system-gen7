import React from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../../components/SectionTitle';
import { STORE_ROUTES, shopUrl } from '../../storeConfig';

export function CategoryGrid({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="home-section">
      <SectionTitle
        title="Shop by category"
        action={<Link to={STORE_ROUTES.SHOP}>All products →</Link>}
      />
      <div className="home-category-grid">
        {categories.map((cat) => (
          <Link key={cat.id} to={shopUrl({ category: cat.id })} className="home-category">
            <div className="home-category-thumb">{cat.name.slice(0, 3).toUpperCase()}</div>
            <div className="home-category-name">{cat.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;
