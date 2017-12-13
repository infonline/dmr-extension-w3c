var userid = "123ABC";

var imarex_data = {
  "cn":"de", //country
  "st":"imarexdata", // site/domain
  "cp":"profile", // code/section
  "ref": document.referrer, //referer
  "url": document.location, //url
  "usr": userid //imarex-userid
};

window.iom.c(imarex_data, 1);
