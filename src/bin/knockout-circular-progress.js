import ko from 'knockout'
import ProgressBar from 'progressbar.js';
import $ from 'jquery'


/**
 * Knockout jQuery Circular Progress Bar Binding
 * author: Brian Schrader
 *
 * A Knockout binding for the circular-progress Widget.
 *
 * Usage:
 * <div data-bind="circleProgress: { }"></div>
 *
 */
ko.bindingHandlers.circleProgress = {
    init: (element, valueAccessor, allBindingsAccessor) => {
        const value = valueAccessor();
        const opts = {
            color: '#FCB03C',
            strokeWidth: 8,
            trailWidth: 8,
            text: {
                value: '--no-value--' // A value must be set to show the <p>
            },
            easing: 'easeInOut'
        };

        const animationOpts = {
            duration: 1500,
        };

        const circle = new ProgressBar.Circle(element, opts);

        // Configure text.
        const p = circle.text;
        $(p).html(
            '<span class="lead">102</span> HP<br />\
            <span>/ 90+12</span>'
        );

        // Animate after the bindings are done to avoid jitter.
        setTimeout(() => {
            circle.animate(1, animationOpts);
        }, 200);
    },

    update: (element, valueAccessor, allBindingsAccessor) => {
        // TODO
    }
};
