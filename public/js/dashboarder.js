(function(document, console) {
  "use strict";

  var ANIMATION_DURATION = 2200
    , form = document.querySelector("form");

  function extend(target) {
    var srcs = [].slice.call(arguments, 1)
      , src;

    for (var i = 0; i < srcs.length; ++i) {
      src = srcs[i];
      for (var key in src) target[key] = src[key];
    }
    return target;
  }

  function each(coll, func) {
    return [].forEach.call(coll, func);
  }

  function map(coll, func) {
    return [].map.call(coll, func);
  }

  function compact(coll) {
    return [].filter.call(coll, function(e) { return !!e; });
  }

  function reflow(element) {
    element.style.display = 'none';
    // we need to store this so jshint doesn't complain
    var w = element.offsetWidth;
    element.style.display = '';
  }

  function startDashboarder(form, dashboardContainer, callback) {
    var data = readDashboardData(form);
    if (data.length === 0) return;
    var iframe = data[0].iframe;

    dashboardContainer.appendChild(iframe);
    form.querySelector("fieldset").disabled = true;
    iframe.classList.add("current");

    iframe.onload = function() {
      queueSwitch(dashboardContainer, data, 0);
      callback();
    };
  }

  function readDashboardData(form) {
    var duration = +form.querySelector("input[name=duration]").value
      , index = -1;

    return compact(map(form.querySelectorAll('.input-row'), function(row) {
      var urlInput = row.querySelector("input[type=url]");

      if (!urlInput.value) return;

      index += 1;

      return {
        url: urlInput.value,
        iframe: createIframe(index, urlInput.value),
        duration: (+row.querySelector("input[type=number]").value || duration) * 1000,
        persistent: row.querySelector("input[type=checkbox]").checked
      };
    }));
  }

  function createIframe(index, url) {
    var iframe = extend(document.createElement("iframe"), {
      src: url,
      frameborder: 0,
      marginheight: 0,
      marginwidth: 0
    });
    return iframe;
  }

  function queueSwitch(container, data, currentIndex) {
    setTimeout(function() {
      switchDashboard(container, data, currentIndex);
    }, data[currentIndex].duration);
  }

  function switchDashboard(container, data, fromIndex) {
    var toIndex = (fromIndex + 1) % data.length;
    startSwitch(container, data, fromIndex, toIndex);
  }

  function startSwitch(container, data, fromIndex, toIndex) {
    var to = data[toIndex].iframe;

    to.classList.add("next");

    function callback() {
      container.classList.add("switch");

      setTimeout(function() {
        switchComplete(container, data, fromIndex, toIndex);
      }, ANIMATION_DURATION);
    }

    if (to.parentNode) callback();
    else {
      container.appendChild(to);
      to.onload = callback;
    }
  }

  function switchComplete(container, data, fromIndex, toIndex) {
    var from = data[fromIndex].iframe
      , to = data[toIndex].iframe;

    container.classList.remove("switch");
    from.classList.remove("current");
    to.classList.remove("next");
    to.classList.add("current");

    if (!data[fromIndex].persistent) from.remove();
    reflow(container);
    queueSwitch(container, data, toIndex);
  }

  function optionsString(form) {
    var data = []
      , rows = form.querySelectorAll(".input-row")
      , inputs;

    data.push(form.querySelector("input[name=duration]").value);

    for (var i = 0; i < rows.length; ++i) {
      inputs = rows[i].querySelectorAll("input");
      if (!inputs[1].value) continue;
      data.push(inputs[0].value);
      data.push(inputs[1].value);
      data.push(inputs[2].checked ? 1 : 0);
    }

    return JSON.stringify(data);
  }

  function prefilData(form, hash) {
    var data, row, rows;

    hash = hash.replace(/^\#/, '');

    if (!hash) return;

    try {
      data = JSON.parse(hash);
    } catch(e) {
      console.error(e);
      return;
    }

    form.querySelector("input[name=duration]").value = data[0];
    for (var i = 1; i < data.length; i += 3) {
      rows = form.querySelectorAll(".input-row");
      row = rows[(i-1)/3];
      row.querySelector('input[type=number]').value = data[i];
      row.querySelector('input[type=url]').value = data[i+1];
      row.querySelector('input[type=checkbox]').checked = !!data[i+2];
      addInputsIfNeeded(form);
    }
  }

  function addInputsIfNeeded(form) {
    var lastInput = form.querySelector(".input-row:last-child input[type=url]");
    if (!lastInput.value) return;

    var firstRow = form.querySelector(".input-row:first-child")
      , newRow = firstRow.cloneNode();

    each(newRow.querySelectorAll("input"), function(input) {
      if (input.type === 'checkbox') input.checked = false;
      else input.value = '';
    });

    firstRow.parentNode.appendChild(newRow);
  }

  form.addEventListener('submit', function(ev) {
    var container = document.querySelector("#dashboards");
    ev.preventDefault();
    startDashboarder(form, container, function() {
      location.hash = optionsString(form);
      document.body.classList.add("started");
      setTimeout(form.remove.bind(form), 1000);
    });
  }, false);

  form.addEventListener('keyup', function(ev) {
    if(ev.target.type !== 'url') return;
    addInputsIfNeeded(form);
  }, false);

  form.querySelector("a.reset").addEventListener('click', function(ev) {
    window.location.hash = '';
    window.location.reload();
  }, false);

  prefilData(form, window.location.hash);

  if (window.location.hostname === 'localhost') {
    var script = document.createElement("script");
    script.src = "http://localhost:35729/livereload.js";
    document.querySelector("head").appendChild(script);
  }

})(document, console);
