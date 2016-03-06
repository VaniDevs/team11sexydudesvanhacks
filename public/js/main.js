$(document).ready(function(){

  $('#reader').html5_qrcode(
      function(data){
        //Put a http post call for the data here (most likely a url)
        $.post( "/candidate/add", data);
        $('#read').html(data);
      },
      function(error){
          $('#read_error').html(error);
      }, function(videoError){
          $('#vid_error').html(videoError);
      }
 );


 var table = $('#example').DataTable( {
        lengthChange: false,
        buttons: [ 'copy', 'excel', 'pdf', 'colvis' ]
    } );

    table.buttons().container()
        .appendTo( '#example_wrapper .col-sm-6:eq(0)' );

});

function createQRImage(url) {
  console.log(url);
  $('#qrimage').html("<img src='https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl="+url+"'/>");
}
