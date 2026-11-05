import React from 'react';

export function FilterSidebar({ facets, onToggle, open }) {
  return (
    <aside className={`listing-filters ${open ? 'open' : ''}`}>
      {facets.map((facet) => (
        <div key={facet.key} className="listing-facet">
          <div className="listing-facet-title">{facet.title}</div>
          {facet.options.length ? (
            facet.options.map((option) => (
              <label
                key={option.value}
                className={`listing-facet-option ${!option.count && !option.checked ? 'empty' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={option.checked}
                  onChange={() => onToggle(facet.key, option.value)}
                />
                <span className="listing-facet-label">{option.label}</span>
                <span className="listing-facet-count">{option.count}</span>
              </label>
            ))
          ) : (
            <div className="listing-facet-none">No options</div>
          )}
        </div>
      ))}
    </aside>
  );
}

export default FilterSidebar;
