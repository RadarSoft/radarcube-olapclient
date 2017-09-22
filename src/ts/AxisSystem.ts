namespace RadarSoft {
    export class AxisSystem {
        parent: AxisSystem;
        autoScaleDimension: boolean;
        autoScaleMeasure: boolean;
        visible: boolean;
        series: DataFunction[];
        id: string;
        layer: Layer;
        IsDimensionAttached: boolean;
        IsMeasureAttached: boolean;
        attachedDimension: AxisCore;
        attachedMeasure: AxisCore;
        yPositionRight: Position;
        yPositionLeft: Position;
        xPositionBottom: Position;
        xPositionTop: Position;
        ySize: Size;
        xSize: Size;
        measureOrientation: Orientation;
        dimensionAxis: AxisCore;
        measureAxis: AxisCore;
        chart: Chart;
        chartManager: ChartManager;


        constructor(measureAxisOrientation: Orientation, chart: Chart, id: string) {
            this.chartManager = chart.chartManager;
            this.chart = chart;
            this.measureAxis = null;
            this.dimensionAxis = null;
            this.measureOrientation = measureAxisOrientation;
            this.xSize = new Size(0, 0);
            this.ySize = new Size(0, 0);
            this.xPositionTop = new Position(0, 0);
            this.xPositionBottom = new Position(0, 0);
            this.yPositionLeft = new Position(0, 0);
            this.yPositionRight = new Position(0, 0);
            this.attachedMeasure = null;
            this.attachedDimension = null;
            this.IsMeasureAttached = false;
            this.IsDimensionAttached = false;
            this.layer = null;
            this.id = id;
            this.series = [];
            this.visible = true;
            this.autoScaleMeasure = true;
            this.autoScaleDimension = true;
            this.parent = null;
        }

        SetFixedMeasure(measures: any) {
            if (this.parent) {
                return;
            }
            if (this.measureAxis) {
                this.measureAxis.SetMarks(measures);
                var min = this.measureAxis.min();
                var max = this.measureAxis.max();
                this.measureAxis.CorrectScale(max, min);
            }
            this.autoScaleMeasure = false;
        }

        SetFixedDimension(dimensions: any) {
            if (this.parent) {
                return;
            }
            if (this.dimensionAxis) {
                this.dimensionAxis.SetMarks(dimensions);
                var min = this.dimensionAxis.min();
                var max = this.dimensionAxis.max();
                this.dimensionAxis.CorrectScale(max, min);
            }
            this.autoScaleDimension = false;
        }

        IsVisible(): boolean {
            if (this.parent) {
                return this.parent.IsVisible();
            }
            return this.visible;
        }

        GetId(): string {
            if (this.parent) {
                return this.parent.GetId();
            }
            return this.id;
        }

        Hide() {
            if (this.parent) {
                return;
            }

            if (this.measureAxis) {
                this.measureAxis.Hide();
            }
            if (this.dimensionAxis) {
                this.dimensionAxis.Hide();
            }
            this.visible = false;
        }

        Show() {
            if (this.parent) {
                return;
            }

            if (this.measureAxis) {
                this.measureAxis.Show();
            }
            if (this.dimensionAxis) {
                this.dimensionAxis.Show();
            }
            this.visible = true;
        }

        GetDimensionName() {
            return this.GetDimensionAxis().descriptor.name;
        }

        GetMeasureName() {
            return this.GetMeasureAxis().descriptor.name;
        }

        GetSeries() {
            return this.series;
        }

        GroupPoints() {
            var groups: any[] = [];
            for (var i = 0; i < this.series.length; i++) {
                var func = this.series[i];
                for (var k = 0; k < func.points.length; k++) {
                    var pnt = func.points[k];
                    if (!groups[pnt.dimension]) {
                        groups[pnt.dimension] = [];
                    }
                    groups[pnt.dimension].push(pnt);
                }
            }
            return groups;
        }

        GetColumnWidth(): number {
            if (this.parent) {
                return this.parent.GetColumnWidth();
            }
            var res = this.GetAxisX().getColumnWidth();
            return res;
        }

        GetRowHeight(): number {
            if (this.parent) {
                return this.parent.GetRowHeight();
            }
            var res = this.GetAxisY().getRowHeight();
            return res;
        }

        AddSeries(series: DataFunction) {
            this.series.push(series);
            series.axisSystemID = this.id;
        }

        GetPointPosition(pnt: DataPoint) {
            var pos = new Position(0, 0);
            var measure = pnt.measure;
            var dimension = pnt.dimension;
            switch (this.parent ? this.parent.chart.type : this.chart.type) {
            case ChartTypes.deltaSpline:
            case ChartTypes.deltaBar:
            case ChartTypes.deltaArea:
                var groups = this.GroupPoints();
                if (groups[dimension]) {
                    var points = groups[dimension];
                    var ind = points.indexOf(pnt);
                    for (var h = 0; h < ind; h++) {
                        measure += points[h].measure;
                    }
                }
                break;
            case ChartTypes.percentSpline:
            case ChartTypes.percentArea:
            case ChartTypes.percentBar:
                var groups = this.GroupPoints();
                if (groups[dimension]) {
                    var total = 0;
                    var points = groups[dimension];
                    var ind = points.indexOf(pnt);
                    var used = 0;

                    for (var h = 0; h < ind; h++) {
                        used += points[h].measure;
                    }

                    for (var h = 0; h < points.length; h++) {
                        total += points[h].measure;
                    }

                    var percent = (pnt.measure + used) / total;
                    var axis = this.GetMeasureAxis();
                    measure = Math.abs(axis.max()) * percent;
                }
                break;
            default:
                break;
            }

            switch (this.parent ? this.parent.measureOrientation
                : this.measureOrientation) {
            case Orientation.verticalOrientation:
                pos.top = this.GetMeasureCoord(measure);
                pos.left = this.GetDimensionCoord(dimension);
                break;
            case Orientation.horizontalOrientation:
                pos.left = this.GetMeasureCoord(measure);
                pos.top = this.GetDimensionCoord(dimension);
                break;
            }

            return pos;
        }

        setMeasureType(newType: AxisType) {
            if (this.parent) {
                return;
            }
            var descriptor = cpy(this.measureAxis.descriptor);
            switch (newType) {
            case AxisType.discretePercentAxis:
                this.measureAxis = new DiscretePercentAxisCore(
                    descriptor);
                break;
            case AxisType.discreteAxis:
                this.measureAxis = new DiscreteAxisCore(descriptor);
                break;
            case AxisType.infinityAxis:
                this.measureAxis = new InfinityAxisCore(descriptor);
                break;
            }
        }

        SetMeasureView(usePercent: boolean) {
            if (this.parent) {
                return;
            }

            if (this.IsMeasureAttached)
                return;
            var newType = 0;
            switch (this.measureAxis.descriptor.type) {
            case AxisType.discreteAxis:
            case AxisType.discretePercentAxis:
                if (usePercent) {
                    newType = AxisType.discretePercentAxis;
                } else {
                    newType = AxisType.discreteAxis;
                }
                break;
            case AxisType.infinityAxis:
                newType = AxisType.infinityAxis;
                break;
            }
            this.setMeasureType(newType);
        }

        CorrectScale() {
            this.CorrectMeasureScale();
            this.CorrectDimensionScale();
        }

        CorrectDimensionScale() {
            if (this.parent) {
                return;
            }
            if (!this.autoScaleDimension) {
                return;
            }
            var dAx = this.GetDimensionAxis();

            var oldMinD = dAx.min();
            var oldMaxD = dAx.max();

            var minD = oldMaxD;
            var maxD = oldMinD;

            var groups = this.GroupPoints();
            var dimensions = this.GetDimensionAxis().GetMarks();
            for (var j = 0; j < dimensions.length; j++) {
                var dimension = dimensions[j];
                if (groups[dimension]) {
                    var points = groups[dimension];

                    for (var k = points.length - 1; k >= 0; k--) {
                        var pnt = points[k];
                        var dim = pnt.dimension;
                        if (minD > dim) {
                            minD = dim;
                        }
                        if (maxD < dim) {
                            maxD = dim;
                        }
                    }
                }
            }

            if ((oldMaxD <= maxD) || (oldMinD >= minD)) {
                if (dAx == this.dimensionAxis) {
                    dAx.CorrectScale(maxD, minD);
                }
            }
        }

        CorrectMeasureScale() {
            if (this.parent) {
                return;
            }
            if (!this.autoScaleMeasure) {
                return;
            }
            var mAx = this.GetMeasureAxis();

            var oldMaxM = mAx.max();
            var oldMinM = mAx.min();
            var maxM = oldMaxM;
            var minM = oldMinM;
            var groups = this.GroupPoints();
            var dimensions = this.GetDimensionAxis().GetMarks();
            for (var j = 0; j < dimensions.length; j++) {
                var dimension = dimensions[j];
                if (groups[dimension]) {
                    var points = groups[dimension];

                    for (var k = points.length - 1; k >= 0; k--) {
                        var pnt = points[k];
                        var dim = pnt.dimension;
                        var measure = pnt.measure;
                        switch (this.chart.type) {
                        case ChartTypes.deltaSpline:
                        case ChartTypes.deltaBar:
                        case ChartTypes.deltaArea:
                            if (groups[dimension]) {
                                var pnts = groups[dimension];
                                var ind = pnts.indexOf(pnt);
                                for (var h = 0; h < ind; h++) {
                                    measure += pnts[h].measure;
                                }
                            }
                            break;
                        }

                        if (maxM < measure) {
                            maxM = measure;
                        }
                        if (minM > measure) {
                            minM = measure;
                        }
                    }
                }
            }

            if ((oldMaxM <= maxM) || (oldMinM >= minM) || (oldMaxM > maxM * 1.2)
                || (oldMinM < minM * 1.2)) {
                if (mAx == this.measureAxis) {
                    mAx.CorrectScale(maxM, minM);
                }
            }
        }

        ForceCorrectDimensionScale() {
            var autoScaleDimension = this.autoScaleDimension;
            this.autoScaleDimension = true;
            this.CorrectDimensionScale();
            this.autoScaleDimension = autoScaleDimension;
        }

        ForceCorrectMeasureScale() {
            var autoScaleMeasure = this.autoScaleMeasure;
            this.autoScaleMeasure = true;
            this.CorrectMeasureScale();
            this.autoScaleMeasure = autoScaleMeasure;
        }

        ForceCorrectScale() {
            this.ForceCorrectMeasureScale();
            this.ForceCorrectDimensionScale();
        }

        GetAxisY(): AxisCore {
            if (this.parent) {
                return this.parent.GetAxisY();
            }
            var axis: AxisCore;
            switch (this.measureOrientation) {
                case Orientation.horizontalOrientation:
                axis = this.GetDimensionAxis();
                break;
                case Orientation.verticalOrientation:
                axis = this.GetMeasureAxis();
                break;
            }

            return axis;
        }

        GetAxisX(): AxisCore {
            if (this.parent) {
                return this.parent.GetAxisX();
            }
            var axis: AxisCore;
            switch (this.measureOrientation) {
                case Orientation.horizontalOrientation:
                axis = this.GetMeasureAxis();
                break;
            case Orientation.verticalOrientation:
                axis = this.GetDimensionAxis();
                break;
            }

            return axis;
        }

        GetMeasureAxis(): AxisCore {
            if (this.parent) {
                return this.parent.GetMeasureAxis();
            }
            var axis = this.measureAxis ? this.measureAxis : this.attachedMeasure;
            return axis;
        }

        GetDimensionAxis(): AxisCore {
            if (this.parent) {
                return this.parent.GetDimensionAxis();
            }
            var axis = this.dimensionAxis ? this.dimensionAxis : this.attachedDimension;
            return axis;
        }

        SetPercentUsage(usePercents: boolean) {
            if (this.parent) {
                return;
            }
            if (!this.IsMeasureAttached) {
                this.SetMeasureView(usePercents);
            }
        }

        SetOrientation(measureOrientation: Orientation) {
            if (this.parent) {
                return;
            }
            var XDock = null;
            var YDock = null;

            switch (this.measureOrientation) {
            case Orientation.horizontalOrientation:
                XDock = this.GetMeasureAxis().descriptor.dock;
                YDock = this.GetDimensionAxis().descriptor.dock;
                break;
            case Orientation.verticalOrientation:
                YDock = this.GetMeasureAxis().descriptor.dock;
                XDock = this.GetDimensionAxis().descriptor.dock;
                break;
            }

            this.measureOrientation = measureOrientation;
            switch (measureOrientation) {
            case Orientation.horizontalOrientation:
                if (this.measureAxis) {
                    this.measureAxis.SetOrientation(Orientation.horizontalOrientation);
                    this.measureAxis.SetSize(this.xSize);
                }
                if (this.dimensionAxis) {
                    this.dimensionAxis.SetOrientation(Orientation.verticalOrientation);
                    this.dimensionAxis.SetSize(this.ySize);
                }
                break;
            case Orientation.verticalOrientation:
                if (this.dimensionAxis) {
                    this.dimensionAxis.SetOrientation(Orientation.horizontalOrientation);
                    this.dimensionAxis.SetSize(this.xSize);
                }
                if (this.measureAxis) {
                    this.measureAxis.SetOrientation(Orientation.verticalOrientation);
                    this.measureAxis.SetSize(this.ySize);
                }
                break;
            }
            this.SetXDock(XDock);
            this.SetYDock(YDock);
        }

        GetY(val: string | number): number {
            if (this.parent) {
                return this.parent.GetY(val);
            }
            var res = 0;
            if (this.measureOrientation == Orientation.horizontalOrientation) {
                res = this.GetDimensionCoord(val);
            } else {
                res = this.GetMeasureCoord(val);
            }
            return res;
        }

        GetX(val: string | number): number {
            if (this.parent) {
                return this.parent.GetX(val);
            }
            var res = 0;
            if (this.measureOrientation == Orientation.verticalOrientation) {
                res = this.GetDimensionCoord(val);
            } else {
                res = this.GetMeasureCoord(val);
            }
            return res;
        }

        GetDimensionCoord(val: string|number): number {
            if (this.parent) {
                return this.parent.GetDimensionCoord(val);
            }
            var res = 0;
            if (this.dimensionAxis) {
                res = this.dimensionAxis.getCanvasValue(val);
            } else {
                res = this.attachedDimension.getCanvasValue(val);
            }
            return res;
        }

        GetMeasureCoord(val: string | number): number {
            if (this.parent) {
                return this.parent.GetMeasureCoord(val);
            }
            var res = 0;
            if (this.measureAxis) {
                res = this.measureAxis.getCanvasValue(val);
            } else {
                res = this.attachedMeasure.getCanvasValue(val);
            }
            return res;
        }

        AttachDimensionAxis(dimensionAxis: AxisCore) {
            if (this.parent) {
                return;
            }
            this.attachedDimension = dimensionAxis;
            this.IsDimensionAttached = true;
        }

        AttachMeasureAxis(measureAxis: AxisCore) {
            if (this.parent) {
                return;
            }
            this.attachedMeasure = measureAxis;
            this.IsMeasureAttached = true;
        }

        CreateDimensionAxis(type: AxisType, markerSize: number, marks: string[],
            brush: Brush, font: FontProperties, margin: number, name: string, title: string,
            chartManager: ChartManager) {
            if (this.parent) {
                return;
            }
            var lyt = Orientation.horizontalOrientation;
            if (lyt == this.measureOrientation) {
                lyt = Orientation.verticalOrientation;
            }
            var axis: AxisCore;
            var descriptor = new AxisDescriptor(type, lyt, markerSize,
                marks, brush, font, margin, name ? name : "dimension", title);
            switch (type) {
            case AxisType.discretePercentAxis:
                axis = new DiscretePercentAxisCore(descriptor);
                break;
            case AxisType.discreteAxis:
                axis = new DiscreteAxisCore(chartManager, descriptor);
                break;
            case AxisType.infinityAxis:
                axis = new InfinityAxisCore(chartManager, descriptor);
                break;
            }
            axis.SetSize(this.xSize);
            axis.SetPosition(this.xPositionBottom);
            this.dimensionAxis = axis;
            this.IsDimensionAttached = false;
            axis.SetLayer(this.layer);
        }

        CreateMeasureAxis(type: AxisType,
            markerSize: any,
            marks: any[],
            brush: Brush,
            font: FontProperties,
            margin: number,
            name: string,
            title: string,
            p8?: any) {
            if (this.parent) {
                return;
            }
            var axis:AxisCore;
            var descriptor = new AxisDescriptor(type,
                this.measureOrientation, markerSize, marks, brush, font, margin,
                name ? name : "measure", title);
            switch (type) {
            case AxisType.discretePercentAxis:
                axis = new DiscretePercentAxisCore(descriptor);
                break;
            case AxisType.discreteAxis:
                axis = new DiscreteAxisCore(this.chartManager, descriptor);
                break;
            case AxisType.infinityAxis:
                axis = new InfinityAxisCore(this.chartManager, descriptor);
                break;
            }

            axis.SetSize(this.ySize);
            axis.SetPosition(this.yPositionLeft);
            axis.SetLayer(this.layer);
            this.measureAxis = axis;
            this.IsMeasureAttached = false;
        }

        IsAttachedY(): boolean {
            if (this.parent) {
                return this.parent.IsAttachedY();
            }
            return (this.GetAxisY() == this.attachedMeasure)
                || (this.GetAxisY() == this.attachedDimension);
        }

        IsAttachedX(): boolean {
            if (this.parent) {
                return this.parent.IsAttachedX();
            }
            return (this.GetAxisX() == this.attachedMeasure)
                || (this.GetAxisX() == this.attachedDimension);
        }

        SetYDock(dockStyle: DockStyle) {
            if (this.parent) {
                return;
            }
            var axis = this.GetAxisY();
            if (axis == this.measureAxis || axis == this.dimensionAxis) {
                switch (dockStyle) {
                case DockStyle.left:
                    axis.descriptor.dock = dockStyle;
                    axis.SetPosition(this.yPositionLeft);
                    break;
                case DockStyle.right:
                    axis.descriptor.dock = dockStyle;
                    axis.SetPosition(this.yPositionRight);
                    break;
                }
            }
        }

        SetXDock(dockStyle: DockStyle) {
            if (this.parent) {
                return;
            }
            var axis = this.GetAxisX();
            if (axis == this.measureAxis || axis == this.dimensionAxis) {
                switch (dockStyle) {
                case DockStyle.top:
                    axis.descriptor.dock = dockStyle;
                    axis.SetPosition(this.xPositionTop);
                    break;
                case DockStyle.bottom:
                    axis.descriptor.dock = dockStyle;
                    axis.SetPosition(this.xPositionBottom);
                    break;
                }
            }
        }
    }
}