namespace RadarSoft {
    export class ConditionFormating {
        privewClassPrefix: string;
        formatClassPrefix: string;
        FarAverageCoefs: number[];
        FarAverageCells: string[][];
        NearAvarageCoefs: number[];
        NearAvarageCells: string[][];
        MoreAverageCoefs: number[];
        MoreAverageCells: string[][];
        BelowAverageCoefs: number[];
        BelowAverageCells: string[][];
        MoreThanCoefs: number[];
        MoreThanCells: string[][];
        BelowThanCoefs: number[];
        BelowThanCells: string[][];
        grid: OlapGridBase;

        constructor(grid: OlapGridBase) {
            this.grid = grid;

            this.BelowThanCells = [];
            this.BelowThanCoefs = [];
            this.MoreThanCells = [];
            this.MoreThanCoefs = [];
            this.BelowAverageCells = [];
            this.BelowAverageCoefs = [];
            this.MoreAverageCells = [];
            this.MoreAverageCoefs = [];
            this.NearAvarageCells = [];
            this.NearAvarageCoefs = [];
            this.FarAverageCells = [];
            this.FarAverageCoefs = [];

            this.formatClassPrefix = "rs_cf_";
            this.privewClassPrefix = "rs_cf_preview_";

        }

        doFormat(cells: Array<any>, conditionFormat: cFormat, koef: number, isPreview: boolean) {
                if (Object.keys(cells).length === 0)
                    return;

                var selectedData = [];
                var selectedCsCells = [];
                var csCells = this.grid.getCellSet().Cells;
                for (var cellIndex in csCells) {
                    var csCell = csCells[cellIndex];

                    if (csCell.CellType !== CellType.data || csCell.Data === null) // || cell.IsTotal == true)
                        continue;

                    if (csCell.CellIndex in cells) {
                        selectedData.push(csCell.Data);
                        selectedCsCells[csCell.CellIndex] = csCell;
                    }

                    if (selectedData.length === Object.keys(cells).length)
                        break;
                }

                var max = Math.max.apply(Math, selectedData);
                var min = Math.min.apply(Math, selectedData);
                var sum = selectedData.reduce((a, b) => (a + b));
                var avg = sum / selectedData.length;
                var condition = null;
                switch (conditionFormat) {
                case cFormat.cfBelowThan:
                        condition = (data: number) => (data < koef * max);
                    break;
                case cFormat.cfMoreThan:
                        condition = (data: number) => (data > koef * max);
                    break;
                case cFormat.cfBelowAverage:
                        condition = (data: number) => (data > koef * avg);
                    break;
                case cFormat.cfMoreAverage:
                        condition = (data: number) => (data > koef * avg);
                    break;
                case cFormat.cfNearAvarage:
                        condition = (data: number) => {
                        if (max === min)
                            return false;

                        return Math.abs(data - avg) / (max - min) < koef;
                    };
                    break;
                case cFormat.cfFarAverage:
                        condition = (data: number) => {
                        if (max === min)
                            return false;

                        return Math.abs(data - avg) / (max - min) > koef;
                    };
                    break;
                default:
                    break;
                }

                var csCell;
                var viewCell;
                var isTrue;
                for (var cellid in cells) {
                    viewCell = $(cells[cellid]);
                    csCell = selectedCsCells[cellid];
                    isTrue = condition(csCell.Data);
                    viewCell.addClass(this.getFormatClass(conditionFormat, isPreview, isTrue));
                }

            };

            getFormatedCells(conditionFormat: cFormat, formatIndex: number) {
                switch (conditionFormat) {
                case cFormat.cfBelowThan:
                    return this.BelowThanCells[formatIndex];
                case cFormat.cfMoreThan:
                    return this.MoreThanCells[formatIndex];
                case cFormat.cfBelowAverage:
                    return this.BelowAverageCells[formatIndex];
                case cFormat.cfMoreAverage:
                    return this.MoreAverageCells[formatIndex];
                case cFormat.cfNearAvarage:
                    return this.NearAvarageCells[formatIndex];
                case cFormat.cfFarAverage:
                    return this.FarAverageCells[formatIndex];
                default:
                    return null;
                }
            };

            startPreviewFormat() {
                this.unsetAllFormat();
                this.unbindAllFormatMenu();
            };

