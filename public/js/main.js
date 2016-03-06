// Get the modal
var modal = document.getElementById('myModal');
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var dataItems = ko.observableArray();

var totalAmt = ko.observable("0.00");

ko.applyBindings({
    newsFeedItems: dataItems
})

var checkboxClick_handler = function(item) {
    console.log('clicked: ' + item);
    var checkbox = $("#checkbox_" + item);
    var price = $("#price_" + item);
    var number = $("#number_" + item);
    var aSearchButton = $("#amazonSearchButton_" + item);
    if (checkbox.prop('checked')) {
        price.css("visibility", "visible");
        number.css("visibility", "visible");
        aSearchButton.css("visibility", "visible");
    } else {
        price.css("visibility", "hidden");
        number.css("visibility", "hidden");
        aSearchButton.css("visibility", "hidden");
    }

    var amt = Number($("#number_" + item).val());
    if (amt != 0) {
        totalAmtChange_handler();
    }

    var noneChecked = true;
    $("input[type=checkbox]").each(function(index) {
        if ($("#checkbox_" + index).prop('checked')) {
            noneChecked = false;
        }
    });
    if (!noneChecked) {
        $(".price_th").css("visibility", "visible");
        $(".quantity_th").css("visibility", "visible");
        $("#paypalBtn").prop('disabled', false);
        $("#visaBtn").prop('disabled', false);
    } else {
        $(".price_th").css("visibility", "hidden");
        $(".quantity_th").css("visibility", "hidden");
        $("#paypalBtn").prop('disabled', true);
        $("#visaBtn").prop('disabled', true);
    }
}

var totalAmtChange_handler = function() {
    console.log('total amount changed');
    var totalSoFar = 0;
    $("input[type=number]").each(function(index) {
        var isChecked = $("#checkbox_" + index).prop('checked');
        var inputtedNumber = Number($(this).val());
        var price = Number($("#price_" + index).text().substring(1));
        if (inputtedNumber && price && isChecked) {
            totalSoFar += (inputtedNumber * price);
        }
    });
    var rounded = Math.round(totalSoFar*100)/100;
    totalAmt(rounded.toString());
}

$(document).ready(function() {
    $.get("/item/array", function(data, status) {
      //todo check status
        for (var i = 0; i < data.length; i++) {
            dataItems.push(data[i]);
            $("#price_"+i).css("visibility", "hidden");
            $("#number_"+i).css("visibility", "hidden");
            $("#amazonSearchButton_"+i).css("visibility", "hidden");
            $("#amazonSearchButton_"+i).click(function() {
                var index = $(this).attr('id').substring(19);
                var title = $("#title_"+index).text();
                var titleSlug = title.toLowerCase()
                                     .replace(/ /g,'-')
                                     .replace(/[^\w-]+/g,'');
                alert("Thank you! Please fill in the shipping destination as: 34 12 AVE E, Vancouver, BC. Charitable Tax Receipts will be issued for eligible gifts of $25 or more. Thank you for your generous support.");
                window.open("http://www.amazon.ca/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=" + titleSlug, '_blank');
            });
        }
        $(".table tr").click(function(event) {
            if (event.target.type !== 'checkbox' && event.target.type !== 'number' && event.target.type !== 'button') {
                $(":checkbox", this).trigger('click');
            }
        });
    });

    $('.carousel').carousel({
      wrap: false,
      interval: false
    }).on('slid.bs.carousel', function () {
        curSlide = $('.active');
      if(curSlide.is( ':first-child' )) {
         $('.left').hide();
         return;
      } else {
         $('.left').show();
      }
      if (curSlide.is( ':last-child' )) {
         $('.right.carousel-control').hide();
         return;
      } else {
         $('.right').show();
      }
    });
});
