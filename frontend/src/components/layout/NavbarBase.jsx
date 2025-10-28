import UserMenu from "./UserMenu";

export default function NavbarBase({ children }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => (window.location.href = "/")}
          className="text-2xl font-semibold tracking-tight"
        >
          BeautyConnect
        </button>

        {/* User Menu seulement */}
        <UserMenu />
      </div>

      {/* Onglets dynamiques si fournis */}
      {children && (
        <nav className="mx-auto max-w-6xl px-4">
          <ul className="flex items-center space-x-8 text-sm text-gray-700">
            {children}
          </ul>
        </nav>
      )}
    </header>
  );
}
