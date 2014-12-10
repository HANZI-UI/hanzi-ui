function myAddEvent(obj, sEvent, fn){
	if(obj.attachEvent){
		obj.attachEvent('on'+sEvent, function (){
			if(false==fn.call(obj, event)){
				event.cancelBubble=true;
				
				return false;
			}
		});
	}else{
		obj.addEventListener(sEvent, function (ev){
			if(false==fn.call(obj, ev)){
				ev.cancelBubble=true;
				ev.preventDefault();
			}
		}, false);
	}
}

function getByClass(oParent, sClass){
	var aEle=oParent.getElementsByTagName('*');
	var aResult=[];
	var i=0;

	for(i=0;i<aEle.length;i++){
		var classNames = aEle[i].className;
		var aClass = classNames?classNames.split(' '):'';
		
		if(aClass && aClass.length==1){
			if(aClass[0]==sClass){
				aResult.push(aEle[i]);
			}
		}else{
			for(var j=0;j<aClass.length;j++){
				if(aClass[j]==sClass){
					aResult.push(aEle[i]);
				}
			}
		}
	}

	/*var re=new RegExp('\\b'+sClass+'\\b', 'i');
	var i=0;
	
	for(i=0;i<aEle.length;i++){
		if(re.test(aEle[i].className)){
			aResult.push(aEle[i]);
		}
	}*/
	
	return aResult;
}

function getStyle(obj, attr){
	return obj.currentStyle?obj.currentStyle[attr]:getComputedStyle(obj, false)[attr];
}

Array.prototype.appendArr = function (arr1){
	var i=0;
	for(i=0;i<arr1.length;i++){
		this.push(arr1[i]);
	}
};

function BailuEgret(vArg){
	this.elements=[];	//存被选出来的东西
	
	switch(typeof vArg){
		case 'function':
			//window.onload=vArg;
			myAddEvent(window, 'load', vArg);
			break;
		case 'string':
			switch(vArg.charAt(0)){
				case '#':
					this.elements.push(document.getElementById(vArg.substring(1)));
					break;
				case '.':
					this.elements=getByClass(document, vArg.substring(1));
					break;
				default:
					if(/</.test(vArg)){
						var oDiv=document.createElement('div');
						oDiv.innerHTML=vArg;
						
						this.elements.appendArr(oDiv.childNodes);
					}else{
						this.elements=document.getElementsByTagName(vArg);
					}
			}
			break;
		case 'object':
			this.elements.push(vArg);
			break;
	}
}

BailuEgret.prototype.show = function (){
	var i=0;
	
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.display='block';
	}
	
	return this;
};

BailuEgret.prototype.add = function (vArg){
	this.elements.push($(vArg).elements[0]);
	return this;
};

BailuEgret.prototype.hide = function (){
	var i=0;
	
	for(i=0;i<this.elements.length;i++){
		this.elements[i].style.display='none';
	}
	
	return this;
};

BailuEgret.prototype.appendTo = function (vArg){
	var i=0;
	
	for(i=0;i<this.elements.length;i++){
		$(vArg).elements[0].appendChild(this.elements[i]);
	}
};

BailuEgret.prototype.append = function (vArg){
	//var i=0;
	var oDiv=document.createElement('div');
		oDiv.innerHTML = vArg;
	var ss = this.elements[0];
	ss.appendChild(oDiv);
};

BailuEgret.prototype.remove = function (){
	var choiceNode = this.elements[0];
		choiceNode.parentNode.removeChild(choiceNode);
};

BailuEgret.prototype.children = function (){
	var aResult=[];
	var newBailuEgret=$();
	var i=0;
	
	for(i=0;i<this.elements.length;i++){
		aResult.appendArr(this.elements[i].children);
	}
	
	newBailuEgret.elements=aResult;
	
	return newBailuEgret;
};

BailuEgret.prototype.bind = function (sEvent, fn){
	var i=0;
	
	for(i=0;i<this.elements.length;i++){
		myAddEvent(this.elements[i], sEvent, fn);
	}
	
	return this;
};

BailuEgret.prototype.click = function (fn){
	this.bind('click', fn);
	
	return this;
};

