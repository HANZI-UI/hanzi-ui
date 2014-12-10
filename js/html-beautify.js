/*

 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
    http://jsbeautifier.org


  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    style_html(html_source);

	修改只编辑html
*/

function style_html(html_source, indent_size, indent_character) {
	// Parser可以看做类，multi_parser可以看做是Parser的实例对象
	var Parser, multi_parser;

	function Parser() {
		// 当前字符所在的位置
		this.pos = 0;
		// 当前需要输出的标记的类型（在HTML中只有两种类型 - 内容和标签）
		this.current_mode = 'CONTENT';
		// 记录页面中标签的存储结构，目的是为了在结束标签时设置缩进级别
		// 个人觉得这个地方处理的有点拗口，我们完全可以使用栈来解决
		this.tags = {
			parent: 'parent1',
			parentcount: 1,
			parent1: ''
		};
		// 当前标记的正文和类型
		this.token_text = '';
		this.token_type = '';

		this.Utils = {
			// 空白字符，这些字符将会被简单的空格取代
			whitespace: "\n\r\t ".split(''),
			// 下面这些标签被认为是独立标签
			single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','),
			// what是否在数组arr中
			in_array: function(what, arr) {
				for (var i = 0; i < arr.length; i++) {
					if (what === arr[i]) {
						return true;
					}
				}
				return false;
			}
		}

		// 获取当前正文的标记
		this.get_content = function() {
			var input_char = '';
			var content = [];
			var space = false;
			// 下一个"<"之前的都是正文
			while (this.input.charAt(this.pos) !== '<') {
				if (this.pos >= this.input.length) {
					return content.length ? content.join('') : ['', 'TK_EOF'];
				}

				input_char = this.input.charAt(this.pos);
				this.pos++;

				if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
					if (content.length) {
						space = true;
					}
					continue;
				}
				else if (space) {
					content.push(' ');
					space = false;
				}
				content.push(input_char);
			}
			return [content.length ? content.join('') : '', "TK_CONTENT"];
		}

		this.record_tag = function(tag) { //function to record a tag and its parent in this.tags Object
			if (this.tags[tag + 'count']) { //check for the existence of this tag type
				this.tags[tag + 'count']++;
				this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
			}
			else { //otherwise initialize this tag type
				this.tags[tag + 'count'] = 1;
				this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
			}
			this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
			this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
		}

		this.retrieve_tag = function(tag) { //function to retrieve the opening tag to the corresponding closer
			if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
				var temp_parent = this.tags.parent; //check to see if it's a closable tag.
				while (temp_parent) { //till we reach '' (the initial value);
					if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
						break;
					}
					temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
				}
				if (temp_parent) { //if we caught something
					this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
					this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
				}
				delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
				delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
				if (this.tags[tag + 'count'] == 1) {
					delete this.tags[tag + 'count'];
				}
				else {
					this.tags[tag + 'count']--;
				}
			}
		}

		// 获取当前标签的标记
		this.get_tag = function() {
			var input_char = '';
			var content = [];
			var space = false;

			do {
				if (this.pos >= this.input.length) {
					return content.length ? content.join('') : ['', 'TK_EOF'];
				}

				input_char = this.input.charAt(this.pos);
				this.pos++;

				if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
					space = true;
					continue;
				}

				if (input_char === '=') {
					space = false;
				}
				// "="和">"之前不要有空格
				if (content.length && content[content.length - 1] !== '=' && input_char !== '>' && space) {
					content.push(' ');
					space = false;
				}
				content.push(input_char);
			} while (input_char !== '>');

			var tag_complete = content.join('');
			var tag_index;
			if (tag_complete.indexOf(' ') != -1) {
				tag_index = tag_complete.indexOf(' ');
			}
			else {
				tag_index = tag_complete.indexOf('>');
			}
			var tag_check = tag_complete.substring(1, tag_index).toLowerCase();

			var tag_type = "";
			if (tag_complete.charAt(tag_complete.length - 2) === '/' || this.Utils.in_array(tag_check, this.Utils.single_token)) {
				tag_type = 'SINGLE';
			}
			else {
				if (tag_check.charAt(0) === '/') {
					// 结束标签，设置当前indent_level并且将此标签从this.tags中移除，包含此标签的所有子标签
					this.retrieve_tag(tag_check.substring(1));
					tag_type = 'END';
				}
				else {
					// 开始标签，将此标签添加到this.tags
					this.record_tag(tag_check);
					tag_type = 'START';
				}
			}
			return [content.join(''), "TK_TAG_" + tag_type];
		}

		// 获取下一个标记
		this.get_token = function() {
			if (this.current_mode === 'CONTENT') {
				return this.get_content();
			}

			if (this.current_mode === 'TAG') {
				return this.get_tag();
			}
		}

		this.printer = function(js_source, indent_character, indent_size) {
			this.input = js_source || '';
			this.output = [];
			this.indent_character = indent_character || ' ';
			this.indent_string = '';
			this.indent_size = indent_size || 2;
			this.indent_level = 0;
			for (var i = 0; i < this.indent_size; i++) {
				this.indent_string += this.indent_character;
			}

			this.print_newline = function(ignore, arr) {
				this.line_char_count = 0;
				if (!arr || !arr.length) {
					return;
				}
				if (!ignore) {
					while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
						arr.pop();
					}
				}
				arr.push('\n');
				for (var i = 0; i < this.indent_level; i++) {
					arr.push(this.indent_string);
				}
			}

			this.print_token = function(text) {
				this.output.push(text);
			}

			this.indent = function() {
				this.indent_level++;
			}

			this.unindent = function() {
				if (this.indent_level > 0) {
					this.indent_level--;
				}
			}
		}
		return this;
	}

	/*_____________________--------------------_____________________*/

	// 创建Parser的实例，设置Parser构造函数中的this指向multi_parser对象，同时执行此函数
	multi_parser = new Parser();
	// 调用printer函数，此时printer函数中的this也指向multi_parser对象
	multi_parser.printer(html_source, indent_character, indent_size); //initialize starting values

	// 循环获取每一个标记（Token）直到结束
	while (true) {
		var t = multi_parser.get_token();
		// 当前标记的内容和类型
		multi_parser.token_text = t[0];
		multi_parser.token_type = t[1];

		// 如果这是一个结束标记，跳出循环
		if (multi_parser.token_type === 'TK_EOF') {
			break;
		}

		switch (multi_parser.token_type) {
			case 'TK_TAG_START':
				// 标签开始 - 1.输出新行 2.输出标记内容 3.下一个标记缩进一个单位 4.下一个标记类型为内容
				multi_parser.print_newline(false, multi_parser.output);
				multi_parser.print_token(multi_parser.token_text);
				multi_parser.indent();
				multi_parser.current_mode = 'CONTENT';
				break;
			case 'TK_TAG_END':
				// 标签结束 - 1.输出新行 2.输出标记内容 3.下一个标记类型为内容
				multi_parser.print_newline(true, multi_parser.output);
				multi_parser.print_token(multi_parser.token_text);
				multi_parser.current_mode = 'CONTENT';
				break;
			case 'TK_TAG_SINGLE':
				// 独立标签（比如<br />） - 1.输出新行 2.输出标记内容 3.下一个标记类型为内容
				multi_parser.print_newline(false, multi_parser.output);
				multi_parser.print_token(multi_parser.token_text);
				multi_parser.current_mode = 'CONTENT';
				break;
			case 'TK_CONTENT':
				// 内容 - 1.输出新行 2.输出标记内容 3.下一个标记类型为标签
				if (multi_parser.token_text !== '') {
					multi_parser.print_newline(false, multi_parser.output);
					multi_parser.print_token(multi_parser.token_text);
				}
				multi_parser.current_mode = 'TAG';
				break;
		}
	}
	// 最终结果
	return multi_parser.output.join('');
}
