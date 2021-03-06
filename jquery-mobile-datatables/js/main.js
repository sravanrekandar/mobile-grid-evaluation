/*!
* main.js
* Uses jQuery and dataTables.js to create a responsive design for tabular data.
* 
* @project   Mobile Grid Evaluation
* @date      2012-11-28
* @author    Andrew Rota
*
*/

$(document).ready(function () {
    var table;
    
    /**
     * Formatted Numbers Sorting Plug-in for DataTables
     *
     * @author Allan Jardine
     * @source http://www.datatables.net/plug-ins/sorting#formatted_numbers
     */
    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "formatted-num-pre": function ( a ) {
        a = (a==="-") ? 0 : a.replace( /[^\d\-\.]/g, "" );
        return parseFloat( a );
        },
     
        "formatted-num-asc": function ( a, b ) {
            return a - b;
        },
     
        "formatted-num-desc": function ( a, b ) {
            return b - a;
        }
    } );

    /**
     * Returns a height for the table
     *
     * @return {number} The calculated height for the table
     */
    function getHeight() {
        return $(this).height() - 190;
    }

    /**
     * Hides and styles columns based on table width
     *
     * @param {DataTable} table The table to be modified
     */
    function configureForWidth(table, columns) {
        if ($(this).width() <= 899 && $(this).width() > 499) {
            $.each(columns, function(index, priority) {
                if (priority === 2) {
                    table.fnSetColumnVis(index, true, true);
                }
                else if(priority === 3) {
                    table.fnSetColumnVis(index, false, true);
                }
            });
            $("#positions-table").addClass("medium");
            $("#positions-table").removeClass("wide");
            $("#positions-table").removeClass("narrow");
        } else if ($(this).width() <= 499 && $(this).width() > 0) {
            $.each(columns, function(index, priority) {
                if (priority === 2 || priority === 3) {
                    table.fnSetColumnVis(index, false, true);
                }
            });
            $("#positions-table").addClass("narrow");
            $("#positions-table").removeClass("wide");
            $("#positions-table").removeClass("medium");
        } else {
            $.each(columns, function(index, priority) {
                if (priority === 2 || priority === 3) {
                    table.fnSetColumnVis(index, true, true);
                }
            });
            $("#positions-table").addClass("wide");
            $("#positions-table").removeClass("medium");
            $("#positions-table").removeClass("narrow");
        }
    }

    /**
     * Binds the click/touch events to each row
     *
     */
    function bindSelectEvents() {
        $("#positions-table").on("click", "tr", function (e) {
            $('#selected-position').html($(e.target).parent().attr("data-security-name"));
        });
        $("#positions-table").on("click", "tr span", function (e) {
            $('#selected-position').html($(e.target).parent().parent().attr("data-security-name"));
        });
    }

    /**
     * Returns a string describing the number (whether it is positive, negative, or zero)
     *
     * @param {number} n The number to be described
     * @return {string} The descriptive string (either positive, negative, or zero)
     */
    function getPositiveOrNegativeOrZero(n) {
        "use strict";
        if (n > 0) {
            return "positive";
        } else if (n < 0) {
            return "negative";
        } else {
            return "zero";
        }
    }
    
    /**
     * Adds parens and removes the negative symbol around numbers with class 'negative'
     *
     */
    function formatNegativeNumbers() {
        $(".negative").each(function (index, element) {
            var value = $(this).html();
            var absValue = value.replace("-", "");
            $(this).html("(" + absValue + ")");
        });
    }
    
    /**
     * Displays the size of the window
     *
     */
    function displayWindowSize() {
        var win = $(this);
        $('.window-size').html("(" + win.width() + ", " + win.height() + ")");
    }
    
    var settings = {
        "aaData": positions, //source of data
        "aaSorting": [[1, "asc"]], //default sort
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
            $(nRow).attr('data-security-name', aData.security);
        }, //set security name as an attribute of each row (for click/touch event)
        "aoColumns": [
            {
                "mData": "security",
                "sTitle": "Security",
                "sClass": "security priority2"
            }, 
            { 
                "mData": "symbol",
                "sTitle": "Symbol",
                "sClass": "symbol priority1"
            }, 
            { 
                "mData": function (source, type, val) {
                    var quantity = source.quantity;
                    return ($.format.number(quantity, '#,##0'));
                },
                "sTitle": "Quantity",
                "sType": "formatted-num",
                "sClass": "quantity priority1"
            }, 
            {
                "mData": "lastTrade",
                "mRender": function (data, type, full) {
                    var lastTrade = data;
                    return "$" + ($.format.number(lastTrade, '#,##0.00'));
                },
                "sTitle": "Last Trade",
                "sType": "formatted-num",
                "sClass": "last-trade priority1"
            }, 
            {
                "mData": function (source, type, val) {
                    var marketValue = source.lastTrade * source.quantity;
                    return marketValue;
                },
                "mRender": function(data, type, full) {
                    return "$" + ($.format.number(data, '#,##0.00'));
                },
                "sType": "formatted-num",
                "sTitle": "Market Value",
                "sClass": "market-value priority1"
            }, {
                "mData": function (source, type, val) {
                    var pricePaid = source.pricePaid;
                    return pricePaid;
                },
                "mRender": function(data, type, full) {
                    return "$" + ($.format.number(data, '#,##0.00'));
                },
                "sType": "formatted-num",
                "sTitle": "Price Paid",
                "sClass": "price-paid priority2"
            }, 
            {
                "mData": function (source, type, val) {
                    var totalCost = source.pricePaid * source.quantity;
                    return totalCost;
                },
                "mRender": function (data, type, full) {
                    return "$" + ($.format.number(data, '#,##0.00'));
                },
                "sType": "formatted-num",
                "sTitle": "Total Cost",
                "sClass": "total-cost priority3"
            }, 
            {
                "mData": function (source, type, val) {
                    var gain = (source.lastTrade * source.quantity) - (source.pricePaid * source.quantity);
                    return gain;
                },
                "mRender": function(data, type, full) {
                    return "<span class='" + getPositiveOrNegativeOrZero(data) + "'>$" + $.format.number(data, '#,##0.00');
                },
                "sTitle": "Gain",
                "sType": "formatted-num",
                "sClass": "gain priority3"
            }, 
            {
                "mData": function (source, type, val) {
                    var gainPercentage = (((source.lastTrade * source.quantity) - (source.pricePaid * source.quantity)) / (source.pricePaid * source.quantity)) * 100;
                    return gainPercentage;
                },
                "mRender": function(data, type, full) {
                    return ("<span class='" + getPositiveOrNegativeOrZero(data) + "'>" + $.format.number(data, '#,##0.00')) + "%";
                },
                "sTitle": "Gain %",
                "sType": "formatted-num",
                "sClass": "gain-percentage priority2"
            }
        ],
        "bFilter": false, //toggle search filter
        "sScrollY": getHeight(), //set vertical scroll, with height
        "bPaginate": false, //toggle pagination
        "bInfo": false, //toggle dataset info at bottom of table
        "bDestroy": true, //toggle allow replacing of table
        "bSort": true, //toggle sorting
        "bAutoWidth": true //toggle column width is automatically set
    };
    
    function configureTable(settings) {
        displayWindowSize();
        settings.sScrollY = getHeight(); //set scroll settings to new height
        table = $('#positions-table').dataTable(settings); //replace table with new settings
        configureForWidth(table, [3,1,1,1,1,2,3,3,2]); //prioritize columns to hide based on window width
        formatNegativeNumbers(); //reformat negative numbers
    }
    
    $(window).resize(function () {
        configureTable(settings);
    });
    
    bindSelectEvents(); //bind rows to click/touch events on page load
    configureTable(settings);
});