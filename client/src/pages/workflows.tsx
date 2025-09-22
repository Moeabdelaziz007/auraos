import Header from "@/components/layout/header";

export default function Workflows() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Workflows" />
      <main className="flex-1 p-6">
        <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Workflows Page Content</p>
        </div>
      </main>
    </div>
  );
}
