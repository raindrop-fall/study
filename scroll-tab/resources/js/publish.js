var HDC = {};
HDC.isUnload = false;
HDC.showCount = 0;
HDC.unload = function() {
    HDC.showLoading();
};

HDC.initLoading = function() {
    var $scope = $("body");
    var $modal = $("#loading-modal");
    if ($modal.length == 0) {
        $scope.append('<div id="loading-modal" style="display: none; position: fixed; z-index: 10000; top: 0px; left: 0px; height: 100%; width: 100%; opacity: 0.6; background: url(\'data:image/gif;base64,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\') 50% 50% no-repeat rgb(255, 255, 255);filter:alpha(opacity=60)"></div>');
    }
    HDC.showCount = 0;
};

HDC.showLoading = function() {
    if (HDC.showCount++ > 0) return;

    var $modal = $("#loading-modal");
    $modal.show();
}

HDC.hideLoading = function() {
    HDC.showCount--;
    if (HDC.showCount > 0) return;

    $("#loading-modal").hide();
    HDC.showCount = 0;
};

function loadIng(){
    HDC.showLoading();
} 


var tabIndex = 0;
var tabMenus = new Array();
function loadModule(target, tab){
    loadIng();
    var $target = $(target);
    var nTotal = tab.cmsFiles.length;
    var tempHtml = new Array(nTotal);
    
    $('h2.blind.addTit').text($('.snb_accross li.on a').text());
    
    $.each(tab.cmsFiles, function(idx, path){
        $.ajax({
            url: path,
            success: function(modulData) {
                tempHtml[idx] = modulData;
            },
            error : function () {
                tempHtml[idx] = '';
            },
            complete: function(modulData) {             
                // 순서조정.
                nTotal--;
                if (nTotal != 0) return;
                
                for (var i = 0; i < tempHtml.length; i++) {
                    $target.append(tempHtml[i]);
                }
                
                
            }
        });
    });
}
 
 function moveTabByName(nm) {
    $.each(tabMenus, function(idx, menu){
        if (menu.name.indexOf(nm) >= 0) {
            $('#'+menu.id).trigger('click');
        }
    });
}

var tabInfo = [
    { 
    'menuId': '2',
    'menuNm': '상품요약소개',
    'cmsFiles': [
        './resources/html/benefit_01.html'
    ]
    },
    { 
      'menuId': '3',
      'menuNm': 'Invitation Only',
      'cmsFiles': [
               './resources/html/benefit_02.html'
      ]
    },
    { 
      'menuId': '4',
      'menuNm': '바우처',
      'cmsFiles': [
               './resources/html/benefit_03.html'             
      ]
    },
    { 
      'menuId': '5',
      'menuNm': '컨시어지',
      'cmsFiles': [

        './resources/html/benefit_04.html'             
]
    },
    { 
      'menuId': '6',
      'menuNm': '리워드',
      'cmsFiles': [

        './resources/html/benefit_01.html'             
]
    },
    { 
      'menuId': '7',
      'menuNm': '대한항공형',
      'cmsFiles': [

        './resources/html/benefit_01.html'             
]
    },
    { 
      'menuId': '8',
      'menuNm': '아시아나형',
      'cmsFiles': [

        './resources/html/benefit_01.html'             
]
    },
    { 
      'menuId': '9',
      'menuNm': 'M포인트형',
      'cmsFiles': [

        './resources/html/benefit_01.html'             
]
    },
    { 
      'menuId': '10',
      'menuNm': '프리미엄서비스',
      'cmsFiles': [

        './resources/html/benefit_02.html'             
]
    }
];
var tabInfoMenuLen = 0;

// hash 체크하여 해당 탭이 있으면 해당 탭으로 이동
var idx = null,
hash = window.location.hash;

if (hash) {
    if (hash.indexOf('#tabContent_') != -1)
    {
        var menuId = hash.split('#tabContent_')[1];
        for (var i=0, len=tabInfo.length; i<len; i++)
        {
            if (tabInfo[i].menuId == menuId)
            {
                idx = i;
                break;
            }
        }
    }
}


