export default function DueloEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-[28px]"
      style={{ backgroundColor: '#FAFAFA', border: '1px solid #F0F0F0' }}>
      <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
        style={{ backgroundColor: '#F0F0F0' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#CCC' }}>
          swords
        </span>
      </div>
      <p className="text-sm font-bold" style={{ color: '#999' }}>Nenhum duelo ativo</p>
      <p className="text-xs text-center max-w-xs" style={{ color: '#BBB' }}>
        Desafie um colega pelo e-mail acima para começar.
      </p>
    </div>
  );
}