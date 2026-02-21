export default function SkeletonCard({ rows = 3 }) {
  return (
    <div className="admin-card" aria-busy="true" aria-live="polite">
      <div style={{ height: 16, width: '35%', marginBottom: 12, background: 'rgba(156,182,194,0.45)', borderRadius: 8 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          style={{
            height: 12,
            width: `${90 - index * 8}%`,
            marginBottom: 10,
            background: 'rgba(156,182,194,0.3)',
            borderRadius: 999,
          }}
        />
      ))}
    </div>
  );
}
