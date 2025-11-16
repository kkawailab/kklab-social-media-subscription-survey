import { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { SOCIAL_MEDIA_PLATFORMS } from '../types/platforms';
import { api, Survey } from '../lib/api';

interface SurveyFormProps {
  survey: Survey;
  onSuccess: () => void;
  onBack: () => void;
}

export default function SurveyForm({ survey, onSuccess, onBack }: SurveyFormProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (platform: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  const selectAll = () => {
    setSelectedPlatforms(new Set(SOCIAL_MEDIA_PLATFORMS));
  };

  const clearAll = () => {
    setSelectedPlatforms(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlatforms.size === 0) {
      setError('少なくとも1つのプラットフォームを選択してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitResponse(survey.id, Array.from(selectedPlatforms));
      onSuccess();
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          調査一覧に戻る
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              {survey.description}
            </p>
          )}
          <p className="text-gray-600">
            あなたが利用しているソーシャルメディアをすべて選択してください（複数選択可能）
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              選択済み: <span className="font-semibold text-blue-600">{selectedPlatforms.size}</span> / {SOCIAL_MEDIA_PLATFORMS.length}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                すべて選択
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                すべて解除
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {SOCIAL_MEDIA_PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.has(platform);
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-left font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                    {platform}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || selectedPlatforms.size === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                アンケートを送信
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          このアンケートは匿名で収集されます
        </p>
      </div>
    </div>
  );
}
