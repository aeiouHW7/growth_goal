import { ReactNode } from 'react';

interface Props { title?: string; children: ReactNode; className?: string; action?: ReactNode; onClick?: () => void }
export function Card({ title, children, className, action, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.2s',
      }}
      onMouseOver={e => { if (onClick) (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'); }}
      onMouseOut={e => { if (onClick) (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'); }}
      className={className}
    >
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>{children}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
      <p>{message}</p>
    </div>
  );
}
