namespace RadarSoft {
    export class NetCoreOlapAnalysis extends MvcOlapAnalysis {

        constructor() {
            super();
        }

        renderSettingsMenu() {
            var menu = "<div class='rs_menubox'>";
            menu += "<ul class='rs_menu'>";
            //Toolbox settings
            menu += "<li><div>";
            menu += `<a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editOlapAnalysis(); }">`;
            menu += "<span>Olap Analysis settings</span></a></div>";
            menu += "</li>";

            //Toolbox settings
            menu += "<li><div>";
            menu += "<span>Toolbox settings</span></div>";
            menu += "<ul class='rc_shadow'>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editToolboxButtons(); }">`;
            menu += "<span>Toolbox buttons</span></a></div></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').editCustomButtons(); }">`;
            menu += "<span>Custom buttons</span></a></div></li>";
            menu += "</ul></li>";

            //save and open settingsRadarSoft.
            menu += "<li></li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').saveSettings('rc_settings'); }">`;
            menu += "<span>Save all settings</span></a></div>";
            menu += "</li>";
            menu += `<li><div><a href="{RadarSoft.$('#${this._settings.cid}').data('grid').showLoadSettingsDialog(); }">`;
            menu += "<span>Load external settings</span></a></div>";
            menu += "</li>";
            menu += "</ul></div>";
            return menu;
        }

    }
}