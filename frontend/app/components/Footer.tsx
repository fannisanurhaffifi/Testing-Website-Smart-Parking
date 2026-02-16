export default function Footer() {
  return (
    <footer className="mt-10 w-full bg-[#1F3A93] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-3 text-center text-xs sm:flex-row sm:text-left">
          {/* LEFT */}
          <p>
            © {new Date().getFullYear()} Sistem Monitoring Parkir Teknik Geodesi
            Universitas Lampung
            <br className="sm:hidden" />
          </p>

          {/* RIGHT */}
          <p className="text-white/80">Dikembangkan untuk kebutuhan akademik</p>
        </div>
      </div>
    </footer>
  );
}
