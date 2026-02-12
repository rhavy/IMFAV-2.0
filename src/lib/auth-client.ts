import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth" // Importe o tipo da sua config de servidor

export const authClient = createAuthClient({
    /** URL base do Better-Auth */
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",

    /** * Este plugin faz a "mágica" de ler os additionalFields que você 
     * configurou no servidor e disponibilizá-los no TypeScript do Frontend.
     */
    plugins: [
        inferAdditionalFields<typeof auth>()
    ]
})