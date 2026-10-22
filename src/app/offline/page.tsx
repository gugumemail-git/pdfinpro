export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
      <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mb-6">
        <i className="fa-solid fa-wifi" />
      </div>
      <h1 className="text-2xl font-extrabold mb-2">Anda Sedang Offline</h1>
      <p className="text-slate-500 mb-6">Sepertinya koneksi internet Anda terputus. Silakan periksa koneksi Anda dan coba lagi.</p>
      <a href="/" className="px-6 py-3 bg-brand-600 text-white rounded-lg font-bold">
        Muat Ulang Halaman
      </a>
    </div>
  );
}