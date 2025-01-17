package prom

import (
	gocontext "context"
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	prometheus "github.com/prometheus/client_golang/api"
	promapiv1 "github.com/prometheus/client_golang/api/prometheus/v1"
	prommodel "github.com/prometheus/common/model"
	"k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/klog/v2"

	"github.com/gocrane/crane/pkg/common"
)

const (
	PrometheusClientID = "prom"
	// max number of points each time series of prometheus
	PrometheusPointsLimitPerTimeSeries = 11000
)

type context struct {
	api                    promapiv1.API
	maxPointsPerTimeSeries int
}

// Test use
func NewContextByAPI(api promapiv1.API, maxPointsPerTimeSeries int) *context {
	return &context{
		api:                    api,
		maxPointsPerTimeSeries: maxPointsPerTimeSeries,
	}
}

// NewContext creates a new Prometheus querying context from the given client.
func NewContext(client prometheus.Client, maxPointsPerTimeSeries int) *context {
	return &context{
		api:                    promapiv1.NewAPI(client),
		maxPointsPerTimeSeries: maxPointsPerTimeSeries,
	}
}

// QueryRangeSync range query prometheus in sync way
func (c *context) QueryRangeSync(ctx gocontext.Context, query string, start, end time.Time, step time.Duration) ([]*common.TimeSeries, error) {
	klog.Infof("进入QueryRangeSync方法")
	r := promapiv1.Range{
		Start: start,
		End:   end,
		Step:  step,
	}
	//判断是否需要分片
	shards := c.computeShards(query, &r)
	klog.Infof("shards:%v", shards)
	if len(shards.windows) <= 1 {
		// 如果只有一个时间范围，直接进行单次查询
		klog.V(4).InfoS("Prom query directly", "query", query)
		klog.InfoS("如果只有一个时间范围，直接进行单次查询 Prom query directly", "query", query)
		var ts []*common.TimeSeries
		klog.InfoS("进入prometheus历史数据查询,查询参数为: query=%s, start=%s, end=%s, step=%s", query, r.Start, r.End, r.Step)
		results, warnings, err := c.api.QueryRange(ctx, query, r)

		if len(warnings) != 0 {
			klog.V(4).InfoS("Prom query range warnings", "warnings", warnings)
			klog.ErrorS(nil, "Prom查询范围警告", "warnings:", warnings)
		}
		// todo: parse err to see its max limit dynamically
		if err != nil {
			return ts, err
		}

		if klog.V(7).Enabled() {
			klog.V(7).InfoS("Prom query range result", "query", query, "result", results.String(), "resultsType", results.Type())
		}

		// 打印查询的结果
		if results != nil {
			klog.Infof("原始prometheus历史数据查询结果: %s,查询类型：%s", results.String(), results.Type())
		} else {
			klog.Warning("查询结果为空")
		}
		return c.convertPromResultsToTimeSeries(results)
	}
	// 如果有多个时间范围，调用 `c.queryByShards`
	// 按分片进行查询提高查询效率，避免 Prometheus 查询范围限制带来的问题。
	return c.queryByShards(ctx, shards)
}

func (c *context) QueryRangeSyncTestData(ctx gocontext.Context, query string, start, end time.Time, step time.Duration) ([]*common.TimeSeries, error) {
	return c.convertPromResultsToTimeSeriesTestData()
}

// QuerySync query prometheus in sync way
func (c *context) QuerySync(ctx gocontext.Context, query string) ([]*common.TimeSeries, error) {
	var ts []*common.TimeSeries
	results, warnings, err := c.api.Query(ctx, query, time.Now())
	if len(warnings) != 0 {
		klog.InfoS("Prom query warnings", "warnings", warnings)
	}
	if err != nil {
		return ts, err
	}
	klog.V(8).InfoS("Prom query result", "result", results.String(), "resultsType", results.Type())
	return c.convertPromResultsToTimeSeries(results)

}

