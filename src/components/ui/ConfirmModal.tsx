"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "primary";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "primary"
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md z-[101] px-4"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-2xl p-6 shadow-2xl border border-white/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <button onClick={onClose} className="p-1 rounded-md hover:bg-muted/50 transition-colors">
                                    <X size={20} className="text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                                <p className="text-muted-foreground">{description}</p>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors font-medium"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-white transition-all font-medium ${variant === 'danger'
                                            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                                            : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                                        }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
