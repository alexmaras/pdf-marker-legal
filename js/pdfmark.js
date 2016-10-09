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
stock_pinpoint_label.textContent = "note:";
stock_pinpoint.appendChild(stock_pinpoint_label);

var stock_pinpoint_input = document.createElement("textarea");
stock_pinpoint_input.className = "pinpoint_input";
stock_pinpoint.appendChild(stock_pinpoint_input);

var stock_pinpoint_save = document.createElement("input");
stock_pinpoint_save.className = "pinpoint_save";
stock_pinpoint_save.type = "button";
stock_pinpoint_save.disabled = true;
stock_pinpoint_save.value = "SAVE";
stock_pinpoint.appendChild(stock_pinpoint_save);

var stock_pinpoint_cancel = document.createElement("input");
stock_pinpoint_cancel.className = "pinpoint_cancel";
stock_pinpoint_cancel.type = "button";
stock_pinpoint_cancel.disabled = true;
stock_pinpoint_cancel.value = "CANCEL";
stock_pinpoint.appendChild(stock_pinpoint_cancel);

function addToMarks(new_mark){
	for(o in mark_list){
		if(	mark_list[o].start_line < new_mark.start_line &&
			mark_list[o].end_line   > new_mark.start_line &&
			mark_list[o].page == new_mark.page)
		{
			console.log("NO");
			return false;
		}
	}
	mark_list[new_mark.mark_id] = new_mark;

	renderMark(new_mark.page, new_mark.start_line, new_mark.start_char, new_mark.end_line, new_mark.end_char, new_mark.text, new_mark.mark_id);
	//upload mark

	return true;
}

