import { type ReactNode } from 'react';
import { C } from '../tokens';

interface Props {
  children: ReactNode;
}

export default function InterageLayout({ children }: Props) {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        fontFamily: "'Manrope', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Frame centralizado mobile-first */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 430,
          margin: '0 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}