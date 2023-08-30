(function () {
  const DOMAIN = 'ws://localhost:8080';
  let RECONNECT_ATTEMPTS = 3;

  let remainingAttempts = RECONNECT_ATTEMPTS;
  let controller;
  let username;

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

      document.querySelector('.js-chat-content').classList.add('d-none');
      document.querySelector('.js-spinner').classList.remove('d-none');
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

    document.querySelector('.js-chat-content').classList.remove('d-none');
    document.querySelector('.js-spinner').classList.add('d-none');
    document.querySelector('.js-error-msg').classList.add('d-none');

    if (!username) {
      login();
    }
  };

  const errorAction = function(ws) {
    ws.close();

    document.querySelector('.js-chat-content').classList.add('d-none');
    document.querySelector('.js-spinner').classList.add('d-none');
    document.querySelector('.js-error-msg').classList.remove('d-none');
  };

  const login = () => {
    username = prompt('Enter your username');

    if (!username) {
      login();
      return;
    }

    addUser();
  };

  const addUser = (name) => {
    // Clone the first snow flake container and append the clone to the body
    const userEl = document.querySelector('.js-sample-user').cloneNode(true);
    userEl.classList.remove('d-none');
    userEl.classList.remove('js-sample-user');
    userEl.classList.add('list-group-item');
    userEl.querySelector('.js-user-name').innerHTML = name ? name : username;
    userEl.querySelector('.js-user-id').innerHTML = 0;
    document.querySelector('.js-users-list').appendChild(userEl);
  };

  retryConnecting(DOMAIN, wsClbAction);
})();