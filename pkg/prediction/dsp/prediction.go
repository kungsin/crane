package dsp

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sync"
	"time"

	"k8s.io/klog/v2"

	"github.com/gocrane/crane/pkg/common"
	"github.com/gocrane/crane/pkg/metricnaming"
	"github.com/gocrane/crane/pkg/prediction"
	"github.com/gocrane/crane/pkg/prediction/accuracy"
	"github.com/gocrane/crane/pkg/prediction/config"
	"github.com/gocrane/crane/pkg/providers"
)

var (
	Hour = time.Hour
	Day  = time.Hour * 24
	Week = Day * 7
)

const (
	defaultFuture = time.Hour
)

type periodicSignalPrediction struct {
	prediction.GenericPrediction
	a         aggregateSignals
	stopChMap sync.Map
	// record the query routine already started
	queryRoutines sync.Map
	modelConfig   config.AlgorithmModelConfig
}

func (p *periodicSignalPrediction) QueryPredictionStatus(ctx context.Context, metricNamer metricnaming.MetricNamer) (prediction.Status, error) {
	_, status := p.a.GetSignals(metricNamer.BuildUniqueKey())
	return status, nil
}

func NewPrediction(realtimeProvider providers.RealTime, historyProvider providers.History, mc config.AlgorithmModelConfig) prediction.Interface {
	withCh, delCh := make(chan prediction.QueryExprWithCaller), make(chan prediction.QueryExprWithCaller)
	return &periodicSignalPrediction{
		GenericPrediction: prediction.NewGenericPrediction(realtimeProvider, historyProvider, withCh, delCh),
		a:                 newAggregateSignals(),
		stopChMap:         sync.Map{},
		queryRoutines:     sync.Map{},
		modelConfig:       mc,
	}
}

func (p *periodicSignalPrediction) QueryRealtimePredictedValuesOnce(ctx context.Context, namer metricnaming.MetricNamer, config config.Config) ([]*common.TimeSeries, error) {
	panic("implement me")
}

func findPeriod(ts *common.TimeSeries, sampleInterval time.Duration) time.Duration {
	signal := SamplesToSignal(ts.Samples, sampleInterval)
	klog.Infof("findPeriod的SamplesToSignal转换结果：%v", signal)
	si, m := signal.Truncate(Week)
	klog.Infof("singnal的Truncate Week结果si：%v,m:%v:", si, m)
	if m > 1 {
		return si.FindPeriod()
	}
	si, m = signal.Truncate(Day)
	klog.Infof("singnal的Truncate Day结果si：%v,m:%v", si, m)
	if m > 1 {
		return si.FindPeriod()
	}
	return -1
}

func SamplesToSignal(samples []common.Sample, sampleInterval time.Duration) *Signal {

	// 打印 samples 参数
	// for i, sample := range samples {
	// 	klog.InfoS("打印 samples 参数 Sample[%d]: Value=%f, Timestamp=%d\n", i, sample.Value, sample.Timestamp)
	// }

	// 打印 sampleInterval 参数
	klog.Errorf("打印 sampleInterval 参数 SampleInterval: %v\n", sampleInterval)

	values := make([]float64, len(samples))
	for i := range samples {
		values[i] = samples[i].Value
	}
	return &Signal{
		SampleRate: 1.0 / sampleInterval.Seconds(),
		Samples:    values,
	}
}

