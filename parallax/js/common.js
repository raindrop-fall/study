;(function ($, win, doc, undefined) {     

    var $page = $('.paging'),
        docH = $(doc).innerHeight();        
        $page.find('span').eq(0).addClass('on');

    $(window).scroll(function() {
        var value = $(window).scrollTop(), 
            scene2PosT = $('.scene-2').offset().top,
            scene3PosT = $('.scene-3').offset().top,
            s1bg = value/8,
            s1Txt = value * 0.002,
            opNum = 0.8,
            s2bg = value / 8;

            if(value < scene2PosT) { // 장면 2 보다 작을때 
            $('.scene-1').css('background-position-y', 0 - s1bg); //  장면 1    
            $('.scene-1').find('p').css({'opacity': opNum - s1Txt, 'margin-top' : value } ); //  장면 1  
            $page.find('span').removeClass('on');
            $page.find('span').eq(0).addClass('on');
            
            }

            if(value > scene2PosT && value < scene3PosT ) {      // 장면2보다 크고, 장면 3보다 작을때 
                $('.scene-2').css('background-position-x', 0 - s2bg); //  장면 2 
                $page.find('span').removeClass('on');
                $page.find('span').eq(1).addClass('on');             
            } 

            if(value >= scene3PosT )  {   
                var value2 = value - scene3PosT,
                    op = value2 * 0.0009,
                    s3boxH = $('.scene-3').height(),
                    s3boxHf = s3boxH / 2,
                    endNum = value2 * 0.35;

                    console.log(value2 +','+ s3boxHf);

                $page.find('span').removeClass('on');
                $page.find('span').eq(2).addClass('on');                    
                if (op <= 1) {                  
                    $('.scene-3').find('div').css({'opacity': op} );    
                } 
                if (op <= 0.7) { 
                    $('.end-msg').css({'display':'block', 'bottom': endNum });
                 

                }   
            } else {
                $('.scene-3').find('div').css({'opacity': 0} );    
                $('.end-msg').css({'display':'none'});
            }

    });



})(jQuery, window, document);