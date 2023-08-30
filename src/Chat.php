<?php

declare(strict_types=1);

namespace ChatWebsocket;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {

  protected $clients;
  protected $currentUser;

  public function __construct() {
    $this->clients = new \SplObjectStorage;
  }

  public function onOpen(ConnectionInterface $conn) {
    // Store the new connection to send messages to later
    $this->clients->attach($conn);

    echo "New connection! ({$conn->resourceId})\n";
  }

  public function onMessage(ConnectionInterface $from, $msg) {
    $this->currentUser = $from;
    $numRecv = count($this->clients) - 1;
    echo sprintf(
      'Connection %d sending message "%s" to %d other connection%s' . "\n",
      $from->resourceId,
      $msg,
      $numRecv,
      $numRecv == 1 ? '' : 's'
    );

    $broadcastMsg = sprintf('User %s said: %s', $from->resourceId, $msg);
    $this->broadcast($broadcastMsg, true);
  }

  public function onClose(ConnectionInterface $conn) {
    // The connection is closed, remove it, as we can no longer send it messages
    $this->clients->detach($conn);

    echo "Connection {$conn->resourceId} has disconnected\n";
  }

  public function onError(ConnectionInterface $conn, \Exception $e) {
    echo "An error has occurred: {$e->getMessage()}\n";

    $conn->close();
  }

  protected function broadcast($msg, bool $skipCurrentUser = true) {
    foreach ($this->clients as $client) {
      if ($skipCurrentUser && $this->currentUser === $client) continue;
      $client->send($msg);
    }
  }

}