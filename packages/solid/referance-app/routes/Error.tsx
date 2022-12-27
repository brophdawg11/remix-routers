import type { LoaderFunction } from "@remix-run/router";
import { json, useLoaderData } from "remix-router-solid";

export const errorLoader: LoaderFunction = async ({ request }) => {
  let isLoaderError =
    new URL(request.url).searchParams.get("type") === "loader";
  if (isLoaderError) {
    throw new Error("Loader error!");
  }
  return json({});
};

export const ErrorComp = () => {
  console.log("ErrorCompo");
  const data = useLoaderData<ReturnType<typeof errorLoader>>();

  return <h2>Render Error: {data().foo.bar}; </h2>;
};
