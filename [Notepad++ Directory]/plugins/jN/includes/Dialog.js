(function(){
	Dialog = function (cfg){
		this.cfg = cfg || {};
		this.htmlDialog = createDialog(this.cfg); 
		try{
			var d = this.htmlDialog.document;
			d.write("<html><head></head><body></body></html>");
			d.close();

			// provide Dialog reference to IE 
			d.Dialog = this;

			var styles = d.createElement('style');
			styles.setAttribute('type', 'text/css');
			styles.styleSheet.cssText = this.cfg.css || '\nbody {overflow: auto;}\n';

			var headRef = d.getElementsByTagName('head')[0];
			headRef.appendChild(styles); 
			
			d.body.innerHTML = this.cfg.html || "";
			
			for(var el in this.cfg){
				if (!/^(css|html|oncreate)$/i.test(el) && this.htmlDialog[el]!=undefined){
					this.htmlDialog[el] = this.cfg[el];
				}
			}
			
		}catch(e){
			debug(e);
		}

		if (typeof(this.cfg.oncreate)=="function")
			this.cfg.oncreate.call(this.htmlDialog.document);
		
	};

	Dialog.prototype.show = function(){
		this.htmlDialog.visible = true;	
	}
	Dialog.prototype.hide = function(){
		this.htmlDialog.visible = false;	
	}
	Dialog.prototype.close = function(){
		this.htmlDialog.close();	
	}
	
	Dialog.prompt = function(title, value, func){
		new Dialog({
			npp: Editor,
			html: "<input type='text' id='prompt_str' style='width:100%' onkeypress='Dialog.cfg.onKeyDown(window.event, Dialog);' />", 
			height: 100,
			width: 300,
			title: title,
			css: "body{background-color: buttonface; overflow:auto;}",
			oncreate: function(){
				var el = this.getElementById("prompt_str");
				el.value = value;
				el.focus();
			},
			onKeyDown: function(evt, dialog) {
				var target = evt.srcElement || evt.target,
					keycode = evt.keyCode || evt.which;
					
				if (keycode == 27 || keycode == 13) { 
					// escape or enter key pressed
					var value = null;
					if (keycode == 13)
						value = target.value;
						
					try{
						switch(typeof(func)){
						case "object": 
							if (func.cmd(value) == false) return;
							break;
						case "function":
							if (func(value) == false) return;
							break;
						}
					}catch(e){}
					
					dialog.hide();
				}
			}
		});
	};
})();

//new Dialog({onbeforeclose:function(){ alert('bc'); return false;}, onclose:function(){alert('aa')}, oncreate: function(){ this.getElementById('prompt_str').focus();} ,css: "body{background-color: buttonface; overflow:auto;}", html:"<input type='text' id='prompt_str' style='width:100%' onkeypress='Dialog.close()' /><br/><a href='http://www.softwarecanoe.de' target='_blank'>www.softwarecanoe.de</a>"});


