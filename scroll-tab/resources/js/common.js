var PERSON = {};


PERSON.LAYER = function(el) {

    var _el = el || document;
    var $scope = $(_el);

	if (!$('.link_layer, .link_popup').length) return;
	$('.link_popup').each(function() {
		$(this).removeClass('link_popup');
		$(this).addClass('link_layer');
	});
	$('.area_popup').each(function() {
		$(this).removeClass('area_popup');
		$(this).addClass('area_layer');
	});
	$('.box_popup').each(function() {
		$(this).removeClass('box_popup');
		$(this).addClass('box_layer');
	});
	$('.popup_gourmet').each(function() {
		$(this).removeClass('popup_gourmet');
		$(this).addClass('layer_gourmet');
	});

    if ($scope.find('.link_layer').length) {

        var $base = $scope.find('.link_layer');

        var $btn = $('.link_layer a, .link_layer button'),
            $dimm = '<span class="dimmed layer_dimmed"></span>',
            _add = false,
            cmUseCl = "";

        if ($base.attr("isScriptObject") == 'true') return;
        $base.attr("isScriptObject", 'true')

        var $layerClose = $('.area_layer').find('.btn_close a');

		var $btnSelector = '.link_layer a, .link_layer button';
        $(document).off('click.LAYER').on('click.LAYER', $btnSelector, function() {		// live 실행 및 2중실행 방지
			_beforeScroll = _lastScroll;
            if ($(this).parent().attr("isopenlock") == 'false') {
                return false;
            }

            var $this = $(this),
                $parent = $this.parent(),
                _class = $this.parent().attr('class').replace('link_layer','').replace(' ',''),
                _layer = '.area_layer.' + _class,
                $layer  = '';

            //공통 layer 함수 사용 여부 체크
            //A : 공통함수 전부 사용, B : ajax호출은 하지 않고 화면에 있는 div 사용, N : 사용안함
            cmUseCl = $this.parent().attr("cmUseCl");

            //약관 레이어 체크
            if(_class == null || _class == "") return false;
            var cdList = _class.split("clauses_");
            if (cdList.length >= 2){
                fn_clausesLayer(_class,_layer,$dimm,_add); //약관 레이어 호출
                return false;
            }

            //레이어 호출 타입 구분
            if(cmUseCl == null){
                if ($("#wrap").find(_layer).length > 0){
                    cmUseCl = "B";  //호출하고자 하는 클래스가 존재할 경우
                } else {
                    cmUseCl = "A";  //호출하고자 하는 클래스가 존재하지 않을 경우
                }
            } else if (cmUseCl == "N"){
                return false;   //사용안함
            }

            //화면에 div가 존재하므로 화면 호출하지 않음
            if ("B" != cmUseCl){
                loadIng();
                var _url = '/m/inc/' + _class + '.html';
                $.ajax({
                    type : "GET",
                    url : _url,
                    success : function(html){
                        stopIng();
                        $('#wrap').append(html);
                        PERSON.viewLayout(_layer,$dimm,_add); //레이어 활성화 처리
                        $this.addClass('open_btn');
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        stopIng();
                        if (xhr.status == 404) {
                            alert(_url + '.html\n페이지가 없습니다.');
                        } else {
                            alert(_url + "\n" + textStatus);
                        }
                    }
                })
            } else {
                PERSON.viewLayout(_layer,$dimm,_add); //레이어 활성화 처리
                $this.addClass('open_btn');
            }

            return false;
        })
        // 레이어 닫기 버튼
        $(document).off('click.closeLayer').on('click.closeLayer','.area_layer .btn_close a',function(e){	// 2중실행 방지
            //$('body').css('overflow-y','auto');
			setTimeout(function(){
				$('html, body').removeAttr('style');
				$(window).scrollTop(_beforeScroll); // 레이어 팝업 열기전 위치로 이동
			},500);
            var $this = $(this),
                _keyCode = e.keyCode;
            if (_keyCode == 9){
                e.preventDefault();
                $('.open_btn').focus().addClass('opened_tab');
            } else {
                $this.closeLayer();
            }
            return false;
        })
        // 딤드 클릭시 레이어 닫기
        $(document).off('click.layerDim').on('click.layerDim','.layer_dimmed',function(){    	// 2중실행 방지
            $('.area_layer.opened').closeLayer();
            //$('html, body').css('overflow-y','auto');
			setTimeout(function(){
				$('html, body').removeAttr('style');
				$(window).scrollTop(_beforeScroll);
			},500);
        });
        $.fn.closeLayer = function(target){
            var $this = $(this),
                $target = $this.closest('.area_layer');
            if (target){
                $target = $(target);
            }
            $target.addClass('closing').animate({'left':'0'}, 'easeInOut' ,function(){		// fade to null
				$(this).removeClass('opened').removeClass('closing');						// display none 시점 변경
                //화면에 있는 div를 레이어로 띄워주는 경우 remove처리 하지 않음.
                if ( "B" != cmUseCl && $target.attr('isopenlock') != 'true') $target.remove();
            });
            $('.open_btn').focus().removeClass('open_btn');
            $('.dimmed').css({ opacity : '0' },300);
            setTimeout(function(){
                $('.dimmed').remove();
            },300);
        }
    }

    //약관 레이어 호출
    function fn_clausesLayer(_cd,_layer,$dimm,_add){

        loadIng();

        var cd = _cd.replace('clauses_','');

        $.ajax({
            type : 'get',
            data: {"cd" : cd },
            url : '/cpe/ec/CPEEC0701_01.hc',
            success : function(result){
                stopIng();
                if (result.result == -1){
                    $('.area_layer.opened').closeLayer();
                    alert("해당 약관은 등록되어 있지 않습니다.");
                    return false;
                }
                $("#wrap").append(result.html);
            },

            error : function(code, message, data, textStatus, xhr) {
                alert(code+":"+message);
                stopIng();
                return false;
            },

            complete : function(){

                var _layer = '.area_layer.layer_clauses';
                viewLayout(_layer,$dimm,_add); //레이어 활성화 처리

            }

        })
        $(this).addClass('open_btn');

    }
};


