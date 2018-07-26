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