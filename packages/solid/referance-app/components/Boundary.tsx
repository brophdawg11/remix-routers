import { Link, useRouteError } from "remix-router-solid";

export const Boundary = () => {
  const error = useRouteError() as () => Error;

  return (
    <>
      <h2>Application Error Boundary</h2>
      <p>{error().message}</p>
      <Link to="/">Go home</Link>
    </>
  );
};