// tab interaction
var hc_tabScrollTo = function($this,_temp) {
    //console.log('zzz');		// $this : ul
	var on = $this.parent().addClass('scroll_tab_activated').find('.tab_on_span');
	var img_height = $this.find("img").height()-3;
	var li = $this.children('li.on');
	if ( li.length == 0 ) {
		li = $this.children('li:first').addClass('on');
	}
	if ( on.length==0 ) {
		li.append('<span class="tab_on_span" style="width:'+li.outerWidth()+'px;"></span>');
		on = $this.parent().find('.tab_on_span');
	}
	if($this.hasClass('list_photo_1')){
		li.find(".tab_on_span:first").remove()
		li.append('<span class="tab_on_span" style="width:'+li.outerWidth()+'px; top:'+img_height+'px"></span>');
		on = $this.parent().find('.tab_on_span');
	}
	var p_l = li.position().left;
	var l_w = li.outerWidth();
	var p_w = $this.parent().width();
	var s_l = $this.parent().scrollLeft();
	var t_l = 0;

	if ( p_l+l_w > s_l+p_w ) {		// 클릭한 탭이 우측으로 벗어난 경우
		t_l = p_l - (p_w-l_w);
	} else if ( p_l < s_l ) {		// 클릭한 탭이 좌측으로 벗어난 경우
		t_l = p_l;
	} else {
		t_l = s_l;
	}
	$this.parent().stop().animate({ scrollLeft : t_l + 'px' });
	on.stop().animate({left:p_l+'px',width:l_w+'px'});
};

PERSON.readyScreen = function(el) {
    if (isReadyScreen == false) return;

    PERSON.LAYER(el);
};

