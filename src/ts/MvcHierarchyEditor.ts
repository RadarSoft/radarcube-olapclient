namespace RadarSoft {
    export class MvcHierarchyEditor extends HierarchyEditor {
        constructor(hierarchy: string, grid: OlapGridBase) {
            super(hierarchy, grid);
        }

        //callback(params) {
        //    var tree = $('#heditor_TREE');
        //    if (tree.length) this.scrollTop = tree.scrollTop();
        //    this.grid.callback('heditor|' + params, 'heditor', 'applyTree()');
        //}

        //callbackTree(params) {
        //    this.grid.callback('heditor|' + params, 'heditortree', 'applyTree()');
        //}

        //applyTree() {
        //    super.applyTree();
        //}
    }
}