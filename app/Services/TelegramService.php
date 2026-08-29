<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $botToken;

    protected string $chatId;

    public function __construct(?string $botToken = null, ?string $chatId = null)
    {
        $this->botToken = $botToken ?? config('services.telegram.bot_token');
        $this->chatId = $chatId ?? config('services.telegram.chat_id');
    }

    /**
     * Static factory for convenient instantiation
     */
    public static function make(?string $botToken = null, ?string $chatId = null): self
    {
        return new self($botToken, $chatId);
    }

    /**
     * Send a message to the configured Telegram chat. Errors are caught and silent.
     *
     * @param  string|null  $chatId  Override default chat ID
     * @return bool Success
     */
    public function sendMessage(string $message, ?string $chatId = null): bool
    {
        $chatId = $chatId ?? $this->chatId;
        if (! $this->botToken || ! $chatId) {
            // Optionally log missing config
            Log::warning('TelegramService: Missing bot token or chat id.');

            return false;
        }
        try {
            $response = Http::timeout(3)->post(
                "https://api.telegram.org/bot{$this->botToken}/sendMessage",
                [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]
            );
            if ($response->successful()) {
                return true;
            } else {
                Log::warning('TelegramService: Telegram API error', ['response' => $response->body()]);

                return false;
            }
        } catch (\Throwable $e) {
            // Optionally log the error, but do not throw
            Log::error('TelegramService: Exception sending message', ['error' => $e->getMessage()]);

            return false;
        }
    }
}
