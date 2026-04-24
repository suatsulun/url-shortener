import { Spinner } from "./Spinner";
const PageSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <Spinner size="lg" className="h-30 w-30 text-crimson" />
    </div>
  );
};

export default PageSpinner;
