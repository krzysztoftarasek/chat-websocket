(function () {
  const DOMAIN = 'ws://localhost:8080';
  let RECONNECT_ATTEMPTS = 3;

  let remainingAttempts = RECONNECT_ATTEMPTS;
  let controller;

  const retryConnecting = function(domain, callback) {
    controller = new AbortController();
    const ws = new WebSocket(domain);

    ws.onerror = function() {
      if (remainingAttempts <= 0) {
        callback(ws);
        return;
      }

      console.log('WS Error! Retrying...');

      // let the client breath for 100 millis
      setTimeout(function() {
        retryConnecting(domain, callback);
      }, 100);

      remainingAttempts--;
    };

    ws.onopen = function() {
      callback(ws);
    };
  };

  const isOpen = (ws) => ws.readyState === ws.OPEN;

  const testBtnEvent = (ws) => {
    if (isOpen(ws)) {
      ws.send('Hello Server!');
    }
    else {
      controller.abort();
      retryConnecting(DOMAIN, wsClbAction);
    }
  };

  const wsClbAction = function(ws) {
    if (isOpen(ws)) {
      successAction(ws);
    }
    else {
      errorAction(ws);
    }
  };

  const successAction = function(ws) {
    remainingAttempts = RECONNECT_ATTEMPTS;

    console.log('We are connected!');

    ws.onmessage = function(e) {
      console.log(e.data);
    };

    document.querySelector('.js-ws-test').addEventListener('click', testBtnEvent.bind(null, ws), {signal: controller.signal});
  };

  const errorAction = function(ws) {
    alert('Wystapił błąd wewnętrzny serwera. Spróbuj ponownie później!');
    ws.close();
  };

  retryConnecting(DOMAIN, wsClbAction);
})();