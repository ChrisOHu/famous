/* Author: Chris Hu
 */

define(function(require, exports, module) {
    var Surface = require("../core/Surface");
    var Scrollview = require("../views/Scrollview");
    var Modifier = require('../core/Modifier');
    var View = require('../core/View');
    var Transform = require('../core/Transform');
    var Draggable = require('../modifiers/Draggable');

    /**
     * An iOS like swiping panel view
     *
     * @class PanelView
     * @constructor
     * @param {Object} options options configuration object.
     * @param {Surface} options.content the content Surface
     * @param {Surface} options.panel the bottom panel to show
     */
    function PanelView(options) {
        View.apply(this, arguments);

        this.dragXRange = _getDragXRange();

        this.zIndex = this.options.zIndex || 0;
        this.content = this.options.content;
        this.panel = this.options.panel;

        this.draggable = new Draggable({
            xRange: this.dragXRange,
            yRange: [0, 0]
        });

        this.content.pipe(this._eventOutput);
        this.draggable.subscribe(this.content);
        this.draggable.on('update', _updateDrag.bind(this));
        this.draggable.on('end', _endDrag.bind(this));

        this.add(this.draggable).add(this.content);

        if (this.panel) {
            this.add(new Modifier({
                    align: [1, 0],
                    origin: [1, 0],
                    transform: Transform.behind()
                }))
                .add(this.panel);
        }
    }

    PanelView.prototype = Object.create(View.prototype);
    PanelView.prototype.constructor = PanelView;

    PanelView.prototype.close = function(onClosed) {
        this.draggable.setPosition([0, 0], { duration: 300 }, onClosed || this.options.onClosed);
    };

    function _updateDrag(e) {
        console.log("Drag update: " + e.position);
    }

    function _endDrag(e) {
        console.log("Drag end: " + e.position);
    }

    function _getDragXRange() {
        return [-100, 0];
    }

    module.exports = PanelView;
});

