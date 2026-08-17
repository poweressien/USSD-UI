import { BrowserRouter } from "react-router-dom";
import { CapabilityProvider } from "./app/providers/CapabilityProvider";
import { AppRouter } from "./app/router/AppRouter";

export default function App() {
  return (
    <CapabilityProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CapabilityProvider>
  );
}
