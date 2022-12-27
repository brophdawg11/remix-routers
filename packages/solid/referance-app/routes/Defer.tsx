import { Await, defer, useLoaderData, useAsyncError } from "remix-router-solid";
import { Suspense } from "solid-js";

const resolve = (d: string, ms: number): Promise<string> =>
  new Promise((r) => setTimeout(() => r(d), ms));

const reject = (d: string, ms: number) =>
  new Promise((_, r) => setTimeout(() => r(d), ms));

interface LoaderData {
  critical: string;
  lazy: Promise<String>;
  lazyError: Promise<string>;
}

export async function deferLoader() {
  return defer({
    critical: await resolve("Critical Data", 500),
    lazy: resolve("Lazy Data ✅", 1000),
    lazyError: reject("Lazy Error 💥", 1500),
  });
}
function ErrorElement() {
  let error = useAsyncError();
  return <p id="lazy-error">{`Error: ${error}`}</p>;
}

export const Defer = () => {
  let data = useLoaderData<LoaderData>();

  return (
    <>
      <p id="critical-data">Critical Data: {data().critical}</p>

      <Suspense fallback={<p id="lazy-value">Loading data...</p>}>
        <Await resolve={data().lazy}>
          {(value) => <p id="lazy-value">Value: {value().toString()}</p>}
        </Await>
      </Suspense>

      <Suspense fallback={<p id="lazy-error">Loading error...</p>}>
        <Await resolve={data().lazyError} errorElement={ErrorElement}>
          {() => <p>Nope!</p>}
        </Await>
      </Suspense>
    </>
  );
};
