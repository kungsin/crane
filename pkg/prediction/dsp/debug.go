package dsp

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"

	"k8s.io/klog/v2"

	"github.com/gocrane/crane/pkg/common"
	"github.com/gocrane/crane/pkg/metricnaming"
	"github.com/gocrane/crane/pkg/prediction"
	"github.com/gocrane/crane/pkg/prediction/config"
)

func Debug(predictor prediction.Interface, namer metricnaming.MetricNamer, config *config.Config) (*Signal, *Signal, *Signal, error) {
	internalConfig, err := makeInternalConfig(config.DSP)
	if err != nil {
		return nil, nil, nil, err
	}

	historyTimeSeriesList, err := queryHistoryTimeSeries(predictor.(*periodicSignalPrediction), namer, internalConfig)

	if err != nil {
		return nil, nil, nil, err
	}

	queryExpr := namer.BuildUniqueKey()

	var signal, history, test, estimate *Signal
	var nPeriods int
	var chosenEstimator Estimator
	klog.Errorf("for historyTimeSeriesList %v:", historyTimeSeriesList)
	for _, ts := range historyTimeSeriesList {
		// klog.Errorf("for historyTimeSeriesList 循环中的 ts%v:",ts)
		periodLength := findPeriod(ts, internalConfig.historyResolution)
		if periodLength == Day || periodLength == Week {
			signal = SamplesToSignal(ts.Samples, internalConfig.historyResolution)
			signal, nPeriods = signal.Truncate(periodLength)
			if nPeriods >= 2 {
				chosenEstimator = bestEstimator(queryExpr, internalConfig.estimators, signal, nPeriods, periodLength)
			}
			if chosenEstimator != nil {
				samplesPerPeriod := len(signal.Samples) / nPeriods
				history = &Signal{
					SampleRate: signal.SampleRate,
					Samples:    signal.Samples[:(nPeriods-1)*samplesPerPeriod],
				}
				test = &Signal{
					SampleRate: signal.SampleRate,
					Samples:    signal.Samples[(nPeriods-1)*samplesPerPeriod:],
				}
				estimate = chosenEstimator.GetEstimation(history, periodLength)
				return history, test, estimate, nil
			}
		}
	}

	return nil, nil, nil, fmt.Errorf("no prediction result")
}

func queryHistoryTimeSeries(predictor *periodicSignalPrediction, namer metricnaming.MetricNamer, config *internalConfig) ([]*common.TimeSeries, error) {
	p := predictor.GetHistoryProvider()
	if p == nil {
		return nil, fmt.Errorf("history provider not provisioned")
	}

	// end := time.Now().Truncate(config.historyResolution)
	// start := end.Add(-config.historyDuration - time.Hour)

	// tsList, err := p.QueryTimeSeries(namer, start, end, config.historyResolution)
	// if err != nil {
	// 	klog.ErrorS(err, "Failed to query history time series.")
	// 	return nil, err
	// }

	tsList, _ := convertCSVToTimeSeries()

	klog.V(4).InfoS("DSP debug | queryHistoryTimeSeries", "timeSeriesList", tsList, "config", *config)

	return preProcessTimeSeriesList(tsList, config)
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
