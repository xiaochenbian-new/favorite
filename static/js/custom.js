// autocorrect: false
$(function () {
  // 默认搜索引擎记录
  var searchTypeStore = {
    set: function (type) {
      localStorage.setItem('SearchType', type);
    },
    get: function () {
      return localStorage.getItem('SearchType') || 'google';
    },
  };
  var $searchMethods = $('#search_methods');
  var $searchLogo = $('#search_logo');
  var initSearchType = searchTypeStore.get();
  $searchLogo.addClass(initSearchType).data('type', initSearchType);
  var search_types = [{
      url: 'https://www.baidu.com/s?wd=',
      type: 'baidu'
    },
    {
      url: 'https://www.sogou.com/web?query=',
      type: 'sogou'
    },
    {
      url: 'https://cn.bing.com/search?q=',
      type: 'bing'
    },
    {
      url: 'https://www.so.com/s?q=',
      type: 'so'
    },
    {
      url: 'https://www.google.com/search?q=',
      type: 'google'
    },
    {
      url: 'http://www.cilimao.cc/search?word=',
      type: 'cili'
    },
    {
      url: 'http://neets.cc/search?key=',
      type: 'yingyin'
    },
    {
      url: 'http://www.panduoduo.net/s/name/',
      type: 'wangpan'
    },
    {
      url: 'https://search.jd.com/Search?keyword=',
      type: 'jingdong'
    },
    {
      url: 'https://github.com/search?q=',
      type: 'github'
    },
    {
      url: 'https://s.taobao.com/search?q=',
      type: 'taobao'
    },
    {
      url: 'https://www.whois.com/whois/',
      type: 'whois'
    },
  ];
  $searchLogo.on('click', function () {
    $searchMethods.show();
  });

  /*兼容处理 低版本 IE*/
  //
  Array.prototype.find || (Array.prototype.find = function (predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length || 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return null;
  })

  // 搜索引擎切换
  $searchMethods.on('click', 'li', function () {
    var type = $(this).data('type');
    searchTypeStore.set(type);
    $searchLogo.removeClass()
      .data('type', type)
      .addClass(type + ' search-logo');
    $searchMethods.hide();
    $('#search_keyword').focus();
  });
  $searchMethods.on('mouseleave', function () {
    $searchMethods.hide();
  });
  var EVENT_CLEAR_KEYWORD = 'clearKeyword';
  var EVENT_SEARCH = 'search';
  // 关键词搜索输入
  $('#search_keyword').on('keyup', function (event) {
    var $keyword = $(this);
    var keyword = $keyword.val();
    if (event.which == 13) {
      if ($('#search_result .active').length > 0) {
        keyword = $('#search_result .active').eq(0).text();
      }
      openSearch(keyword)
      return;
    }
    // 关键词联想提示，跟其他 2 个插件冲突，因为我只用 Google ，没有 fix。
    // TODO 上下键选择待选答案
    var bl = moveChange(event);
    if (bl) {
      keywordChange(keyword);
    }
  }).on('blur', function () {
    $('#search_result').hide();
  }).on('focus', function () {
    var keyword = $(this).val();
    keywordChange(keyword);
  });

  function moveChange(e) {
    var k = e.keyCode || e.which;
    var bl = true;
    switch (k) {
      case 38:
        rowMove('top');
        bl = false;
        break;
      case 40:
        rowMove('down');
        bl = false;
        break;
    }
    return bl;
  }

  function rowMove(move) {
    var search_result = $('#search_result');
    var hove_li = null;
    search_result.find('.result-item').each(function () {
      if ($(this).hasClass('active')) {
        hove_li = $(this).index();
      }
    });
    if (move == 'top') {
      if (hove_li == null) {
        hove_li = search_result.find('.result-item').length - 1;
      } else {
        hove_li--;
      }
    } else if (move == 'down') {
      if (hove_li == null) {
        hove_li = 0;
      } else {
        hove_li == search_result.find('.result-item').length - 1 ? (hove_li = 0) : (hove_li++);
      }
    }
    search_result.find('.active').removeClass('active');
    search_result.find('.result-item').eq(hove_li).addClass('active');
  }

  function keywordChange(keyword) {
    if (keyword === '') {
      $(document).trigger(EVENT_CLEAR_KEYWORD);
    } else {
      $(document).trigger(EVENT_SEARCH, keyword);
      $('#clear_keyword').show();
    }
  }
  // 清空输入框
  $('#clear_keyword').on('click', function () {
    $('#search_keyword').val('');
    $('#search_keyword').focus();
    $(document).trigger(EVENT_CLEAR_KEYWORD);
  });
  // 点击高亮显示
  $('#search_keyword').on('focus', function () {
    $('.search-left').css({
      "border-style": "solid",
      "border-color": "rgba(24, 144, 255, 1)",
      "box-shadow": "0px 0px 2px 1px rgba(145, 213, 255, 0.96)",
    });
  }).on('blur', function () {
    $('.search-left').prop('style', '');
  });
  // 搜索
  $('#search_submit').on('click', function () {
    var keyword = $('#search_keyword').val();
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword);
    }
  });
  // 推荐结果跳转
  $('#search_result').on('click', 'li', function () {
    var word = $(this).text();
    $('#search_keyword').val(word);
    openSearch(word);
    $('#search_result').hide();
  });
  $(document).on(EVENT_CLEAR_KEYWORD, function () {
    $('#clear_keyword').hide();
    $('#search_result').hide();
  });
  $(document).on(EVENT_SEARCH, function (e, keyword) {
    getSearchResult(keyword);
  });
  // 获取搜索引擎类型
  function getSeachType() {
    return $('#search_logo').data('type');
  }
  // google 搜索结果
  function searchResultGoogle(data) {
    var result = data[1];
    result = result.map(function (item) {
      return item[0];
    });
    renderSearchResult(result);
  }
  // 百度 搜索结果
  function searchResultBaidu(data) {
    if (data === undefined) {
      return;
    }
    var result = data.s;
    renderSearchResult(result);
  }
  // 渲染搜索结果
  function renderSearchResult(array) {
    var $result = $('#search_result');
    $result.empty().hide();
    if (!array || array.length <= 0) {
      return;
    }
    for (var i = 0; i < array.length; i++) {
      var $li = $('<li class=\'result-item\'></li>');
      $li.text(array[i]);
      $result.append($li);
    }
    $result.show();
  }
  window.searchResultGoogle = searchResultGoogle;
  window.searchResultBaidu = searchResultBaidu;
  var search_suggest = {
    baidu: {
      url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
    google: {
      url: 'http://suggestqueries.google.com/complete/search',
      data: function (keyword) {
        return {
          q: keyword,
          jsonp: 'window.searchResultGoogle',
          client: 'youtube',
        };
      },
    },
    wangpan: {
      url: 'http://unionsug.baidu.com/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
  };

  function getSearchResult(keyword) {
    var searchType = getSeachType();
    var suggest = search_suggest[searchType];
    if (!suggest) {
      suggest = search_suggest.baidu;
    }
    $.ajax({
      url: suggest.url,
      dataType: 'jsonp',
      data: suggest.data(keyword),
    });
  }

  function openSearch(keyword) {
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword);
    }
  }
});

