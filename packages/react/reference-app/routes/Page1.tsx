import type { LoaderFunction } from "react-router-dom";

import { sleep } from "../utils";

export const loader: LoaderFunction = async () => {
  await sleep();
  return {};
};

export default function Page1() {
  return <h2>Page 1</h2>;
}
