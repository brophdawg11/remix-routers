import { Link, useRouteError } from "react-router-dom";

export default function Boundary() {
  let error = useRouteError() as Error;

  return (
    <>
      <h2>Application Error Boundary</h2>
      <p>{error.message}</p>
      <Link to="/">Go home</Link>
    </>
  );
}
