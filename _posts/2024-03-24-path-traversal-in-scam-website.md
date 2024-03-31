---
layout: post
title:  "A strange path traversal vulnerability in a USPS scam website"
description: "Exploiting a PHP path traversal vulnerability found in a USPS scam website"
author: "Colleirose"
permalink: /path-traversal-in-scam-website
date: 2024-03-24
last_modified_at: 2024-03-24
---

Earlier this month, I encountered a scam website impersonating USPS at https://usps.parcelwatch-us.top (this link is not working at the time of writing but it might go up again later). Out of boredom, I decided to look at the web traffic when moving through the scam website, and noticed it sent data like `info-new.html` to a websocket and received HTML in response. My immediate thought was that there might be a path traversal vulnerability, so I sent /etc/passwd into that websocket, and sure enough, I got this back:

![Response from sending /etc/passwd to the websocket](/assets/img/exploiting%20path%20traversal%20vulnerabilities.png)

I next tried putting `index.php` in and got this (the malformed text like `åéäºè¿å¶æ¶æ¯` was actually Chinese characters from the results I got in Burp Suite, but when looking at the results during test in Firefox DevTools, the text looked like gibberish and I didn't think much of it at the time, I thought it was maybe just a stupid scammer who put some nonsense in a comment not understanding what they were doing):
```php
<?php
require '../vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class MyWebSocket implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        echo sprintf('Connection %d sending message "%s"' . "\n", $from->resourceId, $msg);

        // Assume $msg is the file path
        $filePath = trim($msg);
        if (file_exists($filePath)) {
            // Read the file content
            $htmlData = file_get_contents($filePath);

            // Convert the content to binary data
            // $binaryData = pack('H*', $fileContent);

            // åéäºè¿å¶æ¶æ¯
            // $binaryMessage = "\x82" . pack('N', strlen($htmlData)) . $htmlData;
            // Send the byte string
            $from->send($htmlData); //
        } else {
            echo "File does not exist: $filePath\n";
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
// æ°å»ºäºä»¶å¾ªç¯
$loop = React\EventLoop\Factory::create();
// æ¯åéè¿è¡ä¸æ¬¡åå¾åæ¶ï¼å¹¶å¨æ§å¶å°è¾åºåå­å ç¨
$loop->addPeriodicTimer(60, function () {
    $memory_before = memory_get_usage();
    gc_collect_cycles();
    $memory_now = memory_get_usage();
    if ($memory_before !== $memory_now) echo "GC Collected: {$memory_before} bytes -> {$memory_now} bytes\n";
});

$server = \Ratchet\Server\IoServer::factory(
    new \Ratchet\Http\HttpServer(
        new \Ratchet\WebSocket\WsServer(
            new MyWebSocket()
        )
    ),
    12345, '127.0.0.1', $loop
);

$server->run();
```

Obviously, this is not the scam website, but is instead the PHP code behind the wbesocket used for fetching the files. I had looked through the newtwork traffic for a while, seeing paths like `/php/app/index/verify-info.php` and `/php/app/index/verify-card.php`. I wanted to get the contents of these files because they were where the stolen card data was being sent to, but uh, after figuring out the right paths (`../php/app/index/verify-info.php`, `../php/app/index/verify-card.php`), this is what it looked like:

![Extremely obfuscated PHP code](/assets/img/obfuscated%20%php%20code.png)

I've made the files available for download at https://github.com/colleirose/colleirose/blob/main/verify-card.php and https://github.com/colleirose/colleirose/blob/main/verify-info.php. I had made some changes to the spacing in them to improve readability slightly but did not make any further progress in deobfuscation.

I asked other people to try out the URL but nobody else I contacted was unfortunately able to find anything useful:

![Discussion on Discord](/assets/img/discussion%20of%20php%20obfuscation%20on%20discord%201.png)

![Discussion on Discord](/assets/img/discussion%20of%20php%20obfuscation%20on%20discord%202.png)

![Discussion on Discord](/assets/img/discussion%20of%20php%20obfuscation%20on%20discord%203.png)

I also used the https://urlscan.io "structurally similar hits" feature for this domain and found *many* identical or near-identical scam websites, most with the same vulnerability and all with the same general structure. You can find the scan at https://urlscan.io/result/c600342c-b96d-481a-8e92-ca0a5ee03856/ and the similar sites at https://urlscan.io/result/c600342c-b96d-481a-8e92-ca0a5ee03856/related/ (you need a URLScan account to see the list though). Some don't have the vulnerability, but most do. All of the ones that I could exploit the vulnerability on have the same obfuscated PHP files. I do wonder if they know and do not care about the path traversal vulnerability and the obfuscated files are their "solution" to it. I have noted slight differences in these other than the occassional slight design change or vulnerability patch, like different operating systems being used to host the scam (still all Linux distros) and sometimes there being references to some Chinese IP addresses in `/etc/hosts` (likely servers for receiving compromised data due to Chinese comments in `index.php` and some JS code that you can find with DevTools).

Another interesting thing is that I found some pages like `/php/app/admin/` on these domains, but the pages were either blank or consisted of HTML code that referenced JavaScript files that don't exist.

Ideally, I hope to deobfuscate the PHP files so I can find where they store the stolen credit card details and contact the banks issuing the cards about the issue.
