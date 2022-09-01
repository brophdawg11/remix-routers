import type { LoaderFunction } from "@remix-run/router";
import { json, useLoaderData } from "react-router-dom";

export const loader: LoaderFunction = async ({ request }) => {
  let isLoaderError =
    new URL(request.url).searchParams.get("type") === "loader";
  if (isLoaderError) {
    throw new Error("Loader error!");
  }
  return json({});
};

export default function ErrorComponent() {
  let data = useLoaderData() as ReturnType<typeof loader>;
  return <h2>Render Error: {data.foo.bar}</h2>;
}
