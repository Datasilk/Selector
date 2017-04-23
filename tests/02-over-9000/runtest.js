function runTest(){
    var start = new Date();
    console.log('running test...');
    var index = 0;
    for(var x = 0; x <= 10000; x++){
        //append 10,000 blocks of HTML (30,000 DOM elements)
        index++;
        if(index > 5){index = 1;}
        $('body').append('<div class="row"><div clas="col"><input type="text" class="textbox item-' + index + '"></div></div>');
    }

    //destroy test
    $('.row').remove();
    
    return {time: (new Date()) - start};
}