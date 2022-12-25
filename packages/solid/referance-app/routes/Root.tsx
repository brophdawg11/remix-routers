import { Outlet } from "remix-router-solid";

export const Root = () => {
  return (
    <div>
      <h1>I am Root</h1>
      <Outlet />
    </div>
  );
};
