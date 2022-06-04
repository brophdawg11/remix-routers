import { LoaderFunction } from "@remix-run/router";
import { json, Outlet, useLoaderData } from "react-router-dom";
import { sleep } from "~/utils";

interface LoaderData {
  data: string;
}

export const loader: LoaderFunction = async () => {
  await sleep();
  return json<LoaderData>({ data: "parent loader data" });
};

export default function Parent() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <h2>Parent Layout</h2>
      <p id="parent">Parent data: {data.data}</p>
      <Outlet />
    </>
  );
}
