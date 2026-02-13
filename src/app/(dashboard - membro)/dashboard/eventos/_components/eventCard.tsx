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
export default function EventCard({ title, date, time, location, type, color }: any) {
    return (
        <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-lg ${color} bg-opacity-10 ${color.replace('bg-', 'text-')} text-[10px] font-black uppercase tracking-widest`}>
                    {type}
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-4">{title}</h3>
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{date} às {time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{location}</span>
                </div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +15
                    </div>
                </div>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}