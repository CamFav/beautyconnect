import { NavLink } from "react-router-dom";
import NavbarBase from "./NavbarBase";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextBase";

export default function NavbarClient() {
  const { user } = useContext(AuthContext);
  const isLogged = !!user;

  return (
    <NavbarBase>
      {/* Feed toujours accessible */}
      <li>
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            "block relative py-3 hover:text-gray-900 " +
            (isActive
              ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
              : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300")
          }
        >
          Feed
        </NavLink>
      </li>

      {/* Suivis et Mes rendez-vous uniquement si connecté */}
      {isLogged && (
        <>
          <li>
            <NavLink
              to="/suivis"
              className={({ isActive }) =>
                "block relative py-3 hover:text-gray-900 " +
                (isActive
                  ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
                  : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300")
              }
            >
              Suivis
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/mes-rendez-vous"
              className={({ isActive }) =>
                "block relative py-3 hover:text-gray-900 " +
                (isActive
                  ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
                  : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300")
              }
            >
              Mes rendez-vous
            </NavLink>
          </li>
        </>
      )}

      {/* Explorer toujours accessible */}
      <li>
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            "block relative py-3 hover:text-gray-900 " +
            (isActive
              ? "text-gray-900 after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-gray-900"
              : "hover:after:absolute hover:after:left-0 hover:after:-bottom-[1px] hover:after:h-[2px] hover:after:w-full hover:after:bg-gray-300")
          }
        >
          Explorer
        </NavLink>
      </li>
    </NavbarBase>
  );
}