PERSON.LAYER = function(el) {

    var _el = el || document;
    var $scope = $(_el);

	if (!$('.link_layer, .link_popup').length) return;
	$('.link_popup').each(function() {
		$(this).removeClass('link_popup');
		$(this).addClass('link_layer');
	});
	$('.area_popup').each(function() {
		$(this).removeClass('area_popup');
		$(this).addClass('area_layer');
	});
	$('.box_popup').each(function() {
		$(this).removeClass('box_popup');
		$(this).addClass('box_layer');
	});
	$('.popup_gourmet').each(function() {
		$(this).removeClass('popup_gourmet');
		$(this).addClass('layer_gourmet');
	});

    if ($scope.find('.link_layer').length) {

        var $base = $scope.find('.link_layer');

        var $btn = $('.link_layer a, .link_layer button'),
            $dimm = '<span class="dimmed layer_dimmed"></span>',
            _add = false,
            cmUseCl = "";

        if ($base.attr("isScriptObject") == 'true') return;
        $base.attr("isScriptObject", 'true')

        var $layerClose = $('.area_layer').find('.btn_close a');

		var $btnSelector = '.link_layer a, .link_layer button';
        $(document).off('click.LAYER').on('click.LAYER', $btnSelector, function() {		// live 실행 및 2중실행 방지
			_beforeScroll = _lastScroll;
            if ($(this).parent().attr("isopenlock") == 'false') {
                return false;
            }

            var $this = $(this),
                $parent = $this.parent(),
                _class = $this.parent().attr('class').replace('link_layer','').replace(' ',''),
                _layer = '.area_layer.' + _class,
                $layer  = '';

            //공통 layer 함수 사용 여부 체크
            //A : 공통함수 전부 사용, B : ajax호출은 하지 않고 화면에 있는 div 사용, N : 사용안함
            cmUseCl = $this.parent().attr("cmUseCl");

            //약관 레이어 체크
            if(_class == null || _class == "") return false;
            var cdList = _class.split("clauses_");
            if (cdList.length >= 2){
                fn_clausesLayer(_class,_layer,$dimm,_add); //약관 레이어 호출
                return false;
            }

            //레이어 호출 타입 구분
            if(cmUseCl == null){
                if ($("#wrap").find(_layer).length > 0){
                    cmUseCl = "B";  //호출하고자 하는 클래스가 존재할 경우
                } else {
                    cmUseCl = "A";  //호출하고자 하는 클래스가 존재하지 않을 경우
                }
            } else if (cmUseCl == "N"){
                return false;   //사용안함
            }

            //화면에 div가 존재하므로 화면 호출하지 않음
            if ("B" != cmUseCl){
                loadIng();
                var _url = '/m/inc/' + _class + '.html';
                $.ajax({
                    type : "GET",
                    url : _url,
                    success : function(html){
                        stopIng();
                        $('#wrap').append(html);
                        PERSON.viewLayout(_layer,$dimm,_add); //레이어 활성화 처리
                        $this.addClass('open_btn');
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        stopIng();
                        if (xhr.status == 404) {
                            alert(_url + '.html\n페이지가 없습니다.');
                        } else {
                            alert(_url + "\n" + textStatus);
                        }
                    }
                })
            } else {
                PERSON.viewLayout(_layer,$dimm,_add); //레이어 활성화 처리
                $this.addClass('open_btn');
            }

            return false;
        })
        // 레이어 닫기 버튼
        $(document).off('click.closeLayer').on('click.closeLayer','.area_layer .btn_close a',function(e){	// 2중실행 방지
            //$('body').css('overflow-y','auto');
			setTimeout(function(){
				$('html, body').removeAttr('style');
				$(window).scrollTop(_beforeScroll); // 레이어 팝업 열기전 위치로 이동
			},500);
            var $this = $(this),
                _keyCode = e.keyCode;
            if (_keyCode == 9){
                e.preventDefault();
                $('.open_btn').focus().addClass('opened_tab');
            } else {
                $this.closeLayer();
            }
            return false;
        })
        // 딤드 클릭시 레이어 닫기
        $(document).off('click.layerDim').on('click.layerDim','.layer_dimmed',function(){    	// 2중실행 방지
            $('.area_layer.opened').closeLayer();
            //$('html, body').css('overflow-y','auto');
			setTimeout(function(){
				$('html, body').removeAttr('style');
				$(window).scrollTop(_beforeScroll);
			},500);
        });
        $.fn.closeLayer = function(target){
            var $this = $(this),
                $target = $this.closest('.area_layer');
            if (target){
                $target = $(target);
            }
            $target.addClass('closing').animate({'left':'0'}, 'easeInOut' ,function(){		// fade to null
				$(this).removeClass('opened').removeClass('closing');						// display none 시점 변경
                //화면에 있는 div를 레이어로 띄워주는 경우 remove처리 하지 않음.
                if ( "B" != cmUseCl && $target.attr('isopenlock') != 'true') $target.remove();
            });
            $('.open_btn').focus().removeClass('open_btn');
            $('.dimmed').css({ opacity : '0' },300);
            setTimeout(function(){
                $('.dimmed').remove();
            },300);
        }
    }

    //약관 레이어 호출
    function fn_clausesLayer(_cd,_layer,$dimm,_add){

        loadIng();

        var cd = _cd.replace('clauses_','');

        $.ajax({
            type : 'get',
            data: {"cd" : cd },
            url : '/cpe/ec/CPEEC0701_01.hc',
            success : function(result){
                stopIng();
                if (result.result == -1){
                    $('.area_layer.opened').closeLayer();
                    alert("해당 약관은 등록되어 있지 않습니다.");
                    return false;
                }
                $("#wrap").append(result.html);
            },

            error : function(code, message, data, textStatus, xhr) {
                alert(code+":"+message);
                stopIng();
                return false;
            },

            complete : function(){

                var _layer = '.area_layer.layer_clauses';
                viewLayout(_layer,$dimm,_add); //레이어 활성화 처리

            }

        })
        $(this).addClass('open_btn');

    }
};

