import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateApelido } from '../services/user';
import Layout from '../components/layout/Layout';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [apelido,  setApelido]  = useState(user?.apelido || '');
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateApelido(apelido);
      await refreshUser();
      setMessage({ type: 'success', text: 'Apelido atualizado com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao atualizar apelido.' });
    } finally {
      setLoading(false);
    }
  }

  const inicial = (user?.apelido || user?.nome || '?').charAt(0).toUpperCase();

  return (
    <Layout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-subtle-text">Conta</span>
        <span className="text-subtle-text" style={{ fontSize: '10px' }}>/</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-dark-text">Meu Perfil</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Card de identidade ─────────────────────────────── */}
        <div
          className="lg:col-span-1 bg-white rounded-3xl p-6 flex flex-col items-center gap-3"
          style={{ border: '1px solid #E5E5E5' }}
        >
          {/* Avatar */}
          <div className="relative">
            {user?.fotoUrl ? (
              <img
                src={user.fotoUrl}
                alt={user.nome}
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: '2px solid #E5E5E5' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                style={{ backgroundColor: '#1A1A1A' }}
              >
                {inicial}
              </div>
            )}
          </div>

          {/* Nome */}
          <div className="text-center">
            <p className="text-sm font-black text-dark-text">{user?.nome}</p>
            <p className="text-[11px] text-subtle-text mt-0.5">{user?.email}</p>
          </div>

          {/* Apelido badge */}
          {user?.apelido && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#F5F5F5', color: '#666' }}
            >
              {user.apelido}
            </span>
          )}

          {/* Divisor */}
          <div className="w-full" style={{ borderTop: '1px solid #F0F0F0' }} />

          {/* Stats placeholder */}
          <div className="w-full grid grid-cols-3 gap-2 text-center">
            {[
              { valor: '0',  label: 'Simulados' },
              { valor: '0%', label: 'Aproveit.' },
              { valor: '-',  label: 'Ranking'   },
            ].map(({ valor, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <p className="text-base font-black text-dark-text">{valor}</p>
                <p className="text-[9px] font-medium uppercase tracking-widest text-subtle-text">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card de edição ────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          <div
            className="bg-white rounded-3xl p-6"
            style={{ border: '1px solid #E5E5E5' }}
          >
            {/* Título */}
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-4">
              Editar Perfil
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="apelido"
                  className="text-[10px] font-black uppercase tracking-widest text-dark-text"
                >
                  Apelido
                </label>
                <input
                  type="text"
                  id="apelido"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Como quer ser chamado no ranking?"
                  maxLength={30}
                  className="px-4 py-3 rounded-2xl text-sm text-dark-text outline-none transition-all font-medium placeholder:text-subtle-text"
                  style={{ border: '1.5px solid #E5E5E5', backgroundColor: '#FAFAFA' }}
                  onFocus={(e) => (e.target.style.borderColor = '#1A1A1A')}
                  onBlur={(e)  => (e.target.style.borderColor = '#E5E5E5')}
                />
                <p className="text-[10px] text-subtle-text">
                  Máximo 30 caracteres · exibido no ranking
                </p>
              </div>

              {/* Feedback de mensagem */}
              {message && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium"
                  style={
                    message.type === 'success'
                      ? { backgroundColor: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0' }
                      : { backgroundColor: '#FFF5F5', color: '#DC2626', border: '1px solid #FECACA' }
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {message.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  style={
                    loading
                      ? { backgroundColor: '#F0F0F0', color: '#BBB', cursor: 'not-allowed' }
                      : { backgroundColor: '#1A1A1A', color: '#fff' }
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                    {loading ? 'hourglass_top' : 'save'}
                  </span>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Info da conta ──────────────────────────────── */}
          <div
            className="bg-white rounded-3xl p-6"
            style={{ border: '1px solid #E5E5E5' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-subtle-text mb-4">
              Informações da Conta
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: 'person',        label: 'Nome',   valor: user?.nome  ?? '—' },
                { icon: 'mail',          label: 'E-mail', valor: user?.email ?? '—' },
                { icon: 'account_circle',label: 'Login',  valor: 'Google' },
              ].map(({ icon, label, valor }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}
                >
                  <span className="material-symbols-outlined text-subtle-text" style={{ fontSize: '16px' }}>
                    {icon}
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-subtle-text">{label}</p>
                    <p className="text-xs font-medium text-dark-text mt-0.5">{valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}