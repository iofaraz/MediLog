import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  style 
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const SkeletonRow: React.FC<{ count?: number, style?: React.CSSProperties }> = ({ count = 1, style }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', ...style }}>
          <Skeleton width={40} height={40} borderRadius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <Skeleton width="40%" height={16} />
            <Skeleton width="20%" height={12} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Skeleton width="60%" height={16} />
          </div>
          <div style={{ width: '100px', display: 'flex', alignItems: 'center' }}>
            <Skeleton width="100%" height={24} borderRadius="12px" />
          </div>
        </div>
      ))}
    </>
  );
};
