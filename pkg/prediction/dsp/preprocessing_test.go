package dsp

import (
	"encoding/csv"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/components"
	"github.com/go-echarts/go-echarts/v2/opts"
	"github.com/gocrane/crane/pkg/common"
	"github.com/stretchr/testify/assert"
)

func TestRemoveExtremeOutliers2p12(t *testing.T) {
	// // 指定 CSV 文件路径
	// filename := "./test_data/input0.csv"

	// var results []*common.TimeSeries

	// // 打开 CSV 文件
	// file, err := os.Open(filename)
	// if err != nil {
	// 	fmt.Errorf("failed to open file: %v", err)
	// }
	// defer file.Close()

	// // 创建 CSV reader
	// reader := csv.NewReader(file)
	// // 读取 CSV 内容
	// records, err := reader.ReadAll()
	// if err != nil {
	// 	fmt.Errorf("failed to read CSV: %v", err)
	// }

	// // 检查记录是否足够
	// if len(records) < 2 {
	// 	t.Fatalf("CSV file does not have enough rows (need at least a header and one data row)")
	// }

	// // 创建单一的 TimeSeries 对象
	// tsObj := common.NewTimeSeries()

	// // 假设使用一个固定的标签
	// tsObj.AppendLabel("", "")

	// // 解析数据并添加到 TimeSeries
	// for _, record := range records[1:] { // 跳过头行
	// 	tsStr := record[0]
	// 	valueStr := record[1]

	// 	// 解析时间戳和数值
	// 	ts, err := strconv.ParseInt(tsStr, 10, 64)
	// 	if err != nil {
	// 		t.Fatalf("failed to parse timestamp %v: %v", tsStr, err)
	// 	}

	// 	value, err := strconv.ParseFloat(valueStr, 64)
	// 	if err != nil {
	// 		t.Fatalf("failed to parse value %v: %v", valueStr, err)
	// 	}

	// 	// 将样本添加到 TimeSeries 的 Samples
	// 	tsObj.AppendSample(ts, value)
	// }

	// // // 打印 TimeSeries 数据
	// // fmt.Printf("TimeSeries: %+v\n", tsObj)
	// // fmt.Printf("Number of Samples: %d\n", len(tsObj.Samples))

	// results = append(results, tsObj)
	// // 打印 TimeSeries 数据
	// for _, ts := range results {
	// 	// fmt.Printf("TimeSeries: %+v\n", ts)
	// 	fmt.Printf("TimeSeries: %d\n", len(ts.Samples))
	// }

	// 指定 CSV 文件网络地址
	url := "http://119.167.151.67/crane/input0.csv"

	var results []*common.TimeSeries

	// 从网络下载 CSV 文件
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("failed to fetch file from URL: %v", err)
	}
	defer resp.Body.Close()

	// 检查 HTTP 响应状态
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("failed to fetch file, HTTP status: %s", resp.Status)
	}

	// 创建 CSV reader
	reader := csv.NewReader(resp.Body)
	// 读取 CSV 内容
	records, err := reader.ReadAll()
	if err != nil {
		t.Fatalf("failed to read CSV: %v", err)
	}

	// 检查记录是否足够
	if len(records) < 2 {
		t.Fatalf("CSV file does not have enough rows (need at least a header and one data row)")
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
			t.Fatalf("failed to parse timestamp %v: %v", tsStr, err)
		}

		value, err := strconv.ParseFloat(valueStr, 64)
		if err != nil {
			t.Fatalf("failed to parse value %v: %v", valueStr, err)
		}

		// 将样本添加到 TimeSeries 的 Samples
		tsObj.AppendSample(ts, value)
	}

	// 添加到结果集合
	results = append(results, tsObj)

	// 打印 TimeSeries 数据
	for _, ts := range results {
		fmt.Printf("TimeSeries: %d\n", len(ts.Samples))
	}
}

// func TestRemoveExtremeOutliers2p1(t *testing.T) {
// 	var s, _ = readaCsvFile("test_data/input14.csv")
// 	if s == nil || len(s.Samples) == 0 {
// 		fmt.Printf("读取测试数据失败 s.Samples is empty or invalid")
// 	}
// 	fmt.Printf("测试数据的长度为 s.Samples length: %d", len(s.Samples))
// 	ts := &common.TimeSeries{
// 		Samples: make([]common.Sample, len(s.Samples)),
// 	}
// 	for i := 0; i < len(s.Samples); i++ {
// 		ts.Samples[i] = common.Sample{
// 			Value:     s.Samples[i],
// 			Timestamp: s.T
// 		}
// 	}
// 	fmt.Printf("使用测试数据赋值后的长度为 ts.Samples length: %d", len(ts.Samples))
// 	fmt.Printf("开始处理时间序列: 初始样本数量=%d", len(ts.Samples))
// 	// 打印 ts 的内容
// 	fmt.Printf("ts 内容: %+v\n", ts)
// }

func TestRemoveExtremeOutliers(t *testing.T) {
	n := 10080

	ts := &common.TimeSeries{
		Samples: make([]common.Sample, n),
	}

	rand.Seed(time.Now().UnixNano())
	for i := 0; i < n; i++ {
		ts.Samples[i] = common.Sample{
			Value: rand.Float64(),
		}
	}

	ts.Samples[1000].Value = 3.5
	ts.Samples[3000].Value = -1
	ts.Samples[8000].Value = 1000

	_ = removeExtremeOutliers(ts)

	assert.Equal(t, ts.Samples[999].Value, ts.Samples[1000].Value)
	assert.Equal(t, ts.Samples[2999].Value, ts.Samples[3000].Value)
	assert.Equal(t, ts.Samples[7999].Value, ts.Samples[8000].Value)
}

func TestRemoveExtremeOutliers2(t *testing.T) {
	var s, _ = readCsvFile("test_data/input14.csv")
	fmt.Println("xxxx")
	// 打印 s 的值
	fmt.Printf("s: %+v\n", s) // 使用 %+v 格式化输出结构体内容
	origLine := s.Plot("green")

	ts := &common.TimeSeries{
		Samples: make([]common.Sample, len(s.Samples)),
	}
	for i := 0; i < len(s.Samples); i++ {
		ts.Samples[i].Value = s.Samples[i]
	}
	_ = removeExtremeOutliers(ts)
	xAxis := make([]int, 0)
	yAxis := make([]opts.LineData, 0)
	for i := range ts.Samples {
		xAxis = append(xAxis, i)
		yAxis = append(yAxis, opts.LineData{Value: ts.Samples[i].Value, Symbol: "cycle"})
	}
	line := charts.NewLine()
	line.SetXAxis(xAxis).AddSeries("", yAxis)

	origLine.Overlap(line)
	/*
			Uncomment code below to see what the original signal and the one after
		    getting removed outliers look like
	*/
	http.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		page := components.NewPage()
		page.AddCharts(origLine)
		page.Render(w)
	})
	fmt.Println("Open your browser and access 'http://localhost:7001'")
	http.ListenAndServe(":7001", nil)
}