// 新窗口中打开
$(document).bind('DOMNodeInserted', function (event) {
  $('a[href^="http"]').each(
    function () {
      if (!$(this).attr('target')) {
        $(this).attr('target', '_blank')
      }
    }
  );
});

// lazyload
(function () {
  function logElementEvent(eventName, element) {
    console.log(Date.now(), eventName, element.getAttribute("data-src"));
  }

  var callback_enter = function (element) {
    logElementEvent("🔑 ENTERED", element);
  };
  var callback_exit = function (element) {
    logElementEvent("🚪 EXITED", element);
  };
  var callback_loading = function (element) {
    logElementEvent("⌚ LOADING", element);
  };
  var callback_loaded = function (element) {
    logElementEvent("👍 LOADED", element);
  };
  var callback_error = function (element) {
    logElementEvent("💀 ERROR", element);
    element.src = "/static/img/error.png";
  };
  var callback_finish = function () {
    logElementEvent("✔️ FINISHED", document.documentElement);
  };
  var callback_cancel = function (element) {
    logElementEvent("🔥 CANCEL", element);
  };

  var ll = new LazyLoad({
    class_applied: "lz-applied",
    class_loading: "lz-loading",
    class_loaded: "lz-loaded",
    class_error: "lz-error",
    class_entered: "lz-entered",
    class_exited: "lz-exited",
    // Assign the callbacks defined above
    callback_enter: callback_enter,
    callback_exit: callback_exit,
    callback_cancel: callback_cancel,
    callback_loading: callback_loading,
    callback_loaded: callback_loaded,
    callback_error: callback_error,
    callback_finish: callback_finish
  });
})();

