/*
 * Mitutoyo Data Parser - Mitutoyo Quick Vision Apex Data measurements data parser for humans!
 * Version 1.8.0
 * @requires jQuery v3.1.1
 * 
 * Done in 2017 by Rui Pedro Moreira
 * 
 */
 $("#output").hide();
 $(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});
$(".clear").click(function() {
	$("textarea").val("");
	$(".clear").removeClass("enabled");
	$(".clear").addClass("disabled");
	$("textarea").focus();
});

$(".options").click(function() {
	$("#tools").hide();
	$("#options").show();
});
$(".closeoptions").click(function() {
	$("#options").hide();
	$("#tools").show();
});
var data = [];

$(".parse").click(function parse() {
	var filename = $(".rawdata").val();
	$("#error").hide();
	$("#dumpster").empty();
	var firstrow = "        Elemento           Atual         Nominal          Desvio        Tol.sup.        Tol.inf.        De./Fora";
	var quote, dim;
	var row = [];
	var dims = [];
	var values = [];
	var clean = [];
	// READ DATA
	var rawdata =  $(".rawdata").val().split("\n");
	// GET RID OF ALL BLANK SPACES
	data = rawdata.filter(function(v){return v!==''});
	var ele = 0;
	if (data.length>0 && data[0] == firstrow) {
		for (i=0; i < data.length; i++) {
			row.push(data[i].split(" "));
			for (y=0; y < row.length; y++) {
				row[y] = jQuery.grep(row[y], function(n, i){
					return (n !== "" && n != null);
				});
			}
			// PROCESS ARRAYS 
			switch (row[i][0]) {
				case "Elemento":
					ele++;
					break;
				case "(Desv":
					break;
				case "":
					break;
				case "Distância:":
				case "Círculo:":
				case "Ângulo:":
				case "Eclipse:":
				case "Linha:":
				case "Plano:":
				case "Ponto:":
				case "Esfera:":
				case "Cilindroescalonado:":
				case "Cilindro:":
				case "Cone:":
				case "Pontodeintersercção:":
				case "Linhadeintersercção:":
				case "Círculodeintersercção:":
				case "IntersectElipse:":
				case "Pontomédio:":
				case "Linhamédia:":
					quote = row[i][1].substring(0, row[i][1].indexOf("("));
					if ($.inArray(quote, dims) == -1) {
							dims.push(quote);
						}
					break;
				default:
					var value = row[i][2];
					// MAKE ALL DIMENSIONS POSITIVE NUMBERS
					if (value.substring(0,1) == "-") {
						value = value.substring(1);
					}

					values.push(value);
					break;
			}
		}
		
		$("#output").show();
		$("#dumpster").html("<table id='dump' class='tablesorter'></table>");
		$("#dump").append("<thead><tr><th>Quotes</th><th>Values</th></tr></thead><tbody></tbody>");
		// SORT DATA
		if (ele==3) {
			for (m=0; m<dims.length; m++) {
				for (n=0; n<3; n++) {
					var position = m+n*dims.length;
					var dump = "<tr><td>" + dims[m] + "</td><td>" +values[position] + "</td></tr>";
					$("#dump").append(dump);
				}
			}
			totalquotes = dims.length*ele;
		}
		else {
			for (m=0; m<dims.length; m++) {
					var position = m;
					var dump = "<tr><td>" + dims[m] + "</td><td>" +values[position] + "</td></tr>";
					$("#dump").append(dump);
			}
			totalquotes = dims.length;
		}
		$("#totaldims").text(totalquotes + ' quotes converted');
		$(".clear").removeClass("disabled");
		$(".export").removeClass("disabled");
		$(".export").on('click', function (event) {
			var filename = "export";
			var filename = filename.replace(/ /g, "_");
			// CSV
			// This must be a hyperlink
			if (!filename || !filename.length) { exportTableToCSV.apply(this, [$('#dumpster>#dump'), 'export.csv']); }
			else { exportTableToCSV.apply(this, [$('#dumpster>#dump'), filename + '.csv']); }
			// IF CSV, does't do event.preventDefault() or return false
			// We actually need this to be a typical hyperlink
		});
	}
	else { error(); }
		$("#dump").tablesorter({ 
	        // sort on the first column, order asc 
	        sortList: [[0,0]]
		});

		// UNDERSCORE INSTEAD OF DASH TO AVOID DATE ISSUE ON MSEXCEL
		$('td').each(function() {
			var text = $(this).text().replace(new RegExp("-", "g"), "_");
			$(this).text(text);
		});
});

function error() {
	$("#output").hide();
	$("#error").show();
	$(".export").addClass("disabled");
	if (data.length>0) {
		$(".clear").removeClass("disabled");
		$(".clear").addClass("enabled");
	}
}

// TWEAKED CSV EXPORT FROM https://jsfiddle.net/terryyounghk/KPEGU/
function exportTableToCSV($table, filename) {
	var $rows = $table.find('tr:has(td)'),
	// Temporary delimiter characters unlikely to be typed by keyboard
	// This is to avoid accidentally splitting the actual contents
	tmpColDelim = String.fromCharCode(11), // vertical tab character
	tmpRowDelim = String.fromCharCode(0), // null character
	// actual delimiter characters for CSV format
	colDelim = ';',
	rowDelim = '\r\n',
	// Grab text from table into CSV formatted string
	csv = $rows.map(function (i, row) {
		var $row = $(row),
		$cols = $row.find('td');
		return $cols.map(function (j, col) {
			var $col = $(col),
			text = $col.text();
			return text.replace(/"/g, '""'); // escape double quotes
		}).get().join(tmpColDelim);
	}).get().join(tmpRowDelim)
	.split(tmpRowDelim).join(rowDelim)
	.split(tmpColDelim).join(colDelim),
	// Data URI
	csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
	$(this).attr({
		'download': filename,
		'href': csvData,
		'target': '_blank'
	});
}