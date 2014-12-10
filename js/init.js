(function(){
	/*四列*/
	var gColumn4TelTitle = $('.g-column4-tel-title');
	if(gColumn4TelTitle.elements.length){
		for(var i=0;i<gColumn4TelTitle.elements.length;i++){
			(function(i){
				gColumn4TelTitle.eq(i).toggle(function(){
					gColumn4TelTitle.eq(i).next().css('display','block');
				},function(){
					gColumn4TelTitle.eq(i).next().css('display','');
				});
			})(i);
		}
	}
})();