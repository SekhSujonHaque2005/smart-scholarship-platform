'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowUpRight,
  MoreVertical,
  GripVertical,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { toast } from 'sonner';

const STAGES = [
  { id: 'PENDING', title: 'New Applications', color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20' },
  { id: 'UNDER_REVIEW', title: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'text-indigo-400', bg: 'bg-indigo-400/5', border: 'border-indigo-400/20' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'text-purple-400', bg: 'bg-purple-400/5', border: 'border-purple-400/20' },
  { id: 'APPROVED', title: 'Awarded', color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20' },
  { id: 'REJECTED', title: 'Archived', color: 'text-rose-400', bg: 'bg-rose-400/5', border: 'border-rose-400/20' }
];

export const KanbanBoard = ({ initialApplications, onStatusUpdate }: any) => {
  const [columns, setColumns] = useState<any>({});

  useEffect(() => {
    const grouped = STAGES.reduce((acc: any, stage) => {
      acc[stage.id] = initialApplications.filter((app: any) => app.status === stage.id);
      return acc;
    }, {});
    setColumns(grouped);
  }, [initialApplications]);

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = Array.from(columns[source.droppableId]);
    const destCol = Array.from(columns[destination.droppableId]);
    const [movedItem] = sourceCol.splice(source.index, 1) as any[];

    // Update state optimistically
    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, movedItem);
      setColumns({ ...columns, [source.droppableId]: sourceCol });
    } else {
      const updatedItem = { ...(movedItem as any), status: destination.droppableId };
      destCol.splice(destination.index, 0, updatedItem);
      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol
      });

      // Backend sync
      try {
        await api.patch(`applications/${(movedItem as any).id}/review`, { 
          status: destination.droppableId,
          remarks: `Stage migrated via Selection War-Room Kanban at ${new Date().toLocaleTimeString()}`
        });
        toast.success(`Candidate migrated to ${destination.droppableId.replace('_', ' ')}`);
        if (onStatusUpdate) onStatusUpdate();
      } catch (err) {
        console.error('Migration failed:', err);
        toast.error('Protocol disruption: Failed to sync migration to ledger.');
        // Revert state on error
        setColumns(columns); 
      }
    }
  };

  return (
    <div className="h-[calc(100vh-320px)] min-h-[600px]">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-6 no-scrollbar">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col w-[320px] shrink-0 bg-accent/20 rounded-[32px] border border-border/50 p-4">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", stage.bg.replace('bg-', 'bg-'), "animate-pulse")} />
                  <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-foreground">{stage.title}</h3>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-50">({columns[stage.id]?.length || 0})</span>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 space-y-4 overflow-y-auto no-scrollbar rounded-2xl transition-colors p-1",
                      snapshot.isDraggingOver ? "bg-white/[0.02]" : ""
                    )}
                  >
                    {columns[stage.id]?.map((app: any, index: number) => (
                      <Draggable key={app.id} draggableId={app.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "group relative bg-card border border-border rounded-3xl p-5 hover:border-indigo-500/30 transition-all",
                              snapshot.isDragging ? "shadow-2xl border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02] z-50" : "shadow-sm"
                            )}
                            onClick={() => window.location.href = `/dashboard/provider/applications/${app.id}`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 transition-colors">
                                  {app.student?.profilePicture ? (
                                    <img src={app.student.profilePicture} alt="" className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    <User size={18} />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-[12px] font-bold text-foreground leading-none mb-1">{app.student?.name}</h4>
                                  <p className="text-[9px] font-mono text-muted-foreground uppercase font-black opacity-60 truncate w-32">{app.scholarship?.title}</p>
                                </div>
                              </div>
                              <div className="p-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-mono font-bold flex items-center gap-1">
                                <ArrowUpRight size={10} />
                                {app.fraudFlag ? Math.round(100 - (app.fraudFlag.fraudScore * 100)) : 100}%
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                <span className="flex items-center gap-1.5"><GraduationCap size={12} /> {app.student?.cgpa || '0.00'}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(app.submittedAt).toLocaleDateString()}</span>
                              </div>
                              
                              {/* Quick Risk Indicator */}
                              {(app.fraudFlag?.fraudScore > 0.5) && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[8px] font-mono font-black uppercase tracking-widest">
                                  <AlertCircle size={10} /> High Risk Anomaly Detected
                                </div>
                              )}
                            </div>

                            {/* Drag Indicator */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical size={16} className="text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
