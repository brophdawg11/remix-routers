import { Accessor, Component, splitProps } from "solid-js";
import { RouteContext } from "../context";

export interface RouterWrapperProps {
  id: Accessor<string>;
  children: Component;
}

export const RouteWrapper = (props: RouterWrapperProps) => {
  const [routeContextValue, other] = splitProps(props, ["id"]);
  return (
    <RouteContext.Provider value={routeContextValue}>
      {<other.children />}
    </RouteContext.Provider>
  );
};
