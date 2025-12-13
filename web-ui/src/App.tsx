import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { TabNavigation } from './components/layout/TabNavigation';
import { Footer } from './components/layout/Footer';
import { SystemOverview } from './pages/SystemOverview';
import { WorkflowExecution } from './pages/WorkflowExecution';
import { DataPipeline } from './pages/DataPipeline';
import { Results } from './pages/Results';
import { Artifacts } from './pages/Artifacts';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <TabNavigation />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<SystemOverview />} />
            <Route path="/workflow" element={<WorkflowExecution />} />
            <Route path="/workflow/:id" element={<WorkflowExecution />} />
            <Route path="/pipeline" element={<DataPipeline />} />
            <Route path="/results" element={<Results />} />
            <Route path="/artifacts" element={<Artifacts />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