var hc_scrollFixTop = {
	prev      : 0,		// 이전 스크롤값
	curr      : 0,		// 현재 스크롤값
	dir       : 0,		// 스크롤된 방향 (위: 1, 아래: -1)
	gap       : 0,		// header 및 tit영역의 높이 합계
	// 여기까지의 값은 모두 Y 좌표임.
	touching  : false,	// 터치시작부터 터치종료 이전까지 true
	activated : false,	// 실행되었는 지 여부
	elem      : null,	// 실행 대상 element 객체(jquery object)
	elLen     : 0,		// 대상 element 수량
	options: {
		selector  : '.hc-fix-top',		// jquery(css) selector
		header    : true,				// 헤더(GNB영역) 사용 여부 (default: true)
		headerHt  : 55,					// 헤더 영역의 높이값
		pageTit   : true,				// 고정되는 페이지제목 제공 여부 (default: true, 검색페이지 등에서 제공되지 않음)
		titHt     : 50,					// 페이지제목 영역의 높이값
		search    : false,				// 검색결과페이지의 검색영역(default: false - 검색결과페이지에서만 사용)
		srchHt    : 55
	},
	eventsOff: function() {
		$(window).off('scroll.ft');
		$(document).off('touchstart.ft touchmove.ft touchend.ft');
	},
	events: function() {
		var $this = this;
		$this.prev = $(window).scrollTop();
		// check scrolled down/up/none
		$(window).off('scroll.ft').on('scroll.ft', function(e) {
			if ( !$this.touching ) {	// touch하고 있지 않을 때만 실행.
				$this.curr = $(window).scrollTop();
				var currY = $(window).scrollTop();
				if ( $this.prev > $this.curr ) { // scrolled to top
					$this.dir = 1;
				} else if ( $this.prev < $this.curr ) { // scrolled to bottom
					$this.dir = -1;
				} else { // didn't scrolled...
					$this.dir = 0;
				}
				$this.move();
				setTimeout( function() {
					$this.prev = currY;
				},10);
			}
		});
		if ( !window.navigator.userAgent.toLowerCase().match(/ipad|iphone/) ) {		// iphone, ipad인 경우만 touch event 실행
		}
		$(document).off('touchstart.ft touchmove.ft touchend.ft');	// off events
		$(document).on('touchstart.ft', function(e) {
			$this.touching = true;
			$(this).on('touchmove.ft', function(ev) {
				if ( $('.search_input2 .input_area #query').is(':focus') ) {	// 검색박스 클릭
					ev.preventDefault(); return false;
				}
				$this.curr = $(window).scrollTop();
				var tmpCurr = $(window).scrollTop();
				if ( $this.prev > $this.curr ) { // scrolled to top
					$this.dir = 1;
				} else if ( $this.prev < $this.curr ) { // scrolled to bottom
					$this.dir = -1;
				} else { // didn't scrolled...
					$this.dir = 0;
				}
				$this.move();
				setTimeout( function() {
					$this.prev = tmpCurr;
				},10);
			});

			$(this).on('touchend.ft', function(eve) {
				setTimeout( function() {
					$this.touching = false;
					$(this).off('touchmove.ft touchend.ft');
					setTimeout( function() {
						$this.move();
					},10);
				},1);
			});
		});
		$this.move();
	},
	move: function(forceDir) {
		var $this = this;
		var cy = $this.curr;
		if ( typeof forceDir == 'string' ) {
			$this.dir = forceDir=='up' ? 1 : -1;
			cy = forceDir=='up' ? cy-10 : cy+10;
		}
		var dir = $this.dir;
		if ( cy >= document.body.scrollHeight-$(window).height()-50 ) {	// 페이지 최하단일 경우 동작하지 않도록(50px 여유)
			return false;
		}
		if ( !!$this.options.header ) {
			$this.gap = $this.options.headerHt + $this.options.titHt;
			var _topGab = $this.options.headerHt;
			var _mainNotice = false;
			if ( $('body').hasClass('main') && $('.main_notice').length>0 && $('.main_notice').is(':visible') && $('.main_notice').hasClass('open') ) {		// 메인 공지 열려있을 경우
				_topGab = $this.options.headerHt + $('.main_notice.open').outerHeight();
				_mainNotice = true;
			};
			if ( cy >= _topGab ) {  // 스크롤이 헤더 영역 이상일 경우
				$('#wrap').addClass('hc-fix-header-fixed');
				if ( dir==1 ) {		// 위로 스크롤할때 show
					$('#wrap').removeClass('hc-fix-header-hide');
				} else if ( dir==-1 ) {		// 아래로스크롤할때 hide
					$('#wrap').addClass('hc-fix-header-hide');
					$this.gap = $this.options.titHt;
				}
			} else if ( cy<=0 ) {	// 스크롤값이 0 이하일때 고정 풀기
				$('#wrap').removeClass('hc-fix-header-fixed').removeClass('hc-fix-header-hide');
				$this.gap = $this.options.titHt;
			} else {				// 스크롤이 헤더 영역 안쪽일 경우 아무 동작하지 않음..
				if ( cy <= $('.main_notice.open').outerHeight() && !!_mainNotice ) {
					$('#wrap').removeClass('hc-fix-header-fixed').removeClass('hc-fix-header-hide');
					$this.gap = $this.options.titHt;
				}
			}


			if($('body').attr('id') == "hcFixPage")
				$('#wrap').removeClass('hc-fix-header-fixed').removeClass('hc-fix-header-hide');
		}
		$this.elem.each( function() {
			if ( cy+$this.gap<=this.originY ) {
				$this.fix(this,false);
			} else {
				$this.fix(this,true);
			}
		});
	},
	fix: function(el,flag) {
		var $this = this;
		$this.gap = $this.dir>0 ? $this.options.headerHt + $this.options.srchHt + $this.options.titHt : $this.options.titHt;
		if($('.area_tit').height() > 50) {
			$this.gap = $this.gap+20;
		}
		el.originY = !$(el).parent('.hc-fix-addwrap').hasClass('hc-fix-fixed') ? $(el).offset().top : el.originY;
		var top = el.originY;
		if ( flag ) {
			$(el).parent('.hc-fix-addwrap').addClass('hc-fix-fixed');
			$(el).css('top', ($this.gap+el.originT)+'px');
		} else {
			$(el).parent('.hc-fix-addwrap').removeClass('hc-fix-fixed');
			$(el).css('top', el.originCssTop+'px');
		}
	},
	run: function(opt) {
		// opt에서 selector, header 여부, header 높이값, pagetitle 여부, pagetitle height 등을 별도로 정할 수 있음
		var $this = this;
        $this.reset();
        console.log('xxx');
		if ( typeof opt == 'object' ) { $.extend( this.options, opt ); }
		this.elem = $(this.options.selector);
		this.elLen = this.elem.length;
		this.options.headerHt = this.options.header  ? this.options.headerHt : 0;
		this.options.titHt    = this.options.pageTit ? this.options.titHt : 0;
		this.options.srchHt   = this.options.search  ? this.options.srchHt : 0;
		if ( !!this.options.pageTit && !!this.options.titHt ) {
			$('#container').addClass('hc-fix-hastit');
		}
		this.gap = $this.options.headerHt + $this.options.titHt + $this.options.srchHt;
		var htSum = 0;
		$('html').addClass('hc-fix-activated');
		this.elem.each( function(i) {
			this.originY = $(this).offset().top;
			this.originCssTop = $(this).position().top;
			this.outerHt = $(this).outerHeight();
			this.originT = htSum;
			this.maxT = htSum+$(this).outerHeight();
			htSum = this.maxT;
			if ( !$(this).parent().hasClass('hc-fix-addwrap') ) {
				$(this).wrap('<div class="hc-fix-addwrap"></div>');
			}
			$(this).parent('.hc-fix-addwrap').css('height',$(this).outerHeight(true));
		});
		this.events();
	},
	refresh: function() {
		this.run('refresh');	// to be developed...
	},
	disable: function() {
		this.eventsOff();
	},
	enable: function() {
		this.events();
	},
	setOption: function(opt) {
		if ( typeof opt == 'object' ) {
			$.extend( this.options, opt );
		}

	},
	reset: function() {
		var $this = this;
		$('html').removeClass('hc-fix-activated');
		$('#container').removeClass('hc-fix-hastit');
		$(this.options.selector).each( function() {
			if ( $(this).parent().hasClass('hc-fix-addwarp') ) {
				$(this).unwrap();
			}
			$(this).css('top',this.originCssTop+'px');
		});
		$this.eventsOff();
		$.extend( this, {
			prev      : 0,
			curr      : 0,
			dir       : 0,
			gap       : 0,
			touching  : false,
			activated : false,
			elLen     : 0,
			options: {
				selector  : '.hc-fix-top',
				header    : true,
				headerHt  : 55,
				pageTit   : true,
				titHt     : 50,
				search    : false,
				srchHt    : 55
			}
		});
	}
};
// end of hc_scrollFixTop