BailuEgret.prototype.hover = function (fnOver, fnOut){
	this.bind('mouseover', fnOver);
	this.bind('mouseout', fnOut);
	
	return this;
};

BailuEgret.prototype.css = function (attr, value){
	if(arguments.length==2){
		var i=0;
		
		for(i=0;i<this.elements.length;i++){
			this.elements[i].style[attr]=value;
		}
	}
	else if(arguments.length==1){
		if(typeof attr=='string'){
			return getStyle(this.elements[0], attr);
		}else{
			for(var a in attr){
				for(i=0;i<this.elements.length;i++){
					this.elements[i].style[a]=attr[a];
				}
			}
		}
	}
	
	return this;
};

BailuEgret.prototype.toggle = function (){
	var i=0;
	var _arguments=arguments;
	
	for(i=0;i<this.elements.length;i++){
		addToggle(this.elements[i]);
	}
	
	function addToggle(oBtn){
		var count=0;
		myAddEvent(oBtn, 'click', function (){
			_arguments[count%_arguments.length]();
			count++;
		});
	}
	
	return this;
};

BailuEgret.prototype.attr = function (attr, value){
	var i=0;
	//attr=='class'?attr='className':attr;
	if(arguments.length==2){
		for(i=0;i<this.elements.length;i++){
			//this.elements[i][attr]=value;
			this.elements[i].setAttribute(attr, value);
		}
	}else{
		return this.elements[0].getAttribute(attr);
	}
	
	return this;
};

BailuEgret.prototype.eq = function (index){
	return $(this.elements[index]);
};

BailuEgret.prototype.addClass = function (className){
	var getObj = this.elements[0],
		getClassName = getObj.className.split(' ');

		for(var i=0; i<getClassName.length;i++){
			if(getClassName[i] == className){
				getClassName.splice(i,1);
			}
		}
		
		getClassName.push(className);

		getObj.className = getClassName.join(' ');

		return this;
};

BailuEgret.prototype.removeClass = function (className){
	var getObj = this.elements[0],
		getClassName = getObj.className.split(' ');

		if(getClassName.length > 1){
			for(var i=0; i<getClassName.length;i++){
				if(getClassName[i] == className){
					getClassName.splice(i,1);
				}
			}
		}

		//getClassName.push(className);

		getObj.className = getClassName.join(' ');

		return this;
};

BailuEgret.prototype.hasClass = function (className){
	var getObj = this.elements[0],
		getClassName = getObj.className,
		getClassNames = getClassName.split(' '),
		isTrue = false;

		
		for(var i=0; i<getClassNames.length;i++){
			if(getClassNames[i] == className){
				isTrue = true;
			}
		}

		return isTrue;
};

BailuEgret.prototype.find = function (str){
	var i=0;
	var newBailuEgret=$();
	var aResult=[];
	
	for(i=0;i<this.elements.length;i++){
		switch(str.charAt(0)){
			case '.':
				aResult.appendArr(getByClass(this.elements[i], str.substring(1)));
				break;
			default:
				aResult.appendArr(this.elements[i].getElementsByTagName(str));
				break;
		}
	}
	
	//aResult	[li,li,li,li]
	
	newBailuEgret.elements=aResult;
	
	return newBailuEgret;
};

BailuEgret.prototype.index = function (){
	var obj=this.elements[0];
	var brother=obj.parentNode.children;
	var i=0;
	
	for(i=0;i<brother.length;i++){
		if(brother[i]==obj){
			return i;
		}
	}
};

BailuEgret.prototype.html = function (str){
	if(arguments.length>0){
		this.elements[0].innerHTML = str;
	}else{
		this.elements[0].innerHTML
	}
	return this;
};

BailuEgret.prototype.val = function (value){
	if(arguments.length>0){
		this.elements[0].value = value;
	}else{
		this.elements[0].value
	}
	return this;
};

BailuEgret.prototype.next = function (){
	return $(this.elements[0].nextElementSibling||this.elements[0].nextSibling);
};
	

$.extend = function (name, fn){
	$[name]=fn;
	BailuEgret.prototype[name]=fn;
};

function $(vArg){
	return new BailuEgret(vArg);
}