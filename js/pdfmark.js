var mark_list = new Object();

var stock_pinpoint = document.createElement("div");
stock_pinpoint.className = "pinpoint";

var stock_pinpoint_close = document.createElement("span");
stock_pinpoint_close.className = "pinpoint_close";
stock_pinpoint_close.appendChild(document.createTextNode("X"));
stock_pinpoint.appendChild(stock_pinpoint_close);

var stock_pinpoint_text = document.createElement("p");
stock_pinpoint_text.className = "pinpoint_text";
stock_pinpoint.appendChild(stock_pinpoint_text);

var stock_pinpoint_label = document.createElement("label");
stock_pinpoint_label.className = "pinpoint_label";
stock_pinpoint_label.textContent = "value:";
stock_pinpoint.appendChild(stock_pinpoint_label);

var stock_pinpoint_input = document.createElement("input");
stock_pinpoint_input.className = "pinpoint_input";
stock_pinpoint_input.type = "text";
stock_pinpoint.appendChild(stock_pinpoint_input);

var stock_pinpoint_save = document.createElement("input");
stock_pinpoint_save.className = "pinpoint_save";
stock_pinpoint_save.type = "button";
stock_pinpoint_save.disabled = true;
stock_pinpoint_save.value = "SAVE";
stock_pinpoint.appendChild(stock_pinpoint_save);

function addToMarks(new_mark){
	for(o in mark_list){
		if(	mark_list[o].start_line < new_mark.start_line &&
			mark_list[o].end_line   > new_mark.start_line)
		{
			console.log("NO");
			return false;
		}
	}
	console.log(new_mark.mark_id);
	mark_list[new_mark.mark_id] = new_mark;

	renderMark(new_mark.page, new_mark.start_line, new_mark.start_char, new_mark.end_line, new_mark.end_char, new_mark.text, new_mark.mark_id);
	//upload mark

	return true;
}

function renderMark(page, start_node_index, start_text_index, end_node_index, end_text_index, mark_text, mark_id){

	var parent_node = document.getElementById("textLayer");
	if(start_node_index != end_node_index){
		for(var i = start_node_index; i <= end_node_index; i++){
			var child_node = parent_node.children[i];
			var text = child_node.textContent;

			if (i == start_node_index) {
				var marked = text.substr(start_text_index);
				var new_mark = document.createElement("mark");
				//var left_drag = document.createElement("span");
				//left_drag.className = "drag start";
				//new_mark.appendChild(left_drag);
				new_mark.appendChild(document.createTextNode(marked));
				new_mark.className = mark_id + "_highlight";

				var length = child_node.childNodes.length;
				var line_array = [];
				for(k = 0; k < length; k++){
					line_array.push(child_node.childNodes[k]);
				}

				var last_node = line_array.pop();
				var pre_node = document.createTextNode(last_node.textContent.substr(0,last_node.textContent.length-new_mark.textContent.length));

				line_array.push(pre_node);
				line_array.push(new_mark);

				while(child_node.firstChild){
					child_node.removeChild(child_node.firstChild);
				}

				for(q in line_array){
					child_node.appendChild(line_array[q]);
				}

			} else if (i == end_node_index) {

				var marked = text.substr(0, end_text_index);
				var new_mark = document.createElement("mark");
				//var right_drag = document.createElement("span");
				//right_drag.className = "drag end";
				new_mark.appendChild(document.createTextNode(marked));
				//new_mark.appendChild(right_drag);
				new_mark.className = mark_id + "_highlight";

				var line_array = [];
				line_array.push(new_mark);
				var first_node = child_node.firstChild;

				var post_node = document.createTextNode(first_node.textContent.substr(new_mark.textContent.length));
				line_array.push(post_node);

				child_node.removeChild(child_node.firstChild);

				for(k = 0; k < child_node.childNodes.length; k++){
					line_array.push(child_node.childNodes[k]);
				}

				while(child_node.firstChild){
					child_node.removeChild(child_node.firstChild);
				}

				for(q in line_array){
					child_node.appendChild(line_array[q]);
				}

			} else {
				var new_mark = document.createElement("mark");
				new_mark.appendChild(document.createTextNode(text));
				new_mark.className = mark_id + "_highlight";
				child_node.removeChild(child_node.childNodes[0]);
				child_node.appendChild(new_mark);
			}
		}
	} else {
		var child_node = parent_node.children[start_node_index];
		var text = child_node.textContent;

		var line_array = [];
		var target_node_index = -1;
		var total_length = 0;
		var pre_length = 0;
		var post_length = 0;


		for(k = 0; k < child_node.childNodes.length; k++){
			line_array.push(child_node.childNodes[k]);

			if(target_node_index == -1){
				total_length += child_node.childNodes[k].textContent.length;
				if(total_length > start_text_index){
					target_node_index = k;
				} else {
					pre_length += child_node.childNodes[k].textContent.length;
				}
			} else {
				post_length += child_node.childNodes[k].textContent.length;
			}
		}
		var not_marked_start = text.substr(pre_length, start_text_index - pre_length);
		var marked = text.substr(start_text_index, end_text_index - start_text_index);
		var not_marked_end = text.substr(end_text_index, child_node.textContent.length - post_length - pre_length - marked.length - not_marked_start.length);

		var new_mark = document.createElement("mark");
		new_mark.appendChild(document.createTextNode(marked));
		new_mark.className = mark_id + "_highlight";

		child_node.removeChild(child_node.childNodes[target_node_index]);

		child_node.insertBefore(document.createTextNode(not_marked_end), child_node.childNodes[target_node_index]);
		child_node.insertBefore(new_mark, child_node.childNodes[target_node_index]);
		child_node.insertBefore(document.createTextNode(not_marked_start), child_node.childNodes[target_node_index]);
	}

	addPinpoint(mark_text, mark_id, "");
}

