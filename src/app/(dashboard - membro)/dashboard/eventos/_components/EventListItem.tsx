import {
    Calendar,
    Plus,
    MapPin,
    Clock,
    Users,
    MoreVertical,
    ChevronRight,
    Filter,
    Search
} from 'lucide-react';
export default function EventListItem({ title, date, time, category, attendees }: any) {
    return (
        <div className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-blue-50/30 transition-colors gap-4">
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{date.split(' ')[1]}</span>
                    <span className="text-lg font-black text-slate-800 leading-none">{date.split(' ')[0]}</span>
                </div>
                <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                            <Clock size={12} /> {time}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-8 px-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participantes</span>
                    <span className="text-sm font-bold text-slate-700">{attendees} confirmados</span>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
