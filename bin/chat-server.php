<?php

declare(strict_types=1);

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use WebsocketSample\Chat;

  require dirname(__DIR__) . '/vendor/autoload.php';

  $server = IoServer::factory(
    new HttpServer(
      new WsServer(
        new Chat()
      )
    ),
    8080
  );

  $server->run();