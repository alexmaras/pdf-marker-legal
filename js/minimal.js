//Minimal PDF rendering and text-selection example using pdf.js by Vivin Suresh Paliath (http://vivin.net)
//This fiddle uses a built version of pdf.js that contains all modules that it requires.
//
//For demonstration purposes, the PDF data is not going to be obtained from an outside source. I will be
//storing it in a variable. Mozilla's viewer does support PDF uploads but I haven't really gone through
//that code. There are other ways to upload PDF data. For instance, I have a Spring app that accepts a
//PDF for upload and then communicates the binary data back to the page as base64. I then convert this
//into a Uint8Array manually. I will be demonstrating the same technique here. What matters most here is
//how we render the PDF with text-selection enabled. The source of the PDF is not important; just assume
//that we have the data as base64.
//
//The problem with understanding text selection was that the text selection code has heavily intertwined
//with viewer.html and viewer.js. I have extracted the parts I need out of viewer.js into a separate file
//which contains the bare minimum required to implement text selection. The key component is TextLayerBuilder,
//which is the object that handles the creation of text-selection divs. I have added this code as an external
//resource.
//
//This demo uses a PDF that only has one page. You can render other pages if you wish, but the focus here is
//just to show you how you can render a PDF with text selection. Hence the code only loads up one page.
//
//The CSS used here is also very important since it sets up the CSS for the text layer divs overlays that
//you actually end up selecting.
//
//For reference, the actual PDF document that is rendered is available at:
//http://vivin.net/pub/pdfjs/TestDocument.pdf

window.onload = function () {
    var scale = 1.5; //Set this to whatever you want. This is basically the "zoom" factor for the PDF.

    /**
     * Converts a base64 string into a Uint8Array
     */
    function base64ToUint8Array(base64) {
        var raw = atob(base64); //This is a native function that decodes a base64-encoded string.
        var uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
        for (var i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }

        return uint8Array;
    }

    function loadPdf(url) {
        PDFJS.disableWorker = true; //Not using web workers. Not disabling results in an error. This line is
        //missing in the example code for rendering a pdf.

        var pdf = PDFJS.getDocument(url);
        pdf.then(renderPdf);
    }

    function renderPdf(pdf) {
        for(var num = 1; num <= pdf.numPages; num++)
			            pdf.getPage(num).then(renderPage);
    }

    function renderPage(page) {
        var viewport = page.getViewport(scale);
        var $canvas = jQuery("<canvas></canvas>");

        //Set the canvas height and width to the height and width of the viewport
        var canvas = $canvas.get(0);
        var context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
		canvas.id = "page_" + page.pageNumber + "_canvas";

        //Append the canvas to the pdf container div
        var $pdfContainer = jQuery("#pdfContainer");
        $pdfContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
        $pdfContainer.append($canvas);

        //The following few lines of code set up scaling on the context if we are on a HiDPI display
        var outputScale = getOutputScale();
        if (outputScale.scaled) {
            var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
                (1 / outputScale.sy) + ')';
            CustomStyle.setProp('transform', canvas, cssScale);
            CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

            if ($textLayerDiv.get(0)) {
                CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
                CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
            }
        }

        context._scaleX = outputScale.sx;
        context._scaleY = outputScale.sy;
        if (outputScale.scaled) {
            context.scale(outputScale.sx, outputScale.sy);
        }

        var canvasOffset = $canvas.offset();
        var $textLayerDiv = jQuery("<div />")
            .addClass("textLayer")
            .attr("id", "page_" + page.pageNumber)
            .css("height", viewport.height + "px")
            .css("width", viewport.width + "px")
            .offset({
                top: canvasOffset.top,
                left: canvasOffset.left
            });

        $pdfContainer.append($textLayerDiv);

        page.getTextContent().then(function (textContent) {
            var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
            //the page. It is set to page.number - 1.
            textLayer.setTextContent(textContent);

            var renderContext = {
                canvasContext: context,
                viewport: viewport,
                textLayer: textLayer
            };

            page.render(renderContext).then(function(){
				$textLayerDiv.offset({top: canvasOffset.top, left: canvasOffset.left});
				getMarks(page.pageNumber);
			});
        });
    }

    loadPdf("test.pdf");
};
