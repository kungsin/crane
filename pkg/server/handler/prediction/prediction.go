package prediction

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/components"
	"github.com/go-echarts/go-echarts/v2/opts"
	"github.com/go-echarts/go-echarts/v2/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/scale"
	"k8s.io/klog/v2"

	craneclientset "github.com/gocrane/api/pkg/generated/clientset/versioned"
	"github.com/gocrane/api/prediction/v1alpha1"

	"github.com/gocrane/crane/pkg/controller/timeseriesprediction"
	"github.com/gocrane/crane/pkg/prediction/dsp"
	predictormgr "github.com/gocrane/crane/pkg/predictor"
	"github.com/gocrane/crane/pkg/server/config"
	"github.com/gocrane/crane/pkg/server/ginwrapper"
	"github.com/gocrane/crane/pkg/utils/target"
)

type DebugHandler struct {
	craneClient      *craneclientset.Clientset
	predictorManager predictormgr.Manager
	selectorFetcher  target.SelectorFetcher
}

type ContextKey string

var (
	PredictorManagerKey ContextKey = "predictorManager"
	SelectorFetcherKey  ContextKey = "selectorFetcher"
)

func NewDebugHandler(config *config.Config) *DebugHandler {
	discoveryClientSet, err := discovery.NewDiscoveryClientForConfig(config.KubeConfig)
	if err != nil {
		klog.Exit(err, "Unable to create discover client")
	}

	scaleKindResolver := scale.NewDiscoveryScaleKindResolver(discoveryClientSet)
	scaleClient := scale.New(discoveryClientSet.RESTClient(), config.RestMapper, dynamic.LegacyAPIPathResolverFunc, scaleKindResolver)
	selectorFetcher := target.NewSelectorFetcher(config.Scheme, config.RestMapper, scaleClient, config.Client)

	return &DebugHandler{
		craneClient:      craneclientset.NewForConfigOrDie(config.KubeConfig),
		predictorManager: config.PredictorMgr,
		selectorFetcher:  selectorFetcher,
	}
}

func (dh *DebugHandler) Display(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("tsp")
	if len(namespace) == 0 || len(name) == 0 {
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}

	tsp, err := dh.craneClient.PredictionV1alpha1().TimeSeriesPredictions(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		ginwrapper.WriteResponse(c, err, nil)
		return
	}

	if len(tsp.Spec.PredictionMetrics) > 0 {
		if tsp.Spec.PredictionMetrics[0].Algorithm.AlgorithmType == v1alpha1.AlgorithmTypeDSP && tsp.Spec.PredictionMetrics[0].Algorithm.DSP != nil {
			mc, err := timeseriesprediction.NewMetricContext(dh.selectorFetcher, tsp, dh.predictorManager)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			internalConf := mc.ConvertApiMetric2InternalConfig(&tsp.Spec.PredictionMetrics[0])
			namer := mc.GetMetricNamer(&tsp.Spec.PredictionMetrics[0])
			pred := dh.predictorManager.GetPredictor(v1alpha1.AlgorithmTypeDSP)
			history, test, estimate, err := dsp.Debug(pred, namer, internalConf)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			page := components.NewPage()
			page.AddCharts(plot(history, "history", "green", charts.WithTitleOpts(opts.Title{Title: "history"})))
			page.AddCharts(plots([]*dsp.Signal{test, estimate}, []string{"actual", "forecasted"},
				charts.WithTitleOpts(opts.Title{Title: "actual/forecasted"})))
			err = page.Render(c.Writer)
			if err != nil {
				klog.ErrorS(err, "Failed to display debug time series")
			}

			return
		}
	}

	c.Writer.WriteHeader(http.StatusBadRequest)
	return
}

func (dh *DebugHandler) Display2(c *gin.Context) {
	namespace := c.Param("namespace")
	name := c.Param("tsp")
	if len(namespace) == 0 || len(name) == 0 {
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}

	tsp, err := dh.craneClient.PredictionV1alpha1().TimeSeriesPredictions(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		ginwrapper.WriteResponse(c, err, nil)
		return
	}

	if len(tsp.Spec.PredictionMetrics) > 0 {
		if tsp.Spec.PredictionMetrics[0].Algorithm.AlgorithmType == v1alpha1.AlgorithmTypeDSP && tsp.Spec.PredictionMetrics[0].Algorithm.DSP != nil {
			mc, err := timeseriesprediction.NewMetricContext(dh.selectorFetcher, tsp, dh.predictorManager)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			internalConf := mc.ConvertApiMetric2InternalConfig(&tsp.Spec.PredictionMetrics[0])
			namer := mc.GetMetricNamer(&tsp.Spec.PredictionMetrics[0])
			pred := dh.predictorManager.GetPredictor(v1alpha1.AlgorithmTypeDSP)
			history, test, estimate, err := dsp.Debug(pred, namer, internalConf)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			page := components.NewPage()
			page.AddCharts(plot(history, "history", "green", charts.WithTitleOpts(opts.Title{Title: "history"})))
			page.AddCharts(plots([]*dsp.Signal{test, estimate}, []string{"actual", "forecasted"},
				charts.WithTitleOpts(opts.Title{Title: "actual/forecasted"})))
			err = page.Render(c.Writer)
			if err != nil {
				klog.ErrorS(err, "Failed to display debug time series")
			}

			return
		}
	}

	c.Writer.WriteHeader(http.StatusBadRequest)
	return
}

