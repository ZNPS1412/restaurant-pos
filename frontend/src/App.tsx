import { useCallback, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { PosPage } from "./pages/PosPage";

function App() {
  const [section, setSection] = useState("Dashboard");
  const [error, setError] = useState("");
  const handleError = useCallback(
    (value: unknown) => setError((value as Error).message),
    [],
  );

  return (
    <AppShell section={section} onSectionChange={setSection}>
      <div className="space-y-8">
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button onClick={() => setError("")} type="button">
              Dismiss
            </button>
          </div>
        )}
        <PosPage
          section={section}
          onError={handleError}
        />
      </div>
    </AppShell>
  );
}

export default App;
