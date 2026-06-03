function waitForKeyElements(selectorTxt, actionFunction, bWaitOnce, iframeSelector) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes = document.querySelectorAll(selectorTxt);
    else {
        var iframe = document.querySelector(iframeSelector);
        targetNodes = iframe ? iframe.contentDocument.querySelectorAll(selectorTxt) : [];
    }

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        targetNodes.forEach(function (node) {
            if (!node._wfkeFound) {
                var cancelFound = actionFunction(node);
                if (cancelFound)
                    btargetsFound = false;
                else
                    node._wfkeFound = true;
            }
        });
    } else {
        btargetsFound = false;
    }

    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    if (btargetsFound && bWaitOnce && timeControl) {
        clearInterval(timeControl);
        delete controlObj[controlKey];
    } else {
        if (!timeControl) {
            timeControl = setInterval(function () {
                waitForKeyElements(selectorTxt, actionFunction, bWaitOnce, iframeSelector);
            }, 300);
            controlObj[controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}
