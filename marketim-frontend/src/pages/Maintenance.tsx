import { AlertTriangle } from "lucide-react";

type Props = {
  message?: string;
};

export default function Maintenance({ message }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bakımdayız
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {message ||
            "Daha iyi hizmet verebilmek için kısa bir bakım çalışması yapıyoruz. Lütfen daha sonra tekrar deneyin."}
        </p>
      </div>
    </div>
  );
}
