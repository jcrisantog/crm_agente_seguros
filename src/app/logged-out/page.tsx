import Link from "next/link";

export default function LoggedOutPage() {
    return (
        <div style={{ padding: 24 }}>
            <h1>Sesión cerrada</h1>
            <p>Tu sesión fue terminada correctamente.</p>
            <Link href="/">Ir al inicio</Link>
        </div>
    );
}