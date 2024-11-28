import{R as v,u as Q,a as $,b as h,ak as U,c as j,al as I,i as l,j as i,d as H,e as C,Y as A,r as L,C as q,f as O,g as V,h as G,F as Y,k as z}from"./index.698c2779.js";import{C as T}from"./common.module.d7e709a7.js";import{C as b}from"./Card.0269d18d.js";import{u as _}from"./useCraneUrl.83474cdd.js";import{_ as D}from"./lodash.7d1dd203.js";import{R as E}from"./index.7cfe99f0.js";import{D as M}from"./index.ed1c023e.js";import{u as J,a as K,b as X}from"./useIsValidPanel.18ece626.js";import"./Check.a5ba0696.js";import"./DateRangePicker.0c983cde.js";import"./index.c7534671.js";const B="All",Z=v.memo(()=>{var N,P,F;const t=Q(),{t:s}=$(),a=h(e=>e.insight.customRange),n=h(e=>e.insight.window),r=h(e=>e.insight.selectedNamespace),p=h(e=>e.insight.selectedWorkload),m=h(e=>e.insight.selectedWorkloadType),w=h(e=>e.insight.selectedClusterId),f=!0,y=_(),c=U({clusterId:w},{skip:!w||!f}),S=j(),o=v.useMemo(()=>{var e,u,g;return[{value:B,label:"All"},...((g=(u=(e=c==null?void 0:c.data)==null?void 0:e.data)==null?void 0:u.items)!=null?g:[]).map(W=>({label:W,value:W}))]},[(P=(N=c==null?void 0:c.data)==null?void 0:N.data)==null?void 0:P.items]),k=I({craneUrl:y,start:(Date.parse(a.start)/1e3).toString(),end:(Date.parse(a.end)/1e3).toString(),match:`crane_analysis_resource_recommendation{namespace=~"(${r==="All"?o.filter(e=>e.label!==B).map(e=>e.label).join("|"):r})"}`},{skip:!r}),d=v.useMemo(()=>{var e,u;return D.unionBy(((u=(e=k.data)==null?void 0:e.data)!=null?u:[]).map(g=>({label:g.owner_kind,value:g.owner_kind})),"value")},[k.data]),R=I({craneUrl:y,start:(Date.parse(a.start)/1e3).toString(),end:(Date.parse(a.end)/1e3).toString(),match:`crane_analysis_resource_recommendation{namespace=~"(${r==="All"?o.filter(e=>e.label!==B).map(e=>e.label).join("|"):r})"${m?`, owner_kind="${m}"`:""}}`}),x=v.useMemo(()=>{var u,g;return D.uniqBy([{label:"All",value:"All"},...((g=(u=R.data)==null?void 0:u.data)!=null?g:[]).map(W=>({label:W.owner_name,value:W.owner_name}))],"value")},[R.data]);return v.useEffect(()=>{var e;c.isSuccess&&f&&((e=o==null?void 0:o[0])==null?void 0:e.value)&&t(l.selectedNamespace(o[0].value))},[t,f,c.isSuccess,o]),v.useEffect(()=>{var e;k.isSuccess&&((e=d==null?void 0:d[0])==null?void 0:e.value)&&t(l.selectedWorkloadType(d[0].value))},[t,k.isSuccess,d]),v.useEffect(()=>{var e;R.isSuccess&&((e=x==null?void 0:x[0])==null?void 0:e.value)&&t(l.selectedWorkload(x[0].value))},[t,R.isSuccess,x]),i("div",{className:H(T.pageWithPadding,T.pageWithColor),children:C(b,{style:{display:"flex",flexDirection:"row",flexWrap:"wrap"},children:[C("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"80px"},children:s("\u547D\u540D\u7A7A\u95F4")}),i(A,{options:o,placeholder:s("\u547D\u540D\u7A7A\u95F4"),filterable:!0,value:r!=null?r:void 0,onChange:e=>{t(l.selectedNamespace(e)),t(l.selectedWorkloadType(void 0)),t(l.selectedWorkload(void 0))}})]}),C("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"140px"},children:s("Workload\u7C7B\u578B")}),i(A,{options:d,placeholder:s("Workload\u7C7B\u578B"),filterable:!0,value:m!=null?m:void 0,onChange:e=>{t(l.selectedWorkloadType(e)),t(l.selectedWorkload(void 0))}})]}),C("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"80px"},children:s("Workload")}),i(A,{options:x,placeholder:s("Workload"),filterable:!0,value:p!=null?p:void 0,onChange:e=>{t(l.selectedWorkload(e))}})]}),C("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"0.5rem",width:"70px"},children:s("\u65F6\u95F4\u8303\u56F4")}),i("div",{style:{marginRight:"0.5rem"},children:i(E.Group,{value:n,onChange:e=>{t(l.window(e));const[u,g]=L[e];t(l.customRange({start:u.toDate().toISOString(),end:g.toDate().toISOString()}))},children:S.map(e=>i(E.Button,{value:e.value,children:e.text},e.value))})}),i(M,{mode:"date",style:{marginRight:"0.5rem"},value:a==null?void 0:a.start,onChange:e=>{t(l.window(null)),t(l.customRange({...a,start:e}))}}),i(M,{mode:"date",style:{marginRight:"0.5rem"},value:(F=a==null?void 0:a.end)!=null?F:null,onChange:e=>{t(l.window(null)),t(l.customRange({...a,end:e}))}})]})]})})}),ee=v.memo(({panel:t,selectedDashboard:s})=>{var S,o,k;const a=h(d=>d.config.chartBaselineHeight),n=h(d=>d.config.chartDefaultHeight),r=h(d=>d.insight.selectedNamespace),p=_(),m=J({panel:t}),w=K({selectedDashboard:s}),f=X({panelId:t.id,selectedDashboard:s}),y=((S=t==null?void 0:t.gridPos)==null?void 0:S.w)>0&&((o=t==null?void 0:t.gridPos)==null?void 0:o.w)<=24?Math.floor(t.gridPos.w/2):6,c=(k=t==null?void 0:t.gridPos)!=null&&k.h?Math.max(t.gridPos.h*a,n):n;return w&&!r||!m?null:i(q,{span:y,children:i(b,{style:{marginBottom:"0.5rem",marginTop:"0.5rem",height:c},children:i("iframe",{frameBorder:"0",height:"100%",src:`${p}/grafana/d-solo/${s==null?void 0:s.uid}/costs-by-dimension?${f}`,width:"100%"})})},t.id)});var ue=O.exports.memo(()=>{var p,m,w,f,y,c,S;const{t}=$(),s=_(),a=V({craneUrl:s},{skip:!s}),n=((p=a==null?void 0:a.data)!=null?p:[]).find(o=>o.uid==="workload-overview"),r=G({dashboardUid:n==null?void 0:n.uid},{skip:!(n!=null&&n.uid)});return C(Y,{children:[i(Z,{}),i(z,{style:{marginTop:10},children:!(n!=null&&n.uid)||((f=(w=(m=r==null?void 0:r.data)==null?void 0:m.dashboard)==null?void 0:w.panels)==null?void 0:f.length)===0?i("span",{children:t("\u6682\u65E0\u6570\u636E")}):((S=(c=(y=r==null?void 0:r.data)==null?void 0:y.dashboard)==null?void 0:c.panels)!=null?S:[]).map(o=>i(ee,{panel:o,selectedDashboard:n},o.id))})]})});export{ue as default};