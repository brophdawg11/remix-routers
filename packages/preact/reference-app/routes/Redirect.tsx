import type { LoaderFunction } from "@remix-run/router";
import { redirect } from "remix-router-preact";
import { sleep } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  await sleep();
  let location = new URL(request.url).searchParams.get("location") || "/";
  return redirect(location);
};

export default function Redirect() {
  return <h2>Shouldn't see me</h2>;
}
