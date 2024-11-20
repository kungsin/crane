import{R as _,a as i,e as l,k as r,j as a,C as s,f as u}from"./index.698c2779.js";import{S as o}from"./index.ed6e5a77.js";import"./useCraneUrl.83474cdd.js";import"./index.ed1c023e.js";import"./DateRangePicker.0c983cde.js";import"./index.c7534671.js";const c="_carbonChartPanel_19fe9_1";var b={carbonChartPanel:c};const p=()=>{const{t:n}=i(),e={title:n("\u80FD\u8017"),subTitle:n("(\u74E6\u7279/\u5C0F\u65F6)"),datePicker:!0,step:"1h",xAxis:{type:"time"},lines:[{name:n("energy consumption"),query:`((sum(label_replace(irate(container_cpu_usage_seconds_total{container!=""}[5m]), "node", "$1", "instance",  "(^[^:]+)") * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!~"eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node))
/
SUM(kube_node_status_capacity{resource="cpu", unit="core"}  * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node)))
*
(3.84 - 0.743) + 0.743)
*
(SUM(kube_node_status_capacity{resource="cpu", unit="core"}  * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node)))`}]},t={title:n("\u78B3\u6392\u653E"),subTitle:n("(\u514B/\u5C0F\u65F6)"),datePicker:!0,step:"1h",xAxis:{type:"time"},lines:[{name:n("carbon emissions"),query:`((sum(label_replace(irate(container_cpu_usage_seconds_total{container!=""}[5m]), "node", "$1", "instance",  "(^[^:]+)") * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!~"eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node))
/
SUM(kube_node_status_capacity{resource="cpu", unit="core"}  * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node)))
*
(3.84 - 0.743) + 0.743)
*
(SUM(kube_node_status_capacity{resource="cpu", unit="core"}  * on (node) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (node)))
*
0.581
`}]};return l(r,{gutter:[16,16],className:b.carbonChartPanel,children:[a(s,{span:12,children:a(o,{title:t.title,subTitle:t.subTitle,datePicker:t.datePicker,lines:t.lines,timeRange:t.timeRange,step:t.step,xAxis:t.xAxis})}),a(s,{span:12,children:a(o,{title:e.title,subTitle:e.subTitle,datePicker:e.datePicker,lines:e.lines,timeRange:e.timeRange,step:e.step,xAxis:e.xAxis})})]})};var d=_.memo(p);const k=()=>a("div",{style:{overflowX:"hidden"},children:a(d,{})});var f=u.exports.memo(k);export{f as default};
