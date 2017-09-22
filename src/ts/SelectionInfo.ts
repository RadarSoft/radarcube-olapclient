namespace RadarSoft {
    export class SelectionInfo {
        charts: Chart[];
        active: boolean;
        firstCell: CellCoordinates;
        firstPoint: Position;
        chartManager: ChartManager;

        constructor(chartManager: ChartManager) {
            this.chartManager = chartManager;
            this.firstPoint = new Position(0, 0);
            this.firstCell = new CellCoordinates(1, 1);
            this.active = false;
            this.charts = [];
        }

        Update(args: any) {
            if (args.firstCell)
                this.firstCell = args.firstCell;

            var chart = args.chart;
            if (chart) {
                var i;
                for (i = 0; i < this.charts.length; i++) {
                    var layer = this.charts[i].glassLayer;
                    layer.Clear();
                }

                this.charts.length = 0;

                var minCol = this.firstCell.col <= chart.column ? this.firstCell.col : chart.column;
                var maxCol = this.firstCell.col >= chart.column ? this.firstCell.col : chart.column;
                var minRow = this.firstCell.row <= chart.row ? this.firstCell.row : chart.row;
                var maxRow = this.firstCell.row >= chart.row ? this.firstCell.row : chart.row;

                var selectedCharts;
                for (i = minCol; i <= maxCol; i++) {
                    for (var j = minRow; j <= maxRow; j++) {
                        selectedCharts = this.chartManager.getChartsInCell(i, j);
                        for (var k = 0; k < selectedCharts.length; k++) {
                            if (this.charts.indexOf(selectedCharts[k]) < 0) {
                                this.charts.push(selectedCharts[k]);
                            }
                        }
                    }
                }

                //		if (this.charts.indexOf(chart) < 0) {
                //			this.charts.push(chart);
                //		}

            }

            if (args.active) {
                this.active = args.active;
            }
            if (args.firstPoint) {
                this.firstPoint = args.firstPoint;
            }
        }

        Deactivate() {
            this.active = false;
        }

        Activate(x: number, y: number, col: number, row: number) {
            this.active = true;
            this.charts = [];
            this.firstPoint = new Position(y, x);
            this.firstCell = new CellCoordinates(col, row);
        }
    }
}