// Time
function update() {
  $('#date').html(moment().format('YYYY年MM月DD日'));
  $('#clock').html(moment().format('HH:mm:ss'));
}
setInterval(update, 1000);

// 时间提示语
var myDate = new Date();
var hrs = myDate.getHours();
var greet;
if (hrs >= 0 && hrs < 6)
  greet = '🕑️凌晨好！';
else if (hrs >= 6 && hrs < 9)
  greet = '🕕早上好！';
else if (hrs >= 9 && hrs < 11)
  greet = '🕘上午好！';
else if (hrs >= 11 && hrs < 13)
  greet = '🕛中午好！';
else if (hrs >= 13 && hrs < 18)
  greet = '🕒下午好！';
else if (hrs >= 18 && hrs <= 24)
  greet = '🕘晚上好！';
document.getElementById('greetings').innerHTML = greet;

// 和风天气
/*
WIDGET = {
  "CONFIG": {
    "modules": "1042",
    "background": "5",
    "tmpColor": "333333",
    "tmpSize": "16",
    "cityColor": "333333",
    "citySize": "16",
    "aqiColor": "333333",
    "aqiSize": "16",
    "weatherIconSize": "36",
    "alertIconSize": "18",
    "padding": "5px 5px 5px 5px",
    "shadow": "0",
    "language": "zh",
    "fixed": "false",
    "vertical": "left",
    "horizontal": "right",
    //"city": "CN101201002",
    "key": "b31457ad265f42d0ae71b36f4b04b40e"
  }
}
*/
// 今日诗词
/*var xhr = new XMLHttpRequest();
xhr.open('get', 'https://v2.jinrishici.com/one.json');
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    var result = JSON.parse(xhr.responseText);
    var gushici = document.getElementById('gushici');
    var poem_info = document.getElementById('poem_info');
    gushici.innerHTML = '<a href="https://www.google.com/search?q=' + result.data.content + '" target="_blank" rel="noopener noreferrer">' + result.data.content + '</a>';
    poem_info.innerHTML = '<a href="https://www.google.com/search?q=' + result.data.origin.author + ' ' + result.data.origin.title + '" target="_blank" rel="noopener noreferrer">' + '【' + result.data.origin.dynasty + '】' + result.data.origin.author + '《' + result.data.origin.title + '》' + '</a>';
  }
};
xhr.send();*/

// 今日诗词 v2
/*
jinrishici.load(function (result) {
  var sentence = document.querySelector("#gushici")
  var info = document.querySelector("#poem_info")
  sentence.innerHTML = '<a href="https://www.google.com/search?q=' + result.data.content + '" target="_blank" rel="noopener noreferrer">' + result.data.content + '</a>'
  info.innerHTML = '-' + '<a href="https://www.google.com/search?q=' + result.data.origin.author + ' ' + result.data.origin.title + '" target="_blank" rel="noopener noreferrer">' + '【' + result.data.origin.dynasty + '】' + result.data.origin.author + '《' + result.data.origin.title + '》' + '</a>'
});
*/