func (dh *DebugHandler) Display3(c *gin.Context) {


	namespace := c.Param("namespace")
	name := c.Param("tsp")
	if len(namespace) == 0 || len(name) == 0 {
		c.Writer.WriteHeader(http.StatusBadRequest)
		return
	}

	tsp, err := dh.craneClient.PredictionV1alpha1().TimeSeriesPredictions(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		ginwrapper.WriteResponse(c, err, nil)
		return
	}

	if len(tsp.Spec.PredictionMetrics) > 0 {
	
			mc, err := timeseriesprediction.NewMetricContext(dh.selectorFetcher, tsp, dh.predictorManager)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			internalConf := mc.ConvertApiMetric2InternalConfig(&tsp.Spec.PredictionMetrics[0])
			namer := mc.GetMetricNamer(&tsp.Spec.PredictionMetrics[0])
			// pred := dh.predictorManager.GetPredictor(v1alpha1.AlgorithmTypeDSP)
			pred := dh.predictorManager.GetPredictor(v1alpha1.AlgorithmTypePercentile)
			history, test, estimate, err := dsp.Debug(pred, namer, internalConf)
			if err != nil {
				ginwrapper.WriteResponse(c, err, nil)
				return
			}

			page := components.NewPage()
			page.AddCharts(plot(history, "history", "green", charts.WithTitleOpts(opts.Title{Title: "history"})))
			page.AddCharts(plots([]*dsp.Signal{test, estimate}, []string{"actual", "forecasted"},
				charts.WithTitleOpts(opts.Title{Title: "actual/forecasted"})))
			err = page.Render(c.Writer)
			if err != nil {
				klog.ErrorS(err, "Failed to display debug time series")
			}

			return

	}

	c.Writer.WriteHeader(http.StatusBadRequest)
	return
}

func plot(s *dsp.Signal, name string, color string, o ...charts.GlobalOpts) *charts.Line {
	x := make([]string, 0)
	y := make([]opts.LineData, 0)
	for i := 0; i < s.Num(); i++ {
		x = append(x, fmt.Sprintf("%.1f", float64(i)/s.SampleRate))
		y = append(y, opts.LineData{Value: s.Samples[i], Symbol: "none"})
	}

	line := charts.NewLine()
	line.SetGlobalOptions(
		charts.WithInitializationOpts(opts.Initialization{Width: "3000px", Theme: types.ThemeRoma}),
		charts.WithLegendOpts(
			opts.Legend{
				Show: true,
				Data: name,
			}),
		charts.WithTooltipOpts(opts.Tooltip{
			Show:      true,
			Trigger:   "axis",
			TriggerOn: "mousemove",
		}),
		charts.WithTitleOpts(opts.Title{Title: s.String()}))
	if o != nil {
		line.SetGlobalOptions(o...)
	}
	line.SetXAxis(x).AddSeries(name, y, charts.WithLineStyleOpts(opts.LineStyle{Color: color}))

	return line
}

func plots(signals []*dsp.Signal, names []string, o ...charts.GlobalOpts) *charts.Line {
	if len(signals) < 1 {
		return nil
	}
	s := signals[0]
	n := signals[0].Num()
	x := make([]string, 0)
	y := make([][]opts.LineData, len(signals))
	for j := 0; j < len(signals); j++ {
		y[j] = make([]opts.LineData, 0)
	}
	for i := 0; i < n; i++ {
		x = append(x, fmt.Sprintf("%.1f", float64(i)/s.SampleRate))
		for j := 0; j < len(signals); j++ {
			y[j] = append(y[j], opts.LineData{Value: signals[j].Samples[i], Symbol: "none"})
		}
	}

	line := charts.NewLine()
	line.SetGlobalOptions(          
		charts.WithInitializationOpts(opts.Initialization{Width: "3000px", Theme: types.ThemeShine}),
		charts.WithLegendOpts(
			opts.Legend{
				Show: true,
				Data: names,
			}),
		charts.WithTooltipOpts(opts.Tooltip{
			Show:      true,
			Trigger:   "axis",
			TriggerOn: "mousemove",
		}))
	if o != nil {
		line.SetGlobalOptions(o...)
	}
	line.SetXAxis(x)
	for j := 0; j < len(signals); j++ {
		line.AddSeries(names[j], y[j], charts.WithAreaStyleOpts(
			opts.AreaStyle{
				Opacity: 0.1,
			}),
		)
	}
	return line
}
