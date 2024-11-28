import{R as v,u as Q,a as M,b as p,ak as U,c as j,al as A,i as l,j as i,d as H,e as W,Y as B,r as b,C as q,f as V,g as G,h as O,F as Y,k as z}from"./index.698c2779.js";import{C as F}from"./common.module.d7e709a7.js";import{C as $}from"./Card.0269d18d.js";import{u as _}from"./useCraneUrl.83474cdd.js";import{_ as L}from"./lodash.7d1dd203.js";import{R as T}from"./index.7cfe99f0.js";import{D}from"./index.ed1c023e.js";import{u as J,a as K,b as X}from"./useIsValidPanel.18ece626.js";import"./Check.a5ba0696.js";import"./DateRangePicker.0c983cde.js";import"./index.c7534671.js";const E="ALL",Z=v.memo(()=>{var I,N,P;const t=Q(),{t:r}=M(),a=p(e=>e.insight.customRange),n=p(e=>e.insight.window),s=p(e=>e.insight.selectedNamespace),h=p(e=>e.insight.selectedWorkload),m=p(e=>e.insight.selectedWorkloadType),y=p(e=>e.insight.selectedClusterId),f=!0,w=_(),c=U({clusterId:y},{skip:!y||!f}),S=j(),o=v.useMemo(()=>{var e,u,g;return[...((g=(u=(e=c==null?void 0:c.data)==null?void 0:e.data)==null?void 0:u.items)!=null?g:[]).map(C=>({label:C,value:C}))]},[(N=(I=c==null?void 0:c.data)==null?void 0:I.data)==null?void 0:N.items]),k=A({craneUrl:w,start:(Date.parse(a.start)/1e3).toString(),end:(Date.parse(a.end)/1e3).toString(),match:`crane_analysis_resource_recommendation{namespace=~"(${s==="ALL"?o.filter(e=>e.label!==E).map(e=>e.label).join("|"):s})"}`},{skip:!s}),d=v.useMemo(()=>{var e,u;return L.unionBy(((u=(e=k.data)==null?void 0:e.data)!=null?u:[]).map(g=>({label:g.owner_kind,value:g.owner_kind})),"value")},[k.data]),R=A({craneUrl:w,start:(Date.parse(a.start)/1e3).toString(),end:(Date.parse(a.end)/1e3).toString(),match:`crane_analysis_resource_recommendation{namespace=~"(${s==="ALL"?o.filter(e=>e.label!==E).map(e=>e.label).join("|"):s})"${m?`, owner_kind="${m}"`:""}}`}),x=v.useMemo(()=>{var u,g;return L.uniqBy([...((g=(u=R.data)==null?void 0:u.data)!=null?g:[]).map(C=>({label:C.owner_name,value:C.owner_name}))],"value")},[R.data]);return v.useEffect(()=>{var e;c.isSuccess&&f&&((e=o==null?void 0:o[0])==null?void 0:e.value)&&!s&&t(l.selectedNamespace(o[0].value))},[t,f,c.isSuccess,o]),v.useEffect(()=>{var e;k.isSuccess&&((e=d==null?void 0:d[0])==null?void 0:e.value)&&!m&&t(l.selectedWorkloadType(d[0].value))},[t,k.isSuccess,d]),v.useEffect(()=>{var e;R.isSuccess&&((e=x==null?void 0:x[0])==null?void 0:e.value)&&!h&&t(l.selectedWorkload(x[0].value))},[t,R.isSuccess,x]),i("div",{className:H(F.pageWithPadding,F.pageWithColor),children:W($,{style:{display:"flex",flexDirection:"row",flexWrap:"wrap"},children:[W("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"80px"},children:r("\u547D\u540D\u7A7A\u95F4")}),i(B,{options:o,placeholder:r("\u547D\u540D\u7A7A\u95F4"),filterable:!0,value:s!=null?s:void 0,onChange:e=>{t(l.selectedNamespace(e)),t(l.selectedWorkloadType(void 0)),t(l.selectedWorkload(void 0))}})]}),W("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"140px"},children:r("Workload\u7C7B\u578B")}),i(B,{options:d,placeholder:r("Workload\u7C7B\u578B"),filterable:!0,value:m!=null?m:void 0,onChange:e=>{t(l.selectedWorkloadType(e)),t(l.selectedWorkload(void 0))}})]}),W("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"1rem",width:"80px"},children:r("Workload")}),i(B,{options:x,placeholder:r("Workload"),filterable:!0,value:h!=null?h:void 0,onChange:e=>{t(l.selectedWorkload(e))}})]}),W("div",{style:{display:"flex",flexDirection:"row",alignItems:"center",marginRight:"1rem",marginTop:5,marginBottom:5},children:[i("div",{style:{marginRight:"0.5rem",width:"70px"},children:r("\u65F6\u95F4\u8303\u56F4")}),i("div",{style:{marginRight:"0.5rem"},children:i(T.Group,{value:n,onChange:e=>{t(l.window(e));const[u,g]=b[e];t(l.customRange({start:u.toDate().toISOString(),end:g.toDate().toISOString()}))},children:S.map(e=>i(T.Button,{value:e.value,children:e.text},e.value))})}),i(D,{mode:"date",style:{marginRight:"0.5rem"},value:a==null?void 0:a.start,onChange:e=>{t(l.window(null)),t(l.customRange({...a,start:e}))}}),i(D,{mode:"date",style:{marginRight:"0.5rem"},value:(P=a==null?void 0:a.end)!=null?P:null,onChange:e=>{t(l.window(null)),t(l.customRange({...a,end:e}))}})]})]})})}),ee=v.memo(({panel:t,selectedDashboard:r})=>{var S,o,k;const a=p(d=>d.config.chartBaselineHeight),n=p(d=>d.config.chartDefaultHeight),s=p(d=>d.insight.selectedNamespace),h=_(),m=J({panel:t}),y=K({selectedDashboard:r}),f=X({panelId:t.id,selectedDashboard:r}),w=((S=t==null?void 0:t.gridPos)==null?void 0:S.w)>0&&((o=t==null?void 0:t.gridPos)==null?void 0:o.w)<=24?Math.floor(t.gridPos.w/2):6,c=(k=t==null?void 0:t.gridPos)!=null&&k.h?Math.max(t.gridPos.h*a,n):n;return y&&!s||!m?null:i(q,{span:w,children:i($,{style:{marginBottom:"0.5rem",marginTop:"0.5rem",height:c},children:i("iframe",{frameBorder:"0",height:"100%",src:`${h}/grafana/d-solo/${r==null?void 0:r.uid}/costs-by-dimension?${f}`,width:"100%"})})},t.id)});var ue=V.exports.memo(()=>{var h,m,y,f,w,c,S;const{t}=M(),r=_(),a=G({craneUrl:r},{skip:!r}),n=((h=a==null?void 0:a.data)!=null?h:[]).find(o=>o.uid==="workload-insight"),s=O({dashboardUid:n==null?void 0:n.uid},{skip:!(n!=null&&n.uid)});return W(Y,{children:[i(Z,{}),i(z,{style:{marginTop:10},children:!(n!=null&&n.uid)||((f=(y=(m=s==null?void 0:s.data)==null?void 0:m.dashboard)==null?void 0:y.panels)==null?void 0:f.length)===0?i("span",{children:t("\u6682\u65E0\u6570\u636E")}):((S=(c=(w=s==null?void 0:s.data)==null?void 0:w.dashboard)==null?void 0:c.panels)!=null?S:[]).map(o=>i(ee,{panel:o,selectedDashboard:n},o.id))})]})});export{ue as default};