function renderMark(page, start_node_index, start_text_index, end_node_index, end_text_index, mark_text, mark_id){

	var parent_node = document.getElementById("page_" + page);
	if(start_node_index != end_node_index){ // multiple lines
		for(var i = start_node_index; i <= end_node_index; i++){ // for each node
			var child_node = parent_node.children[i]; // line to operate on
			var text = child_node.textContent;

			if (i == start_node_index) { // if we're on the first line, look at the start char on this line

				// create a new "mark" element, with the text from the beginning char index
				var marked = text.substr(start_text_index);
				var new_mark = document.createElement("mark");
				new_mark.appendChild(document.createTextNode(marked));
				new_mark.className = mark_id + "_highlight";

				// build an array of all the nodes in the parent. 
				var length = child_node.childNodes.length;
				var line_array = [];
				for(k = 0; k < length; k++){
					line_array.push(child_node.childNodes[k]);
				}

				// remove the last one (always the one we're operating on in a multi-line first-line situation)
				var last_node = line_array.pop();
				// make a node of all the text prior to the start of our mark
				var pre_node = document.createTextNode(
					last_node.textContent.substr(
						0,
						last_node.textContent.length - new_mark.textContent.length
					)
				);

				// push on all the text pre-mark, then the mark itself
				line_array.push(pre_node);
				line_array.push(new_mark);

				// remove all the children of the parent
				while(child_node.firstChild){
					child_node.removeChild(child_node.firstChild);
				}

				// rebuild the parent using the line array
				for(q in line_array){
					child_node.appendChild(line_array[q]);
				}

			} else if (i == end_node_index) { // if we're on the last line, look at the end char on this line

				// create a new mark using all the text prior to the end text index
				var marked = text.substr(0, end_text_index);
				var new_mark = document.createElement("mark");
				new_mark.appendChild(document.createTextNode(marked));
				new_mark.className = mark_id + "_highlight";

				// push the mark onto a blank line array
				var line_array = [];
				line_array.push(new_mark);
				var first_node = child_node.firstChild;

				// make a "post node" from all the text after the mark node and before any other nodes and add it to the line array
				var post_node = document.createTextNode(first_node.textContent.substr(new_mark.textContent.length));
				line_array.push(post_node);

				// remove the node we've just added to the line array
				child_node.removeChild(child_node.firstChild);

				// add all other nodes to the line array on the end
				for(k = 0; k < child_node.childNodes.length; k++){
					line_array.push(child_node.childNodes[k]);
				}

				// remove all child nodes from the parent
				while(child_node.firstChild){
					child_node.removeChild(child_node.firstChild);
				}

				// rebuild the parent from the line array
				for(q in line_array){
					child_node.appendChild(line_array[q]);
				}

			} else { // if we're on a multiline mark and not on the first or last line, we take the whole line.
				var new_mark = document.createElement("mark");
				new_mark.appendChild(document.createTextNode(text));
				new_mark.className = mark_id + "_highlight";
				child_node.removeChild(child_node.childNodes[0]);
				child_node.appendChild(new_mark);
			}
		}
	} else { // we are on a single line mark
		var child_node = parent_node.children[start_node_index];
		var text = child_node.textContent;

		var line_array = [];
		var target_node_index = -1;
		var total_length = 0;
		var pre_length = 0;
		var post_length = 0;

		// build an array of all child nodes of the line
		for(k = 0; k < child_node.childNodes.length; k++){
			line_array.push(child_node.childNodes[k]);

			// if we haven't found our target node index yet (the node where the mark will start)
			if(target_node_index == -1){
				// add to the total length of all text nodes so far. if the total length is larger 
				// than the start_text_index, we've found the target node and we can set target_node_index
				total_length += child_node.childNodes[k].textContent.length;
				if(total_length > start_text_index){
					target_node_index = k;
				} else { 
					// otherwise, we add onto the pre_length variable to keep track
					pre_length += child_node.childNodes[k].textContent.length;
				}
			} else {
				// after finding the target node index, we want to track how many chars come after that node
				post_length += child_node.childNodes[k].textContent.length;
			}
		}

		// create the not marked start string (all text prior to the mark and after any non-text nodes)
		var not_marked_start = text.substr(pre_length, start_text_index - pre_length);
		// create the marked text string
		var marked = text.substr(start_text_index, end_text_index - start_text_index);
		// create the not marked end string (all text after the mark and before any non-text nodes)
		var not_marked_end = text.substr(end_text_index, child_node.textContent.length - post_length - pre_length - marked.length - not_marked_start.length);

		// create the mark
		var new_mark = document.createElement("mark");
		new_mark.appendChild(document.createTextNode(marked));
		new_mark.className = mark_id + "_highlight";

		// remove the node that we've been operating on from the parent
		child_node.removeChild(child_node.childNodes[target_node_index]);

		// insert the end, middle then start so they order correctly.
		child_node.insertBefore(document.createTextNode(not_marked_end), child_node.childNodes[target_node_index]);
		child_node.insertBefore(new_mark, child_node.childNodes[target_node_index]);
		child_node.insertBefore(document.createTextNode(not_marked_start), child_node.childNodes[target_node_index]);
	}

	// add the pinpoint
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

	//new_pinpoint.style.top = highlight_lines[0].getBoundingClientRect().top;
	//new_pinpoint.style.left = document.getElementById("textLayer").getBoundingClientRect().right;

	var highlight_hover = function() {
		if(document.getElementsByClassName("pinpoint click_hover").length == 0){
			new_pinpoint.className = "pinpoint hover";
			new_pinpoint.addEventListener("webkitTransitionEnd", function(e) {
				e.target.removeEventListener(e.type, arguments.callee);
				document.getElementById("pinpointContainer").scrollTop = new_pinpoint.offsetTop;
			});
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
			document.getElementById("pinpointContainer").scrollTop = new_pinpoint.offsetTop;
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

	document.getElementById("pinpointContainer").appendChild(new_pinpoint);

	highlight_lines[0].click();
}

function getMarks(page_num){
	var endpoint = "marks.json";
	$.ajax({
		url: endpoint,
	}).done(function(data) {
		for(i in data){
			if(data[i].page == page_num){
				addToMarks(data[i]);
			}
		}
	});
}

function createMark(){
    selection = window.getSelection();
    if (selection.isCollapsed) {
     	alert("Please select some text first");
		return false;
	}

    snapSelectionToWord();

	var obj = new Object();

	var parent_node = selection.anchorNode.parentNode.parentNode;
	if(parent_node.id.substr(0,5) != "page_"){
		return;
	}

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
		var parent_node_tmp = selection.anchorNode.parentNode
		for(var i = 0; i < selection.anchorNode.parentNode.childNodes.length; i++){
			if(selection.anchorNode == parent_node_tmp.childNodes[i]){
				break;
			}
			pre_length += parent_node_tmp.childNodes[i].textContent.length;
		}
		start_char += pre_length;
		end_char += pre_length;
	}

	obj.start_line = start_line;
	obj.start_char = start_char;
	obj.end_line = end_line;
	obj.end_char = end_char;
	var pageNumber = parseInt(parent_node.id.substr(5));
	obj.page = pageNumber;
	obj.mark_id = new Date().getTime();
	obj.text = selection.toString();

	if(obj.start_line == -1 || obj.end_line == -1){
		return;
	}

	addToMarks(obj);

	window.getSelection().removeAllRanges();
}
