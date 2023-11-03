$(document).ready(function (){
	var activeTD = $(".top-submenu td.active");
	
	$(document).click( function(event){
		var target = $(event.target);
		if (target.closest('.buble-menu-borders').length != 0) {
			return;
		}
		if( $(event.target).closest(".hidden-items").length ) 
			return;
		$(".hidden-items a").css("display", "none");
		$(".addition a.key").css("display", "block");
		$(".hidden-items").removeClass("active");
		$(".addition td").css("border-color", "#e0e0e0");
		$(".noactive-platforms").show();
		$("#finamtrade-holder").removeClass("active");
		$(".finamtrade-links").css("height", "auto");
		$("#finamtrade").children("span").removeClass("black").addClass("js");
		activeTD.addClass("active");
		$(".buble-menu").hide();
		$(".top-submenu td.split").css("border-bottom", "none");
		event.stopPropagation();
		
		$(".top-menu .other a, .top-menu .user a").parent().removeClass("active");
		$(".top-menu .other a:first, .top-menu .user a:first").addClass("arrow-down-white");
		$(".top-menu .other a, .top-menu .user a").children("span").removeClass("arrow-down-black");	
		$("#other-menu, #user-menu").hide();
		$(".chat-view-div, .choose").slideUp("fast");
	});
	
	$(".addition a.key").click(function (){
		$(".addition a").css("display", "none");
		if(!$(this).parent().hasClass("active")){
			$(".addition a.key").css("display", "block");
			$(this).parent().children("a").css("display", "block");
			$(".addition td").css("border-color", "#e0e0e0");
			$(this).parent().parent().parent().css("border-color", "#f2f2f2");
			$(".hidden-items").removeClass("active");
			$(this).parent().addClass("active");
		}
		else{
			$(this).parent().children("a").css("display", "none");
			$(".addition a.key").css("display", "block");
			$(this).parent().parent().parent().css("border-color", "#e0e0e0");
			$(this).parent().removeClass("active");	
		}
		return false;
	});
		
	$("#main_menu").hide();
	$('HTML').click(function(event) {
		if ($(event.target).closest('.buble-menu-borders').length == 0) {
			$(".sub").hide();
			$(".top-submenu .menu td").removeClass("opened");
		}
	});
	$(".top-submenu td.subable > a").click(function (event){
		$(".buble-menu").hide();
		var is_active,
			td = $(this).parent(),
			buble_menu = "#"+td.attr("id")+"_buble_menu";
		
		if(td.hasClass("active")) is_active = true;
		activeTD.addClass("active");
		td.removeClass("active");
		
		if (!td.hasClass("opened")) {
			$(".top-submenu .menu td").removeClass("opened");
			td.addClass("opened");
			$(buble_menu).show();
			$(".top-submenu td.split").css("border-bottom", "2px solid #e0e0e0");
		} else {
			activeTD.addClass("active");
			$(".top-submenu .menu td").removeClass("opened");
			td.removeClass("opened");
			$(buble_menu).hide();
			$(".top-submenu td.split").css("border-bottom", "none");
		}
		return false;
	});
	
	$("#finamtrade-holder #finamtrade, .noactive-platforms").click(function (){
		if(!$("#finamtrade-holder").hasClass("active")){
			$(".noactive-platforms").hide();
			$("#finamtrade-holder").addClass("active");
			$(".finamtrade-links").css("height", "19px");
			$("#finamtrade").children("span").addClass("black").removeClass("js");
		}
		else{
			$(".noactive-platforms").show();
			$("#finamtrade-holder").removeClass("active");
			$(".finamtrade-links").css("height", "auto");
			$("#finamtrade").children("span").removeClass("black").addClass("js");	
		}
		return false;
	})
	
	$(".top-menu .other a.arrow-down-white").click(function(e) {
		if(!$(this).parent().hasClass("active")){
        	$(this).parent().addClass("active");
			$(this).removeClass("arrow-down-white");
			$(this).children("span").addClass("arrow-down-black");
			$("#other-menu").show();
		}
		else{
			$(this).parent().removeClass("active");
			$(this).addClass("arrow-down-white");
			$(this).children("span").removeClass("arrow-down-black");	
			$("#other-menu").hide();
		}
		return false;
    });
	/*$("#user-informer-name").click(function(e) {
		if(!$(this).parent().hasClass("active")){
        	$(this).parent().addClass("active");
			$(this).removeClass("arrow-down-white");
			$(this).children("span").addClass("arrow-down-black");
			$("#user-menu").show();
		}
		else{
			$(this).parent().removeClass("active");
			$(this).addClass("arrow-down-white");
			$(this).children("span").removeClass("arrow-down-black");	
			$("#user-menu").hide();
		}
		return false;
	});*/

    //fix placeholder beahvior
	$('input:text, textarea').each(function(){
	    var $this = $(this);
	    $this.data('placeholder', $this.attr('placeholder'))
             .focus(function(){$this.removeAttr('placeholder');})
             .blur(function(){$this.attr('placeholder', $this.data('placeholder'));});
	});
})
