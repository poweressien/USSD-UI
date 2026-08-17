import { Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { Welcome } from "../../screens/Welcome/Welcome";
import { Simulate } from "../../screens/Simulate/Simulate";
import { Compare } from "../../screens/Compare/Compare";
import { Network } from "../../screens/Network/Network";
import { DemoMode } from "../../screens/Demo/DemoMode";
import { DocsLayout } from "../../screens/Docs/DocsLayout";
import { NotFound } from "../../screens/NotFound";
import {
  ExecutiveSummary,
  Problem,
  ProposedSolution,
  Architecture,
  ProtocolDoc,
  CapabilityNegotiation,
  WireTransport,
  CatStk,
  Compatibility,
  Security,
  TelcoIntegration,
  Limitations,
  FutureWork,
} from "../../screens/Docs/pages";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/network" element={<Network />} />
        <Route path="/demo" element={<DemoMode />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<ExecutiveSummary />} />
          <Route path="problem" element={<Problem />} />
          <Route path="solution" element={<ProposedSolution />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="protocol" element={<ProtocolDoc />} />
          <Route path="capability-negotiation" element={<CapabilityNegotiation />} />
          <Route path="wire-transport" element={<WireTransport />} />
          <Route path="cat-stk" element={<CatStk />} />
          <Route path="compatibility" element={<Compatibility />} />
          <Route path="security" element={<Security />} />
          <Route path="telco-integration" element={<TelcoIntegration />} />
          <Route path="limitations" element={<Limitations />} />
          <Route path="future-work" element={<FutureWork />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
