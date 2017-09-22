namespace RadarSoft {
    export class SelectableObject extends DrawableObject {
        oldGrd: GradientBrush;
        oldFont: any;
        oldBrush: Brush;
        isSelected: boolean;

        constructor(descriptor: Descriptor) {
            super(descriptor);
            this.isSelected = false;
        }

        Unselect(layer: Layer) {
            if (this.isSelected) {
                if (this.descriptor) {
                    if (this.descriptor.brush) {
                        this.descriptor.brush = this.oldBrush;
                    }

                    if (this.descriptor.font) {
                        this.descriptor.font = this.oldFont;
                    }

                    if (this.descriptor.gradientBrush) {
                        this.descriptor.gradientBrush = this.oldGrd;
                    }

                    this.isSelected = false;
                }
            }

            if (!layer) {
                if (this.layer) {
                    this.Draw(this.layer);
                }
            }
        }

        Select(layer: Layer) {
            if (!this.isSelected) {
                if (this.descriptor) {
                    if (this.descriptor.brush) {
                        this.oldBrush = this.descriptor.brush;
                        this.descriptor.brush.strokeStyle = "gray";
                        this.descriptor.brush.fillStyle = "gray";
                    }

                    if (this.descriptor.font) {
                        this.oldFont = this.descriptor.font;
                        this.descriptor.font.brush.fillStyle = "gray";
                        this.descriptor.font.brush.strokeStyle = "gray";
                    }

                    if (this.descriptor.gradientBrush) {
                        this.oldGrd = this.descriptor.gradientBrush;
                        this.descriptor.gradientBrush.firstColorStop.color = "gray";
                        this.descriptor.gradientBrush.secondColorStop.color = "white";
                    }
                }

                this.isSelected = true;
            }

            if (layer) {
                this.Draw(layer);
            } else if (this.layer) {
                this.Draw(this.layer);
            }
        }
    }
}