            finishPreviewFormat(cells: Array<any>) {
                this.unsetFormat(cells, true);
                this.refreshAllFormat();
                this.bindAllFormatMenu();
            };

            unsetAllFormat() {
                for (var formatIndex in this.BelowThanCells)
                    this.unsetFormat(this.BelowThanCells[formatIndex], false);

                for (var formatIndex in this.MoreThanCells)
                    this.unsetFormat(this.MoreThanCells[formatIndex], false);

                for (var formatIndex in this.BelowAverageCells)
                    this.unsetFormat(this.BelowAverageCells[formatIndex], false);

                for (var formatIndex in this.MoreAverageCells)
                    this.unsetFormat(this.MoreAverageCells[formatIndex], false);

                for (var formatIndex in this.NearAvarageCells)
                    this.unsetFormat(this.NearAvarageCells[formatIndex], false);

                for (var formatIndex in this.FarAverageCells)
                    this.unsetFormat(this.FarAverageCells[formatIndex], false);
            };

            unsetFormat(cells: Array<any>, isPreview: boolean) {
                var classes;
                var cell;
                var prefix = isPreview ? this.privewClassPrefix : this.formatClassPrefix;
                for (var cellid in cells) {
                    cell = $(cells[cellid]);
                    classes = cell.attr('class').split(' ');
                    for (var ind in classes) {
                        if (classes[ind].indexOf(prefix) > -1) {
                            cell.removeClass(classes[ind]);
                        }
                    }
                }
            };

            bindAllFormatMenu() {
                for (var formatIndex in this.BelowThanCells)
                    this.bindFormatMenu(this.BelowThanCells[formatIndex]);

                for (var formatIndex in this.MoreThanCells)
                    this.bindFormatMenu(this.MoreThanCells[formatIndex]);

                for (var formatIndex in this.BelowAverageCells)
                    this.bindFormatMenu(this.BelowAverageCells[formatIndex]);

                for (var formatIndex in this.MoreAverageCells)
                    this.bindFormatMenu(this.MoreAverageCells[formatIndex]);

                for (var formatIndex in this.NearAvarageCells)
                    this.bindFormatMenu(this.NearAvarageCells[formatIndex]);

                for (var formatIndex in this.FarAverageCells)
                    this.bindFormatMenu(this.FarAverageCells[formatIndex]);
            };


            unbindAllFormatMenu() {
                for (var formatIndex in this.BelowThanCells)
                    this.unbindFormatMenu(this.BelowThanCells[formatIndex]);

                for (var formatIndex in this.MoreThanCells)
                    this.unbindFormatMenu(this.MoreThanCells[formatIndex]);

                for (var formatIndex in this.BelowAverageCells)
                    this.unbindFormatMenu(this.BelowAverageCells[formatIndex]);

                for (var formatIndex in this.MoreAverageCells)
                    this.unbindFormatMenu(this.MoreAverageCells[formatIndex]);

                for (var formatIndex in this.NearAvarageCells)
                    this.unbindFormatMenu(this.NearAvarageCells[formatIndex]);

                for (var formatIndex in this.FarAverageCells)
                    this.unbindFormatMenu(this.FarAverageCells[formatIndex]);
            };

            lightOnFormatedArea = (cells: any[]) => {
                var viewCell;
                for (var cellid in cells) {
                    viewCell = $(cells[cellid]);
                    viewCell.addClass("rs_fc_light");
                }
            };

            lightOffFormatedArea = (cells: any[]) => {
                var viewCell;
                for (var cellid in cells) {
                    viewCell = $(cells[cellid]);
                    viewCell.removeClass("rs_fc_light");
                }
            };

