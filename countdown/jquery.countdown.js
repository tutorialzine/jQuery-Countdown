/**
 * @name		jQuery Countdown Plugin
 * @author		Martin Angelov
 * @version 	1.1
 * @url			http://tutorialzine.com/2011/12/countdown-jquery/
 * @link		https://github.com/martinaglv/jQuery-Countdown
 * @license		MIT License
 *
 * Changelog:
 * ----------
 *
 * v1.0 Initial Commit
 * v1.1 Add support for more than 99 days
 */

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD
		define(["jquery"], factory);
	} else if (typeof exports === "object") {
		// Node, CommonJS-like
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals (root is window)
		root.jcountdown = factory(root.$);
	}
}(this, function ($) {
	'use strict';

	// Number of seconds in every time division
	var days	= 24*60*60,
		hours	= 60*60,
		minutes	= 60;

	/**
	 * Creating the plugin
	 *
	 * @param prop
	 * @returns {jQuery}
	 */
	$.fn.countdown = function(prop){
		var options = $.extend({
			callback	: function(){},
			timestamp	: 0
		}, prop);

		// Initialize the plugin
		init(this, options);

		// Get the position elements once the html has been set in the init above
		var positions = this.find('.position');

		(function tick(){
			var time = calculateRemainingTime(options.timestamp),
				position = 0;

			$.each(time, function(index, value) {
				var digits = getDigits(value);

				// We might have to shift 1 places (because we normalized to a minimum of 2 digits)
				if(digits < 2) {
					value = '0' + value;
					digits = 2;
				}

				for(var i = 0; i < digits; i++){
					switchDigit(positions.eq(position), value.toString()[i]);
					position++;
				}
			});

			// Calling an optional user supplied callback
			options.callback(time.d, time.h, time.m, time.s);

			// Scheduling another call of this function in 1s
			setTimeout(tick, 1000);
		})();

		return this;
	};

	/**
	 * Calculate the amount of time ramaining given a timestamp
	 *
	 * @param {number} timestamp - A timestamp in seconds (Unix date)
	 * @returns {Object} The remaining time to the present
	 */
	function calculateRemainingTime (timestamp) {
		var left, time = {};

		// Time left
		left = (timestamp - new Date().getTime()) / 1000;
		left = left < 0 && 0 || left;

		// Number of days left
		time.d = Math.floor(left / days);
		left -= time.d * days;

		// Number of hours left
		time.h = Math.floor(left / hours);
		left -= time.h * hours;

		// Number of minutes left
		time.m = Math.floor(left / minutes);
		left -= time.m * minutes;

		// Number of seconds left
		time.s = Math.floor(left);

		return time;
	}

	/**
	 * Get the number of digits of a number
	 *
	 * @param {number} number
	 * @returns {number} - The number of digits
	 */
	function getDigits(number) {
		return number ? Math.log(number) * Math.LOG10E + 1 | 0 : 1;
	}

	/**
	 * Returns an HTML string containing a certain number of digits
	 *
	 * @param {number} number
	 * @returns {String} - An HTML string
	 */
	function getDigitsHTML(number) {
		var digitHTML = '<span class="position"><span class="digit static">0</span></span>',
			digitsHTML = '',
			digits = getDigits(number);

		// Normalize minimum number of digits (we always show at least 2 digits)
		if(digits < 2) digits = 2;

		// Build the digits html
		for(var i = 0; i < digits; i++){
			digitsHTML += digitHTML;
		}

		return digitsHTML;
	}

	/**
	 * Initializes the countdown widget
	 *
	 * @param {jQuery} elem - The wrapper element for the countdown
	 * @param {Object} options - Contains the callback and timestamp arguments
	 * @returns {void}
	 */
	function init(elem, options){
		// Get the time offset from the start
		var time = calculateRemainingTime(options.timestamp);

		// Add own class to countdown wrapper
		elem.addClass('countdownHolder');

		// Creating the markup inside the container
		$.each(['d','h','m','s'], function(index, value){
			$('<span class="count'+ this +'">').html(
				getDigitsHTML(time[value])
			).appendTo(elem);

			if(this !== "s"){
				elem.append('<span class="countDiv countDiv'+ index +'"></span>');
			}
		});
	}

	/**
	 * Creates an animated transition between the two numbers
	 *
	 * Note: The .static class is added when the animation completes. This makes it run smoother.
	 *
	 * @param position
	 * @param {number} number
	 * @returns {boolean} - TRUE if it switched the digit
	 */
	function switchDigit(position, number){
		var digit = position.find('.digit'),
			replacement = $('<span>',{
				'class':'digit',
				css: {
					top:'-2.1em',
					opacity:0
				},
				html: number
			});

		// No transition is necessary
		if(digit.is(':animated'))
			return false;

		// We are already showing this number
		if(position.data('digit') == number)
			return false;

		position
			.data('digit', number);

		digit
			.before(replacement)
			.removeClass('static')
			.animate({top:'2.5em', opacity:0}, 'fast', function(){
				digit.remove();
			});

		replacement
			.delay(100)
			.animate({top:0, opacity:1}, 'fast', function(){
				replacement.addClass('static');
			});

		return true;
	}
}));