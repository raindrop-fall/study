/*!
 * Customized by comahead@vi-nyl.com(源��뱀씪) on 2015-05-20.
 * @author 源��뱀씪 梨낆엫(comahead@vinylc.com)
 * momentum benchmark: iScroll v5.1.2 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license
 */
(function ($, core, undefined) {
    "use strict";
  
    var rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    var _elementStyle = document.createElement('div').style;
    var _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })();

    function _prefixStyle(style) {
        if (_vendor === false) return false;
        if (_vendor === '') return style;
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    var _transform = _prefixStyle('transform');

    var getTime = Date.now || function getTime() {
            return new Date().getTime();
        };

	// �꾩튂�� �띾룄�� �곕씪 �대룞�ш린�� 嫄몃━�� �쒓컙 寃뚯궛
    var momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
        var distance = current - start,
            speed = Math.abs(distance) / time,
            destination,
            duration;

        deceleration = deceleration === undefined ? 0.0006 : deceleration;

        destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
        duration = speed / deceleration;

        if (destination < lowerMargin) {
            destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
            distance = Math.abs(destination - current);
            duration = distance / speed;
        } else if (destination > 0) {
            destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
            distance = Math.abs(current) + destination;
            duration = distance / speed;
        }

        return {
            destination: Math.round(destination),
            duration: duration
        };
    };

    var browser = {
        hasTransform: _transform !== false,
        hasPerspective: _prefixStyle('perspective') in _elementStyle,
        hasTouch: 'ontouchstart' in window,
        hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
        hasTransition: _prefixStyle('transition') in _elementStyle
    };

    var easingType = {
        quadratic: {
            style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fn: function (k) {
                return k * ( 2 - k );
            }
        },
        circular: {
            style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
            fn: function (k) {
                return Math.sqrt(1 - ( --k * k ));
            }
        },
        back: {
            style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fn: function (k) {
                var b = 4;
                return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
            }
        },
        bounce: {
            style: '',
            fn: function (k) {
                if (( k /= 1 ) < ( 1 / 2.75 )) {
                    return 7.5625 * k * k;
                } else if (k < ( 2 / 2.75 )) {
                    return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
                } else if (k < ( 2.5 / 2.75 )) {
                    return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
                } else {
                    return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
                }
            }
        },
        elastic: {
            style: '',
            fn: function (k) {
                var f = 0.22,
                    e = 0.4;

                if (k === 0) {
                    return 0;
                }
                if (k == 1) {
                    return 1;
                }

                return ( e * Math.pow(2, -10 * k) * Math.sin(( k - f / 4 ) * ( 2 * Math.PI ) / f) + 1 );
            }
        }
    };

    var eventType = {
        touchstart: 1,
        touchmove: 1,
        touchend: 1,

        mousedown: 2,
        mousemove: 2,
        mouseup: 2,

        pointerdown: 3,
        pointermove: 3,
        pointerup: 3,

        MSPointerDown: 3,
        MSPointerMove: 3,
        MSPointerUp: 3
    };

	function eventButton(e) {
		if (!e.which && e.button) {
			if (e.button & 1) {return 1; }
			else if (e.button & 4) { return 2; }
			else if (e.button & 2) { return 3; }
		}
		return e.button;
	}

    var style = {
        transform: _transform,
        transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
        transitionDuration: _prefixStyle('transitionDuration'),
        transitionDelay: _prefixStyle('transitionDelay'),
        transformOrigin: _prefixStyle('transformOrigin')
    };

    /**
     * 遺��쒕윭�� �ㅽ겕濡ㅻ윭 紐⑤뱢
     * @class scui.ui.SmoothScroll
     * @extends scui.ui.View
     * @fires scui.ui.SmoothScroll#smoothscrollstart
     * @fires scui.ui.SmoothScroll#smoothscrollmove
     * @fires scui.ui.SmoothScroll#smoothscrollend
     */
    var SmoothScroll = core.ui('SmoothScroll', {
        bindjQuery: 'smoothScroll',
        defaults: {
            startX: 0,                      // 泥� x �꾩튂
            startY: 0,                      // 泥� y �꾩튂
            scrollX: false,                // 媛�濡쒖뒪�щ· �덉슜�щ�
            scrollY: true,                  // �몃줈�ㅽ겕濡� �덉슜�щ�
            directionLockThreshold: 5,  //
            scrollByWheel: true,            // 留덉슦�� �� �덉슜�щ�
            scrollType: 'style',            // 'scroll', 'style' 以� �앹씪
            mouseWheelSpeed: 20,            // 留덉슦�ㅽ쑀 �띾룄
            momentum: true,                 // �섏��� �④낵�ъ슜

            bounce: true,                   // �뺢린�� �④낵�ъ슜
            bounceTime: 600,                // �뺢린�� �띾룄
            bounceEasing: '',

            preventDefault: true,
            preventDefaultException: { tagName: /^(INPUT|TEXTAREA|SELECT)$/i },

            HWCompositing: true,            // �섎뱶�⑥뼱 媛��� �ъ슜
            useTransition: true,            // �몃옖吏��� �ъ슜
            useTransform: true,             // �몃옖�ㅽ뤌 �ъ슜
            resizeRefresh: false,           // 由ъ궗�댁쭠�쒖뿉 �먮룞�쇰줈 �덉씠�꾩썐�ъ씠利덈� �ш퀎�� �� 寃껋씤媛�
            resizePolling: 60,               // �ш퀎�� 理쒖냼 �쒓컙

            snap: ''                          // �ㅻ깄���� ���됲꽣
        },
        selectors: {
            //wrapper: '.ui_wrapper',
            scroller: '.ui_scroller'
        },
	    /**
	     * �앹꽦��
	     * @param {string} el
	     * @param {Object} options
	     */
        initialize: function(el, options) {
            var me = this, opts;
            if (me.supr(el, options) === false) { return; }
            if (!me.$scroller[0]){ return; }

            opts = me.options;
            me.$wrapper = me.$el;
            me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
            me.translateZ = opts.HWCompositing && browser.hasPerspective ? ' translateZ(0)' : '';
            opts.useTransition = browser.hasTransition && opts.useTransition && opts.scrollType === 'style';
            opts.useTransform = browser.hasTransform && opts.useTransform;
            opts.eventPassthrough = opts.eventPassthrough === true ? 'vertical' : opts.eventPassthrough;
            opts.preventDefault = !opts.eventPassthrough && opts.preventDefault;
            opts.scrollY = opts.eventPassthrough == 'vertical' ? false : opts.scrollY;
            opts.scrollX = opts.eventPassthrough == 'horizontal' ? false : opts.scrollX;
            opts.freeScroll = opts.freeScroll && !opts.eventPassthrough;
            opts.directionLockThreshold = opts.eventPassthrough ? 0 : opts.directionLockThreshold;
            opts.bounceEasing = typeof opts.bounceEasing == 'string' ? easingType[opts.bounceEasing] || easingType.circular : opts.bounceEasing;
            opts.invertWheelDirection = opts.invertWheelDirection ? -1 : 1;  // 留덉슦�ㅽ쑀 諛섎� 諛⑺뼢

            me._startX = 0;
            me._startY = 0;
            me.x = 0;   // �꾩옱 x �꾩튂
            me.y = 0;   // �꾩옱 y �꾩튂
            me.directionX = 0;
            me.directionY = 0;
            me.scrollerStyle = me.$scroller[0].style;

            if (opts.snap) {
	            // �ㅻ깄���� 寃���
                me.$snapItems = me.$(opts.snap);
            }

            me._init();
            me.refresh();

            me.scrollTo(opts.startX, opts.startY);
            me.enable();
        },

	    /**
	     * �쒖꽦��
	     */
        enable: function(){
            this.isEnabled = true;
        },

	    /**
	     * 鍮꾪솢�깊솕
	     * @param flag
	     */
        setDisabled: function (flag) {
            this.isEnabled = !flag;
        },

	    /**
	     * 珥덇린 �묒뾽
	     * @private
	     */
        _init: function() {
            this._initEvents();
        },

	    /**
	     * �대깽�� 諛붿씤��
	     * @private
	     */
        _initEvents: function() {
            var me = this;

            me._handle(me.$wrapper, 'mousedown');
            me._handle(me.$wrapper, 'touchstart');
            me._handle(me.$wrapper, 'selectstart');
            me._handle(me.$wrapper, 'dragstart');
            me._handle(me.$wrapper, 'click');

            if(me.options.useTransition) {
                me._handle(me.$scroller, 'transitionend');
                me._handle(me.$scroller, 'webkitTransitionEnd');
                me._handle(me.$scroller, 'oTransitionEnd');
                me._handle(me.$scroller, 'MSTransitionEnd');
            }

            if (me.options.scrollByWheel){
                me._initWheel();
            }

            if (me.options.resizeRefresh) {
                $(window).on('resize.' + me.cid, function (){
                    me.refresh();
                });
            }
        },

	    /**
	     * 留덉슦�ㅽ쑀 �대깽�� 諛붿씤��
	     * @private
	     */
        _initWheel: function () {
            var me = this;

            me._handle(me.$wrapper, 'wheel');
            me._handle(me.$wrapper, 'mousewheel');
            me._handle(me.$wrapper, 'DOMMouseScroll');
        },

	    /**
	     * �좎씠踰ㅽ듃 �몃뱾��
	     * @param e
	     * @private
	     */
        _wheel: function (e) {
            var me = this;
            if ( !me.isEnabled ) {
                return;
            }

            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            e.stopPropagation ? e.stopPropagation() : e.cancalBubble = true;

            var wheelDeltaX, wheelDeltaY,
                newX, newY;

            if ( me.wheelTimeout === undefined ) {
                me._startX = me.x;
                me._startY = me.y;
                var ev = $.Event('smoothscrollstart');
                me.triggerHandler(ev, {x: me.x, y: me.y});
                if (ev.isDefaultPrevented()) {
                    return;
                }
            }

            clearTimeout(me.wheelTimeout);
            me.wheelTimeout = setTimeout(function () {
                me._triggerEnd();
                me.wheelTimeout = undefined;
            }, 400);

            e = e.originalEvent || e;
            if ( 'deltaX' in e ) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX * me.options.mouseWheelSpeed;
                    wheelDeltaY = -e.deltaY * me.options.mouseWheelSpeed;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ( 'wheelDeltaX' in e ) {
                wheelDeltaX = e.wheelDeltaX / 120 * me.options.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * me.options.mouseWheelSpeed;
            } else if ( 'wheelDelta' in e ) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * me.options.mouseWheelSpeed;
            } else if ( 'detail' in e ) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * me.options.mouseWheelSpeed;
            } else {
                return;
            }

            wheelDeltaX *= me.options.invertWheelDirection;
            wheelDeltaY *= me.options.invertWheelDirection;

            if ( !me.hasVerticalScroll ) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }

            newX = me.x + Math.round(me.hasHorizontalScroll ? wheelDeltaX : 0);
            newY = me.y + Math.round(me.hasVerticalScroll ? wheelDeltaY : 0);

            if ( newX > 0 ) {
                newX = 0;
            } else if ( newX < me.maxScrollX ) {
                newX = me.maxScrollX;
            }

            if ( newY > 0 ) {
                newY = 0;
            } else if ( newY < me.maxScrollY ) {
                newY = me.maxScrollY;
            }

            me.scrollTo(newX, newY, 0);
        },

	    /**
	     * el�� eventName �대깽�� 諛붿씤��
	     * @param {jQuery} $el
	     * @param {string} eventName
	     * @param {boolean} isBind
	     * @private
	     */
        _handle: function($el, eventName, isBind) {
            var me = this;
            if(isBind !== false) {
                $el.on(eventName+'.'+me.cid, me.handleEvent.bind(me));
            } else {
                $el.off(eventName+'.'+me.cid);
            }
        },

	    /**
	     * �대깽�� �몃뱾��
	     * @param e
	     */
        handleEvent: function(e) {
            var me = this;

            switch(e.type) {
                case 'mousedown':
                case 'touchstart':
	                if (me.moved) {
		                e.preventDefault();
	                }
                    me._start(e);
                    break;
                case 'selectstart':
                case 'dragstart':
                    e.preventDefault ? e.preventDefault : e.returnValue = false;
                    break;
                case 'mousemove':
                case 'touchmove':
                    me._move(e);
                    break;
                case 'mouseup':
                case 'mousecancel':
                case 'touchend':
                case 'touchcancel':
                    me._end(e);
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    me._transitionEnd(e);
                    break;
                case 'wheel':
                case 'mousewheel':
                case 'DOMMouseScroll':
                    me._wheel(e);
                    break;
                case 'click':
	                if (me.moved) {
		                e.preventDefault();
		                e.stopPropagation();
	                } else {
		                me._click(e);
	                }
                    break;
            }
        },

	    /**
	     * �꾩옱 �꾩튂 議고쉶
	     * @returns {{x: *, y: *}}
	     */
	    getPosition: function () {
		    var x, y;

		    if (this.options.scrollType === 'style') {
			    var pos = core.dom.position(this.$scroller);
			    x = pos.x;
			    y = pos.y;
		    } else if (this.options.scrollType === 'scroll') {
			    x = -this.$scroller.parent().scrollLeft();
			    y = -this.$scroller.parent().scrollTop();
		    }
		    return { x: x, y: y };
	    },

	    /**
	     * �좊땲硫붿씠��
	     * @param {number} destX
	     * @param {number} destY
	     * @param {number} duration
	     * @param {function} easingFn
	     * @private
	     */
        _animate: function (destX, destY, duration, easingFn) {
            var me = this,
                startX = this.x,
                startY = this.y,
                startTime = getTime(),
                destTime = startTime + duration;

            function step () {
                var now = getTime(),
                    newX, newY,
                    easing;

                if ( now >= destTime ) {
                    me.isAnimating = false;
                    me._translate(destX, destY);

                    if (!me.resetPosition(me.options.bounceTime) ) {
                        me._triggerEnd();
                    }

                    return;
                }

                now = ( now - startTime ) / duration;
                easing = easingFn(now);
                newX = ( destX - startX ) * easing + startX;
                newY = ( destY - startY ) * easing + startY;
                me._translate(newX, newY);

                if ( me.isAnimating ) {
                    rAF(step);
                }
            }

            this.isAnimating = true;
            step();
        },
	    /**
	     * �좊땲硫붿씠�� �쒓컙 �ㅼ젙
	     * @param {number} time
	     * @private
	     */
        _transitionTime: function (time) {
            if (!this.options.useTransition) { return; }

            time = time || 0;
            this.scrollerStyle[style.transitionDuration] = time + 'ms';

            /*if ( !time && utils.isBadAndroid ) {
             this.scrollerStyle[style.transitionDuration] = '0.001s';
             }*/

        },
	    /**
	     * easing  �ㅼ젙
	     * @param {string} easing
	     * @private
	     */
        _transitionTimingFunction: function (easing) {
            if (!this.options.useTransition) { return; }

            this.scrollerStyle[style.transitionTimingFunction] = easing;
        },

	    /**
	     * �대룞
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
        _translate: function (x, y) {
            var me = this;

            var ev = $.Event('smoothscrollmove');
            me.triggerHandler(ev, {x: x, y: y});
            if (ev.isDefaultPrevented()) {
                return;
            }

            if ( me.options.scrollType === 'style') {
                if (me.options.useTransform) {
                    me.scrollerStyle[style.transform] = 'translate(' + x + 'px,' + y + 'px)' + me.translateZ;
                } else {
                    x = Math.round(x);
                    y = Math.round(y);
                    me.scrollerStyle.left = x + 'px';
                    me.scrollerStyle.top = y + 'px';
                }
            } else if (me.options.scrollType === 'scroll') {
                me.$scroller.parent().scrollLeft(-x);
                me.$scroller.parent().scrollTop(-y);
            }

            me.scrollSizeX = me.x - x;
            me.scrollSizeY = me.y - y;
            me.x = x;
            me.y = y;
            //me.triggerHandler('smoothscrollmove', {x: me.x, y: me.y});
        },

	    /**
	     * �뺢린�� �④낵
	     * @param time
	     * @returns {boolean}
	     */
        resetPosition: function (time) {
            var me = this,
                x = me.x,
                y = me.y;

            time = time || 0;

            if ( !me.hasHorizontalScroll || me.x > 0 ) {
                x = 0;
            } else if ( me.x < me.maxScrollX ) {
                x = me.maxScrollX;
            }

            if ( !me.hasVerticalScroll || me.y > 0 ) {
                y = 0;
            } else if ( me.y < me.maxScrollY ) {
                y = me.maxScrollY;
            }

            if ( x == me.x && y == me.y ) {
                return false;
            }

            me.scrollTo(x, y, time, me.options.bounceEasing);

            return true;
        },

	    /**
	     * �댁쟾�쇰줈 �ㅽ겕濡�
	     * @param {string} dir 'x', 'y'
	     * @param {number} time
	     * @param {function} easing
	     */
	    scrollPrev: function (dir, time, easing) {
		    var me = this,
			    x = 0, y = 0;

		    if (dir === 'x') {
			    x = Math.min(0, me.x + me.wrapperWidth);
		    } else {
			    y = Math.min(0, me.y + me.wrapperHeight);
		    }

		    me.scrollTo(x, y, time, easing);
	    },

	    /**
	     * �댄썑濡� �ㅽ겕濡�
	     * @param {string} dir 'x', 'y'
	     * @param {number} time
	     * @param {function} easing
	     */
	    scrollNext: function (dir, time, easing) {
		    var me = this,
			    x = 0, y = 0;

		    if (dir === 'x') {
			    x = Math.max(me.maxScrollX, me.x - me.wrapperWidth);
		    } else {
			    y = Math.max(me.maxScrollY, me.y - me.wrapperHeight);
		    }

		    me.scrollTo(x, y, time, easing);
	    },

	    /**
	     * 吏��뺥븳 �꾩튂濡� �ㅽ겕濡ㅻ쭅
	     * @param {number} x
	     * @param {number} y
	     * @param {float} time
	     * @param easing
	     */
        scrollTo: function (x, y, time, easing) {
            var me = this;
            easing = easing || easingType.circular;

	        if (typeof x === 'string') {
		        if (/^-=/.test(x)) {
			        x = me.x - parseInt(x.substr(2), 10);
		        } else if (/^\+=/.test(x)) {
			        x = me.x + parseInt(x.substr(2));
		        }
	        }

	        if (typeof y === 'string') {
		        if (/^-=/.test(y)) {
			        y = me.y - parseInt(y.substr(2), 10);
		        } else if (/^\+=/.test(y)) {
			        y = me.y + parseInt(y.substr(2), 10);
		        }
	        }

            if (!me.options.momentum) {
                x = Math.max(me.maxScrollX, Math.min(x, 0));
                y = Math.max(me.maxScrollY, Math.min(y, 0));
            }
            me.isInTransition = me.options.useTransition && time > 0;

            if ( !time || (me.options.useTransition && easing.style) ) {
                me._transitionTimingFunction(easing.style);
                me._transitionTime(time);
                me._translate(x, y);
            } else {
                me._animate(x, y, time, easing.fn);
            }
        },

	    /**
	     * el�� �꾩튂�� 怨녹쑝濡� �ㅽ겕濡ㅻ쭅
	     * @param {Element} el
	     * @param {float} time
	     * @param {number} offsetX
	     * @param {number} offsetY
	     * @param easing
	     */
        scrollToElement: function (el, time, offsetX, offsetY, easing) {
            var me = this;
            el = el.nodeType ? el : me.$scroller.find(el);

            if ( !el ) {
                return;
            }

            var pos = $(el).position();
            pos.left *= -1;
            pos.top *= -1;

            /*pos.left -= me.wrapperOffset.left;
             pos.top  -= me.wrapperOffset.top;

             // if offsetX/Y are true we center the element to the screen
             if ( offsetX === true ) {
             offsetX = Math.round(el.offsetWidth / 2 - me.$wrapper.offsetWidth / 2);
             }
             if ( offsetY === true ) {
             offsetY = Math.round(el.offsetHeight / 2 - me.$wrapper.offsetHeight / 2);
             }

             pos.left -= offsetX || 0;
             pos.top  -= offsetY || 0;*/

            pos.left = pos.left > 0 ? 0 : pos.left < me.maxScrollX ? me.maxScrollX : pos.left;
            pos.top  = pos.top  > 0 ? 0 : pos.top  < me.maxScrollY ? me.maxScrollY : pos.top;

            time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(me.x-pos.left), Math.abs(me.y-pos.top)) : time;

            me.scrollTo(pos.left, pos.top, time, easing);
        },

        _isDragable: function(el){
            if (core.browser.isTouch) { return true; }

            if(el && el.tagName && this.options.preventDefaultException.tagName.test(el.tagName)){
                return false;
            } else {
                return true;
            }
        },

	    /**
	     * pc�먯꽌 �쒕옒洹명썑�� �대┃�대깽�몃� 臾댄슚��
	     * @param e
	     * @private
	     */
         _click: function(e) {

            var me = this,
                point = core.dom.getEventPoint(e);

            if(!(me.downX === point.x && me.downY === point.y)) {
                //console.log('prevent click', me.downX, me.downY, e.pageX, e.pageY);
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
	            e.stopPropagation ? e.stopPropagation() : e.cancalBubble = true;
            }
        },

	    /**
	     * �곗튂 �ㅽ��� �몃뱾��
	     * @param ev
	     * @private
	     */
        _start: function(ev) {
            var me = this;
            var e = ev.originalEvent || ev;

            if ( eventType[e.type] != 1 ) {
                if (core.dom.getMouseButton(e) !== 'left') {
	                return;
                }
            }

            if ( !me.isEnabled || (me.initiated && eventType[e.type] !== me.initiated) ) {
                return;
            }

            var $doc = $(document),
                point = core.dom.getEventPoint(e),
                pos;

            /***if(!me._isDownable($(e.target).closest(':focusable').get(0))) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }***/
            if (!me._isDragable(ev.target)) {
                return;
            }

            me._handle($doc, 'mousemove');
            me._handle($doc, 'touchmove');
            me._handle($doc, 'touchend');
            me._handle($doc, 'mouseup');
            me._handle($doc, 'mousecancel');
            me._handle($doc, 'tocuchcancel');

            me.initiated	= eventType[e.type];
            me.moved		= false;
            me.distX		= 0;
            me.distY		= 0;
            me.directionX = 0;
            me.directionY = 0;
            me.directionLocked = 0;

            me._transitionTime();

            me.startTime = getTime();
            if ( me.options.useTransition && me.isInTransition ) {
                me.isInTransition = false;
                pos = me.getPosition();
                me._translate(Math.round(pos.x), Math.round(pos.y));
                me._triggerEnd();
            } else if ( !me.options.useTransition && me.isAnimating ) {
                me.isAnimating = false;
                me._triggerEnd();
            }

            me.startX    = me.x;
            me.startY    = me.y;
            me.absStartX = me.x;
            me.absStartY = me.y;
            me.pointX    = me.downX = point.x;
            me.pointY    = me.downY = point.y;
        },

	    /**
	     * �곗튂臾대툕 �몃뱾��
	     * @param e
	     * @private
	     */
        _move: function(e) {
            var me = this;

            e = e.originalEvent || e;
            if ( !me.isEnabled || eventType[e.type] !== me.initiated ) {
                return;
            }

            if ( me.options.preventDefault ) {	// increases performance on Android? TODO: check!
                e.preventDefault ? e.preventDefault() : e.defaultValue = false;
            }

            var point		= core.dom.getEventPoint(e),
                deltaX		= point.x - me.pointX,
                deltaY		= point.y - me.pointY,
                timestamp	= getTime(),
                newX, newY,
                absDistX, absDistY;


            me.pointX		= point.x;
            me.pointY		= point.y;

            me.distX		+= deltaX;
            me.distY		+= deltaY;
            absDistX		= Math.abs(me.distX);
            absDistY		= Math.abs(me.distY);

            // We need to move at least 10 pixels for the scrolling to initiate
            if ( timestamp - me.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
                return;
            }

            // If you are scrolling in one direction lock the other
            if ( !me.directionLocked && !me.options.freeScroll ) {
                if ( absDistX > absDistY + me.options.directionLockThreshold ) {
                    me.directionLocked = 'h';		// lock horizontally
                } else if ( absDistY >= absDistX + me.options.directionLockThreshold ) {
                    me.directionLocked = 'v';		// lock vertically
                } else {
                    me.directionLocked = 'n';		// no lock
                }
            }


            if ( me.directionLocked == 'h' ) {
                if ( me.options.eventPassthrough == 'vertical' ) {
                    e.preventDefault ? e.preventDefault() : e.defaultValue = false;
                } else if ( me.options.eventPassthrough == 'horizontal' ) {
                    me.initiated = false;
                    return;
                }

                deltaY = 0;
            } else if ( me.directionLocked == 'v' ) {
                if ( me.options.eventPassthrough == 'horizontal' ) {
                    e.preventDefault ? e.preventDefault() : e.defaultValue = false;
                } else if ( me.options.eventPassthrough == 'vertical' ) {
                    me.initiated = false;
                    return;
                }

                deltaX = 0;
            }


            deltaX = me.hasHorizontalScroll ? deltaX : 0;
            deltaY = me.hasVerticalScroll ? deltaY : 0;

            newX = me.x + deltaX;
            newY = me.y + deltaY;

            // Slow down if outside of the boundaries
            if ( newX > 0 || newX < me.maxScrollX ) {
                newX = me.options.bounce ? me.x + deltaX / 3 : newX > 0 ? 0 : me.maxScrollX;
            }
            if ( newY > 0 || newY < me.maxScrollY ) {
                newY = me.options.bounce ? me.y + deltaY / 3 : newY > 0 ? 0 : me.maxScrollY;
            }

            me.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            me.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if ( !me.moved ) {
                me._startX = me.x;
                me._startY = me.y;
                var ev = $.Event('smoothscrollstart');
                me.triggerHandler(ev, {x: me.x, y: me.y});
                if (ev.isDefaultPrevented()) {
                    return;
                }
            }
            me.moved = true;
            me._translate(newX, newY);

            if ( timestamp - me.startTime > 300 ) {
                me.startTime = timestamp;
                me.startX = me.x;
                me.startY = me.y;
            }
        },

	    /**
	     * �곗튂�대깽�� �몃뱾��
	     * @param e
	     * @private
	     */
        _end: function(e) {
            var me = this;

            if ( !me.isEnabled || eventType[e.type] !== me.initiated ) {
                return;
            }

            var $doc = $(document),
            //point = e.changedTouches ? e.changedTouches[0] : e,
                momentumX,
                momentumY,
                duration = getTime() - me.startTime,
                newX = Math.round(me.x),
                newY = Math.round(me.y),
            //distanceX = Math.abs(newX - me.startX),
            //distanceY = Math.abs(newY - me.startY),
                time = 0,
                easing = '';

            $doc.off('.'+me.cid);

            me.isInTransition = 0;
            me.initiated = 0;
            me.endTime = getTime();

            // reset if we are outside of the boundaries
            if ( me.resetPosition(me.options.bounceTime) ) {
                return;
            }

            me.scrollTo(newX, newY);	// ensures that the last position is rounded

            if ( !me.moved ) {
                return;
            }

            // start momentum animation if needed
            if ( me.options.momentum && duration < 300 ) {
                momentumX = me.hasHorizontalScroll ? momentum(me.x, me.startX, duration, me.maxScrollX, me.options.bounce ? me.wrapperWidth : 0, me.options.deceleration) : { destination: newX, duration: 0 };
                momentumY = me.hasVerticalScroll ? momentum(me.y, me.startY, duration, me.maxScrollY, me.options.bounce ? me.wrapperHeight : 0, me.options.deceleration) : { destination: newY, duration: 0 };
                newX = momentumX.destination;
                newY = momentumY.destination;
                time = Math.max(momentumX.duration, momentumY.duration);
                me.isInTransition = 1;
            }

            if ( newX != me.x || newY != me.y ) {
                // change easing function when scroller goes out of the boundaries
                if ( newX > 0 || newX < me.maxScrollX || newY > 0 || newY < me.maxScrollY ) {
                    easing = easingType.quadratic;
                }

                me.scrollTo(newX, newY, time, easing);
                return;
            }

            me._triggerEnd();
        },

	    /**
	     * �щ같移� �� �붿냼�ㅼ쓣 ��怨꾩궛
	     */
	    refresh: function() {
            //var rf = this.$wrapper[0].offsetHeight;		// Force reflow
            var me = this;

            me.wrapperWidth	= me.options.getWrapperWidth ? me.options.getWrapperWidth() : me.$wrapper.width();
            me.wrapperHeight	= me.options.getWrapperHeight ? me.options.getWrapperHeight() : me.$wrapper.height();

            me.scrollerWidth	= me.options.getScrollerWidth ? me.options.getScrollerWidth() : me.$scroller.width();
            me.scrollerHeight	= me.options.getScrollerHeight ? me.options.getScrollerHeight() : me.$scroller.height();

            me.maxScrollX		= me.wrapperWidth - me.scrollerWidth;
            me.maxScrollY		= me.wrapperHeight - me.scrollerHeight;

            me.hasHorizontalScroll	= me.options.scrollX && me.maxScrollX < 0;
            me.hasVerticalScroll		= me.options.scrollY && me.maxScrollY < 0;

            if ( !me.hasHorizontalScroll ) {
                me.maxScrollX = 0;
                me.scrollerWidth = me.wrapperWidth;
            }

            if ( !me.hasVerticalScroll ) {
                me.maxScrollY = 0;
                me.scrollerHeight = me.wrapperHeight;
            }

            me.endTime = 0;
            me.directionX = 0;
            me.directionY = 0;

            me.resetPosition();
            me.options.snap && me._refreshSnapPos();
        },

	    /**
	     * �ㅻ궡�� ���곷뱾�� �꾩튂 �ш퀎��
	     * @private
	     */
        _refreshSnapPos: function () {
            var me = this;
            if (!me.options.snap) { return; }

            me.snapItemsPos = [];
            me.$snapItems.each(function (){
                me.snapItemsPos.push($(this).position());
            });
        },

	    /**
	     * �좊땲硫붿씠�섏씠 �앸궗�� �� 諛쒖깮
	     * @param e
	     * @private
	     */
        _transitionEnd: function(e) {
            var me = this;
            if ( e.target != me.$scroller[0] || !me.isInTransition ) {
                return;
            }

            me._transitionTime();
            if ( !me.resetPosition(me.options.bounceTime) ) {
                me.isInTransition = false;
                this._triggerEnd();
            }
        },

	    /**
	     * �ㅻ깄 泥섎━
	     * @returns {boolean}
	     * @private
	     */
        _snap: function () {
            var me = this;
            if (!me.options.snap) { return; }
            if (me._isSnap) {
                me._isSnap = false;
            } else if (me.maxScrollX != me.x) {
                var x = me._startX - me.x,
                    prevX = 0, isMoved = false;

                me._isSnap = true;
                x && core.each(me.snapItemsPos, function (item) {
                    var left = item.left;
                    if (x > 0) {
                        if (left > Math.abs(me.x)) {
                            isMoved = true;
                            me._animate(-left, 0, 200, easingType.circular.fn);
                            return false;
                        }
                    } else if (x < 0) {
                        if (left > Math.abs(me.x)) {
                            isMoved = true;
                            me._animate(-prevX, 0, 200, easingType.circular.fn);
                            return false;
                        }
                    }
                    prevX = left;
                });
                if (isMoved) {
                    return true;
                }
            }

            me._isSnap = false;
        },

	    /**
	     * smoothscrollend  �몃━嫄�
	     * @private
	     */
        _triggerEnd: function () {
            var me = this;

		    me.moved = false;
            if (me.options.snap && me._snap() === true) { return; }
            me.triggerHandler('smoothscrollend', {
                x: me.x,
                y: me.y,
                dir: {x: me._startX - me.x, y: me._startY - me.y},
                wrapWidth: me.wrapperWidth,
                wrapHeight: me.wrapperHeight,
                scrollWidth: me.scrollerWidth,
                scrollHeight: me.scrollerHeight
            });
        },

	    getCurrentX: function (){ return this.x; },
	    getCurrentY: function (){ return this.y; },
        getMaxScrollX: function(){ return this.maxScrollX; },
        getMaxScrollY: function(){ return this.maxScrollY; }
    });


    if (typeof define === "function" && define.amd) {
        define([], function() {
            return SmoothScroll;
        });
    }
})(jQuery, window[LIB_NAME]);