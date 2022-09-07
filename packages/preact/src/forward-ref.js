import { options } from "preact";

/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
export function assign(obj, props) {
  for (let i in props) obj[i] = props[i];
  return /** @type {O & P} */ (obj);
}

let oldDiffHook = options._diff;
options._diff = (vnode) => {
  if (vnode.type && vnode.type._forwarded && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  if (oldDiffHook) oldDiffHook(vnode);
};

export const REACT_FORWARD_SYMBOL =
  (typeof Symbol != "undefined" &&
    Symbol.for &&
    Symbol.for("react.forward_ref")) ||
  0xf47;

/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {import('./index').ForwardFn} fn
 * @returns {import('./internal').FunctionComponent}
 */
export function forwardRef(fn) {
  function Forwarded(props) {
    let clone = assign({}, props);
    delete clone.ref;
    return fn(clone, props.ref || null);
  }

  // mobx-react checks for this being present
  Forwarded.$$typeof = REACT_FORWARD_SYMBOL;
  // mobx-react heavily relies on implementation details.
  // It expects an object here with a `render` property,
  // and prototype.render will fail. Without this
  // mobx-react throws.
  Forwarded.render = Forwarded;

  Forwarded.prototype.isReactComponent = Forwarded._forwarded = true;
  Forwarded.displayName = "ForwardRef(" + (fn.displayName || fn.name) + ")";
  return Forwarded;
}
