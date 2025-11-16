import { useState } from 'react';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import SuccessScreen from './components/SuccessScreen';
import ResultsPage from './components/ResultsPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Survey } from './lib/api';

type AppState = 'survey-list' | 'survey-form' | 'success' | 'results' | 'admin-login' | 'admin-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('survey-list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const handleSelectSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setCurrentView('survey-form');
  };

  const handleSurveySuccess = () => {
    setCurrentView('success');
  };

  const handleViewResults = () => {
    setCurrentView('results');
  };

  const handleReturnToSurveyList = () => {
    setSelectedSurvey(null);
    setCurrentView('survey-list');
  };

  const handleAdminAccess = () => {
    setCurrentView('admin-login');
  };

  const handleAdminLogin = () => {
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setSelectedSurvey(null);
    setCurrentView('survey-list');
  };

  return (
    <>
      {currentView === 'survey-list' && (
        <SurveyList onSelectSurvey={handleSelectSurvey} onAdminAccess={handleAdminAccess} />
      )}
      {currentView === 'survey-form' && selectedSurvey && (
        <SurveyForm
          survey={selectedSurvey}
          onSuccess={handleSurveySuccess}
          onBack={handleReturnToSurveyList}
        />
      )}
      {currentView === 'success' && selectedSurvey && (
        <SuccessScreen
          onViewResults={handleViewResults}
          onReturnToSurvey={handleReturnToSurveyList}
        />
      )}
      {currentView === 'results' && selectedSurvey && (
        <ResultsPage survey={selectedSurvey} onBack={handleReturnToSurveyList} />
      )}
      {currentView === 'admin-login' && <AdminLogin onLogin={handleAdminLogin} />}
      {currentView === 'admin-dashboard' && <AdminDashboard onLogout={handleAdminLogout} />}
    </>
  );
}

export default App;
