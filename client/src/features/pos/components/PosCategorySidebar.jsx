import React from 'react';

export function PosCategorySidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <aside className="pos-categories-sidebar">
      {categories.map((cat) => {
        const catKey = String(cat.id ?? cat.category_id ?? cat.name).toLowerCase();
        const selected = String(selectedCategory).toLowerCase();
        const isActive =
          selected === catKey ||
          ((selected === 'all' || selected === 'popular') &&
            (catKey === 'all' || catKey === 'popular'));

        return (
          <button
            key={catKey}
            className={`pos-category-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(catKey)}
          >
            {cat.name}
          </button>
        );
      })}
    </aside>
  );
}

export default PosCategorySidebar;
