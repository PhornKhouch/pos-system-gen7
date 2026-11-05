import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '@/utils/imageUtils';

/**
 * Main image + thumbnail strip (vertical on desktop, horizontal under the image on mobile)
 */
export function ProductGallery({ images = [], placeholder = 'PRD' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState({});

  useEffect(() => {
    setActiveIndex(0);
    setFailed({});
  }, [images]);

  const markFailed = (key) => setFailed((f) => ({ ...f, [key]: true }));
  const active = images[activeIndex];
  const activeUrl = active && !failed[active.id] ? getAssetUrl(active.url) : null;

  return (
    <div className="pd-gallery">
      {images.length > 1 && (
        <div className="pd-thumbs">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={`pd-thumb${i === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1}`}
            >
              {failed[img.id] ? (
                <span>{i + 1}</span>
              ) : (
                <img src={getAssetUrl(img.url)} alt={img.alt} onError={() => markFailed(img.id)} />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="pd-main-image">
        {activeUrl ? (
          <img src={activeUrl} alt={active.alt} onError={() => markFailed(active.id)} />
        ) : (
          <span>{placeholder}</span>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