func (p *periodicSignalPrediction) Run(stopCh <-chan struct{}) {
	if p.GetHistoryProvider() == nil {
		klog.ErrorS(fmt.Errorf("history provider not provisioned"), "Failed to run periodicSignalPrediction.")
		klog.Errorf("历史数据未提供")
		return
	}

	go func() {
		for {
			// Waiting for a WithQuery request
			qc := <-p.WithCh
			// update if the query config updated, idempotent
			p.a.Add(qc)
			QueryExpr := qc.MetricNamer.BuildUniqueKey()

			if _, ok := p.queryRoutines.Load(QueryExpr); ok {
				continue
			}
			if _, ok := p.stopChMap.Load(QueryExpr); ok {
				continue
			}
			klog.V(6).InfoS("Register a query expression for prediction.", "queryExpr", QueryExpr, "caller", qc.Caller)
			klog.Errorf("注册用于预测的表达式 Register a query expression for prediction.", "queryExpr", QueryExpr, "caller", qc.Caller)
			go func(namer metricnaming.MetricNamer) {
				queryExpr := namer.BuildUniqueKey()
				p.queryRoutines.Store(queryExpr, struct{}{})
				ticker := time.NewTicker(p.modelConfig.UpdateInterval)
				defer ticker.Stop()

				v, _ := p.stopChMap.LoadOrStore(queryExpr, make(chan struct{}))
				predStopCh := v.(chan struct{})

				for {
					if err := p.updateAggregateSignalsWithQuery(namer); err != nil {
						klog.ErrorS(err, "Failed to updateAggregateSignalsWithQuery.")
					}

					select {
					case <-predStopCh:
						p.queryRoutines.Delete(queryExpr)
						klog.V(4).InfoS("Prediction routine stopped.", "queryExpr", queryExpr)
						klog.Errorf("预测程序停止 Prediction routine stopped.", "queryExpr", queryExpr)
						return
					case <-ticker.C:
						continue
					}
				}
			}(qc.MetricNamer)
		}
	}()

	go func() {
		for {
			qc := <-p.DelCh
			QueryExpr := qc.MetricNamer.BuildUniqueKey()
			klog.V(4).InfoS("Unregister a query expression from prediction.", "queryExpr", QueryExpr, "caller", qc.Caller)

			go func(qc prediction.QueryExprWithCaller) {
				if p.a.Delete(qc) {
					val, loaded := p.stopChMap.LoadAndDelete(QueryExpr)
					if loaded {
						predStopCh := val.(chan struct{})
						predStopCh <- struct{}{}
					}
				}
			}(qc)
		}
	}()

	klog.Infof("预测器启动 predictor %v started", p.Name())

	<-stopCh

	klog.Infof("预测器停止 predictor %v stopped", p.Name())
}

func (p *periodicSignalPrediction) updateAggregateSignalsWithQuery(namer metricnaming.MetricNamer) error {
	klog.Errorf("查询历史数据的条件namer %+v：", namer)

	// Query history data for prediction
	maxAttempts := 10
	attempts := 0
	var tsList []*common.TimeSeries
	var err error
	queryExpr := namer.BuildUniqueKey()
	for attempts < maxAttempts {
		tsList, err = p.queryHistoryTimeSeries(namer)
		if err != nil {
			attempts++
			t := time.Second * time.Duration(math.Pow(2., float64(attempts)))
			klog.ErrorS(err, "Failed to get time series.", "queryExpr", queryExpr, "attempts", attempts)
			time.Sleep(t)
		} else {
			break
		}
	}
	if attempts == maxAttempts {
		klog.Errorf("After attempting %d times, still cannot get history time series for query expression '%s'.", maxAttempts, queryExpr)
		return err
	}

	klog.V(6).InfoS("Update aggregate signals.", "queryExpr", queryExpr, "timeSeriesLength", len(tsList))
	klog.Infof("更新聚合信号 Update aggregate signals.", "queryExpr:%v:", queryExpr, "timeSeriesLength%v:", len(tsList))
	cfg := p.a.GetConfig(queryExpr)

	// 打印 tsList 的具体内容
	jsonData, err := json.Marshal(tsList)
	if err != nil {
		klog.Infof("Error marshaling tsList: %v", err)
	} else {
		klog.Infof("进入updateAggregateSignals之前tsList的值为: %s", jsonData)
	}

	p.updateAggregateSignals(queryExpr, tsList, cfg)

	return nil
}

