
export function ModalInfo({ label, value }: { label: string, value: string | Date | undefined }) {
    // Função para converter valor para string segura
    const formatValue = (val: string | Date | undefined): string => {
        if (val === undefined || val === null) {
            return 'Não informado';
        }
        
        // Se for uma instância de Date, formata como string
        if (val instanceof Date) {
            return val.toLocaleString('pt-BR');
        }
        
        // Se for uma string que parece ser uma data, tenta converter
        if (typeof val === 'string' && !isNaN(Date.parse(val))) {
            try {
                return new Date(val).toLocaleString('pt-BR');
            } catch {
                return val;
            }
        }
        
        // Retorna o valor como string
        return String(val);
    };

    return (
        <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <p className="text-sm font-bold text-slate-800">{formatValue(value)}</p>
        </div>
    );
}