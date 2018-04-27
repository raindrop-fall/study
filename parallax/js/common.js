;(function ($, win, doc, undefined) {     
   
    
    var $page = $('.paging'),
        docH = $(doc).innerHeight();
        $page.find('span').eq(0).css('background-color','red');

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
            $page.find('span').css('background-color','white');
            $page.find('span').eq(0).css('background-color','red');
            
            }

            if(value > scene2PosT && value < scene3PosT ) {      // 장면2보다 크고, 장면 3보다 작을때 
                $('.scene-2').css('background-position-x', 0 - s2bg); //  장면 2 
                $page.find('span').css('background-color','white');
                $page.find('span').eq(1).css('background-color','red');                
            } 

            if(value >= scene3PosT )  {   
                var value2 = value - scene3PosT,
                    op = value2 * 0.0009,
                    s3boxH = $('.scene-3').height(),
                    s3boxHf = s3boxH / 2;

                    console.log(value2 +','+ s3boxHf);

                $page.find('span').css('background-color','white');
                $page.find('span').eq(2).css('background-color','red');                     
                if (op <= 1) {                  
                    $('.scene-3').find('div').css({'opacity': op} );    
                } 
                if (op <= 0.7) { 
                  if (value2 < 860 ) {
                    $('.scene-3').find('p').css({'opacity': 1,'bottom': value2 } ); 
                   } else if (value2 > 860 )  { 
                    $('.scene-3').find('p').css({'opacity': 1,'bottom': value } ); 
                   }
                }                       
            } else {
                $('.scene-3').find('div').css({'opacity': 0} );    
            }


       
    });



})(jQuery, window, document);