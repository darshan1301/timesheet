import { Menu } from "lucide-react";

// eslint-disable-next-line react/prop-types
const Navbar = ({ children, setIsOpenSidebar }) => {
  function toggleSidebar() {
    setIsOpenSidebar((prev) => !prev);
  }

  return (
    <nav className="flex justify-between mb-2 sticky z-10 top-0 bg-slate-900 items-center text-stone-50 h-12 px-4">
      <div className="flex gap-1">
        <h1 className="text-green-500 uppercase font-bold">Timesheet</h1>
      </div>
      <button
        onClick={toggleSidebar}
        className="p-2 hover:cursor-pointer rounded-md xl:hidden hover:bg-gray-700 active:bg-gray-600 transition-all">
        <Menu className="w-6 h-6 text-stone-50" />
      </button>
    </nav>
  );
};

export default Navbar;
