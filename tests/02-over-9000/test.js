(function(){

    var button = document.getElementsByClassName('button')[0];
    var select = document.getElementById('select_framework');
    var times = document.getElementById('select_times');
    var counter = 0;

    function runTest(id){
        var results = document.getElementsByClassName('results_' + id)[0].getElementsByClassName('content')[0];
        results.innerHTML += print('running...', 'running');
        var r = document.getElementById('iframe_' + id).contentWindow.runTest();
        document.getElementById('running').remove();
        results.innerHTML += print(r.time + ' ms');
    }

    function print(str, id){
        return '<div class="row pad-sm"' + (id != null ? ' id="' + id + '"' : '') + '>' + str + '</div>'
    }
    button.onclick = function(){
        counter = 0;
        button.style.display = 'none';
        var len = parseInt(times.value);
        setTimeout(function(){
            run();
        },1);
        
        function run(){
            if(select.value == 'all'){
                runTest('jquery');
                runTest('zepto');
                runTest('selector');
            }else{
                runTest(select.value);
            }
            counter++
            if(counter < len){
                setTimeout(function(){
                    run();
                },1);
            }else{
                button.style.display = 'block';
            }
        }
    }
})();