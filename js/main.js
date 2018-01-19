/*

fCC Scraper Leaderboard

Some way to dynamically generate leaderboards. It automatically looks at days. It provides some sort of timeline of results


Todo
* Proof of concept
* Just the results of a list of users


Helpful Links:

* https://github.com/gwuah/FCC-Scraper
* https://github.com/gwuah/FCC-Camper-Rankings



Major Functions:

* filterChallengeData
* getUserData(strUser)
* getDoneList
* checkDoneChallenges
* addUserData
* RenderCheckedInUserList

*/


var fnCheckDoneChallenges;

$(function(){

  // variables
  var objStorageData = {};
  var strStoreName = "ffc-coffee";

  var intStartTimeRange;
  var intEndTimeRange;

  var intIntervalId;
  var intRefreshRate = 60 * 1000;

  var strModeWeekly = "weekly_rankings";
  var strModeCoffee = "coffee_and_code";
  var strModeFilter = "all";
  var strModeFilter = "not-all";
  var strModeRefresh = "off"
  var strMode = strModeCoffee;// strModeWeekly; //

  var strDayToTest = "20171007";
  var strCurrentDay = "20171007";

  var fsScraper = new FccScraper();

  const intEnterKeyCode = 13;
  const boolIsLocalStorageMode = true;
  const strStorageKey = "fcc_scraper"


  // functions

  function logToConsole(objData){

    var intStatus = objData.status;

    switch (intStatus){
      case 200:
        console.log(`${objData.source}: all good`);
        break;
      case 400:
        console.log(`${objData.source}: not fine. "Like Dilla's saying go."`);
        break;
    }
  }

  function getStorageData(){
    var strData = localStorage.getItem(strStoreName);
    var objData = JSON.parse(strData);
    return objData;
  }

  function saveStorageData(objData){
    var strData = JSON.stringify(objData);
    localStorage.setItem(strStoreName, strData);
  }

  function logToConsole(objData){

    var intStatus = objData.status;

    switch (intStatus){
      case 200:
        console.log(`${objData.source}: all good`);
        break;
      case 400:
        console.log(`${objData.source}: not fine. "Like Dilla's saying go."`);
        break;
    }
  }

  function testScraper(){
    console.log('line 37. testScraper');

    var strUserName = "meyian";
    var fsTestScraper = new FccScraper(strUserName);

    fsTestScraper.scrape();
  }

  function nameSubmitHandler(evt){

    console.log("nameSubmitHandler > line 220. | alpha");

    var objThis = this;
    var jInput = $(evt.target);
    var strPossibleUser = jInput.val();

    scrapeUser(strPossibleUser);

    // redraw list
    RenderCheckedInUserList();
  }

  function hideLoading(){
    $(".span-loading-wrapper").addClass("dont-show");
  }

  function showLoading(){
    $(".span-loading-wrapper").removeClass("dont-show");
  }

  function scrapeUser(strPossibleUser){
    var objThis = this;

    // show "loading"
    showLoading();

    fsScraper.setName(strPossibleUser);
    fsScraper.scrape(afterScrapeCallback.bind(objThis));
  }

  function afterScrapeCallback(objData){

    // hide loading
    hideLoading();

    console.log('afterScrapeCallback > line 99. | objData: ', objData);

    // check if not already submitted
    var boolHasBeenAdded;
    // var boolHasBeenAdded = alreadyAdded(objData.data.username));

    if (objData.status == 200 && objData.data.name){
      console.log('afterScrapeCallback > line 139. | success');

      var boolIsDataNew = isThereNewUserData(objData.data);

      if (boolIsDataNew){

        // save data
        addUserData(objData.data);

        // re-render list
        RenderCheckedInUserList();
      }
    }
    else{
      console.log('afterScrapeCallback > line 148. | error');
    }
  }

  function isThereNewUserData(objUserData){
    var boolIsDataNew = true;

    return boolIsDataNew;
  }

  function alreadyAdded(strUsername){

    // var strName = objData.name;

    console.log('alreadyAdded > line 113. | strUsername: ', strUsername);
    var objStorageData = fetchUserData();

    var boolHasBeenAdded = objStorageData.hasOwnProperty('users')
      && objStorageData.users[strUsername];

    return boolHasBeenAdded;
  }

  function addUserData(objData){

    console.log('addUserData > line 129. | objData: ', objData);

    // add extra data to objData
    var intTimestamp = Math.floor(+Date.now()/1000);
    var strUserName = objData.username;
    var boolHasBeenAdded = alreadyAdded(objData.username);


    objData.signinTime = intTimestamp;



    // store

    objStorageData = fetchUserData();
    objStorageData.users = objStorageData.users || {};

    if (!boolHasBeenAdded){
      // bookmark
      objStorageData.users[strUserName] = {
        username: strUserName,
        name: objData.name,
      };

      objStorageData.users[strUserName].baseline = objData.challengeData;
      objStorageData.users[strUserName].baselineTime = intTimestamp;

      objStorageData.users[strUserName].timestampData = {};
    }


    objStorageData.users[strUserName].max = objData.challengeData;
    objStorageData.users[strUserName].maxTime = intTimestamp;
    objStorageData.users[strUserName].timestampData[intTimestamp] = objData.challengeData;

    // store in localStorage / cloud
    storeUserData(objStorageData);
  }

  // workin
  function currentTimeAsTsString(){
    var strTimestamp = '' + moment().unix();
    return strTimestamp;
  }

  function currentDayAsTsString(){
    var strTimestamp = '' + startDayAsMoment().unix();
    return strTimestamp;
  }

  function currentWeekAsTsString(){
    var strTimestamp = '' + startWeekAsMoment().unix();
    return strTimestamp;
  }


  function storeUserData(objStorageData){

    console.log("storeUserData > line 251. | alpha");

    objStorageData = objStorageData || fetchUserData(); // so we aren't overwriting

    console.log("storeUserData > line 251. | objStorageData: ", objStorageData);

    var strTimestamp = currentDayAsTsString();
    var objDataToStore = {
      timestamp: strTimestamp,
      data: objStorageData
    };

    var strStorageData = JSON.stringify(objDataToStore);
    localStorage.setItem(strStorageKey, strStorageData);

    console.log("storeUserData > line 251. | omega");
  }

  // workin
  function fetchUserData(){

    var strStorageData = localStorage.getItem(strStorageKey);

    console.log("fetchUserData > line 273 > strStorageData: ", strStorageData);

    var objStoredData = JSON.parse(strStorageData);
    var objStorageData = objStoredData.data;
    var strTsDataStoredTime = objStoredData.timestamp;

    if (shouldWipeOldData(strTsDataStoredTime)){
      // objStorageData = {};
    }

    return objStorageData;
  }

  // if today isn't the same saturday as earlier stored, then return true
  function shouldWipeOldData(strTsDataStoredTime){

    var strTSStartOfDay = currentDayAsTsString();
    var boolSameTime = (strTSStartOfDay == strTsDataStoredTime);
    var boolRetAns = !boolSameTime;

    return boolRetAns;
  }

  function getUserList(){

    console.log('getUserList > line 210. | alpha');

    var objStorageData = fetchUserData();

    console.log('getUserList > line 210. | objStorageData: ', objStorageData);



    var arrNames = Object.keys(objStorageData.hasOwnProperty('users') && objStorageData.users || {}).sort();

    console.log('getUserList > line 210. | omega');

    return arrNames;
  }

  function RenderCheckedInUserList(){

    console.log('RenderCheckedInUserList > line 210. | alpha');

    var arrNames = getUserList();
    var arrList = [];

    for (var i in arrNames){
      var strUsername = arrNames[i];
      var strUserLiHtml = getLiHtml(strUsername);

      arrList.push(strUserLiHtml);
    }

    var strLis = arrList.join('\n');

    console.log('RenderCheckedInUserList > line 210. | strLis: ', strLis);

    $('.ul-signed-in-users').html(strLis);

    // add handlers
    handleLiExpand();

    console.log('RenderCheckedInUserList > line 210. | omega');
  }

  function getUserDataAll(strUsername, boolBaseline){

    var objStorageData = fetchUserData();
    console.log("getUserDataAll > line 236. | objStorageData: ", objStorageData);

    var objUserData = objStorageData.users[strUsername];

    return objUserData;
  }

  function getUserData(strUsername, boolBaseline){

    var objUserData = {objData: {username: strUsername, name: "workin"}, intTimestamp: 0};
    var objStorageData = fetchUserData();

    if (alreadyAdded(strUsername)){

      console.log("getUserData > line 243. | alreadyAdded");

      if (boolBaseline){
        objUserData = {
          objData: objStorageData.users[strUsername].baseline,
          intTimestamp: objStorageData.users[strUsername].baselineTime
        };
      }
      else{
        objUserData = {
          objData: objStorageData.users[strUsername].max,
          intTimestamp: objStorageData.users[strUsername].maxTime
        };
      }
    }
    else {
      console.log("getUserData > line 243. | hasn't been alreadyAdded");
    }

    return objUserData;
  }

  function getStartTime(){
    return moment.unix(intStartTimeRange);
  }

  function getEndTime(){
    return moment.unix(intEndTimeRange);
  }

  function filterChallengeData(objData){

    console.log("filterChallengeData > line 270. | alpha. objData: ", objData);

    var mStartTime = getStartTime();
    var mEndTime = getEndTime();
    var objRetData = {};

    console.log("filterChallengeData > line 270. | mStartTime: ", mStartTime.format("MMM Do YYYY, HH:mm"));
    console.log("filterChallengeData > line 270. | mEndTime: ", mEndTime.format("MMM Do YYYY, HH:mm"));

    for (var intTimestamp in objData){

      var strChallengeName = objData[intTimestamp];

      // console.log("filterChallengeData > line 280. | intTimestamp: ", intTimestamp);
      // console.log("filterChallengeData > line 281. | strChallengeName: ", strChallengeName);

      var mTimestamp = moment.unix(intTimestamp);



      if (mTimestamp.isBetween(mStartTime, mEndTime, null, '[]')){
        console.log("filterChallengeData > line 302. | + mTimestamp: ", mTimestamp.format("MMM Do YYYY, HH:mm"));
        objRetData[intTimestamp] = strChallengeName;
      }
      else{
        console.log("filterChallengeData > line 306. | - mTimestamp: ", mTimestamp.format("MMM Do YYYY, HH:mm"));
      }
    }

    console.log("filterChallengeData > line 270. | omega. objRetData: ", objRetData);
    return objRetData;
  }

  // workin
  function getFilteredUserData(strUser){

    console.log("getFilteredUserData > line 297. | strUser: ", strUser);

    var objUserDataLatestWTime = getUserData(strUser);
    var objUserData = objUserDataLatestWTime.objData;


    console.log("getFilteredUserData > line 303. | objUserDataLatestWTime: ", objUserDataLatestWTime);
    console.log("getFilteredUserData > line 304. | objUserData: ", objUserData);


    var objRetUserData = {};

    for (var strChallengeType in objUserData){
      var objChallengeData = objUserData[strChallengeType];
      objRetUserData[strChallengeType] = filterChallengeData(objChallengeData);
    }




    console.log("getFilteredUserData > line 317. | omega");

    objRetUserData = {objData: objRetUserData, intTimestamp: objUserDataLatestWTime.intTimestamp };

    console.log('getFilteredUserData > line 321. | objRetUserData: ', objRetUserData);

    return objRetUserData;
  }

  function getLiHtml(strUser){
    var objUserDataWTime = (strModeFilter == "all") ? getUserData(strUser) : getFilteredUserData(strUser);
    var objUserData = objUserDataWTime.objData;
    var objUserDataAll = getUserDataAll(strUser);

    console.log('getLiHtml > line 167. | objUserDataAll: ', objUserDataAll);


    var strGivenName = objUserDataAll.name;


    console.log("getLiHtml > line 282. | alpha");

    console.log('getLiHtml > line 167. | objUserData: ', objUserData);


    var objChallengeData = {};
    var arrUlChallenges = [];

    for (var strChallengeType in objUserData){

      var objDoneItemsData = objUserData[strChallengeType];

      objChallengeData[strChallengeType] = Object.keys(objDoneItemsData).length;

      arrUlChallenges.push(getDoneList(objDoneItemsData, strChallengeType));
    }


    // could be a function, not tidy yet
    var strChallengesNameDropDownHtml = '';
    var arrChallengeNameDropDownHtml = [];

    for (var strChallengeName in objChallengeData){
      var intCompletedChallenges = objChallengeData[strChallengeName];
      var strTempChallengeNameDropDownHtml = `<a href="#" class="a-expando-${strChallengeName} a-expando a-collapsed">+</a>&nbsp;${intCompletedChallenges} ${strChallengeName}`;

      arrChallengeNameDropDownHtml.push(strTempChallengeNameDropDownHtml);
    }

    strChallengesNameDropDownHtml = arrChallengeNameDropDownHtml.join(', ');

    var strHtml = `<li class="li-user li-${strUser}"><span>${strGivenName}</span><span class="span-expando-section">${strChallengesNameDropDownHtml}</span> ${arrUlChallenges.join('\n')}</li>`;


    console.log("getLiHtml > line 282. | omega");

    return strHtml;
  }

  function getDoneList(objDoneItemsData, strListName){
    var arrLiDoneItems = [];
    var strUlHtml;

    for (var intTimestamp in objDoneItemsData){
      var objDoneItemData = objDoneItemsData[intTimestamp];
      var strName = objDoneItemData.name;

      arrLiDoneItems.push(`<li>${strName}</li>`);
    }

    var strListHtml = `<li><h3 class="h2-done-items-header">${strListName}</h3></li>` + arrLiDoneItems.join('\n');
    strUlHtml = `<ul class="ul-done-items-list ul-` + strListName + `" style="display:none">${strListHtml}</ul>`;

    return strUlHtml;
  }

  function handleLiExpand(){

    console.log('handleLiExpand > line 225. | alpha');

    var objThis = this;

    $('.a-expando').click(liSpanClickHandler.bind(objThis));
  }

  function liSpanClickHandler(evt){

    console.log('liSpanClickHandler > line 234. | alpha');

    var jTarget = $(evt.target);
    var jScopedLi = jTarget.parents('li');

    console.log('liSpanClickHandler > line 234. | jScopedLi: ', jScopedLi);

    var arrClasses = jTarget.attr("class").split(' ');

    var strChallengeClass = arrClasses.shift();
    var strChallengeName = strChallengeClass.replace('a-expando-', '');

    var boolIsCurrentlyExpanded = (arrClasses.indexOf("a-expanded") != -1) ? true : false;
    // var strNewIcon = boolIsCurrentlyExpanded ? '-' : '+';
    var strNewIcon = boolIsCurrentlyExpanded ? '+' : '-';
    var strNewClass = boolIsCurrentlyExpanded ? 'a-collapsed' : 'a-expanded';
    var strListSelector = ".ul-" + strChallengeName;

    // swap icons
    jTarget.html(strNewIcon);

    // swap classes
    jTarget.removeClass('a-expanded').removeClass('a-collapsed');
    jTarget.addClass(strNewClass);

    // toggle expansion/collapsing
    $(strListSelector, jScopedLi).toggle();
  }

  /*
  // workin
  // left to do

  + number of challenges
  + possibly a drop down, showing which ones?
  + start and stop (sept 30, ~20:10)
  + refresh / done, not tested
  - sign up permanently for leaderboard page (local storage) (we good for tomorrow)
  - connect to firebase / mlab
  - upload to surge.sh

  */


  function startRefreshing(){
    var objThis = this;

    if (strModeRefresh == "on"){
      intIntervalId = setInterval(checkDoneChallenges.bind(objThis), intRefreshRate);
    }
  }

  function getTimeNow(){
    var intTimestampNow = (!!strCurrentDay) ? strCurrentDay : (+ new Date()) / 1000;
    return intTimestampNow;
  }

  function isNowValidChallengeTime(){
    console.log("testIsNowValidChallengeTime > line 439. | alpha");


    var objTimes = getSessionTimeRange();

    var intTimestampNow = getTimeNow();

    var boolIsAfterStart = intTimestampNow >= objTimes.start;
    var boolIsBeforeEnd = intTimestampNow < objTimes.end;

    var boolIsBetweenStartEnd = boolIsBeforeEnd && boolIsAfterStart;

    console.log("testIsNowValidChallengeTime > line 439. | boolIsAfterStart: ", boolIsAfterStart);
    console.log("testIsNowValidChallengeTime > line 439. | boolIsBeforeEnd: ", boolIsBeforeEnd);
    console.log("testIsNowValidChallengeTime > line 439. | boolIsBetweenStartEnd: ", boolIsBetweenStartEnd);

    console.log("testIsNowValidChallengeTime > line 439. | omega");
    return boolIsBetweenStartEnd;
  }

  function testIsNowValidChallengeTime(){
    // console.log("testIsNowValidChallengeTime > line 439. | alpha");

    if (isNowValidChallengeTime()){
      console.log("testIsNowValidChallengeTime > line 458. | testIsNowValidChallengeTime: we are of a relevant time");
    }
    else{
      console.log("testIsNowValidChallengeTime > line 458. | testIsNowValidChallengeTime: we are not of a relevant time");
    }

    // console.log("testIsNowValidChallengeTime > line 439. | omega");
  }

  // workin
  function checkDoneChallenges(){
    console.log("checkDoneChallenges > line 583. | alpha");

    var arrUsers = getUserList();

    // loop through the users
    for (var i in arrUsers){
      var strUser = arrUsers[i];

      console.log("checkDoneChallenges > line 583. | strUser: ", strUser);

      scrapeUser(strUser);
    }

    // redraw list
    RenderCheckedInUserList();

    console.log("checkDoneChallenges > line 583. | omega");
  }

  fnCheckDoneChallenges = checkDoneChallenges;

  function refreshBtnClickHandler(){
    console.log("refreshBtnClickHandler > line 528. | alpha");
    checkDoneChallenges();
  }

  function initHandlers(){
    var objThis = this;

    // input for sign up
    $('.input-sign-up').bind("enterKey", nameSubmitHandler.bind(objThis));

    $('.input-sign-up').keyup(function(e){
      if (e.keyCode == intEnterKeyCode){
        $(this).trigger("enterKey");
      }
    });

    // refresh button
    $("#btn-refresh").click(refreshBtnClickHandler.bind(objThis));

    handleLiExpand();
  }

  function startWeekAsMoment(){
    var mStartTimeRange = moment().startOf('week');
    return mStartTimeRange;
  }

  function endWeekAsMoment(){
    var mStartTimeRange = moment().endOf('week');
    return mStartTimeRange;
  }

  function startDayAsMoment(){
    var mStartTimeRange = moment().startOf('day');
    return mStartTimeRange;
  }

  // function endDayAsMoment(){
  //   var mStartTimeRange = moment().endOf('day');
  //   return mStartTimeRange;
  // }

  function getSessionTimeRange(){

    console.log("getSessionTimeRange > line 686. | start: ", moment(intStartTimeRange).toString());
    console.log("getSessionTimeRange > line 686. | end: ", moment(intEndTimeRange).toString());

    var objRetObj = {
      start: intStartTimeRange,
      stop: intEndTimeRange,
    };

    return objRetObj;
  }

  function getCoffeeCodeTimes(){
    var intTimestampNow = getTimeNow();

    var intStartTimeRange = moment.unix(intTimestampNow).day("Saturday").startOf('day').unix();
    var intEndTimeRange = moment.unix(intTimestampNow).day("Saturday").endOf('day').unix();

    var objRetObj = {
      start: intStartTimeRange,
      stop: intEndTimeRange,
    };

    return objRetObj;
  }

  function getWeekChallengeTimes(){
    var intTimestampNow = getTimeNow();


    var mStartTimeRange = moment().startOf('week');

    var intStartTimeRange = moment.unix(intTimestampNow).startOf('week').unix();
    var intEndTimeRange = moment.unix(intTimestampNow).startOf('week').unix();

    var objRetObj = {
      start: intStartTimeRange,
      stop: intEndTimeRange,
    };

    return objRetObj;
  }

  function setTimeRange(strDayYMD){

    var boolRetValue = false;

    if (strDayYMD){
      intStartTimeRange = moment(strDayYMD, "YYYY/MM/DD").startOf('day').unix();
      intEndTimeRange = moment(strDayYMD, "YYYY/MM/DD").endOf('day').unix();
    }
    else{
      switch(strMode){
        case strModeWeekly:


          var strW = getWeekChallengeTimes();

          intStartTimeRange = objCoffeeCodeTimes['start'];
          intEndTimeRange = objCoffeeCodeTimes['stop'];

          break;
          
        case strModeCoffee:

          console.log('setTimeRange > line 313. foo');

          var objCoffeeCodeTimes = getCoffeeCodeTimes();

          intStartTimeRange = objCoffeeCodeTimes['start'];
          intEndTimeRange = objCoffeeCodeTimes['stop'];

          // .add(2, 'weeks')

          break;
      }
    }

    if (intStartTimeRange && intEndTimeRange){
      console.log('setTimeRange > line 317. | intStartTimeRange: ', moment.unix(intStartTimeRange).toString());
      console.log('setTimeRange > line 318. | intEndTimeRange: ', moment.unix(intEndTimeRange).toString());

      boolRetValue = true;
    }
    else{
      console.log('setTimeRange > line 564. | no luck - something went wrong');
    }

    boolRetValue = false;
  }

  function init(){

    console.log('line 32. init');

    initHandlers();
    storeUserData(); // harmless, to init localstorage, etc.
    checkDoneChallenges();
    setTimeRange(strCurrentDay);
    testIsNowValidChallengeTime();
    startRefreshing();
  }




  // script

  init();

})
