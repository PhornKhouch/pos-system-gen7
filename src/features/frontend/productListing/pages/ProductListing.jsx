import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../../components/SectionTitle';
import { StoreProductCard } from '../../components/StoreProductCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { ListingToolbar } from '../components/ListingToolbar';
import { useProductListing } from '../hooks/useProductListing';
import { STORE_ROUTES } from '../../storeConfig';
import '../productListing.css';

export function ProductListing() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    products,
    facets,
    activeFilters,
    search,
    sort,
    loading,
    error,
    reload,
    toggleFilter,
    setSort,
    clearSearch,
    clearAll,
  } = useProductListing();

  // Title follows the mockup: the category name when exactly one is selected
  const selectedCategories = activeFilters.filter((f) => f.key === 'category');
  let title = 'All products';
  if (search) title = `Results for “${search}”`;
  else if (selectedCategories.length === 1) title = selectedCategories[0].label;

  let content;
  if (loading) {
    content = (
      <div className="listing-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="store-product-skeleton" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="listing-empty">
        <p>{error}</p>
        <button type="button" className="store-btn" onClick={reload}>
          Try again
        </button>
      </div>
    );
  } else if (!products.length) {
    content = (
      <div className="listing-empty">
        <p>No products match these filters.</p>
        <button type="button" className="store-btn" onClick={clearAll}>
          Clear all filters
        </button>
      </div>
    );
  } else {
    content = (
      <div className="listing-grid">
        {products.map((p) => (
          <StoreProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="listing-page">
      <nav className="listing-breadcrumb">
        <Link to={STORE_ROUTES.HOME}>Home</Link> / <span>Shop</span>
      </nav>
      <SectionTitle title={title} />

      <div className="listing-body">
        <FilterSidebar facets={facets} onToggle={toggleFilter} open={filtersOpen} />
        <div className="listing-results">
          <ListingToolbar
            count={products.length}
            sort={sort}
            onSortChange={setSort}
            search={search}
            activeFilters={activeFilters}
            onRemoveFilter={toggleFilter}
            onClearSearch={clearSearch}
            onClearAll={clearAll}
            onToggleFilters={() => setFiltersOpen((o) => !o)}
          />
          {content}
        </div>
      </div>
    </div>
  );
}

export default ProductListing;
