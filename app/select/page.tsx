import { Suspense } from "react";
import SelectClient from "./SelectClient";

export default function SelectPage() {
  return (
    <Suspense fallback={<main className="pageHeader"><p>Loading...</p></main>}>
      <SelectClient />
    </Suspense>
  );
}
