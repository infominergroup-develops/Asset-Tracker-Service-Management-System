import React from 'react';
import { TicketTimelineEvent } from '../types';
import { CheckCircle2, Clock, AlertCircle, Send, FileText, Wrench, ShieldCheck, UserCheck } from 'lucide-react';

interface TicketTimelineProps {
  events: TicketTimelineEvent[];
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ events }) => {
  const getEventIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('created')) return <Clock className="w-4 h-4 text-[#eb8a23]" />;
    if (act.includes('notif')) return <Send className="w-4 h-4 text-blue-400" />;
    if (act.includes('approved') || act.includes('authorized')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (act.includes('rejected') || act.includes('clarification')) return <AlertCircle className="w-4 h-4 text-rose-500" />;
    if (act.includes('quotation')) return <FileText className="w-4 h-4 text-[#eb8a23]" />;
    if (act.includes('work') || act.includes('scheduled')) return <Wrench className="w-4 h-4 text-amber-500" />;
    if (act.includes('verified') || act.includes('closed')) return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    return <UserCheck className="w-4 h-4 text-[#2d3e50]" />;
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'employee':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'manager':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'director':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'admin':
        return 'bg-slate-800 text-white border-slate-700';
      case 'vendor':
        return 'bg-[#eb8a23]/15 text-[#d97917] border-[#eb8a23]/30 font-semibold';
      case 'system':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return {
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  return (
    <div className="flow-root" id="ticket-workflow-timeline">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const { date, time } = formatDateTime(event.timestamp);
          const isLast = eventIdx === events.length - 1;

          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {!isLast ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3.5">
                  <div>
                    <div className="relative px-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-2 ring-slate-200 shadow-xs">
                        {getEventIcon(event.action)}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#2d3e50]">{event.action}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
                            event.role
                          )}`}
                        >
                          {event.role}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{date}</span>
                        <span>•</span>
                        <span>{time}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                      <span className="font-medium text-slate-800">{event.user}</span>
                      {event.previousStatus && event.newStatus && (
                        <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                          {event.previousStatus} → <strong className="text-[#eb8a23]">{event.newStatus}</strong>
                        </span>
                      )}
                    </div>

                    {event.comment && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 italic">
                        "{event.comment}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
