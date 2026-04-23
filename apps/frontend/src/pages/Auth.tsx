import { useLocation, Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";

const Auth = () => {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";

  return (
    <div
      className={cn(
        "min-h-screen min-w-screen flex flex-col items-center justify-center px-4 py-10",
        "transition-colors duration-700",
        isLogin ? "mode-login bg-white" : "mode-register bg-crimson",
      )}
    >
      <Link className="flex flex-col items-center" to="/">
        <Logo variant={isLogin ? "red" : "white"} />
        <div
          className={cn(
            "mb-9 text-3xl font-bold tracking-tight transition-colors duration-700",
            isLogin ? "text-crimson" : "text-white",
          )}
        >
          Suat's URL Shortener
        </div>
      </Link>
      <div className="w-full max-w-sm">
        <div
          key={pathname}
          className={cn(
            "rounded-2xl p-8 transition-colors duration-700",
            isLogin
              ? "bg-crimson animate-slide-in-left"
              : "bg-white animate-slide-in-right",
          )}
        >
          <h2
            className={cn(
              "mb-6 text-xl font-bold tracking-tight",
              isLogin ? "text-white" : "text-crimson",
            )}
          >
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>

      <div
        className={cn(
          "mt-5 w-full max-w-sm flex text-sm transition-colors duration-700",
          isLogin
            ? "justify-end text-crimson-dark"
            : "justify-start text-white/90",
        )}
      >
        <Link
          to={isLogin ? "/register" : "/login"}
          className="hover:underline underline-offset-4"
        >
          {isLogin
            ? "Don't have an account? Register →"
            : "← Already have an account? Sign in"}
        </Link>
      </div>
    </div>
  );
};

export default Auth;