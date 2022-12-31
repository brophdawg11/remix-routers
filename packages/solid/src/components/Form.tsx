import { FormMethod } from "@remix-run/router";
import { JSX, mergeProps } from "solid-js";
import { useRouter } from "../context";
import { submitImpl, useFormAction } from "../hooks";

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

export interface FormImplProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  replace: boolean;
  onSubmit ?: (e: SubmitEvent) => void;
  fetcherKey ?: string ;
  routeId ?: string ;
  children?: JSX.Element;
}

export const FormImpl = (props: FormImplProps) => {
  const router = useRouter();
  const defaultAction =  useFormAction(props.action);

  return (
    <form
      {...props}
      onSubmit={(e: SubmitEvent) => {
        props.onSubmit && props.onSubmit(e);
        if (e.defaultPrevented) {
          return;
        }
        e.preventDefault();
        console.log("Fetching for key", props.fetcherKey);
        submitImpl(
          router,
          defaultAction(),
          (e.submitter as HTMLFormSubmitter) || e.currentTarget,
          { method: props.method as FormMethod, replace: props.replace },
          props.fetcherKey,
          props.routeId
        );
      }}
    >
      {props.children}
    </form>
  );
};

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement>{
  replace?: boolean;
  onSubmit?: (e: SubmitEvent) => void;
}

export const Form = (props_ : FormProps) => {
    const props = mergeProps({replace : false}, props_);
    
    return <FormImpl  {...props}  />    
};