func (p *periodicSignalPrediction) queryHistoryTimeSeries(namer metricnaming.MetricNamer) ([]*common.TimeSeries, error) {
	if p.GetHistoryProvider() == nil {
		klog.Errorf("没有提供历史记录提供程序 history provider not provisioned")
		return nil, fmt.Errorf("history provider not provisioned")
	}

	queryExpr := namer.BuildUniqueKey()
	config := p.a.GetConfig(queryExpr)

	end := time.Now().Truncate(config.historyResolution)
	start := end.Add(-config.historyDuration - time.Hour)
	//打印查询prometheus历史数据的查询参数
	klog.Infof("调用 QueryTimeSeries 方法查询prometheus历史数据, 查询参数: metricNamer=%+v, startTime=%s, endTime=%s, step=%v",
		namer,
		start.Format(time.RFC3339),
		end.Format(time.RFC3339),
		config.historyResolution,
	)
	tsList, err := p.GetHistoryProvider().QueryTimeSeries(namer, start, end, config.historyResolution)
	if err != nil {
		klog.ErrorS(err, "Failed to query history time series.")
		return nil, err
	}

	klog.InfoS("dsp queryHistoryTimeSeries", "timeSeriesList", tsList, "config", *config)

	klog.Infof("p.GetHistoryProvider().QueryTimeSeries 方法查询prometheus历史数据返回的时间序列数量: %d", len(tsList))
	// for i, ts := range tsList {
	//     if ts == nil {
	//         klog.Warningf("时间序列[%d] 为 nil，跳过打印", i)
	//         continue
	//     }

	//     // 打印 TimeSeries 的 Labels
	//     labels := []string{}
	//     for _, label := range ts.Labels {
	//         labels = append(labels, fmt.Sprintf("%s=%s", label.Name, label.Value))
	//     }
	//     klog.Infof("时间序列[%d]: Labels={%s}", i, strings.Join(labels, ", "))

	//     // 打印 TimeSeries 的 Samples
	//     for j, sample := range ts.Samples {
	//         klog.Infof("时间序列[%d]的样本[%d]: Value=%.2f, Timestamp=%d", i, j, sample.Value, sample.Timestamp)
	//     }
	// }
	return preProcessTimeSeriesList(tsList, config)
	// return tsList,nil
}