function addPinpoint(text, id, value){
	var new_pinpoint = stock_pinpoint.cloneNode(true);
	new_pinpoint.id = id + "_pinpoint";

	var new_pinpoint_close = new_pinpoint.getElementsByClassName("pinpoint_close")[0];
	new_pinpoint_close.id = id + "_pinpoint_close";

	var new_pinpoint_text = new_pinpoint.getElementsByClassName("pinpoint_text")[0];
	new_pinpoint_text.appendChild(document.createTextNode(text));
	new_pinpoint_text.id = id + "_pinpoint_text";

	var new_pinpoint_input = new_pinpoint.getElementsByClassName("pinpoint_input")[0];
	new_pinpoint_input.value = value;
	new_pinpoint_input.id = id + "_pinpoint_input";

	var new_pinpoint_label = new_pinpoint.getElementsByClassName("pinpoint_label")[0];
	new_pinpoint_label.htmlFor = id + "_pinpoint_input";
	new_pinpoint_label.id = id + "_pinpoint_label";

	var highlight_lines = document.getElementsByClassName(id + "_highlight");

	new_pinpoint.style.top = highlight_lines[0].getBoundingClientRect().top;
	new_pinpoint.style.left = document.getElementById("textLayer").getBoundingClientRect().right;

	var highlight_hover = function() {
		if(document.getElementsByClassName("pinpoint click_hover").length == 0){
			new_pinpoint.className = "pinpoint hover";
		}
	};

	var highlight_no_hover = function() {
		if(new_pinpoint.className !== "pinpoint click_hover"){
			new_pinpoint.className = "pinpoint";
		};
	};

	var highlight_click = function() {
		var remove = false;
		if(new_pinpoint.className === "pinpoint click_hover"){
			remove = true;
		}

		var clicked = document.getElementsByClassName("pinpoint click_hover");
		for(var i = 0; i < clicked.length; i++){
			clicked[i].className = "pinpoint";
		}

		var marks = document.getElementsByTagName("mark");
		for(var i = 0; i < marks.length; i++){
			if(/\bselected\b/.test(marks[i].className)){
				marks[i].className = marks[i].className.replace(/\s\bselected\b/, '');
			}
		}

		if(!remove){
			new_pinpoint.className = "pinpoint click_hover";
			for(var i = 0; i < highlight_lines.length; i++){
				if(!/\bselected\b/.test(highlight_lines[i].className)){
					highlight_lines[i].className = highlight_lines[i].className + " selected";
				}
			}
		}
	};

	var close_clicked = function() {
		highlight_lines[0].click();
	};

	for(var i = 0; i < highlight_lines.length; i++){
		highlight_lines[i].addEventListener('mouseenter', highlight_hover);
		highlight_lines[i].addEventListener('mouseleave', highlight_no_hover);
		highlight_lines[i].addEventListener('click', highlight_click);
	}

	new_pinpoint_close.addEventListener('click', close_clicked);

	document.body.appendChild(new_pinpoint);

	highlight_lines[0].click();
}

function getMarks(){
	var endpoint = "http://sugdev01.wanews.com.au/pdfjs/marks.json";
	$.ajax({
		url: endpoint,
	}).done(function(data) {
		for(i in data){
			addToMarks(data[i]);
		}
	});
}

function createMark(selection){

	if(selection.type != "Range"){
		alert("Please select some text first");
		return false;
	}

	var obj = new Object();

	var parent_node = selection.anchorNode.parentNode.parentNode;
	var start_line = obj.start_line = Array.prototype.indexOf.call(parent_node.children, selection.anchorNode.parentNode);
	var start_char = selection.anchorOffset;
	var end_line = Array.prototype.indexOf.call(parent_node.children, selection.focusNode.parentNode);
	var end_char = selection.focusOffset;

	if(start_line > end_line || (start_line == end_line && start_char > end_char)){
		// we selected backwards
		var tmp;

		// swap lines
		tmp = start_line;
		start_line = end_line;
		end_line = tmp;

		// swap chars
		tmp = start_char;
		start_char = end_char;
		end_char = tmp;

		if(start_line != end_line && selection.focusNode.previousSibling != null && selection.focusNode.previousSibling.localName == "mark"){
			start_char += (selection.focusNode.parentNode.textContent.length - selection.focusNode.length);
		}

	} else {
		if(start_line != end_line){
			if(selection.anchorNode.previousSibling != null && selection.anchorNode.previousSibling.localName == "mark"){
				start_char += (selection.anchorNode.parentNode.textContent.length - selection.anchorNode.length);
			}
		}

	}
	if(start_line == end_line){
		var pre_length = 0;
		var parent_node = selection.anchorNode.parentNode
		for(var i = 0; i < selection.anchorNode.parentNode.childNodes.length; i++){
			if(selection.anchorNode == parent_node.childNodes[i]){
				break;
			}
			pre_length += parent_node.childNodes[i].textContent.length;
		}
		start_char += pre_length;
		end_char += pre_length;
	}

	obj.start_line = start_line;
	obj.start_char = start_char;
	obj.end_line = end_line;
	obj.end_char = end_char;
	obj.page = 1;
	obj.mark_id = new Date().getTime();
	obj.text = selection.toString();

	addToMarks(obj);

	window.getSelection().removeAllRanges();
}