/* 2016-12-19 탭 수정 */
if (tabInfo.length > 0)
{
    if (idx != null)
    {
        $.each($('.snb_accross'), function() {
            $(this).find('li').eq(idx).addClass('on');
        });
        loadModule('.area-card-module-1', tabInfo[idx]);
    }
    else
    {
        $.each($('.snb_accross'), function() {
            $(this).find('li').eq(0).addClass('on');
        });
        loadModule('.area-card-module-1', tabInfo[0]);
    }
    $.each($('.snb_accross li a'), function() {
        if($(this).text() == '혜택시뮬레이션') {
            $(this).addClass('simul');
        }
    });
}
else
{
    alert('등록된 카드정보가 없습니다.'); 
}
/* // 2016-12-19 탭 수정 */


$(document).ready(function(){
    $('a.btn_gnbMenu').off('click').on('click',function(){
        var $gnb = $('#gnbMenu-area');

        if($(this).hasClass('close')){
			$(this).toggleClass('close');
			$('html').removeClass('menu-open');
			$gnb.hide();
			$gnb.find('.bg').hide();
			$gnb.find('.menu_area').css({'opacity':0, 'height':0}).hide();
			$gnb.find('.top_bar').hide();
			$('body').css('overflow','visible');
			window.scrollTo(0,parseInt($('html').attr('data-scr'))+1 );
			$('html,body').stop().animate({'scrollTop':parseInt($('html').attr('data-scr'))},100 );
			//gnbScrollFunc(false);

		} else {
			$('html').attr('data-scr',window.scrollY);
			$(this).toggleClass('close');
			$('html').addClass('menu-open');
			$gnb.show();
			$gnb.find('.bg').fadeToggle(100,'easeInOutCubic');
			$gnb.find('.menu_area').show().animate({'opacity':1, 'height':'100%'},400,'easeInOutCubic');
			$gnb.find('.top_bar').show();
			$('body').css('overflow','hidden');
			//gnbScrollFunc(true);
		}
	});
	setTimeout( function() {
		$('#gnbMenu-area .menu_area li.dep01 > div').addClass('submenu_div');
		$('#gnbMenu-area .menu_area').off('click', '#gnb li.dep01 a.dep01').on('click', '#gnb li.dep01 a.dep01' ,function(){
			$(this).parent().addClass('on').siblings().removeClass('on');
			gnbScrollFunc(true);
		});
	}, 100);

    $('.snb_accross li a').off('click').on('click',function(){
        var $this = $(this),
            $snb = $this.closest('.snb_accross'), // ul
            $snbs = $('.snb_accross'), 
            $li = $this.closest('li'),
            $li_idx = $snb.find('li').index($li),
            tabId = this.href.split('#tabContent_')[1];
        if ($li.hasClass('on')) return;
        $li.addClass('on').closest('ul').find('li').not($li).removeClass('on');
        hc_tabScrollTo($snb);
        $.each($snbs, function() {
            $(this).find('li').eq($li_idx).addClass('on').closest('ul').find('li').not($(this).find('li').eq($li_idx)).removeClass('on');
        });
        
        var div = $('.section-menu-1').children();
        //div.css('min-height', parseInt(_hgt+10)+'px' );
        $('.section-menu-1').children().html('');
        // $this.blur();
        
        //gnbClose();
        // window.scrollTo( 0, _hgt-1 );        // 아래로 스크롤하여 GNB숨김
        _conScroll = true;      // GNB가 스크롤에 따라 내려오지 않도록 설정
        var loadCallback = function() {
            _conScroll = true;      // GNB가 스크롤에 따라 내려오지 않도록 설정
            setTimeout( function() {
                if(!$this.parent().parent().hasClass('snbInCont')) {
                    window.scrollTo( 0, $('#area_visual').height() );
                }
                _conScroll = false; // gnb 다시 내려오게 설정
            },10);
        };
        setTimeout( function() {
            loadCallback();
        },100);
        
        for (var i in tabInfo)
        {
            if (tabInfo[i].menuId == tabId)
            {
                tabInfoMenuLen++;
                loadModule('.area-card-module-1', tabInfo[i]);
                // break;
            }
        }
        
        // $('body, html').scrollTop(_hgt); // 페이지 높이 만큼 아래로 이동
        
        $('.btn_open').attr('href', "javascript:detailView( $('.spread_list'), $('.btn_open'), true );");
        
    });
    /* // 2016-12-19 탭 수정 */
});

setTimeout( function() {
    if ( $('.snb_accross').length> 0) {
        $('.snb_accross li.active').addClass('on').siblings('li').removeClass('on');
        hc_tabScrollTo( $('.snb_accross') );
    }
}, 100);


