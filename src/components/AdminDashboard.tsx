import { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  LogOut,
  RefreshCw,
  Download,
  Database,
  ClipboardList
} from 'lucide-react';
import { api, Survey } from '../lib/api';
import { SOCIAL_MEDIA_PLATFORMS } from '../types/platforms';
import SurveyManagement from './SurveyManagement';

interface PlatformStats {
  platform_name: string;
  count: number;
  percentage: number;
}

interface ResponseDetail {
  id: string;
  session_id: string;
  created_at: string;
  platforms: string[];
  survey_title: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | 'all'>('all');
  const [totalResponses, setTotalResponses] = useState(0);
  const [totalSelections, setTotalSelections] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = async () => {
    try {
      const surveysData = await api.getAllSurveys();
      setSurveys(surveysData);
    } catch (err) {
      console.error('Error fetching surveys:', err);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchSurveys();

      // Get stats for the selected survey or all surveys
      if (selectedSurveyId === 'all') {
        // Aggregate stats from all surveys
        const allSurveys = await api.getAllSurveys();
        const statsPromises = allSurveys.map(s => api.getSurveyStats(s.id));
        const allSurveysStats = await Promise.all(statsPromises);

        let totalResponses = 0;
        const platformMap = new Map<string, number>();
        const allRecentResponses: ResponseDetail[] = [];

        SOCIAL_MEDIA_PLATFORMS.forEach(platform => {
          platformMap.set(platform, 0);
        });

        allSurveysStats.forEach((stats, idx) => {
          totalResponses += stats.total_responses;

          stats.platform_counts.forEach(pc => {
            const current = platformMap.get(pc.platform_name) || 0;
            platformMap.set(pc.platform_name, current + pc.count);
          });

          stats.recent_responses.forEach(r => {
            allRecentResponses.push({
              id: r.id,
              session_id: r.id,
              created_at: r.created_at,
              platforms: r.platforms ? r.platforms.split(', ') : [],
              survey_title: allSurveys[idx].title,
            });
          });
        });

        setTotalResponses(totalResponses);

        let totalSelections = 0;
        platformMap.forEach(count => {
          totalSelections += count;
        });
        setTotalSelections(totalSelections);

        const statsData: PlatformStats[] = Array.from(platformMap.entries())
          .map(([platform_name, count]) => ({
            platform_name,
            count,
            percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        setStats(statsData);

        allRecentResponses.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setResponses(allRecentResponses.slice(0, 10));

      } else {
        // Get stats for a specific survey
        const stats = await api.getSurveyStats(selectedSurveyId);
        const survey = await api.getSurvey(selectedSurveyId);

        setTotalResponses(stats.total_responses);

        let totalSelections = 0;
        const platformMap = new Map<string, number>();

        SOCIAL_MEDIA_PLATFORMS.forEach(platform => {
          platformMap.set(platform, 0);
        });

        stats.platform_counts.forEach(pc => {
          platformMap.set(pc.platform_name, pc.count);
          totalSelections += pc.count;
        });

        setTotalSelections(totalSelections);

        const statsData: PlatformStats[] = Array.from(platformMap.entries())
          .map(([platform_name, count]) => ({
            platform_name,
            count,
            percentage: stats.total_responses > 0 ? (count / stats.total_responses) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        setStats(statsData);

        const detailedResponses: ResponseDetail[] = stats.recent_responses.map(r => ({
          id: r.id,
          session_id: r.id,
          created_at: r.created_at,
          platforms: r.platforms ? r.platforms.split(', ') : [],
          survey_title: survey.title,
        }));

        setResponses(detailedResponses);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('データの取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedSurveyId]);

  const exportToCSV = () => {
    const csvRows = [
      ['回答ID', '調査名', '回答日時', '選択数', '選択プラットフォーム'].join(','),
      ...responses.map(response => [
        response.id,
        response.survey_title,
        new Date(response.created_at).toLocaleString('ja-JP'),
        response.platforms.length,
        response.platforms.join('; ')
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `survey_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const averageSelectionsPerResponse = totalResponses > 0
    ? (totalSelections / totalResponses).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">管理データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAdminData}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
            ログアウト
          </button>
        </div>

        <div className="mb-8">
          <SurveyManagement
            surveys={surveys}
            onSurveyCreated={fetchAdminData}
            onSurveyUpdated={fetchAdminData}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">調査を選択</label>
          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none bg-white"
          >
            <option value="all">すべての調査</option>
            {surveys.map(survey => (
              <option key={survey.id} value={survey.id}>
                {survey.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">総回答数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalResponses}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-gray-600">総選択数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalSelections}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">平均選択数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{averageSelectionsPerResponse}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">調査数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{surveys.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">プラットフォーム統計</h2>
              <button
                onClick={fetchAdminData}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                更新
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {stats.map((stat, index) => (
                <div key={stat.platform_name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                      <span className="font-medium text-gray-900">{stat.platform_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{stat.count}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({stat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-500 to-slate-700 transition-all duration-500"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">回答履歴</h2>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV出力
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {responses.map((response) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        {response.survey_title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(response.created_at).toLocaleString('ja-JP')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        選択数: {response.platforms.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {response.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {responses.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  まだ回答がありません
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
