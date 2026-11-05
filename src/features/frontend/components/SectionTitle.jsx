import React from 'react';

export function SectionTitle({ title, action }) {
  return (
    <div className="store-section-title">
      <h2>{title}</h2>
      {action ? <div className="store-section-action">{action}</div> : null}
    </div>
  );
}

export default SectionTitle;
