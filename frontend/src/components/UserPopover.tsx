import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import type { User } from '../api';

export function UserPopover() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.getUser()
      .then(setUser)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (error) return null;

  const initial = user?.nickname?.[0]?.toUpperCase() || user?.occupation?.[0]?.toUpperCase() || '?';
  const initials = user?.nickname || '';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {initials || initial}
      </div>

      {open && user && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 16px', minWidth: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.nickname || user.occupation}</div>
          {user.occupation && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              {user.occupation}{user.industry ? ` · ${user.industry}` : ''}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            {user.weekdayAvailableHours}h/工作日 {user.weekendAvailableHours}h/周末
          </div>
          {user.goalDomains?.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              {user.goalDomains.join(' ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
