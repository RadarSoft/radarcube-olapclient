namespace RadarSoft {
    export class DataFunction {
        axisSystemID: string;
        name: string;
        points: DataPoint[] = [];
        gradientBrush: GradientBrush;
        brush: Brush;
        sizeInfo: any;
        shapeInfo: any;

        constructor(brush?: Brush, gradientBrush?: GradientBrush, points?: DataPoint[], name?: string, axisSystemID?: string) {
            this.brush = brush;
            this.gradientBrush = gradientBrush;
            if (points != null)
                this.points = points;
            this.name = name;
            this.axisSystemID = axisSystemID;
        }
    }
}