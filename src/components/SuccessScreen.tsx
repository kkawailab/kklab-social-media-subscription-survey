import { CheckCircle, BarChart3, ArrowRight } from 'lucide-react';

interface SuccessScreenProps {
  onViewResults: () => void;
  onReturnToSurvey: () => void;
}

export default function SuccessScreen({ onViewResults, onReturnToSurvey }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              送信完了！
            </h1>
            <p className="text-gray-600">
              ご協力ありがとうございました。
              <br />
              アンケートへの回答を受け付けました。
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onViewResults}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              調査結果を見る
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onReturnToSurvey}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              アンケートに戻る
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          あなたの回答は匿名で統計に含まれます
        </p>
      </div>
    </div>
  );
}
