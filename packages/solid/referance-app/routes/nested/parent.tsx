// import { LoaderFunction } from "@remix-run/router";
import { json, Outlet, useLoaderData } from "remix-router-solid";
import { sleep } from "~/utils";

interface LoaderData {
  data: string;
}

export const parentLoader = async () => {
  await sleep();
  return json<LoaderData>({ data: "parent loader data" });
};

export const Parent = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <h2>Parent Layout</h2>
      <p id="parent">Parent data: {data().data}</p>
      <Outlet />
    </>
  );
};
