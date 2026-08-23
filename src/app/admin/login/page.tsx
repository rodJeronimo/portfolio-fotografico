import { signIn } from "@/lib/auth";

// UI completa (estados de erro, loading) é escopo de M2 (TASK-0006).
export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
      >
        <button
          type="submit"
          className="bg-accent text-accent-foreground rounded-md px-5 py-2.5 text-sm font-medium"
        >
          Entrar com GitHub
        </button>
      </form>
    </main>
  );
}
