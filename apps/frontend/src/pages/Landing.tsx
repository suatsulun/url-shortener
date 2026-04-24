import { useNavigate } from "react-router-dom";
import { Zap, BarChart3, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";

const features = [
  {
    icon: Zap,
    title: "Fast redirects",
    description:
      "A Redis-backed cache and cuckoo filter mean every click resolves in milliseconds, even at scale.",
  },
  {
    icon: BarChart3,
    title: "Click tracking",
    description:
      "See how many times each of your links has been visited, right from your dashboard.",
  },
  {
    icon: Timer,
    title: "Auto cleanup",
    description:
      "Links that haven't been used in 30 days are retired automatically, keeping your list tidy.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Short links you can <span className="text-crimson">trust</span>.
          </h1>
          <p className="text-lg text-muted">
            Turn long, messy URLs into clean six-character links in a single
            click. Track them, manage them, and let the ones you stop using
            quietly retire themselves.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              Get started
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Logo variant="red" pulse className="h-56 w-auto md:h-72" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">
            Why use it?
          </h2>
          <p className="text-base text-muted">
            Built to be quick, simple, and low-maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              variant="elevated"
              padding="lg"
              className="flex flex-col gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-crimson-tint">
                <Icon className="h-6 w-6 text-crimson" />
              </div>
              <h3 className="text-lg font-bold text-ink">{title}</h3>
              <p className="text-sm text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <Card
          variant="elevated"
          padding="lg"
          className="flex flex-col items-center gap-4 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-crimson">
            Ready to shorten?
          </h2>
          <p className="text-sm text-muted">
            Create an account and share your first short link in under a minute.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Create your account
          </Button>
        </Card>
      </section>
    </>
  );
};

export default Landing;
