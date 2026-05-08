export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[#1e3a5f]">
          tallent<span className="text-[#f5a623]">acad</span>
        </h1>
        <p className="mt-3 text-sm tracking-widest text-[#4a90d9] uppercase">
          Plataforma B-Learning
        </p>
        <p className="mt-8 text-gray-500 max-w-md">
          A plataforma de formacao online para empresas que querem crescer.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="/admin"
            className="px-6 py-3 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#2a4f7f] transition"
          >
            Area de Gestao
          </a>
        </div>
      </div>
    </main>
  )
}