// 今日诗词天气api
var weather = new XMLHttpRequest();
weather.open('get', 'https://v2.jinrishici.com/info');
weather.onreadystatechange = function () {
  if (weather.readyState === 4) {
    var result = JSON.parse(weather.responseText);
    var jw_region = document.querySelector('#jw_region');
    var jw_temperature = document.querySelector('#jw_temperature');
    var jw_pm25tip = document.querySelector('#jw_pm25tip');
    var jw_wtip = document.querySelector('#jw_wtip');
    var region = result.data.region.match(/\|(\S*)/)[1];
    jw_region.innerHTML = '<a href="https://www.google.com/search?q=天气+' + region + '" target="_blank" rel="noopener noreferrer">' + region + '</a>';
    jw_temperature.innerHTML = result.data.weatherData.temperature + '℃';
    var jw_weather = result.data.weatherData.weather;
    var jw_w
    if (jw_weather == "晴") {
      jw_w = jw_weather.replace("晴", "☀️");
    } else if (jw_weather == "多云") {
      jw_w = jw_weather.replace("多云", "⛅️");
    } else if (jw_weather == "阴") {
      jw_w = jw_weather.replace("阴", "☁️");
    } else if (jw_weather == "雨") {
      jw_w = jw_weather.replace("雨", "🌧️");
    } else if (jw_weather == "雪") {
      jw_w = jw_weather.replace("雪", "❄️");
    } else if (jw_weather == "雷阵雨") {
      jw_w = jw_weather.replace("雷阵雨", "⛈️");
    } else if (jw_weather == "雨夹雪") {
      jw_w = jw_weather.replace("雨夹雪", "🌧️");
    } else if (jw_weather == "小雨") {
      jw_w = jw_weather.replace("小雨", "🌦️");
    } else if (jw_weather == "中雨") {
      jw_w = jw_weather.replace("中雨", "🌦️");
    } else if (jw_weather == "大雨") {
      jw_w = jw_weather.replace("大雨", "🌦️");
    } else if (jw_weather == "暴雨") {
      jw_w = jw_weather.replace("暴雨", "🌦️");
    } else if (jw_weather == "大暴雨") {
      jw_w = jw_weather.replace("大暴雨", "🌦️");
    } else if (jw_weather == "特大暴雨") {
      jw_w = jw_weather.replace("特大暴雨", "🌦️");
    } else if (jw_weather == "阵雪") {
      jw_w = jw_weather.replace("阵雪", "❄️");
    } else if (jw_weather == "小雪") {
      jw_w = jw_weather.replace("小雪", "❄️");
    } else if (jw_weather == "中雪") {
      jw_w = jw_weather.replace("中雪", "❄️");
    } else if (jw_weather == "大雪") {
      jw_w = jw_weather.replace("大雪", "❄️");
    } else if (jw_weather == "暴雪") {
      jw_w = jw_weather.replace("暴雪", "❄️");
    } else if (jw_weather == "雾") {
      jw_w = jw_weather.replace("雾", "🌫️");
    } else if (jw_weather == "冻雨") {
      jw_w = jw_weather.replace("冻雨", "🌧️");
    } else if (jw_weather == "沙尘暴") {
      jw_w = jw_weather.replace("沙尘暴", "🌫️");
    } else if (jw_weather == "沙尘") {
      jw_w = jw_weather.replace("沙尘", "🌫️");
    } else if (jw_weather == "浮尘") {
      jw_w = jw_weather.replace("浮尘", "🌫️");
    } else if (jw_weather == "扬沙") {
      jw_w = jw_weather.replace("扬沙", "🌫️");
    } else if (jw_weather == "强沙尘暴") {
      jw_w = jw_weather.replace("强沙尘暴", "🌫️");
    } else if (jw_weather == "霾") {
      jw_w = jw_weather.replace("霾", "🌫️");
    } else if (jw_weather == "轻度雾霾") {
      jw_w = jw_weather.replace("轻度雾霾", "🌫️");
    } else if (jw_weather == "中度雾霾") {
      jw_w = jw_weather.replace("中度雾霾", "🌫️");
    } else if (jw_weather == "重度雾霾") {
      jw_w = jw_weather.replace("重度雾霾", "🌫️");
    } else if (jw_weather == "风") {
      jw_w = jw_weather.replace("风", "🌪️");
    } else if (jw_weather == "大风") {
      jw_w = jw_weather.replace("大风", "🌪️");
    } else if (jw_weather == "飓风") {
      jw_w = jw_weather.replace("飓风", "🌪️");
    } else if (jw_weather == "热带风暴") {
      jw_w = jw_weather.replace("热带风暴", "🌪️");
    } else if (jw_weather == "龙卷风") {
      jw_w = jw_weather.replace("龙卷风", "🌪️");
    } else if (jw_weather == "阵雨") {
      jw_w = jw_weather.replace("阵雨", "🌦️");
    } else {
      jw_w = jw_weather.replace(/[.*+?^${}()|[\]\\]/g, "🌤️");
    }
    document.querySelector('#jw_weather').innerHTML = jw_w;
    jw_wtip.innerHTML = '实时天气：' + jw_weather;
    jw_pm25tip.innerHTML = '空气质量：' + result.data.weatherData.pm25;
    var pm25 = result.data.weatherData.pm25;
    var jw_pm25;
    if (pm25 >= 0 && pm25 <= 50) {
      jw_pm25 = '优';
      $('#jw_pm25').addClass('green');
    } else if (pm25 >= 51 && pm25 <= 100) {
      jw_pm25 = '良';
      $('#jw_pm25').addClass('yellow');
    } else if (pm25 >= 101 && pm25 <= 150) {
      jw_pm25 = '轻度污染';
      $('#jw_pm25').addClass('orange');
    } else if (pm25 >= 151 && pm25 <= 200) {
      jw_pm25 = '中度污染';
      $('#jw_pm25').addClass('red');
    } else if (pm25 >= 201 && pm25 <= 300) {
      jw_pm25 = '重度污染';
      $('#jw_pm25').addClass('purple');
    } else if (pm25 > 300) {
      jw_pm25 = '严重污染';
      $('#jw_pm25').addClass('maroon');
    }
    document.querySelector('#jw_pm25').innerHTML = jw_pm25;
  }
};
weather.send();

