import { ReactNode } from 'react';

interface Props {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title = '还没有设定目标', message, action }: Props) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--text-dim)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🎯</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.6 }}>
        {message || '在终端输入 growth，开始设定你的目标吧！'}
      </p>
      {action || (
        <div style={{
          fontSize: 13, color: 'var(--text-muted)',
          background: 'var(--bg)', padding: '12px 16px',
          borderRadius: 8, display: 'inline-block',
        }}>
          打开终端 → 输入 growth → 选择 2 管理目标
        </div>
      )}
    </div>
  );
}

export function LoadingState({ message = '加载中...' }: { message?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 14 }}>
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>{message || '数据加载失败'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 16px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer',
            fontSize: 13,
          }}
        >
          重试
        </button>
      )}
    </div>
  );
}
