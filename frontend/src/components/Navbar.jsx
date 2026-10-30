import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="topbar">
      <Link to="/" className="logo">Bluetail</Link>

      <nav className="topbar-right">
        <NavLink to="/" end className="nav-link">Shop</NavLink>
        <NavLink to="/cart" className="nav-link">
          Cart{count > 0 && <span className="badge">{count}</span>}
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/orders" className="nav-link">My orders</NavLink>
            <NavLink to="/admin/add-product" className="nav-link">Add product</NavLink>
            <Link to="/account" className="who">{user.username}</Link>
            <button className="ghost" onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register" className="ghost link-btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}