func (c *context) queryByShards(ctx gocontext.Context, queryShards *QueryShards) ([]*common.TimeSeries, error) {
	klog.InfoS("有多个时间范围，调用 `c.queryByShards`  Prom query directly", "query", queryShards.query)
	klog.V(4).InfoS("Prom query range by shards", "query", queryShards.query)
	resultsCh := make(chan *QueryShardResult, len(queryShards.windows))
	var wg sync.WaitGroup
	for _, window := range queryShards.windows {
		wg.Add(1)
		go func(ctx gocontext.Context, window *promapiv1.Range) {
			defer runtime.HandleCrash()
			defer wg.Done()
			klog.V(6).InfoS("Prom query range by shards", "query", queryShards.query, "window", window)
			value, warnings, err := c.api.QueryRange(ctx, queryShards.query, *window)
			if len(warnings) != 0 {
				klog.V(4).InfoS("Prom query range warnings", "warnings", warnings, "window", window, "query", queryShards.query)
			}
			if err != nil {
				resultsCh <- &QueryShardResult{
					window:    window,
					warnnings: warnings,
					err:       err,
				}
				return
			}
			result, err := c.convertPromResultsToTimeSeriesMap(value)
			if err != nil {
				resultsCh <- &QueryShardResult{
					window:    window,
					data:      result,
					warnnings: warnings,
					err:       err,
				}
				return
			}
			resultsCh <- &QueryShardResult{
				window:    window,
				data:      result,
				warnnings: warnings,
				err:       err,
			}
		}(ctx, window)
	}

	wg.Wait()
	close(resultsCh)

	klog.V(4).InfoS("Prom query range by shards, all shards query done", "query", queryShards.query)
	klog.InfoS("Prom query range by shards, all shards query done", "query", queryShards.query)
	var errs []error
	resultsMap := make(map[string]*common.TimeSeries)
	var results []*common.TimeSeries
	for windowResult := range resultsCh {
		if windowResult.err != nil {
			errs = append(errs, windowResult.err)
			continue
		}
		for key := range windowResult.data {
			if ts1, ok := resultsMap[key]; ok {
				ts2 := windowResult.data[key]
				ts1.SortSampleAsc()
				ts2.SortSampleAsc()
				ts := MergeSortedTimeSeries(ts1, ts2)
				resultsMap[key] = ts
			} else {
				resultsMap[key] = windowResult.data[key]
			}
		}
	}

	for _, ts := range resultsMap {
		results = append(results, ts)
	}
	if len(errs) > 0 {
		return results, fmt.Errorf("%v", errs)
	}
	klog.InfoS("分片查询结束，查询结果为:%v", results)
	return results, nil
}

func MergeSortedTimeSeries(ts1, ts2 *common.TimeSeries) *common.TimeSeries {
	ts := common.NewTimeSeries()
	ts.SetLabels(ts1.Labels)
	len1 := len(ts1.Samples)
	len2 := len(ts2.Samples)

	var i = 0
	var j = 0
	var k = 0
	for i < len1 && j < len2 {
		for ; i < len1 && j < len2 && ts1.Samples[i].Timestamp <= ts2.Samples[j].Timestamp; i++ {
			if len(ts.Samples) > 0 {
				// remove duplicated timestamp
				if ts.Samples[k-1].Timestamp == ts1.Samples[i].Timestamp {
					continue
				}
			}
			ts.Samples = append(ts.Samples, ts1.Samples[i])
			k++
		}
		for ; i < len1 && j < len2 && ts2.Samples[j].Timestamp < ts1.Samples[i].Timestamp; j++ {
			if len(ts.Samples) > 0 {
				// remove duplicated timestamp
				if ts.Samples[k-1].Timestamp == ts2.Samples[j].Timestamp {
					continue
				}
			}
			ts.Samples = append(ts.Samples, ts2.Samples[j])
			k++
		}
	}
	if i < len1 {
		for ; i < len1; i++ {
			if len(ts.Samples) > 0 {
				// remove duplicated timestamp
				if ts.Samples[k-1].Timestamp == ts1.Samples[i].Timestamp {
					continue
				}
			}
			ts.Samples = append(ts.Samples, ts1.Samples[i])
			k++
		}
	}
	if j < len2 {
		for ; j < len2; j++ {
			if len(ts.Samples) > 0 {
				// remove duplicated timestamp
				if ts.Samples[k-1].Timestamp == ts2.Samples[j].Timestamp {
					continue
				}
			}
			ts.Samples = append(ts.Samples, ts2.Samples[j])
			k++
		}
	}
	return ts
}

