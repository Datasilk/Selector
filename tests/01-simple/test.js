// selector.js (under 5 KB minified gzipped)
// developed by Mark Entingh (www.markentingh.com)
// looks like jQuery, acts like jQuery, but isn't jQuery.

(function(){
  var hello = 0;
	var style = 0;
  
  $('.hello-world').on('click', function(e){
  	hello = hello >= 5 ? 0 : hello + 1;
    switch(hello){
    	case 0: $(this).html('Hello World'); break;
    	case 1: $(this).html('That tickles...'); break;
    	case 2: $(this).html('No more, please.'); break;
    	case 3: $(this).html('This is torture!'); break;
    	case 4: $(this).html('Okay, now I\'m angry.'); break;
    	case 5: $(this).html('Goodbye.'); break;
    }
  });

  $('.change-style').on('click', function(e){
  	style = style >= 5 ? 0 : style + 1;
    switch(style){
    	case 0:
      	$(this).css({'font-size':24, backgroundColor:'#0066ff', border:'2px solid #0033cc'});
        break;
    	case 1:
      	$(this).css({'font-size':10, backgroundColor:'#ace600', border:'1px solid #86b300'});
        break;
    	case 2:
      	$(this).css({'font-size':17, backgroundColor:'#ff9900', border:'3px solid #ff6600'});
        break;
    	case 3:
      	$(this).css({'font-size':40, backgroundColor:'#0099e6', border:'8px solid #0066cc'});
        break;
    	case 4:
      	$(this).css({'font-size':28, backgroundColor:'#ff6666', border:'4px solid #ff3333'});
        break;
    	case 5:
      	$(this).css({'font-size':14, backgroundColor:'#ffcc00', border:'2px solid #ffa64d'});
        break;
    }
    
  });

  $('#texter').on('keyup', function(e){
    $('.result').html($(this).val());
  });

  $('.teleport a').on('click', function(){
    var speed = 2000;
    if($(this).parents('.teleport').find('.hello-world').length > 0){
      //teleport back to original spot
      $('.teleport .buttons').animate({opacity:0}, speed);
      setTimeout(function(){
        $('.header').append($('.buttons'));
        $('.buttons, .beam').animate({opacity:1}, speed);
        $('.beam').show();
      }, speed);
    }else{
      $('.buttons, .beam').animate({opacity:0}, speed);
      setTimeout(function(){
        $('.beam').hide();
        $('.teleport .platform').append($('.buttons'));
        $('.buttons').animate({opacity:1}, speed);
      }, speed);
    }


  });
})();