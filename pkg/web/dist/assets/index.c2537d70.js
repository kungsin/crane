import{D as w}from"./index.b07b42a2.js";import{R as o,h as C,G as z,i as I,c as f,l as c,J as h}from"./index.0a1a9770.js";/**
 * tdesign v1.9.3
 * (c) 2024 tdesign
 * @license MIT
 */var G=w;/**
 * tdesign v1.9.3
 * (c) 2024 tdesign
 * @license MIT
 */var E={hover:"underline",size:"medium",theme:"default"};/**
 * tdesign v1.9.3
 * (c) 2024 tdesign
 * @license MIT
 */var L=["children","content","className","underline","prefixIcon","suffixIcon","theme","disabled","hover","onClick","href","size"];function v(r,t){var e=Object.keys(r);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(r);t&&(n=n.filter(function(s){return Object.getOwnPropertyDescriptor(r,s).enumerable})),e.push.apply(e,n)}return e}function b(r){for(var t=1;t<arguments.length;t++){var e=arguments[t]!=null?arguments[t]:{};t%2?v(Object(e),!0).forEach(function(n){c(r,n,e[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(e)):v(Object(e)).forEach(function(n){Object.defineProperty(r,n,Object.getOwnPropertyDescriptor(e,n))})}return r}var O=o.forwardRef(function(r,t){var e=C(r,E),n=e.children,s=e.content,k=e.className,P=e.underline,u=e.prefixIcon,d=e.suffixIcon,g=e.theme,i=e.disabled,x=e.hover,l=e.onClick,p=e.href,m=e.size,y=z(e,L),j=I(),a=j.classPrefix,D=s||n,_=function(N){i||l==null||l(N)};return o.createElement("a",b(b({},y),{},{href:i||!p?void 0:p,ref:t,className:f(k,["".concat(a,"-link"),"".concat(a,"-link--theme-").concat(g)],c(c(c(c(c({},"".concat(a,"-size-s"),m==="small"),"".concat(a,"-size-l"),m==="large"),"".concat(a,"-is-disabled"),!!i),"".concat(a,"-is-underline"),!!P),"".concat(a,"-link--hover-").concat(x),!i)),onClick:_}),u&&o.createElement("span",{className:f(["".concat(a,"-link__prefix-icon")])},h(u)),D,d&&o.createElement("span",{className:f(["".concat(a,"-link__suffix-icon")])},h(d)))});O.displayName="Link";/**
 * tdesign v1.9.3
 * (c) 2024 tdesign
 * @license MIT
 */var J=O;export{G as D,J as L};