// latest search box
if (jQuery(".comment_stars a").click((function () {
    jQuery(this).addClass("active"), jQuery(this).siblings().removeClass("active"), jQuery(".comment_stars").addClass("selected"), jQuery("#rate").attr("value", jQuery(this).data("rate"))
  })), jQuery("ul.menu li.menu-item-search a").click((function () {
    setTimeout((function () {
      jQuery(".search_form #s").focus()
    }), 500)
  })), jQuery("#super-search-fm").length > 0 && eval(function (t, e, a, n, i, o) {
    if (i = function (t) {
        return (t < e ? "" : i(parseInt(t / e))) + ((t %= e) > 35 ? String.fromCharCode(t + 29) : t.toString(36))
      }, !"".replace(/^/, String)) {
      for (; a--;) o[i(a)] = n[a] || i(a);
      n = [function (t) {
        return o[t]
      }], i = function () {
        return "\\w+"
      }, a = 1
    }
    for (; a--;) n[a] && (t = t.replace(new RegExp("\\b" + i(a) + "\\b", "g"), n[a]));
    return t
  }('!2(){2 g(){h(),i(),j(),k()}2 h(){d.9=s()}2 i(){z a=4.8(\'A[B="7"][5="\'+p()+\'"]\');a&&(a.9=!0,l(a))}2 j(){v(u())}2 k(){w(t())}2 l(a){P(z b=0;b<e.O;b++)e[b].I.1c("s-M");a.F.F.F.I.V("s-M")}2 m(a,b){E.H.S("L"+a,b)}2 n(a){6 E.H.Y("L"+a)}2 o(a){f=a.3,v(u()),w(a.3.5),m("7",a.3.5),c.K(),l(a.3)}2 p(){z b=n("7");6 b||a[0].5}2 q(a){m("J",a.3.9?1:-1),x(a.3.9)}2 r(a){6 a.11(),""==c.5?(c.K(),!1):(w(t()+c.5),x(s()),s()?E.U(b.G,+T X):13.Z=b.G,10 0)}2 s(){z a=n("J");6 a?1==a:!0}2 t(){6 4.8(\'A[B="7"]:9\').5}2 u(){6 4.8(\'A[B="7"]:9\').W("14-N")}2 v(a){c.1e("N",a)}2 w(a){b.G=a}2 x(a){a?b.3="1a":b.16("3")}z y,a=4.R(\'A[B="7"]\'),b=4.8("#18-C-19"),c=4.8("#C-12"),d=4.8("#17-C-15"),e=4.R(".C-1b"),f=a[0];P(g(),y=0;y<a.O;y++)a[y].D("Q",o);d.D("Q",q),b.D("1d",r)}();', 62, 77, "||function|target|document|value|return|type|querySelector|checked||||||||||||||||||||||||||var|input|name|search|addEventListener|window|parentNode|action|localStorage|classList|newWindow|focus|superSearch|current|placeholder|length|for|change|querySelectorAll|setItem|new|open|add|getAttribute|Date|getItem|href|void|preventDefault|text|location|data|blank|removeAttribute|set|super|fm|_blank|group|remove|submit|setAttribute".split("|"), 0, {})), jQuery(window).width() < 1280) {
  var mainNav = jQuery(".main-nav"),
    leftNav = jQuery(".containers");
  mainNav.length > 0 && mainNav.addClass(""), leftNav.length > 0 && jQuery(".containers").append('')
}