            bindFormatMenu(cells: any[]) {
                var viewCell;
                for (var cellid in cells) {
                    viewCell = $(cells[cellid]);

                    viewCell.on("mouseenter",
                            { grid: this.grid },
                            function(event) {
                                var grid = event.data.grid;
                                var formatIndex = $(this).attr('fi');
                                var cellFormat = grid._conditionFormat
                                    .findFormatByID($(this).attr('cellid'), formatIndex);
                                var formatSelector = "";
                                grid.movePopup(this);
                                grid.fillSelectionPopupContent();
                                switch (cellFormat) {
                                case cFormat.cfBelowThan:
                                    if (grid._conditionFormat.BelowThanCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="belowthan"][value="' +
                                            grid._conditionFormat.BelowThanCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat.makeStatistic(grid._conditionFormat.BelowThanCells[formatIndex]);
                                    break;
                                case cFormat.cfMoreThan:
                                    if (grid._conditionFormat.MoreThanCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="morethan"][value="' +
                                            grid._conditionFormat.MoreThanCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat.makeStatistic(grid._conditionFormat.MoreThanCells[formatIndex]);
                                    break;
                                case cFormat.cfBelowAverage:
                                    if (grid._conditionFormat.BelowAverageCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="belowaverage"][value="' +
                                            grid._conditionFormat.BelowAverageCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat
                                        .makeStatistic(grid._conditionFormat.BelowAverageCells[formatIndex]);
                                    break;
                                case cFormat.cfMoreAverage:
                                    if (grid._conditionFormat.MoreAverageCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="moreaverage"][value="' +
                                            grid._conditionFormat.MoreAverageCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat
                                        .makeStatistic(grid._conditionFormat.MoreAverageCells[formatIndex]);
                                    break;
                                case cFormat.cfNearAvarage:
                                    if (grid._conditionFormat.NearAvarageCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="nearaverage"][value="' +
                                            grid._conditionFormat.NearAvarageCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat
                                        .makeStatistic(grid._conditionFormat.NearAvarageCells[formatIndex]);
                                    break;
                                case cFormat.cfFarAverage:
                                    if (grid._conditionFormat.FarAverageCoefs !== 0)
                                        formatSelector = '.rs_menu span[cf="faraverage"][value="' +
                                            grid._conditionFormat.FarAverageCoefs[formatIndex] +
                                            '"]';

                                    grid._conditionFormat.makeStatistic(grid._conditionFormat.FarAverageCells[formatIndex]);
                                    break;
                                default:
                                    break;
                                }

                                if (formatSelector !== "") {
                                    $(formatSelector).parent().find('span.ui-icon').addClass('rs_selected_item');
//(grid._conditionFormat.getFormatClass(cellFormat, true, true));
                                }

                                if (cellFormat !== "" && cellFormat !== null) {
                                    event.data.grid._SelectingCells = $
                                        .extend([],
                                            event.data.grid._conditionFormat.getFormatedCells(cellFormat, formatIndex));

                                    $('.rs_menu .rs_cf_menu_delete_li').removeClass('ui-state-disabled');
                                    $('.rs_menu .rs_cf_menu_delete_li')
                                        .on('click',
                                            { grid: grid, format: cellFormat, formatIndex: formatIndex },
                                            event => {
                                                event.data.grid._conditionFormat
                                                    .deleteFormat(event.data.format, event.data.formatIndex);
                                            });
                                }

                                event.data.grid.applySelectMenu();
                            })
                        .on("mousemove",
                            { grid: this.grid },
                            function(event) {
                                var grid = event.data.grid;
                                var formatIndex = $(this).attr('fi');
                                var cellFormat = grid._conditionFormat
                                    .findFormatByID($(this).attr('cellid'), formatIndex);

                                grid.openPopup(grid._conditionFormat.getFormatedCells(cellFormat, formatIndex));
                            })
                        .on("mouseout",
                            { grid: this.grid },
                            function(event) {
                                var grid = event.data.grid;
                                var formatIndex = $(this).attr('fi');
                                var cellFormat = grid._conditionFormat
                                    .findFormatByID($(this).attr('cellid'), formatIndex);

                                grid._conditionFormat
                                    .lightOffFormatedArea(grid._conditionFormat.getFormatedCells(cellFormat, formatIndex));
                                grid.closePopup();
                            });
                }
            };

            makeStatistic(cells: any[]) {
                var selectedData = [];
                var selectedCsCells = [];
                var csCells = this.grid.getCellSet().Cells;
                for (var cellIndex in csCells) {
                    var csCell = csCells[cellIndex];

                    if (csCell.CellType !== CellType.data || csCell.Data === null) // || cell.IsTotal == true)
                        continue;

                    if (csCell.CellIndex in cells) {
                        selectedData.push(csCell.Data);
                        selectedCsCells[csCell.CellIndex] = csCell;
                    }

                    if (selectedData.length === Object.keys(cells).length)
                        break;
                }

                var sum = selectedData.reduce((a, b) => (a + b));
                var avg = sum / selectedData.length;

                $("#olapgrid_menu td.rs_sum").html(sum.toFixed(2));
                $("#olapgrid_menu td.rs_count").html(selectedData.length.toString());
                $("#olapgrid_menu td.rs_avg").html(avg.toFixed(2));
            }

            unbindFormatMenu = (cells: any[]) => {
                for (var cellid in cells) {
                    $(cells[cellid]).off("mouseenter").off("mousemove").off("mouseout");
                }
            };

            getFormatClass = (format: cFormat, isPreview: boolean, formatCondition: boolean) => {
                var fclass = isPreview ? "rs_cf_" : "rs_cf_preview_";
                if (isPreview)
                    fclass += "preview_";

                if (!formatCondition)
                    fclass += "not_";

                switch (format) {
                case cFormat.cfBelowThan:
                    fclass += "below_than";
                    break;
                case cFormat.cfMoreThan:
                    fclass += "more_than";
                    break;
                case cFormat.cfBelowAverage:
                    fclass += "below_average";
                    break;
                case cFormat.cfMoreAverage:
                    fclass += "more_average";
                    break;
                case cFormat.cfNearAvarage:
                    fclass += "near_average";
                    break;
                case cFormat.cfFarAverage:
                    fclass += "far_average";
                    break;
                default:
                    return null;
                }
                return fclass;
            };

            findFormatByID(cellid: number, formatid: number) {
                if (formatid in this.BelowThanCells)
                    if (cellid in this.BelowThanCells[formatid])
                        return cFormat.cfBelowThan;

                if (formatid in this.MoreThanCells)
                    if (cellid in this.MoreThanCells[formatid])
                        return cFormat.cfMoreThan;

                if (formatid in this.BelowAverageCells)
                    if (cellid in this.BelowAverageCells[formatid])
                        return cFormat.cfBelowAverage;

                if (formatid in this.MoreAverageCells)
                    if (cellid in this.MoreAverageCells[formatid])
                        return cFormat.cfMoreAverage;

                if (formatid in this.NearAvarageCells)
                    if (cellid in this.NearAvarageCells[formatid])
                        return cFormat.cfNearAvarage;

                if (formatid in this.FarAverageCells)
                    if (cellid in this.FarAverageCells[formatid])
                        return cFormat.cfFarAverage;

                return null;
            };

            applyFormat(cells: any[], conditionFormat: cFormat, koef: number) {
                this.unsetAllFormat();
                this.addCells(conditionFormat, cells, koef);
                this.refreshAllFormat();
            };

            refreshAllFormat() {
                for (var formatIndex in this.BelowThanCells)
                    this.doFormat(this.BelowThanCells[formatIndex],
                        cFormat.cfBelowThan,
                        this.BelowThanCoefs[formatIndex],
                        false);

                for (var formatIndex in this.MoreThanCells)
                    this.doFormat(this.MoreThanCells[formatIndex],
                        cFormat.cfMoreThan,
                        this.MoreThanCoefs[formatIndex],
                        false);

                for (var formatIndex in this.BelowAverageCells)
                    this.doFormat(this.BelowAverageCells[formatIndex],
                        cFormat.cfBelowAverage,
                        this.BelowAverageCoefs[formatIndex],
                        false);

                for (var formatIndex in this.MoreAverageCells)
                    this.doFormat(this.MoreAverageCells[formatIndex],
                        cFormat.cfMoreAverage,
                        this.MoreAverageCoefs[formatIndex],
                        false);

                for (var formatIndex in this.NearAvarageCells)
                    this.doFormat(this.NearAvarageCells[formatIndex],
                        cFormat.cfNearAvarage,
                        this.NearAvarageCoefs[formatIndex],
                        false);

                for (var formatIndex in this.FarAverageCells)
                    this.doFormat(this.FarAverageCells[formatIndex],
                        cFormat.cfFarAverage,
                        this.FarAverageCoefs[formatIndex],
                        false);
            };
            deleteAllFormat() {
                let formatIndex: any;
                for (formatIndex in this.BelowThanCells)
                    this.deleteFormat(cFormat.cfBelowThan, formatIndex);

                for (formatIndex in this.MoreThanCells)
                    this.deleteFormat(cFormat.cfMoreThan, formatIndex);

                for (formatIndex in this.BelowAverageCells)
                    this.deleteFormat(cFormat.cfBelowAverage, formatIndex);

                for (formatIndex in this.MoreAverageCells)
                    this.deleteFormat(cFormat.cfMoreAverage, formatIndex);

                for (formatIndex in this.NearAvarageCells)
                    this.deleteFormat(cFormat.cfNearAvarage, formatIndex);

                for (formatIndex in this.FarAverageCells)
                    this.deleteFormat(cFormat.cfFarAverage, formatIndex);
            };

            deleteFormat(conditionFormat: cFormat, formatIndex: number) {
                switch (conditionFormat) {
                case cFormat.cfBelowThan:
                    this.unbindFormatMenu(this.BelowThanCells[formatIndex]);
                    this.unsetFormat(this.BelowThanCells[formatIndex], false);
                    delete this.BelowThanCells[formatIndex];
                    delete this.BelowThanCoefs[formatIndex];
                    break;
                case cFormat.cfMoreThan:
                    this.unbindFormatMenu(this.MoreThanCells[formatIndex]);
                    this.unsetFormat(this.MoreThanCells[formatIndex], false);
                    delete this.MoreThanCells[formatIndex];
                    delete this.MoreThanCoefs[formatIndex];
                    break;
                case cFormat.cfBelowAverage:
                    this.unbindFormatMenu(this.BelowAverageCells[formatIndex]);
                    this.unsetFormat(this.BelowAverageCells[formatIndex], false);
                    delete this.BelowAverageCells[formatIndex];
                    delete this.BelowAverageCoefs[formatIndex];
                    break;
                case cFormat.cfMoreAverage:
                    this.unbindFormatMenu(this.MoreAverageCells[formatIndex]);
                    this.unsetFormat(this.MoreAverageCells[formatIndex], false);
                    delete this.MoreAverageCells[formatIndex];
                    delete this.MoreAverageCoefs[formatIndex];
                    break;
                case cFormat.cfNearAvarage:
                    this.unbindFormatMenu(this.NearAvarageCells[formatIndex]);
                    this.unsetFormat(this.NearAvarageCells[formatIndex], false);
                    delete this.NearAvarageCells[formatIndex];
                    delete this.NearAvarageCoefs[formatIndex];
                    break;
                case cFormat.cfFarAverage:
                    this.unbindFormatMenu(this.FarAverageCells[formatIndex]);
                    this.unsetFormat(this.FarAverageCells[formatIndex], false);
                    delete this.FarAverageCells[formatIndex];
                    delete this.FarAverageCoefs[formatIndex];
                    break;
                default:
                    break;
                }

                this.refreshAllFormat();
            };

            addCells(conditionFormat: cFormat, cells: Array<any>, koef: number) {
                var container;
                var cell;
                var viewCell;
                var cellid;
                var formatIndex;
                switch (conditionFormat) {
                case cFormat.cfBelowThan:
                    formatIndex = this.BelowThanCells.length;
                    this.BelowThanCells[formatIndex] = [];
                    this.BelowThanCoefs[formatIndex] = koef;
                    container = this.BelowThanCells[formatIndex];
                    break;
                case cFormat.cfMoreThan:
                    formatIndex = this.MoreThanCells.length;
                    this.MoreThanCells[formatIndex] = [];
                    this.MoreThanCoefs[formatIndex] = koef;
                    container = this.MoreThanCells[formatIndex];
                    break;
                case cFormat.cfBelowAverage:
                    formatIndex = this.BelowAverageCells.length;
                    this.BelowAverageCells[formatIndex] = [];
                    this.BelowAverageCoefs[formatIndex] = koef;
                    container = this.BelowAverageCells[formatIndex];
                    break;
                case cFormat.cfMoreAverage:
                    formatIndex = this.MoreAverageCells.length;
                    this.MoreAverageCells[formatIndex] = [];
                    this.MoreAverageCoefs[formatIndex] = koef;
                    container = this.MoreAverageCells[formatIndex];
                    break;
                case cFormat.cfNearAvarage:
                    formatIndex = this.NearAvarageCells.length;
                    this.NearAvarageCells[formatIndex] = [];
                    this.NearAvarageCoefs[formatIndex] = koef;
                    container = this.NearAvarageCells[formatIndex];
                    break;
                case cFormat.cfFarAverage:
                    formatIndex = this.FarAverageCells.length;
                    this.FarAverageCells[formatIndex] = [];
                    this.FarAverageCoefs[formatIndex] = koef;
                    container = this.FarAverageCells[formatIndex];
                    break;
                default:
                    break;
                }

                for (var ind in cells) {
                    cell = cells[ind];
                    viewCell = $(cell);
                    cellid = viewCell.attr("cellid");
                    this.removeCell(cellid);
                    viewCell.attr("fi", formatIndex);
                    container[cellid] = cell;
                }
            };

            removeCell(cellid: string) {
                var cell;
                var cellView;
                var formatIndex;
                for (formatIndex in this.BelowThanCells) {
                    if (cellid in this.BelowThanCells[formatIndex]) {
                        cell = this.BelowThanCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.BelowThanCells[formatIndex][cellid];
                        if (this.BelowThanCells[formatIndex].length === 0) {
                            delete this.BelowThanCells[formatIndex];
                            delete this.BelowThanCoefs[formatIndex];
                        }
                    }
                }

                for (formatIndex in this.MoreThanCells) {
                    if (cellid in this.MoreThanCells[formatIndex]) {
                        cell = this.MoreThanCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.MoreThanCells[formatIndex][cellid];
                        if (this.MoreThanCells[formatIndex].length === 0) {
                            delete this.MoreThanCells[formatIndex];
                            delete this.MoreThanCoefs[formatIndex];
                        }
                    }
                }

                for (formatIndex in this.BelowAverageCells) {
                    if (cellid in this.BelowAverageCells[formatIndex]) {
                        cell = this.BelowAverageCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.BelowAverageCells[formatIndex][cellid];
                        if (this.BelowAverageCells[formatIndex].length === 0) {
                            delete this.BelowAverageCells[formatIndex];
                            delete this.BelowAverageCoefs[formatIndex];
                        }
                    }
                }

                for (formatIndex in this.MoreAverageCells) {
                    if (cellid in this.MoreAverageCells[formatIndex]) {
                        cell = this.MoreAverageCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.MoreAverageCells[formatIndex][cellid];
                        if (this.MoreAverageCells[formatIndex].length === 0) {
                            delete this.MoreAverageCells[formatIndex];
                            delete this.MoreAverageCoefs[formatIndex];
                        }
                    }
                }

                for (formatIndex in this.NearAvarageCells) {
                    if (cellid in this.NearAvarageCells[formatIndex]) {
                        cell = this.NearAvarageCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.NearAvarageCells[formatIndex][cellid];
                        if (this.NearAvarageCells[formatIndex].length === 0) {
                            delete this.NearAvarageCells[formatIndex];
                            delete this.NearAvarageCoefs[formatIndex];
                        }
                    }
                }

                for (formatIndex in this.FarAverageCells) {
                    if (cellid in this.FarAverageCells[formatIndex]) {
                        cell = this.FarAverageCells[formatIndex][cellid];
                        cellView = $(cell);
                        cellView.removeAttr("fi");
                        delete this.FarAverageCells[formatIndex][cellid];
                        if (this.FarAverageCells[formatIndex].length === 0) {
                            delete this.FarAverageCells[formatIndex];
                            delete this.FarAverageCoefs[formatIndex];
                        }
                    }
                }
            };

            isCellFormated(cellid:string) {
                for (var formatIndex in this.BelowThanCells)
                    if (cellid in this.BelowThanCells[formatIndex])
                        return true;

                for (var formatIndex in this.MoreThanCells)
                    if (cellid in this.MoreThanCells[formatIndex])
                        return true;

                for (var formatIndex in this.BelowAverageCells)
                    if (cellid in this.BelowAverageCells[formatIndex])
                        return true;

                for (var formatIndex in this.MoreAverageCells)
                    if (cellid in this.MoreAverageCells[formatIndex])
                        return true;

                for (var formatIndex in this.NearAvarageCells)
                    if (cellid in this.NearAvarageCells[formatIndex])
                        return true;

                for (var formatIndex in this.FarAverageCells)
                    if (cellid in this.FarAverageCells[formatIndex])
                        return true;

                return false;
            };
    }
}