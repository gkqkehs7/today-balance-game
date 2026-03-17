'use client';

interface MockBannerProps {
  isMock: boolean;
}

export default function MockBanner({ isMock }: MockBannerProps) {
  if (!isMock) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: 'rgba(255,255,255,0.75)',
        fontSize: '0.75rem',
        padding: '6px 18px',
        borderRadius: '999px',
        zIndex: 999,
        letterSpacing: '0.03em',
        border: '1px solid rgba(255,255,255,0.15)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      미리보기 모드 — 서버 연결 없이 Mock 데이터로 동작 중
    </div>
  );
}
