import * as React from "react";
import { Await, defer, useAsyncError, useLoaderData } from "react-router-dom";

const resolve = (d: string, ms: number): Promise<string> =>
  new Promise((r) => setTimeout(() => r(d), ms));

const reject = (d: string, ms: number) =>
  new Promise((_, r) => setTimeout(() => r(d), ms));

interface LoaderData {
  critical: string;
  lazy: Promise<String>;
  lazyError: Promise<string>;
}

export async function loader() {
  return defer({
    critical: await resolve("Critical Data", 500),
    lazy: resolve("Lazy Data ✅", 1000),
    lazyError: reject("Lazy Error 💥", 1500),
  });
}

function ErrorElement() {
  let error = useAsyncError();
  return <p>{`Error! ${error}`}</p>;
}

export default function Defer() {
  let data = useLoaderData() as LoaderData;

  return (
    <>
      <p>Critical Data: {data.critical}</p>

      <React.Suspense fallback={<p>Loading lazy data...</p>}>
        <Await resolve={data.lazy}>
          {(value) => <p>Lazy Data: {value}</p>}
        </Await>
      </React.Suspense>

      <React.Suspense fallback={<p>Loading lazy error...</p>}>
        <Await resolve={data.lazyError} errorElement={<ErrorElement />}>
          {() => <p>Nope!</p>}
        </Await>
      </React.Suspense>
    </>
  );
}
