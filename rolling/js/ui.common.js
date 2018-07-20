;(function ($, win, doc, undefined) {

   var rollingTxt = function() {
       var $t = $('.rolling-txt'),
        $tip = $t.find('.tipItem'),
        $tipLen = $tip.length;

       var $current = 0,
        $area = $t.find('dd').eq(0),
        $clone = $tip.clone().addClass('clone'),
        tipLoop;

        $area.append($clone);
        var $newItem = $('.tipItem.clone');
        $newItem.eq($current).addClass('current');

        tipLoop = setInterval(function(){
            $newItem.removeClass();
            $newItem.eq($current-1).removeClass().addClass('tipItem clone prev');
            $newItem.eq($current).removeClass().addClass('tipItem clone current');
            if($current == $tipLen-1){ $current = -1; }
            $newItem.eq($current+1).addClass('tipItem clone next');
            $current += 1;
        },5000);

   } 

  
  


})(jQuery, window, document);