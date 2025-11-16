import { useState } from 'react';
import { Plus, X, Save, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { api, Survey } from '../lib/api';

interface SurveyManagementProps {
  surveys: Survey[];
  onSurveyCreated: () => void;
  onSurveyUpdated: () => void;
}

export default function SurveyManagement({ surveys, onSurveyCreated, onSurveyUpdated }: SurveyManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [responseCount, setResponseCount] = useState<Record<string, number>>({});

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await api.createSurvey({
        title: newTitle.trim(),
        description: newDescription.trim() || '',
        is_active: true,
        is_visible: true,
      });

      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
      onSurveyCreated();
    } catch (err) {
      console.error('Error creating survey:', err);
      setError('調査の作成中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (survey: Survey) => {
    try {
      await api.updateSurvey(survey.id, {
        title: survey.title,
        description: survey.description || '',
        is_active: !survey.is_active,
        is_visible: !!survey.is_visible,
      });

      onSurveyUpdated();
    } catch (err) {
      console.error('Error updating survey:', err);
      setError('調査の更新中にエラーが発生しました');
    }
  };

  const handleToggleVisible = async (survey: Survey) => {
    try {
      await api.updateSurvey(survey.id, {
        title: survey.title,
        description: survey.description || '',
        is_active: !!survey.is_active,
        is_visible: survey.is_visible ? false : true,
      });

      onSurveyUpdated();
    } catch (err) {
      console.error('Error updating survey visibility:', err);
      setError('表示設定の更新中にエラーが発生しました');
    }
  };

  const handleResetSurvey = async (surveyId: string) => {
    setIsSaving(true);
    setError(null);

    try {
      await api.deleteAllResponses(surveyId);
      setConfirmDelete(null);
      onSurveyUpdated();
    } catch (err) {
      console.error('Error resetting survey:', err);
      setError('調査の初期化中にエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const loadResponseCounts = async () => {
    const counts: Record<string, number> = {};
    for (const survey of surveys) {
      const results = await api.getSurveyResults(survey.id);
      counts[survey.id] = results.total_responses;
    }
    setResponseCount(counts);
  };

  useState(() => {
    if (surveys.length > 0) {
      loadResponseCounts();
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">調査管理</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            新規作成
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">新しい調査を作成</h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTitle('');
                setNewDescription('');
                setError(null);
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="例: 2024年度 ソーシャルメディア調査"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="調査の目的や詳細を入力してください"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '作成中...' : '作成'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {surveys.length === 0 ? (
          <p className="text-center text-gray-500 py-8">調査がありません</p>
        ) : (
          surveys.map((survey) => (
            <div
              key={survey.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {confirmDelete === survey.id ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">
                        アンケート結果を初期化しますか？
                      </h4>
                      <p className="text-sm text-red-700 mb-2">
                        「{survey.title}」のすべての回答データ（{responseCount[survey.id] || 0}件）が削除されます。
                        この操作は取り消せません。
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResetSurvey(survey.id)}
                      disabled={isSaving}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                    >
                      {isSaving ? '初期化中...' : '初期化する'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      disabled={isSaving}
                      className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-start justify-between ${!survey.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{survey.title}</h3>
                      {!survey.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">終了</span>
                      )}
                      {!survey.is_visible && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">非表示</span>
                      )}
                    </div>
                    {survey.description && (
                      <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>作成日: {new Date(survey.created_at).toLocaleString('ja-JP')}</span>
                      <span>回答数: {responseCount[survey.id] || 0}件</span>
                      {!survey.is_active && (
                        <span className="text-orange-600 font-medium">回答受付停止中</span>
                      )}
                      {!survey.is_visible && (
                        <span className="text-yellow-600 font-medium">一覧に非表示</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleVisible(survey)}
                      className={`p-2 rounded-lg transition-colors ${
                        survey.is_visible
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={survey.is_visible ? '一覧に表示中 - クリックで非表示' : '一覧に非表示 - クリックで表示'}
                    >
                      {survey.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(survey.id)}
                      disabled={!!survey.is_active}
                      className={`p-2 rounded-lg transition-colors ${
                        survey.is_active
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={survey.is_active ? '実施中の調査は初期化できません' : 'アンケート結果を初期化'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(survey)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        survey.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {survey.is_active ? '終了する' : '再開する'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
