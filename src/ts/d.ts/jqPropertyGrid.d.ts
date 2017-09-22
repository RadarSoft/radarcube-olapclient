interface JQuery {
    /**
	 * Generates the property grid
	 * @param obj The object whose properties we want to display
	 * @param meta A metadata object describing the obj properties
	 */
    jqPropertyGrid(obj:any, meta:any): JQuery;
    jqPropertyGrid(options?: any): JQuery;
}
declare var jqPropertyGrid: JQueryStatic;
