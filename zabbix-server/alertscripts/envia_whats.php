#!/usr/bin/php
<?php
$logFile = '/var/log/zabbix/whatsapp.log';

// argv[1] = mensagem
// argv[2] = numero
$msg    = $argv[1] ?? '';
$numero = $argv[2] ?? '';

file_put_contents($logFile, date('c') . " Recebido -> Numero: [$numero] | Msg: [$msg]\n", FILE_APPEND);

if (empty($numero) || empty($msg)) {
    file_put_contents($logFile, date('c') . " ERRO: número ou mensagem vazios\n", FILE_APPEND);
    exit(1);
}

$url = "http://wppconnect:8000/send?number=" . urlencode($numero) . "&message=" . urlencode($msg);

$response = @file_get_contents($url);

if ($response === false) {
    file_put_contents($logFile, date('c') . " FALHA ao enviar -> Numero: $numero | Msg: $msg\n", FILE_APPEND);
    exit(1);
} else {
    file_put_contents($logFile, date('c') . " SUCESSO -> Numero: $numero | Msg: $msg | Resposta: $response\n", FILE_APPEND);
}
?>
