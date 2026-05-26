import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStoreAuth } from "../hooks";

function Home() {
  const { isLogin } = useStoreAuth();
  const location = useLocation();

  const loggedIn = isLogin.get();

  if (loggedIn && ["/", "/login_or_register"].includes(location.pathname)) {
    return <Navigate to="/pages" replace />;
  }

  if (!loggedIn && location.pathname !== "/login_or_register") {
    return <Navigate to="/login_or_register" replace />;
  }

  return <Outlet />;
}

export default Home;
