package dsp

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io/ioutil"
	"strconv"
	"sync"
	"testing"
	"time"

	"github.com/montanaflynn/stats"
	"k8s.io/klog/v2"

	"github.com/gocrane/crane/pkg/common"
)

func fillMissingData(ts *common.TimeSeries, config *internalConfig, unit time.Duration) error {
	klog.Infof("进入fillMissingData处理,参数为 ts(len):%d,config:%v,unit:%v",len(ts.Samples),config,unit)
	if ts == nil || len(ts.Samples) == 0 {
		return fmt.Errorf("empty time series")
	}
	// klog.Infof("进入fillMissingData处理,参数为 ts:%v,config:%v,unit:%v",ts,config,unit)
	intervalSeconds := int64(config.historyResolution.Seconds())
	// klog.Infof("config.historyResolution.Seconds():",config.historyResolution.Seconds())
	for i := 1; i < len(ts.Samples); i++ {
		diff := ts.Samples[i].Timestamp - ts.Samples[i-1].Timestamp
		// If a gap in time series is larger than one hour,
		// drop all samples before [i].
		if diff > 3600 {
			ts.Samples = ts.Samples[i:]
			return fillMissingData(ts, config, unit)
		}

		// The samples should be in chronological order.
		// If the difference between two consecutive sample timestamps is not integral multiple of interval,
		// the time series is not valid.
		if diff%intervalSeconds != 0 || diff <= 0 {
			klog.Info("diff%intervalSeconds != 0 || diff <= 0")
			return fmt.Errorf("invalid time series")
		}
	}

	newSamples := []common.Sample{ts.Samples[0]}
	for i := 1; i < len(ts.Samples); i++ {
		times := (ts.Samples[i].Timestamp - ts.Samples[i-1].Timestamp) / intervalSeconds
		unitDiff := (ts.Samples[i].Value - ts.Samples[i-1].Value) / float64(times)
		// Fill the missing samples if any
		for j := int64(1); j < times; j++ {
			s := common.Sample{
				Value:     ts.Samples[i-1].Value + unitDiff*float64(j),
				Timestamp: ts.Samples[i-1].Timestamp + intervalSeconds*j,
			}
			newSamples = append(newSamples, s)
		}
		newSamples = append(newSamples, ts.Samples[i])
	}

	// Truncate samples of integral multiple of unit
	secondsPerUnit := int64(unit.Seconds())
	samplesPerUnit := int(secondsPerUnit / intervalSeconds)
	beginIndex := len(newSamples)
	for beginIndex-samplesPerUnit >= 0 {
		beginIndex -= samplesPerUnit
	}

	ts.Samples = newSamples[beginIndex:]
	klog.Infof("fillMissingData处理完成,参数为 ts(len):%d,config:%v,unit:%v",len(ts.Samples),config,unit)
	return nil
}

func deTrend() error {
	return nil
}

func removeExtremeOutliers(ts *common.TimeSeries) error {
	values := make([]float64, len(ts.Samples))
	for i := 0; i < len(ts.Samples); i++ {
		values[i] = ts.Samples[i].Value
	}

	var highThreshold, lowThreshold float64
	var err error
	highThreshold, err = stats.Percentile(values, 99.9)
	if err != nil {
		return err
	}
	lowThreshold, err = stats.Percentile(values, 0.1)
	if err != nil {
		return err
	}

	for i := 1; i < len(ts.Samples); i++ {
		if ts.Samples[i].Value > highThreshold || ts.Samples[i].Value < lowThreshold {
			ts.Samples[i].Value = ts.Samples[i-1].Value
		}
	}
	return nil
}

func readaCsvFile(filename string) (*Signal, error) {
	buf, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	reader := csv.NewReader(bytes.NewBuffer(buf))
	records, _ := reader.ReadAll()
	var values []float64
	for i := 1; i < len(records); i++ {
		val, _ := strconv.ParseFloat(records[i][1], 64)
		values = append(values, val)

	}
	return &Signal{
		SampleRate: 1.0 / 60.0,
		Samples:    values,
	}, nil
}
func TestRemoveExtremeOutliers2p(t *testing.T) {
	var s, _ = readaCsvFile("test_data/input14.csv")
	if s == nil || len(s.Samples) == 0 {
		klog.Infof("读取测试数据失败 s.Samples is empty or invalid")
	}
	klog.Infof("测试数据的长度为 s.Samples length: %d", len(s.Samples))
	ts := &common.TimeSeries{
		Samples: make([]common.Sample, len(s.Samples)),
	}
	for i := 0; i < len(s.Samples); i++ {
		ts.Samples[i].Value = s.Samples[i]
	}
	klog.Infof("使用测试数据赋值后的长度为 ts.Samples length: %d", len(ts.Samples))
	klog.Infof("开始处理时间序列: 初始样本数量=%d", len(ts.Samples))
}

