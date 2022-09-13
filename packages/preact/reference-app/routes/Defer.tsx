import { Suspense } from "preact/compat";
import {
  Await,
  defer,
  useAsyncError,
  useLoaderData,
  useLocation,
} from "remix-router-preact";

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
  return <p id="lazy-error">{`Error: ${error}`}</p>;
}

export default function Defer() {
  let location = useLocation();
  let data = useLoaderData() as LoaderData;

  return (
    <>
      <p id="critical-data">Critical Data: {data.critical}</p>

      <Suspense
        fallback={<p id="lazy-value">Loading data...</p>}
        key={`success-${location.key}`}
      >
        <Await resolve={data.lazy}>
          {(value: Awaited<typeof data.lazy>) => (
            <p id="lazy-value">Value: {value}</p>
          )}
        </Await>
      </Suspense>

      <Suspense
        fallback={<p id="lazy-error">Loading error...</p>}
        key={`error-${location.key}`}
      >
        <Await resolve={data.lazyError} errorElement={<ErrorElement />}>
          {() => <p>Nope!</p>}
        </Await>
      </Suspense>
    </>
  );
}
