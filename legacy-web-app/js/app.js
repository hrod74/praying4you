/* javascript goes here  */
/*
I want to make an API call to display a bible verse of the day
I want the user to be able to create a username for their praer request
I want the user to have a text box to enter the prayer request
I want the user to be able to submit the username & prayer request and store that data on firebase
https://praying4you.firebaseio.com/
*/
/*----Initialize app to firebase db ------*/
var config  =  {  apiKey         : "REPLACE_WITH_FIREBASE_API_KEY",
                  databaseURL    : "REPLACE_WITH_FIREBASE_DATABASE_URL",
                  storageBucket  : "REPLACE_WITH_FIREBASE_STORAGE_BUCKET"
               };
var data    =  {};

firebase.initializeApp( config );
var conn = firebase.database().ref('prayers/');
conn.on("child_added", function(snapshot) {
   var prayer         = snapshot.val();
   data[snapshot.key] = prayer;
   var tr      = "<tr>";
       tr     +=     "<td>" + prayer.date    + "</td>";
       tr     +=     "<td>" + prayer.user    + "</td>";
       tr     +=     "<td>" + prayer.prayer  + "</td>";
       tr     +=     "<td>";
       tr     +=        "<ul class='nav nav-pills'>";
       tr     +=           "<li>";
       tr     +=              "<a href='#'>";
       tr     +=                 "<i onClick='vote(\"" + snapshot.key + "\");' class='fa fa-thumbs-up' aria-hidden='true'></i>";
       tr     +=                 "<span id='"+snapshot.key+"' class='badge'>" + prayer.votes + "</span>";
       tr     +=              "</a>";
       tr     +=           "</li>";
       tr     +=        "</ul>";
       tr     +=     "</td>";
       tr     += "</tr>";
   $("#prayer-list").prepend( tr );
});

/*----------------------------------------------------------------------------*/
/*--- document ready ...                                                   ---*/
/*----------------------------------------------------------------------------*/
$(document).ready( function (){
		 bibleApiCall();
	 $("#submitprayer").on('click', save);
})

/*----------------------------------------------------------------------------*/
/*--- today ...                                                            ---*/
/*----------------------------------------------------------------------------*/
function today()
{
   var date          = new Date();
   var currentDate   = date.getDate();
   var month         = date.getMonth() + 1;
   var year          = date.getFullYear();
   return month + "/" + currentDate + "/" + year;
}

/*----------------------------------------------------------------------------*/
/*--- save ...                                                             ---*/
/*----------------------------------------------------------------------------*/
function save( date, user, prayer, votes )
{
   var user    = $('#inputUser').val();
   var prayer  = $('#inputPrayer').val();
   conn.push( { date    :  today(),
                user    :  user,
                prayer  :  prayer,
                votes   :  0
            });
}

/*----------------------------------------------------------------------------*/
/*--- vote ...                                                             ---*/
/*----------------------------------------------------------------------------*/
function vote( k )
{
   data[k].votes++;
   conn.update(data);
   $("#"+k).html( data[k].votes );
	 location.reload();
}
/*-------verse of the day API call -------*/
function bibleApiCall(){
   var link = "http://labs.bible.org/api/?passage=votd&type=json";
      $.ajax({
         url         :  link,
         method      :  'GET',
         crossDomain :  true,
         dataType    :  'jsonp',
         success     :  function( r ) {
            var   bookname = r[0].bookname;
            var   chapter  = r[0].chapter;
            var   verse    = r[0].verse;
            var   text     = r[0].text;
            var   content  = "<legend>Verse Of The Day</legend>";
                  content +=    "<blockquote>";
                  content +=    "<p id='bible'>" + text + "</p>";
                  content +=    "<small>" + bookname + " " + chapter + ":" + verse + "<cite title='Source Title'>NIV</cite></small>";
                  content += "</blockquote>";
            $("#randomVerse").html( content );
         },
         error   : function( error ){
            alert("opps something went wrong!")
         }
    });
   }
