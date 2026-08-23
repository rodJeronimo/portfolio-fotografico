// Dashboard completo (listagem de projetos/fotos) é escopo de M2 (TASK-0006).
export default function AdminHomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="text-muted text-sm">Autenticado com sucesso.</p>
    </main>
  );
}
