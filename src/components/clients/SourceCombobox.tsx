"use client";

import { useEffect, useMemo, useState } from "react";
import { insforge } from "@/lib/insforge";

type SourceComboboxProps = {
    value: string;
    onChange: (value: string) => void;
};

const normalizeSource = (value: string) => value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");

export function SourceCombobox({ value, onChange }: SourceComboboxProps) {
    const [sources, setSources] = useState<string[]>([]);
    const [debouncedValue, setDebouncedValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        async function loadSources() {
            const { data, error } = await insforge.database
                .from("clients")
                .select("fuente")
                .limit(500);

            if (error || !isCurrent) return;

            const uniqueSources = new Map<string, string>();
            (data || []).forEach((client: { fuente?: string | null }) => {
                const source = client.fuente?.trim();
                if (!source) return;

                const normalized = normalizeSource(source);
                if (!uniqueSources.has(normalized)) {
                    uniqueSources.set(normalized, source);
                }
            });

            setSources(Array.from(uniqueSources.values()).sort((a, b) => a.localeCompare(b, "es-MX")));
        }

        void loadSources();
        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedValue(value), 200);
        return () => window.clearTimeout(timeout);
    }, [value]);

    const suggestions = useMemo(() => {
        const query = normalizeSource(debouncedValue);
        if (!query) return [];

        return sources
            .filter((source) => normalizeSource(source).includes(query))
            .slice(0, 8);
    }, [debouncedValue, sources]);

    return (
        <div className="relative space-y-2">
            <label className="text-sm font-medium leading-none">Fuente</label>
            <input
                name="fuente"
                value={value}
                onChange={(event) => {
                    onChange(event.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
                placeholder="Ej. Facebook, referido o evento"
                autoComplete="off"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-20 top-[4.5rem] w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
                    {suggestions.map((source) => (
                        <button
                            key={normalizeSource(source)}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                onChange(source);
                                setIsOpen(false);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                            {source}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