type QueryShardResult struct {
	data      map[string]*common.TimeSeries
	warnnings promapiv1.Warnings
	err       error
	window    *promapiv1.Range
}

func convertCSVToTimeSeries() ([]*common.TimeSeries, error) {
	// 指定 CSV 文件网络地址
	url := "http://119.167.151.67/crane/input0.csv"

	var results []*common.TimeSeries

	// 从网络下载 CSV 文件
	resp, err := http.Get(url)
	if err != nil {
		klog.Fatalf("failed to fetch file from URL: %v", err)
	}
	defer resp.Body.Close()

	// 检查 HTTP 响应状态
	if resp.StatusCode != http.StatusOK {
		klog.Fatalf("failed to fetch file, HTTP status: %s", resp.Status)
	}

	// 创建 CSV reader
	reader := csv.NewReader(resp.Body)
	// 读取 CSV 内容
	records, err := reader.ReadAll()
	if err != nil {
		klog.Fatalf("failed to read CSV: %v", err)
	}

	// 检查记录是否足够
	if len(records) < 2 {
		klog.Fatalf("CSV file does not have enough rows (need at least a header and one data row)")
	}

	// 创建单一的 TimeSeries 对象
	tsObj := common.NewTimeSeries()

	// 假设使用一个固定的标签
	tsObj.AppendLabel("", "")

	// 解析数据并添加到 TimeSeries
	for _, record := range records[1:] { // 跳过头行
		tsStr := record[0]
		valueStr := record[1]

		// 解析时间戳和数值
		ts, err := strconv.ParseInt(tsStr, 10, 64)
		if err != nil {
			klog.Fatalf("failed to parse timestamp %v: %v", tsStr, err)
		}

		value, err := strconv.ParseFloat(valueStr, 64)
		if err != nil {
			klog.Fatalf("failed to parse value %v: %v", valueStr, err)
		}

		// 将样本添加到 TimeSeries 的 Samples
		tsObj.AppendSample(ts, value)
	}

	// 添加到结果集合
	results = append(results, tsObj)

	// 打印 TimeSeries 数据
	for _, ts := range results {
		fmt.Printf("读取csv文件成功,ts.Samples的长度为: %d\n", len(ts.Samples))
	}
	return results, err
}

func (c *context) convertPromResultsToTimeSeriesTestData() ([]*common.TimeSeries, error) {
	klog.InfoS("进入convertPromResultsToTimeSeriesTestData")
	return convertCSVToTimeSeries()
}

func (c *context) convertPromResultsToTimeSeries(value prommodel.Value) ([]*common.TimeSeries, error) {
	klog.InfoS("进入convertPromResultsToTimeSeries,初始数据为：", value.String())
	var results []*common.TimeSeries
	typeValue := value.Type()
	switch typeValue {
	case prommodel.ValMatrix:
		if matrix, ok := value.(prommodel.Matrix); ok {
			for _, sampleStream := range matrix {
				if sampleStream == nil {
					continue
				}
				ts := common.NewTimeSeries()
				for key, val := range sampleStream.Metric {
					ts.AppendLabel(string(key), string(val))
				}
				for _, pair := range sampleStream.Values {
					ts.AppendSample(int64(pair.Timestamp/1000), float64(pair.Value))
				}
				results = append(results, ts)
			}
			return results, nil
		} else {
			return results, fmt.Errorf("prometheus value type is %v, but assert failed", typeValue)
		}

	case prommodel.ValVector:
		if vector, ok := value.(prommodel.Vector); ok {
			for _, sample := range vector {
				if sample == nil {
					continue
				}
				ts := common.NewTimeSeries()
				for key, val := range sample.Metric {
					ts.AppendLabel(string(key), string(val))
				}
				// for vector, all the sample has the same timestamp. just one point for each metric
				ts.AppendSample(int64(sample.Timestamp/1000), float64(sample.Value))
				results = append(results, ts)
			}
			return results, nil
		} else {
			return results, fmt.Errorf("prometheus value type is %v, but assert failed", typeValue)
		}
	case prommodel.ValScalar:
		return results, fmt.Errorf("not support for scalar when use timeseries")
	case prommodel.ValString:
		return results, fmt.Errorf("not support for string when use timeseries")
	case prommodel.ValNone:
		return results, fmt.Errorf("prometheus return value type is none")
	}
	return results, fmt.Errorf("prometheus return unknown model value type %v", typeValue)
}

