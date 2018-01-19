/*

fCC Scraper Leaderboard

Some way to dynamically generate leaderboards. It automatically looks at days. It provides some sort of timeline of results


Todo
* Proof of concept
* Just the results of a list of users


Helpful Links:

* https://github.com/gwuah/FCC-Scraper
* https://github.com/gwuah/FCC-Camper-Rankings

*/


// classes

class FccScraper{

  constructor(strUserName){
    this.setName(strUserName);
  }

  setName(strUserName){
    if (strUserName){
      this.strUserName = strUserName;
    }
  }

  static getFccUrl(strUserName){
    var strUrl = `https://www.freecodecamp.org/${strUserName}`;

    return strUrl;
  }

  scrape(fnCallback = logToConsole){

    var strUserName = this.strUserName;
    var strUrl = FccScraper.getFccUrl(strUserName);
    var objThis = this;

    $.get(strUrl
      // ,  function(objData) {
      // }
    )

    .done(function(objData) {

      // objData.username = strUserName;

      var objRetData = {
        status: 200,
        source: "FccScraper::scrape",
        message: "success",
        data: objData,
      };


      objThis.scrapeData.call(objThis, objRetData, fnCallback);

    })
    .fail(function(objData) {

      var objRetData = {
        status: 400,
        source: "FccScraper::scrape",
        message: "failure",
        data: null,
      };

      fnCallback(objRetData);

    });
    // .always(function(objData) {

    // });


  }

  scrapeData(objRetData, fnCallback = logToConsole){

    var strHtml = objRetData.data;
    var jPage = $(strHtml);
    var objThis = this;

    // todo: qa on this page, yo. check that these elements exist and are of the right type

    // add the name first
    var strName = jPage.find('.flat-top.wrappable:first').html();
    var strUsername = jPage.find("h1:first").html();

    objRetData.data = {
      name: strName,
      username: strUsername,
    };

    jPage.find('.table.table-striped').each(function(){

      var jTable = $(this);
      objThis.processTable(jTable, objRetData);

    });

    fnCallback(objRetData);

  }

  processTable(jTable, objMutableStorage){

    var objCompleted = {};

    var strTableName = jTable.find('tr:eq(0)').find("th:eq(0)").html().toLowerCase();
    console.log("FccScraper::processTable > line 174. | strTableName: ", strTableName);

    var boolIsProjectTable = (strTableName == "projects");

    jTable.find('tr:not(:eq(0))').each(function(objData){

      var strName = $(this).find("td:eq(0)").html();

      if (boolIsProjectTable){
        strName = $(strName).html();
      }

      var strTime = $(this).find("td:eq(1)").html();

      var mmtTime = moment(strTime);
      var intTimestamp = mmtTime.unix();

      // hacky, but works. some projects were completed in the same day. no one does a better than
      // a project a second, so we good for now
      while (objCompleted[intTimestamp]){
        ++intTimestamp;
      }

      objCompleted[intTimestamp] = {
        name: strName,
        time: intTimestamp
      };

    });

    objMutableStorage.data.challengeData = objMutableStorage.data.challengeData || {}
    objMutableStorage.data.challengeData[strTableName] = objCompleted;

    console.log("FccScraper::processTable > line 174. | objMutableStorage: ", objMutableStorage);
  }

  getAlgoTableTdInformation(jTr){


    var strChallengeName = jTr.find('td:eq(1)').html();
    var strCompletedTime = jTr.find('td:eq(2)').html();

    var objData = {
      timeCompletion: strCompletedTime,
      strChallenge: strChallengeName,
    };

    return objData;

  }

}

// functions

function logToConsole(objData){

  var intStatus = objData.status;

  switch (intStatus){
    case 200:
      break;
    case 400:
      break;
  }
}

function logToConsole(objData){

  var intStatus = objData.status;

  switch (intStatus){
    case 200:
      break;
    case 400:
      break;
  }
}

function testScraper(){

  var strUserName = "meyian";
  var fsTestScraper = new FccScraper(strUserName);

  fsTestScraper.scrape();

}


function init(){
  testScraper();
}




// script

// init();
