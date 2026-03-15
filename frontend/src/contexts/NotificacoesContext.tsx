import { createContext, useContext, useState } from 'react';

interface NotificacoesContextType {
  convitesPendentes: number;
  setConvitesPendentes: (n: number) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType>({
  convitesPendentes: 0,
  setConvitesPendentes: () => {},
});

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const [convitesPendentes, setConvitesPendentes] = useState(0);
  return (
    <NotificacoesContext.Provider value={{ convitesPendentes, setConvitesPendentes }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export const useNotificacoes = () => useContext(NotificacoesContext);