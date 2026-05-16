import { useRouter } from "next/router";
import { Brand, HeaderBar, Nav, NavLink } from "./Header.styles";

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Weather" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/pokeweather", label: "PokeWeather" },
];

export function Header() {
  const router = useRouter();

  return (
    <HeaderBar>
      <Brand href="/">PalmettoWeather</Brand>
      <Nav aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} $active={router.pathname === item.href}>
            {item.label}
          </NavLink>
        ))}
      </Nav>
    </HeaderBar>
  );
}
