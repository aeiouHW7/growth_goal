import { useEffect, useState } from 'react';
import { subscribe } from '../utils/toast';

export function ToastContainer() {
  const [items, setItems] = useState<Array<{ id: number; msg: string }>>([]);

  useEffect(() => {
    return subscribe((msg) => {
      const id = Date.now() + Math.random();
      setItems(prev => [...prev, { id, msg }]);
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== id));
      }, 2400);
    });
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {items.map(i => (
        <div key={i.id} style={{
          background: 'rgba(29,29,31,0.92)', color: '#fff', padding: '10px 18px',
          borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)', maxWidth: '80vw',
        }}>
          {i.msg}
        </div>
      ))}
    </div>
  );
}