func (p *periodicSignalPrediction) updateAggregateSignals(queryExpr string, historyTimeSeriesList []*common.TimeSeries, config *internalConfig) {
	var predictedTimeSeriesList []*common.TimeSeries
	klog.Errorf("进入更新聚合信号后,predictedTimeSeriesList的长度: %v", len(historyTimeSeriesList))
	for i, ts := range historyTimeSeriesList {
		jsonData, err := json.Marshal(ts)
		if err != nil {
			klog.Errorf("Error marshaling TimeSeries at index %d: %v", i, err)
		} else {
			klog.Errorf("historyTimeSeriesList[%d]的值: %s", i, jsonData)
		}
	}

	for i, ts := range historyTimeSeriesList {
		if klog.V(6).Enabled() {
			sampleData, err := json.Marshal(ts.Samples)
			klog.V(6).Infof("Got time series, queryExpr: %s, samples: %v, labels: %v, err: %v", queryExpr, string(sampleData), ts.Labels, err)
		}
		jsonData, err := json.Marshal(ts)
		klog.Infof("进入historyTimeSeriesList[%d] for循环之后ts的值: %s", i, jsonData)
		sampleData, err := json.Marshal(ts.Samples)
		klog.Infof("Got time series, queryExpr: %s, samples: %v, labels: %v, err: %v", queryExpr, string(sampleData), ts.Labels, err)

		var chosenEstimator Estimator
		var signal *Signal
		var nPeriods int
		var periodLength time.Duration = 0
		klog.Infof("findPeriod查询条件 ts: %v,config.historyResolutionL:%v", ts, config.historyResolution)
		p := findPeriod(ts, config.historyResolution)
		klog.Infof("findPeriod查询的结果: %v", p)
		if p == Day || p == Week {
			periodLength = p
			klog.V(4).InfoS("This is a periodic time series.", "queryExpr", queryExpr, "labels", ts.Labels, "periodLength", periodLength)
			klog.Errorf("这是一个周期时间序列 This is a periodic time series.", "queryExpr", queryExpr, "labels", ts.Labels, "periodLength", periodLength)
		} else {
			klog.V(4).InfoS("This is not a periodic time series.", "queryExpr", queryExpr, "labels", ts.Labels)
			klog.Errorf("这不是一个周期时间序列 This is not a periodic time series.", "queryExpr", queryExpr, "labels", ts.Labels)
		}
		klog.Errorf("periodLength的结果:%v", periodLength)
		if periodLength > 0 {
			signal = SamplesToSignal(ts.Samples, config.historyResolution)
			signal, nPeriods = signal.Truncate(periodLength)
			klog.Errorf("nPeriods的数量:%v", nPeriods)
			if nPeriods >= 2 {
				chosenEstimator = bestEstimator(queryExpr, config.estimators, signal, nPeriods, periodLength)
			}
		}
		klog.Infof("chosenEstimator的结果:%v", chosenEstimator)
		if chosenEstimator != nil {
			estimatedSignal := chosenEstimator.GetEstimation(signal, periodLength)
			klog.Errorf("生成的预测信号：%+v", estimatedSignal)
			klog.Errorf("生成的预测信号样本数量：%d", len(estimatedSignal.Samples))
			intervalSeconds := int64(config.historyResolution.Seconds())
			nextTimestamp := ts.Samples[len(ts.Samples)-1].Timestamp + intervalSeconds

			n := len(estimatedSignal.Samples)
			samples := make([]common.Sample, n*nPeriods)
			for k := 0; k < nPeriods; k++ {
				for i := range estimatedSignal.Samples {
					// klog.Infof("打印当前处理的样本值 Processing sample: estimatedSignal.Samples[%d] = %+v", i, estimatedSignal.Samples[i])
					samples[i+k*n] = common.Sample{
						Value:     estimatedSignal.Samples[i],
						Timestamp: nextTimestamp,
					}
					nextTimestamp += intervalSeconds
				}
			}

			predictedTimeSeriesList = append(predictedTimeSeriesList, &common.TimeSeries{
				Labels:  ts.Labels,
				Samples: samples,
			})
		}
	}
	klog.Infof("预测之后的predictedTimeSeriesList:%v",predictedTimeSeriesList)
	signals := map[string]*aggregateSignal{}
	for i := range predictedTimeSeriesList {
		key := prediction.AggregateSignalKey(predictedTimeSeriesList[i].Labels)
		signal := newAggregateSignal()
		signal.setPredictedTimeSeries(predictedTimeSeriesList[i])
		signals[key] = signal
	}
	klog.Infof("预测之后的signals:%v",signals)
	p.a.SetSignals(queryExpr, signals)
}

func bestEstimator(id string, estimators []Estimator, signal *Signal, nPeriods int, periodLength time.Duration) Estimator {
	samplesPerPeriod := len(signal.Samples) / nPeriods

	history := &Signal{
		SampleRate: signal.SampleRate,
		Samples:    signal.Samples[:(nPeriods-1)*samplesPerPeriod],
	}

	actual := &Signal{
		SampleRate: signal.SampleRate,
		Samples:    signal.Samples[(nPeriods-1)*samplesPerPeriod:],
	}

	minPE := math.MaxFloat64
	var bestEstimator Estimator
	for i := range estimators {
		estimated := estimators[i].GetEstimation(history, periodLength)
		if estimated != nil {
			pe, err := accuracy.PredictionError(actual.Samples, estimated.Samples)
			klog.V(6).InfoS("Testing estimators ...", "key", id, "estimator", estimators[i].String(), "pe", pe, "error", err)
			if err == nil && pe < minPE {
				minPE = pe
				bestEstimator = estimators[i]
			}
		}
	}

	klog.V(4).InfoS("Got the best estimator.", "key", id, "estimator", bestEstimator.String(), "minPE", minPE, "periods", nPeriods)
	return bestEstimator
}

