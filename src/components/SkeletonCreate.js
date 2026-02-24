import React from 'react';
import './SkeletonCreate.css';

export default function SkeletonCreate() {
  return (
    <div className="skeleton-create">
      <div className="skeleton-create__card">
        <div className="skeleton-create__title" />
        <div className="skeleton-create__subtitle" />
        <div className="skeleton-create__slides">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-create__thumb" />
          ))}
        </div>
        <div className="skeleton-create__canvas" />
        <div className="skeleton-create__steps">
          <span className="skeleton-create__step skeleton-create__step--active">Analisando pedido</span>
          <span className="skeleton-create__step">Estruturando slides</span>
          <span className="skeleton-create__step">Quase pronto</span>
        </div>
      </div>
    </div>
  );
}
