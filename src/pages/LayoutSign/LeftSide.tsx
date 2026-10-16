export default function LeftSide() {
  return (
    <>
      <section className="hidden lg:block">
        {/* Wesal Branding */}
        <div className="flex items-center gap-4">
          <img
            src="/public/wesal-logo.png"
            alt="Wesal Logo"
            className="h-[72px] w-[72px] object-contain"
          />

          <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-[58px] font-extrabold leading-none tracking-tight text-transparent xl:text-[64px]">
            WESAL
          </h1>
        </div>

        <p className="mt-5 max-w-[650px] text-[24px] leading-[1.45] text-[#172f52]">
          Connect with friends and the world around you on WESAL.
        </p>

        {/* About Wesal */}
        <div className="mt-7 rounded-2xl border border-[#c7d5ff] bg-white p-6 shadow-sm">
          <p className="text-[14px] font-bold tracking-[2.5px] text-[#4f46e5]">
            ABOUT WESAL
          </p>

          <h2 className="mt-2 text-[19px] font-bold text-[#17223b]">
            Egypt's Leading Social Connection Platform Since 2026
          </h2>

          <p className="mt-3 text-[14px] leading-6 text-[#52627b]">
            Wesal is a modern social media platform designed to connect people
            on a deeper, more meaningful level. We believe technology should
            bridge gaps and strengthen human bonds; therefore, we offer an
            interactive environment that blends seamless communication, quality
            content, and user privacy.
          </p>

          {/* Statistics */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat number="2026" label="FOUNDED" />
            <Stat number="40K+" label="GRADUATES" />
            <Stat number="50+" label="PARTNER COMPANIES" />
            <Stat number="5" label="BRANCHES" />
            <Stat number="20" label="DIPLOMAS AVAILABLE" />
          </div>
        </div>
      </section>
    </>
  );
}
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-[#c7d5ff] bg-[#f3f6ff] px-3 py-3">
      <p className="text-[17px] font-bold text-[#0b3694]">{number}</p>

      <p className="mt-1 text-[10px] font-semibold text-[#52627b]">{label}</p>
    </div>
  );
}
