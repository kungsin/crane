import{C as h}from"./common.module.d7e709a7.js";import"./index.module.f8447bc7.js";import{f as E,bo as k,as as I,e as a,F as m,j as u,Q as n,Y as d,av as N,P as t,d as W,ar as C}from"./index.d6bcc00a.js";import{F as r,a as l}from"./index.21bc7424.js";import{S as L}from"./index.af9408cc.js";import{D as j}from"./index.1236748a.js";import"./index.7ff06c46.js";import"./DateRangePicker.9317c2ca.js";import"./Check.2eb92357.js";const R=()=>{const[B]=k(),o=B.get("flag");console.log("flag",o);const s=I(),[c]=r.useForm(),F=r.useWatch("name",c),p=r.useWatch("gender",c);console.log("name",F),console.log("gender",p);const g=e=>{console.log(e),e.validateResult===!0&&(C.success("\u63D0\u4EA4\u6210\u529F"),setTimeout(()=>{s(-1)},1e3))},b=e=>{console.log(e),C.info("\u91CD\u7F6E\u6210\u529F")},D=[{label:"\u7BA1\u7406\u5458",value:1},{label:"\u666E\u901A\u7528\u6237",value:2}],f=[{label:"abcsaca",value:1},{label:"abcsds2w",value:2}],y=[{label:"\u542F\u7528",value:1},{label:"\u7981\u7528",value:2}],[A,i]=E.exports.useState(!1),S=()=>{i(!0)},v=e=>{console.log("\u70B9\u51FB\u4E86\u786E\u8BA4\u6309\u94AE",e),i(!1),setTimeout(()=>{s(-1)},1e3)},x=e=>{console.log("\u70B9\u51FB\u4E86\u53D6\u6D88\u6309\u94AE",e),setTimeout(()=>{s(-1)},1e3)},w=e=>{console.log("\u70B9\u51FB\u4E86\u5173\u95ED\u6309\u94AE",e)},P=e=>{console.log("\u6309\u4E0B\u4E86ESC",e)},T=e=>{console.log("\u70B9\u51FB\u4E86\u8499\u5C42",e)},O=e=>{console.log("\u5173\u95ED\u5F39\u7A97\uFF0C\u70B9\u51FB\u5173\u95ED\u6309\u94AE\u3001\u6309\u4E0BESC\u3001\u70B9\u51FB\u8499\u5C42\u7B49\u89E6\u53D1",e),i(!1)};return a(m,{children:[a(r,{form:c,onSubmit:g,onReset:b,colon:!0,labelWidth:100,children:[u(l,{label:"\u624B\u673A\u53F7",name:"phone",children:u(n,{style:{width:"300px"},placeholder:"\u8BF7\u8F93\u5165\u7528\u6237\u624B\u673A\u53F7"})}),u(l,{label:"\u7528\u6237\u540D",name:"username",children:u(n,{style:{width:"300px"},placeholder:"\u8BF7\u8F93\u5165\u7528\u6237\u540D"})}),o!=="3"&&u(l,{label:"\u521D\u59CB\u5BC6\u7801",name:"password",children:u(n,{style:{width:"300px"},placeholder:"\u8BF7\u8F93\u5165\u7528\u6237\u521D\u59CB\u5BC6\u7801"})}),u(l,{label:"\u7528\u6237\u6743\u9650",name:"userPermission",children:u(d,{style:{width:"300px"},options:D,clearable:!0})}),o!=="3"&&a(m,{children:[u(l,{label:"\u96C6\u7FA4\u914D\u7F6E",name:"userPermission",children:u(d,{style:{width:"300px"},options:f,clearable:!0})}),u(l,{label:"\u7528\u6237\u72B6\u6001",name:"status",children:u(d,{style:{width:"300px"},options:y,clearable:!0})})]}),o!=="2"&&u(l,{label:"\u7528\u6237\u6CE8\u518C\u7801",name:"registCode",initialData:"sadhsalkdhlsak",children:u(N,{content:"\u9ED8\u8BA4\u63D0\u4F9B\u7528\u6237\u6CE8\u518C\u7801",children:u(n,{style:{width:"300px"},placeholder:"\u8BF7\u8F93\u5165\u7528\u6237\u6CE8\u518C\u7801",disabled:!0})})}),u(l,{style:{marginLeft:100},children:u(L,{children:(()=>{if(o==="1")return a(m,{children:[u(t,{type:"submit",theme:"primary",children:"\u6CE8\u518C"}),u(t,{type:"reset",theme:"default",children:"\u91CD\u7F6E"})]});if(o==="2")return u(t,{theme:"primary",onClick:()=>s(-1),children:"\u4FEE\u6539"});if(o==="3")return u(t,{theme:"primary",onClick:S,children:"\u64CD\u4F5C"})})()})})]}),u(j,{header:"\u5BA1\u6838",visible:A,confirmOnEnter:!0,onClose:O,onConfirm:v,onCancel:x,onEscKeydown:P,onCloseBtnClick:w,onOverlayClick:T,cancelBtn:"\u62D2\u7EDD",confirmBtn:"\u5BA1\u6838\u901A\u8FC7",children:u("p",{children:"\u8BF7\u4ED4\u7EC6\u68C0\u67E5\u8BE5\u7528\u6237\u7684\u7684\u4FE1\u606F,\u8FDB\u884C\u5BA1\u6838"})})]})},_=()=>u("div",{className:W(h.pageWithPadding,h.pageWithColor),children:u(R,{})});var H=E.exports.memo(_);export{R as SelectTable,H as default};
