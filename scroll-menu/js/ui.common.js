;(function($, win, doc, undefined) {
    $(doc).ready(function(){
        
		var $scrollWrap = $('.ui_slide_nav'),
            $stage = $('.ui_content_sec'),
            $navItem = $scrollWrap.find('li'),
            $stageContainer = $('.ui_content_container'),
            $stageItem = $stageContainer.find('> .ui_content_item'),
            winWidth, contentWidth;

		var navArr = [];
        var selectedIndex = 0;
        
        var urlArr = [
			'/personal/main/UHPPCO0401D0.jsp',	// 홈
			'/personal/main/UHPPCO0401D2.jsp',	// 혜택
			'/personal/main/UHPPCO0401D3.jsp',	// 금융
			'/personal/main/UHPPCO0401D8.jsp',	// 자동차
			'/personal/main/UHPPCO0401D4.jsp',	// 포인트
			'/personal/main/UHPPCO0401D5.jsp',	// 라이프
			'/personal/main/UHPPCO0401D9.jsp',	// 안림 안심 서비스
			'/personal/main/UHPPCO0401D7.jsp'		// 디지털 라이프
        ];
        
        var stageFlip = new Flipsnap('.ui_content_container');			
        
        var navScroll = new SmoothScroll('.ui_slide_nav', {
			bounce: false, // 20160630 설정 추가
			scrollX: true, 
			scrollY: false, 
			useTransition:true, 
			scrollType: 'scroll', 
			getScrollerWidth: function(){ 
				return contentWidth;
			}, 
			selectors: {
				scroller: '>ul'
			}
		});


        $navItem.on('click','a',function(e){			
            var now = $(this).parent().index();            
			moveToPoint(now, 0, {mType:'click'});			
			return false;
        });	
        
        function moveToPoint(now, duration, type){
			
			console.log(urlArr.length, now);
			selectedIndex = now;
			selectPoint(now, duration);	// 20160704 loadHtml보다 우선 실행하도록
			
			//loadHtml(urlArr[now], now);	
			//if(now < urlArr.length-1) loadHtml(urlArr[now+1], $stageItem.eq(now+1));
			//if(now > 0) loadHtml(urlArr[now-1], $stageItem.eq(now-1));

        }
        
        function selectPoint(currentPoint, duration){
						
			stageFlip.moveToPoint(currentPoint, duration, {mType:'click'});
			
			$navItem.removeClass('on').eq(currentPoint).addClass('on');
			$('html, body').animate({'scrollTop': 0}, 0);
			
			// 20160630 currentPoint값 예외처리 -- start
			// 20160706 중앙정렬 처리 -- start
			//currentPoint = currentPoint > 0 ? currentPoint - 1 : currentPoint; // 20160706 주석처리
			//navScroll.scrollTo(-1*navArr[currentPoint],10,duration); // 20160706 주석처리
			var navItem_width = $navItem.eq(currentPoint).outerWidth(); // 20160706 선택메뉴 가로길이
			//navScroll.scrollTo(-1*(navArr[currentPoint]-($(window).width()/2)+(navItem_width/2)),10,duration);
			// 20160706 중앙정렬 처리 -- end
			// 20160630 currentPoint값 예외처리 -- end

			$navItem.eq(currentPoint).find('a').attr('title', '선택됨').parent().siblings().find('a').attr('title', '미선택됨'); // 웹접근성_3차_추가_이성진
		}

        function resizeStage(){
						
			winWidth = $(window).width();			
			var stageW = winWidth;	
			var itemLen = $navItem.length;		
			var totalW = 0;
				
			navArr = [];	
			navArr.push(totalW);
			
			$navItem.each(function(i, item){					
				totalW = totalW + $(item).outerWidth(true);		
				navArr.push(totalW);					
			});			
			
			$stageContainer.width(stageW*itemLen);
			$scrollWrap.find('ul').width(totalW);
			contentWidth = totalW;
			$stageItem.width(stageW);
									
			//navScroll.refresh();
			
			stageFlip.distance = stageW;			
			stageFlip.refresh(false);
			
			
		}


		
		$(window).on('resizeend', function(e) {			
			resizeStage();
			
		});
		
		resizeStage();






    });
})(jQuery, window, document);