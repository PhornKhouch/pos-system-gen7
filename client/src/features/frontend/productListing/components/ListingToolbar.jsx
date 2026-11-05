import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SORT_OPTIONS } from '../hooks/useProductListing';

export function ListingToolbar({
  count,
  sort,
  onSortChange,
  search,
  activeFilters,
  onRemoveFilter,
  onClearSearch,
  onClearAll,
  onToggleFilters,
}) {
  const hasChips = Boolean(search || activeFilters.length);

  return (
    <>
      <div className="listing-toolbar">
        <button type="button" className="listing-chip listing-filter-toggle" onClick={onToggleFilters}>
          <SlidersHorizontal size={14} />
          Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}
        </button>
        <div className="listing-count">
          {count} {count === 1 ? 'product' : 'products'}
        </div>
        <label className="listing-sort">
          <span>Sort:</span>
          <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasChips && (
        <div className="listing-chips">
          {search && (
            <button type="button" className="listing-chip" onClick={onClearSearch}>
              “{search}” <X size={12} />
            </button>
          )}
          {activeFilters.map((f) => (
            <button
              key={`${f.key}-${f.value}`}
              type="button"
              className="listing-chip"
              onClick={() => onRemoveFilter(f.key, f.value)}
            >
              {f.label} <X size={12} />
            </button>
          ))}
          <button type="button" className="listing-chip dark" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      )}
    </>
  );
}

export default ListingToolbar;
