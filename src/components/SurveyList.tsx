import { useEffect, useState } from 'react';
import { ClipboardList, ChevronRight, RefreshCw, Calendar, Users } from 'lucide-react';
import { api, Survey } from '../lib/api';

interface SurveyListProps {
  onSelectSurvey: (survey: Survey) => void;
  onAdminAccess: () => void;
}

export default function SurveyList({ onSelectSurvey, onAdminAccess }: SurveyListProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

  const fetchSurveys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const surveysData = await api.getSurveys();

      // Filter active and visible surveys
      const activeSurveys = surveysData.filter(s => s.is_active && s.is_visible);
      setSurveys(activeSurveys);

      // Get response counts for each survey
      const counts: Record<string, number> = {};
      for (const survey of activeSurveys) {
        const results = await api.getSurveyResults(survey.id);
        counts[survey.id] = results.total_responses;
      }
      setResponseCounts(counts);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError('調査の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">調査を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSurveys}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={onAdminAccess}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            管理者
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            アンケート調査
          </h1>
          <p className="text-lg text-gray-600">
            参加したい調査を選択してください
          </p>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">現在、実施中の調査はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => {
              const responseCount = responseCounts[survey.id] || 0;
              return (
                <button
                  key={survey.id}
                  onClick={() => onSelectSurvey(survey)}
                  className="w-full bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-200 border-2 border-transparent hover:border-blue-500 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-left">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {survey.title}
                      </h2>
                      {survey.description && (
                        <p className="text-gray-600 mb-4">{survey.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(survey.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{responseCount}件の回答</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