func (p *periodicSignalPrediction) QueryPredictedTimeSeries(ctx context.Context, namer metricnaming.MetricNamer, startTime time.Time, endTime time.Time) ([]*common.TimeSeries, error) {
	return p.getPredictedTimeSeriesList(ctx, namer, startTime, endTime), nil
}

func (p *periodicSignalPrediction) QueryRealtimePredictedValues(ctx context.Context, namer metricnaming.MetricNamer) ([]*common.TimeSeries, error) {
	queryExpr := namer.BuildUniqueKey()
	config := p.a.GetConfig(queryExpr)

	now := time.Now()
	start := now.Truncate(config.historyResolution)
	end := start.Add(defaultFuture)

	predictedTimeSeries := p.getPredictedTimeSeriesList(ctx, namer, start, end)

	var realtimePredictedTimeSeries []*common.TimeSeries

	for _, ts := range predictedTimeSeries {
		if len(ts.Samples) < 1 {
			continue
		}
		maxValue := ts.Samples[0].Value
		for i := 1; i < len(ts.Samples); i++ {
			if maxValue < ts.Samples[i].Value {
				maxValue = ts.Samples[i].Value
			}
		}
		realtimePredictedTimeSeries = append(realtimePredictedTimeSeries, &common.TimeSeries{
			Labels:  ts.Labels,
			Samples: []common.Sample{{Value: maxValue, Timestamp: now.Unix()}},
		})
	}
	return realtimePredictedTimeSeries, nil
}

func (p *periodicSignalPrediction) getPredictedTimeSeriesList(ctx context.Context, namer metricnaming.MetricNamer, start, end time.Time) []*common.TimeSeries {
	klog.InfoS("从Singna中获取时序列表时的开始时间和结束时间 Start time: %v, End time: %v", start, end)
	var predictedTimeSeriesList []*common.TimeSeries
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	queryExpr := namer.BuildUniqueKey()
	klog.Errorf("predictedData.getPredictedTimeSeriesList.queryExpr: %v", queryExpr)
	for {
		signals, status := p.a.GetSignals(queryExpr)
		klog.Errorf("GetSignals获取数据signals: %v", signals)
		klog.Errorf("GetSignals获取状态.status: %v", status)
		if status == prediction.StatusDeleted {
			klog.InfoS("Aggregated has been deleted.", "queryExpr", queryExpr)
			return predictedTimeSeriesList
		}
		
		if signals != nil && status == prediction.StatusReady {
			for key, signal := range signals {
				var samples []common.Sample
				klog.InfoS("从Singna中获取时序列表samples", signal.predictedTimeSeries.Samples)
				for _, sample := range signal.predictedTimeSeries.Samples {
					// t := time.Unix(sample.Timestamp, 0)
					// Check if t is in [startTime, endTime]
					// if !t.Before(start) && !t.After(end) {
					// 	klog.Infof("时间符合要求")
					// 	samples = append(samples, sample)
					// } else if t.After(end) {
					// 	break
					// }
					samples = append(samples, sample)
				}

				if len(samples) > 0 {
					predictedTimeSeriesList = append(predictedTimeSeriesList, &common.TimeSeries{
						Labels:  signal.predictedTimeSeries.Labels,
						Samples: samples,
					})
				}

				klog.InfoS("Got DSP predicted samples.", "queryExpr", queryExpr, "labels", key, "len", len(samples))
			}
			return predictedTimeSeriesList
		}
		select {
		case <-ctx.Done():
			klog.Infoln("Time out.")
			return predictedTimeSeriesList
		case <-ticker.C:
			continue
		}
	}
}

func (p *periodicSignalPrediction) Name() string {
	return "Periodic"
}