// Lately.js - Native JavaScript, only 800Byte but simple and easy to use Timeago plugin
(function (global, undefined) {
  "use strict"
  let _global;
  let Lately = (option) => {
    let target = option.target || ".time";
    let lang = option.lang || {
      'second': '秒',
      'minute': '分钟',
      'hour': '小时',
      'day': '天',
      'month': '个月',
      'year': '年',
      'ago': '前',
      'error': 'NaN',
    };
    let _count = (date) => {
      date = new Date(date);
      let second = (new Date().getTime() - date.getTime()) / 1000,
        minute = second / 60,
        hour = minute / 60,
        day = hour / 24,
        month = day / 30,
        year = month / 12,
        floor = (num, _lang) => Math.floor(num) + _lang,
        result = '';
      if (year >= 1) result = floor(year, lang.year);
      else if (month >= 1) result = floor(month, lang.month);
      else if (day >= 1) result = floor(day, lang.day);
      else if (hour >= 1) result = floor(hour, lang.hour);
      else if (minute >= 1) result = floor(minute, lang.minute);
      else if (second >= 1) result = floor(second, lang.second);
      else result = lang.error;
      return result + lang.ago;
    }
    for (let contain of document.querySelectorAll(target)) {
      let date = '',
        date_time = contain.dateTime,
        title = contain.title,
        html = contain.innerHTML;
      if (date_time ? !isNaN(new Date(date_time = (date_time.replace(/(.*)[a-z](.*)\+(.*)/gi, "$1 $2")).replace(/-/g, "/"))) : false) date = date_time;
      else if (title ? !isNaN(new Date(title = title.replace(/-/g, "/"))) : false) date = title;
      else if (html ? !isNaN(new Date(html = html.replace(/-/g, "/"))) : false) date = html;
      else return;
      contain.title = date;
      contain.innerHTML = _count(date);
    }
  }

  _global = (function () {
    return this || (0, eval)('this');
  }());
  !('Lately' in _global) && (_global.Lately = Lately);
}());


