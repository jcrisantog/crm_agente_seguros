"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Shield, KeyRound, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message || "Credenciales incorrectas");
            setIsLoading(false);
            return;
        }

        if (data.user) {
            toast.success("¡Bienvenido al sistema!");
            // La redirección refresca la app para que el Middleware detecte la cookie o token local
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-600/20 p-4 rounded-full border border-indigo-500/30">
                        <Shield className="h-12 w-12 text-indigo-500" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
                    CRM Seguro
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-400">
                    Ingresa tus credenciales para acceder a tu panel.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-neutral-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-neutral-800">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-neutral-300"
                            >
                                Correo Electrónico
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-500" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-neutral-700 bg-neutral-950 text-white rounded-lg py-3"
                                    placeholder="agente@seguros.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-neutral-300"
                            >
                                Contraseña
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-neutral-500" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-neutral-700 bg-neutral-950 text-white rounded-lg py-3"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "Acceder al Sistema"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
