import { Suspense } from "react";
import TestInterface from "./test-interface";

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestInterface />
    </Suspense>
  );
}