// 调用嘀咕 JSON 版
$(document).ready(function () {
  if ($("#index-talk").length > 0) {
    jsonUrl = "https://api.eallion.com/memos/memos.json"
    $.getJSON(jsonUrl + "?t=" + Date.parse(new Date()), function (res) {
      var bberCount = res.count;
      var talksHtml = ''
      $.each(res.data, function (i, item) {
        d = new Date(item.createdTs * 1000);
        date = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
        dataTime = '<span class="datatime">' + date + '</span>'
        talksHtml += '<li class="item item-' + (i + 1) + '">' + dataTime + '： <a href="https://eallion.com/memos/" target="_blank" rel="noopener noreferrer">' + urlToLink(item.content) + '</a></li>'
      });
      $('#index-talk').append('<ul class="talk-list">' + talksHtml + '</ul>')
      Lately({
        'target': '.datatime'
      });
    });

    function urlToLink(str) {
     str = str .replace(/```([\s\S]*?)```[\s]*/g,' <code>$1</code> ')                                                                //全局匹配代码块
            .replace(/`([\s\S ]*?)`[\s]*/g,' <code>$1</code> ')                                                                         //全局匹配内联代码块
            .replace(/\!\[[\s\S]*?\]\([\s\S]*?\)/g,'🌅')                                                                                       //全局匹配图片
            .replace(/\[[\s\S]*?\]\([\s\S]*?\)/g,'🔗')                                                                                         //全局匹配连接
            .replace(/\bhttps?:\/\/(?!\S+(?:jpe?g|png|bmp|gif|webp|jfif|gif))\S+/g,'🔗')                                 //全局匹配纯文本连接
      return str;
    }

    function Roll() {
      var list_li = $('.talk-list li'),
        cur_li = list_li.first(),
        last_li = list_li.last();
      last_li.after(cur_li);
    };

    // 设置滚动间隔时间
    // 简单版本
    // setInterval(Roll, 1000);

    // 鼠标移入暂时滚动版本
    var timer = null;

    function startSetInterval() {
      timer = setInterval(Roll, 3000);
    }
    // start function on page load
    startSetInterval();

    // hover behaviour
    $('#index-talk').hover(function () {
      clearInterval(timer);
    }, function () {
      startSetInterval();
    });

    //点击关闭嘀咕 Widget
    $('button').click(function () {
      $(this).parents('#index-talk').remove();
    });
  }
});

// Go to Top
(function ($) {
  'use strict';

  $.fn.toTop = function (opt) {

    //variables
    var elem = this;
    var win = $(window);
    var doc = $('html, body');

    //Extended Options
    var options = $.extend({
      autohide: true,
      offset: 420,
      speed: 500,
      position: true,
      right: 15,
      bottom: 30
    }, opt);

    elem.css({
      'cursor': 'pointer'
    });

    if (options.autohide) {
      elem.css('display', 'none');
    }

    if (options.position) {
      elem.css({
        'position': 'fixed',
        'right': options.right,
        'bottom': options.bottom,
      });
    }

    elem.click(function () {
      doc.animate({
        scrollTop: 0
      }, options.speed);
    });

    win.scroll(function () {
      var scrolling = win.scrollTop();

      if (options.autohide) {
        if (scrolling > options.offset) {
          elem.fadeIn(options.speed);
        } else elem.fadeOut(options.speed);
      }

    });

  };

}(jQuery));

// 回到顶部 custom
$('.to-top').toTop({
  //options with default values
  autohide: true,
  offset: 200,
  speed: 100,
  position: true,
  right: 30,
  bottom: 50
});

/*
// toggle menu
const sidebarBox = document.querySelector('#box'),
  sidebarBtn = document.querySelector('#btn'),
  pageHeader = document.querySelector('#header'),
  pageContent = document.querySelector('#content'),
  pageFooter = document.querySelector('#footer'),
  menu_li = document.querySelector('#items');

sidebarBtn.addEventListener('click', event => {
  sidebarBtn.classList.toggle('active');
  sidebarBox.classList.toggle('active');
});

pageHeader.addEventListener('click', event => {

  if (sidebarBox.classList.contains('active')) {
    sidebarBtn.classList.remove('active');
    sidebarBox.classList.remove('active');
  }
});

pageContent.addEventListener('click', event => {

  if (sidebarBox.classList.contains('active')) {
    sidebarBtn.classList.remove('active');
    sidebarBox.classList.remove('active');
  }
});

pageFooter.addEventListener('click', event => {

  if (sidebarBox.classList.contains('active')) {
    sidebarBtn.classList.remove('active');
    sidebarBox.classList.remove('active');
  }
});

menu_li.addEventListener('click', event => {

  if (sidebarBox.classList.contains('active')) {
    sidebarBtn.classList.remove('active');
    sidebarBox.classList.remove('active');
  }
});

window.addEventListener('keydown', event => {

  if (sidebarBox.classList.contains('active') && event.keyCode === 27) {
    sidebarBtn.classList.remove('active');
    sidebarBox.classList.remove('active');
  }
});
*/

