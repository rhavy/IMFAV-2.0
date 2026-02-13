import { redirect } from "next/navigation";
import { getServerSessionWithRoles } from "@/lib/auth-utils";

export default async function CategoriasEventosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSessionWithRoles();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {children}
        </div>
    );
}