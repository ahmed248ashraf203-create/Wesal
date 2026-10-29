import Navbar from "./Navbar/Navbar";
import { Outlet } from "react-router-dom";
import MobileNav from "../components/MobileNav/MobileNav";

export default function Layout() {
  return (
    <>
      <Navbar />
      {/* pb-16 keeps content clear of the mobile bottom bar */}
      <div className="pb-16 sm:pb-0">
        <Outlet />
      </div>
      <MobileNav />
    </>
  );
}