func preProcessTimeSeries(ts *common.TimeSeries, config *internalConfig, unit time.Duration) error {

	// var s, _ = readaCsvFile("test_data/input14.csv")
	// if s == nil || len(s.Samples) == 0 {
	// 	klog.Infof("读取测试数据失败 s.Samples is empty or invalid")
	// }
	// klog.Infof("测试数据的长度为 s.Samples length: %d", len(s.Samples))
	// ts := &common.TimeSeries{
	// 	Samples: make([]common.Sample, len(s.Samples)),
	// }
	// for i := 0; i < len(s.Samples); i++ {
	// 	ts.Samples[i].Value = s.Samples[i]
	// }
	// klog.Infof("使用测试数据赋值后的长度为 ts.Samples length: %d", len(ts.Samples))
	// klog.Infof("开始处理时间序列: 初始样本数量=%d", len(ts.Samples))
	var err error

	err = fillMissingData(ts, config, unit)
	if err != nil {
		klog.Errorf("fillMissingData 错误: %v", err)
		return err
	}
	klog.Infof("调用 fillMissingData 后样本数量=%d", len(ts.Samples))
	_ = deTrend()

	klog.Infof("调用 removeExtremeOutliers 前样本数量=%d", len(ts.Samples))
	_ = removeExtremeOutliers(ts)
	klog.Infof("调用 removeExtremeOutliers 后样本数量=%d", len(ts.Samples))
	return nil
}

func preProcessTimeSeriesList(tsList []*common.TimeSeries, config *internalConfig) ([]*common.TimeSeries, error) {
	// klog.Infof("开始预处理时间序列列表, 初始长度: %d", len(tsList)) // 打印输入列表的长度
	for _, ts := range tsList {
		// // 打印 TimeSeries 的 Labels
		// labels := []string{}
		// for _, label := range ts.Labels {
		// 	labels = append(labels, fmt.Sprintf("%s=%s", label.Name, label.Value))
		// }
		// klog.Infof("打印预处理前的时间序列[%d]: Labels={%s}", i, strings.Join(labels, ", "))
		// 打印 TimeSeries 的 Samples
		klog.Infof("开始预处理时间序列列表, 初始长度: %d", len(ts.Samples)) // 打印输入列表的长度
		// for j, sample := range ts.Samples {
		// 	// klog.Infof("打印预处理前时间序列[%d]的样本[%d]: Value=%.2f, Timestamp=%d", i, j, sample.Value, sample.Timestamp)
		// 	klog.Infof("开始预处理时间序列列表, 初始长度: %d", len(sample.)) // 打印输入列表的长度
		// }
	}

	var wg sync.WaitGroup

	n := len(tsList)
	wg.Add(n)
	tsCh := make(chan *common.TimeSeries, n)
	for i := range tsList {
		klog.Infof("预处理时间序列列表闭包函数前 tsList:",tsList[i]) // 打印输入列表的长度
		go func(ts *common.TimeSeries) {
			defer wg.Done()
			klog.Infof("预处理时间序列列表闭包函数内 ts:",ts) // 打印输入列表的长度
			if err := preProcessTimeSeries(ts, config, Hour); err != nil {
				klog.ErrorS(err, "Dsp failed to pre process time series.")
			} else {
				tsCh <- ts
			}
		}(tsList[i])
	}
	wg.Wait()
	close(tsCh)

	tsList = make([]*common.TimeSeries, 0, n)
	for ts := range tsCh {
		tsList = append(tsList, ts)
	}

	// klog.Infof("预处理完成后的时间序列列表长度: %d", len(tsList)) // 打印最终列表的长度
	// for i, ts := range tsList {
	// 	// 打印 TimeSeries 的 Labels
	// 	labels := []string{}
	// 	for _, label := range ts.Labels {
	// 		labels = append(labels, fmt.Sprintf("%s=%s", label.Name, label.Value))
	// 	}
	// 	klog.Infof("打印预处理后的时间序列[%d]: Labels={%s}", i, strings.Join(labels, ", "))
	// 	// 打印 TimeSeries 的 Samples
	// 	for j, sample := range ts.Samples {
	// 		klog.Infof("打印预处理后的时间序列[%d]的样本[%d]: Value=%.2f, Timestamp=%d", i, j, sample.Value, sample.Timestamp)
	// 	}
	// }
	for _, ts := range tsList {
		klog.Infof("预处理后的时间序列列表长度: %d", len(ts.Samples))
	}

	return tsList, nil
}
