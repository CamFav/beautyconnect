import { NavLink } from "react-router-dom";
import NavbarBase from "./NavbarBase";

const linkClass = ({ isActive }) =>
  "block relative py-3 hover:text-gray-900 " +
  (isActive
    ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
    : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300");

export default function NavbarPro() {
  return (
    <NavbarBase>
      <li>
        <NavLink to="/pro/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
      </li>

      <li>
        <NavLink to="/pro/services" className={linkClass}>
          Mes services
        </NavLink>
      </li>

      <li>
        <NavLink to="/pro/disponibilites" className={linkClass}>
          Disponibilités
        </NavLink>
      </li>

      <li>
        <NavLink to="/pro/reservations" className={linkClass}>
          Réservations
        </NavLink>
      </li>
    </NavbarBase>
  );
}
