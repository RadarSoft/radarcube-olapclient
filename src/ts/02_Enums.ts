namespace RadarSoft {
    export enum CellType {
        /// <summary>
        /// A real interface for this object is IDataCell. 
        /// </summary>
        data = 0,
        /// <summary>
        /// A real interface for this object is IMemberCell. 
        /// </summary>
        member = 1,
        /// <summary>
        /// A real interface for this object is ILevelCell. 
        /// </summary>
        level = 2,
        /// <summary>
        /// A real interface for this object is ICell. 
        /// </summary>
        none = 3,
        chart = 4
    }

    export enum cFormat {
        cfBelowThan = 0,
        cfMoreThan = 1,
        cfBelowAverage = 2,
        cfMoreAverage = 3,
        cfNearAvarage = 4,
        cfFarAverage = 5,
        none = 6
    }

    export enum ChartTypes {
        spline = 0,
        points = 1,
        deltaBar = 2,
        bar = 3,
        area = 4,
        deltaSpline = 5,
        deltaArea = 6,
        percentBar = 7,
        percentArea = 8,
        percentSpline = 9,
        pie = 10,
        polyLine = 11,
        stepLine = 12
    }

    export enum ServerChartTypes {
        Scatter = 0,
        Line = 1,
        Column = 2,
        Bar = 3,
        Spline = 4,
        Pie = 5,
        Step = 6,
        Area = 7,
        StackedArea = 8,
        StackedBar = 9,
        StackedColumn = 10,
        StackedLine = 11,
        StackedArea100 = 12,
        StackedBar100 = 13,
        StackedColumn100 = 14,
        StackedLine100 = 15
    }

    export enum DockStyle {
        left = 0,
        right = 1,
        top = 3,
        bottom = 4
    }

    export enum Orientation {
        horizontalOrientation = 0,
        verticalOrientation = 1
    }

    export enum AxisType {
        discreteAxis = 0,
        infinityAxis = 1,
        discretePercentAxis = 3
    }

    export enum LegendTypes {
        line = 0,
        cercle = 1,
        sector = 2,
        bar = 3
    }

    export enum GubeElement {
        measure = 0,
        hierarchy = 1,
        member = 2,
        level = 3
    }

    export enum pointTypes {
        circle = 0,
        triangle = 1,
        square = 2,
        pentagon = 3,
        hexagon = 4,
        reverseTriangle = 5,
        concentricCircle = 6
    }

    export enum TrendType {
        noTrends,
        linTrend,
        quadTrend,
        cubicTrend
    }

    export enum MenuLayout {
        vertical,
        horizontal
    }

}
