import { LoaderFunction } from "@remix-run/router";
import { json, useLoaderData } from "react-router-dom";
import { sleep } from "~/utils";

interface LoaderData {
  data: string;
}

export const loader: LoaderFunction = async () => {
  await sleep();
  return json<LoaderData>({ data: "child loader data" });
};

export default function Child() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <h3>Child Route</h3>
      <p id="child">Child data: {data.data}</p>
    </>
  );
}
