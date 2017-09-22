namespace RadarSoft {
    export class Descriptor {
        name: string;
        useShadow: boolean;
        visible: boolean;
        gradientBrush: GradientBrush;
        font: FontProperties;
        brush: Brush;
        size: Size;
        position: Position;
        type: AxisType;
        title: string;
        marks: string[];
        dock: DockStyle;
        markerSize: number;
        margin: number;
        titleMargin: number;
        orientation: Orientation;

        constructor(position?: Position, size?: Size, brush?: Brush, font?: FontProperties, gradient?: GradientBrush, useShadow?: boolean) {
            this.position = position ? cpy(position) : new Position();
            this.size = size ? cpy(size) : new Size();
            this.brush = brush ? cpy(brush) : new Brush();
            //this.font = font ? cpy(font) : new FontProperties();
            this.font = font ? font : new FontProperties();
            this.gradientBrush = gradient ? cpy(gradient) : null;
            this.visible = true;
            this.useShadow = useShadow ? useShadow : false;
        }

        SetMarks(marks: any) {
            this.marks = marks;
        }

        sortAsc(a: string, b: string):number {
            return 0;
        }

        sortDesc(a: string, b: string): number {
            return 0;
        }
    }
}