import { LoaderFunction } from "@remix-run/router";
import { json, useLoaderData } from "remix-router-solid";
import { sleep } from "~/utils";

interface LoaderData {
  data: string;
}

export const childLoader: LoaderFunction = async () => {
  await sleep();
  return json<LoaderData>({ data: "child loader data" });
};

export const Child = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <h3>Child Route</h3>
      <p id="child">Child data: {data().data}</p>
    </>
  );
};