// anchor smooth scroll
$(".scrollTo").on('click', function (e) {
  e.preventDefault();
  var target = $(this).attr('href');
  $('html, body').animate({
    scrollTop: ($(target).offset().top)
  }, 100);
});

// 提交搜索后清空输入框
document.querySelector('form').onsubmit = e => {
  e.target.reset();
  return false;
};

// dark mode
let storageColorScheme = localStorage.getItem("lightDarkMode")
if ((storageColorScheme == 'Auto' && window.matchMedia("(prefers-color-scheme: dark)").matches) || storageColorScheme == "Dark") {
  document.body.classList.add('dark')
} else if ((storageColorScheme == 'Auto' && window.matchMedia("(prefers-color-scheme: light)").matches) || storageColorScheme == "Light") {
  document.body.classList.remove('dark')
} else if (((storageColorScheme == 'Auto' || storageColorScheme == null) && window.matchMedia("(prefers-color-scheme: dark)").matches) || storageColorScheme == "Dark") {
  document.body.classList.add('dark')
}

// change icon and add listener if auto
let element = document.getElementById('lightDarkMode')
if (storageColorScheme == null || storageColorScheme == 'Auto') {
  document.addEventListener('DOMContentLoaded', () => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', switchDarkMode)
  })
} else if (storageColorScheme == "Light") {
  element.firstElementChild.setAttribute("data-icon", 'akar-icons:sun-fill')
} else if (storageColorScheme == "Dark") {
  element.firstElementChild.setAttribute("data-icon", 'akar-icons:moon-fill')
}
document.addEventListener('DOMContentLoaded', () => {
  getcolorscheme();
});

function getcolorscheme() {
  let storageColorScheme = localStorage.getItem("lightDarkMode")
  let element = document.getElementById('lightDarkMode');
  let targetDiv = document.getElementById('lightDarkOptions');
  let targets = targetDiv.getElementsByTagName('span');
  let screen = document.getElementById('is-open');

  element.addEventListener('click', () => {
    targetDiv.classList.toggle('hidden')
    screen.classList.toggle('hidden')
  })

  for (let target of targets) {
    target.addEventListener('click', () => {
      let targetName = target.getAttribute("name")
      let icon = switchMode(targetName)
      let old_icon = element.firstElementChild.getAttribute("data-icon")
      element.firstElementChild.setAttribute("data-icon", icon)

      localStorage.setItem("lightDarkMode", targetName)

      targetDiv.classList.toggle('hidden')
      screen.classList.toggle('hidden')

      let event = new Event('themeChanged');
      document.dispatchEvent(event);
    })
  }
  screen.addEventListener('click', () => {
    targetDiv.classList.toggle('hidden')
    screen.classList.toggle('hidden')
  })
}

function switchMode(mode) {
  let icon = ''
  switch (mode) {
    case 'Light':
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', switchDarkMode)
      icon = 'akar-icons:sun-fill'
      document.body.classList.remove('dark')
      break
    case 'Dark':
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', switchDarkMode)
      icon = 'akar-icons:moon-fill'
      document.body.classList.add('dark')
      break
    case 'Auto':
      icon = 'bxs:adjust'
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
      switchDarkMode(isDarkMode)
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', switchDarkMode)
      break
  }
  return icon
}

function switchDarkMode(e) {
  if (e.matches) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}