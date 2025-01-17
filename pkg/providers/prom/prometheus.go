package prom

import (
	gocontext "context"
	"time"

	promapiv1 "github.com/prometheus/client_golang/api/prometheus/v1"
	"k8s.io/klog/v2"

	"github.com/gocrane/crane/pkg/common"
	"github.com/gocrane/crane/pkg/metricnaming"
	"github.com/gocrane/crane/pkg/metricquery"
	"github.com/gocrane/crane/pkg/providers"
)

type prom struct {
	ctx    *context
	config *providers.PromConfig
}

type Provider interface {
	providers.Interface

	GetPromClient() promapiv1.API
}

// NewProvider return a prometheus data provider
func NewProvider(config *providers.PromConfig) (Provider, error) {

	client, err := NewPrometheusClient(config)
	if err != nil {
		return nil, err
	}

	ctx := NewContext(client, config.MaxPointsLimitPerTimeSeries)

	return &prom{ctx: ctx, config: config}, nil
}

func (p *prom) QueryTimeSeries(namer metricnaming.MetricNamer, startTime time.Time, endTime time.Time, step time.Duration) ([]*common.TimeSeries, error) {
	klog.Infof("进入QueryTimeSeries方法")
	promBuilder := namer.QueryBuilder().Builder(metricquery.PrometheusMetricSource)
	promQuery, err := promBuilder.BuildQuery()
	if err != nil {
		klog.Errorf("Failed to BuildQuery: %v", err)
		return nil, err
	}

	klog.V(6).Infof("QueryTimeSeries metricNamer %v, timeout: %v, query: %v", namer.BuildUniqueKey(), p.config.Timeout, promQuery.Prometheus.Query)
	timeoutCtx, cancelFunc := gocontext.WithTimeout(gocontext.Background(), p.config.Timeout)
	defer cancelFunc()

	// timeSeries, err := p.ctx.QueryRangeSync(timeoutCtx, promQuery.Prometheus.Query, startTime, endTime, step)
	timeSeries, err := p.ctx.QueryRangeSyncTestData(timeoutCtx, promQuery.Prometheus.Query, startTime, endTime, step)
	klog.Infof("打印QueryRangeSync的查询结果")
	// 遍历 timeSeries 并打印每个数据点
	// for i, ts := range timeSeries {
	// 	// 拼接 Labels 信息
	// 	labelStr := []string{}
	// 	for _, label := range ts.Labels {
	// 		labelStr = append(labelStr, fmt.Sprintf("%s=%s", label.Name, label.Value))
	// 	}

	// 	// 拼接 Samples 信息
	// 	sampleStr := []string{}
	// 	for _, sample := range ts.Samples {
	// 		sampleStr = append(sampleStr, fmt.Sprintf("[Timestamp: %d, Value: %f]", sample.Timestamp, sample.Value))
	// 	}

	// 	// 使用 klog 打印一行日志
	// 	klog.Infof("TimeSeries #%d: Labels: {%s} Samples: {%s}", i+1, strings.Join(labelStr, " "), strings.Join(sampleStr, " "))
	// }
	if err != nil {
		klog.Errorf("Failed to QueryTimeSeries: %v, metricNamer: %v, query: %v", err, namer.BuildUniqueKey(), promQuery.Prometheus.Query)
		return nil, err
	}
	return timeSeries, nil
}

func (p *prom) QueryLatestTimeSeries(namer metricnaming.MetricNamer) ([]*common.TimeSeries, error) {
	promBuilder := namer.QueryBuilder().Builder(metricquery.PrometheusMetricSource)
	promQuery, err := promBuilder.BuildQuery()
	if err != nil {
		klog.Errorf("Failed to BuildQuery: %v", err)
		return nil, err
	}
	// use range query for latest too. because the queryExpr is an range in crd spec
	//end := time.Now()
	// avoid no data latest. multiply 2
	//start := end.Add(-step * 2)
	klog.V(6).Infof("QueryLatestTimeSeries metricNamer %v, timeout: %v, query: %v", namer.BuildUniqueKey(), p.config.Timeout, promQuery.Prometheus.Query)
	timeoutCtx, cancelFunc := gocontext.WithTimeout(gocontext.Background(), p.config.Timeout)
	defer cancelFunc()
	timeSeries, err := p.ctx.QuerySync(timeoutCtx, promQuery.Prometheus.Query)
	if err != nil {
		klog.Errorf("Failed to QueryLatestTimeSeries: %v, metricNamer: %v, query: %v", err, namer.BuildUniqueKey(), promQuery.Prometheus.Query)
		return nil, err
	}
	return timeSeries, nil
}

func (p *prom) GetPromClient() promapiv1.API {
	return p.ctx.api
}
