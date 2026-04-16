import { useParams } from "react-router-dom";

const Redirect = () => {
  const { shortId } = useParams();
  console.log(shortId);

  return (
    <div>
      <h1>Redirect</h1>
    </div>
  );
};

export default Redirect;