func (c *context) convertPromResultsToTimeSeriesMap(value prommodel.Value) (map[string]*common.TimeSeries, error) {
	results := make(map[string]*common.TimeSeries)

	typeValue := value.Type()
	switch typeValue {
	case prommodel.ValMatrix:
		if matrix, ok := value.(prommodel.Matrix); ok {
			for _, sampleStream := range matrix {
				if sampleStream == nil {
					continue
				}
				ts := common.NewTimeSeries()
				for key, val := range sampleStream.Metric {
					ts.AppendLabel(string(key), string(val))
				}
				for _, pair := range sampleStream.Values {
					ts.AppendSample(int64(pair.Timestamp/1000), float64(pair.Value))
				}
				results[sampleStream.Metric.String()] = ts
			}
			return results, nil
		} else {
			return results, fmt.Errorf("prometheus value type is %v, but assert failed", typeValue)
		}

	case prommodel.ValVector:
		if vector, ok := value.(prommodel.Vector); ok {
			for _, sample := range vector {
				if sample == nil {
					continue
				}
				ts := common.NewTimeSeries()
				for key, val := range sample.Metric {
					ts.AppendLabel(string(key), string(val))
				}
				// for vector, all the sample has the same timestamp. just one point for each metric
				ts.AppendSample(int64(sample.Timestamp/1000), float64(sample.Value))
				results[sample.Metric.String()] = ts
			}
			return results, nil
		} else {
			return results, fmt.Errorf("prometheus value type is %v, but assert failed", typeValue)
		}
	case prommodel.ValScalar:
		return results, fmt.Errorf("not support for scalar when use timeseries")
	case prommodel.ValString:
		return results, fmt.Errorf("not support for string when use timeseries")
	case prommodel.ValNone:
		return results, fmt.Errorf("prometheus return value type is none")
	}
	return results, fmt.Errorf("prometheus return unknown model value type %v", typeValue)
}

func (c *context) CheckMaxLimit(window promapiv1.Range) bool {
	possiblePoints := 0
	for start := window.Start; start.Before(window.End); start = start.Add(window.Step) {
		possiblePoints++
	}
	return possiblePoints > PrometheusPointsLimitPerTimeSeries
}

func (c *context) computeShards(query string, window *promapiv1.Range) *QueryShards {
	windows := ComputeWindowShards(window, c.maxPointsPerTimeSeries)
	return &QueryShards{
		query:   query,
		windows: windows,
	}
}

func ComputeWindowShards(window *promapiv1.Range, maxPointsLimitPerTimeSeries int) []*promapiv1.Range {
	shardIndex := 0
	nextPoint := window.Start
	prePoint := nextPoint
	var shards []*promapiv1.Range
	for {
		if nextPoint.After(window.End) {
			shards = append(shards, &promapiv1.Range{
				Start: prePoint,
				End:   window.End,
				Step:  window.Step,
			})
			return shards
		}
		if shardIndex != 0 && shardIndex%maxPointsLimitPerTimeSeries == 0 {
			shards = append(shards, &promapiv1.Range{
				Start: prePoint,
				End:   nextPoint.Add(-window.Step),
				Step:  window.Step,
			})
			prePoint = nextPoint
		}
		nextPoint = nextPoint.Add(window.Step)
		shardIndex++
	}
}

// shard by time slice only, because we can not decide what the query is, how many time series it will return, it depends on the application level.
type QueryShards struct {
	query   string
	windows []*promapiv1.Range
}
