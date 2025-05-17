import useNavigationStore from "@/hooks/store/useNavigationStore";
// import { usePage } from "@inertiajs/react";
import { getMenuItems } from "@/utils/ListMenu";
import { useEffect } from "react";
import NavbarLinksGroup from "./NavbarLinksGroup";
import classes from "./css/NavBarNested.module.css";


export default function NavBarNested({ collapsed }) {
  const { items, setItems } = useNavigationStore();

  useEffect(() => {
    setItems(getMenuItems());
  },[]);

  return (
    <nav className={classes.navbar}>
        <div className={classes.linksInner}>
          {items
            .filter((i) => i.visible)
            .map((item) => (
              <NavbarLinksGroup
                key={item.label}
                item={item}
                collapsed={collapsed}
              />
            ))}
        </div>

    </nav>
  );
}
