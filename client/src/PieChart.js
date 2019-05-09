import { Pie, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Pie,
  mixins: [reactiveProp],
  props: ['options'],
  mounted () {
    let options = {
      legend: {
        display: false
      },
      layout: {
        padding: {
          left: 100,
          right: 100,
          top: 0,
          bottom: 0
        }
      },
      tooltips: {
        displayColors: false,
        backgroundColor: '#ffffff',
        bodyFontColor: '#03A9F4',
        cornerRadius: 8
      }
    }
    this.renderChart(this.chartData, options)
  }
}
