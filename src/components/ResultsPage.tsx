import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, ArrowLeft, RefreshCw } from 'lucide-react';
import { api, Survey } from '../lib/api';
import { SOCIAL_MEDIA_PLATFORMS } from '../types/platforms';

interface PlatformStats {
  platform_name: string;
  count: number;
  percentage: number;
}

interface ResultsPageProps {
  survey: Survey;
  onBack: () => void;
}

export default function ResultsPage({ survey, onBack }: ResultsPageProps) {
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await api.getSurveyResults(survey.id);

      setTotalResponses(results.total_responses);

      // Initialize all platforms with 0 count
      const platformCounts = new Map<string, number>();
      SOCIAL_MEDIA_PLATFORMS.forEach(platform => {
        platformCounts.set(platform, 0);
      });

      // Update counts from results
      results.platform_counts.forEach(pc => {
        platformCounts.set(pc.platform_name, pc.count);
      });

      const statsData: PlatformStats[] = Array.from(platformCounts.entries())
        .map(([platform_name, count]) => ({
          platform_name,
          count,
          percentage: results.total_responses > 0 ? (count / results.total_responses) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setStats(statsData);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('結果の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getBarColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (index === 1) return 'bg-gradient-to-r from-blue-400 to-cyan-400';
    if (index === 2) return 'bg-gradient-to-r from-blue-300 to-cyan-300';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">結果を読み込み中...</p>
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
            onClick={fetchResults}
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
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          調査一覧に戻る
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
              <p className="text-sm text-gray-600 mt-1">調査結果</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">総回答数</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{totalResponses}</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
                <span className="text-sm font-medium text-gray-600">プラットフォーム数</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{SOCIAL_MEDIA_PLATFORMS.length}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">プラットフォーム別ランキング</h2>
            <button
              onClick={fetchResults}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              更新
            </button>
          </div>

          <div className="space-y-4">
            {stats.map((stat, index) => {
              const medal = getMedalEmoji(index);
              return (
                <div key={stat.platform_name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {medal && <span className="text-xl">{medal}</span>}
                      <span className="font-medium text-gray-900">{stat.platform_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(index)} transition-all duration-1000 ease-out`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </p>
      </div>
    </div>
  );
}
